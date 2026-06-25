#!/usr/bin/env node
/**
 * Cập nhật seed files: xóa các từ trùng lặp dựa trên kết quả audit.
 * Cũng cập nhật totalCards trong _meta.
 *
 * Chạy: node scripts/remove-duplicates-from-seeds.js
 */

const fs = require('fs');
const path = require('path');

const SEED_DIR = path.join(__dirname, '..', 'packages', 'shell', 'public', 'seed-vocabulary');
const AUDIT_FILE = path.join(__dirname, '..', 'docs', 'audit-duplicates-result.json');

// Homonyms to KEEP (same as in delete-cross-topic-duplicates.js)
const HOMONYM_EXCLUSIONS = [
  { word: 'function', partOfSpeech: 'noun', topics: ['mathematics', 'information-technology'] },
  { word: 'product', partOfSpeech: 'noun', topics: ['mathematics', 'chemistry'] },
  { word: 'virus', partOfSpeech: 'noun', topics: ['health', 'information-technology'] },
  { word: 'matter', partOfSpeech: 'noun', topics: ['physics', 'chemistry'] },
];

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

function isExcluded(word, partOfSpeech, deleteFromTopic, keepInTopic) {
  return HOMONYM_EXCLUSIONS.some(exc => {
    if (exc.word !== word || exc.partOfSpeech !== partOfSpeech) return false;
    return exc.topics.includes(deleteFromTopic) && exc.topics.includes(keepInTopic);
  });
}

function loadAuditResult() {
  const data = JSON.parse(fs.readFileSync(AUDIT_FILE, 'utf8'));
  return data.duplicates || [];
}

function buildDeleteMap(duplicates) {
  // Map: topicId -> Set of "word|partOfSpeech" to delete
  const map = new Map();

  for (const dup of duplicates) {
    const word = normalize(dup.word);
    const pos = normalize(dup.partOfSpeech);
    const keepTopic = normalize(dup.keepInTopic);

    for (const topic of dup.deleteFromTopics) {
      const deleteTopic = normalize(topic);
      if (isExcluded(word, pos, deleteTopic, keepTopic)) continue;

      if (!map.has(deleteTopic)) map.set(deleteTopic, new Set());
      map.get(deleteTopic).add(`${word}|${pos}`);
    }
  }

  return map;
}

function processFile(filePath, deleteSet) {
  if (!fs.existsSync(filePath)) return { removed: 0, exists: false };

  const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const originalCount = (content.cards || []).length;

  content.cards = (content.cards || []).filter(card => {
    const fv = card.fieldValues || {};
    const word = normalize(fv.word);
    const pos = normalize(fv.partOfSpeech);
    const key = `${word}|${pos}`;
    return !deleteSet.has(key);
  });

  const removed = originalCount - content.cards.length;

  // Update totalCards in _meta
  if (content._meta && content._meta.totalCards) {
    content._meta.totalCards = content.cards.length;
  }

  // Update familyOrder for remaining cards in affected families
  // Group by familyId and re-number
  const familyGroups = new Map();
  content.cards.forEach((card, idx) => {
    const fv = card.fieldValues || {};
    if (fv.familyId) {
      if (!familyGroups.has(fv.familyId)) familyGroups.set(fv.familyId, []);
      familyGroups.get(fv.familyId).push(idx);
    }
  });

  for (const [familyId, indices] of familyGroups) {
    indices.forEach((cardIdx, orderIdx) => {
      content.cards[cardIdx].fieldValues.familyOrder = orderIdx + 1;
    });
  }

  // Also update totalFamilies if present
  if (content._meta && content._meta.totalFamilies !== undefined) {
    content._meta.totalFamilies = familyGroups.size;
  }

  fs.writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n');
  return { removed, exists: true };
}

// Main
const duplicates = loadAuditResult();
const deleteMap = buildDeleteMap(duplicates);

console.log('='.repeat(70));
console.log('🧹 XÓA TỪ TRÙNG LẶP KHỎI SEED FILES');
console.log('='.repeat(70));
console.log(`\nTopics cần xử lý: ${deleteMap.size}`);

let totalRemoved = 0;

for (const [topicId, deleteSet] of [...deleteMap.entries()].sort()) {
  const publicFile = path.join(SEED_DIR, `${topicId}.json`);

  const publicResult = processFile(publicFile, deleteSet);

  const removed = publicResult.removed;
  totalRemoved += removed;

  console.log(`\n  📁 ${topicId}: xóa ${removed} từ`);
  deleteSet.forEach(key => {
    const [word, pos] = key.split('|');
    console.log(`    - ${word} (${pos})`);
  });

  if (publicResult.exists) console.log(`    ✓ packages/shell/public/seed-vocabulary/${topicId}.json`);
}

console.log('\n' + '='.repeat(70));
console.log(`📊 Tổng: xóa ${totalRemoved} từ trùng lặp khỏi ${deleteMap.size} seed files`);
console.log('='.repeat(70));
