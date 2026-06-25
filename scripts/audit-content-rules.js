#!/usr/bin/env node
/**
 * Rà soát seed-vocabulary theo plans/vocabulary-content-rules.md
 *
 * Liệt kê ứng viên nghi vi phạm để review thủ công:
 *  - Mục partOfSpeech = "phrase" (nghi dịch word-by-word)
 *  - Từ đơn viết hoa chữ cái đầu (nghi danh từ riêng)
 *
 * KHÔNG đụng tới phrasal-verbs.json và idioms.json.
 *
 * Usage: node scripts/audit-content-rules.js
 */
const fs = require('fs');
const path = require('path');

const SEED_DIRS = [
  path.join(__dirname, '..', 'packages', 'shell', 'public', 'seed-vocabulary'),
];

// File được miễn trừ hoàn toàn
const EXEMPT_FILES = new Set(['phrasal-verbs.json', 'idioms.json']);

function getWordEntries(json) {
  // Hỗ trợ nhiều schema: { cards: [...] } hoặc { words: [...] } hoặc mảng
  if (Array.isArray(json)) return json;
  if (Array.isArray(json.cards)) return json.cards;
  if (Array.isArray(json.words)) return json.words;
  if (Array.isArray(json.items)) return json.items;
  // gom mọi mảng con
  const out = [];
  for (const v of Object.values(json)) if (Array.isArray(v)) out.push(...v);
  return out;
}

function getFV(entry) {
  return entry.fieldValues || entry;
}

const phraseCandidates = [];
const properNounCandidates = [];

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
    const entries = getWordEntries(json);
    for (const entry of entries) {
      const fv = getFV(entry);
      const word = (fv.word || '').trim();
      const pos = (fv.partOfSpeech || '').trim();
      const meaning = (fv.meaning || '').trim();
      const tags = fv.tags || [];
      if (!word) continue;

      const isPhrasalVerbTag =
        Array.isArray(tags) && tags.includes('phrasal-verb');
      const isIdiomTag = Array.isArray(tags) && tags.includes('idiom');
      if (isPhrasalVerbTag || isIdiomTag) continue; // miễn trừ

      // Ứng viên cụm từ: nhiều từ, partOfSpeech = phrase
      if (pos === 'phrase' && word.includes(' ')) {
        phraseCandidates.push({
          dir: path.basename(path.dirname(dir)),
          file,
          word,
          meaning,
        });
      }

      // Ứng viên danh từ riêng: từ đơn, viết hoa chữ đầu (không phải đầu câu)
      if (
        !word.includes(' ') &&
        /^[A-Z][a-z]+$/.test(word)
      ) {
        properNounCandidates.push({
          dir: path.basename(path.dirname(dir)),
          file,
          word,
          pos,
          meaning,
        });
      }
    }
  }
}

// Dedupe phrase candidates theo word (gộp file)
const phraseByWord = new Map();
for (const c of phraseCandidates) {
  if (!phraseByWord.has(c.word)) {
    phraseByWord.set(c.word, { word: c.word, meaning: c.meaning, files: [] });
  }
  phraseByWord.get(c.word).files.push(`${c.dir}/${c.file}`);
}

const result = {
  generatedAt: new Date().toISOString(),
  phraseCandidates: [...phraseByWord.values()].sort((a, b) =>
    a.word.localeCompare(b.word)
  ),
  properNounCandidates,
};

const outPath = path.join(__dirname, '..', 'docs', 'content-rules-audit.json');
fs.writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf8');

console.log('=== ỨNG VIÊN CỤM TỪ (partOfSpeech=phrase) ===');
for (const c of result.phraseCandidates) {
  console.log(`  ${c.word}  —  ${c.meaning}`);
}
console.log(`\nTổng cụm từ (unique): ${result.phraseCandidates.length}`);

console.log('\n=== ỨNG VIÊN DANH TỪ RIÊNG (từ viết hoa) ===');
for (const c of properNounCandidates) {
  console.log(`  ${c.word} (${c.pos})  —  ${c.meaning}  [${c.dir}/${c.file}]`);
}
console.log(`\nTổng danh từ riêng: ${properNounCandidates.length}`);
console.log(`\nĐã ghi chi tiết: docs/content-rules-audit.json`);
