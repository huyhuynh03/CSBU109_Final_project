// ============================================
// Family Word Manager - Quản lý nhóm từ cùng họ
// ============================================
// Refactor v2: KHÔNG còn lưu danh sách "learnedWords" trong localStorage.
// Trạng thái học của từng từ được tính trực tiếp từ Firestore (card.state):
//   - state === 'new' (hoặc FSRS.State.NEW)  → CHƯA HỌC
//   - bất kỳ state nào khác (learning/review/relearning) → ĐÃ HỌC
//
// localStorage chỉ còn dùng để lưu danh sách familyId user đã bấm "Để sau"
// (dismissed) để không hiện popup gợi ý lặp lại trong cùng phiên.

const FamilyWordManager = {
    DISMISS_KEY: 'linguaflash_dismissed_families',
    LEGACY_KEY: 'linguaflash_pending_families', // Schema cũ — sẽ tự xoá nếu gặp

    // ---- Internals ----------------------------------------------------------
    _isNewCard(card) {
        // "new-like" = chưa hoàn thành giai đoạn học mới.
        // Bao gồm: state NEW, LEARNING, hoặc undefined.
        // Phải đồng bộ với topic-detail._isNewLike và study flow.
        const st = card?.state;
        if (st === undefined) return true;
        if (typeof FSRS !== 'undefined' && FSRS.State) {
            if (st === FSRS.State.NEW || st === FSRS.State.LEARNING) return true;
        }
        return st === 'new' || st === 'learning';
    },

    _getDismissed() {
        try {
            const raw = localStorage.getItem(this.DISMISS_KEY);
            const arr = raw ? JSON.parse(raw) : [];
            return Array.isArray(arr) ? new Set(arr) : new Set();
        } catch (e) {
            console.error('[FamilyWordManager] Read dismissed error:', e);
            return new Set();
        }
    },

    _saveDismissed(set) {
        try {
            localStorage.setItem(this.DISMISS_KEY, JSON.stringify([...set]));
        } catch (e) {
            console.error('[FamilyWordManager] Save dismissed error:', e);
        }
    },

    /** Dọn legacy key (chạy 1 lần khi load module) */
    _cleanupLegacy() {
        try {
            if (localStorage.getItem(this.LEGACY_KEY) !== null) {
                localStorage.removeItem(this.LEGACY_KEY);
                console.log('[FamilyWordManager] Removed legacy pending-families key');
            }
        } catch (e) { /* ignore */ }
    },

    // ---- Cards lookup -------------------------------------------------------
    /**
     * Lấy tất cả cards thuộc 1 family (từ Firestore — source of truth).
     * @param {string} familyId
     * @returns {Promise<Array>}
     */
    async getFamilyCards(familyId) {
        try {
            const allCards = await FirestoreDB.getCards({ cardType: 'vocabulary' });
            return allCards.filter(c => c.fieldValues?.familyId === familyId);
        } catch (e) {
            console.error('[FamilyWordManager] getFamilyCards error:', e);
            return [];
        }
    },

    // ---- Pending families (tính từ Firestore) -------------------------------
    /**
     * Tính danh sách family đang DANG DỞ:
     *   - Có ít nhất 1 card đã học (state ≠ new)
     *   - VÀ còn ít nhất 1 card chưa học (state = new)
     *
     * @param {Array} [allCards] - Optional: pass cards có sẵn để tránh query lại.
     * @returns {Promise<Array>} mảng { familyId, learnedCount, totalCount, dismissed }
     */
    async getIncompleteFamilies(allCards) {
        let cards = allCards;
        if (!cards) {
            try {
                cards = await FirestoreDB.getCards({ cardType: 'vocabulary' });
            } catch (e) {
                console.error('[FamilyWordManager] getIncompleteFamilies error:', e);
                return [];
            }
        }

        const map = {}; // familyId → { total, learned }
        cards.forEach(c => {
            const fid = c.fieldValues?.familyId;
            if (!fid) return;
            if (!map[fid]) map[fid] = { total: 0, learned: 0 };
            map[fid].total++;
            if (!this._isNewCard(c)) map[fid].learned++;
        });

        const dismissed = this._getDismissed();
        return Object.entries(map)
            .filter(([, v]) => v.learned > 0 && v.learned < v.total)
            .map(([familyId, v]) => ({
                familyId,
                learnedCount: v.learned,
                totalCount: v.total,
                dismissed: dismissed.has(familyId)
            }));
    },

    /**
     * Đếm số family đang dang dở (alias).
     * @returns {Promise<number>}
     */
    async getPendingCount() {
        const list = await this.getIncompleteFamilies();
        return list.length;
    },

    // ---- Dismiss ------------------------------------------------------------
    /** User bấm "Để sau" trong popup gợi ý */
    dismissFamily(familyId) {
        const set = this._getDismissed();
        set.add(familyId);
        this._saveDismissed(set);
    },

    /** Reset dismiss state cho 1 family (gọi khi user chủ động vào học lại) */
    undismissFamily(familyId) {
        const set = this._getDismissed();
        set.delete(familyId);
        this._saveDismissed(set);
    },

    /** Reset toàn bộ dismiss (vd khi đổi user) */
    clearDismissed() {
        try { localStorage.removeItem(this.DISMISS_KEY); } catch (e) { /* ignore */ }
    },

    // ---- Sau khi học xong 1 từ ----------------------------------------------
    /**
     * Gọi sau khi user học xong 1 từ thuộc family.
     * Trả về thông tin để StudyPage quyết định có hiện popup gợi ý không.
     * KHÔNG còn lưu state, mọi tính toán đều dựa Firestore.
     *
     * @param {Object} learnedCard - card vừa học (đã được update state ở Firestore)
     * @param {Array}  allCardsInFamily - cards cùng familyId (đã fetch tươi)
     * @returns {{familyId, learnedCount, totalCount, unlearnedCards, dismissed} | null}
     */
    async onWordLearned(learnedCard, allCardsInFamily) {
        const familyId = learnedCard?.fieldValues?.familyId;
        if (!familyId || !Array.isArray(allCardsInFamily) || allCardsInFamily.length === 0) {
            return null;
        }

        // Coi card vừa học là "đã học" cho dù snapshot Firestore có thể chưa kịp cập nhật.
        const learnedId = learnedCard.id;
        const unlearnedCards = allCardsInFamily.filter(c => {
            if (c.id === learnedId) return false;
            return this._isNewCard(c);
        });
        const learnedCount = allCardsInFamily.length - unlearnedCards.length;

        return {
            familyId,
            learnedCount,
            totalCount: allCardsInFamily.length,
            unlearnedCards,
            dismissed: this._getDismissed().has(familyId)
        };
    },

    // ---- Các API tương thích ngược (no-op / wrapper) ------------------------
    /** Legacy: trước đây dùng để xoá family khỏi localStorage. Giờ chỉ undismiss. */
    removeFamily(familyId) {
        this.undismissFamily(familyId);
    },

    /** Legacy: xoá theo danh sách word — chỉ undismiss tất cả family liên quan. */
    async removeWords(words) {
        if (!Array.isArray(words) || words.length === 0) return;
        try {
            const all = await FirestoreDB.getCards({ cardType: 'vocabulary' });
            const wordSet = new Set(words);
            const familySet = new Set();
            all.forEach(c => {
                const fv = c.fieldValues || {};
                if (fv.familyId && wordSet.has(fv.word)) familySet.add(fv.familyId);
            });
            familySet.forEach(fid => this.undismissFamily(fid));
        } catch (e) {
            console.error('[FamilyWordManager] removeWords error:', e);
        }
    },

    /** Legacy: trả {} để code cũ không crash. KHÔNG nên dùng nữa. */
    getPendingFamilies() {
        return {};
    },

    // ---- Sync (no-op trong schema mới — state đã ở Firestore qua card) ------
    async syncToFirestore() { /* no-op: state nằm trong card */ },
    async syncFromFirestore() { /* no-op */ }
};

// Cleanup legacy key 1 lần khi load
try { FamilyWordManager._cleanupLegacy(); } catch (e) { /* ignore */ }
