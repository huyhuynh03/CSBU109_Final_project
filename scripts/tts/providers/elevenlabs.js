// ============================================================================
// providers/elevenlabs.js — Adapter cho ElevenLabs Text-to-Speech
// ----------------------------------------------------------------------------
// API: POST https://api.elevenlabs.io/v1/text-to-speech/{voiceId}
// Trả về dữ liệu nhị phân audio/mpeg (MP3) trực tiếp.
//
// Lấy API key: https://elevenlabs.io -> Profile -> API Keys
//   Windows (cmd):   set ELEVENLABS_API_KEY=...
//   PowerShell:      $env:ELEVENLABS_API_KEY="..."
//   bash:            export ELEVENLABS_API_KEY=...
//
// LƯU Ý ToS: kiểm tra gói dịch vụ về quyền lưu trữ/tái sử dụng audio trước khi
// "đóng băng" vĩnh viễn. ElevenLabs giọng tự nhiên nhất nhưng đắt hơn.
//
// voiceId mặc định "21m00Tcm4TlvDq8ikWAM" là giọng Rachel công khai.
// Model "eleven_multilingual_v2" hỗ trợ đa ngôn ngữ → tốt cho module tương lai.
// ============================================================================

const BASE = 'https://api.elevenlabs.io/v1/text-to-speech';

/**
 * @param {string} text
 * @param {object} voiceConfig  langConfig.voices.elevenlabs
 *        { voiceId, modelId, stability?, similarityBoost? }
 * @param {string} apiKey
 * @returns {Promise<Buffer>}
 */
async function synthesize(text, voiceConfig, apiKey) {
    const voiceId = voiceConfig.voiceId;
    if (!voiceId) throw new Error('ElevenLabs: thiếu voiceId trong cấu hình');

    const body = {
        text,
        model_id: voiceConfig.modelId || 'eleven_multilingual_v2',
        voice_settings: {
            stability: voiceConfig.stability != null ? voiceConfig.stability : 0.5,
            similarity_boost: voiceConfig.similarityBoost != null ? voiceConfig.similarityBoost : 0.75
        }
    };

    const url = `${BASE}/${encodeURIComponent(voiceId)}?output_format=mp3_44100_128`;
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'xi-api-key': apiKey,
            'Content-Type': 'application/json',
            'Accept': 'audio/mpeg'
        },
        body: JSON.stringify(body)
    });

    if (!res.ok) {
        const detail = await res.text().catch(() => '');
        throw new Error(`ElevenLabs TTS ${res.status}: ${detail.slice(0, 300)}`);
    }

    const arrayBuf = await res.arrayBuffer();
    return Buffer.from(arrayBuf);
}

module.exports = {
    id: 'elevenlabs',
    envKey: 'ELEVENLABS_API_KEY',
    synthesize
};
