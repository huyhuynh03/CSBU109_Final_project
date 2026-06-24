#!/usr/bin/env node
/**
 * Xóa từ trùng lặp giữa các vocabulary topics trong Firestore.
 *
 * Đọc danh sách từ docs/audit-duplicates-result.json (được tạo bởi audit script),
 * loại trừ các homonyms (từ đồng âm khác nghĩa), và xóa cards trùng lặp.
 *
 * Cách chạy:
 *   set "GOOGLE_APPLICATION_CREDENTIALS=linguaflash-f5591-firebase-adminsdk-fbsvc-a90c24198d.json"
 *   node docs/delete-cross-topic-duplicates.js
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ID = 'linguaflash-f5591';
const MAX_BATCH_SIZE = 450;

// Homonyms - từ đồng âm khác nghĩa, GIỮ CẢ HAI bản
// Format: "word|partOfSpeech|topic1|topic2" - cặp topic mà từ có nghĩa khác nhau
const HOMONYM_EXCLUSIONS = [
  // "function" (noun): math = "hàm số" vs IT = "hàm, chức năng"
  { word: 'function', partOfSpeech: 'noun', topics: ['mathematics', 'information-technology'] },
  // "product" (noun): math = "tích" vs chemistry = "sản phẩm phản ứng"
  { word: 'product', partOfSpeech: 'noun', topics: ['mathematics', 'chemistry'] },
  // "virus" (noun): health = "vi-rút bệnh" vs IT = "vi-rút máy tính"
  { word: 'virus', partOfSpeech: 'noun', topics: ['health', 'information-technology'] },
];

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

function isExcluded(word, partOfSpeech, deleteFromTopic, keepInTopic) {
  return HOMONYM_EXCLUSIONS.some(exc => {
    if (exc.word !== word || exc.partOfSpeech !== partOfSpeech) return false;
    // If both the keep and delete topics are in the exclusion list, skip this deletion
    return exc.topics.includes(deleteFromTopic) && exc.topics.includes(keepInTopic);
  });
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

function loadDuplicatesList() {
  const filePath = path.join(__dirname, 'audit-duplicates-result.json');
  if (!fs.existsSync(filePath)) {
    throw new Error(`Không tìm thấy file ${filePath}. Hãy chạy audit script trước.`);
  }
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  return data.duplicates || [];
}

function buildDeleteList(duplicates) {
  const deleteList = [];

  for (const dup of duplicates) {
    const word = normalize(dup.word);
    const pos = normalize(dup.partOfSpeech);
    const keepTopic = normalize(dup.keepInTopic);

    for (const topic of dup.deleteFromTopics) {
      const deleteTopic = normalize(topic);

      if (isExcluded(word, pos, deleteTopic, keepTopic)) {
        console.log(`  ⏭️  SKIP (homonym): "${word}" (${pos}) in "${deleteTopic}" — khác nghĩa với "${keepTopic}"`);
        continue;
      }

      deleteList.push({ word, partOfSpeech: pos, topicId: deleteTopic, keepInTopic: keepTopic });
    }
  }

  return deleteList;
}

function isTargetCard(data, word, partOfSpeech, topicId) {
  const fv = data.fieldValues || {};
  const cardWord = normalize(fv.word || data.word || data.front);
  const cardPos = normalize(fv.partOfSpeech);
  const cardTopic = normalize(data.topicId || data.folderId || fv.topicId || fv.folderId);

  return cardWord === word && cardPos === partOfSpeech && cardTopic === topicId;
}

async function collectTargets(db, deleteList) {
  const targets = [];

  // Build a lookup map for quick matching
  const deleteMap = new Map();
  for (const item of deleteList) {
    const key = `${item.word}|${item.partOfSpeech}|${item.topicId}`;
    deleteMap.set(key, item);
  }

  // Get unique topics to query
  const topicsToQuery = [...new Set(deleteList.map(d => d.topicId))];

  console.log(`\n  Quét ${topicsToQuery.length} topics trong users/*/cards...`);

  // Iterate through users
  const usersSnapshot = await db.collection('users').get();
  console.log(`  Tìm thấy ${usersSnapshot.size} users.`);

  for (const userDoc of usersSnapshot.docs) {
    const userId = userDoc.id;

    for (const topicId of topicsToQuery) {
      const cardsSnapshot = await db.collection('users').doc(userId).collection('cards')
        .where('folderId', '==', topicId).get();

      cardsSnapshot.forEach((doc) => {
        const data = doc.data() || {};
        const fv = data.fieldValues || {};
        const cardWord = normalize(fv.word || data.word || data.front);
        const cardPos = normalize(fv.partOfSpeech);
        const key = `${cardWord}|${cardPos}|${topicId}`;

        if (deleteMap.has(key)) {
          targets.push({
            ref: doc.ref,
            path: doc.ref.path,
            source: 'users/*/cards',
            userId,
            word: cardWord,
            partOfSpeech: cardPos,
            topicId,
            keepInTopic: deleteMap.get(key).keepInTopic
          });
        }
      });
    }
  }

  // Also check legacy vocabularyCards collection
  console.log(`  Quét vocabularyCards (legacy)...`);
  for (const topicId of topicsToQuery) {
    const queries = [
      db.collection('vocabularyCards').where('topicId', '==', topicId),
      db.collection('vocabularyCards').where('folderId', '==', topicId)
    ];

    const seenPaths = new Set();
    for (const query of queries) {
      const snapshot = await query.get();
      snapshot.forEach((doc) => {
        if (seenPaths.has(doc.ref.path)) return;
        const data = doc.data() || {};
        const fv = data.fieldValues || {};
        const cardWord = normalize(fv.word || data.word || data.front);
        const cardPos = normalize(fv.partOfSpeech);
        const key = `${cardWord}|${cardPos}|${topicId}`;

        if (deleteMap.has(key)) {
          seenPaths.add(doc.ref.path);
          targets.push({
            ref: doc.ref,
            path: doc.ref.path,
            source: 'vocabularyCards',
            word: cardWord,
            partOfSpeech: cardPos,
            topicId,
            keepInTopic: deleteMap.get(key).keepInTopic
          });
        }
      });
    }
  }

  return targets;
}

async function deleteTargets(db, targets) {
  let deleted = 0;
  for (let i = 0; i < targets.length; i += MAX_BATCH_SIZE) {
    const chunk = targets.slice(i, i + MAX_BATCH_SIZE);
    const batch = db.batch();
    chunk.forEach((target) => batch.delete(target.ref));
    await batch.commit();
    deleted += chunk.length;
    if (targets.length > MAX_BATCH_SIZE) {
      console.log(`    Batch ${Math.floor(i / MAX_BATCH_SIZE) + 1}: deleted ${chunk.length} (total: ${deleted}/${targets.length})`);
    }
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

  console.log('='.repeat(70));
  console.log('🧹 XÓA TỪ TRÙNG LẶP GIỮA CÁC VOCABULARY TOPICS');
  console.log(`   Project: ${PROJECT_ID}`);
  console.log('='.repeat(70));

  // Load and filter duplicates
  console.log('\n📋 Phase 1: Đọc danh sách duplicates...');
  const duplicates = loadDuplicatesList();
  console.log(`  Tổng duplicates từ audit: ${duplicates.length}`);

  const deleteList = buildDeleteList(duplicates);
  console.log(`\n  📊 Sau khi loại trừ homonyms: ${deleteList.length} từ cần xóa`);

  if (deleteList.length === 0) {
    console.log('\n✅ Không có gì cần xóa.');
    return { found: 0, deleted: 0 };
  }

  // Show summary by topic
  const byTopic = new Map();
  for (const item of deleteList) {
    if (!byTopic.has(item.topicId)) byTopic.set(item.topicId, []);
    byTopic.get(item.topicId).push(item);
  }
  console.log('\n  Phân bổ theo topic:');
  for (const [topic, items] of [...byTopic.entries()].sort((a, b) => b[1].length - a[1].length)) {
    console.log(`    ${topic}: ${items.length} từ`);
  }

  // Collect targets from Firestore
  console.log('\n🔍 Phase 2: Tìm cards trong Firestore...');
  const targets = await collectTargets(db, deleteList);
  console.log(`\n  📊 Tìm thấy ${targets.length} cards cần xóa trong Firestore.`);

  if (targets.length === 0) {
    console.log('\n✅ Không tìm thấy cards nào trong Firestore cần xóa.');
    return { found: 0, deleted: 0 };
  }

  // Show first 20 targets
  console.log('\n  Mẫu (20 đầu tiên):');
  targets.slice(0, 20).forEach(t => {
    console.log(`    - ${t.path} | "${t.word}" (${t.partOfSpeech}) in ${t.topicId} → keep in ${t.keepInTopic}`);
  });
  if (targets.length > 20) {
    console.log(`    ... và ${targets.length - 20} cards khác`);
  }

  // Delete
  console.log('\n🧨 Phase 3: Xóa cards...');
  const deleted = await deleteTargets(db, targets);
  console.log(`  ✅ Đã xóa ${deleted}/${targets.length} cards.`);

  // Verify
  console.log('\n🔍 Phase 4: Xác nhận...');
  const remaining = await collectTargets(db, deleteList);

  if (remaining.length === 0) {
    console.log('  🎯 Xác nhận 100%: không còn duplicates trong Firestore.');
  } else {
    console.error(`  ❌ Vẫn còn ${remaining.length} cards chưa xóa được!`);
    remaining.slice(0, 10).forEach(t => {
      console.error(`    - ${t.path}`);
    });
    process.exitCode = 2;
  }

  return { found: targets.length, deleted, remaining: remaining.length };
}

main()
  .then((result) => {
    console.log('\n📌 Kết quả:', result);
  })
  .catch((error) => {
    console.error('❌ Lỗi:', error.message);
    process.exitCode = 1;
  });
