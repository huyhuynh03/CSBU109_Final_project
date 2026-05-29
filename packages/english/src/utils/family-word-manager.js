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

    _normalize(value) {
        return String(value || '').trim().toLowerCase();
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

    _buildGroupKey(groupType, rawKey) {
        const key = this._normalize(rawKey);
        return key ? `${groupType}:${key}` : '';
    },

    _getComparisonGroupBase(fv = {}) {
        const word = this._normalize(fv.word);
        const base = this._normalize(fv.baseForm || fv.word);
        const comparative = this._normalize(fv.comparative);
        const superlative = this._normalize(fv.superlative);
        const joined = [word, base, comparative, superlative].filter(Boolean).join('/');

        // Nhóm good/well dùng chung better/best nên phải dùng cùng 1 key cho cả
        // base cards cũ (good, well) và v2 cards mới (better, best).
        if (/(^|\/)good(\/|$)/.test(joined)
            || /(^|\/)well(\/|$)/.test(joined)
            || /(^|\/)better(\/|$)/.test(joined)
            || /(^|\/)best(\/|$)/.test(joined)) {
            return 'good/well';
        }

        return base || word;
    },

    _getGroupInfo(card) {
        const fv = card?.fieldValues || {};
        const tags = Array.isArray(fv.tags) ? fv.tags : [];
        const irrMeta = (typeof CardSchemas !== 'undefined' && CardSchemas.getIrregularMeta)
            ? CardSchemas.getIrregularMeta(card)
            : null;
        const word = this._normalize(fv.word);
        const pos = this._normalize(fv.partOfSpeech);
        const isGoodWellBase = (word === 'good' && pos === 'adjective')
            || (word === 'well' && pos === 'adverb');
        const isLegacyComparison = tags.includes('irregular-adjective')
            || tags.includes('irregular-adverb')
            || !!fv.comparative
            || !!fv.superlative
            || isGoodWellBase;

        if ((irrMeta && (irrMeta.tag === 'irregular-comparative' || irrMeta.tag === 'irregular-superlative')) || isLegacyComparison) {
            const base = this._getComparisonGroupBase(fv);
            if (!base) return null;
            return {
                groupType: 'irregular-comparison',
                rawKey: base,
                groupKey: this._buildGroupKey('irregular-comparison', base),
                title: base,
                description: `Tính từ/trạng từ bất quy tắc: nguyên mẫu, so sánh hơn và so sánh nhất của ${base}`,
                icon: 'trending_up'
            };
        }

        const familyId = String(fv.familyId || '').trim();
        if (familyId) {
            return {
                groupType: 'family',
                rawKey: familyId,
                groupKey: this._buildGroupKey('family', familyId),
                title: familyId,
                description: `Nhóm từ cùng họ: ${familyId}`,
                icon: 'family_restroom'
            };
        }

        if (irrMeta && irrMeta.tag === 'irregular-verb') {
            const base = String(fv.baseForm || fv.word || '').trim();
            if (!base) return null;
            return {
                groupType: 'irregular-verb',
                rawKey: base,
                groupKey: this._buildGroupKey('irregular-verb', base),
                title: base,
                description: `Động từ bất quy tắc: ${base}`,
                icon: 'timeline'
            };
        }

        return null;
    },

    belongsToGroup(card, groupType, rawKey) {
        const info = this._getGroupInfo(card);
        if (!info) return false;
        return info.groupType === groupType && this._normalize(info.rawKey) === this._normalize(rawKey);
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
    async getFamilyCards(familyId) {
        try {
            const allCards = await FirestoreDB.getCards({ cardType: 'vocabulary' });
            return allCards.filter(c => c.fieldValues?.familyId === familyId);
        } catch (e) {
            console.error('[FamilyWordManager] getFamilyCards error:', e);
            return [];
        }
    },

    async getGroupCards(groupType, rawKey, allCards) {
        try {
            const cards = Array.isArray(allCards)
                ? allCards
                : await FirestoreDB.getCards({ cardType: 'vocabulary' });
            return cards.filter(c => this.belongsToGroup(c, groupType, rawKey));
        } catch (e) {
            console.error('[FamilyWordManager] getGroupCards error:', e);
            return [];
        }
    },

    // ---- Pending groups (tính từ Firestore) ---------------------------------
    async getIncompleteGroups(allCards) {
        let cards = allCards;
        if (!cards) {
            try {
                cards = await FirestoreDB.getCards({ cardType: 'vocabulary' });
            } catch (e) {
                console.error('[FamilyWordManager] getIncompleteGroups error:', e);
                return [];
            }
        }

        const map = new Map();
        cards.forEach(card => {
            const info = this._getGroupInfo(card);
            if (!info || !info.groupKey) return;
            if (!map.has(info.groupKey)) {
                map.set(info.groupKey, {
                    ...info,
                    cards: [],
                    totalCount: 0,
                    learnedCount: 0
                });
            }
            const item = map.get(info.groupKey);
            item.cards.push(card);
            item.totalCount++;
            if (!this._isNewCard(card)) item.learnedCount++;
        });

        const dismissed = this._getDismissed();
        return [...map.values()]
            .filter(v => v.learnedCount > 0 && v.learnedCount < v.totalCount)
            .sort((a, b) => {
                if (a.groupType !== b.groupType) return a.groupType.localeCompare(b.groupType);
                return a.title.localeCompare(b.title);
            })
            .map(v => ({
                groupKey: v.groupKey,
                groupType: v.groupType,
                rawKey: v.rawKey,
                title: v.title,
                description: v.description,
                icon: v.icon,
                cards: v.cards,
                learnedCount: v.learnedCount,
                totalCount: v.totalCount,
                dismissed: dismissed.has(v.groupKey)
            }));
    },

    async getIncompleteFamilies(allCards) {
        const groups = await this.getIncompleteGroups(allCards);
        return groups
            .filter(g => g.groupType === 'family')
            .map(g => ({
                familyId: g.rawKey,
                learnedCount: g.learnedCount,
                totalCount: g.totalCount,
                dismissed: g.dismissed
            }));
    },

    async getPendingCount() {
        const list = await this.getIncompleteGroups();
        return list.length;
    },

    // ---- Dismiss ------------------------------------------------------------
    dismissGroup(groupKey) {
        const set = this._getDismissed();
        set.add(groupKey);
        this._saveDismissed(set);
    },

    undismissGroup(groupKey) {
        const set = this._getDismissed();
        set.delete(groupKey);
        this._saveDismissed(set);
    },

    dismissFamily(familyId) {
        this.dismissGroup(this._buildGroupKey('family', familyId));
    },

    undismissFamily(familyId) {
        this.undismissGroup(this._buildGroupKey('family', familyId));
    },

    clearDismissed() {
        try { localStorage.removeItem(this.DISMISS_KEY); } catch (e) { /* ignore */ }
    },

    // ---- Sau khi học xong 1 từ ----------------------------------------------
    async onWordLearned(learnedCard, relatedCards) {
        const info = this._getGroupInfo(learnedCard);
        if (!info || !Array.isArray(relatedCards) || relatedCards.length === 0) {
            return null;
        }

        const learnedId = learnedCard.id;
        const unlearnedCards = relatedCards.filter(c => {
            if (c.id === learnedId) return false;
            return this._isNewCard(c);
        });
        const learnedCount = relatedCards.length - unlearnedCards.length;

        return {
            ...info,
            learnedCount,
            totalCount: relatedCards.length,
            unlearnedCards,
            dismissed: this._getDismissed().has(info.groupKey)
        };
    },

    // ---- Các API tương thích ngược (no-op / wrapper) ------------------------
    removeFamily(familyId) {
        this.undismissFamily(familyId);
    },

    async removeWords(words) {
        if (!Array.isArray(words) || words.length === 0) return;
        try {
            const all = await FirestoreDB.getCards({ cardType: 'vocabulary' });
            const wordSet = new Set(words.map(w => this._normalize(w)).filter(Boolean));
            const groupKeys = new Set();
            all.forEach(c => {
                const fv = c.fieldValues || {};
                const word = this._normalize(fv.word);
                const baseForm = this._normalize(fv.baseForm);
                const info = this._getGroupInfo(c);
                if (!info) return;
                if (wordSet.has(word) || (baseForm && wordSet.has(baseForm))) {
                    groupKeys.add(info.groupKey);
                }
            });
            groupKeys.forEach(key => this.undismissGroup(key));
        } catch (e) {
            console.error('[FamilyWordManager] removeWords error:', e);
        }
    },

    getPendingFamilies() {
        return {};
    },

    async syncToFirestore() { /* no-op: state nằm trong card */ },
    async syncFromFirestore() { /* no-op */ }
};

// Cleanup legacy key 1 lần khi load
try { FamilyWordManager._cleanupLegacy(); } catch (e) { /* ignore */ }


export default FamilyWordManager;
