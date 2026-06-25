#!/usr/bin/env node
// ============================================================================
// list-voices.js — Liệt kê các voice trong tài khoản ElevenLabs của bạn
// ----------------------------------------------------------------------------
// Trước khi quyết định có dùng ElevenLabs hay không, bạn cần biết tài khoản có
// những giọng nào để chọn voiceId phù hợp (accent US/UK, nam/nữ...). Script này
// GET https://api.elevenlabs.io/v1/voices và in ra bảng: tên, voiceId, accent,
// giới tính, mô tả. Endpoint READ-ONLY, KHÔNG tốn quota tổng hợp giọng.
//
// Key đọc từ .env ở gốc repo (ELEVENLABS_API_KEY) — KHÔNG bao giờ in ra.
//
//   node scripts/tts/list-voices.js
//
// Sau khi chọn được voiceId, dán vào scripts/tts/config.js
// (voices.elevenlabs.voiceId của variant tương ứng) hoặc thử nghe bằng
// scripts/tts/preview-elevenlabs.js.
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

const ENDPOINT = 'https://api.elevenlabs.io/v1/voices';
const apiKey = process.env.ELEVENLABS_API_KEY;

function pad(str, len) {
    str = String(str == null ? '' : str);
    if (str.length >= len) return str.slice(0, len - 1) + '…';
    return str + ' '.repeat(len - str.length);
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
    const voices = json && Array.isArray(json.voices) ? json.voices : [];

    if (!voices.length) {
        console.log('• Tài khoản chưa có voice nào (hoặc response trống).');
        console.log(JSON.stringify(json, null, 2).slice(0, 800));
        return;
    }

    console.log(`\n• Tổng ${voices.length} voice khả dụng:\n`);
    console.log(
        pad('Tên', 22) + pad('voiceId', 24) + pad('Accent', 14) +
        pad('Giới tính', 10) + 'Loại'
    );
    console.log('─'.repeat(82));

    for (const v of voices) {
        const labels = v.labels || {};
        console.log(
            pad(v.name, 22) +
            pad(v.voice_id, 24) +
            pad(labels.accent || '—', 14) +
            pad(labels.gender || '—', 10) +
            (v.category || '—')
        );
    }

    // Gợi ý các voice tiếng Anh để chọn nhanh cho accent us/gb
    const enVoices = voices.filter((v) => {
        const acc = String((v.labels || {}).accent || '').toLowerCase();
        return acc.includes('american') || acc.includes('british') ||
            acc.includes('english') || acc.includes('australian');
    });
    if (enVoices.length) {
        console.log('\n★ Gợi ý cho tiếng Anh (accent us/gb):');
        for (const v of enVoices) {
            const acc = (v.labels || {}).accent || '';
            console.log(`   ★ ${pad(v.name, 20)} ${pad(v.voice_id, 24)} (${acc})`);
        }
    }

    console.log('\nGợi ý:');
    console.log('  • Dán voiceId vào scripts/tts/config.js → voices.elevenlabs.voiceId');
    console.log('  • Nghe thử nhiều voice cùng lúc:');
    console.log('      node scripts/tts/preview-elevenlabs.js --voices id1,id2,id3');
}

main().catch((err) => {
    console.error('✗ Lỗi không mong đợi:', err.message);
    process.exit(1);
});
