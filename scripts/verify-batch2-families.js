#!/usr/bin/env node
/**
 * verify-batch2-families.js — Kiểm tra các familyId mới của batch 2 (am)
 * tiếp tục gom đúng ≥2 từ cùng gốc theo thuật toán stem-clustering của
 * FamilyWordManager (LCP >= 3 VÀ >= 50% từ ngắn hơn).
 *
 * Chạy: node scripts/verify-batch2-families.js
 */
const fs = require('fs');
const path = require('path');

const SEED_DIR = path.join(__dirname, '..', 'packages', 'shell', 'public', 'seed-vocabulary');
const MIN_STEM_LEN = 3;
const MIN_STEM_RATIO = 0.5;

const normalize = (v) => String(v || '').trim().toLowerCase().replace(/[^a-z]/g, '');
const lcpLen = (a, b) => {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return i;
};
const shareStem = (a, b) => {
  const l = lcpLen(a, b);
  return l >= MIN_STEM_LEN && l >= Math.min(a.length, b.length) * MIN_STEM_RATIO;
};

// Build familyId → words
const famMap = new Map();
for (const f of fs.readdirSync(SEED_DIR).filter(x => x.endsWith('.json'))) {
  let d; try { d = JSON.parse(fs.readFileSync(path.join(SEED_DIR, f), 'utf8')); } catch { continue; }
  for (const c of d.cards || []) {
    const fv = c.fieldValues || {};
    const fid = fv.familyId; if (!fid) continue;
    const w = normalize(fv.word); if (!w) continue;
    if (!famMap.has(fid)) famMap.set(fid, []);
    famMap.get(fid).push(w);
  }
}

// Các familyId mới của batch 2
const BATCH2_FAMILIES = [
  'reserve', 'depart', 'blink', 'count', 'move', 'separate', 'simple',
  'adjust', 'compact', 'inspect', 'refurbish', 'quantity', 'receive',
  'crack', 'electrocute', 'inconvenience', 'regard', 'critic', 'inexplicable',
  'encourage', 'patient', 'impatient', 'frighten', 'desire', 'triumph',
  'accident', 'fate', 'prevent', 'hygiene', 'pregnant', 'metabolism',
  'planet', 'predator', 'invade', 'dominate', 'poison', 'fog', 'vulnerable',
  'destroy', 'conscious', 'seize', 'include', 'intervene', 'produce', 'caution',
  'dense', 'access', 'mechanism', 'calibrate', 'occur', 'external', 'combine'
];

// Union-find to cluster
const add = (m, k, v) => { if (!m.has(k)) m.set(k, []); m.get(k).push(v); };

console.log('=== BATCH 2 — family clustering verify ===\n');
let totalReal = 0, totalSingles = 0;
for (const fid of BATCH2_FAMILIES) {
  const words = famMap.get(fid) || [];
  if (words.length === 0) { console.log(`  ⚠ [${fid}] không có từ nào trong seed`); continue; }
  // union-find
  const parent = new Map(); const rank = new Map();
  const uniq = [...new Set(words)];
  const find = (x) => { if (!parent.has(x)) { parent.set(x, x); rank.set(x, 0); return x; } while (parent.get(x) !== x) x = parent.get(x); return x; };
  const union = (a, b) => { const ra = find(a), rb = find(b); if (ra === rb) return; if (rank.get(ra) < rank.get(rb)) parent.set(ra, rb); else { parent.set(rb, ra); if (rank.get(ra) === rank.get(rb)) rank.set(ra, rank.get(ra) + 1); } };
  for (let i = 0; i < uniq.length; i++) for (let j = i + 1; j < uniq.length; j++) if (shareStem(uniq[i], uniq[j])) union(uniq[i], uniq[j]);
  const clusters = new Map();
  uniq.forEach(w => add(clusters, find(w), w));
  const realClusters = [...clusters.values()].filter(c => c.length >= 2);
  const singleCount = [...clusters.values()].filter(c => c.length === 1).length;
  totalReal += realClusters.length;
  totalSingles += singleCount;
  const realStr = realClusters.map(c => JSON.stringify(c)).join('  ');
  const singleWords = [...clusters.values()].filter(c => c.length === 1).flat();
  const singleStr = singleWords.length ? ` | lẻ: ${singleWords.join(', ')}` : '';
  console.log(`  [${fid}] (${uniq.length} từ) → cụm thật: ${JSON.stringify(realClusters)}${singleStr}`);
}

console.log(`\nTỔNG: cụm family thật = ${totalReal}, từ lẻ (1 mình trong familyId) = ${totalSingles}`);
console.log('Chú ý: từ lẻ trong familyId sẽ bị FamilyWordManager filter ở runtime — chấp nhận cho các từ prefix dài.');