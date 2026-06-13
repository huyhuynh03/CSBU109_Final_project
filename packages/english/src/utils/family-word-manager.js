// ============================================
// Family Word Manager - Quản lý nhóm từ cùng họ
// ============================================
// Refactor v3: family word giờ phải là HỌ TỪ PHÁI SINH THẬT (gốc + biến đổi
// đuôi như art/artist/artistic/artwork), KHÔNG còn tin tuyệt đối vào familyId.
//
// Vấn đề cũ: nhiều seed dùng familyId như "nhóm chủ đề ngữ nghĩa"
//   (vd nutrition = calorie/protein/fat/fiber; meal-types = breakfast/lunch/...)
//   khiến các từ chả cùng gốc bị gom vào 1 "gia đình" để gợi ý học chung.
//
// Cách sửa: trong từng familyId, gom cụm (cluster) các từ bằng union-find dựa
//   trên GỐC CHUNG (shared stem). Hai từ chỉ cùng họ nếu tiền tố chung dài nhất
//   (LCP) >= MIN_STEM_LEN ký tự VÀ >= 50% độ dài từ ngắn hơn. Chỉ cụm có >= 2 từ
//   cùng gốc mới được coi là family thật. rawKey của family giờ là
//   `${familyId}|${stem}`. Từ lẻ (không có biến thể cùng gốc) bị loại khỏi gợi ý.
//
// Refactor v2 (giữ nguyên): KHÔNG lưu "learnedWords" trong localStorage. Trạng
// thái học tính trực tiếp từ Firestore (card.state). localStorage chỉ lưu danh
// sách groupKey user đã bấm "Để sau" (dismissed).

