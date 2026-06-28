#!/usr/bin/env node
// ============================================================================
// rebuild-manifest.js — Dựng lại audio-manifest.json từ các file .mp3 có sẵn
// ----------------------------------------------------------------------------
// Vì sao cần: generate-audio.js ghi manifest theo danh sách "words" của LẦN CHẠY
// đó (kèm --only/--limit) và GHI ĐÈ manifest cũ, trong khi file .mp3 lại tích luỹ
// qua nhiều lần (resume). Hậu quả: trên đĩa có hàng nghìn .mp3 nhưng manifest chỉ
// liệt kê vài từ → app tưởng "không có mp3" và rơi xuống Web Speech (giọng khác).
//
// Script này quét trực tiếp thư mục audio/en/<variant>/*.mp3, suy slug = tên file
// bỏ đuôi .mp3, rồi ghi lại manifest đầy đủ. KHÔNG gọi API, KHÔNG tốn phí.
//
//   node scripts/tts/rebuild-manifest.js              # dựng cho us, gb
//   node scripts/tts/rebuild-manifest.js us           # chỉ us
//   node scripts/tts/rebuild-manifest.js us gb        # chỉ định nhiều variant
// ============================================================================

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const AUDIO_BASE = path.join(ROOT, 'packages', 'shell', 'public', 'audio', 'en');

// Variant cần dựng (mặc định cả hai accent)
const variants = process.argv.slice(2).filter(Boolean);
const targets = variants.length ? variants : ['us', 'gb'];

function rebuild(variant) {
    const dir = path.join(AUDIO_BASE, variant);
    if (!fs.existsSync(dir)) {
        console.warn(`  ⚠ Bỏ qua "${variant}" — không có thư mục: ${dir}`);
        return;
    }

    const mp3s = fs.readdirSync(dir).filter((f) => f.toLowerCase().endsWith('.mp3'));
    const files = {};
    for (const fileName of mp3s.sort()) {
        const slug = fileName.replace(/\.mp3$/i, '');
        files[slug] = fileName;
    }

    const manifestPath = path.join(dir, 'audio-manifest.json');

    // Giữ lại _meta cũ (provider, lang) nếu có; chỉ cập nhật số liệu.
    let prevMeta = {};
    if (fs.existsSync(manifestPath)) {
        try { prevMeta = (JSON.parse(fs.readFileSync(manifestPath, 'utf8'))._meta) || {}; } catch { /* noop */ }
    }

    const manifest = {
        _meta: {
            lang: prevMeta.lang || 'english',
            variant,
            provider: prevMeta.provider || 'openai',
            generatedAt: new Date().toISOString(),
            rebuiltFrom: 'mp3-scan',
            total: mp3s.length
        },
        files
    };

    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log(`  ✓ ${variant}: ${mp3s.length} file → ${path.relative(ROOT, manifestPath)}`);
}

console.log('Dựng lại audio-manifest.json từ các file .mp3 có sẵn...');
for (const v of targets) rebuild(v);
console.log('Hoàn tất.');
