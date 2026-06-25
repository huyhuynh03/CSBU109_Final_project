#!/usr/bin/env node
/**
 * Kiểm tra thuật toán stem-clustering của FamilyWordManager trên dữ liệu seed thật.
 * Replicate logic _clusterFamilyCards để xác nhận:
 *   - familyId chủ đề (nutrition, meal-types...) KHÔNG tạo family (mỗi từ 1 cụm lẻ)
 *   - familyId họ từ thật (arts-beauty: beauty/beautify/beautiful...) gom đúng 1 cụm
 *
 * Chạy: node scripts/verify-family-clustering.js
 */

const fs = require('fs');
const path = require('path');

const SEED_DIR = path.join(__dirname, '..', 'packages', 'shell', 'public', 'seed-vocabulary');

const MIN_STEM_LEN = 3;
const MIN_STEM_RATIO = 0.5;

const normalizeWord = (v) => String(v || '').trim().toLowerCase().replace(/[^a-z]/g, '');
const lcpLen = (a, b) => {
  const n = Math.min(a.length, b.length);
  let i = 0;
  while (i < n && a[i] === b[i]) i++;
  return i;
};
const shareStem = (a, b) => {
  const lcp = lcpLen(a, b);
  if (lcp < MIN_STEM_LEN) return false;
  const minLen = Math.min(a.length, b.length);
  return lcp >= Math.ceil(minLen * MIN_STEM_RATIO);
};

function clusterWords(words) {
  const parent = words.map((_, i) => i);
  const find = (x) => { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; };
  const union = (a, b) => { const ra = find(a), rb = find(b); if (ra !== rb) parent[ra] = rb; };
  for (let i = 0; i < words.length; i++)
    for (let j = i + 1; j < words.length; j++)
      if (shareStem(words[i], words[j])) union(i, j);
  const groups = new Map();
  words.forEach((w, i) => {
    const r = find(i);
    if (!groups.has(r)) groups.set(r, []);
    groups.get(r).push(w);
  });
  return [...groups.values()];
}

// Gom toàn bộ card theo familyId trên tất cả seed
const families = new Map(); // familyId -> Set<word>
const files = fs.readdirSync(SEED_DIR).filter(f => f.endsWith('.json') && !f.includes('backup'));
for (const file of files) {
  let content;
  try { content = JSON.parse(fs.readFileSync(path.join(SEED_DIR, file), 'utf8')); }
  catch { continue; }
  (content.cards || []).forEach(card => {
    const fv = card.fieldValues || {};
    const fid = String(fv.familyId || '').trim().toLowerCase();
    const w = normalizeWord(fv.word);
    if (!fid || !w) return;
    if (!families.has(fid)) families.set(fid, new Set());
    families.get(fid).add(w);
  });
}

let realFamilies = 0;
let topicLabelFamilies = 0;
const sampleReal = [];
const sampleRejected = [];

for (const [fid, wordSet] of families) {
  const words = [...wordSet];
  const clusters = clusterWords(words);
  const realClusters = clusters.filter(c => c.length >= 2);
  const looseWords = clusters.filter(c => c.length < 2).flat();

  if (realClusters.length === 0) {
    // familyId này không tạo được family nào → là nhãn chủ đề
    topicLabelFamilies++;
    if (sampleRejected.length < 12)
      sampleRejected.push(`  ${fid}: [${words.join(', ')}] → 0 family (toàn từ lẻ)`);
  } else {
    realFamilies += realClusters.length;
    if (sampleReal.length < 12) {
      realClusters.forEach(c => {
        if (sampleReal.length < 12) {
          let stem = c[0];
          c.forEach(w => { stem = stem.slice(0, lcpLen(stem, w)); });
          sampleReal.push(`  ${fid} → stem "${stem}": [${c.join(', ')}]`);
        }
      });
      if (looseWords.length)
        sampleReal.push(`    (loại khỏi ${fid}: ${looseWords.join(', ')})`);
    }
  }
}

console.log(`Tổng familyId trong seed: ${families.size}`);
console.log(`  → familyId tạo family THẬT (>=1 cụm >=2 từ cùng gốc): có ${realFamilies} cụm`);
console.log(`  → familyId là NHÃN CHỦ ĐỀ (0 cụm, bị loại khỏi gợi ý): ${topicLabelFamilies}\n`);

console.log('VÍ DỤ family THẬT (được gợi ý):');
sampleReal.forEach(s => console.log(s));

console.log('\nVÍ DỤ familyId nhãn chủ đề (KHÔNG còn gợi ý sai):');
sampleRejected.forEach(s => console.log(s));
