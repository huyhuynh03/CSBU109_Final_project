// ============================================
// Merged POS Cleanup - Dọn thẻ trùng từ vựng sau khi refactor merge POS
// ============================================
// Sau khi SeedImporter gộp partOfSpeech (vd "verb" + "noun" -> "verb, noun"),
// identity key đổi nên các thẻ single-POS cũ KHÔNG bị match và trở thành
// orphan, làm tổng số thẻ tăng (3577 -> 3629). Cleanup xử lý 2 lớp:
//
// LOGIC 1 - Orphan cùng topic (nguyên nhân chính):
//   Trong cùng (word + folderId), nếu tồn tại 1 thẻ merged POS (có dấu phẩy),
//   xoá các thẻ single-POS mà POS của chúng là 1 thành phần của thẻ merged.
//   Vd group daily-life: ["verb, noun"] + ["verb"] + ["noun"]
//     -> giữ "verb, noun", xoá "verb" và "noun".
//
// LOGIC 2 - Trùng cross-topic (docs/audit-duplicates-result.json):
//   Mỗi từ chỉ giữ ở keepInTopic, xoá khỏi deleteFromTopics. Vì POS có thể đã
//   bị merge, ta match theo THÀNH PHẦN POS (component) thay vì khớp tuyệt đối.
//   HOMONYM_EXCLUSIONS giữ lại các từ đồng âm khác nghĩa (function/product/virus).
//
// Cleanup idempotent: chỉ chạy 1 lần/user, flag lưu trong localStorage.
// Tăng suffix VERSION_KEY khi cập nhật logic/DUPLICATES để chạy lại.

