(async () => {
  const normalize = (value) => String(value || '').trim().toLowerCase();
  const isIrregularVerbCard = (card) => {
    const fv = card && card.fieldValues ? card.fieldValues : {};
    const tags = Array.isArray(fv.tags) ? fv.tags : [];
    return tags.includes('irregular-verb');
  };

  const logCounts = async (label) => {
    const cards = await FirestoreDB.getCards({ cardType: 'vocabulary' });
    const irregularCards = cards.filter(isIrregularVerbCard);
    const counts = irregularCards.reduce((acc, card) => {
      const folderId = card.folderId || '(none)';
      acc[folderId] = (acc[folderId] || 0) + 1;
      return acc;
    }, {});

    console.log(label, {
      totalIrregular: irregularCards.length,
      v1: counts['irregular-verb-v1'] || 0,
      v2: counts['irregular-verb-v2'] || 0,
      v3: counts['irregular-verb-v3'] || 0,
      otherFolders: Object.fromEntries(
        Object.entries(counts).filter(([folderId]) => !['irregular-verb-v1', 'irregular-verb-v2', 'irregular-verb-v3'].includes(folderId))
      )
    });
  };

  await logCounts('Before cleanup:');

  const allCards = await FirestoreDB.getCards({ cardType: 'vocabulary' });
  const irregularCards = allCards.filter(isIrregularVerbCard);

  console.log('Found irregular-verb cards:', irregularCards.length);

  for (const card of irregularCards) {
    const word = card.fieldValues && card.fieldValues.word ? card.fieldValues.word : '(no word)';
    console.log('Deleting irregular card:', card.id, word, 'folder=', card.folderId || '(none)');
    await FirestoreDB.deleteCard(card.id);
  }

  await logCounts('After cleanup:');

  const files = [
    'irregular-verb-v1.json',
    'irregular-verb-v2.json',
    'irregular-verb-v3.json'
  ];

  for (const filename of files) {
    console.log('Importing file:', filename);
    const result = await SeedImporter.importFile(filename);
    console.log(filename, result);
  }

  await logCounts('After reseed:');

  const finalCards = await FirestoreDB.getCards({ cardType: 'vocabulary' });
  const irregularFinal = finalCards.filter(isIrregularVerbCard);
  const duplicates = irregularFinal.reduce((acc, card) => {
    const word = normalize(card.fieldValues && card.fieldValues.word);
    if (!word) return acc;
    acc[word] = acc[word] || [];
    acc[word].push({
      id: card.id,
      folderId: card.folderId || '(none)',
      role: (card.fieldValues && card.fieldValues.irregularRole) || '',
      note: (card.fieldValues && card.fieldValues.note) || ''
    });
    return acc;
  }, {});

  const duplicateEntries = Object.entries(duplicates).filter(([, items]) => items.length > 1);
  console.log('Duplicate irregular words after reseed:', duplicateEntries.length, duplicateEntries);

  console.log('Expected final counts:', { v1: 132, v2: 114, v3: 56, totalIrregular: 302 });
})();
