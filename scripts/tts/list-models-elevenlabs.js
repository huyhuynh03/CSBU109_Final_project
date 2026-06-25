#!/usr/bin/env node
// ============================================================================
// list-models-elevenlabs.js — Liệt kê MODEL ElevenLabs mà API key được phép dùng
// ----------------------------------------------------------------------------
// Bối cảnh: gói free ElevenLabs KHÔNG cho chọn mọi model. Cụ thể:
//   • eleven_multilingual_v2  → TTS ổn định, free tier DÙNG ĐƯỢC (đang cấu hình).
//   • eleven_v3 (Multilingual v3, "alpha") → model mới, biểu cảm hơn; thường có
//     cờ requires_alpha_access = true và CHƯA mở qua public API cho key free →
//     đây là lý do "không chọn được model cao cấp hơn".
//   • Scribe v1 / Scribe v2 → đây là model SPEECH-TO-TEXT (nhận dạng giọng nói),
//     KHÔNG phải text-to-speech. Endpoint /v1/models (TTS) sẽ không liệt kê được
//     để tổng hợp giọng, nên không dùng cho pipeline audio này.
//
// Script này GET https://api.elevenlabs.io/v1/models và in bảng:
//   model_id | name | TTS? | alpha? | max ký tự (free) | max ký tự (subscribed)
// → Giúp xác nhận chính xác model nào key HIỆN TẠI được phép gọi.
//
// Key đọc từ .env ở gốc repo (ELEVENLABS_API_KEY) — KHÔNG bao giờ in ra.
//
//   node scripts/tts/list-models-elevenlabs.js
//
// Sau khi chọn model dùng được, dán model_id vào scripts/tts/config.js
// (voices.elevenlabs.modelId của variant tương ứng).
// ============================================================================

const fs = require('fs');
const path = require('path');

// Nạp .env ở gốc repo (giống list-voices.js / generate-audio.js).
try {
    const envPath = path.join(__dirname, '..', '..', '.env');
    if (fs.existsSync(envPath) && typeof process.loadEnvFile === 'function') {
        process.loadEnvFile(envPath);
    }
} catch (err) {
    console.warn(`[env] Không nạp được .env (${err.message}).`);
}

const ENDPOINT = 'https://api.elevenlabs.io/v1/models';
const apiKey = process.env.ELEVENLABS_API_KEY;

function pad(str, len) {
    str = String(str == null ? '' : str);
    if (str.length >= len) return str.slice(0, len - 1) + '…';
    return str + ' '.repeat(len - str.length);
}

function yn(val) {
    if (val === true) return 'có';
    if (val === false) return 'không';
    return '—';
}

async function main() {
    if (!apiKey) {
        console.error('✗ Thiếu ELEVENLABS_API_KEY (đặt trong .env ở gốc repo).');
        console.error('  PowerShell:  $env:ELEVENLABS_API_KEY="..."');
        process.exit(1);
    }

    console.log(`• GET ${ENDPOINT}`);

    let res;
    try {
        res = await fetch(ENDPOINT, {
            method: 'GET',
            headers: { 'xi-api-key': apiKey }
        });
    } catch (err) {
        console.error(`✗ Lỗi mạng: ${err.message}`);
        process.exit(1);
    }

    if (!res.ok) {
        const detail = await res.text().catch(() => '');
        console.error(`✗ ${res.status}: ${detail.slice(0, 400)}`);
        if (res.status === 401) {
            console.error('→ Key sai hoặc hết hạn. Kiểm tra lại ELEVENLABS_API_KEY trong .env.');
        }
        process.exit(1);
    }

    const json = await res.json().catch(() => null);
    const models = Array.isArray(json) ? json : (json && Array.isArray(json.models) ? json.models : []);

    if (!models.length) {
        console.log('• Không có model nào trả về (hoặc response trống).');
        console.log(JSON.stringify(json, null, 2).slice(0, 800));
        return;
    }

    console.log(`\n• Tổng ${models.length} model trả về cho key này:\n`);
    console.log(
        pad('model_id', 28) + pad('Tên', 26) +
        pad('TTS?', 6) + pad('Alpha?', 8) +
        pad('Max free', 10) + 'Max sub'
    );
    console.log('─'.repeat(96));

    for (const m of models) {
        console.log(
            pad(m.model_id, 28) +
            pad(m.name, 26) +
            pad(yn(m.can_do_text_to_speech), 6) +
            pad(yn(m.requires_alpha_access), 8) +
            pad(m.max_characters_request_free_user, 10) +
            (m.max_characters_request_subscribed_user == null
                ? '—'
                : String(m.max_characters_request_subscribed_user))
        );
    }

    // Model TTS dùng được ngay cho key free: TTS = true và KHÔNG cần alpha access.
    const usableTts = models.filter(
        (m) => m.can_do_text_to_speech === true && m.requires_alpha_access !== true
    );
    if (usableTts.length) {
        console.log('\n★ Model TTS dùng được ngay (không cần alpha access):');
        for (const m of usableTts) {
            console.log(`   ★ ${pad(m.model_id, 28)} ${m.name}`);
        }
    }

    // Model bị chặn vì cần alpha access (vd: eleven_v3) — "model cao cấp hơn".
    const alphaLocked = models.filter((m) => m.requires_alpha_access === true);
    if (alphaLocked.length) {
        console.log('\n⚠ Model yêu cầu alpha access (gói free thường KHÔNG gọi được qua API):');
        for (const m of alphaLocked) {
            console.log(`   ⚠ ${pad(m.model_id, 28)} ${m.name}`);
        }
    }

    console.log('\nGợi ý:');
    console.log('  • Dán model_id vào scripts/tts/config.js → voices.elevenlabs.modelId');
    console.log('  • Lưu ý: Scribe (v1/v2) là model SPEECH-TO-TEXT, không dùng để tổng hợp giọng.');
}

main().catch((err) => {
    console.error('✗ Lỗi không mong đợi:', err.message);
    process.exit(1);
});
