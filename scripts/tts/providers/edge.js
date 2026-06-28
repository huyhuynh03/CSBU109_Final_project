// ============================================================================
// providers/edge.js — Adapter cho Microsoft Edge TTS (msedge-tts)
// ----------------------------------------------------------------------------
// Edge TTS dùng dịch vụ Azure Speech ẩn sau trình duyệt Edge (đọc to văn bản).
// KHÔNG cần API key — kết nối WebSocket tới endpoint công khai của Microsoft.
// Vì vậy provider này KHÔNG có envKey (keyless). generate-audio.js đã được
// patch để bỏ qua bước yêu cầu API key khi provider.envKey == null.
//
// Giọng (voiceConfig.voice) — neural, chất lượng cao, miễn phí:
//   US nam:  en-US-GuyNeural / en-US-ChristopherNeural
//   UK nữ:   en-GB-SoniaNeural / en-GB-LibbyNeural
//
// outputSubDir: 'edge' → file ghi vào folder anh em "<accent>_edge" (vd us_edge/).
// ============================================================================

const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');

/**
 * Đọc toàn bộ một Readable stream vào một Buffer.
 * @param {import('stream').Readable} stream
 * @returns {Promise<Buffer>}
 */
function streamToBuffer(stream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
    });
}

/**
 * @param {string} text          văn bản cần đọc
 * @param {object} voiceConfig   langConfig.voices.edge
 *        { voice, rate?, pitch? }  rate/pitch là chuỗi SSML vd '-10%', '+0Hz'
 * @param {string|null} apiKey    bỏ qua (Edge TTS keyless)
 * @returns {Promise<Buffer>}     MP3 buffer
 */
async function synthesize(text, voiceConfig, apiKey) {
    if (!voiceConfig || !voiceConfig.voice) {
        throw new Error('Edge TTS: thiếu voiceConfig.voice');
    }

    const tts = new MsEdgeTTS();
    await tts.setMetadata(
        voiceConfig.voice,
        OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3
    );

    // Tuỳ chọn prosody — đọc hơi chậm để học từ vựng nghe rõ.
    const options = {
        rate: voiceConfig.rate || '-8%',
        pitch: voiceConfig.pitch || '+0Hz'
    };

    const { audioStream } = tts.toStream(text, options);
    const buffer = await streamToBuffer(audioStream);

    if (!buffer || !buffer.length) {
        throw new Error('Edge TTS: stream rỗng, không nhận được audio');
    }
    return buffer;
}

module.exports = {
    id: 'edge',
    // Keyless — không cần biến môi trường. generate-audio.js bỏ qua check key
    // khi envKey là null/undefined.
    envKey: null,
    // Ghi vào folder anh em "<accent>_edge" thay vì root accent.
    outputSubDir: 'edge',
    synthesize
};
