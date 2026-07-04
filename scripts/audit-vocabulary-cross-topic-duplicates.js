#!/usr/bin/env node
/**
 * Audit trùng lặp từ vựng trong trang từ vựng.
 *
 * Thống kê 3 loại:
 *  1. Trùng lặp TRONG cùng một topic (cùng word + cùng partOfSpeech).
 *  2. Trùng lặp NGOÀI topic (cùng word + cùng partOfSpeech xuất hiện ở >1 topic).
 *  3. Từ viết giống nhau 100% nhưng KHÁC phân loại từ (khác partOfSpeech),
 *     xét cả trong 1 topic lẫn liên topic.
 *
 * Nguồn dữ liệu: packages/shell/public/seed-vocabulary/*.json
 */

const fs = require('fs');
const path = require('path');

const SEED_DIR = path.join(__dirname, '..', 'packages', 'shell', 'public', 'seed-vocabulary');

// Các topic là biến thể dạng động từ/tính từ bất quy tắc.
// Việc một từ xuất hiện ở nhiều dạng (V1/V2/V3, comparative/superlative)
// là CỐ Ý, nên tách riêng để không gây nhiễu báo cáo.
const IRREGULAR_TOPICS = new Set([
  'irregular-verb-v1',
  'irregular-verb-v2',
  'irregular-verb-v3',
  'irregular-comparative',
  'irregular-superlative',
]);

function normalizeWord(w) {
  return String(w || '').trim().toLowerCase();
}

function normalizePos(p) {
  return String(p || '').trim().toLowerCase();
}

// Đọc toàn bộ card từ tất cả file JSON.
function loadAllCards() {
  const files = fs
    .readdirSync(SEED_DIR)
    .filter((f) => f.endsWith('.json'))
    .sort();

  const entries = []; // { file, topicId, word, wordRaw, pos, meaning }
  const fileStats = [];

  for (const file of files) {
    const full = path.join(SEED_DIR, file);
    let data;
    try {
      data = JSON.parse(fs.readFileSync(full, 'utf8'));
    } catch (e) {
      console.error(`Không đọc được JSON: ${file} -> ${e.message}`);
      continue;
    }

    const topicId = (data._meta && data._meta.topicId) || file.replace(/\.json$/, '');
    const cards = Array.isArray(data.cards) ? data.cards : [];
    fileStats.push({ file, topicId, count: cards.length });

    for (const card of cards) {
      const fv = card.fieldValues || {};
      const wordRaw = fv.word;
      const word = normalizeWord(wordRaw);
      if (!word) continue;
      entries.push({
        file,
        topicId,
        word,
        wordRaw: String(wordRaw).trim(),
        pos: normalizePos(fv.partOfSpeech),
        posRaw: String(fv.partOfSpeech || '').trim(),
        meaning: String(fv.meaning || '').trim(),
      });
    }
  }

  return { entries, fileStats, files };
}

