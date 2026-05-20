// ============================================
// Firestore Cards Audit by Topic - Browser Console Script
// ============================================
// Chạy script này trong browser console (F12) khi đã đăng nhập vào app
// Sẽ thống kê số thẻ học của từng topic hiện tại trong Firestore

(async function auditFirestoreCardsByTopic() {
    console.log('🔍 Bắt đầu thống kê thẻ học theo topic từ Firestore...\n');
    
    try {
        const db = firebase.firestore();
        const auth = firebase.auth();
        const currentUser = auth.currentUser;
        
        if (!currentUser) {
            console.error('❌ Bạn chưa đăng nhập!');
            return;
        }
        
        console.log(`👤 User: ${currentUser.uid}\n`);
        
        // Lấy tất cả cards của user hiện tại
        const cardsSnapshot = await db
            .collection('users')
            .doc(currentUser.uid)
            .collection('cards')
            .get();
        
        console.log(`📊 Tổng số thẻ: ${cardsSnapshot.size}\n`);
        
        // Thống kê theo topic
        const topicStats = {};
        let totalCards = 0;
        
        cardsSnapshot.docs.forEach(cardDoc => {
            const cardData = cardDoc.data();
            const topic = cardData.topic || 'unknown';
            
            if (!topicStats[topic]) {
                topicStats[topic] = {
                    total: 0,
                    byState: {},
                    byCardType: {}
                };
            }
            
            topicStats[topic].total++;
            totalCards++;
            
            // Thống kê theo state
            const state = cardData.state || 'unknown';
            if (!topicStats[topic].byState[state]) {
                topicStats[topic].byState[state] = 0;
            }
            topicStats[topic].byState[state]++;
            
            // Thống kê theo cardType
            const cardType = cardData.cardType || 'unknown';
            if (!topicStats[topic].byCardType[cardType]) {
                topicStats[topic].byCardType[cardType] = 0;
            }
            topicStats[topic].byCardType[cardType]++;
        });
        
        // Sắp xếp topics theo số lượng thẻ
        const sortedTopics = Object.entries(topicStats)
            .sort((a, b) => b[1].total - a[1].total);
        
        console.log('📋 Chi tiết từng topic:\n');
        console.log('┌─ Topic'.padEnd(45) + '│ Số thẻ │ States');
        console.log('├' + '─'.repeat(43) + '┼────────┼─────────────────────');
        
        sortedTopics.forEach(([topic, stats]) => {
            const stateDetails = Object.entries(stats.byState)
                .map(([state, count]) => `${state}:${count}`)
                .join(', ');
            
            console.log(
                topic.padEnd(45) + 
                '│ ' + stats.total.toString().padEnd(5) + 
                '│ ' + stateDetails
            );
        });
        console.log('└' + '─'.repeat(43) + '┴────────┴─────────────────────');
        
        // Tóm tắt
        console.log('\n\n' + '='.repeat(70));
        console.log('📈 TÓM TẮT');
        console.log('='.repeat(70));
        console.log(`\n✅ Tổng số thẻ: ${totalCards}`);
        console.log(`📚 Tổng số topics: ${sortedTopics.length}`);
        
        // Thống kê theo state
        const stateStats = {};
        sortedTopics.forEach(([_, stats]) => {
            Object.entries(stats.byState).forEach(([state, count]) => {
                if (!stateStats[state]) {
                    stateStats[state] = 0;
                }
                stateStats[state] += count;
            });
        });
        
        console.log('\n📊 Thống kê theo State:');
        Object.entries(stateStats)
            .sort((a, b) => b[1] - a[1])
            .forEach(([state, count]) => {
                const percentage = ((count / totalCards) * 100).toFixed(1);
                console.log(`   ${state}: ${count} (${percentage}%)`);
            });
        
        // Lưu kết quả
        const result = {
            timestamp: new Date().toISOString(),
            userId: currentUser.uid,
            totalCards,
            totalTopics: sortedTopics.length,
            topicStats: Object.fromEntries(sortedTopics),
            stateStats
        };
        
        window.firestoreAuditResult = result;
        
        console.log('\n\n' + '='.repeat(70));
        console.log('💾 EXPORT KẾT QUẢ');
        console.log('='.repeat(70));
        console.log('\nKết quả đã được lưu vào: window.firestoreAuditResult');
        console.log('\nCó thể export bằng lệnh:');
        console.log('  copy(JSON.stringify(window.firestoreAuditResult, null, 2))');
        
        console.log('\n✅ Hoàn thành!');
        
        return result;
        
    } catch (error) {
        console.error('❌ Lỗi:', error);
        throw error;
    }
})();