const DUPLICATES = [
    { word: 'affection', partOfSpeech: 'noun', keepInTopic: 'emotion-feelings', deleteFromTopics: ['family-relationships'] },
    { word: 'allergy', partOfSpeech: 'noun', keepInTopic: 'food-drink', deleteFromTopics: ['health'] },
    { word: 'ancestor', partOfSpeech: 'noun', keepInTopic: 'biology', deleteFromTopics: ['family-relationships'] },
    { word: 'appointment', partOfSpeech: 'noun', keepInTopic: 'health', deleteFromTopics: ['daily-life'] },
    { word: 'argue', partOfSpeech: 'verb', keepInTopic: 'communication-social', deleteFromTopics: ['family-relationships'] },
    { word: 'attached', partOfSpeech: 'adjective', keepInTopic: 'emotion-feelings', deleteFromTopics: ['family-relationships'] },
    { word: 'balanced', partOfSpeech: 'adjective', keepInTopic: 'emotion-feelings', deleteFromTopics: ['personal-qualities'] },
    { word: 'battery', partOfSpeech: 'noun', keepInTopic: 'information-technology', deleteFromTopics: ['daily-life'] },
    { word: 'breakfast', partOfSpeech: 'noun', keepInTopic: 'food-drink', deleteFromTopics: ['daily-life'] },
    { word: 'calm', partOfSpeech: 'adjective', keepInTopic: 'emotion-feelings', deleteFromTopics: ['personal-qualities'] },
    { word: 'caring', partOfSpeech: 'adjective', keepInTopic: 'emotion-feelings', deleteFromTopics: ['personal-qualities'] },
    { word: 'charge', partOfSpeech: 'verb', keepInTopic: 'information-technology', deleteFromTopics: ['daily-life'] },
    { word: 'cheerful', partOfSpeech: 'adjective', keepInTopic: 'emotion-feelings', deleteFromTopics: ['personal-qualities'] },
    { word: 'clean', partOfSpeech: 'verb', keepInTopic: 'daily-life', deleteFromTopics: ['home-living'] },
    { word: 'comfortable', partOfSpeech: 'adjective', keepInTopic: 'emotion-feelings', deleteFromTopics: ['daily-life'] },
    { word: 'comment', partOfSpeech: 'noun', keepInTopic: 'information-technology', deleteFromTopics: ['communication-social'] },
    { word: 'commute', partOfSpeech: 'verb', keepInTopic: 'daily-life', deleteFromTopics: ['daily-activities'] },
    { word: 'confident', partOfSpeech: 'adjective', keepInTopic: 'emotion-feelings', deleteFromTopics: ['personal-qualities'] },
    { word: 'conflict', partOfSpeech: 'noun', keepInTopic: 'communication-social', deleteFromTopics: ['family-relationships', 'literature-reading'] },
    { word: 'cook', partOfSpeech: 'verb', keepInTopic: 'food-drink', deleteFromTopics: ['daily-life'] },
    { word: 'curious', partOfSpeech: 'adjective', keepInTopic: 'emotion-feelings', deleteFromTopics: ['personal-qualities'] },
    { word: 'dialogue', partOfSpeech: 'noun', keepInTopic: 'communication-social', deleteFromTopics: ['literature-reading'] },
    { word: 'dinner', partOfSpeech: 'noun', keepInTopic: 'food-drink', deleteFromTopics: ['daily-life'] },
    { word: 'download', partOfSpeech: 'verb', keepInTopic: 'information-technology', deleteFromTopics: ['daily-activities'] },
    { word: 'dust', partOfSpeech: 'verb', keepInTopic: 'daily-life', deleteFromTopics: ['home-living'] },
    { word: 'emotional', partOfSpeech: 'adjective', keepInTopic: 'emotion-feelings', deleteFromTopics: ['personal-qualities'] },
    { word: 'empathy', partOfSpeech: 'noun', keepInTopic: 'emotion-feelings', deleteFromTopics: ['communication-social'] },
    { word: 'exhausted', partOfSpeech: 'adjective', keepInTopic: 'emotion-feelings', deleteFromTopics: ['daily-life'] },
    { word: 'fall asleep', partOfSpeech: 'phrase', keepInTopic: 'daily-life', deleteFromTopics: ['daily-activities'] },
    { word: 'forgiving', partOfSpeech: 'adjective', keepInTopic: 'emotion-feelings', deleteFromTopics: ['personal-qualities'] },
    { word: 'friendly', partOfSpeech: 'adjective', keepInTopic: 'family-relationships', deleteFromTopics: ['personal-qualities'] },
    { word: 'friendship', partOfSpeech: 'noun', keepInTopic: 'communication-social', deleteFromTopics: ['family-relationships'] },
    { word: 'function', partOfSpeech: 'noun', keepInTopic: 'information-technology', deleteFromTopics: ['mathematics'] },
    { word: 'get dressed', partOfSpeech: 'phrase', keepInTopic: 'daily-life', deleteFromTopics: ['daily-activities'] },
    { word: 'get up', partOfSpeech: 'phrasal verb', keepInTopic: 'daily-life', deleteFromTopics: ['daily-activities'] },
    { word: 'good', partOfSpeech: 'adjective', keepInTopic: 'personal-qualities', deleteFromTopics: ['education'] },
    { word: 'healthy', partOfSpeech: 'adjective', keepInTopic: 'food-drink', deleteFromTopics: ['health'] },
    { word: 'hopeful', partOfSpeech: 'adjective', keepInTopic: 'emotion-feelings', deleteFromTopics: ['personal-qualities'] },
    { word: 'household', partOfSpeech: 'noun', keepInTopic: 'daily-life', deleteFromTopics: ['family-relationships'] },
    { word: 'humble', partOfSpeech: 'adjective', keepInTopic: 'emotion-feelings', deleteFromTopics: ['personal-qualities'] },
    { word: 'impatient', partOfSpeech: 'adjective', keepInTopic: 'emotion-feelings', deleteFromTopics: ['personal-qualities'] },
    { word: 'independent', partOfSpeech: 'adjective', keepInTopic: 'family-relationships', deleteFromTopics: ['personal-qualities'] },
    { word: 'ingredient', partOfSpeech: 'noun', keepInTopic: 'food-drink', deleteFromTopics: ['daily-life'] },
    { word: 'invite', partOfSpeech: 'verb', keepInTopic: 'communication-social', deleteFromTopics: ['daily-activities'] },
    { word: 'jealous', partOfSpeech: 'adjective', keepInTopic: 'emotion-feelings', deleteFromTopics: ['personal-qualities'] },
    { word: 'laundry', partOfSpeech: 'noun', keepInTopic: 'daily-life', deleteFromTopics: ['home-living'] },
    { word: 'lunch', partOfSpeech: 'noun', keepInTopic: 'food-drink', deleteFromTopics: ['daily-life'] },
    { word: 'matter', partOfSpeech: 'noun', keepInTopic: 'chemistry', deleteFromTopics: ['physics'] },
    { word: 'meal', partOfSpeech: 'noun', keepInTopic: 'food-drink', deleteFromTopics: ['daily-life'] },
    { word: 'message', partOfSpeech: 'noun', keepInTopic: 'information-technology', deleteFromTopics: ['communication-social', 'daily-life'] },
    { word: 'mood', partOfSpeech: 'noun', keepInTopic: 'emotion-feelings', deleteFromTopics: ['literature-reading'] },
    { word: 'motivated', partOfSpeech: 'adjective', keepInTopic: 'emotion-feelings', deleteFromTopics: ['personal-qualities'] },
    { word: 'network', partOfSpeech: 'noun', keepInTopic: 'information-technology', deleteFromTopics: ['communication-social'] },
    { word: 'notification', partOfSpeech: 'noun', keepInTopic: 'information-technology', deleteFromTopics: ['daily-life'] },
    { word: 'optimistic', partOfSpeech: 'adjective', keepInTopic: 'emotion-feelings', deleteFromTopics: ['personal-qualities'] },
    { word: 'organ', partOfSpeech: 'noun', keepInTopic: 'biology', deleteFromTopics: ['health'] },
    { word: 'oversleep', partOfSpeech: 'verb', keepInTopic: 'daily-life', deleteFromTopics: ['daily-activities'] },
    { word: 'patient', partOfSpeech: 'adjective', keepInTopic: 'emotion-feelings', deleteFromTopics: ['personal-qualities'] },
    { word: 'pressure', partOfSpeech: 'noun', keepInTopic: 'physics', deleteFromTopics: ['communication-social'] },
    { word: 'privacy', partOfSpeech: 'noun', keepInTopic: 'information-technology', deleteFromTopics: ['communication-social'] },
    { word: 'product', partOfSpeech: 'noun', keepInTopic: 'chemistry', deleteFromTopics: ['mathematics'] },
    { word: 'protein', partOfSpeech: 'noun', keepInTopic: 'food-drink', deleteFromTopics: ['health'] },
    { word: 'punctual', partOfSpeech: 'adjective', keepInTopic: 'daily-life', deleteFromTopics: ['personal-qualities'] },
    { word: 'recipe', partOfSpeech: 'noun', keepInTopic: 'food-drink', deleteFromTopics: ['daily-life'] },
    { word: 'reconcile', partOfSpeech: 'verb', keepInTopic: 'communication-social', deleteFromTopics: ['family-relationships'] },
    { word: 'relationship', partOfSpeech: 'noun', keepInTopic: 'communication-social', deleteFromTopics: ['family-relationships'] },
    { word: 'relax', partOfSpeech: 'verb', keepInTopic: 'daily-life', deleteFromTopics: ['daily-activities'] },
    { word: 'respectful', partOfSpeech: 'adjective', keepInTopic: 'communication-social', deleteFromTopics: ['personal-qualities'] },
    { word: 'responsibility', partOfSpeech: 'noun', keepInTopic: 'communication-social', deleteFromTopics: ['family-relationships'] },
    { word: 'responsible', partOfSpeech: 'adjective', keepInTopic: 'family-relationships', deleteFromTopics: ['personal-qualities'] },
    { word: 'rest', partOfSpeech: 'verb', keepInTopic: 'daily-life', deleteFromTopics: ['daily-activities'] },
    { word: 'routine', partOfSpeech: 'noun', keepInTopic: 'daily-life', deleteFromTopics: ['daily-activities'] },
    { word: 'rude', partOfSpeech: 'adjective', keepInTopic: 'communication-social', deleteFromTopics: ['personal-qualities'] },
    { word: 'schedule', partOfSpeech: 'noun', keepInTopic: 'daily-life', deleteFromTopics: ['daily-activities'] },
    { word: 'screen time', partOfSpeech: 'noun', keepInTopic: 'information-technology', deleteFromTopics: ['daily-life'] },
    { word: 'scroll', partOfSpeech: 'verb', keepInTopic: 'information-technology', deleteFromTopics: ['daily-activities'] },
    { word: 'sensitive', partOfSpeech: 'adjective', keepInTopic: 'emotion-feelings', deleteFromTopics: ['personal-qualities'] },
    { word: 'share', partOfSpeech: 'verb', keepInTopic: 'information-technology', deleteFromTopics: ['communication-social'] },
    { word: 'shower', partOfSpeech: 'noun', keepInTopic: 'daily-life', deleteFromTopics: ['home-living'] },
    { word: 'shy', partOfSpeech: 'adjective', keepInTopic: 'emotion-feelings', deleteFromTopics: ['personal-qualities'] },
    { word: 'snack', partOfSpeech: 'noun', keepInTopic: 'food-drink', deleteFromTopics: ['daily-life'] },
    { word: 'social media', partOfSpeech: 'noun', keepInTopic: 'information-technology', deleteFromTopics: ['communication-social'] },
    { word: 'stay up', partOfSpeech: 'phrasal verb', keepInTopic: 'daily-life', deleteFromTopics: ['daily-activities'] },
    { word: 'storage', partOfSpeech: 'noun', keepInTopic: 'information-technology', deleteFromTopics: ['home-living'] },
    { word: 'stress', partOfSpeech: 'noun', keepInTopic: 'emotion-feelings', deleteFromTopics: ['daily-life', 'health'] },
    { word: 'study', partOfSpeech: 'verb', keepInTopic: 'daily-activities', deleteFromTopics: ['education'] },
    { word: 'support', partOfSpeech: 'verb', keepInTopic: 'communication-social', deleteFromTopics: ['family-relationships'] },
    { word: 'supportive', partOfSpeech: 'adjective', keepInTopic: 'emotion-feelings', deleteFromTopics: ['family-relationships', 'personal-qualities'] },
    { word: 'tired', partOfSpeech: 'adjective', keepInTopic: 'emotion-feelings', deleteFromTopics: ['daily-life'] },
    { word: 'trust', partOfSpeech: 'noun', keepInTopic: 'emotion-feelings', deleteFromTopics: ['communication-social'] },
    { word: 'understanding', partOfSpeech: 'adjective', keepInTopic: 'emotion-feelings', deleteFromTopics: ['personal-qualities'] },
    { word: 'upload', partOfSpeech: 'verb', keepInTopic: 'information-technology', deleteFromTopics: ['daily-activities'] },
    { word: 'vaccine', partOfSpeech: 'noun', keepInTopic: 'biology', deleteFromTopics: ['health'] },
    { word: 'vacuum', partOfSpeech: 'verb', keepInTopic: 'daily-life', deleteFromTopics: ['home-living'] },
    { word: 'virus', partOfSpeech: 'noun', keepInTopic: 'health', deleteFromTopics: ['information-technology'] },
    { word: 'vitamin', partOfSpeech: 'noun', keepInTopic: 'food-drink', deleteFromTopics: ['health'] },
    { word: 'wake up', partOfSpeech: 'phrasal verb', keepInTopic: 'daily-life', deleteFromTopics: ['daily-activities'] },
    { word: 'well', partOfSpeech: 'adverb', keepInTopic: 'personal-qualities', deleteFromTopics: ['education'] }
];

