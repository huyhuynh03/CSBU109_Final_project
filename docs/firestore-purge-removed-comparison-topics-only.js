/*
 * Firestore Purge - chỉ xoá 44 card thuộc 2 topic so sánh BQT đã bị gỡ khỏi runtime.
 * Chạy trong DevTools Console sau khi đăng nhập đúng tài khoản.
 * Script này không xoá duplicate cross-topic khác.
 */
(async () => {
  const CONFIG = {
    EXECUTE_PURGE: true,
    PROJECT_ID: 'linguaflash-f5591',
    MAX_DELETE_PER_RUN: 100,
    DOWNLOAD_RESULT_JSON: false
  };

  const removedFolders = new Set(['irregular-adj-comparative', 'irregular-adj-superlative']);
  const removedTags = new Set(['irregular-comparative', 'irregular-superlative', 'irregular-adjective', 'irregular-adverb']);
  const removedRoles = new Set(['comparative', 'superlative']);
  const removedWords = new Set([
    'better', 'elder', 'farther', 'further', 'less', 'more', 'worse',
    'best', 'eldest', 'farthest', 'furthest', 'least', 'most', 'worst'
  ]);

  const normalize = (value) => String(value || '').trim().toLowerCase();
  const getWord = (card) => normalize(card.fieldValues && card.fieldValues.word);
  const getTags = (card) => Array.isArray(card.fieldValues && card.fieldValues.tags)
    ? card.fieldValues.tags.map(normalize)
    : [];

  const requireRuntime = () => {
    if (typeof auth === 'undefined' || typeof db === 'undefined') {
      throw new Error('Không thấy auth/db trên page. Hãy chạy trong app LinguaFlash sau khi đăng nhập.');
    }
    const user = auth.currentUser;
    if (!user) throw new Error('Chưa đăng nhập.');
    return user;
  };

  const isRemovedIrregularComparison = (card) => {
    const fv = card.fieldValues || {};
    const word = getWord(card);
    const role = normalize(fv.irregularRole);
    const tags = getTags(card);
    const hasRemovedTag = tags.some(tag => removedTags.has(tag));
    const hasLegacyFields = !!(fv.comparative || fv.superlative);

    return removedFolders.has(card.folderId)
      || hasRemovedTag
      || removedRoles.has(role)
      || (removedWords.has(word) && hasLegacyFields);
  };

  const countByFolder = (cards) => cards.reduce((acc, card) => {
    const folderId = card.folderId || '(none)';
    acc[folderId] = (acc[folderId] || 0) + 1;
    return acc;
  }, {});

  const downloadJson = (filename, data) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const user = requireRuntime();
  console.warn('[LF Purge Removed Comparison] User:', user.uid, user.email || '(no email)');

  const beforeSnapshot = await db.collection('users').doc(user.uid).collection('cards').get();
  const beforeCards = beforeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const beforeVocabularyCards = beforeCards.filter(card => card.cardType === 'vocabulary' || !card.cardType);
  const targets = beforeVocabularyCards.filter(isRemovedIrregularComparison);

  console.warn('[LF Purge Removed Comparison] Before total vocabulary:', beforeVocabularyCards.length);
  console.warn('[LF Purge Removed Comparison] Targets:', targets.length, targets.map(card => ({
    id: card.id,
    folderId: card.folderId || '',
    word: card.fieldValues && card.fieldValues.word || '',
    partOfSpeech: card.fieldValues && card.fieldValues.partOfSpeech || '',
    tags: getTags(card),
    role: card.fieldValues && card.fieldValues.irregularRole || ''
  })));

  if (!CONFIG.EXECUTE_PURGE) {
    console.warn('[LF Purge Removed Comparison] DRY-RUN only. Không xoá gì.');
    return { beforeVocabularyCards: beforeVocabularyCards.length, targets: targets.length };
  }

  if (targets.length > CONFIG.MAX_DELETE_PER_RUN) {
    throw new Error(`Có ${targets.length} targets, vượt MAX_DELETE_PER_RUN=${CONFIG.MAX_DELETE_PER_RUN}. Dừng để tránh xoá nhầm.`);
  }

  let deleted = 0;
  let failed = 0;
  const failedItems = [];

  for (const card of targets) {
    try {
      await db.collection('users').doc(user.uid).collection('cards').doc(card.id).delete();
      deleted++;
      console.log('[LF Purge Removed Comparison] Deleted:', card.id, card.folderId, card.fieldValues && card.fieldValues.word || '');
    } catch (error) {
      failed++;
      failedItems.push({ id: card.id, error: String(error && error.message || error) });
      console.error('[LF Purge Removed Comparison] Delete failed:', card.id, error);
    }
  }

  const afterSnapshot = await db.collection('users').doc(user.uid).collection('cards').get();
  const afterCards = afterSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const afterVocabularyCards = afterCards.filter(card => card.cardType === 'vocabulary' || !card.cardType);
  const remainingTargets = afterVocabularyCards.filter(isRemovedIrregularComparison);

  const result = {
    generatedAt: new Date().toISOString(),
    projectId: CONFIG.PROJECT_ID,
    userId: user.uid,
    userEmail: user.email || '',
    beforeVocabularyCards: beforeVocabularyCards.length,
    afterVocabularyCards: afterVocabularyCards.length,
    deleted,
    failed,
    failedItems,
    remainingRemovedComparisonTargets: remainingTargets.length,
    beforeByFolder: countByFolder(beforeVocabularyCards),
    afterByFolder: countByFolder(afterVocabularyCards)
  };

  console.warn('[LF Purge Removed Comparison] Result:', result);
  if (CONFIG.DOWNLOAD_RESULT_JSON) {
    downloadJson(`lf-purge-removed-comparison-result-${user.uid}-${Date.now()}.json`, result);
  }
  return result;
})();
