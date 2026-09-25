#!/usr/bin/env node
/**
 * audit-batch2-words.js
 * Rà soát batch từ mới (shuttle, envelope, compact, ...) + gia đình từ của chúng
 * xem ĐÃ tồn tại trong seed chưa, ở topic nào, familyId nào — để quyết định
 * "thêm mới" hay "chỉ liên kết (patch)".
 *
 * Chạy: node scripts/audit-batch2-words.js
 */
const fs = require('fs');
const path = require('path');

// ============================================================================
// Danh sách gia đình từ dự kiến (gốc + phái sinh). Từ user yêu cầu in đậm trong note.
// ============================================================================
const FAMILIES = [
  { id: 'shuttle', words: ['shuttle', 'shuttling'] },
  { id: 'envelope', words: ['envelope', 'envelop', 'enveloping'] },
  { id: 'compact', words: ['compact', 'compactly', 'compaction'] },
  { id: 'reserve', words: ['reserve', 'reservation', 'reserved'] },
  { id: 'dense', words: ['dense', 'density'] },
  { id: 'fog', words: ['fog', 'foggy'] },
  { id: 'mechanism', words: ['mechanism', 'mechanical', 'mechanically', 'mechanise'] },
  { id: 'inspect', words: ['inspect', 'inspection', 'inspector'] },
  { id: 'depart', words: ['depart', 'departure'] },
  { id: 'inconvenience', words: ['inconvenience', 'inconvenient'] },
  { id: 'patient', words: ['patient', 'patience', 'impatient', 'impatiently'] },
  { id: 'calibrate', words: ['calibrate', 'calibration'] },
  { id: 'probe', words: ['probe', 'probes', 'probing'] },
  { id: 'drift', words: ['drift', 'drifting'] },
  { id: 'technician', words: ['technician', 'technology', 'technological'] },
  { id: 'rack', words: ['rack', 'racks'] },
  { id: 'blink', words: ['blink', 'blinking'] },
  { id: 'refurbish', words: ['refurbish', 'refurbishment'] },
  { id: 'warranty', words: ['warranty', 'warrant'] },
  { id: 'badge', words: ['badge', 'badges'] },
  { id: 'quantity', words: ['quantity', 'quantify', 'quantitative'] },
  { id: 'receive', words: ['receive', 'receipt', 'receiver', 'reception'] },
  { id: 'crack', words: ['crack', 'cracked', 'cracking'] },
  { id: 'separate', words: ['separate', 'separation', 'separator'] },
  { id: 'rodent', words: ['rodent', 'rodents'] },
  { id: 'predator', words: ['predator', 'predatory', 'predation'] },
  { id: 'fate', words: ['fate', 'fatal', 'fatally', 'fatality', 'fatalism'] },
  { id: 'accident', words: ['accident', 'accidental', 'accidentally'] },
  { id: 'occur', words: ['occur', 'occurrence', 'occurring'] },
  { id: 'alight', words: ['alight', 'alighting'] },
  { id: 'regard', words: ['regard', 'regarding', 'regardless'] },
  { id: 'planet', words: ['planet', 'planetary'] },
  { id: 'electrocute', words: ['electrocute', 'electrocuted', 'electrocution'] },
  { id: 'particular', words: ['particular', 'particularly'] },
  { id: 'poison', words: ['poison', 'poisonous', 'poisoned'] },
  { id: 'prevent', words: ['prevent', 'prevention', 'preventive'] },
  { id: 'settle', words: ['settle', 'settling', 'settlement'] },
  { id: 'vegetation', words: ['vegetation', 'vegetative'] },
  { id: 'productive', words: ['productive', 'productivity', 'counterproductive', 'produce', 'production'] },
  { id: 'effort', words: ['effort', 'effortless'] },
  { id: 'frighten', words: ['frighten', 'frightened', 'frightening'] },
  { id: 'breed', words: ['breed', 'breeding'] },
  { id: 'vulnerable', words: ['vulnerable', 'vulnerability'] },
  { id: 'encourage', words: ['encourage', 'encouragement', 'encouraging'] },
  { id: 'seize', words: ['seize', 'seizure'] },
  { id: 'combine', words: ['combine', 'combination'] },
  { id: 'include', words: ['include', 'inclusive', 'inclusion'] },
  { id: 'simple', words: ['simple', 'simply', 'simplify', 'simplicity'] },
  { id: 'access', words: ['access', 'accessible', 'accessibility'] },
  { id: 'quite', words: ['quite'] },
  { id: 'common', words: ['common', 'commonly', 'uncommon', 'commonality'] },
  { id: 'adjust', words: ['adjust', 'adjusted', 'adjustment'] },
  { id: 'count', words: ['count', 'countless', 'counter'] },
  { id: 'move', words: ['move', 'movement'] },
  { id: 'hygiene', words: ['hygiene', 'hygienic'] },
  { id: 'dexterity', words: ['dexterity', 'dexterous'] },
  { id: 'critic', words: ['critic', 'criticize', 'criticism', 'critical', 'critically'] },
  { id: 'inexplicable', words: ['inexplicable', 'inexplicably'] },
  { id: 'pregnant', words: ['pregnant', 'pregnancy'] },
  { id: 'metabolism', words: ['metabolism', 'metabolic'] },
  { id: 'dominate', words: ['dominate', 'dominant', 'domination', 'dominance'] },
  { id: 'agenda', words: ['agenda', 'agendas'] },
  { id: 'straightforward', words: ['straightforward'] },
  { id: 'invade', words: ['invade', 'invasive', 'invasion'] },
  { id: 'scheme', words: ['scheme', 'schemes'] },
  { id: 'resilient', words: ['resilient', 'resilience'] },
  { id: 'essential', words: ['essential', 'essentially', 'essence'] },
  { id: 'intervene', words: ['intervene', 'intervention'] },
  { id: 'spread', words: ['spread', 'spreading'] },
  { id: 'triumph', words: ['triumph', 'triumphs', 'triumphant'] },
  { id: 'shake', words: ['shake', 'shaky', 'unshakable'] },
  { id: 'virtue', words: ['virtue', 'virtuous'] },
  { id: 'destroy', words: ['destroy', 'destructive', 'destruction'] },
  { id: 'conscious', words: ['conscious', 'consciousness', 'unconscious'] },
  { id: 'external', words: ['external', 'externally'] },
  { id: 'caution', words: ['caution', 'cautious'] },
  { id: 'desire', words: ['desire', 'desirable'] }
];

