// ============================================================================
// providers/openai.js — Adapter cho OpenAI Text-to-Speech (và provider tương thích)
// ----------------------------------------------------------------------------
// API chuẩn: POST {baseUrl}/audio/speech  (trả về MP3 nhị phân trực tiếp)
//
// Hỗ trợ provider bên thứ 3 dùng giao thức OpenAI-Compatible (vd shopaikey,
// together.ai, openrouter, ...) bằng cách đổi BASE URL — mặc định vẫn là
// endpoint chính thức của OpenAI nếu không override.
//
// Thứ tự ưu tiên base URL (cao → thấp):
//   1. voiceConfig.baseUrl                        (đặt trong scripts/tts/config.js)
//   2. process.env.OPENAI_BASE_URL                (theo convention SDK OpenAI)
//   3. 'https://api.openai.com/v1'                (mặc định chính thức)
//
// Quan trọng:
//   - baseUrl PHẢI bao gồm hậu tố `/v1` (chuẩn OpenAI-compatible).
//   - Hậu tố `/audio/speech` được tự nối thêm.
//
// Lấy API key:
//   - OpenAI chính thức: https://platform.openai.com/api-keys
//   - Provider tương thích: lấy key từ dashboard của provider đó (ví dụ shopaikey)
//
//   Windows (cmd):
//     set OPENAI_API_KEY=sk-...
//     set OPENAI_BASE_URL=https://api.shopaikey.com/v1   ← chỉ đặt khi dùng bên thứ 3
//   PowerShell:
//     $env:OPENAI_API_KEY="sk-..."
//     $env:OPENAI_BASE_URL="https://api.shopaikey.com/v1"
//   bash:
//     export OPENAI_API_KEY=sk-...
//     export OPENAI_BASE_URL=https://api.shopaikey.com/v1
//
// Giọng (OpenAI gốc): alloy | echo | fable | onyx | nova | shimmer
// Model:  tts-1 (nhanh, rẻ) hoặc tts-1-hd (chất lượng cao hơn)
//         Provider tương thích có thể hỗ trợ thêm model riêng — tham khảo docs.
// ============================================================================

const DEFAULT_BASE_URL = 'https://api.openai.com/v1';

function resolveBaseUrl(voiceConfig) {
    const raw = (voiceConfig && voiceConfig.baseUrl) || process.env.OPENAI_BASE_URL || DEFAULT_BASE_URL;
    // Cắt slash thừa cuối cho gọn — fetch URL nối tay nên giữ đúng 1 dấu /.
    return String(raw).replace(/\/+$/, '');
}

/**
 * @param {string} text
 * @param {object} voiceConfig  langConfig.voices.openai
 *        { voice, model, baseUrl? }
 * @param {string} apiKey
 * @returns {Promise<Buffer>}
 */
async function synthesize(text, voiceConfig, apiKey) {
    const baseUrl = resolveBaseUrl(voiceConfig);
    const endpoint = `${baseUrl}/audio/speech`;

    const body = {
        model: voiceConfig.model || 'tts-1',
        voice: voiceConfig.voice || 'nova',
        input: text,
        response_format: 'mp3'
    };

    // gpt-4o-mini-tts hỗ trợ instructions để điều khiển accent/style
    if (voiceConfig.instructions) {
        body.instructions = voiceConfig.instructions;
    }

    const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });

    if (!res.ok) {
        const detail = await res.text().catch(() => '');
        throw new Error(`OpenAI TTS ${res.status} @ ${endpoint}: ${detail.slice(0, 300)}`);
    }

    const arrayBuf = await res.arrayBuffer();
    return Buffer.from(arrayBuf);
}

module.exports = {
    id: 'openai',
    envKey: 'OPENAI_API_KEY',
    synthesize,
    // export thêm để test dễ
    _resolveBaseUrl: resolveBaseUrl
};
