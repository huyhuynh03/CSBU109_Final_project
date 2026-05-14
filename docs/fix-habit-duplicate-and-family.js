#!/usr/bin/env node
/**
 * Script xử lý từ "habit" bị trùng lặp giữa 2 topic và gắn family word.
 *
 * Hành động:
 * 1. XÓA: card "habit" (noun) trong topic "health"
 *    - Giữ lại "habit" trong topic "daily-life"
 * 2. GẮN FAMILY: đảm bảo các card "habit" (noun) và "habitual" (adj)
 *    trong topic "daily-life" có familyId = "habit" và familyOrder đúng.
 *
 * Phạm vi:
 *   - users/{userId}/cards/{cardId}
 *   - vocabularyCards/{cardId} (legacy)
 *
 * Cách chạy:
 *   set "GOOGLE_APPLICATION_CREDENTIALS=linguaflash-f5591-firebase-adminsdk-fbsvc-a90c24198d.json"
 *   node docs/fix-habit-duplicate-and-family.js
 */

const PROJECT_ID = 'linguaflash-f5591';
const TARGET_WORD = 'habit';
const DELETE_FROM_TOPIC = 'health';
const KEEP_IN_TOPIC = 'daily-life';
const FAMILY_ID = 'habit';
const MAX_BATCH_SIZE = 450;

// Family members: word -> { partOfSpeech, familyOrder }
const FAMILY_MEMBERS = {
  habit: { partOfSpeech: 'noun', familyOrder: 1 },
  habitual: { partOfSpeech: 'adjective', familyOrder: 2 }
};

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

function isDeleteTarget(data) {
  const fv = data.fieldValues || {};
  const word = normalize(fv.word || data.word || data.front);
  const topic = normalize(data.topicId || data.folderId || fv.topicId || fv.folderId);
  const pos = normalize(fv.partOfSpeech);
  return word === TARGET_WORD && topic === DELETE_FROM_TOPIC && pos === 'noun';
}

function isFamilyTarget(data) {
  const fv = data.fieldValues || {};
  const word = normalize(fv.word || data.word || data.front);
  const topic = normalize(data.topicId || data.folderId || fv.topicId || fv.folderId);
  return topic === KEEP_IN_TOPIC && FAMILY_MEMBERS[word] !== undefined;
}

function needsFamilyUpdate(data) {
  const fv = data.fieldValues || {};
  const word = normalize(fv.word || data.word || data.front);
  const member = FAMILY_MEMBERS[word];
  if (!member) return false;

  // Cần update nếu familyId chưa đúng hoặc familyOrder chưa đúng
  return fv.familyId !== FAMILY_ID || fv.familyOrder !== member.familyOrder;
}

// Iterate through users individually to avoid collection group index requirement
async function collectUserCardTargets(db) {
  const deleteTargets = [];
  const familyTargets = [];

  const usersSnapshot = await db.collection('users').get();
  console.log(`  Quét ${usersSnapshot.size} users...`);

  for (const userDoc of usersSnapshot.docs) {
    const userId = userDoc.id;

    // Tìm cards trong topic health (để xóa habit)
    const healthCards = await db.collection('users').doc(userId).collection('cards')
      .where('folderId', '==', DELETE_FROM_TOPIC).get();

    healthCards.forEach((doc) => {
      const data = doc.data() || {};
      if (isDeleteTarget(data)) {
        deleteTargets.push({ ref: doc.ref, path: doc.ref.path, source: 'users/*/cards', userId, data });
      }
    });

    // Tìm cards trong topic daily-life (để gắn family)
    const dailyLifeCards = await db.collection('users').doc(userId).collection('cards')
      .where('folderId', '==', KEEP_IN_TOPIC).get();

    dailyLifeCards.forEach((doc) => {
      const data = doc.data() || {};
      if (isFamilyTarget(data) && needsFamilyUpdate(data)) {
        familyTargets.push({ ref: doc.ref, path: doc.ref.path, source: 'users/*/cards', userId, data });
      }
    });
  }

  return { deleteTargets, familyTargets };
}

