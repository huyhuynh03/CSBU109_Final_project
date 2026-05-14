/**
 * Script xóa các từ trùng lặp TRONG CÙNG TOPIC
 * Chạy trong DevTools Console sau khi đăng nhập
 * 
 * Script này xóa các card có cùng word + folderId + partOfSpeech
 * (bỏ qua irregularRole để xóa cả irregular duplicates)
 * 
 * Cách dùng:
 * 1. Mở app trong browser và đăng nhập
 * 2. Mở DevTools Console (F12)
 * 3. Copy toàn bộ code này và paste vào Console
 * 4. Nhấn Enter để chạy
 */

(async function deleteDuplicateAtomsSimple() {
    console.log('=== BẮT ĐẦU XÓA DUPLICATE ATOMS (SIMPLE) ===');
    
    // Helper functions
    const normalize = (value) => String(value || '').trim().toLowerCase();
    
    const buildSimpleIdentityKey = (card) => {
        const fv = card.fieldValues || {};
        const word = normalize(fv.word);
        if (!word) return '';
        
        const folder = normalize(card.folderId);
        const pos = normalize(fv.partOfSpeech);
        
        // Chỉ dùng: word + folder + partOfSpeech
        // KHÔNG dùng irregularRole để bắt được cả irregular duplicates
        return ['vocabulary', word, folder, pos].join('::');
    };
    
    try {
        // 1. Lấy tất cả cards
        console.log('Đang tải cards từ Firestore...');
        const allCards = await FirestoreDB.getCards({ cardType: 'vocabulary' });
        console.log(`✓ Đã tải ${allCards.length} cards`);
        
        // 2. Nhóm cards theo simple identity key
        const identityMap = new Map();
        allCards.forEach(card => {
            const key = buildSimpleIdentityKey(card);
            if (!key) return;
            
            if (!identityMap.has(key)) {
                identityMap.set(key, []);
            }
            identityMap.get(key).push(card);
        });
        
        // 3. Tìm các nhóm có duplicate (>1 card)
        const duplicateGroups = [];
        identityMap.forEach((cards, key) => {
            if (cards.length > 1) {
                duplicateGroups.push({ key, cards });
            }
        });
        
        console.log(`\n📊 Tìm thấy ${duplicateGroups.length} nhóm duplicate:`);
        duplicateGroups.forEach((group, idx) => {
            const sample = group.cards[0].fieldValues;
            const folder = group.cards[0].folderId;
            console.log(`  ${idx + 1}. "${sample.word}" trong topic "${folder}" (${group.cards.length} cards)`);
        });
        
        if (duplicateGroups.length === 0) {
            console.log('\n✅ KHÔNG CÓ DUPLICATE NÀO! Database đã sạch.');
            return;
        }
        
        // 4. Xác nhận trước khi xóa
        const totalToDelete = duplicateGroups.reduce((sum, g) => sum + (g.cards.length - 1), 0);
        console.log(`\n⚠️  SẼ XÓA ${totalToDelete} cards duplicate (giữ lại card cũ nhất mỗi nhóm)`);
        console.log('Nhấn Enter để tiếp tục, hoặc Ctrl+C để hủy...');
        
        // Đợi 3 giây để user có thể đọc
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 5. Xóa duplicates (giữ card có createdAt sớm nhất)
        let deletedCount = 0;
        let failedCount = 0;
        const errors = [];
        
        for (const group of duplicateGroups) {
            // Sắp xếp theo createdAt (cũ nhất lên đầu)
            const sorted = group.cards.sort((a, b) => {
                const timeA = a.createdAt?.toMillis?.() || 0;
                const timeB = b.createdAt?.toMillis?.() || 0;
                return timeA - timeB;
            });
            
            const keepCard = sorted[0];
            const deleteCards = sorted.slice(1);
            
            const folder = keepCard.folderId || 'unknown';
            console.log(`\n🔄 Xử lý "${keepCard.fieldValues.word}" trong topic "${folder}":`);
            console.log(`   ✓ Giữ: ${keepCard.id} (${new Date(keepCard.createdAt?.toMillis?.() || 0).toISOString()})`);
            
            // Xóa các card còn lại
            for (const card of deleteCards) {
                try {
                    const success = await FirestoreDB.deleteCard(card.id);
                    if (success) {
                        deletedCount++;
                        console.log(`   ✗ Xóa: ${card.id}`);
                    } else {
                        failedCount++;
                        errors.push(`Failed to delete ${card.id} (${card.fieldValues.word})`);
                        console.log(`   ⚠️  Lỗi xóa: ${card.id}`);
                    }
                } catch (e) {
                    failedCount++;
                    errors.push(`Error deleting ${card.id}: ${e.message}`);
                    console.error(`   ❌ Exception xóa ${card.id}:`, e);
                }
            }
        }
        
        // 6. Báo cáo kết quả
        console.log('\n' + '='.repeat(60));
        console.log('📊 KẾT QUẢ:');
        console.log(`   ✓ Đã xóa: ${deletedCount} cards`);
        console.log(`   ⚠️  Thất bại: ${failedCount} cards`);
        console.log(`   📦 Tổng nhóm duplicate: ${duplicateGroups.length}`);
        
        if (errors.length > 0) {
            console.log('\n❌ CHI TIẾT LỖI:');
            errors.forEach(err => console.log(`   - ${err}`));
        }
        
        if (deletedCount > 0) {
            console.log('\n✅ HOÀN TẤT! Hãy refresh lại trang để thấy thay đổi.');
        }
        
    } catch (error) {
        console.error('❌ LỖI NGHIÊM TRỌNG:', error);
        console.error('Stack trace:', error.stack);
    }
})();
