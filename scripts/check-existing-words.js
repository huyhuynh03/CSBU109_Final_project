#!/usr/bin/env node
/**
 * Kiểm tra TẤT CẢ từ dự kiến thêm (root + derivative) đã tồn tại trong seed chưa.
 * In ra từ nào đã có (ở topic nào) để tránh trùng identity.
 * Chạy: node scripts/check-existing-words.js
 */
const fs = require('fs');
const path = require('path');

// Toàn bộ từ dự kiến thêm/patch (gồm cả thành viên family mới)
const PLANNED = [
  // home-living
  'garden', 'gardener', 'gardening', 'empty', 'emptiness', 'tweezer', 'counter',
  // environment-climate
  'moss', 'humid', 'humidity', 'breeze', 'breezy', 'valley',
  // travel
  'world', 'worldwide',
  // emotion-feelings
  'incredible', 'incredibly', 'enjoy', 'enjoyable', 'enjoyment',
  // personal-qualities
  'perfect', 'perfectly', 'perfection', 'dedicate', 'dedicated', 'dedication',
  'aspire', 'aspiration', 'aspiring', 'goodness',
  // communication-social
  'probably', 'probable', 'notice', 'noticeable', 'yourself',
  'every', 'everyone', 'everything', 'anybody', 'anyone', 'anything',
  // daily-life
  'during', 'by', 'nearly', 'near', 'whole', 'plenty', 'plentiful',
  'rarely', 'rare', 'rarity', 'largely', 'large', 'currently', 'current', 'field',
  // psychology
  'insane', 'insanely', 'insanity', 'possible', 'possibly', 'possibility', 'impossible',
  // sports
  'squat', 'chase',
  // employment
  'career',
  // economy
  'employ', 'employment', 'employable', 'unemployable', 'unemployed', 'employer', 'employee',
  // education
  'define', 'definition', 'definite', 'definitely'
];

const DIRS = [
  path.join(__dirname, '..', 'data', 'seed-vocabulary'),
  path.join(__dirname, '..', 'packages', 'shell', 'public', 'seed-vocabulary')
];

const norm = (s) => String(s || '').trim().toLowerCase();
const wordIndex = new Map(); // word -> Set("file::pos")

for (const dir of DIRS) {
  let files;
  try { files = fs.readdirSync(dir).filter(f => f.endsWith('.json')); }
  catch { continue; }
  for (const f of files) {
    let content;
    try { content = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); }
    catch { continue; }
    (content.cards || []).forEach(c => {
      const w = norm(c.fieldValues?.word);
      if (!w) return;
      if (!wordIndex.has(w)) wordIndex.set(w, new Set());
      wordIndex.get(w).add(`${f}(${norm(c.fieldValues?.partOfSpeech)})`);
    });
  }
}

const existing = [];
const missing = [];
for (const t of PLANNED) {
  const key = norm(t);
  if (wordIndex.has(key)) existing.push(`  ${t.padEnd(16)} ← ${[...wordIndex.get(key)].join(', ')}`);
  else missing.push(t);
}

console.log('=== ĐÃ TỒN TẠI trong seed (' + existing.length + ') — cần patch/tránh trùng ===');
existing.forEach(e => console.log(e));
console.log('\n=== SẼ THÊM MỚI (' + missing.length + ') ===');
console.log('  ' + missing.join(', '));
