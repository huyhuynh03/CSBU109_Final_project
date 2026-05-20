// ============================================
// Audit Cards by Topic - Browser Console Script
// ============================================
// Chạy script này trong browser console (F12) khi đã đăng nhập vào app
// Sẽ thống kê số thẻ học của từng topic và phát hiện sự chênh lệch

(async function auditCardsByTopic() {
    console.log('🔍 Bắt đầu thống kê thẻ học theo topic...\n');
    
    try {
        const db = firebase.firestore();
        const auth = firebase.auth();
        const currentUser = auth.currentUser;
        
        if (!currentUser) {
            console.error('❌ Bạn chưa đăng nhập!');
            return;
        }
        
        console.log(`👤 User hiện tại: ${currentUser.uid}\n`);
        
        // Lấy tất cả cards của user hiện tại
        const cardsSnapshot = await db
            .collection('users')
            .doc(currentUser.uid)
            .collection('cards')
            .get();
        
        console.log(`📊 Tổng số thẻ: ${cardsSnapshot.size}\n`);
        
        // Thống kê theo topic
        const topicStats = {};
        
        cardsSnapshot.docs.forEach(cardDoc => {
            const cardData = cardDoc.data();
            const topic = cardData.topic || 'unknown';
            const folderId = cardData.folderId || 'no-folder';
            
            if (!topicStats[topic]) {
                topicStats[topic] = {
                    total: 0,
                    byFolder: {},
                    cards: []
                };
            }
            
            topicStats[topic].total++;
            
            if (!topicStats[topic].byFolder[folderId]) {
                topicStats[topic].byFolder[folderId] = 0;
            }
            topicStats[topic].byFolder[folderId]++;
            
            topicStats[topic].cards.push({
                id: cardDoc.id,
                front: cardData.front,
                back: cardData.back,
                folderId: folderId
            });
        });
        
        // Sắp xếp topics theo số lượng thẻ
        const sortedTopics = Object.entries(topicStats)
            .sort((a, b) => b[1].total - a[1].total);
        
        console.log('📋 Chi tiết từng topic:\n');
        console.log('┌─ Topic'.padEnd(45) + '│ Số thẻ │ Chi tiết');
        console.log('├' + '─'.repeat(43) + '┼────────┼─────────────────────');
        
        sortedTopics.forEach(([topic, stats]) => {
            const folderDetails = Object.entries(stats.byFolder)
                .map(([fid, count]) => `${fid === 'no-folder' ? 'no-folder' : fid.substring(0, 8)}:${count}`)
                .join(', ');
            
            console.log(
                topic.padEnd(45) + 
                '│ ' + stats.total.toString().padEnd(5) + '│ ' + 
                folderDetails
            );
        });
        console.log('└' + '─'.repeat(43) + '┴────────┴─────────────────────');
        
        // Tìm topics có sự chênh lệch
        console.log('\n\n' + '='.repeat(70));
        console.log('⚠️  PHÁT HIỆN SỰ CHÊNH LỆCH GIỮA CÁC FOLDER');
        console.log('='.repeat(70) + '\n');
        
        let hasDiscrepancy = false;
        
        sortedTopics.forEach(([topic, stats]) => {
            const folderCounts = Object.values(stats.byFolder);
            if (folderCounts.length > 1) {
                const maxCount = Math.max(...folderCounts);
                const minCount = Math.min(...folderCounts);
                
                if (maxCount !== minCount) {
                    hasDiscrepancy = true;
                    console.log(`❌ ${topic}`);
                    console.log(`   Tổng: ${stats.total} thẻ`);
                    console.log(`   Chênh lệch: ${maxCount - minCount} thẻ`);
                    Object.entries(stats.byFolder).forEach(([fid, count]) => {
                        console.log(`   - ${fid === 'no-folder' ? 'no-folder' : fid}: ${count} thẻ`);
                    });
                    console.log();
                }
            }
        });
        
        if (!hasDiscrepancy) {
            console.log('✅ Không phát hiện sự chênh lệch giữa các folders!');
        }
        
        // Tạo object kết quả để export
        const result = {
            timestamp: new Date().toISOString(),
            userId: currentUser.uid,
            totalCards: cardsSnapshot.size,
            totalTopics: Object.keys(topicStats).length,
            topicStats: Object.fromEntries(
                sortedTopics.map(([topic, stats]) => [
                    topic,
                    {
                        total: stats.total,
                        byFolder: stats.byFolder
                    }
                ])
            )
        };
        
        // Lưu vào window để có thể export
        window.auditResult = result;
        
        console.log('\n\n' + '='.repeat(70));
        console.log('💾 EXPORT KẾT QUẢ');
        console.log('='.repeat(70));
        console.log('\nKết quả đã được lưu vào: window.auditResult');
        console.log('\nCó thể export bằng lệnh:');
        console.log('  copy(JSON.stringify(window.auditResult, null, 2))');
        console.log('\nHoặc download file:');
        console.log('  const a = document.createElement("a");');
        console.log('  a.href = URL.createObjectURL(new Blob([JSON.stringify(window.auditResult, null, 2)], {type: "application/json"}));');
        console.log('  a.download = "audit-result.json";');
        console.log('  a.click();');
        
        console.log('\n✅ Hoàn thành!');
        
        return result;
        
    } catch (error) {
        console.error('❌ Lỗi:', error);
        throw error;
    }
})();
