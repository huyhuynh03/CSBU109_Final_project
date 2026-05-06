(async () => {
  const SOURCE_FOLDER = 'education';
  const TARGETS = {
    beauty: 'arts',
    good: 'personal-qualities'
  };

  const normalize = (value) => String(value || '').trim().toLowerCase();

  const getWord = (card) => normalize(card?.fieldValues?.word);
  const getFamilyId = (card) => normalize(card?.fieldValues?.familyId);

  const allCards = await FirestoreDB.getCards({ cardType: 'vocabulary' });
  const educationCards = allCards.filter(card => card.folderId === SOURCE_FOLDER);

  const cardsToMove = educationCards.filter(card => {
    const word = getWord(card);
    const familyId = getFamilyId(card);
    return familyId === 'beauty' || word === 'good' || word === 'well';
  });

  console.log('Education cards total:', educationCards.length);
  console.log('Cards to move:', cardsToMove.map(card => ({
    id: card.id,
    word: card?.fieldValues?.word || '',
    familyId: card?.fieldValues?.familyId || '',
    from: card.folderId,
    to: getFamilyId(card) === 'beauty' ? TARGETS.beauty : TARGETS.good
  })));

  for (const card of cardsToMove) {
    const word = getWord(card);
    const familyId = getFamilyId(card);
    const targetFolder = familyId === 'beauty' ? TARGETS.beauty : TARGETS.good;

    console.log('Moving card:', {
      id: card.id,
      word: card?.fieldValues?.word || '',
      familyId: card?.fieldValues?.familyId || '',
      from: card.folderId,
      to: targetFolder
    });

    await FirestoreDB.updateCard(card.id, {
      folderId: targetFolder
    });
  }

  const finalCards = await FirestoreDB.getCards({ cardType: 'vocabulary' });
  const finalCounts = finalCards.reduce((acc, card) => {
    const folderId = card.folderId || '(none)';
    acc[folderId] = (acc[folderId] || 0) + 1;
    return acc;
  }, {});

  console.log('Migration complete:', {
    moved: cardsToMove.length,
    education: finalCounts.education || 0,
    arts: finalCounts.arts || 0,
    personalQualities: finalCounts['personal-qualities'] || 0
  });
})();
