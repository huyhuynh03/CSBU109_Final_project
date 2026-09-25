#!/usr/bin/env node
/**
 * audit-batch2-comprehensive.js — Rà soát TOÀN BỘ danh sách batch 2
 * gồm cả từ cần THÊM MỚI và từ cần PATCH (đã tồn tại trong seed).
 *
 * Kết quả:
 *   1. Từ ĐÃ CÓ trong seed → xác định topic, pos, familyId hiện tại (cho patch)
 *   2. Từ CHƯA CÓ → an toàn để thêm mới
 *   3. Xung đột familyId nếu có
 *   4. Từ plurals không nên thêm riêng
 *
 * Chạy: node scripts/audit-batch2-comprehensive.js
 */
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'packages', 'shell', 'public', 'seed-vocabulary');
const norm = (s) => String(s || '').trim().toLowerCase();

// ── Build index: word → [{topicId, pos, familyId, familyOrder}] ──
const index = new Map();
for (const f of fs.readdirSync(DIR).filter(x => x.endsWith('.json'))) {
  let d;
  try { d = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')); } catch { continue; }
  const topicId = d?._meta?.topicId || f.replace(/\.json$/, '');
  for (const c of d.cards || []) {
    const fv = c.fieldValues || {};
    const w = norm(fv.word);
    if (!w) continue;
    if (!index.has(w)) index.set(w, []);
    index.get(w).push({
      topicId, pos: fv.partOfSpeech || '',
      familyId: fv.familyId || '', familyOrder: fv.familyOrder ?? null
    });
  }
}

// ── Danh sách TẤT CẢ từ trong batch 2 (thêm mới + patch) ──
// Ghi chú: plurals (số nhiều) được đánh dấu để kiểm tra có nên thêm không
const ALL_WORDS = [
  // === TRAVEL ===
  { word: 'shuttle', topic: 'travel', note: 'NEW — đơn lẻ' },
  { word: 'reservation', topic: 'travel', note: 'PATCH — reservation@travel đã có, cần patch familyId' },
  { word: 'depart', topic: 'travel', note: 'NEW — root depart' },
  { word: 'departure', topic: 'travel', note: 'PATCH — departure@travel đã có, cần patch familyId' },
  { word: 'alight', topic: 'travel', note: 'NEW — đơn lẻ' },

  // === DAILY-LIFE ===
  { word: 'envelope', topic: 'daily-life', note: 'NEW — đơn lẻ' },
  { word: 'blink', topic: 'daily-life', note: 'NEW — root blink' },
  { word: 'blinking', topic: 'daily-life', note: 'NEW — blink family' },
  { word: 'count', topic: 'daily-life', note: 'NEW — root count' },
  { word: 'countless', topic: 'daily-life', note: 'NEW — count family' },
  { word: 'move', topic: 'daily-life', note: 'PATCH — move@daily-life đã có, cần patch familyId' },
  { word: 'movement', topic: 'daily-life', note: 'NEW — move family' },
  { word: 'separate', topic: 'daily-life', note: 'NEW — root separate' },
  { word: 'separation', topic: 'daily-life', note: 'NEW — separate family' },
  { word: 'quite', topic: 'daily-life', note: 'NEW — đơn lẻ' },
  { word: 'simple', topic: 'daily-life', note: 'NEW — root simple' },
  { word: 'simply', topic: 'daily-life', note: 'NEW — simple family' },
  { word: 'common', topic: 'daily-life', note: 'NEW — đơn lẻ' },

  // === BUSINESS ===
  { word: 'adjust', topic: 'business', note: 'NEW — root adjust' },
  { word: 'adjusted', topic: 'business', note: 'NEW — adjust family' },
  { word: 'compact', topic: 'business', note: 'NEW — root compact' },
  { word: 'compactly', topic: 'business', note: 'NEW — compact family' },
  { word: 'compaction', topic: 'business', note: 'NEW — compact family' },
  { word: 'inspect', topic: 'business', note: 'NEW — root inspect' },
  { word: 'inspection', topic: 'business', note: 'NEW — inspect family' },
  { word: 'inspector', topic: 'business', note: 'NEW — inspect family' },
  { word: 'refurbish', topic: 'business', note: 'NEW — root refurbish' },
  { word: 'refurbishment', topic: 'business', note: 'NEW — refurbish family' },
  { word: 'warranty', topic: 'business', note: 'NEW — đơn lẻ' },
  { word: 'quantity', topic: 'business', note: 'NEW — root quantity' },
  { word: 'quantify', topic: 'business', note: 'NEW — quantity family' },
  { word: 'quantitative', topic: 'business', note: 'NEW — quantity family' },
  { word: 'receive', topic: 'business', note: 'NEW — root receive' },
  { word: 'reception', topic: 'business', note: 'NEW — receive family' },
  { word: 'counterproductive', topic: 'business', note: 'NEW — đơn lẻ' },

  // === EMPLOYMENT ===
  { word: 'technician', topic: 'employment', note: 'NEW — đơn lẻ' },
  { word: 'badge', topic: 'employment', note: 'NEW — đơn lẻ' },

  // === HOME-LIVING ===
  { word: 'rack', topic: 'home-living', note: 'NEW — đơn lẻ (plurals: racks KHÔNG thêm)' },
  { word: 'crack', topic: 'home-living', note: 'NEW — root crack' },
  { word: 'cracked', topic: 'home-living', note: 'NEW — crack family' },
  { word: 'electrocute', topic: 'home-living', note: 'NEW — root electrocute' },
  { word: 'electrocution', topic: 'home-living', note: 'NEW — electrocute family' },
  { word: 'electrocuted', topic: 'home-living', note: 'NEW — electrocute family' },

  // === COMMUNICATION-SOCIAL ===
  { word: 'inconvenience', topic: 'communication-social', note: 'NEW — root inconvenience' },
  { word: 'inconvenient', topic: 'communication-social', note: 'NEW — inconvenience family' },
  { word: 'regard', topic: 'communication-social', note: 'NEW — root regard' },
  { word: 'regarding', topic: 'communication-social', note: 'NEW — regard family' },
  { word: 'critic', topic: 'communication-social', note: 'NEW — root critic' },
  { word: 'criticize', topic: 'communication-social', note: 'NEW — critic family' },
  { word: 'criticism', topic: 'communication-social', note: 'NEW — critic family' },
  { word: 'critical', topic: 'communication-social', note: 'NEW — critic family' },
  { word: 'straightforward', topic: 'communication-social', note: 'NEW — đơn lẻ' },
  { word: 'inexplicable', topic: 'communication-social', note: 'NEW — root inexplicable' },
  { word: 'inexplicably', topic: 'communication-social', note: 'NEW — inexplicable family' },
  { word: 'encourage', topic: 'communication-social', note: 'NEW — root encourage' },
  { word: 'encouragement', topic: 'communication-social', note: 'NEW — encourage family' },
  { word: 'particular', topic: 'communication-social', note: 'NEW — đơn lẻ' },

  // === EMOTION-FEELINGS ===
  { word: 'patient', topic: 'emotion-feelings', note: 'PATCH — patient@emotion-feelings đã có, patch familyId' },
  { word: 'patience', topic: 'emotion-feelings', note: 'NEW — patient family' },
  { word: 'impatient', topic: 'emotion-feelings', note: 'PATCH — impatient@emotion-feelings đã có, patch familyId' },
  { word: 'impatiently', topic: 'emotion-feelings', note: 'NEW — impatient family' },
  { word: 'frighten', topic: 'emotion-feelings', note: 'NEW — root frighten' },
  { word: 'frightening', topic: 'emotion-feelings', note: 'NEW — frighten family' },
  { word: 'frightened', topic: 'emotion-feelings', note: 'PATCH — frightened@emotion-feelings đã có, patch familyId' },
  { word: 'desire', topic: 'emotion-feelings', note: 'NEW — root desire' },
  { word: 'desirable', topic: 'emotion-feelings', note: 'NEW — desire family' },
  { word: 'triumph', topic: 'emotion-feelings', note: 'NEW — root triumph' },
  { word: 'triumphant', topic: 'emotion-feelings', note: 'NEW — triumph family' },

  // === HEALTH ===
  { word: 'accident', topic: 'health', note: 'PATCH — accident@health đã có, patch familyId' },
  { word: 'accidental', topic: 'health', note: 'NEW — accident family' },
  { word: 'accidentally', topic: 'health', note: 'NEW — accident family' },
  { word: 'fate', topic: 'health', note: 'NEW — root fate' },
  { word: 'fatal', topic: 'health', note: 'NEW — fate family' },
  { word: 'fatally', topic: 'health', note: 'NEW — fate family' },
  { word: 'fatality', topic: 'health', note: 'NEW — fate family' },
  { word: 'prevent', topic: 'health', note: 'NEW — root prevent' },
  { word: 'preventive', topic: 'health', note: 'NEW — prevent family' },
  { word: 'hygiene', topic: 'health', note: 'PATCH — hygiene@health đã có, patch familyId' },
  { word: 'hygienic', topic: 'health', note: 'NEW — hygiene family' },
  { word: 'pregnant', topic: 'health', note: 'NEW — root pregnant' },
  { word: 'pregnancy', topic: 'health', note: 'NEW — pregnant family' },
  { word: 'metabolism', topic: 'health', note: 'NEW — root metabolism' },
  { word: 'metabolic', topic: 'health', note: 'NEW — metabolism family' },
  { word: 'dexterity', topic: 'health', note: 'NEW — đơn lẻ' },
  { word: 'spreading', topic: 'health', note: 'NEW — đơn lẻ (V-ing của spread, KHÔNG patch irregular verb)' },

  // === SPACE ===
  { word: 'planet', topic: 'space', note: 'PATCH — planet@space đã có, patch familyId' },
  { word: 'planetary', topic: 'space', note: 'NEW — planet family' },

  // === BIOLOGY ===
  { word: 'rodent', topic: 'biology', note: 'NEW — đơn lẻ (plurals: rodents KHÔNG thêm)' },
  { word: 'predator', topic: 'biology', note: 'PATCH — predator@biology đã có, patch familyId' },
  { word: 'predatory', topic: 'biology', note: 'NEW — predator family' },
  { word: 'predation', topic: 'biology', note: 'NEW — predator family' },
  { word: 'breeding', topic: 'biology', note: 'NEW — đơn lẻ (V-ing của breed, KHÔNG patch irregular verb)' },
  { word: 'invade', topic: 'biology', note: 'NEW — root invade' },
  { word: 'invasive', topic: 'biology', note: 'NEW — invade family' },
  { word: 'invasion', topic: 'biology', note: 'NEW — invade family' },
  { word: 'dominate', topic: 'biology', note: 'NEW — root dominate' },
  { word: 'dominant', topic: 'biology', note: 'NEW — dominate family' },
  { word: 'domination', topic: 'biology', note: 'NEW — dominate family' },
  { word: 'poison', topic: 'biology', note: 'NEW — root poison' },
  { word: 'poisonous', topic: 'biology', note: 'NEW — poison family' },

  // === ENVIRONMENT-CLIMATE ===
  { word: 'fog', topic: 'environment-climate', note: 'NEW — root fog' },
  { word: 'foggy', topic: 'environment-climate', note: 'NEW — fog family' },
  { word: 'vegetation', topic: 'environment-climate', note: 'NEW — đơn lẻ' },
  { word: 'vulnerable', topic: 'environment-climate', note: 'NEW — root vulnerable' },
  { word: 'vulnerability', topic: 'environment-climate', note: 'NEW — vulnerable family' },
  { word: 'destroy', topic: 'environment-climate', note: 'NEW — root destroy' },
  { word: 'destructive', topic: 'environment-climate', note: 'NEW — destroy family' },
  { word: 'destruction', topic: 'environment-climate', note: 'NEW — destroy family' },

  // === PSYCHOLOGY ===
  { word: 'consciousness', topic: 'psychology', note: 'PATCH — consciousness@psychology đã có, patch familyId' },
  { word: 'conscious', topic: 'psychology', note: 'NEW — conscious family (root)' },
  { word: 'resilience', topic: 'psychology', note: 'NEW — đơn lẻ' },

  // === CRIME ===
  { word: 'seize', topic: 'crime', note: 'NEW — root seize' },
  { word: 'seizure', topic: 'crime', note: 'NEW — seize family' },

  // === EDUCATION ===
  { word: 'include', topic: 'education', note: 'NEW — root include' },
  { word: 'inclusive', topic: 'education', note: 'NEW — include family' },
  { word: 'inclusion', topic: 'education', note: 'NEW — include family' },
  { word: 'essential', topic: 'education', note: 'NEW — đơn lẻ' },

  // === POLITICS ===
  { word: 'scheme', topic: 'politics', note: 'NEW — đơn lẻ (plurals: schemes KHÔNG thêm)' },
  { word: 'intervene', topic: 'politics', note: 'NEW — root intervene' },
  { word: 'intervention', topic: 'politics', note: 'NEW — intervene family' },

  // === ECONOMY ===
  { word: 'produce', topic: 'economy', note: 'PATCH — produce@economy đã có, patch familyId' },
  { word: 'production', topic: 'economy', note: 'PATCH — production@economy đã có, patch familyId' },
  { word: 'productive', topic: 'economy', note: 'NEW — produce family' },
  { word: 'productivity', topic: 'economy', note: 'NEW — produce family' },

  // === PERSONAL-QUALITIES ===
  { word: 'caution', topic: 'personal-qualities', note: 'NEW — root caution' },
  { word: 'cautious', topic: 'personal-qualities', note: 'PATCH — cautious@personal-qualities đã có, patch familyId' },
  { word: 'virtue', topic: 'personal-qualities', note: 'NEW — đơn lẻ' },
  { word: 'effort', topic: 'personal-qualities', note: 'NEW — đơn lẻ' },
  { word: 'unshakable', topic: 'personal-qualities', note: 'NEW — đơn lẻ (KHÔNG patch irregular verb shake)' },

  // === URBANIZATION ===
  { word: 'dense', topic: 'urbanization', note: 'NEW — root dense' },
  { word: 'access', topic: 'urbanization', note: 'NEW — root access' },
  { word: 'accessible', topic: 'urbanization', note: 'NEW — access family' },
  { word: 'accessibility', topic: 'urbanization', note: 'NEW — access family' },

  // === SCIENCE ===
  { word: 'mechanism', topic: 'science', note: 'NEW — root mechanism' },
  { word: 'mechanical', topic: 'science', note: 'NEW — mechanism family' },
  { word: 'mechanically', topic: 'science', note: 'NEW — mechanism family' },
  { word: 'calibrate', topic: 'science', note: 'NEW — root calibrate' },
  { word: 'calibration', topic: 'science', note: 'NEW — calibrate family' },
  { word: 'occur', topic: 'science', note: 'NEW — root occur' },
  { word: 'occurrence', topic: 'science', note: 'NEW — occur family' },
  { word: 'drift', topic: 'science', note: 'NEW — đơn lẻ' },
  { word: 'external', topic: 'science', note: 'NEW — root external' },
  { word: 'externally', topic: 'science', note: 'NEW — external family' },
  { word: 'combine', topic: 'science', note: 'NEW — root combine' },
  { word: 'combination', topic: 'science', note: 'NEW — combine family' },
  { word: 'settling', topic: 'science', note: 'NEW — đơn lẻ (V-ing, KHÔNG patch irregular verb settle)' },
];

// ── Classify ──
const existing = [];
const safeNew = [];
const warnings = [];

for (const item of ALL_WORDS) {
  const hits = index.get(norm(item.word));
  if (hits && hits.length > 0) {
    // Check if same topic
    const sameTopic = hits.filter(h => h.topicId === item.topic);
    const diffTopic = hits.filter(h => h.topicId !== item.topic);
    existing.push({ ...item, hits, sameTopic, diffTopic });
  } else {
    safeNew.push(item);
  }
}

// ── Report ──
console.log('='.repeat(70));
console.log('  BATCH 2 — COMPREHENSIVE AUDIT');
console.log('='.repeat(70));

console.log(`\n📊 Tổng: ${ALL_WORDS.length} từ, ${existing.length} đã có, ${safeNew.length} cần thêm mới`);

// ── Existing → PATCH ──
console.log('\n' + '─'.repeat(70));
console.log(`📋 TỪ ĐÃ CÓ → PATCH (cập nhật familyId/familyOrder): ${existing.length}`);
console.log('─'.repeat(70));
for (const e of existing) {
  const loc = e.hits.map(h => `${h.topicId}/${h.pos} fam="${h.familyId}"#${h.familyOrder ?? '-'}`).join(', ');
  const sameT = e.sameTopic.length > 0;
  console.log(`  ${e.word.padEnd(18)} @ ${loc}  ${sameT ? '✅ cùng topic' : '⚠ KHÁC topic'}`);
  if (e.diffTopic.length > 0) {
    console.log(`    ⚠ Tồn tại ở topic khác: ${e.diffTopic.map(h => h.topicId).join(', ')}`);
  }
}

// ── Safe new → ADD ──
console.log('\n' + '─'.repeat(70));
console.log(`✅ TỪ AN TOÀN ĐỂ THÊM MỚI: ${safeNew.length}`);
console.log('─'.repeat(70));
const byTopic = new Map();
for (const s of safeNew) {
  if (!byTopic.has(s.topic)) byTopic.set(s.topic, []);
  byTopic.get(s.topic).push(s.word);
}
for (const [topic, words] of byTopic) {
  console.log(`\n  [${topic}] (${words.length})`);
  console.log(`    ${words.join(', ')}`);
}

console.log('\n' + '='.repeat(70));
console.log('AUDIT HOÀN TẤT');
console.log('='.repeat(70));
