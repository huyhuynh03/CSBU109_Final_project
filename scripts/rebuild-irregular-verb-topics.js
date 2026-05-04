const fs = require('fs');
const path = require('path');

const INPUT_DIR = path.join('public', 'seed-vocabulary');
const OUTPUT_DIR = INPUT_DIR;

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(INPUT_DIR, file), 'utf8'));
}

function writeJson(file, data) {
  fs.writeFileSync(path.join(OUTPUT_DIR, file), JSON.stringify(data, null, 2), 'utf8');
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function byWord(cards) {
  const map = new Map();
  for (const card of cards) {
    const word = (card.fieldValues?.word || '').trim().toLowerCase();
    if (word && !map.has(word)) map.set(word, card);
  }
  return map;
}

function byBaseForm(cards) {
  const map = new Map();
  for (const card of cards) {
    const base = (card.fieldValues?.baseForm || '').trim().toLowerCase();
    if (base && !map.has(base)) map.set(base, card);
  }
  return map;
}

function classify(base, v2, v3) {
  if (base === v2 && base === v3) return 'same123';
  if (base !== v2 && v2 === v3) return 'same23';
  return 'other';
}

function makeV1Note(group) {
  if (group === 'same123') return 'V1 = V2 = V3';
  if (group === 'same23') return 'V2 = V3';
  return '';
}

function makeV2Note(group) {
  if (group === 'same23') return 'V2 = V3';
  return '';
}

function normalizeTags(tags) {
  const set = new Set(Array.isArray(tags) ? tags : []);
  set.add('irregular-verb');
  return Array.from(set);
}

const v1Data = readJson('irregular-verb-v1.json');
const v2Data = readJson('irregular-verb-v2.json');
const v3Data = readJson('irregular-verb-v3.json');

const v1Map = byWord(v1Data.cards);
const v2Map = byBaseForm(v2Data.cards);
const v3Map = byBaseForm(v3Data.cards);

const allBases = Array.from(new Set([
  ...Array.from(v1Map.keys()),
  ...Array.from(v2Map.keys()),
  ...Array.from(v3Map.keys())
])).sort((a, b) => a.localeCompare(b));

const rebuiltV1 = {
  _meta: {
    ...clone(v1Data._meta),
    description: 'Động từ bất quy tắc – dạng V1 (Nguyên mẫu). Bao gồm toàn bộ base form; các trường hợp trùng dạng sẽ được chú thích ngay trên thẻ.'
  },
  cards: []
};

const rebuiltV2 = {
  _meta: {
    ...clone(v2Data._meta),
    description: 'Động từ bất quy tắc – dạng V2 (Quá khứ đơn). Không lặp lại các động từ có V1 = V2 = V3; các trường hợp V2 = V3 chỉ xuất hiện một lần tại đây.'
  },
  cards: []
};

const rebuiltV3 = {
  _meta: {
    ...clone(v3Data._meta),
    description: 'Động từ bất quy tắc – dạng V3 (Quá khứ phân từ). Chỉ giữ các trường hợp V3 thực sự khác V2.'
  },
  cards: []
};

const stats = { same123: 0, same23: 0, other: 0 };

for (const base of allBases) {
  const v1Card = v1Map.get(base);
  const v2Card = v2Map.get(base);
  const v3Card = v3Map.get(base);

  if (!v1Card || !v2Card || !v3Card) {
    throw new Error(`Thiếu dữ liệu cho base form: ${base}`);
  }

  const v2Word = (v2Card.fieldValues.word || '').trim().toLowerCase();
  const v3Word = (v3Card.fieldValues.word || '').trim().toLowerCase();
  const group = classify(base, v2Word, v3Word);
  stats[group]++;

  const v1Clone = clone(v1Card);
  v1Clone.fieldValues = {
    ...v1Clone.fieldValues,
    tags: normalizeTags(v1Clone.fieldValues.tags),
    irregularRole: 'baseForm',
    baseForm: base,
    baseMeaning: v1Clone.fieldValues.meaning || v2Card.fieldValues.baseMeaning || '',
    note: makeV1Note(group),
    pastSimple: v2Card.fieldValues.word || '',
    pastParticiple: v3Card.fieldValues.word || ''
  };
  rebuiltV1.cards.push(v1Clone);

  if (group !== 'same123') {
    const v2Clone = clone(v2Card);
    v2Clone.fieldValues = {
      ...v2Clone.fieldValues,
      tags: normalizeTags(v2Clone.fieldValues.tags),
      note: makeV2Note(group)
    };
    rebuiltV2.cards.push(v2Clone);
  }

  if (group === 'other') {
    const v3Clone = clone(v3Card);
    v3Clone.fieldValues = {
      ...v3Clone.fieldValues,
      tags: normalizeTags(v3Clone.fieldValues.tags),
      note: ''
    };
    rebuiltV3.cards.push(v3Clone);
  }
}

writeJson('irregular-verb-v1.json', rebuiltV1);
writeJson('irregular-verb-v2.json', rebuiltV2);
writeJson('irregular-verb-v3.json', rebuiltV3);

console.log(`Rebuilt V1/V2/V3 successfully.`);
console.log(`V1 cards: ${rebuiltV1.cards.length}`);
console.log(`V2 cards: ${rebuiltV2.cards.length}`);
console.log(`V3 cards: ${rebuiltV3.cards.length}`);
console.log(`Groups => same123: ${stats.same123}, same23: ${stats.same23}, other: ${stats.other}`);
