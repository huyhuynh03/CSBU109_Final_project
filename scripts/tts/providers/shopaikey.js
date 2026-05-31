// ============================================================================
// providers/shopaikey.js — Adapter cho Shopaikey Gemini TTS Gateway
// ----------------------------------------------------------------------------
// Endpoint: POST https://api.shopaikey.com/tts/google/generations
// Auth: Bearer token (cùng key dùng cho OpenAI-compatible trên shopaikey)
//
// Request body:
//   {
//     "model": "gemini-2.5-flash-preview-tts",
//     "speakers": [{ "voice": "Puck", "text": "hello" }]
//   }
//
// Giọng (Gemini voices): Puck | Kore | Charon | Fenrir | Aoede | Leda | Orus | Zephyr
// Model: gemini-2.5-flash-preview-tts | gemini-2.5-pro-preview-tts
//
// Lấy API key: Dashboard shopaikey → copy token
//   Đặt vào biến môi trường SHOPAIKEY_API_KEY (hoặc OPENAI_API_KEY nếu dùng chung)
// ============================================================================

const ENDPOINT = 'https://api.shopaikey.com/tts/google/generations';

/**
 * @param {string} text          Từ/cụm từ cần đọc
 * @param {object} voiceConfig   { model, voice }
 * @param {string} apiKey        SHOPAIKEY_API_KEY hoặc OPENAI_API_KEY
 * @returns {Promise<Buffer>}    Audio buffer (MP3 hoặc WAV)
 */
async function synthesize(text, voiceConfig, apiKey) {
    const model = voiceConfig.model || 'gemini-2.5-flash-preview-tts';
    const voice = voiceConfig.voice || 'Puck';

    const body = {
        model,
        speakers: [
            { voice, text }
        ]
    };

    const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(body)
    });

    if (!res.ok) {
        const detail = await res.text().catch(() => '');
        throw new Error(`Shopaikey TTS ${res.status}: ${detail.slice(0, 400)}`);
    }

    // Xác định response type dựa trên Content-Type header
    const contentType = res.headers.get('content-type') || '';

    // Nếu trả về binary audio trực tiếp
    if (contentType.includes('audio/') || contentType.includes('octet-stream')) {
        const arrayBuf = await res.arrayBuffer();
        return Buffer.from(arrayBuf);
    }

    // Nếu trả về JSON (có thể chứa base64 audio)
    if (contentType.includes('json')) {
        const json = await res.json();

        // Thử các format response phổ biến
        // Format 1: { audio: "<base64>" }
        if (json.audio) {
            return Buffer.from(json.audio, 'base64');
        }
        // Format 2: { data: "<base64>" }
        if (json.data && typeof json.data === 'string') {
            return Buffer.from(json.data, 'base64');
        }
        // Format 3: { audioContent: "<base64>" } (giống Google Cloud TTS)
        if (json.audioContent) {
            return Buffer.from(json.audioContent, 'base64');
        }
        // Format 4: { result: { audio: "<base64>" } }
        if (json.result && json.result.audio) {
            return Buffer.from(json.result.audio, 'base64');
        }
        // Format 5: array of results (multi-speaker)
        if (Array.isArray(json) && json[0]) {
            const first = json[0];
            if (first.audio) return Buffer.from(first.audio, 'base64');
            if (first.data) return Buffer.from(first.data, 'base64');
        }

        // Không nhận diện được format → log để debug
        const preview = JSON.stringify(json).slice(0, 500);
        throw new Error(`Shopaikey TTS: response JSON format không nhận diện. Preview: ${preview}`);
    }

    // Fallback: đọc như binary
    const arrayBuf = await res.arrayBuffer();
    if (arrayBuf.byteLength === 0) {
        throw new Error('Shopaikey TTS: response rỗng (0 bytes)');
    }
    return Buffer.from(arrayBuf);
}

module.exports = {
    id: 'shopaikey',
    envKey: 'SHOPAIKEY_API_KEY',
    envKeyFallbacks: ['OPENAI_API_KEY'],
    synthesize
};
