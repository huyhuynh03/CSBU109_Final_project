const fs = require('fs');

// Read V2 and V3 files
const v2Data = JSON.parse(fs.readFileSync('public/seed-vocabulary/irregular-verb-v2.json', 'utf8'));
const v3Data = JSON.parse(fs.readFileSync('public/seed-vocabulary/irregular-verb-v3.json', 'utf8'));

// Extract unique baseForms with their meanings
const baseFormsMap = new Map();

// From V2
v2Data.cards.forEach(card => {
    const base = card.fieldValues.baseForm;
    const meaning = card.fieldValues.baseMeaning;
    if (base && !baseFormsMap.has(base)) {
        baseFormsMap.set(base, meaning);
    }
});

// From V3 (in case V2 missed any)
v3Data.cards.forEach(card => {
    const base = card.fieldValues.baseForm;
    const meaning = card.fieldValues.baseMeaning;
    if (base && !baseFormsMap.has(base)) {
        baseFormsMap.set(base, meaning);
    }
});

console.log(`Found ${baseFormsMap.size} unique base forms`);

// Sort alphabetically
const sortedBases = Array.from(baseFormsMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));

// Generate V1 cards
const v1Cards = sortedBases.map(([word, meaning]) => {
    // Find V2 and V3 forms from original data
    const v2Card = v2Data.cards.find(c => c.fieldValues.baseForm === word);
    const v3Card = v3Data.cards.find(c => c.fieldValues.baseForm === word);
    
    const v2Form = v2Card ? v2Card.fieldValues.word : '';
    const v3Form = v3Card ? v3Card.fieldValues.word : '';
    
    // Generate IPA (simplified - you may want to add real IPA)
    const ipa = `/${word}/`;
    
    // Generate example sentence
    const example = `I ${word} every day.`;
    
    return {
        fieldValues: {
            word: word,
            ipa: ipa,
            partOfSpeech: 'verb',
            difficulty: 'intermediate',
            meaning: meaning,
            example: example,
            tags: ['irregular-verb'],
            irregularRole: 'baseForm',
            pastSimple: v2Form,
            pastParticiple: v3Form
        }
    };
});

// Create V1 file
const v1Data = {
    _meta: {
        schemaVersion: 'v2',
        cardType: 'vocabulary',
        topicId: 'irregular-verb-v1',
        description: 'Động từ bất quy tắc – dạng V1 (Nguyên mẫu). Mỗi thẻ là 1 động từ nguyên mẫu với thông tin V2/V3.',
        locale: 'en'
    },
    cards: v1Cards
};

fs.writeFileSync('public/seed-vocabulary/irregular-verb-v1.json', JSON.stringify(v1Data, null, 2), 'utf8');
console.log(`✅ Created irregular-verb-v1.json with ${v1Cards.length} cards`);
