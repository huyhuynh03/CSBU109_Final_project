#!/usr/bin/env node
/**
 * Xoá các card trùng NGOÀI topic (Nhóm A - trùng nghĩa thật) theo quyết định:
 *
 *  Giữ ở energy-resources, xoá khỏi environment-climate:
 *    crude oil, natural gas, geothermal, deplete, depletion
 *  Giữ ở environment-climate, xoá khỏi energy-resources:
 *    emit, greenhouse gas
 *  Giữ ở history-archeology, xoá khỏi biology:
 *    prehistoric, unearth
 *
 * Nhóm B (product / function / virus) KHÔNG xoá vì khác nghĩa chuyên ngành.
 *
 * Script cập nhật _meta.totalCards tương ứng và báo cáo các family bị ảnh hưởng.
 */

const fs = require('fs');
const path = require('path');

const SEED_DIR = path.join(__dirname, '..', 'packages', 'shell', 'public', 'seed-vocabulary');

// file -> danh sách word (lowercase) cần xoá khỏi file đó.
const REMOVALS = {
  'environment-climate.json': ['crude oil', 'natural gas', 'geothermal', 'deplete', 'depletion'],
  'energy-resources.json': ['emit', 'greenhouse gas'],
  'biology.json': ['prehistoric', 'unearth'],
};

function norm(w) {
  return String(w || '').trim().toLowerCase();
}

let totalRemoved = 0;

for (const [file, words] of Object.entries(REMOVALS)) {
  const full = path.join(SEED_DIR, file);
  const data = JSON.parse(fs.readFileSync(full, 'utf8'));
  const target = new Set(words.map(norm));

  const before = data.cards.length;
  const removed = [];
  const affectedFamilies = new Set();

  data.cards = data.cards.filter((card) => {
    const fv = card.fieldValues || {};
    if (target.has(norm(fv.word))) {
      removed.push(`${fv.word} (${fv.partOfSpeech})`);
      if (fv.familyId) affectedFamilies.add(fv.familyId);
      return false;
    }
    return true;
  });

  const after = data.cards.length;

  // Cập nhật meta.totalCards nếu có.
  if (data._meta && typeof data._meta.totalCards === 'number') {
    data._meta.totalCards = data._meta.totalCards - (before - after);
  }

  fs.writeFileSync(full, JSON.stringify(data, null, 2) + '\n', 'utf8');
  totalRemoved += before - after;

  console.log(`\n[${file}]`);
  console.log(`  Card: ${before} -> ${after} (đã xoá ${before - after})`);
  console.log(`  Từ đã xoá: ${removed.join(', ')}`);
  console.log(`  Family bị ảnh hưởng: ${[...affectedFamilies].join(', ') || '(không có familyId)'}`);

  // Cảnh báo family bị mất hết thành viên hoặc mất từ gốc (familyOrder 1).
  for (const fid of affectedFamilies) {
    const members = data.cards.filter((c) => (c.fieldValues || {}).familyId === fid);
    if (members.length === 0) {
      console.log(`  ⚠ Family "${fid}" đã hết thành viên sau khi xoá.`);
    } else {
      const hasRoot = members.some((c) => (c.fieldValues || {}).familyOrder === 1);
      if (!hasRoot) {
        console.log(`  ⚠ Family "${fid}" còn ${members.length} thành viên nhưng KHÔNG còn familyOrder=1 (từ gốc).`);
      }
    }
  }
}

console.log(`\nTổng số card đã xoá: ${totalRemoved}`);
