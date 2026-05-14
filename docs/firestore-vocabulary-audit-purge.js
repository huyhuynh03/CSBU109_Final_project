/*
 * Firestore Vocabulary Audit/Purge - chạy trong DevTools Console của app LinguaFlash.
 * Mặc định chỉ DRY-RUN: in báo cáo + tải backup JSON, KHÔNG xoá dữ liệu.
 * Khi đã kiểm tra kỹ report, đổi EXECUTE_PURGE thành true để xoá các nhóm đã chọn.
 */
(async () => {
  const CONFIG = {
    EXECUTE_PURGE: false,
    PROJECT_ID: 'linguaflash-f5591',
    MAX_DELETE_PER_RUN: 500,
    DELETE_REMOVED_IRREGULAR_COMPARISON_TOPICS: true,
    DELETE_EXACT_DUPLICATE_IDENTITIES: true,
    DELETE_DUPLICATE_DOC_IDS_ONLY_WHEN_SAFE: true,
    DELETE_CROSS_FOLDER_SAME_WORD: false
  };

  const removedFolders = new Set(['irregular-adj-comparative', 'irregular-adj-superlative']);
  const removedTags = new Set(['irregular-comparative', 'irregular-superlative', 'irregular-adjective', 'irregular-adverb']);
  const removedRoles = new Set(['comparative', 'superlative']);
  const removedWords = new Set([
    'better', 'elder', 'farther', 'further', 'less', 'more', 'worse',
    'best', 'eldest', 'farthest', 'furthest', 'least', 'most', 'worst'
  ]);

  const activeFolders = new Set([
    'family-relationships', 'daily-life', 'home-living', 'food-drink', 'daily-activities',
    'communication-social', 'personal-qualities', 'education', 'irregular-verb-v1',
    'irregular-verb-v2', 'irregular-verb-v3'
  ]);

  const normalize = (value) => String(value || '').trim().toLowerCase();
  const stableJson = (value) => JSON.stringify(value, Object.keys(value || {}).sort());
  const uniq = (items) => [...new Set(items.filter(Boolean))];

  const requireRuntime = () => {
    if (typeof firebase === 'undefined') throw new Error('firebase chưa tồn tại trên page. Hãy chạy script trong app sau khi đăng nhập.');
    if (typeof auth === 'undefined') throw new Error('auth chưa tồn tại trên page.');
    if (typeof db === 'undefined') throw new Error('db chưa tồn tại trên page.');
    const user = auth.currentUser;
    if (!user) throw new Error('Chưa đăng nhập. Hãy đăng nhập app trước khi chạy script.');
    return user;
  };

  const getWord = (card) => normalize(card.fieldValues && card.fieldValues.word);
  const getTags = (card) => Array.isArray(card.fieldValues && card.fieldValues.tags)
    ? card.fieldValues.tags.map(normalize)
    : [];

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

  const identityKey = (card) => {
    const fv = card.fieldValues || {};
    const word = normalize(fv.word || card.word || card.front);
    const meaning = normalize(fv.meaning || card.meaning || card.back);
    const role = normalize(fv.irregularRole);
    const familyId = normalize(fv.familyId);
    const baseForm = normalize(fv.baseForm);
    return [card.cardType || 'vocabulary', card.folderId || '', word, meaning, role, familyId, baseForm].join('|');
  };

  const sameWordKey = (card) => {
    const fv = card.fieldValues || {};
    return [card.cardType || 'vocabulary', getWord(card), normalize(fv.partOfSpeech), normalize(fv.meaning)].join('|');
  };

  const pickDuplicateKeep = (cards) => {
    return [...cards].sort((a, b) => {
      const activeA = activeFolders.has(a.folderId) ? 0 : 1;
      const activeB = activeFolders.has(b.folderId) ? 0 : 1;
      if (activeA !== activeB) return activeA - activeB;
      const updatedA = a.updatedAt && a.updatedAt.toMillis ? a.updatedAt.toMillis() : 0;
      const updatedB = b.updatedAt && b.updatedAt.toMillis ? b.updatedAt.toMillis() : 0;
      if (updatedA !== updatedB) return updatedB - updatedA;
      return String(a.id).localeCompare(String(b.id));
    })[0];
  };

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
  console.warn('[LF Audit/Purge] User:', user.uid, user.email || '(no email)');
  console.warn('[LF Audit/Purge] Mode:', CONFIG.EXECUTE_PURGE ? 'EXECUTE PURGE' : 'DRY-RUN ONLY');

  const snapshot = await db.collection('users').doc(user.uid).collection('cards').get();
  const cards = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const vocabularyCards = cards.filter(card => card.cardType === 'vocabulary' || !card.cardType);

  const byFolder = vocabularyCards.reduce((acc, card) => {
    const folderId = card.folderId || '(none)';
    acc[folderId] = (acc[folderId] || 0) + 1;
    return acc;
  }, {});

  const removedTopicTargets = vocabularyCards.filter(isRemovedIrregularComparison);

  const identityGroups = new Map();
  for (const card of vocabularyCards) {
    const key = identityKey(card);
    if (!key.includes('||')) {
      if (!identityGroups.has(key)) identityGroups.set(key, []);
      identityGroups.get(key).push(card);
    }
  }
  const exactDuplicateGroups = [...identityGroups.entries()]
    .filter(([, group]) => group.length > 1)
    .map(([key, group]) => ({ key, keep: pickDuplicateKeep(group), delete: group.filter(card => card.id !== pickDuplicateKeep(group).id) }));

  const sameWordGroupsMap = new Map();
  for (const card of vocabularyCards) {
    const key = sameWordKey(card);
    if (!getWord(card)) continue;
    if (!sameWordGroupsMap.has(key)) sameWordGroupsMap.set(key, []);
    sameWordGroupsMap.get(key).push(card);
  }
  const sameWordDuplicateGroups = [...sameWordGroupsMap.entries()]
    .filter(([, group]) => group.length > 1)
    .map(([key, group]) => ({ key, keep: pickDuplicateKeep(group), delete: group.filter(card => card.id !== pickDuplicateKeep(group).id) }));

  const purgeMap = new Map();
  const addTarget = (card, reason) => {
    if (!card || !card.id) return;
    if (!purgeMap.has(card.id)) purgeMap.set(card.id, { card, reasons: [] });
    purgeMap.get(card.id).reasons.push(reason);
  };

  if (CONFIG.DELETE_REMOVED_IRREGULAR_COMPARISON_TOPICS) {
    removedTopicTargets.forEach(card => addTarget(card, 'removed-irregular-comparison-topic'));
  }

  if (CONFIG.DELETE_EXACT_DUPLICATE_IDENTITIES) {
    exactDuplicateGroups.forEach(group => group.delete.forEach(card => addTarget(card, `exact-duplicate:${group.key}`)));
  }

  if (CONFIG.DELETE_CROSS_FOLDER_SAME_WORD) {
    sameWordDuplicateGroups.forEach(group => group.delete.forEach(card => addTarget(card, `same-word-duplicate:${group.key}`)));
  }

  const purgeTargets = [...purgeMap.values()].map(item => ({
    id: item.card.id,
    folderId: item.card.folderId || '',
    word: item.card.fieldValues && item.card.fieldValues.word || '',
    partOfSpeech: item.card.fieldValues && item.card.fieldValues.partOfSpeech || '',
    meaning: item.card.fieldValues && item.card.fieldValues.meaning || '',
    tags: getTags(item.card),
    role: item.card.fieldValues && item.card.fieldValues.irregularRole || '',
    reasons: uniq(item.reasons),
    raw: item.card
  }));

  const report = {
    generatedAt: new Date().toISOString(),
    projectId: CONFIG.PROJECT_ID,
    userId: user.uid,
    userEmail: user.email || '',
    executePurge: CONFIG.EXECUTE_PURGE,
    totals: {
      allCards: cards.length,
      vocabularyCards: vocabularyCards.length,
      folderCount: Object.keys(byFolder).length,
      removedIrregularComparisonTargets: removedTopicTargets.length,
      exactDuplicateGroups: exactDuplicateGroups.length,
      sameWordDuplicateGroups: sameWordDuplicateGroups.length,
      purgeTargets: purgeTargets.length
    },
    byFolder,
    removedTopicTargets: removedTopicTargets.map(card => ({
      id: card.id,
      folderId: card.folderId || '',
      word: card.fieldValues && card.fieldValues.word || '',
      partOfSpeech: card.fieldValues && card.fieldValues.partOfSpeech || '',
      meaning: card.fieldValues && card.fieldValues.meaning || '',
      tags: getTags(card),
      role: card.fieldValues && card.fieldValues.irregularRole || ''
    })),
    exactDuplicateGroups: exactDuplicateGroups.map(group => ({
      key: group.key,
      keep: { id: group.keep.id, folderId: group.keep.folderId || '', word: group.keep.fieldValues && group.keep.fieldValues.word || '' },
      delete: group.delete.map(card => ({ id: card.id, folderId: card.folderId || '', word: card.fieldValues && card.fieldValues.word || '' }))
    })),
    sameWordDuplicateGroups: sameWordDuplicateGroups.map(group => ({
      key: group.key,
      keep: { id: group.keep.id, folderId: group.keep.folderId || '', word: group.keep.fieldValues && group.keep.fieldValues.word || '' },
      delete: group.delete.map(card => ({ id: card.id, folderId: card.folderId || '', word: card.fieldValues && card.fieldValues.word || '' }))
    })),
    purgeTargets
  };

  console.log('[LF Audit/Purge] Folder counts:', byFolder);
  console.log('[LF Audit/Purge] Removed topic targets:', report.removedTopicTargets);
  console.log('[LF Audit/Purge] Exact duplicate groups:', report.exactDuplicateGroups);
  console.log('[LF Audit/Purge] Same word duplicate groups:', report.sameWordDuplicateGroups);
  console.log('[LF Audit/Purge] Purge targets:', purgeTargets);
  console.log('[LF Audit/Purge] Summary:', report.totals);

  downloadJson(`lf-firestore-vocabulary-audit-${user.uid}-${Date.now()}.json`, report);

  if (!CONFIG.EXECUTE_PURGE) {
    console.warn('[LF Audit/Purge] DRY-RUN: chưa xoá gì. Kiểm tra file JSON vừa tải xuống. Nếu đúng, đổi EXECUTE_PURGE thành true rồi chạy lại.');
    return report;
  }

  if (purgeTargets.length > CONFIG.MAX_DELETE_PER_RUN) {
    throw new Error(`Có ${purgeTargets.length} targets, vượt MAX_DELETE_PER_RUN=${CONFIG.MAX_DELETE_PER_RUN}. Hãy kiểm tra report hoặc tăng giới hạn có chủ đích.`);
  }

  console.warn('[LF Audit/Purge] Bắt đầu xoá:', purgeTargets.length);
  let deleted = 0;
  let failed = 0;
  const failedItems = [];

  for (const target of purgeTargets) {
    try {
      await db.collection('users').doc(user.uid).collection('cards').doc(target.id).delete();
      deleted++;
      console.log('[LF Audit/Purge] Deleted:', target.id, target.word, target.folderId, target.reasons);
    } catch (error) {
      failed++;
      failedItems.push({ target, error: String(error && error.message || error) });
      console.error('[LF Audit/Purge] Delete failed:', target, error);
    }
  }

  const afterSnapshot = await db.collection('users').doc(user.uid).collection('cards').get();
  const afterCards = afterSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const afterVocabularyCards = afterCards.filter(card => card.cardType === 'vocabulary' || !card.cardType);

  const finalReport = {
    ...report,
    result: {
      deleted,
      failed,
      failedItems,
      beforeVocabularyCards: vocabularyCards.length,
      afterVocabularyCards: afterVocabularyCards.length
    }
  };

  downloadJson(`lf-firestore-vocabulary-purge-result-${user.uid}-${Date.now()}.json`, finalReport);
  console.warn('[LF Audit/Purge] Hoàn tất:', finalReport.result);
  return finalReport;
})();
