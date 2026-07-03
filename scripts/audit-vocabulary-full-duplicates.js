#!/usr/bin/env node
/**
 * Thống kê trùng lặp từ vựng TOÀN DIỆN trên tất cả topic trong
 * packages/shell/public/seed-vocabulary/.
 *
 * Báo cáo 3 nhóm:
 *   1) Trùng lặp TRONG cùng một topic (word + partOfSpeech giống nhau)
 *   2) Trùng lặp GIỮA các topic khác nhau (word + partOfSpeech giống nhau,
 *      xuất hiện ở >1 topic)
 *   3) Từ viết GIỐNG 100% nhưng KHÁC loại từ (cùng word, khác partOfSpeech)
 *
 * Chạy: node scripts/audit-vocabulary-full-duplicates.js
 */

const fs = require('fs');
const path = require('path');

const SEED_DIR = path.join(__dirname, '..', 'packages', 'shell', 'public', 'seed-vocabulary');

function loadAllSeedFiles() {
  const files = fs
    .readdirSync(SEED_DIR)
    .filter((f) => f.endsWith('.json') && !f.includes('backup'));

  const allCards = [];
  const topicMeta = new Map(); // topicId -> { file, count, name }

  for (const file of files) {
    const filePath = path.join(SEED_DIR, file);
    try {
      const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const topicId = content._meta?.topicId || file.replace('.json', '');
      const topicName = content._meta?.topicName || topicId;
      const cards = content.cards || [];

      topicMeta.set(topicId, { file, count: cards.length, name: topicName });

      cards.forEach((card, index) => {
        const fv = card.fieldValues || {};
        allCards.push({
          word: (fv.word || '').trim().toLowerCase(),
          wordRaw: (fv.word || '').trim(),
          partOfSpeech: (fv.partOfSpeech || '').trim().toLowerCase(),
          meaning: (fv.meaning || '').trim(),
          topicId,
          file,
          index,
        });
      });
    } catch (e) {
      console.error(`Lỗi đọc ${file}:`, e.message);
    }
  }

  return { allCards, topicMeta };
}

// ============================================================
// PHẦN 1: Trùng lặp TRONG cùng một topic
// ============================================================
function findIntraTopicDuplicates(allCards) {
  // key = topicId | word | partOfSpeech
  const groups = new Map();
  for (const c of allCards) {
    if (!c.word) continue;
    const key = `${c.topicId}|${c.word}|${c.partOfSpeech}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(c);
  }

  const dups = [];
  for (const [key, cards] of groups) {
    if (cards.length > 1) {
      const [topicId, word, pos] = key.split('|');
      dups.push({ topicId, word, partOfSpeech: pos, count: cards.length, cards });
    }
  }

  return dups.sort(
    (a, b) => a.topicId.localeCompare(b.topicId) || a.word.localeCompare(b.word)
  );
}

// ============================================================
// PHẦN 2: Trùng lặp GIỮA các topic (cùng word + partOfSpeech)
// ============================================================
function findCrossTopicDuplicates(allCards) {
  // key = word | partOfSpeech
  const groups = new Map();
  for (const c of allCards) {
    if (!c.word) continue;
    const key = `${c.word}|${c.partOfSpeech}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(c);
  }

  const dups = [];
  for (const [key, cards] of groups) {
    const topics = [...new Set(cards.map((c) => c.topicId))];
    if (topics.length > 1) {
      const [word, pos] = key.split('|');
      dups.push({ word, partOfSpeech: pos, topics, cards });
    }
  }

  return dups.sort(
    (a, b) => b.topics.length - a.topics.length || a.word.localeCompare(b.word)
  );
}

// ============================================================
// PHẦN 3: Cùng word, KHÁC partOfSpeech (homograph / phân loại khác nhau)
// ============================================================
function findSameWordDifferentPos(allCards) {
  // group by word only
  const groups = new Map();
  for (const c of allCards) {
    if (!c.word) continue;
    if (!groups.has(c.word)) groups.set(c.word, []);
    groups.get(c.word).push(c);
  }

  const results = [];
  for (const [word, cards] of groups) {
    const posSet = [...new Set(cards.map((c) => c.partOfSpeech).filter(Boolean))];
    if (posSet.length > 1) {
      // Group cards by partOfSpeech to show where each variant lives
      const byPos = new Map();
      for (const c of cards) {
        if (!byPos.has(c.partOfSpeech)) byPos.set(c.partOfSpeech, []);
        byPos.get(c.partOfSpeech).push(c);
      }
      results.push({ word, posList: posSet, byPos, cards });
    }
  }

  return results.sort(
    (a, b) => b.posList.length - a.posList.length || a.word.localeCompare(b.word)
  );
}

// ============================================================
// Main
// ============================================================
const { allCards, topicMeta } = loadAllSeedFiles();

const lines = [];
const log = (s = '') => {
  lines.push(s);
  console.log(s);
};

