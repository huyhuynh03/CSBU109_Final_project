// ============================================
// Compare Seed Vocabulary vs Firestore Cards
// ============================================
// Script này so sánh số từ vựng trong seed files với số thẻ trong Firestore
// Chạy trong Node.js hoặc browser console

(async function compareVocabularyStats() {
    console.log('🔍 Bắt đầu so sánh seed vocabulary vs Firestore cards...\n');
    
    try {
        // Danh sách tất cả topics
        const topics = [
            'family-relationships',
            'daily-life',
            'home-living',
            'food-drink',
            'daily-activities',
            'communication-social',
            'personal-qualities',
            'emotion-feelings',
            'health',
            'education',
            'psychology',
            'culture',
            'arts',
            'media-entertainment',
            'sports',
            'travel',
            'literature-reading',
            'mathematics',
            'physics',
            'chemistry',
            'biology',
            'science',
            'space',
            'environment-climate',
            'energy-resources',
            'information-technology',
            'irregular-comparative',
            'irregular-superlative',
            'irregular-verb-v2',
            'irregular-verb-v3'
        ];
        
        const seedStats = {};
        const firestoreStats = {};
        
        // Lấy dữ liệu từ Firestore
        const db = firebase.firestore();
        const auth = firebase.auth();
        const currentUser = auth.currentUser;
        
        if (!currentUser) {
            console.error('❌ Bạn chưa đăng nhập!');
            return;
        }
        
        console.log(`👤 User: ${currentUser.uid}\n`);
        
        // Lấy tất cả cards từ Firestore
        const cardsSnapshot = await db
            .collection('users')
            .doc(currentUser.uid)
            .collection('cards')
            .get();
        
        // Thống kê cards theo topic
        cardsSnapshot.docs.forEach(cardDoc => {
            const cardData = cardDoc.data();
            const topic = cardData.topic || 'unknown';
            
            if (!firestoreStats[topic]) {
                firestoreStats[topic] = 0;
            }
            firestoreStats[topic]++;
        });
        
        // Lấy dữ liệu từ seed files
        for (const topic of topics) {
            try {
                const response = await fetch(`/seed-vocabulary/${topic}.json`);
                if (response.ok) {
                    const data = await response.json();
                    seedStats[topic] = Array.isArray(data) ? data.length : 0;
                }
            } catch (error) {
                // File không tồn tại, bỏ qua
            }
        }
        
        // So sánh
        console.log('📊 SO SÁNH SEED VOCABULARY vs FIRESTORE CARDS\n');
        console.log('┌─ Topic'.padEnd(45) + '│ Seed │ Firestore │ Chênh lệch');
        console.log('├' + '─'.repeat(43) + '┼──────┼───────────┼──────────');
        
        const allTopics = new Set([...Object.keys(seedStats), ...Object.keys(firestoreStats)]);
        const sortedTopics = Array.from(allTopics).sort();
        
        let totalSeed = 0;
        let totalFirestore = 0;
        let discrepancies = [];
        
        sortedTopics.forEach(topic => {
            const seedCount = seedStats[topic] || 0;
            const firestoreCount = firestoreStats[topic] || 0;
            const diff = firestoreCount - seedCount;
            
            totalSeed += seedCount;
            totalFirestore += firestoreCount;
            
            const status = diff === 0 ? '✅' : (diff > 0 ? '⚠️ ' : '❌');
            
            if (diff !== 0) {
                discrepancies.push({
                    topic,
                    seed: seedCount,
                    firestore: firestoreCount,
                    diff
                });
            }
            
            console.log(
                status + ' ' + topic.padEnd(42) + 
                '│ ' + seedCount.toString().padEnd(4) + 
                '│ ' + firestoreCount.toString().padEnd(7) + 
                '│ ' + (diff > 0 ? '+' : '') + diff
            );
        });
        
        console.log('├' + '─'.repeat(43) + '┼──────┼───────────┼──────────');
        console.log(
            '  TỔNG'.padEnd(45) + 
            '│ ' + totalSeed.toString().padEnd(4) + 
            '│ ' + totalFirestore.toString().padEnd(7) + 
            '│ ' + (totalFirestore - totalSeed > 0 ? '+' : '') + (totalFirestore - totalSeed)
        );
        console.log('└' + '─'.repeat(43) + '┴──────┴───────────┴──────────');
        
        // Chi tiết sự chênh lệch
        if (discrepancies.length > 0) {
            console.log('\n\n' + '='.repeat(70));
            console.log('⚠️  CHI TIẾT SỰ CHÊNH LỆCH');
            console.log('='.repeat(70) + '\n');
            
            discrepancies.sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));
            
            discrepancies.forEach(item => {
                const icon = item.diff > 0 ? '📈' : '📉';
                console.log(`${icon} ${item.topic}`);
                console.log(`   Seed: ${item.seed} | Firestore: ${item.firestore} | Chênh lệch: ${item.diff > 0 ? '+' : ''}${item.diff}`);
                
                if (item.diff > 0) {
                    console.log(`   ⚠️  Firestore có ${item.diff} thẻ THÊM so với seed`);
                } else {
                    console.log(`   ⚠️  Firestore thiếu ${Math.abs(item.diff)} thẻ so với seed`);
                }
                console.log();
            });
        } else {
            console.log('\n✅ Tất cả topics đều khớp giữa seed và Firestore!');
        }
        
        // Tóm tắt
        console.log('\n' + '='.repeat(70));
        console.log('📈 TÓM TẮT');
        console.log('='.repeat(70));
        console.log(`\n✅ Tổng từ vựng trong seed: ${totalSeed}`);
        console.log(`📚 Tổng thẻ trong Firestore: ${totalFirestore}`);
        console.log(`📊 Chênh lệch tổng: ${totalFirestore - totalSeed > 0 ? '+' : ''}${totalFirestore - totalSeed}`);
        console.log(`⚠️  Số topics có chênh lệch: ${discrepancies.length}/${sortedTopics.length}`);
        
        // Lưu kết quả
        const result = {
            timestamp: new Date().toISOString(),
            userId: currentUser.uid,
            totalSeed,
            totalFirestore,
            totalDifference: totalFirestore - totalSeed,
            seedStats,
            firestoreStats,
            discrepancies
        };
        
        window.compareResult = result;
        
        console.log('\n💾 Kết quả lưu tại: window.compareResult');
        
        return result;
        
    } catch (error) {
        console.error('❌ Lỗi:', error);
        throw error;
    }
})();
