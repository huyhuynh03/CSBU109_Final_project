// ============================================================================
// providers/gemini.js — Adapter cho Google Gemini TTS (native API)
// ----------------------------------------------------------------------------
// Gọi trực tiếp endpoint generateContent của Gemini với response_modalities AUDIO.
// KHÔNG qua gateway OpenAI-compatible — dùng API key từ Google AI Studio.
//
// Endpoint:
//   POST https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={KEY}
//
// Model TTS:
//   - gemini-2.5-flash-preview-tts   (nhanh, rẻ — khuyên dùng cho bulk)
//   - gemini-2.5-pro-preview-tts     (chất lượng cao hơn, chậm hơn)
//
// Giọng (prebuilt voices):
//   Puck | Charon | Kore | Fenrir | Aoede | Leda | Orus | Zephyr
//
// Lấy API key:
//   1. Vào https://aistudio.google.com/apikey
//   2. Click "Create API Key" → chọn GCP project
//   3. Copy key → đặt vào biến môi trường GEMINI_API_KEY
//
// Lưu ý:
//   - Output mặc định là PCM (audio/L16;rate=24000) → cần ffmpeg để convert MP3.
//   - Script tự detect ffmpeg; nếu không có sẽ báo lỗi rõ ràng.
//   - Gemini TTS KHÔNG tách accent US/GB theo tên giọng như Google Cloud TTS.
//     Accent phụ thuộc vào voice name (Puck ≈ US, Zephyr ≈ UK-ish).
// ============================================================================

const { execFileSync } = require('child_process');
const os = require('os');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

// Cache ffmpeg path check
let _ffmpegPath = null;
let _ffmpegChecked = false;

/**
 * Tìm ffmpeg trên hệ thống. Trả về path hoặc throw nếu không có.
 * Tìm theo thứ tự: PATH → winget install dir → choco → common paths.
 */
function findFfmpeg() {
    if (_ffmpegChecked) {
        if (!_ffmpegPath) throw new Error('ffmpeg không tìm thấy (đã check trước đó)');
        return _ffmpegPath;
    }
    _ffmpegChecked = true;

    // 1) Thử gọi trực tiếp (nếu đã có trong PATH)
    const directCandidates = process.platform === 'win32'
        ? ['ffmpeg.exe', 'ffmpeg']
        : ['ffmpeg'];

    for (const cmd of directCandidates) {
        try {
            execFileSync(cmd, ['-version'], { stdio: 'pipe', timeout: 5000 });
            _ffmpegPath = cmd;
            return cmd;
        } catch { /* tiếp tục */ }
    }

    // 2) Windows: tìm trong các thư mục cài đặt phổ biến
    if (process.platform === 'win32') {
        const localAppData = process.env.LOCALAPPDATA || '';
        const searchDirs = [
            // winget install location
            path.join(localAppData, 'Microsoft', 'WinGet', 'Links'),
            // Gyan FFmpeg winget package (common pattern)
            ...(() => {
                const wingetPkgs = path.join(localAppData, 'Microsoft', 'WinGet', 'Packages');
                try {
                    return fs.readdirSync(wingetPkgs)
                        .filter(d => d.startsWith('Gyan.FFmpeg'))
                        .flatMap(d => {
                            const pkgDir = path.join(wingetPkgs, d);
                            try {
                                return fs.readdirSync(pkgDir)
                                    .filter(sub => sub.includes('ffmpeg'))
                                    .map(sub => path.join(pkgDir, sub, 'bin'));
                            } catch { return []; }
                        });
                } catch { return []; }
            })(),
            'C:\\ffmpeg\\bin',
            'C:\\ProgramData\\chocolatey\\bin'
        ];

        for (const dir of searchDirs) {
            const candidate = path.join(dir, 'ffmpeg.exe');
            try {
                if (fs.existsSync(candidate)) {
                    execFileSync(candidate, ['-version'], { stdio: 'pipe', timeout: 5000 });
                    _ffmpegPath = candidate;
                    return candidate;
                }
            } catch { /* tiếp tục */ }
        }
    }

    throw new Error(
        'ffmpeg không tìm thấy trên hệ thống.\n' +
        'Gemini TTS trả về audio PCM — cần ffmpeg để convert sang MP3.\n' +
        'Cài đặt:\n' +
        '  Windows: winget install ffmpeg  HOẶC  choco install ffmpeg\n' +
        '  macOS:   brew install ffmpeg\n' +
        '  Linux:   sudo apt install ffmpeg'
    );
}

