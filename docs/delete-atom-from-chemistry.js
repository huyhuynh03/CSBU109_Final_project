#!/usr/bin/env node
/**
 * Xóa triệt để từ "atom" khỏi topic Chemistry trong Firestore.
 *
 * Script này dùng Firebase Admin SDK nên KHÔNG bị chặn bởi Firestore Security Rules
 * kiểu "Missing or insufficient permissions" khi chạy trong browser console.
 *
 * Phạm vi xóa:
 * 1. Dữ liệu hiện tại của app: users/{userId}/cards/{cardId}
 *    - folderId == "chemistry"
 *    - fieldValues.word == "atom" (không phân biệt hoa/thường, có trim)
 * 2. Dữ liệu legacy nếu còn tồn tại: vocabularyCards/{cardId}
 *    - topicId == "chemistry" hoặc folderId == "chemistry"
 *    - fieldValues.word == "atom" (không phân biệt hoa/thường, có trim)
 *
 * Cách chạy:
 *   npm install
 *   node docs/delete-atom-from-chemistry.js
 *
 * Yêu cầu xác thực admin, chọn 1 trong 2 cách:
 *   - Đặt GOOGLE_APPLICATION_CREDENTIALS trỏ tới service account JSON
 *   - Hoặc đặt FIREBASE_SERVICE_ACCOUNT_JSON bằng nội dung JSON service account
 */

const PROJECT_ID = 'linguaflash-f5591';
const TARGET_WORD = 'atom';
const TARGET_TOPIC = 'chemistry';
const MAX_BATCH_SIZE = 450;

function normalize(value) {
  return String(value || '').trim().toLowerCase();
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

function isTargetCard(data) {
  const fieldValues = data.fieldValues || {};
  const word = normalize(fieldValues.word || data.word || data.front);
  const topic = normalize(data.topicId || data.folderId || fieldValues.topicId || fieldValues.folderId);

  return word === TARGET_WORD && topic === TARGET_TOPIC;
}

async function collectUserCardTargets(db) {
  const snapshot = await db.collectionGroup('cards').where('folderId', '==', TARGET_TOPIC).get();
  const targets = [];

  snapshot.forEach((doc) => {
    const data = doc.data() || {};
    if (isTargetCard(data)) {
      targets.push({ ref: doc.ref, path: doc.ref.path, source: 'users/*/cards', data });
    }
  });

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
        targetsByPath.set(doc.ref.path, { ref: doc.ref, path: doc.ref.path, source: 'vocabularyCards', data });
      }
    });
  }

  return [...targetsByPath.values()];
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

async function main() {
  let admin;
  try {
    admin = require('firebase-admin');
  } catch (error) {
    throw new Error('Thiếu package firebase-admin. Hãy chạy: npm install');
  }

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: getAdminCredential(admin),
      projectId: PROJECT_ID
    });
  }

  const db = admin.firestore();

  console.log(`🔍 Đang quét toàn bộ Firestore project "${PROJECT_ID}" để tìm "${TARGET_WORD}" trong Chemistry...`);

  const [userCardTargets, legacyTargets] = await Promise.all([
    collectUserCardTargets(db),
    collectLegacyTargets(db)
  ]);

  const targetsByPath = new Map();
  [...userCardTargets, ...legacyTargets].forEach((target) => targetsByPath.set(target.path, target));
  const targets = [...targetsByPath.values()].sort((a, b) => a.path.localeCompare(b.path));

  if (targets.length === 0) {
    console.log('✅ Không tìm thấy bản ghi "atom" nào trong topic Chemistry. Không cần xóa.');
    return { found: 0, deleted: 0, remaining: 0 };
  }

  console.log(`🧨 Tìm thấy ${targets.length} bản ghi cần xóa:`);
  targets.forEach((target) => {
    const fv = target.data.fieldValues || {};
    console.log(`  - ${target.path} | source=${target.source} | word=${fv.word || target.data.word || ''} | folderId=${target.data.folderId || ''} | topicId=${target.data.topicId || ''}`);
  });

  const deleted = await deleteTargets(db, targets);
  console.log(`✅ Đã xóa ${deleted}/${targets.length} bản ghi "atom" khỏi Chemistry.`);

  const [remainingUserTargets, remainingLegacyTargets] = await Promise.all([
    collectUserCardTargets(db),
    collectLegacyTargets(db)
  ]);
  const remainingPaths = new Set([...remainingUserTargets, ...remainingLegacyTargets].map((target) => target.path));

  if (remainingPaths.size > 0) {
    console.error('❌ Vẫn còn bản ghi sau khi xóa:');
    [...remainingPaths].sort().forEach((path) => console.error(`  - ${path}`));
    process.exitCode = 2;
    return { found: targets.length, deleted, remaining: remainingPaths.size };
  }

  console.log('🎯 Xác nhận 100%: không còn "atom" trong topic Chemistry ở users/*/cards và vocabularyCards.');
  return { found: targets.length, deleted, remaining: 0 };
}

main()
  .then((result) => {
    console.log('📌 Kết quả:', result);
  })
  .catch((error) => {
    console.error('❌ Lỗi:', error.message);
    process.exitCode = 1;
  });
