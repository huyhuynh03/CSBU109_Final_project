const fs = require('fs');

// Read both files
const v2Data = JSON.parse(fs.readFileSync('public/seed-vocabulary/irregular-verb-v2.json', 'utf8'));
const v3Data = JSON.parse(fs.readFileSync('public/seed-vocabulary/irregular-verb-v3.json', 'utf8'));

// Extract baseForm from each
const v2BaseForms = v2Data.cards.map(card => card.fieldValues.baseForm).sort();
const v3BaseForms = v3Data.cards.map(card => card.fieldValues.baseForm).sort();

console.log('V2 count:', v2BaseForms.length);
console.log('V3 count:', v3BaseForms.length);

// Find missing in V3
const missingInV3 = v2BaseForms.filter(base => !v3BaseForms.includes(base));
console.log('\n❌ Missing in V3:', missingInV3);

// Find extra in V3
const extraInV3 = v3BaseForms.filter(base => !v2BaseForms.includes(base));
console.log('\n➕ Extra in V3:', extraInV3);

// Find duplicates in V2
const v2Duplicates = v2BaseForms.filter((base, index) => v2BaseForms.indexOf(base) !== index);
if (v2Duplicates.length > 0) {
  console.log('\n🔁 Duplicates in V2:', [...new Set(v2Duplicates)]);
}

// Find duplicates in V3
const v3Duplicates = v3BaseForms.filter((base, index) => v3BaseForms.indexOf(base) !== index);
if (v3Duplicates.length > 0) {
  console.log('\n🔁 Duplicates in V3:', [...new Set(v3Duplicates)]);
}
