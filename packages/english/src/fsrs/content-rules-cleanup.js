// ============================================
// Content Rules Cleanup - Xoá thẻ vi phạm luật nội dung từ vựng
// ============================================
// Lý do: theo plans/vocabulary-content-rules.md, các cụm dịch word-by-word
// (vd "clean the house", "cook dinner") và danh từ riêng ít phổ biến
// (vd "gothic", "baroque") đã bị loại khỏi seed. Nhưng user đã seed/import
// trước đó nên card cũ vẫn nằm trong Firestore users/{uid}/cards và app vẫn
// hiển thị. Cleanup này xoá triệt để các thẻ đó khỏi dữ liệu user.
//
// Cleanup idempotent: chỉ chạy 1 lần/user, flag lưu trong localStorage.
// Tăng VERSION_KEY khi bổ sung danh sách từ cần xoá để chạy lại.

const REMOVED_VOCABULARY_WORDS = new Set([
    // --- Cụm dịch word-by-word (partOfSpeech = phrase) ---
    'attend class',
    'book an appointment',
    'breathe deeply',
    'browse the internet',
    'brush your teeth',
    'buy groceries',
    'cancel an appointment',
    'catch the train',
    'charge your phone',
    'check emails',
    'check the weather',
    'choose an outfit',
    'clean the house',
    'clear the table',
    'comb your hair',
    'cook dinner',
    'cross the street',
    'do homework',
    'dry your hair',
    'feed the pet',
    'fold clothes',
    'furious with',
    'hang clothes',
    'help with chores',
    'leave home',
    'listen to music',
    'lock the door',
    'make coffee',
    'meet friends',
    'mop the floor',
    'open the curtains',
    'pack a bag',
    'pack lunch',
    'pay the bill',
    'play games',
    'pour milk',
    'prepare breakfast',
    'prepare for tomorrow',
    'read a book',
    'reply to messages',
    'review lessons',
    'send a text',
    'set an alarm',
    'spend time with family',
    'submit homework',
    'sweep the floor',
    'tidy the room',
    'wash the dishes',
    'wash your face',
    'watch tv',
    'withdraw cash',
    // --- Danh từ riêng / tên phong cách ít phổ biến ---
    'gothic',
    'baroque',
    // --- Dạng V-ing không phải mục từ loại độc lập ---
    'observing'
]);

const ContentRulesCleanup = {
    // Tăng suffix (_v2, _v3...) khi cập nhật REMOVED_VOCABULARY_WORDS để cleanup chạy lại.
    VERSION_KEY: 'lf_content_rules_cleanup_v2',

    /** Danh sách word bị loại — chia sẻ cho UI guard ở topic-detail/vocabulary. */
    REMOVED_WORDS: REMOVED_VOCABULARY_WORDS,

    _normalize(value) {
        return String(value || '').trim().toLowerCase();
    },

    /** True nếu thẻ là vocabulary và word nằm trong danh sách đã loại bỏ. */
    isRemovedWord(card) {
        if (!card) return false;
        const cardType = card.cardType || 'vocabulary';
        if (cardType !== 'vocabulary') return false;
        const fv = card.fieldValues || card || {};
        const word = this._normalize(fv.word || card.word || card.front);
        if (!word) return false;
        return REMOVED_VOCABULARY_WORDS.has(word);
    },

    _hasRun(userId) {
        try {
            const data = JSON.parse(localStorage.getItem(this.VERSION_KEY) || '{}');
            return !!data[userId];
        } catch {
            return false;
        }
    },

    _markDone(userId) {
        try {
            const data = JSON.parse(localStorage.getItem(this.VERSION_KEY) || '{}');
            data[userId] = new Date().toISOString();
            localStorage.setItem(this.VERSION_KEY, JSON.stringify(data));
        } catch (e) {
            console.warn('[ContentRulesCleanup] Cannot persist cleanup flag:', e);
        }
    },

    /**
     * Xoá toàn bộ thẻ vocabulary có word thuộc REMOVED_VOCABULARY_WORDS.
     * @returns {Promise<boolean>} true nếu có xoá thẻ (caller nên reload cards).
     */
    async run() {
        const userId = (typeof Auth !== 'undefined') ? Auth.getUserId() : null;
        if (!userId) return false;
        if (this._hasRun(userId)) return false;

        const ref = (typeof FirestoreDB !== 'undefined' && FirestoreDB._userCollection)
            ? FirestoreDB._userCollection('cards')
            : null;
        if (!ref) return false;

        try {
            const snapshot = await ref.get();
            let deleted = 0;
            const batchSize = 400;
            let batch = db.batch();
            let inBatch = 0;

            snapshot.forEach((doc) => {
                const c = { id: doc.id, ...doc.data() };
                if (!this.isRemovedWord(c)) return;

                batch.delete(doc.ref);
                deleted++;
                inBatch++;

                if (inBatch >= batchSize) {
                    batch.commit().catch(e => console.error('[ContentRulesCleanup] batch commit failed:', e));
                    batch = db.batch();
                    inBatch = 0;
                }
            });

            if (inBatch > 0) await batch.commit();

            console.log(`[ContentRulesCleanup] Removed ${deleted}/${snapshot.size} cards vi phạm luật nội dung`);
            this._markDone(userId);
            return deleted > 0;
        } catch (e) {
            console.error('[ContentRulesCleanup] Cleanup failed:', e);
            return false;
        }
    }
};

export default ContentRulesCleanup;
