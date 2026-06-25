#!/usr/bin/env node
/**
 * merge-new-words.js — Chèn các card từ vựng mới vào đúng seed file ở CẢ 2 thư mục.
 *
 * Nguồn dữ liệu: scripts/new-words-data.js
 * Đích: packages/shell/public/seed-vocabulary/<topic>.json (nguồn seed duy nhất app nạp)
 *
 * Đặc tính:
 *   - Idempotent: chạy lại không tạo trùng (dedup theo word + partOfSpeech).
 *   - patch:true  → chỉ cập nhật familyId/familyOrder cho card đã tồn tại.
 *   - Cập nhật _meta.totalCards + _meta.totalFamilies cho khớp.
 *   - Mặc định dry-run; thêm --apply để ghi thật.
 *
 * Chạy:
 *   node scripts/merge-new-words.js            (dry-run)
 *   node scripts/merge-new-words.js --apply    (ghi thật)
 */
const fs = require('fs');
const path = require('path');

const NEW_WORDS = require('./new-words-data');
const APPLY = process.argv.includes('--apply');

const DIRS = [
  path.join(__dirname, '..', 'packages', 'shell', 'public', 'seed-vocabulary')
];

const norm = (s) => String(s || '').trim().toLowerCase();

function buildCard(entry) {
  return {
    fieldValues: {
      word: entry.word,
      ipa: entry.ipa || '',
      partOfSpeech: entry.pos || '',
      difficulty: entry.difficulty || 'intermediate',
      meaning: entry.meaning || '',
      example: entry.example || '',
      ...(entry.note ? { note: entry.note } : {}),
      familyId: entry.familyId || '',
      familyOrder: entry.familyOrder == null ? null : entry.familyOrder,
      tags: []
    }
  };
}

// Group entries by topic
const byTopic = new Map();
for (const e of NEW_WORDS) {
  if (!byTopic.has(e.topic)) byTopic.set(e.topic, []);
  byTopic.get(e.topic).push(e);
}

let totalCreated = 0;
let totalPatched = 0;
let totalSkipped = 0;

for (const [topic, entries] of byTopic) {
  for (const dir of DIRS) {
    const file = path.join(dir, `${topic}.json`);
    if (!fs.existsSync(file)) {
      console.warn(`  ⚠ Không tìm thấy ${path.basename(dir)}/${topic}.json — bỏ qua`);
      continue;
    }
    const content = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (!Array.isArray(content.cards)) content.cards = [];

    // index theo word+pos để dedup
    const index = new Map();
    content.cards.forEach((c, i) => {
      const fv = c.fieldValues || {};
      index.set(`${norm(fv.word)}|${norm(fv.partOfSpeech)}`, i);
    });

    let created = 0, patched = 0, skipped = 0;
    for (const e of entries) {
      const posKey = norm(e.pos);
      // patch: tìm theo word (bất kể pos vì root đã tồn tại có thể khác pos field)
      if (e.patch) {
        const found = content.cards.find(c => norm(c.fieldValues?.word) === norm(e.word));
        if (found) {
          const fv = found.fieldValues;
          if (fv.familyId !== e.familyId || fv.familyOrder !== e.familyOrder) {
            fv.familyId = e.familyId;
            fv.familyOrder = e.familyOrder;
            patched++;
          } else skipped++;
        } else {
          console.warn(`    ⚠ patch nhưng không thấy "${e.word}" trong ${topic} — bỏ qua`);
        }
        continue;
      }
      const key = `${norm(e.word)}|${posKey}`;
      if (index.has(key)) { skipped++; continue; }
      content.cards.push(buildCard(e));
      index.set(key, content.cards.length - 1);
      created++;
    }

    // Cập nhật _meta
    if (content._meta) {
      content._meta.totalCards = content.cards.length;
      const fams = new Set(content.cards.map(c => c.fieldValues?.familyId).filter(Boolean));
      content._meta.totalFamilies = fams.size;
    }

    console.log(`  ${path.basename(dir)}/${topic}.json: +${created} created, ${patched} patched, ${skipped} skipped → total ${content.cards.length}`);
    totalCreated += created; totalPatched += patched; totalSkipped += skipped;

    if (APPLY) {
      fs.writeFileSync(file, JSON.stringify(content, null, 2) + '\n', 'utf8');
    }
  }
}

console.log(`\n${APPLY ? '✅ APPLIED' : '🔍 DRY-RUN'} — created ${totalCreated}, patched ${totalPatched}, skipped ${totalSkipped} (gộp 2 thư mục)`);
if (!APPLY) console.log('Chạy lại với --apply để ghi thật.');