async function collectLegacyTargets(db) {
  const deleteTargets = [];
  const familyTargets = [];

  // Legacy: xóa habit từ health
  const queries = [
    db.collection('vocabularyCards').where('topicId', '==', DELETE_FROM_TOPIC),
    db.collection('vocabularyCards').where('folderId', '==', DELETE_FROM_TOPIC)
  ];

  const seenPaths = new Set();
  for (const query of queries) {
    const snapshot = await query.get();
    snapshot.forEach((doc) => {
      if (seenPaths.has(doc.ref.path)) return;
      const data = doc.data() || {};
      if (isDeleteTarget(data)) {
        seenPaths.add(doc.ref.path);
        deleteTargets.push({ ref: doc.ref, path: doc.ref.path, source: 'vocabularyCards', data });
      }
    });
  }

  // Legacy: gắn family cho daily-life
  const familyQueries = [
    db.collection('vocabularyCards').where('topicId', '==', KEEP_IN_TOPIC),
    db.collection('vocabularyCards').where('folderId', '==', KEEP_IN_TOPIC)
  ];

  const seenFamilyPaths = new Set();
  for (const query of familyQueries) {
    const snapshot = await query.get();
    snapshot.forEach((doc) => {
      if (seenFamilyPaths.has(doc.ref.path)) return;
      const data = doc.data() || {};
      if (isFamilyTarget(data) && needsFamilyUpdate(data)) {
        seenFamilyPaths.add(doc.ref.path);
        familyTargets.push({ ref: doc.ref, path: doc.ref.path, source: 'vocabularyCards', data });
      }
    });
  }

  return { deleteTargets, familyTargets };
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

async function updateFamilyTargets(db, targets) {
  let updated = 0;
  for (let i = 0; i < targets.length; i += MAX_BATCH_SIZE) {
    const chunk = targets.slice(i, i + MAX_BATCH_SIZE);
    const batch = db.batch();

    chunk.forEach((target) => {
      const fv = target.data.fieldValues || {};
      const word = normalize(fv.word || target.data.word || target.data.front);
      const member = FAMILY_MEMBERS[word];
      if (!member) return;

      batch.update(target.ref, {
        'fieldValues.familyId': FAMILY_ID,
        'fieldValues.familyOrder': member.familyOrder
      });
    });

    await batch.commit();
    updated += chunk.length;
  }
  return updated;
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

  console.log('='.repeat(70));
  console.log(`🔧 Fix habit duplicate & family word tags`);
  console.log(`   Project: ${PROJECT_ID}`);
  console.log(`   Xóa: "${TARGET_WORD}" (noun) từ topic "${DELETE_FROM_TOPIC}"`);
  console.log(`   Giữ: "${TARGET_WORD}" trong topic "${KEEP_IN_TOPIC}"`);
  console.log(`   Gắn familyId="${FAMILY_ID}" cho: ${Object.keys(FAMILY_MEMBERS).join(', ')}`);
  console.log('='.repeat(70));

  // --- Phase 1: Thu thập targets ---
  console.log('\n📋 Phase 1: Thu thập targets...');

  console.log('  [users/*/cards]');
  const userResults = await collectUserCardTargets(db);

  console.log('  [vocabularyCards (legacy)]');
  const legacyResults = await collectLegacyTargets(db);

  // Merge delete targets
  const allDeleteTargets = [...userResults.deleteTargets, ...legacyResults.deleteTargets];
  const allFamilyTargets = [...userResults.familyTargets, ...legacyResults.familyTargets];

  console.log(`\n  📊 Kết quả quét:`);
  console.log(`     - Cần xóa (habit trong health): ${allDeleteTargets.length}`);
  console.log(`     - Cần gắn family: ${allFamilyTargets.length}`);

  // --- Phase 2: Xóa habit từ health ---
  if (allDeleteTargets.length > 0) {
    console.log('\n🧨 Phase 2: Xóa "habit" từ topic health...');
    allDeleteTargets.forEach((t) => {
      const fv = t.data.fieldValues || {};
      console.log(`  - ${t.path} | word=${fv.word} | folderId=${t.data.folderId || t.data.topicId}`);
    });

    const deleted = await deleteTargets(db, allDeleteTargets);
    console.log(`  ✅ Đã xóa ${deleted} bản ghi.`);
  } else {
    console.log('\n✅ Phase 2: Không tìm thấy "habit" trong topic health. Không cần xóa.');
  }

  // --- Phase 3: Gắn family word ---
  if (allFamilyTargets.length > 0) {
    console.log('\n🏷️  Phase 3: Gắn family word tags...');
    allFamilyTargets.forEach((t) => {
      const fv = t.data.fieldValues || {};
      const word = normalize(fv.word);
      const member = FAMILY_MEMBERS[word];
      console.log(`  - ${t.path} | word=${fv.word} | familyId: ${fv.familyId || '(none)'} → ${FAMILY_ID} | order: ${fv.familyOrder || '(none)'} → ${member?.familyOrder}`);
    });

    const updated = await updateFamilyTargets(db, allFamilyTargets);
    console.log(`  ✅ Đã cập nhật ${updated} bản ghi.`);
  } else {
    console.log('\n✅ Phase 3: Tất cả family members đã có familyId đúng. Không cần cập nhật.');
  }

  // --- Phase 4: Xác nhận ---
  console.log('\n🔍 Phase 4: Xác nhận kết quả...');

  const verifyUser = await collectUserCardTargets(db);
  const verifyLegacy = await collectLegacyTargets(db);

  const remainingDeletes = verifyUser.deleteTargets.length + verifyLegacy.deleteTargets.length;
  const remainingFamilyFixes = verifyUser.familyTargets.length + verifyLegacy.familyTargets.length;

  if (remainingDeletes === 0 && remainingFamilyFixes === 0) {
    console.log('🎯 Xác nhận 100%:');
    console.log('   - Không còn "habit" trong topic health');
    console.log('   - Tất cả family members trong daily-life đã có familyId đúng');
  } else {
    if (remainingDeletes > 0) {
      console.error(`❌ Vẫn còn ${remainingDeletes} bản ghi "habit" trong health!`);
    }
    if (remainingFamilyFixes > 0) {
      console.error(`❌ Vẫn còn ${remainingFamilyFixes} bản ghi cần gắn family!`);
    }
    process.exitCode = 2;
  }

  return {
    deleted: allDeleteTargets.length,
    familyUpdated: allFamilyTargets.length,
    remainingDeletes,
    remainingFamilyFixes
  };
}

main()
  .then((result) => {
    console.log('\n📌 Kết quả cuối cùng:', result);
  })
  .catch((error) => {
    console.error('❌ Lỗi:', error.message);
    process.exitCode = 1;
  });