log('='.repeat(72));
log('📊 THỐNG KÊ TRÙNG LẶP TỪ VỰNG TOÀN DIỆN');
log('='.repeat(72));
log(`Tổng số topic: ${topicMeta.size}`);
log(`Tổng số thẻ:   ${allCards.length}`);
log('');

// ---- PHẦN 1 ----
log('='.repeat(72));
log('📋 PHẦN 1: TRÙNG LẶP TRONG CÙNG MỘT TOPIC');
log('   (cùng topic + cùng word + cùng loại từ, xuất hiện >1 lần)');
log('='.repeat(72));

const intra = findIntraTopicDuplicates(allCards);
if (intra.length === 0) {
  log('\n✅ Không có từ nào bị trùng trong nội bộ topic.');
} else {
  log(`\n⚠️  Tìm thấy ${intra.length} trường hợp trùng trong nội bộ topic:\n`);
  let cur = null;
  for (const d of intra) {
    if (d.topicId !== cur) {
      cur = d.topicId;
      log(`  ▸ Topic "${d.topicId}" (${topicMeta.get(d.topicId)?.name || ''}):`);
    }
    log(`      - "${d.word}" (${d.partOfSpeech || 'không rõ'}) × ${d.count} lần`);
  }
}

// ---- PHẦN 2 ----
log('\n\n' + '='.repeat(72));
log('📋 PHẦN 2: TRÙNG LẶP GIỮA CÁC TOPIC KHÁC NHAU');
log('   (cùng word + cùng loại từ, xuất hiện ở nhiều topic)');
log('='.repeat(72));

const cross = findCrossTopicDuplicates(allCards);
if (cross.length === 0) {
  log('\n✅ Không có từ nào trùng giữa các topic.');
} else {
  log(`\n⚠️  Tìm thấy ${cross.length} từ xuất hiện ở nhiều topic:\n`);
  for (const d of cross) {
    log(`  "${d.wordRaw || d.word}" (${d.partOfSpeech || 'không rõ'}) — ${d.topics.length} topic:`);
    log(`      ${d.topics.join(', ')}`);
  }
}

// ---- PHẦN 3 ----
log('\n\n' + '='.repeat(72));
log('📋 PHẦN 3: CÙNG CÁCH VIẾT (100%) NHƯNG KHÁC LOẠI TỪ');
log('   (homograph: cùng word, khác partOfSpeech)');
log('='.repeat(72));

const homographs = findSameWordDifferentPos(allCards);
if (homographs.length === 0) {
  log('\n✅ Không có từ nào cùng cách viết nhưng khác loại từ.');
} else {
  log(`\n⚠️  Tìm thấy ${homographs.length} từ có nhiều loại từ khác nhau:\n`);
  for (const h of homographs) {
    log(`  "${h.word}" — các loại từ: ${h.posList.join(', ')}`);
    for (const [pos, cards] of h.byPos) {
      const locations = cards.map((c) => c.topicId).join(', ');
      log(`      • ${pos || 'không rõ'}: ${locations}`);
    }
  }
}

// ---- TÓM TẮT ----
log('\n\n' + '='.repeat(72));
log('📊 TÓM TẮT');
log('='.repeat(72));
log(`  Tổng topic:                                  ${topicMeta.size}`);
log(`  Tổng thẻ:                                    ${allCards.length}`);
log(`  Trùng trong nội bộ topic:                    ${intra.length}`);
log(`  Trùng giữa các topic:                        ${cross.length}`);
log(`  Cùng cách viết khác loại từ (homograph):     ${homographs.length}`);

// ---- Xuất báo cáo ----
const jsonOut = {
  generatedAt: new Date().toISOString(),
  totalTopics: topicMeta.size,
  totalCards: allCards.length,
  intraTopicDuplicates: intra.map((d) => ({
    topicId: d.topicId,
    word: d.word,
    partOfSpeech: d.partOfSpeech,
    count: d.count,
  })),
  crossTopicDuplicates: cross.map((d) => ({
    word: d.word,
    partOfSpeech: d.partOfSpeech,
    topics: d.topics,
  })),
  sameWordDifferentPos: homographs.map((h) => ({
    word: h.word,
    partsOfSpeech: h.posList,
    locations: [...h.byPos.entries()].map(([pos, cards]) => ({
      partOfSpeech: pos,
      topics: cards.map((c) => c.topicId),
    })),
  })),
};

const jsonPath = path.join(__dirname, '..', 'docs', 'audit-full-duplicates-result.json');
fs.writeFileSync(jsonPath, JSON.stringify(jsonOut, null, 2), 'utf8');
log(`\n📁 Báo cáo JSON: docs/audit-full-duplicates-result.json`);

const txtPath = path.join(__dirname, '..', 'docs', 'audit-full-duplicates-report.txt');
fs.writeFileSync(txtPath, lines.join('\n'), 'utf8');
log(`📁 Báo cáo văn bản: docs/audit-full-duplicates-report.txt`);
