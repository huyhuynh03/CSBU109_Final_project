#!/usr/bin/env node
/**
 * Dọn dẹp seed-vocabulary theo plans/vocabulary-content-rules.md
 *
 * - XÓA: cụm từ dịch word-by-word + danh từ riêng ít phổ biến
 * - GIỮ: phrasal verb + cụm có nghĩa thay đổi so với dịch word-by-word
 * - Miễn trừ hoàn toàn: phrasal-verbs.json, idioms.json
 *
 * Mặc định DRY-RUN (chỉ in + ghi review, KHÔNG sửa file).
 * Thêm cờ --apply để thực sự xóa.
 *
 * Usage:
 *   node scripts/clean-content-rules.js          # dry-run
 *   node scripts/clean-content-rules.js --apply  # áp dụng
 */
const fs = require('fs');
const path = require('path');

const APPLY = process.argv.includes('--apply');

const SEED_DIRS = [
  path.join(__dirname, '..', 'data', 'seed-vocabulary'),
  path.join(__dirname, '..', 'packages', 'shell', 'public', 'seed-vocabulary'),
];

const EXEMPT_FILES = new Set(['phrasal-verbs.json', 'idioms.json']);

// Cụm từ GIỮ LẠI: phrasal verb hoặc nghĩa thay đổi so với dịch word-by-word
const KEEP_PHRASES = new Set([
  'do the dishes',       // do = rửa (không phải làm)
  'do the laundry',      // do = giặt
  'dust the shelves',    // dust (v) = lau bụi
  'fall asleep',         // ngủ thiếp đi (fall không phải ngã)
  'get dressed',         // get + V-ed
  'go for a walk',       // đi dạo
  'go to bed',           // đi ngủ (không phải đi đến giường)
  'make a phone call',   // make a call = gọi
  'make the bed',        // dọn giường (không phải làm giường)
  'put on makeup',       // put on = phrasal verb
  'run errands',         // run = làm việc vặt (không phải chạy)
  'set the table',       // dọn bàn ăn (không phải đặt cái bàn)
  'take a nap',          // chợp mắt
  'take a shower',       // tắm
  'take care of someone',// chăm sóc
  'take medicine',       // uống thuốc (take = uống)
  'take notes',          // ghi chú
  'take out the trash',  // take out = phrasal verb
  'take the bus',        // đi xe buýt (take = đi bằng)
  'turn off the lights', // turn off = phrasal verb
  'vacuum the carpet',   // vacuum (v) = hút bụi
  'wait in line',        // xếp hàng
  'walk the dog',        // dắt chó đi dạo (walk transitive)
  'water the plants',    // water (v) = tưới
]);

// Danh từ riêng / tên phong cách ít phổ biến cần XÓA (đối chiếu không phân biệt hoa thường)
const DELETE_PROPER = new Set(['gothic', 'baroque']);

function getCardsArrayInfo(json) {
  if (Array.isArray(json)) return { key: null, arr: json };
  for (const key of ['cards', 'words', 'items']) {
    if (Array.isArray(json[key])) return { key, arr: json[key] };
  }
  return null;
}

function getFV(entry) {
  return entry.fieldValues || entry;
}

const summary = { deletedPhrases: [], deletedProper: [], keptPhrases: [], perFile: {} };

for (const dir of SEED_DIRS) {
  if (!fs.existsSync(dir)) continue;
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));
  for (const file of files) {
    if (EXEMPT_FILES.has(file)) continue;
    const full = path.join(dir, file);
    let json;
    try {
      json = JSON.parse(fs.readFileSync(full, 'utf8'));
    } catch (e) {
      console.error(`Lỗi parse ${full}: ${e.message}`);
      continue;
    }
    const info = getCardsArrayInfo(json);
    if (!info) continue;

    const removed = [];
    const next = info.arr.filter((entry) => {
      const fv = getFV(entry);
      const word = (fv.word || '').trim();
      const pos = (fv.partOfSpeech || '').trim();
      const tags = Array.isArray(fv.tags) ? fv.tags : [];

      // miễn trừ theo tag
      if (tags.includes('phrasal-verb') || tags.includes('idiom')) return true;

      // danh từ riêng cần xóa
      if (DELETE_PROPER.has(word.toLowerCase())) {
        removed.push({ word, reason: 'proper-noun' });
        return false;
      }

      // cụm từ word-by-word
      if (pos === 'phrase' && word.includes(' ')) {
        if (KEEP_PHRASES.has(word)) {
          summary.keptPhrases.push(word);
          return true;
        }
        removed.push({ word, reason: 'word-by-word' });
        return false;
      }

      return true;
    });

    if (removed.length) {
      const rel = path.relative(path.join(__dirname, '..'), full).replace(/\\/g, '/');
      summary.perFile[rel] = removed.map((r) => r.word);
      for (const r of removed) {
        if (r.reason === 'proper-noun') summary.deletedProper.push(r.word);
        else summary.deletedPhrases.push(r.word);
      }
      if (APPLY) {
        if (info.key) json[info.key] = next;
        else json = next;
        // cập nhật _meta.totalCards nếu có
        if (json._meta && typeof json._meta.totalCards === 'number') {
          json._meta.totalCards = next.length;
        }
        fs.writeFileSync(full, JSON.stringify(json, null, 2) + '\n', 'utf8');
      }
    }
  }
}

const uniq = (a) => [...new Set(a)].sort();
const review = {
  mode: APPLY ? 'APPLIED' : 'DRY-RUN',
  generatedAt: new Date().toISOString(),
  deletedPhrasesUnique: uniq(summary.deletedPhrases),
  deletedProperUnique: uniq(summary.deletedProper),
  keptPhrasesUnique: uniq(summary.keptPhrases),
  perFile: summary.perFile,
};
const outPath = path.join(__dirname, '..', 'docs', 'content-rules-cleanup-review.json');
fs.writeFileSync(outPath, JSON.stringify(review, null, 2), 'utf8');

console.log(`MODE: ${review.mode}`);
console.log(`\n=== SẼ XÓA — CỤM TỪ word-by-word (${review.deletedPhrasesUnique.length}) ===`);
console.log('  ' + review.deletedPhrasesUnique.join('\n  '));
console.log(`\n=== SẼ XÓA — DANH TỪ RIÊNG (${review.deletedProperUnique.length}) ===`);
console.log('  ' + (review.deletedProperUnique.join(', ') || '(none)'));
console.log(`\n=== GIỮ LẠI — phrasal verb / nghĩa thay đổi (${review.keptPhrasesUnique.length}) ===`);
console.log('  ' + review.keptPhrasesUnique.join('\n  '));
console.log(`\nTổng số file bị ảnh hưởng: ${Object.keys(review.perFile).length}`);
console.log(`Chi tiết: docs/content-rules-cleanup-review.json`);
if (!APPLY) console.log('\n(DRY-RUN — chưa sửa file. Chạy lại với --apply để áp dụng.)');
