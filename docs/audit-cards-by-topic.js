// ============================================
// Audit Cards by Topic - Thống kê thẻ học theo topic
// ============================================
// Chạy script này trong Firebase Console để thống kê số thẻ học của từng topic

const admin = require('firebase-admin');

// Initialize Firebase Admin (nếu chưa được khởi tạo)
if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();

async function auditCardsByTopic() {
    console.log('🔍 Bắt đầu thống kê thẻ học theo topic...\n');
    
    try {
        // Lấy tất cả users
        const usersSnapshot = await db.collection('users').get();
        console.log(`📊 Tổng số users: ${usersSnapshot.size}\n`);
        
        const topicStats = {};
        let totalCards = 0;
        
        // Duyệt qua từng user
        for (const userDoc of usersSnapshot.docs) {
            const userId = userDoc.id;
            console.log(`\n👤 User: ${userId}`);
            
            // Lấy tất cả cards của user này
            const cardsSnapshot = await db
                .collection('users')
                .doc(userId)
                .collection('cards')
                .get();
            
            console.log(`   Tổng thẻ: ${cardsSnapshot.size}`);
            totalCards += cardsSnapshot.size;
            
            // Thống kê theo topic
            const userTopicStats = {};
            
            cardsSnapshot.docs.forEach(cardDoc => {
                const cardData = cardDoc.data();
                const topic = cardData.topic || 'unknown';
                
                if (!userTopicStats[topic]) {
                    userTopicStats[topic] = 0;
                }
                userTopicStats[topic]++;
                
                if (!topicStats[topic]) {
                    topicStats[topic] = {
                        total: 0,
                        byUser: {}
                    };
                }
                topicStats[topic].total++;
                if (!topicStats[topic].byUser[userId]) {
                    topicStats[topic].byUser[userId] = 0;
                }
                topicStats[topic].byUser[userId]++;
            });
            
            // In chi tiết topic của user này
            console.log('   Topics:');
            Object.entries(userTopicStats)
                .sort((a, b) => b[1] - a[1])
                .forEach(([topic, count]) => {
                    console.log(`     - ${topic}: ${count} thẻ`);
                });
        }
        
        // Tóm tắt chung
        console.log('\n\n' + '='.repeat(60));
        console.log('📈 THỐNG KÊ CHUNG');
        console.log('='.repeat(60));
        console.log(`\n✅ Tổng số thẻ học: ${totalCards}`);
        console.log(`📚 Tổng số topics: ${Object.keys(topicStats).length}\n`);
        
        // Sắp xếp topics theo số lượng thẻ
        const sortedTopics = Object.entries(topicStats)
            .sort((a, b) => b[1].total - a[1].total);
        
        console.log('📋 Chi tiết từng topic:\n');
        console.log('Topic'.padEnd(40) + 'Số thẻ'.padEnd(10) + 'Chi tiết');
        console.log('-'.repeat(80));
        
        sortedTopics.forEach(([topic, stats]) => {
            const userDetails = Object.entries(stats.byUser)
                .map(([uid, count]) => `${uid.substring(0, 8)}:${count}`)
                .join(', ');
            
            console.log(
                topic.padEnd(40) + 
                stats.total.toString().padEnd(10) + 
                userDetails
            );
        });
        
        // Tìm topics có sự chênh lệch
        console.log('\n\n' + '='.repeat(60));
        console.log('⚠️  PHÁT HIỆN SỰ CHÊNH LỆCH');
        console.log('='.repeat(60) + '\n');
        
        let hasDiscrepancy = false;
        
        sortedTopics.forEach(([topic, stats]) => {
            const userCounts = Object.values(stats.byUser);
            if (userCounts.length > 1) {
                const maxCount = Math.max(...userCounts);
                const minCount = Math.min(...userCounts);
                
                if (maxCount !== minCount) {
                    hasDiscrepancy = true;
                    console.log(`❌ ${topic}`);
                    console.log(`   Tổng: ${stats.total} thẻ`);
                    console.log(`   Chênh lệch: ${maxCount - minCount} thẻ`);
                    Object.entries(stats.byUser).forEach(([uid, count]) => {
                        console.log(`   - ${uid}: ${count} thẻ`);
                    });
                    console.log();
                }
            }
        });
        
        if (!hasDiscrepancy) {
            console.log('✅ Không phát hiện sự chênh lệch giữa các users!');
        }
        
        // Export kết quả ra file JSON
        const result = {
            timestamp: new Date().toISOString(),
            totalCards,
            totalTopics: Object.keys(topicStats).length,
            topicStats: Object.fromEntries(
                sortedTopics.map(([topic, stats]) => [
                    topic,
                    {
                        total: stats.total,
                        byUser: stats.byUser
                    }
                ])
            )
        };
        
        console.log('\n\n📁 Kết quả đã được lưu vào: docs/audit-cards-by-topic-result.json');
        
        return result;
        
    } catch (error) {
        console.error('❌ Lỗi:', error);
        throw error;
    }
}

// Chạy audit
auditCardsByTopic()
    .then(result => {
        console.log('\n✅ Hoàn thành!');
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ Lỗi:', error);
        process.exit(1);
    });
