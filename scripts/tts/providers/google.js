// ============================================================================
// providers/google.js — Adapter cho Google Cloud Text-to-Speech
// ----------------------------------------------------------------------------
// API: POST https://texttospeech.googleapis.com/v1/text:synthesize?key=API_KEY
// Trả về { audioContent: <base64 MP3> }.
//
// Vì sao chọn Google làm mặc định:
//   - Free tier rộng (1M ký tự WaveNet/Neural2 mỗi tháng)
//   - ToS cho phép lưu & phát lại audio đã tổng hợp (hợp mô hình "generate 1 lần")
//
// Lấy API key: Google Cloud Console -> bật "Cloud Text-to-Speech API"
//              -> Credentials -> Create API key. Đặt vào biến môi trường:
//                  Windows (cmd):   set GOOGLE_TTS_API_KEY=AIza...
//                  PowerShell:      $env:GOOGLE_TTS_API_KEY="AIza..."
//                  bash:            export GOOGLE_TTS_API_KEY=AIza...
// ============================================================================

const ENDPOINT = 'https://texttospeech.googleapis.com/v1/text:synthesize';

/**
 * @param {string} text          văn bản cần đọc
 * @param {object} voiceConfig   langConfig.voices.google
 *        { languageCode, name, ssmlGender }
 * @param {string} apiKey
 * @returns {Promise<Buffer>}    MP3 buffer
 */
async function synthesize(text, voiceConfig, apiKey) {
    const body = {
        input: { text },
        voice: {
            languageCode: voiceConfig.languageCode,
            name: voiceConfig.name,
            ssmlGender: voiceConfig.ssmlGender || 'NEUTRAL'
        },
        audioConfig: {
            audioEncoding: 'MP3',
            // tốc độ nói hơi chậm để học từ vựng nghe rõ
            speakingRate: voiceConfig.speakingRate || 0.95
        }
    };

    const res = await fetch(`${ENDPOINT}?key=${encodeURIComponent(apiKey)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    if (!res.ok) {
        const detail = await res.text().catch(() => '');
        throw new Error(`Google TTS ${res.status}: ${detail.slice(0, 300)}`);
    }

    const json = await res.json();
    if (!json.audioContent) {
        throw new Error('Google TTS: response thiếu audioContent');
    }
    return Buffer.from(json.audioContent, 'base64');
}

module.exports = {
    id: 'google',
    envKey: 'GOOGLE_TTS_API_KEY',
    // GCP API key dùng chung cho mọi service — fallback sang GEMINI_API_KEY nếu có
    envKeyFallbacks: ['GEMINI_API_KEY'],
    synthesize
};
