#!/usr/bin/env node
/**
 * Phân tích toàn bộ seed vocabulary files để tìm từ trùng lặp THỰC SỰ
 * giữa các topic vocabulary thường (loại bỏ irregular verb/comparative/superlative topics).
 *
 * Chạy: node scripts/audit-vocabulary-duplicates-and-families.js
 */

const fs = require('fs');
const path = require('path');

const SEED_DIR = path.join(__dirname, '..', 'data', 'seed-vocabulary');

// Topics đặc biệt - KHÔNG tính là duplicate khi trùng với nhau hoặc với verb topics
const IRREGULAR_TOPICS = new Set([
  'irregular-verb-v2',
  'irregular-verb-v3',
  'irregular-comparative',
  'irregular-superlative'
]);

// Verb topics - có thể trùng base form với irregular verb topics (thiết kế có chủ đích)
const VERB_TOPICS = new Set([
  'verbs-attachment-connection',
  'verbs-basic-essential',
  'verbs-body-position',
  'verbs-change-transformation',
  'verbs-cleaning-maintenance',
  'verbs-clothing-appearance',
  'verbs-cognition-thinking',
  'verbs-communication',
  'verbs-creation-building',
  'verbs-cutting-breaking',
  'verbs-destruction-damage',
  'verbs-eating-drinking',
  'verbs-fighting-conflict',
  'verbs-movement-travel',
  'verbs-perception-senses',
  'verbs-physical-actions',
  'verbs-possession-transaction',
  'verbs-searching-finding',
  'verbs-sound-music',
  'verbs-spanning-covering'
]);

// Topic priority map - topic nào phù hợp nhất cho từ đó
// Higher number = higher priority (giữ lại)
const TOPIC_RELEVANCE = {
  // Emotion/personality words
  'emotion-feelings': 8,
  'personal-qualities': 7,
  'psychology': 9,
  // Daily life
  'daily-life': 7,
  'daily-activities': 6,
  'home-living': 6,
  // Food
  'food-drink': 8,
  // Health
  'health': 8,
  // Communication
  'communication-social': 7,
  // Family
  'family-relationships': 7,
  // Science
  'science': 7,
  'biology': 8,
  'chemistry': 8,
  'physics': 8,
  'mathematics': 8,
  'space': 8,
  // Tech
  'information-technology': 8,
  // Culture/Arts
  'culture': 7,
  'arts': 7,
  'literature-reading': 7,
  'media-entertainment': 7,
  // Education
  'education-intermediate': 6,
  // Sports/Travel
  'sports': 7,
  'travel': 7,
};

function loadAllSeedFiles() {
  const files = fs.readdirSync(SEED_DIR).filter(f => f.endsWith('.json') && !f.includes('backup'));
  const allCards = [];

  for (const file of files) {
    const filePath = path.join(SEED_DIR, file);
    try {
      const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const topicId = content._meta?.topicId || file.replace('.json', '');
      const cards = content.cards || [];

      cards.forEach((card, index) => {
        const fv = card.fieldValues || {};
        allCards.push({
          word: (fv.word || '').trim().toLowerCase(),
          partOfSpeech: (fv.partOfSpeech || '').trim().toLowerCase(),
          topicId,
          familyId: fv.familyId || null,
          familyOrder: fv.familyOrder || null,
          file,
          index,
          raw: fv
        });
      });
    } catch (e) {
      console.error(`Error reading ${file}:`, e.message);
    }
  }

  return allCards;
}

function isSpecialTopic(topicId) {
  return IRREGULAR_TOPICS.has(topicId) || VERB_TOPICS.has(topicId);
}