const DIR = path.join(__dirname, '..', 'packages', 'shell', 'public', 'seed-vocabulary');
const norm = (s) => String(s || '').trim().toLowerCase();

// word -> [{file, topicId, pos, familyId, familyOrder}]
const index = new Map();
for (const f of fs.readdirSync(DIR).filter((f) => f.endsWith('.json'))) {
  let data;
  try { data = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')); } catch { continue; }
  const topicId = data?._meta?.topicId || f.replace(/\.json$/, '');
  for (const c of (data.cards || [])) {
    const fv = c.fieldValues || {};
    const w = norm(fv.word);
    if (!w) continue;
    if (!index.has(w)) index.set(w, []);
    index.get(w).push({
      file: f, topicId,
      pos: fv.partOfSpeech || '',
      familyId: fv.familyId || '',
      familyOrder: fv.familyOrder ?? null
    });
  }
}

let totalExisting = 0, totalMissing = 0;
const missingLines = [];
const existingLines = [];
const familyCollision = [];

for (const fam of FAMILIES) {
  const hits = [];
  const misses = [];
  for (const w of fam.words) {
    const h = index.get(norm(w));
    if (h) { hits.push({ w, h }); totalExisting++; }
    else { misses.push(w); totalMissing++; }
  }
  const famIds = new Set([...hits.flatMap(({ h }) => h.map((x) => x.familyId)).filter(Boolean)]);
  console.log(`\n▶ [${fam.id}]  có=${hits.length}  thiếu=${misses.length}`);
  for (const { w, h } of hits) {
    console.log(`    ✔ ${w.padEnd(18)} @${h.map((x) => `${x.topicId}/${x.pos || '-'} fam=${x.familyId || '(trống)'}#${x.familyOrder ?? '-'}`).join(' , ')}`);
  }
  if (misses.length) console.log(`    ✚ mới: ${misses.join(', ')}`);
  if (famIds.size > 1) familyCollision.push(`    ! ${fam.id}: các dạng đã tồn tại thuộc NHIỀU familyId khác nhau → ${[...famIds].join(' | ')}`);
}

console.log('\n' + '='.repeat(70));
console.log(`TỔNG: từ đã có = ${totalExisting}, từ cần thêm mới = ${totalMissing}`);
if (familyCollision.length) {
  console.log('\n=== XUNG ĐỘT FAMILY (cần thống nhất familyId khi patch) ===');
  familyCollision.forEach((l) => console.log(l));
}
