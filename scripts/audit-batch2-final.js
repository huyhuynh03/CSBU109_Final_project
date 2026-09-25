#!/usr/bin/env node
/**
 * audit-batch2-final.js — Kiểm tra CHÉO toàn bộ từ dự kiến THÊM MỚI của batch 2
 * xem đã tồn tại ở BẤT KỲ topic nào chưa (identity = word+topic+pos, nhưng seed
 * luật là tránh trùng word khác topic).
 *
 * Chạy: node scripts/audit-batch2-final.js
 */
const fs = require('fs');
const path = require('path');

const PLANNED_NEW = [
  // travel
  'depart', 'shuttle', 'reserve', 'adjust', 'adjusted', 'adjustment', 'alight',
  // environment-climate
  'fog', 'foggy', 'vegetation', 'vulnerable', 'vulnerability', 'destroy', 'destructive', 'destruction',
  // urbanization
  'dense', 'access', 'accessible', 'accessibility',
  // science
  'mechanism', 'mechanical', 'mechanically', 'calibrate', 'calibration', 'occur', 'occurrence',
  'drift', 'combine', 'combination', 'settling', 'external', 'externally',
  // business
  'inspect', 'inspection', 'inspector', 'refurbish', 'refurbishment', 'warranty',
  'quantity', 'quantify', 'compact', 'counterproductive', 'reception',
  // employment
  'technician', 'technological', 'technical', 'technique', 'badge',
  // daily-life
  'envelope', 'blink', 'blinking', 'count', 'countless', 'movement',
  'separate', 'separation', 'quite', 'simple', 'simply', 'common',
  // home-living
  'rack', 'crack', 'cracked', 'electrocute', 'electrocuted', 'electrocution',
  // communication-social
  'inconvenience', 'inconvenient', 'regard', 'regarding', 'critic', 'criticize',
  'criticism', 'critical', 'straightforward', 'inexplicable', 'inexplicably',
  'receive', 'encourage', 'encouragement',
  // emotion-feelings
  'patience', 'impatiently', 'frighten', 'frightening', 'desire', 'desirable', 'triumph', 'triumphant',
  // health
  'accidental', 'accidentally', 'fatal', 'fatally', 'fatality', 'fate', 'prevent', 'hygienic',
  'pregnant', 'pregnancy', 'metabolism', 'metabolic', 'dexterity', 'spreading',
  // space
  'planetary',
  // biology
  'rodent', 'predatory', 'predation', 'breeding', 'invade', 'invasive', 'invasion',
  'dominate', 'dominant', 'dominance', 'poison', 'poisonous',
  // psychology
  'conscious', 'resilience',
  // crime
  'seize', 'seizure',
  // education
  'simplify', 'include', 'inclusive', 'inclusion', 'essential',
  // politics
  'scheme', 'intervene', 'intervention',
  // economy
  'productive', 'productivity',
  // personal-qualities
  'caution', 'virtue', 'virtuous', 'effort', 'effortless', 'unshakable',
  // sports
  'shuttle-sports-check'
];

const DIR = path.join(__dirname, '..', 'packages', 'shell', 'public', 'seed-vocabulary');
const norm = (s) => String(s || '').trim().toLowerCase();
const index = new Map();
for (const f of fs.readdirSync(DIR).filter((x) => x.endsWith('.json'))) {
  let d; try { d = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')); } catch { continue; }
  const topicId = d?._meta?.topicId || f.replace(/\.json$/, '');
  for (const c of d.cards || []) {
    const fv = c.fieldValues || {};
    const w = norm(fv.word); if (!w) continue;
    if (!index.has(w)) index.set(w, []);
    index.get(w).push(`${topicId}/${fv.partOfSpeech || '-'} fam=${fv.familyId || '(trống)'}`);
  }
}

const dup = [], ok = [];
for (const w of PLANNED_NEW) {
  if (w.endsWith('-check')) continue;
  (index.get(norm(w)) || []).length ? dup.push(`  ${w.padEnd(18)} ${index.get(norm(w)).join(' , ')}`) : ok.push(w);
}
console.log(`=== ĐÃ TỒN TẠI (${dup.length}) — chuyển thành patch, KHÔNG thêm mới ===`);
dup.forEach((l) => console.log(l));
console.log(`\n=== AN TOÀN ĐỂ THÊM (${ok.length}) ===`);
console.log(ok.join(', '));