// Từ đồng âm khác nghĩa -> GIỮ CẢ HAI bản (đồng bộ với docs/delete-cross-topic-duplicates.js).
// Nếu cả keepInTopic và deleteFromTopic đều nằm trong cặp này thì KHÔNG xoá.
const HOMONYM_EXCLUSIONS = [
    { word: 'function', partOfSpeech: 'noun', topics: ['mathematics', 'information-technology'] },
    { word: 'product', partOfSpeech: 'noun', topics: ['mathematics', 'chemistry'] },
    { word: 'virus', partOfSpeech: 'noun', topics: ['health', 'information-technology'] }
];

const MergedPosCleanup = {
    // Tăng suffix (_v2, _v3...) khi cập nhật logic/DUPLICATES để cleanup chạy lại.
    VERSION_KEY: 'lf_merged_pos_cleanup_v2',

    DUPLICATES,
    HOMONYM_EXCLUSIONS,

    _normalize(value) {
        return String(value || '').trim().toLowerCase();
    },

    /**
     * Tách partOfSpeech (có thể đã merge "verb, noun") thành mảng component.
     * Hỗ trợ dấu phẩy và dấu "/".
     */
    _posComponents(value) {
        return this._normalize(value)
            .split(/[,/]/)
            .map(s => s.trim())
            .filter(Boolean);
    },

    /**
     * Lấy word của 1 thẻ (đã normalize).
     */
    _cardWord(card) {
        const fv = (card && card.fieldValues) || card || {};
        return this._normalize(fv.word || card.word || card.front);
    },

    /**
     * True nếu là thẻ vocabulary hợp lệ (có word).
     */
    _isVocabulary(card) {
        if (!card) return false;
        const cardType = card.cardType || 'vocabulary';
        if (cardType !== 'vocabulary') return false;
        return !!this._cardWord(card);
    },

    // ---------- LOGIC 2: cross-topic ----------

    _isHomonymExcluded(word, posComponents, deleteTopic, keepTopic) {
        return HOMONYM_EXCLUSIONS.some(exc => {
            if (this._normalize(exc.word) !== word) return false;
            if (!posComponents.includes(this._normalize(exc.partOfSpeech))) return false;
            const topics = exc.topics.map(t => this._normalize(t));
            return topics.includes(deleteTopic) && topics.includes(keepTopic);
        });
    },

    /**
     * Build map: word -> [{ pos, keepTopic, deleteTopics:Set }]
     */
    _buildCrossTopicMap() {
        const map = new Map();
        DUPLICATES.forEach(({ word, partOfSpeech, keepInTopic, deleteFromTopics }) => {
            const w = this._normalize(word);
            const entry = {
                pos: this._normalize(partOfSpeech),
                keepTopic: this._normalize(keepInTopic),
                deleteTopics: new Set(deleteFromTopics.map(t => this._normalize(t)))
            };
            const list = map.get(w) || [];
            list.push(entry);
            map.set(w, list);
        });
        return map;
    },

    /**
     * True nếu thẻ trùng cross-topic và đang nằm trong topic cần xoá.
     * Match POS theo component để bắt cả thẻ đã merge ("verb, noun").
     */
    _shouldDeleteCrossTopic(card, crossMap) {
        const word = this._cardWord(card);
        const entries = crossMap.get(word);
        if (!entries) return false;

        const folder = this._normalize(card.folderId);
        if (!folder) return false;

        const cardPos = this._posComponents(card.fieldValues ? card.fieldValues.partOfSpeech : card.partOfSpeech);

        for (const entry of entries) {
            if (!entry.deleteTopics.has(folder)) continue;
            // POS phải khớp ít nhất 1 component (nếu thẻ có POS rỗng vẫn match by word).
            const posMatch = cardPos.length === 0 || cardPos.includes(entry.pos);
            if (!posMatch) continue;
            if (this._isHomonymExcluded(word, cardPos, folder, entry.keepTopic)) continue;
            return true;
        }
        return false;
    },

    // ---------- LOGIC 1: orphan single-POS cùng topic ----------

    /**
     * Trong từng group (word + folderId): nếu có thẻ merged (POS chứa >1 component),
     * trả về Set id của các thẻ single-POS cần xoá (POS là thành phần của thẻ merged).
     * Nếu group có nhiều thẻ merged giống hệt POS thì giữ 1, xoá phần còn lại.
     */
    _collectOrphanIds(cards) {
        const groups = new Map(); // key word::folder -> array of {id, components, raw}
        for (const card of cards) {
            if (!this._isVocabulary(card)) continue;
            const word = this._cardWord(card);
            const folder = this._normalize(card.folderId);
            if (!word || !folder) continue;
            const components = this._posComponents(card.fieldValues ? card.fieldValues.partOfSpeech : card.partOfSpeech);
            const key = `${word}::${folder}`;
            const arr = groups.get(key) || [];
            arr.push({ id: card.id, components, posKey: components.slice().sort().join(',') });
            groups.set(key, arr);
        }

        const toDelete = new Set();

        for (const arr of groups.values()) {
            if (arr.length < 2) continue;

            const merged = arr.filter(c => c.components.length > 1);
            if (merged.length === 0) continue;

            // Tập hợp tất cả component được phủ bởi các thẻ merged.
            const mergedComponentSet = new Set();
            merged.forEach(m => m.components.forEach(p => mergedComponentSet.add(p)));

            // 1) Xoá các thẻ single-POS có POS nằm trong mergedComponentSet.
            for (const c of arr) {
                if (c.components.length === 1 && mergedComponentSet.has(c.components[0])) {
                    toDelete.add(c.id);
                }
                // Single-POS rỗng (không có POS) cũng coi là orphan của thẻ merged.
                if (c.components.length === 0) {
                    toDelete.add(c.id);
                }
            }

            // 2) Nếu có nhiều thẻ merged trùng POS, giữ 1, xoá còn lại.
            const seenMergedKeys = new Set();
            for (const m of merged) {
                if (seenMergedKeys.has(m.posKey)) {
                    toDelete.add(m.id);
                } else {
                    seenMergedKeys.add(m.posKey);
                }
            }
        }

        return toDelete;
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
            console.warn('[MergedPosCleanup] Cannot persist cleanup flag:', e);
        }
    },

    /**
     * Dọn thẻ trùng: orphan single-POS cùng topic (Logic 1) + trùng cross-topic
     * (Logic 2). Idempotent theo VERSION_KEY/user.
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

            // Gom toàn bộ thẻ vào memory để chạy Logic 1 theo group.
            const cards = [];
            const refById = new Map();
            snapshot.forEach((doc) => {
                cards.push({ id: doc.id, ...doc.data() });
                refById.set(doc.id, doc.ref);
            });

            const crossMap = this._buildCrossTopicMap();
            const orphanIds = this._collectOrphanIds(cards);

            // Hợp nhất id cần xoá từ cả 2 logic.
            const deleteIds = new Set(orphanIds);
            for (const card of cards) {
                if (deleteIds.has(card.id)) continue;
                if (this._shouldDeleteCrossTopic(card, crossMap)) {
                    deleteIds.add(card.id);
                }
            }

            if (deleteIds.size === 0) {
                console.log(`[MergedPosCleanup] Không có thẻ nào cần xoá (tổng ${snapshot.size})`);
                this._markDone(userId);
                return false;
            }

            const batchSize = 400;
            let batch = db.batch();
            let inBatch = 0;
            let deleted = 0;

            for (const id of deleteIds) {
                const docRef = refById.get(id);
                if (!docRef) continue;
                batch.delete(docRef);
                deleted++;
                inBatch++;
                if (inBatch >= batchSize) {
                    await batch.commit();
                    batch = db.batch();
                    inBatch = 0;
                }
            }
            if (inBatch > 0) await batch.commit();

            console.log(`[MergedPosCleanup] Removed ${deleted}/${snapshot.size} thẻ (orphan ${orphanIds.size} + cross-topic ${deleted - orphanIds.size})`);
            this._markDone(userId);
            return deleted > 0;
        } catch (e) {
            console.error('[MergedPosCleanup] Cleanup failed:', e);
            return false;
        }
    }
};

export default MergedPosCleanup;
