/**
 * XÓA DUPLICATE CARDS TRONG 5 TOPIC MỚI (economy, finance, investment, business, law)
 * 
 * Chạy trong Browser Console khi đã đăng nhập vào app.
 * Script sẽ:
 * 1. Lấy tất cả cards trong 5 topic mới
 * 2. Nhóm theo identity (word + partOfSpeech + folderId)
 * 3. Giữ lại 1 card (cái đầu tiên), xóa các bản trùng
 * 
 * Cách chạy:
 *   1. Mở app, đăng nhập
 *   2. Mở DevTools Console (F12)
 *   3. Paste toàn bộ script này và Enter
 */

(async () => {
    const TOPICS = ['economy', 'finance', 'investment', 'business', 'law'];
    
    console.log('🔍 Scanning duplicates in 5 new topics...');
    
    let totalDeleted = 0;
    let totalKept = 0;
    
    for (const topicId of TOPICS) {
        // Lấy tất cả cards trong topic
        const cards = await FirestoreDB.getCards({ folderId: topicId, cardType: 'vocabulary' });
        
        if (!cards || cards.length === 0) {
            console.log(`  ⏭️  ${topicId}: no cards found`);
            continue;
        }
        
        // Nhóm theo identity key: word + partOfSpeech
        const groups = new Map();
        for (const card of cards) {
            const fv = card.fieldValues || {};
            const word = (fv.word || '').trim().toLowerCase();
            const pos = (fv.partOfSpeech || '').trim().toLowerCase();
            const key = `${word}::${pos}`;
            
            if (!groups.has(key)) {
                groups.set(key, []);
            }
            groups.get(key).push(card);
        }
        
        // Tìm và xóa duplicates
        let topicDeleted = 0;
        let topicKept = 0;
        
        for (const [key, groupCards] of groups) {
            topicKept++;
            if (groupCards.length > 1) {
                // Giữ card đầu tiên, xóa phần còn lại
                const toDelete = groupCards.slice(1);
                for (const card of toDelete) {
                    try {
                        await FirestoreDB.deleteCard(card.id);
                        topicDeleted++;
                    } catch (e) {
                        console.error(`  ❌ Failed to delete ${card.id} (${key}):`, e.message);
                    }
                }
            }
        }
        
        console.log(`  ✅ ${topicId}: kept ${topicKept}, deleted ${topicDeleted} duplicates (was ${cards.length} → now ${topicKept})`);
        totalDeleted += topicDeleted;
        totalKept += topicKept;
    }
    
    console.log(`\n🎉 Done! Total: kept ${totalKept}, deleted ${totalDeleted} duplicates`);
    console.log('💡 Refresh the page to see updated counts.');
})();
