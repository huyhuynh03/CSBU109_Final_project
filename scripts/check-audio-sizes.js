#!/usr/bin/env node
/**
 * Kiểm tra kích thước file audio của các từ mới — phát hiện file lỗi/rỗng
 * (quá nhỏ → có thể TTS trả về im lặng). Chạy: node scripts/check-audio-sizes.js
 */
const fs = require('fs');
const path = require('path');

const NEW_WORDS = require('./new-words-data');
const { slugify } = require('./tts/lib/slug');

const BASE = path.join(__dirname, '..', 'packages', 'shell', 'public', 'audio', 'en');
const VARIANTS = ['us', 'gb'];
const THRESHOLD = 3000; // bytes — dưới ngưỡng này coi là nghi ngờ

const words = [...new Set(NEW_WORDS.map(e => e.word))];
const suspicious = [];

for (const variant of VARIANTS) {
  for (const w of words) {
    const slug = slugify(w);
    const file = path.join(BASE, variant, `${slug}.mp3`);
    if (!fs.existsSync(file)) {
      suspicious.push(`MISSING  ${variant}/${slug}.mp3`);
      continue;
    }
    const size = fs.statSync(file).size;
    if (size < THRESHOLD) suspicious.push(`SMALL(${size}B)  ${variant}/${slug}.mp3`);
  }
}

if (suspicious.length === 0) {
  console.log(`✅ Tất cả ${words.length} từ × ${VARIANTS.length} variant đều có audio >= ${THRESHOLD}B`);
} else {
  console.log(`⚠ ${suspicious.length} file nghi ngờ:`);
  suspicious.forEach(s => console.log('  ' + s));
}
