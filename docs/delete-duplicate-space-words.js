/**
 * Script xóa bản sao lặp lại của 3 từ trong topic space:
 * - microgravity
 * - void
 * - habitable
 *
 * Chạy trong DevTools Console sau khi đăng nhập.
 *
 * Script chỉ xử lý cards vocabulary có folderId = "space" và word thuộc danh sách trên.
 * Với mỗi nhóm trùng lặp, script giữ lại card gốc cũ nhất theo createdAt và xóa các card mới hơn.
 *
 * Cách dùng:
 * 1. Mở app trong browser và đăng nhập tài khoản có quyền xóa card.
 * 2. Mở DevTools Console (F12 hoặc Ctrl+Shift+J).
 * 3. Copy toàn bộ code trong file này và paste vào Console.
 * 4. Nhấn Enter để chạy.
 * 5. Đọc log kiểm tra danh sách card sẽ xóa; script chờ 3 giây trước khi bắt đầu xóa.
 */

(async function deleteDuplicateSpaceWords() {
    console.log('=== BẮT ĐẦU XÓA DUPLICATE SPACE WORDS ===');

    const TARGET_FOLDER = 'space';
    const TARGET_WORDS = new Set(['microgravity', 'void', 'habitable']);

    // Helper functions
    const normalize = (value) => String(value || '').trim().toLowerCase();

    const getCreatedAtMillis = (card) => {
        const createdAt = card.createdAt;

        if (createdAt?.toMillis) {
            return createdAt.toMillis();
        }

        if (createdAt?.seconds) {
            return createdAt.seconds * 1000 + Math.floor((createdAt.nanoseconds || 0) / 1000000);
        }

        if (typeof createdAt === 'number') {
            return createdAt;
        }

        const parsed = Date.parse(createdAt || '');
        return Number.isNaN(parsed) ? Number.MAX_SAFE_INTEGER : parsed;
    };

    const formatCreatedAt = (card) => {
        const millis = getCreatedAtMillis(card);
        return millis === Number.MAX_SAFE_INTEGER ? 'unknown-createdAt' : new Date(millis).toISOString();
    };

    const buildIdentityKey = (card) => {
        const fv = card.fieldValues || {};
        const word = normalize(fv.word);
        const folder = normalize(card.folderId);
        const pos = normalize(fv.partOfSpeech);

        if (folder !== TARGET_FOLDER || !TARGET_WORDS.has(word)) {
            return '';
        }

        // Chỉ nhóm duplicate trong topic space theo word + folderId + partOfSpeech.
        // Không xóa các từ cùng tên ở topic khác.
        return ['vocabulary', word, folder, pos].join('::');
    };

    try {
        if (!window.FirestoreDB && typeof FirestoreDB === 'undefined') {
            throw new Error('Không tìm thấy FirestoreDB. Hãy chạy script trong DevTools Console của app sau khi app đã tải xong.');
        }

        // 1. Lấy tất cả vocabulary cards
        console.log('Đang tải vocabulary cards từ Firestore...');
        const db = window.FirestoreDB || FirestoreDB;
        const allCards = await db.getCards({ cardType: 'vocabulary' });
        console.log(`✓ Đã tải ${allCards.length} cards`);

        // 2. Lọc đúng topic space và 3 từ cần xử lý
        const targetCards = allCards.filter((card) => {
            const fv = card.fieldValues || {};
            return normalize(card.folderId) === TARGET_FOLDER && TARGET_WORDS.has(normalize(fv.word));
        });

        console.log(`✓ Tìm thấy ${targetCards.length} cards thuộc topic "${TARGET_FOLDER}" cho các từ: ${Array.from(TARGET_WORDS).join(', ')}`);

        if (targetCards.length === 0) {
            console.log('\n✅ Không tìm thấy card mục tiêu nào. Không có gì để xóa.');
            return;
        }

        // 3. Nhóm cards theo identity key
        const identityMap = new Map();
        targetCards.forEach((card) => {
            const key = buildIdentityKey(card);
            if (!key) return;

            if (!identityMap.has(key)) {
                identityMap.set(key, []);
            }
            identityMap.get(key).push(card);
        });

        // 4. Tìm các nhóm có duplicate (>1 card)
        const duplicateGroups = [];
        identityMap.forEach((cards, key) => {
            if (cards.length > 1) {
                duplicateGroups.push({ key, cards });
            }
        });

        console.log(`\n📊 Tìm thấy ${duplicateGroups.length} nhóm duplicate trong topic "${TARGET_FOLDER}":`);
        duplicateGroups.forEach((group, idx) => {
            const sample = group.cards[0].fieldValues || {};
            console.log(`  ${idx + 1}. "${sample.word}" (${sample.partOfSpeech || 'no-pos'}) - ${group.cards.length} cards - ${group.key}`);
        });

        if (duplicateGroups.length === 0) {
            console.log('\n✅ KHÔNG CÓ DUPLICATE NÀO cho microgravity, void, habitable trong topic space.');
            return;
        }

        // 5. Preview chi tiết trước khi xóa
        let totalToDelete = 0;
        console.log('\n🔎 CHI TIẾT SẼ XỬ LÝ:');

        duplicateGroups.forEach((group) => {
            const sorted = [...group.cards].sort((a, b) => {
                const timeA = getCreatedAtMillis(a);
                const timeB = getCreatedAtMillis(b);
                if (timeA !== timeB) return timeA - timeB;
                return String(a.id || '').localeCompare(String(b.id || ''));
            });

            const keepCard = sorted[0];
            const deleteCards = sorted.slice(1);
            totalToDelete += deleteCards.length;

            console.log(`\n🔄 "${keepCard.fieldValues?.word}" (${keepCard.fieldValues?.partOfSpeech || 'no-pos'}):`);
            console.log(`   ✓ Giữ card gốc cũ nhất: ${keepCard.id} (${formatCreatedAt(keepCard)})`);
            deleteCards.forEach((card) => {
                console.log(`   ✗ Sẽ xóa bản sao: ${card.id} (${formatCreatedAt(card)})`);
            });
        });

        console.log(`\n⚠️  SẼ XÓA ${totalToDelete} cards duplicate (giữ lại card gốc cũ nhất mỗi nhóm)`);
        console.log('Script sẽ bắt đầu xóa sau 3 giây. Đóng tab hoặc refresh ngay nếu muốn hủy...');

        // Đợi 3 giây để user có thể đọc/hủy
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // 6. Xóa duplicates (giữ card có createdAt sớm nhất)
        let deletedCount = 0;
        let failedCount = 0;
        const errors = [];

        for (const group of duplicateGroups) {
            const sorted = [...group.cards].sort((a, b) => {
                const timeA = getCreatedAtMillis(a);
                const timeB = getCreatedAtMillis(b);
                if (timeA !== timeB) return timeA - timeB;
                return String(a.id || '').localeCompare(String(b.id || ''));
            });

            const keepCard = sorted[0];
            const deleteCards = sorted.slice(1);
            const word = keepCard.fieldValues?.word || 'unknown-word';
            const pos = keepCard.fieldValues?.partOfSpeech || 'no-pos';

            console.log(`\n🔄 Đang xử lý "${word}" (${pos}) trong topic "${TARGET_FOLDER}":`);
            console.log(`   ✓ Giữ: ${keepCard.id} (${formatCreatedAt(keepCard)})`);

            for (const card of deleteCards) {
                try {
                    const success = await db.deleteCard(card.id);
                    if (success) {
                        deletedCount++;
                        console.log(`   ✗ Đã xóa: ${card.id} (${formatCreatedAt(card)})`);
                    } else {
                        failedCount++;
                        errors.push(`Failed to delete ${card.id} (${word})`);
                        console.log(`   ⚠️  Lỗi xóa: ${card.id}`);
                    }
                } catch (e) {
                    failedCount++;
                    errors.push(`Error deleting ${card.id}: ${e.message}`);
                    console.error(`   ❌ Exception xóa ${card.id}:`, e);
                }
            }
        }

        // 7. Báo cáo kết quả
        console.log('\n' + '='.repeat(60));
        console.log('📊 KẾT QUẢ:');
        console.log(`   ✓ Đã xóa: ${deletedCount} cards`);
        console.log(`   ⚠️  Thất bại: ${failedCount} cards`);
        console.log(`   📦 Tổng nhóm duplicate: ${duplicateGroups.length}`);
        console.log(`   🎯 Topic: ${TARGET_FOLDER}`);
        console.log(`   🔤 Từ đã kiểm tra: ${Array.from(TARGET_WORDS).join(', ')}`);

        if (errors.length > 0) {
            console.log('\n❌ CHI TIẾT LỖI:');
            errors.forEach((err) => console.log(`   - ${err}`));
        }

        if (deletedCount > 0) {
            console.log('\n✅ HOÀN TẤT! Hãy refresh lại trang để thấy thay đổi.');
        } else if (failedCount === 0) {
            console.log('\n✅ HOÀN TẤT! Không có card nào cần xóa.');
        }
    } catch (error) {
        console.error('❌ LỖI NGHIÊM TRỌNG:', error);
        console.error('Stack trace:', error.stack);
    }
})();