function findRealDuplicates(allCards) {
  // Only consider cards from "normal" vocabulary topics
  const normalCards = allCards.filter(c => !isSpecialTopic(c.topicId));

  // Group by word + partOfSpeech
  const groups = new Map();
  for (const card of normalCards) {
    if (!card.word) continue;
    const key = `${card.word}|${card.partOfSpeech}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(card);
  }

  // Filter to only those appearing in multiple topics
  const duplicates = [];
  for (const [key, cards] of groups) {
    const topics = new Set(cards.map(c => c.topicId));
    if (topics.size > 1) {
      duplicates.push({ key, cards, topics: [...topics] });
    }
  }

  return duplicates.sort((a, b) => a.key.localeCompare(b.key));
}

function suggestKeepTopic(cards) {
  // Pick the topic with highest relevance score
  let best = cards[0];
  let bestScore = TOPIC_RELEVANCE[best.topicId] || 5;

  for (const card of cards) {
    const score = TOPIC_RELEVANCE[card.topicId] || 5;
    // Prefer topic where the word has a familyId
    const familyBonus = card.familyId ? 1 : 0;
    if (score + familyBonus > bestScore + (best.familyId ? 1 : 0)) {
      best = card;
      bestScore = score;
    }
  }

  return best.topicId;
}

// Also check verb topics vs normal topics (verbs that appear in both)
function findVerbTopicDuplicates(allCards) {
  const verbCards = allCards.filter(c => VERB_TOPICS.has(c.topicId));
  const normalCards = allCards.filter(c => !isSpecialTopic(c.topicId));

  const normalMap = new Map();
  for (const card of normalCards) {
    if (!card.word) continue;
    const key = `${card.word}|${card.partOfSpeech}`;
    if (!normalMap.has(key)) normalMap.set(key, []);
    normalMap.get(key).push(card);
  }

  const duplicates = [];
  for (const card of verbCards) {
    if (!card.word) continue;
    const key = `${card.word}|${card.partOfSpeech}`;
    if (normalMap.has(key)) {
      duplicates.push({
        word: card.word,
        partOfSpeech: card.partOfSpeech,
        verbTopic: card.topicId,
        normalTopics: normalMap.get(key).map(c => c.topicId)
      });
    }
  }

  return duplicates;
}

// Main
const allCards = loadAllSeedFiles();
const normalTopicCount = new Set(allCards.filter(c => !isSpecialTopic(c.topicId)).map(c => c.topicId)).size;
console.log(`📊 Tổng: ${allCards.length} cards, ${new Set(allCards.map(c => c.topicId)).size} topics (${normalTopicCount} vocabulary topics)\n`);

// --- Part 1: Real Duplicates (between normal vocabulary topics) ---
console.log('='.repeat(70));
console.log('📋 PHẦN 1: TỪ TRÙNG LẶP GIỮA CÁC TOPIC VOCABULARY');
console.log('   (Loại bỏ irregular verb/comparative/superlative topics)');
console.log('='.repeat(70));

const duplicates = findRealDuplicates(allCards);

if (duplicates.length === 0) {
  console.log('\n✅ Không tìm thấy từ trùng lặp.');
} else {
  console.log(`\n⚠️  Tìm thấy ${duplicates.length} từ trùng lặp:\n`);

  // Group by suggested action
  const toDelete = [];

  for (const dup of duplicates) {
    const [word, pos] = dup.key.split('|');
    const keepTopic = suggestKeepTopic(dup.cards);

    console.log(`  "${word}" (${pos}) — ${dup.topics.length} topics:`);
    for (const card of dup.cards) {
      const marker = card.topicId === keepTopic ? '  ✓ GIỮ' : '  ✗ XÓA';
      const familyInfo = card.familyId ? ` [family: ${card.familyId}]` : '';
      console.log(`    ${marker}: ${card.topicId}${familyInfo}`);

      if (card.topicId !== keepTopic) {
        toDelete.push({ word, partOfSpeech: pos, topicId: card.topicId, familyId: card.familyId });
      }
    }
    console.log('');
  }

  // Summary table for deletion
  console.log('\n' + '-'.repeat(70));
  console.log('📝 DANH SÁCH XÓA (tóm tắt):');
  console.log('-'.repeat(70));

  // Group deletions by topic
  const byTopic = new Map();
  for (const item of toDelete) {
    if (!byTopic.has(item.topicId)) byTopic.set(item.topicId, []);
    byTopic.get(item.topicId).push(item);
  }

  for (const [topic, items] of [...byTopic.entries()].sort((a, b) => b[1].length - a[1].length)) {
    console.log(`\n  Topic "${topic}" — xóa ${items.length} từ:`);
    items.forEach(i => console.log(`    - ${i.word} (${i.partOfSpeech})`));
  }
}

// --- Part 2: Verb topics overlapping with normal topics ---
console.log('\n\n' + '='.repeat(70));
console.log('📋 PHẦN 2: VERB TOPICS TRÙNG VỚI VOCABULARY TOPICS');
console.log('   (Verbs xuất hiện ở cả verb topic lẫn vocabulary topic)');
console.log('='.repeat(70));

const verbDups = findVerbTopicDuplicates(allCards);
if (verbDups.length === 0) {
  console.log('\n✅ Không có verb nào trùng giữa verb topics và vocabulary topics.');
} else {
  console.log(`\n⚠️  ${verbDups.length} verbs xuất hiện ở cả verb topic lẫn vocabulary topic:`);
  console.log('   (Đây có thể là thiết kế có chủ đích - verb topics dạy cách dùng verb,');
  console.log('    vocabulary topics dạy từ trong ngữ cảnh topic)\n');

  for (const d of verbDups.slice(0, 20)) {
    console.log(`  "${d.word}" (${d.partOfSpeech}): verb-topic="${d.verbTopic}" + normal="${d.normalTopics.join(', ')}"`);
  }
  if (verbDups.length > 20) {
    console.log(`  ... và ${verbDups.length - 20} từ khác`);
  }
}

// --- Summary ---
console.log('\n\n' + '='.repeat(70));
console.log('📊 TÓM TẮT');
console.log('='.repeat(70));
console.log(`  Tổng cards: ${allCards.length}`);
console.log(`  Vocabulary topics: ${normalTopicCount}`);
console.log(`  Từ trùng lặp thực sự (giữa vocabulary topics): ${duplicates.length}`);
console.log(`  Verb topics trùng vocabulary topics: ${verbDups.length}`);

// Output JSON for automation
const outputPath = path.join(__dirname, '..', 'docs', 'audit-duplicates-result.json');
const result = {
  generatedAt: new Date().toISOString(),
  totalCards: allCards.length,
  duplicates: duplicates.map(d => {
    const [word, pos] = d.key.split('|');
    const keepTopic = suggestKeepTopic(d.cards);
    return {
      word,
      partOfSpeech: pos,
      keepInTopic: keepTopic,
      deleteFromTopics: d.cards.filter(c => c.topicId !== keepTopic).map(c => c.topicId)
    };
  })
};
fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
console.log(`\n📁 Kết quả JSON đã lưu: docs/audit-duplicates-result.json`);