function main() {
  const { entries, fileStats, files } = loadAllCards();

  const regular = entries.filter((e) => !IRREGULAR_TOPICS.has(e.topicId));
  const irregular = entries.filter((e) => IRREGULAR_TOPICS.has(e.topicId));

  // ---- 1. Trùng lặp TRONG cùng topic (word + pos) ----
  const withinTopic = {}; // key: topicId||word||pos -> entries[]
  for (const e of regular) {
    const key = `${e.topicId}||${e.word}||${e.pos}`;
    (withinTopic[key] = withinTopic[key] || []).push(e);
  }
  const withinTopicDupes = Object.entries(withinTopic)
    .filter(([, arr]) => arr.length > 1)
    .map(([key, arr]) => ({
      topicId: arr[0].topicId,
      word: arr[0].wordRaw,
      pos: arr[0].posRaw,
      count: arr.length,
      meanings: arr.map((x) => x.meaning),
    }))
    .sort((a, b) => b.count - a.count || a.word.localeCompare(b.word));

  // ---- 2. Trùng lặp NGOÀI topic (word + pos xuất hiện ở nhiều topic) ----
  const acrossTopic = {}; // key: word||pos -> Map(topicId -> count)
  for (const e of regular) {
    const key = `${e.word}||${e.pos}`;
    if (!acrossTopic[key]) acrossTopic[key] = { word: e.wordRaw, pos: e.posRaw, topics: {} };
    acrossTopic[key].topics[e.topicId] = (acrossTopic[key].topics[e.topicId] || 0) + 1;
  }
  const acrossTopicDupes = Object.values(acrossTopic)
    .filter((v) => Object.keys(v.topics).length > 1)
    .map((v) => ({
      word: v.word,
      pos: v.pos,
      topicCount: Object.keys(v.topics).length,
      topics: v.topics,
    }))
    .sort((a, b) => b.topicCount - a.topicCount || a.word.localeCompare(b.word));

  // ---- 3. Cùng word nhưng KHÁC partOfSpeech ----
  const byWord = {}; // word -> Map(pos -> Set(topicId))
  for (const e of regular) {
    if (!byWord[e.word]) byWord[e.word] = { wordRaw: e.wordRaw, pos: {} };
    if (!byWord[e.word].pos[e.pos]) byWord[e.word].pos[e.pos] = {};
    const bucket = byWord[e.word].pos[e.pos];
    bucket[e.topicId] = (bucket[e.topicId] || 0) + 1;
  }
  const samwordDiffPos = Object.values(byWord)
    .filter((v) => Object.keys(v.pos).length > 1)
    .map((v) => ({
      word: v.wordRaw,
      posList: Object.entries(v.pos).map(([pos, topics]) => ({
        pos,
        topics: Object.keys(topics),
      })),
    }))
    .sort((a, b) => b.posList.length - a.posList.length || a.word.localeCompare(b.word));

  // ---- Thống kê nhóm irregular (trùng lặp giữa các dạng - thông tin tham khảo) ----
  const irregularAcross = {}; // word -> Set(topicId)
  for (const e of irregular) {
    if (!irregularAcross[e.word]) irregularAcross[e.word] = new Set();
    irregularAcross[e.word].add(e.topicId);
  }

  // ---- In báo cáo ----
  const out = [];
  const p = (s = '') => out.push(s);

  p('='.repeat(80));
  p('BÁO CÁO THỐNG KÊ TRÙNG LẶP TỪ VỰNG');
  p('='.repeat(80));
  p(`Số file topic: ${files.length}`);
  p(`Tổng số card (tất cả): ${entries.length}`);
  p(`  - Card thuộc topic thường: ${regular.length}`);
  p(`  - Card thuộc topic bất quy tắc (V1/V2/V3, comparative/superlative): ${irregular.length}`);
  p('');
  p('Ghi chú: Các topic bất quy tắc được tách riêng vì việc một từ xuất hiện ở');
  p('nhiều dạng (be/was/been...) là cố ý. Phần 1-3 dưới đây chỉ xét topic thường.');
  p('');

  // Phần 1
  p('─'.repeat(80));
  p(`[1] TRÙNG LẶP TRONG CÙNG TOPIC (cùng word + cùng loại từ): ${withinTopicDupes.length} trường hợp`);
  p('─'.repeat(80));
  if (withinTopicDupes.length === 0) {
    p('  (Không có)');
  } else {
    for (const d of withinTopicDupes) {
      p(`  • [${d.topicId}] "${d.word}" (${d.pos}) — xuất hiện ${d.count} lần`);
      d.meanings.forEach((m, i) => p(`        ${i + 1}. ${m || '(không có nghĩa)'}`));
    }
  }
  p('');

  // Phần 2
  p('─'.repeat(80));
  p(`[2] TRÙNG LẶP NGOÀI TOPIC (cùng word + cùng loại từ, ở nhiều topic): ${acrossTopicDupes.length} trường hợp`);
  p('─'.repeat(80));
  if (acrossTopicDupes.length === 0) {
    p('  (Không có)');
  } else {
    for (const d of acrossTopicDupes) {
      const topicStr = Object.entries(d.topics)
        .map(([t, c]) => (c > 1 ? `${t} (x${c})` : t))
        .join(', ');
      p(`  • "${d.word}" (${d.pos}) — ${d.topicCount} topic: ${topicStr}`);
    }
  }
  p('');

  // Phần 3
  p('─'.repeat(80));
  p(`[3] CÙNG CÁCH VIẾT 100% NHƯNG KHÁC LOẠI TỪ: ${samwordDiffPos.length} trường hợp`);
  p('─'.repeat(80));
  if (samwordDiffPos.length === 0) {
    p('  (Không có)');
  } else {
    for (const d of samwordDiffPos) {
      const posStr = d.posList
        .map((x) => `${x.pos} [${x.topics.join(', ')}]`)
        .join('  |  ');
      p(`  • "${d.word}": ${posStr}`);
    }
  }
  p('');

  // Phần tham khảo: irregular
  const irregularMulti = Object.entries(irregularAcross)
    .filter(([, set]) => set.size > 1)
    .sort((a, b) => b[1].size - a[1].size);
  p('─'.repeat(80));
  p(`[Tham khảo] Từ xuất hiện ở nhiều topic BẤT QUY TẮC (thường là cố ý): ${irregularMulti.length} từ`);
  p('─'.repeat(80));

  p('');
  p('='.repeat(80));
  p('TỔNG KẾT');
  p('='.repeat(80));
  p(`  [1] Trùng trong cùng topic:        ${withinTopicDupes.length}`);
  p(`  [2] Trùng ngoài topic:             ${acrossTopicDupes.length}`);
  p(`  [3] Cùng viết khác loại từ:        ${samwordDiffPos.length}`);

  const report = out.join('\n');
  console.log(report);

  // Ghi kết quả ra file (text + json).
  const outDir = path.join(__dirname, '..', 'docs');
  fs.writeFileSync(path.join(outDir, 'vocabulary-duplicates-report.txt'), report, 'utf8');
  fs.writeFileSync(
    path.join(outDir, 'vocabulary-duplicates-report.json'),
    JSON.stringify(
      {
        summary: {
          files: files.length,
          totalCards: entries.length,
          regularCards: regular.length,
          irregularCards: irregular.length,
          withinTopicDupes: withinTopicDupes.length,
          acrossTopicDupes: acrossTopicDupes.length,
          sameWordDiffPos: samwordDiffPos.length,
        },
        fileStats,
        withinTopicDupes,
        acrossTopicDupes,
        sameWordDiffPos: samwordDiffPos,
      },
      null,
      2
    ),
    'utf8'
  );

  console.log('\nĐã ghi báo cáo: docs/vocabulary-duplicates-report.txt và .json');
}

main();