/**
 * Convert raw PCM (signed 16-bit LE, mono, 24kHz) sang MP3 buffer qua ffmpeg.
 * Dùng stdin/stdout pipe — không tạo file tạm.
 */
function pcmToMp3(pcmBuffer, sampleRate = 24000) {
    const ffmpeg = findFfmpeg();

    // ffmpeg đọc raw PCM từ stdin, xuất MP3 ra stdout
    const result = execFileSync(ffmpeg, [
        '-f', 's16le',           // input format: signed 16-bit little-endian
        '-ar', String(sampleRate), // sample rate
        '-ac', '1',              // mono
        '-i', 'pipe:0',         // đọc từ stdin
        '-codec:a', 'libmp3lame',
        '-b:a', '128k',         // bitrate MP3
        '-f', 'mp3',            // output format
        'pipe:1'                // xuất ra stdout
    ], {
        input: pcmBuffer,
        maxBuffer: 10 * 1024 * 1024, // 10MB max
        timeout: 30000,
        stdio: ['pipe', 'pipe', 'pipe']
    });

    return Buffer.from(result);
}

/**
 * Convert WAV buffer sang MP3 buffer qua ffmpeg.
 */
function wavToMp3(wavBuffer) {
    const ffmpeg = findFfmpeg();

    const result = execFileSync(ffmpeg, [
        '-i', 'pipe:0',         // đọc WAV từ stdin
        '-codec:a', 'libmp3lame',
        '-b:a', '128k',
        '-f', 'mp3',
        'pipe:1'
    ], {
        input: wavBuffer,
        maxBuffer: 10 * 1024 * 1024,
        timeout: 30000,
        stdio: ['pipe', 'pipe', 'pipe']
    });

    return Buffer.from(result);
}

/**
 * @param {string} text          Từ/cụm từ cần đọc
 * @param {object} voiceConfig   { model, voice }
 * @param {string} apiKey        GEMINI_API_KEY
 * @returns {Promise<Buffer>}    MP3 buffer
 */
async function synthesize(text, voiceConfig, apiKey) {
    const model = voiceConfig.model || 'gemini-2.5-flash-preview-tts';
    const voiceName = voiceConfig.voice || 'Puck';
    const endpoint = `${BASE_URL}/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const body = {
        contents: [{
            parts: [{ text }]
        }],
        generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: {
                        voiceName
                    }
                }
            }
        }
    };

    const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    if (!res.ok) {
        const detail = await res.text().catch(() => '');
        throw new Error(`Gemini TTS ${res.status}: ${detail.slice(0, 400)}`);
    }

    const json = await res.json();

    // Trích audio từ response
    const candidate = json.candidates && json.candidates[0];
    if (!candidate) {
        throw new Error('Gemini TTS: response không có candidates');
    }

    const parts = candidate.content && candidate.content.parts;
    if (!parts || !parts.length) {
        throw new Error('Gemini TTS: response không có content.parts');
    }

    // Tìm part chứa inlineData (audio)
    const audioPart = parts.find((p) => p.inlineData && p.inlineData.data);
    if (!audioPart) {
        throw new Error('Gemini TTS: response thiếu inlineData audio');
    }

    const { mimeType, data } = audioPart.inlineData;
    const audioBuffer = Buffer.from(data, 'base64');

    // Nếu đã là MP3, trả về trực tiếp
    if (mimeType && (mimeType.includes('mp3') || mimeType.includes('mpeg'))) {
        return audioBuffer;
    }

    // Nếu là WAV, convert sang MP3
    if (mimeType && (mimeType.includes('wav') || mimeType.includes('wave'))) {
        return wavToMp3(audioBuffer);
    }

    // Mặc định: giả sử PCM signed 16-bit LE, 24kHz mono
    // Parse sample rate từ mimeType nếu có (vd: "audio/L16;rate=24000")
    let sampleRate = 24000;
    if (mimeType) {
        const rateMatch = mimeType.match(/rate=(\d+)/);
        if (rateMatch) sampleRate = parseInt(rateMatch[1], 10);
    }

    return pcmToMp3(audioBuffer, sampleRate);
}

module.exports = {
    id: 'gemini',
    envKey: 'GEMINI_API_KEY',
    synthesize,
    // Export để test
    _findFfmpeg: findFfmpeg
};
