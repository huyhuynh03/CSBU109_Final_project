#!/usr/bin/env node
/**
 * Xóa triệt để bản sao lặp lại của 3 từ trong topic Space bằng Firebase Admin SDK.
 *
 * Script này làm theo hướng của docs/delete-atom-from-chemistry.js:
 * - Chạy server-side bằng Firebase Admin SDK, KHÔNG phụ thuộc browser/cache/Firestore rules.
 * - Quét dữ liệu hiện tại: users/{userId}/cards/{cardId}
 * - Quét dữ liệu legacy nếu còn: vocabularyCards/{cardId}
 * - Chỉ xử lý folder/topic "space" và 3 từ: microgravity, void, habitable.
 * - Với mỗi nhóm duplicate theo word + topic + partOfSpeech + user/source, giữ bản cũ nhất theo createdAt.
 * - Xóa các bản sao còn lại, rồi quét lại để xác nhận không còn duplicate.
 *
 * Cách chạy:
 *   npm install --prefix functions
 *   node docs/delete-duplicate-space-words-admin.js
 *
 * Yêu cầu xác thực admin, chọn 1 trong 2 cách:
 *   - Đặt GOOGLE_APPLICATION_CREDENTIALS trỏ tới service account JSON
 *   - Hoặc đặt FIREBASE_SERVICE_ACCOUNT_JSON bằng nội dung JSON service account
 */

const path = require('path');

const PROJECT_ID = 'linguaflash-f5591';
const TARGET_TOPIC = 'space';
const TARGET_WORDS = new Set(['microgravity', 'void', 'habitable']);
const MAX_BATCH_SIZE = 450;

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

function loadFirebaseAdmin() {
  try {
    return require('firebase-admin');
  } catch (rootError) {
    try {
      return require(path.join(process.cwd(), 'functions', 'node_modules', 'firebase-admin'));
    } catch (functionsError) {
      throw new Error('Thiếu package firebase-admin. Hãy chạy: npm install --prefix functions');
    }
  }
}

function loadServiceAccountFromEnv() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`FIREBASE_SERVICE_ACCOUNT_JSON không phải JSON hợp lệ: ${error.message}`);
  }
}

function getAdminCredential(admin) {
  const serviceAccount = loadServiceAccountFromEnv();
  if (serviceAccount) {
    return admin.credential.cert(serviceAccount);
  }

  return admin.credential.applicationDefault();
}

