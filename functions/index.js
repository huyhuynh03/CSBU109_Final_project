const admin = require('firebase-admin');
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const logger = require('firebase-functions/logger');

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const TARGET_FOLDER = 'space';
const TARGET_WORDS = new Set(['microgravity', 'void', 'habitable']);
const DEFAULT_ALLOWED_UIDS = new Set();
const DEFAULT_ALLOWED_EMAILS = new Set();

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

function parseAllowList(raw) {
  return new Set(
    String(raw || '')
      .split(',')
      .map(item => normalize(item))
      .filter(Boolean)
  );
}

function isAuthorized(request) {
  const auth = request.auth || {};
  const token = auth.token || {};
  const uid = auth.uid || '';
  const email = normalize(token.email);
  const allowedUids = parseAllowList(process.env.SPACE_DUPLICATE_CLEANUP_ALLOWED_UIDS);
  const allowedEmails = parseAllowList(process.env.SPACE_DUPLICATE_CLEANUP_ALLOWED_EMAILS);

  if (token.admin === true) return true;
  if (allowedUids.size > 0 && allowedUids.has(uid)) return true;
  if (allowedEmails.size > 0 && allowedEmails.has(email)) return true;

  return false;
}

function buildIdentityKey(card) {
  const fv = card.fieldValues || {};
  const word = normalize(fv.word || card.word || card.front);
  const folderId = normalize(card.folderId || fv.folderId || fv.topicId);
  const partOfSpeech = normalize(fv.partOfSpeech);

  if (folderId !== TARGET_FOLDER) return '';
  if (!TARGET_WORDS.has(word)) return '';

  return ['vocabulary', word, folderId, partOfSpeech].join('::');
}

function getCreatedAtMillis(card) {
  const createdAt = card.createdAt;

  if (!createdAt) return 0;
  if (typeof createdAt.toMillis === 'function') return createdAt.toMillis();
  if (typeof createdAt.seconds === 'number') {
    return createdAt.seconds * 1000 + Math.floor((createdAt.nanoseconds || 0) / 1000000);
  }
  if (typeof createdAt === 'number') return createdAt;

  const parsed = Date.parse(createdAt);
  return Number.isNaN(parsed) ? 0 : parsed;
}

async function collectTargetCardsForUser(uid) {
  const snapshot = await db.collectionGroup('cards').where('folderId', '==', TARGET_FOLDER).get();
  const targets = [];

  snapshot.forEach((doc) => {
    if (!doc.ref.path.startsWith(`users/${uid}/cards/`)) return;
    const data = doc.data() || {};
    const fv = data.fieldValues || {};
    const word = normalize(fv.word || data.word || data.front);

    if (!TARGET_WORDS.has(word)) return;
    targets.push({ id: doc.id, ref: doc.ref, path: doc.ref.path, data });
  });

  return targets;
}

function groupDuplicates(cards) {
  const map = new Map();

  for (const card of cards) {
    const key = buildIdentityKey(card.data || {});
    if (!key) continue;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(card);
  }

  return [...map.entries()]
    .filter(([, group]) => group.length > 1)
    .map(([key, group]) => {
      const sorted = [...group].sort((a, b) => {
        const timeA = getCreatedAtMillis(a.data || {});
        const timeB = getCreatedAtMillis(b.data || {});
        if (timeA !== timeB) return timeA - timeB;
        return String(a.id).localeCompare(String(b.id));
      });

      return {
        key,
        keep: sorted[0],
        remove: sorted.slice(1)
      };
    });
}

exports.cleanupSpaceDuplicateWords = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Cần đăng nhập để chạy cleanup.');
  }

  const targetUid = normalize(request.data && request.data.targetUid) || request.auth.uid;
  const dryRun = !!(request.data && request.data.dryRun);

  if (targetUid !== request.auth.uid && !isAuthorized(request)) {
    throw new HttpsError('permission-denied', 'Không có quyền cleanup cho user khác.');
  }

  if (targetUid === request.auth.uid) {
    const email = normalize(request.auth.token && request.auth.token.email);
    const allowedUids = parseAllowList(process.env.SPACE_DUPLICATE_CLEANUP_ALLOWED_UIDS);
    const allowedEmails = parseAllowList(process.env.SPACE_DUPLICATE_CLEANUP_ALLOWED_EMAILS);
    const adminClaim = request.auth.token && request.auth.token.admin === true;

    if (!adminClaim && allowedUids.size > 0 && !allowedUids.has(targetUid) && !(allowedEmails.size > 0 && allowedEmails.has(email))) {
      logger.warn('[cleanupSpaceDuplicateWords] blocked request', {
        uid: request.auth.uid,
        email,
        targetUid
      });
      throw new HttpsError('permission-denied', 'Tài khoản hiện tại chưa được phép chạy cleanup này.');
    }
  }

  logger.info('[cleanupSpaceDuplicateWords] start', {
    uid: request.auth.uid,
    targetUid,
    dryRun
  });

  const targets = await collectTargetCardsForUser(targetUid);
  const duplicateGroups = groupDuplicates(targets);
  const removeCards = duplicateGroups.flatMap(group => group.remove);

  const preview = duplicateGroups.map(group => ({
    key: group.key,
    keep: {
      id: group.keep.id,
      path: group.keep.path,
      word: group.keep.data.fieldValues && group.keep.data.fieldValues.word,
      createdAt: getCreatedAtMillis(group.keep.data || {})
    },
    remove: group.remove.map(card => ({
      id: card.id,
      path: card.path,
      word: card.data.fieldValues && card.data.fieldValues.word,
      createdAt: getCreatedAtMillis(card.data || {})
    }))
  }));

  if (dryRun) {
    return {
      ok: true,
      dryRun: true,
      targetUid,
      scanned: targets.length,
      duplicateGroups: duplicateGroups.length,
      deleteCount: removeCards.length,
      preview
    };
  }

  let deleted = 0;
  for (const card of removeCards) {
    await card.ref.delete();
    deleted += 1;
  }

  logger.info('[cleanupSpaceDuplicateWords] done', {
    uid: request.auth.uid,
    targetUid,
    scanned: targets.length,
    duplicateGroups: duplicateGroups.length,
    deleted
  });

  return {
    ok: true,
    dryRun: false,
    targetUid,
    scanned: targets.length,
    duplicateGroups: duplicateGroups.length,
    deleted,
    preview
  };
});
