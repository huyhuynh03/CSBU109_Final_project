#!/usr/bin/env node
// ============================================================================
// test-gb-begin-beautiful.js — Test nhanh giọng Anh-Anh (ElevenLabs)
// ----------------------------------------------------------------------------
// Render 2 từ "begin" và "beautiful" bằng giọng Anh-Anh đã cấu hình trong
// config.js (variant gb), xuất ra:
//   packages/shell/public/audio/en/gb_elevenlabs/<slug>.mp3
//
// Mục đích: nghe thử chất giọng THẬT trước khi generate hàng loạt.
// Key đọc từ .env ở gốc repo (ELEVENLABS_API_KEY) — KHÔNG in ra.
//
// Chạy:  node scripts/tts/test-gb-begin-beautiful.js
// ----------------------------------------------------------------------------

const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');

// Nạp .env ở gốc repo (không đọc/không in nội dung key).
try {
    const envPath = path.join(__dirname, '..', '..', '.env');
    if (fs.existsSync(envPath) && typeof process.loadEnvFile === 'function') {
        process.loadEnvFile(envPath);
    }
} catch (err) {
    console.warn(`[env] Không nạp được .env (${err.message}).`);
}

const { LANGUAGES } = require('./config');
const elevenlabs = require('./providers/elevenlabs');
const { audioFileName } = require('./lib/slug');

const WORDS = ['begin', 'beautiful'];

// Thư mục output theo yêu cầu: audio/en/gb_elevenlabs
const OUT_DIR = path.join(
    __dirname, '..', '..',
    'packages', 'shell', 'public', 'audio', 'en', 'gb_elevenlabs'
);

async function main() {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
        console.error('✗ Thiếu ELEVENLABS_API_KEY (đặt trong .env ở gốc repo).');
        process.exit(1);
    }

    const gbVoice = LANGUAGES.english.variants.gb.voices.elevenlabs;
    if (!gbVoice || !gbVoice.voiceId) {
        console.error('✗ Không tìm thấy cấu hình giọng gb.elevenlabs trong config.js');
        process.exit(1);
    }

    await fsp.mkdir(OUT_DIR, { recursive: true });

    console.log('============================================================');
    console.log(' Test giọng Anh-Anh (ElevenLabs)');
    console.log(`  voiceId : ${gbVoice.voiceId}`);
    console.log(`  model   : ${gbVoice.modelId || 'eleven_multilingual_v2'}`);
    console.log(`  output  : ${OUT_DIR}`);
    console.log('============================================================');

    let done = 0, failed = 0;
    for (const word of WORDS) {
        const fileName = audioFileName(word, 'mp3');
        const dest = path.join(OUT_DIR, fileName);
        try {
            const buf = await elevenlabs.synthesize(word, gbVoice, apiKey);
            await fsp.writeFile(dest, buf);
            done++;
            console.log(`  ✓ ${word} -> ${fileName}  (${(buf.length / 1024).toFixed(1)} KB)`);
        } catch (err) {
            failed++;
            console.error(`  ✗ ${word} — ${err.message}`);
        }
    }

    console.log('============================================================');
    console.log(` Xong: ${done} thành công, ${failed} lỗi`);
    console.log('============================================================');
    if (failed) process.exitCode = 1;
}

main().catch((err) => {
    console.error('\n✗ Lỗi không mong đợi:', err);
    process.exit(1);
});
