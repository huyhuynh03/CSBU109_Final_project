#!/usr/bin/env node
// ============================================================================
// list-models.js — Liệt kê các model khả dụng trên gateway OpenAI-compatible
// ----------------------------------------------------------------------------
// Dùng để chẩn đoán khi generate-audio.js báo "model_not_found". Script GET
// {OPENAI_BASE_URL}/models và in ra danh sách model ID, đánh dấu các model liên
// quan TTS/audio để bạn chọn đúng tên đặt vào scripts/tts/config.js.
//
// Endpoint này READ-ONLY và MIỄN PHÍ (không gọi TTS). Key đọc từ .env, KHÔNG in.
//
//   node scripts/tts/list-models.js
// ============================================================================

const fs = require('fs');
const path = require('path');

// Nạp .env ở gốc repo (giống generate-audio.js).
try {
    const envPath = path.join(__dirname, '..', '..', '.env');
    if (fs.existsSync(envPath) && typeof process.loadEnvFile === 'function') {
        process.loadEnvFile(envPath);
    }
} catch (err) {
    console.warn(`[env] Không nạp được .env (${err.message}).`);
}

const DEFAULT_BASE_URL = 'https://api.openai.com/v1';
const baseUrl = (process.env.OPENAI_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, '');
const apiKey = process.env.OPENAI_API_KEY;

// Từ khoá nhận diện model liên quan tới TTS để làm nổi bật.
const TTS_HINTS = ['tts', 'audio', 'speech', 'voice', 'gemini', 'flash'];

function looksLikeTTS(id) {
    const low = String(id).toLowerCase();
    return TTS_HINTS.some((h) => low.includes(h));
}

async function main() {
    if (!apiKey) {
        console.error('✗ Thiếu OPENAI_API_KEY (đặt trong .env ở gốc repo).');
        process.exit(1);
    }

    const url = `${baseUrl}/models`;
    console.log(`• GET ${url}`);

    let res;
    try {
        res = await fetch(url, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${apiKey}` }
        });
    } catch (err) {
        console.error(`✗ Lỗi mạng: ${err.message}`);
        process.exit(1);
    }

    if (!res.ok) {
        const detail = await res.text().catch(() => '');
        console.error(`✗ ${res.status} @ ${url}: ${detail.slice(0, 400)}`);
        console.error('\nGateway có thể không hỗ trợ /models, hoặc gói của bạn bị giới hạn.');
        console.error('→ Vào dashboard shopaikey xem danh sách model TTS được phép dùng.');
        process.exit(1);
    }

    const json = await res.json().catch(() => null);
    if (!json) {
        console.error('✗ Response không phải JSON hợp lệ.');
        process.exit(1);
    }

    // OpenAI format: { data: [ { id, ... }, ... ] }. Một số gateway trả mảng thẳng.
    const models = Array.isArray(json) ? json : (Array.isArray(json.data) ? json.data : []);
    if (!models.length) {
        console.log('• Không có model nào trong response. Raw:');
        console.log(JSON.stringify(json, null, 2).slice(0, 1000));
        return;
    }

    const ids = models
        .map((m) => (typeof m === 'string' ? m : m.id))
        .filter(Boolean)
        .sort();

    const ttsModels = ids.filter(looksLikeTTS);

    console.log(`\n• Tổng ${ids.length} model khả dụng.`);

    if (ttsModels.length) {
        console.log(`\n★ Model có khả năng TTS/audio (${ttsModels.length}) — ưu tiên thử các tên này:`);
        for (const id of ttsModels) console.log(`   ★ ${id}`);
    } else {
        console.log('\n⚠ Không thấy model nào chứa từ khoá TTS/audio/gemini/speech.');
        console.log('  Gateway của bạn có thể KHÔNG cung cấp TTS qua endpoint OpenAI-compatible.');
    }

    console.log(`\n— Toàn bộ ${ids.length} model —`);
    for (const id of ids) console.log(`   ${id}`);

    console.log('\nGợi ý: đặt một trong các tên TTS ở trên vào scripts/tts/config.js (voices.openai.model).');
}

main().catch((err) => {
    console.error('✗ Lỗi không mong đợi:', err.message);
    process.exit(1);
});