function getCreatedAtMillis(data) {
  const createdAt = data && data.createdAt;

  if (!createdAt) return 0;
  if (typeof createdAt.toMillis === 'function') return createdAt.toMillis();
  if (typeof createdAt.seconds === 'number') {
    return createdAt.seconds * 1000 + Math.floor((createdAt.nanoseconds || 0) / 1000000);
  }
  if (typeof createdAt === 'number') return createdAt;

  const parsed = Date.parse(createdAt);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function getWord(data) {
  const fv = data.fieldValues || {};
  return normalize(fv.word || data.word || data.front);
}

function getTopic(data) {
  const fv = data.fieldValues || {};
  return normalize(data.topicId || data.folderId || fv.topicId || fv.folderId);
}

function getPartOfSpeech(data) {
  const fv = data.fieldValues || {};
  return normalize(fv.partOfSpeech);
}

function isTargetCard(data) {
  return getTopic(data) === TARGET_TOPIC && TARGET_WORDS.has(getWord(data));
}

function getUserIdFromUserCardPath(pathValue) {
  const parts = String(pathValue || '').split('/');
  return parts[0] === 'users' && parts[2] === 'cards' ? parts[1] : '';
}

function buildDuplicateKey(target) {
  const data = target.data || {};
  const owner = target.source === 'users/*/cards'
    ? `user:${target.userId || getUserIdFromUserCardPath(target.path)}`
    : 'legacy:vocabularyCards';

  return [owner, TARGET_TOPIC, getWord(data), getPartOfSpeech(data)].join('::');
}

async function collectUserCardTargets(db) {
  const targets = [];

  // Liệt kê tất cả users
  const usersSnapshot = await db.collection('users').get();
  
  for (const userDoc of usersSnapshot.docs) {
    const userId = userDoc.id;
    // Query subcollection cards của từng user với filter folderId (không cần composite index)
    const cardsSnapshot = await db.collection('users').doc(userId).collection('cards')
      .where('folderId', '==', TARGET_TOPIC).get();
    
    cardsSnapshot.forEach((doc) => {
      const data = doc.data() || {};
      if (isTargetCard(data)) {
        targets.push({
          ref: doc.ref,
          path: doc.ref.path,
          source: 'users/*/cards',
          userId,
          data
        });
      }
    });
  }

  return targets;
}

async function collectLegacyTargets(db) {
  const targetsByPath = new Map();
  const queries = [
    db.collection('vocabularyCards').where('topicId', '==', TARGET_TOPIC),
    db.collection('vocabularyCards').where('folderId', '==', TARGET_TOPIC)
  ];

  for (const query of queries) {
    const snapshot = await query.get();
    snapshot.forEach((doc) => {
      const data = doc.data() || {};
      if (isTargetCard(data)) {
        targetsByPath.set(doc.ref.path, {
          ref: doc.ref,
          path: doc.ref.path,
          source: 'vocabularyCards',
          userId: '',
          data
        });
      }
    });
  }

  return [...targetsByPath.values()];
}

function findDuplicateDeletes(targets) {
  const groups = new Map();

  targets.forEach((target) => {
    const key = buildDuplicateKey(target);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(target);
  });

  const duplicateGroups = [];
  const deleteTargets = [];

  groups.forEach((group, key) => {
    if (group.length <= 1) return;

    const sorted = [...group].sort((a, b) => {
      const timeA = getCreatedAtMillis(a.data);
      const timeB = getCreatedAtMillis(b.data);
      if (timeA !== timeB) return timeA - timeB;
      return a.path.localeCompare(b.path);
    });

    const keep = sorted[0];
    const remove = sorted.slice(1);
    duplicateGroups.push({ key, keep, remove });
    remove.forEach((target) => deleteTargets.push(target));
  });

  return { duplicateGroups, deleteTargets };
}

async function deleteTargets(db, targets) {
  let deleted = 0;

  for (let i = 0; i < targets.length; i += MAX_BATCH_SIZE) {
    const chunk = targets.slice(i, i + MAX_BATCH_SIZE);
    const batch = db.batch();

    chunk.forEach((target) => batch.delete(target.ref));
    await batch.commit();
    deleted += chunk.length;
  }

  return deleted;
}

function printTarget(prefix, target) {
  const fv = target.data.fieldValues || {};
  console.log(`${prefix} ${target.path} | source=${target.source} | user=${target.userId || '-'} | word=${fv.word || target.data.word || ''} | pos=${fv.partOfSpeech || ''} | createdAt=${getCreatedAtMillis(target.data)}`);
}

async function main() {
  const admin = loadFirebaseAdmin();

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: getAdminCredential(admin),
      projectId: PROJECT_ID
    });
  }

  const db = admin.firestore();
  console.log(`🔍 Đang quét Firestore project "${PROJECT_ID}" để tìm duplicate trong topic "${TARGET_TOPIC}"...`);

  const [userCardTargets, legacyTargets] = await Promise.all([
    collectUserCardTargets(db),
    collectLegacyTargets(db)
  ]);

  const targetsByPath = new Map();
  [...userCardTargets, ...legacyTargets].forEach((target) => targetsByPath.set(target.path, target));
  const targets = [...targetsByPath.values()].sort((a, b) => a.path.localeCompare(b.path));

  console.log(`📦 Tìm thấy ${targets.length} bản ghi mục tiêu thuộc các từ: ${[...TARGET_WORDS].join(', ')}`);
  targets.forEach((target) => printTarget('  -', target));

  const { duplicateGroups, deleteTargets: targetsToDelete } = findDuplicateDeletes(targets);

  if (targetsToDelete.length === 0) {
    console.log('✅ Không tìm thấy duplicate cần xóa. Không cần thao tác.');
    return { found: targets.length, duplicateGroups: 0, deleted: 0, remainingDuplicateDeletes: 0 };
  }

  console.log(`🧨 Tìm thấy ${duplicateGroups.length} nhóm duplicate, sẽ xóa ${targetsToDelete.length} bản sao:`);
  duplicateGroups.forEach((group) => {
    console.log(`\n🔄 ${group.key}`);
    printTarget('   ✓ Giữ', group.keep);
    group.remove.forEach((target) => printTarget('   ✗ Xóa', target));
  });

  const deleted = await deleteTargets(db, targetsToDelete);
  console.log(`✅ Đã xóa ${deleted}/${targetsToDelete.length} bản sao duplicate trong Space.`);

  const [remainingUserTargets, remainingLegacyTargets] = await Promise.all([
    collectUserCardTargets(db),
    collectLegacyTargets(db)
  ]);
  const remainingTargetsByPath = new Map();
  [...remainingUserTargets, ...remainingLegacyTargets].forEach((target) => remainingTargetsByPath.set(target.path, target));
  const remainingTargets = [...remainingTargetsByPath.values()];
  const { duplicateGroups: remainingGroups, deleteTargets: remainingDeleteTargets } = findDuplicateDeletes(remainingTargets);

  if (remainingDeleteTargets.length > 0) {
    console.error('❌ Vẫn còn duplicate sau khi xóa:');
    remainingGroups.forEach((group) => {
      console.error(`\n🔁 ${group.key}`);
      printTarget('   ✓ Giữ', group.keep);
      group.remove.forEach((target) => printTarget('   ✗ Còn dư', target));
    });
    process.exitCode = 2;
    return {
      found: targets.length,
      duplicateGroups: duplicateGroups.length,
      deleted,
      remainingDuplicateDeletes: remainingDeleteTargets.length
    };
  }

  console.log('🎯 Xác nhận 100%: không còn duplicate microgravity/void/habitable trong topic Space ở users/*/cards và vocabularyCards.');
  return {
    found: targets.length,
    duplicateGroups: duplicateGroups.length,
    deleted,
    remainingDuplicateDeletes: 0
  };
}

main()
  .then((result) => {
    console.log('📌 Kết quả:', result);
  })
  .catch((error) => {
    console.error('❌ Lỗi:', error.message);
    process.exitCode = 1;
  });