const FamilyWordManager = {
    DISMISS_KEY: 'linguaflash_dismissed_families',
    LEGACY_KEY: 'linguaflash_pending_families', // Schema cũ — sẽ tự xoá nếu gặp

    // Độ dài gốc chung tối thiểu để 2 từ được coi là cùng họ phái sinh.
    MIN_STEM_LEN: 3,
    // Tỉ lệ gốc chung tối thiểu so với từ ngắn hơn (loại bỏ trùng tiền tố tình cờ
    // như calorie/calcium chung "cal" nhưng không cùng họ).
    MIN_STEM_RATIO: 0.5,

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

    /** Chuẩn hoá word về chữ thường, chỉ giữ chữ cái (bỏ dấu, space, ký tự lạ). */
    _normalizeWord(value) {
        return String(value || '').trim().toLowerCase().replace(/[^a-z]/g, '');
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

    // ---- Stem clustering (nhóm họ từ phái sinh thật) ------------------------

    /** Độ dài tiền tố chung dài nhất (longest common prefix) của 2 chuỗi. */
    _lcpLen(a, b) {
        const n = Math.min(a.length, b.length);
        let i = 0;
        while (i < n && a[i] === b[i]) i++;
        return i;
    },

    /**
     * Hai từ có cùng gốc phái sinh không?
     * Điều kiện: LCP >= MIN_STEM_LEN ký tự VÀ LCP >= MIN_STEM_RATIO * độ dài từ ngắn hơn.
     * VD: art/artist (lcp=3, min=3 → 100%) ✓ ; calorie/calcium (lcp=3, min=7 → 43%) ✗.
     */
    _shareStem(a, b) {
        const lcp = this._lcpLen(a, b);
        if (lcp < this.MIN_STEM_LEN) return false;
        const minLen = Math.min(a.length, b.length);
        return lcp >= Math.ceil(minLen * this.MIN_STEM_RATIO);
    },

    /**
     * Gom các card cùng 1 familyId thành các cụm họ từ phái sinh (union-find).
     * Mỗi cụm trả về { stem, words[], cards[], rootWord }.
     * stem = LCP của mọi từ trong cụm. rootWord = từ có familyOrder nhỏ nhất
     * (gốc), tie-break theo độ dài ngắn nhất.
     */
    _clusterFamilyCards(cards) {
        const wordToCards = new Map();
        cards.forEach(c => {
            const w = this._normalizeWord(c.fieldValues?.word);
            if (!w) return;
            if (!wordToCards.has(w)) wordToCards.set(w, []);
            wordToCards.get(w).push(c);
        });

        const words = [...wordToCards.keys()];
        const parent = words.map((_, i) => i);
        const find = (x) => {
            while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; }
            return x;
        };
        const union = (a, b) => {
            const ra = find(a), rb = find(b);
            if (ra !== rb) parent[ra] = rb;
        };

        for (let i = 0; i < words.length; i++) {
            for (let j = i + 1; j < words.length; j++) {
                if (this._shareStem(words[i], words[j])) union(i, j);
            }
        }

        const groups = new Map();
        words.forEach((w, i) => {
            const r = find(i);
            if (!groups.has(r)) groups.set(r, []);
            groups.get(r).push(w);
        });

        return [...groups.values()].map(ws => {
            let stem = ws[0];
            ws.forEach(w => { stem = stem.slice(0, this._lcpLen(stem, w)); });
            const clusterCards = ws.flatMap(w => wordToCards.get(w));
            let rootCard = clusterCards[0];
            clusterCards.forEach(c => {
                const o = c.fieldValues?.familyOrder ?? 99;
                const ro = rootCard.fieldValues?.familyOrder ?? 99;
                const w = this._normalizeWord(c.fieldValues?.word);
                const rw = this._normalizeWord(rootCard.fieldValues?.word);
                if (o < ro || (o === ro && w.length < rw.length)) rootCard = c;
            });
            return {
                stem,
                words: ws.slice().sort(),
                cards: clusterCards,
                rootWord: rootCard.fieldValues?.word || stem
            };
        });
    },

    /** Tách rawKey family "${familyId}|${stem}" → { familyId, stem }. */
    _parseFamilyRawKey(rawKey) {
        const key = String(rawKey || '');
        const idx = key.indexOf('|');
        if (idx === -1) return { familyId: this._normalize(key), stem: '' };
        return {
            familyId: this._normalize(key.slice(0, idx)),
            stem: this._normalizeWord(key.slice(idx + 1))
        };
    },

    /** Dựng group info cho 1 cụm family. */
    _familyGroupInfo(familyId, cluster) {
        const rawKey = `${familyId}|${cluster.stem}`;
        return {
            groupType: 'family',
            rawKey,
            groupKey: this._buildGroupKey('family', rawKey),
            title: cluster.rootWord,
            description: `Nhóm từ cùng họ "${cluster.rootWord}": ${cluster.words.join(', ')}`,
            icon: 'family_restroom'
        };
    },

    // ---- Group info theo loại ----------------------------------------------

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

    /** Comparison (tính từ/trạng từ bất quy tắc) — không cần context cards. */
    _getComparisonInfo(card) {
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
        return null;
    },

    _isComparisonCard(card) {
        return !!this._getComparisonInfo(card);
    },

    /** Động từ bất quy tắc V1/V2/V3 — không cần context cards. */
    _getIrregularVerbInfo(card) {
        const fv = card?.fieldValues || {};
        const irrMeta = (typeof CardSchemas !== 'undefined' && CardSchemas.getIrregularMeta)
            ? CardSchemas.getIrregularMeta(card)
            : null;
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

    /**
     * Family info cho 1 card — CẦN allCards để xác định cụm họ từ thật.
     * Trả null nếu card không thuộc cụm họ từ phái sinh nào (>= 2 từ cùng gốc).
     */
    _getFamilyInfo(card, allCards) {
        const fv = card?.fieldValues || {};
        const fid = this._normalize(fv.familyId);
        if (!fid) return null;
        if (this._isComparisonCard(card)) return null;
        if (!Array.isArray(allCards) || allCards.length === 0) return null;

        const famCards = allCards.filter(c =>
            this._normalize(c.fieldValues?.familyId) === fid && !this._isComparisonCard(c)
        );
        if (famCards.length === 0) return null;

        const clusters = this._clusterFamilyCards(famCards);
        const word = this._normalizeWord(fv.word);
        const cluster = clusters.find(cl => cl.cards.some(c => c.id === card.id))
            || clusters.find(cl => cl.words.includes(word));

        if (!cluster || cluster.cards.length < 2) return null;
        return this._familyGroupInfo(fid, cluster);
    },

    /**
     * Group info tổng hợp cho 1 card. Ưu tiên: comparison > family > irregular-verb.
     * @param {Object} card
     * @param {Array} [allCards] - cần thiết để xác định cụm family. Thiếu → bỏ family.
     */
    _getGroupInfo(card, allCards) {
        const comp = this._getComparisonInfo(card);
        if (comp) return comp;
        const fam = this._getFamilyInfo(card, allCards);
        if (fam) return fam;
        return this._getIrregularVerbInfo(card);
    },

    belongsToGroup(card, groupType, rawKey) {
        if (groupType === 'family') {
            const fv = card?.fieldValues || {};
            const cardFamily = this._normalize(fv.familyId);
            if (!cardFamily) return false;
            const { familyId, stem } = this._parseFamilyRawKey(rawKey);
            if (cardFamily !== familyId) return false;
            if (this._isComparisonCard(card)) return false;
            if (!stem) return true; // legacy: cả familyId (không có stem)
            return this._normalizeWord(fv.word).startsWith(stem);
        }
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
    _accumulate(map, info, card) {
        if (!info || !info.groupKey) return;
        if (!map.has(info.groupKey)) {
            map.set(info.groupKey, { ...info, cards: [], totalCount: 0, learnedCount: 0 });
        }
        const item = map.get(info.groupKey);
        item.cards.push(card);
        item.totalCount++;
        if (!this._isNewCard(card)) item.learnedCount++;
    },

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

        // 1) Nhóm không phải family: comparison + irregular-verb (tính theo từng card).
        //    Card có familyId (và không phải comparison) → để pass family xử lý.
        const familyMap = new Map(); // familyId -> cards[]
        cards.forEach(card => {
            const comp = this._getComparisonInfo(card);
            if (comp) { this._accumulate(map, comp, card); return; }

            const fid = this._normalize(card.fieldValues?.familyId);
            if (fid) {
                if (!familyMap.has(fid)) familyMap.set(fid, []);
                familyMap.get(fid).push(card);
                return;
            }

            const verb = this._getIrregularVerbInfo(card);
            if (verb) this._accumulate(map, verb, card);
        });

        // 2) Nhóm family: gom cụm họ từ phái sinh trong từng familyId.
        //    Chỉ cụm >= 2 từ cùng gốc mới là family thật.
        familyMap.forEach((famCards, fid) => {
            const clusters = this._clusterFamilyCards(famCards);
            clusters.forEach(cluster => {
                if (cluster.cards.length < 2) {
                    // Từ lẻ trong familyId không cùng gốc với từ nào → không phải
                    // family. Nếu là động từ BQT thì vẫn cho vào nhóm verb.
                    cluster.cards.forEach(c => {
                        const verb = this._getIrregularVerbInfo(c);
                        if (verb) this._accumulate(map, verb, c);
                    });
                    return;
                }
                const info = this._familyGroupInfo(fid, cluster);
                cluster.cards.forEach(c => this._accumulate(map, info, c));
            });
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
        // relatedCards là toàn bộ card trong nhóm (cluster) — dùng làm context để
        // xác định đúng group info (rawKey kèm stem).
        const info = this._getGroupInfo(learnedCard, relatedCards);
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
                const info = this._getGroupInfo(c, all);
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
