/**
 * Script kiểm tra từ "atom" trong Firestore
 * Chạy trong Console của Firebase hoặc Node.js với Firebase Admin SDK
 */

// Paste code này vào Console của Firebase (F12 > Console)
const checkAtomInFirestore = async () => {
  const db = firebase.firestore();
  
  console.log('🔍 Đang kiểm tra từ "atom" trong Firestore...\n');
  
  // Kiểm tra trong topic chemistry
  const chemistryQuery = await db.collection('vocabularyCards')
    .where('topicId', '==', 'chemistry')
    .where('fieldValues.word', '==', 'atom')
    .get();
  
  console.log(`📗 Chemistry: ${chemistryQuery.size} bản ghi`);
  chemistryQuery.forEach(doc => {
    console.log('  - ID:', doc.id);
    console.log('  - Data:', doc.data());
  });
  
  // Kiểm tra trong topic physics
  const physicsQuery = await db.collection('vocabularyCards')
    .where('topicId', '==', 'physics')
    .where('fieldValues.word', '==', 'atom')
    .get();
  
  console.log(`\n📘 Physics: ${physicsQuery.size} bản ghi`);
  physicsQuery.forEach(doc => {
    console.log('  - ID:', doc.id);
    console.log('  - Data:', doc.data());
  });
  
  // Tìm tất cả "atom" không phân biệt topic
  const allAtomQuery = await db.collection('vocabularyCards')
    .where('fieldValues.word', '==', 'atom')
    .get();
  
  console.log(`\n📚 Tổng cộng: ${allAtomQuery.size} bản ghi "atom"`);
  allAtomQuery.forEach(doc => {
    const data = doc.data();
    console.log(`  - Topic: ${data.topicId}, ID: ${doc.id}`);
  });
  
  return {
    chemistry: chemistryQuery.size,
    physics: physicsQuery.size,
    total: allAtomQuery.size
  };
};

// Chạy kiểm tra
checkAtomInFirestore().then(result => {
  console.log('\n✅ Kết quả:', result);
  
  if (result.chemistry > 0) {
    console.log('\n⚠️ CẦN XÓA: Có', result.chemistry, 'bản ghi "atom" trong chemistry');
    console.log('👉 Chạy script xóa để loại bỏ bản ghi trùng lặp');
  } else {
    console.log('\n✅ OK: Không có "atom" trong chemistry');
  }
}).catch(err => {
  console.error('❌ Lỗi:', err);
});
