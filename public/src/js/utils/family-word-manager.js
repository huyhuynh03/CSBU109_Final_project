// ============================================
// Family Word Manager - Quản lý nhóm từ cùng họ
// ============================================

const FamilyWordManager = {
    STORAGE_KEY: 'linguaflash_pending_families',

    /**
     * Lấy pending families từ localStorage
     * @returns {Object} pendingFamilies map
     */
    getPendingFamilies() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : {};
        } catch (e) {
            console.error('FamilyWordManager: Error reading localStorage', e);
            return {};
        }
    },

    /**
     * Lưu pending families vào localStorage
     * @param {Object} families
     */
    _save(families) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(families));
        } catch (e) {
            console.error('FamilyWordManager: Error saving localStorage', e);
        }
    },

    /**
     * Cập nhật khi user học xong 1 từ có familyId
     * @param {Object} learnedCard - Card vừa học xong (phải có fieldValues.familyId)
     * @param {Array} allCardsInFamily - Tất cả cards cùng familyId
     */
    async onWordLearned(learnedCard, allCardsInFamily) {
        const familyId = learnedCard.fieldValues?.familyId;
        if (!familyId) return null;

        const families = this.getPendingFamilies();
        const existing = families[familyId] || {
            learnedWords: [],
            totalWords: allCardsInFamily.length,
            addedAt: new Date().toISOString(),
            dismissed: false
        };

        // Thêm từ vừa học vào danh sách
        const word = learnedCard.fieldValues.word;
        if (!existing.learnedWords.includes(word)) {
            existing.learnedWords.push(word);
        }
        existing.totalWords = allCardsInFamily.length;

        // Nếu đã học hết → xóa khỏi pending
        if (existing.learnedWords.length >= existing.totalWords) {
            delete families[familyId];
            this._save(families);
            return null;
        }

        families[familyId] = existing;
        this._save(families);

        // Trả về danh sách từ chưa học để hiện popup gợi ý
        const unlearnedCards = allCardsInFamily.filter(
            c => !existing.learnedWords.includes(c.fieldValues?.word)
        );

        return {
            familyId,
            learnedCount: existing.learnedWords.length,
            totalCount: existing.totalWords,
            unlearnedCards,
            dismissed: existing.dismissed
        };
    },

    /**
     * Đánh dấu family đã dismissed (user chọn "Để sau")
     * @param {string} familyId
     */
    dismissFamily(familyId) {
        const families = this.getPendingFamilies();
        if (families[familyId]) {
            families[familyId].dismissed = true;
            this._save(families);
        }
    },

    /**
     * Lấy danh sách pending families chưa hoàn thành
     * @returns {Array} Mảng { familyId, learnedWords, totalWords, addedAt }
     */
    getIncompleteFamilies() {
        const families = this.getPendingFamilies();
        return Object.entries(families).map(([familyId, data]) => ({
            familyId,
            ...data
        }));
    },

    /**
     * Lấy số lượng pending families
     * @returns {number}
     */
    getPendingCount() {
        return Object.keys(this.getPendingFamilies()).length;
    },

    /**
     * Tìm tất cả cards cùng familyId từ Firestore
     * @param {string} familyId
     * @returns {Array} cards
     */
    async getFamilyCards(familyId) {
        try {
            const allCards = await FirestoreDB.getCards({ cardType: 'vocabulary' });
            return allCards.filter(c => c.fieldValues?.familyId === familyId);
        } catch (e) {
            console.error('FamilyWordManager: Error fetching family cards', e);
            return [];
        }
    },

    /**
     * Xóa family khỏi pending (khi đã học xong hết)
     * @param {string} familyId
     */
    removeFamily(familyId) {
        const families = this.getPendingFamilies();
        delete families[familyId];
        this._save(families);
    },

    /**
     * Sync pending families lên Firestore (gọi khi có mạng)
     */
    async syncToFirestore() {
        try {
            const families = this.getPendingFamilies();
            await FirestoreDB.updateUserSettings({ pendingFamilies: families });
        } catch (e) {
            console.error('FamilyWordManager: Sync to Firestore failed', e);
        }
    },

    /**
     * Sync pending families từ Firestore về localStorage
     */
    async syncFromFirestore() {
        try {
            const userId = firebase.auth().currentUser?.uid;
            if (!userId) return;
            const profile = await FirestoreDB.getUserProfile(userId);
            if (profile?.settings?.pendingFamilies) {
                // Merge: giữ local nếu mới hơn
                const remote = profile.settings.pendingFamilies;
                const local = this.getPendingFamilies();
                const merged = { ...remote, ...local };
                this._save(merged);
            }
        } catch (e) {
            console.error('FamilyWordManager: Sync from Firestore failed', e);
        }
    }
};
