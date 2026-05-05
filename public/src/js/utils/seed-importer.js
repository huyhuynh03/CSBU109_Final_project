// ============================================
// Seed Importer - Nạp dữ liệu mẫu từ JSON vào Firestore
// ============================================

const SeedImporter = {
    /**
     * Tải file JSON seed từ /seed-vocabulary/
     * @param {string} filename - VD: "test-samples.json"
     * @returns {Promise<Object>}
     */
    async loadSeedFile(filename) {
        const url = `/seed-vocabulary/${filename}?t=${Date.now()}`;
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) throw new Error(`Không tải được ${url} (${res.status})`);
        return await res.json();
    },

    _normalize(value) {
        return String(value || '').trim().toLowerCase();
    },

    _buildIdentityKey(fieldValues = {}, folderId = null) {
        const word = this._normalize(fieldValues.word);
        if (!word) return '';

        const tags = Array.isArray(fieldValues.tags) ? fieldValues.tags : [];
        const folder = this._normalize(folderId);
        const role = this._normalize(fieldValues.irregularRole);
        const pos = this._normalize(fieldValues.partOfSpeech);

        if (tags.includes('irregular-verb')) {
            return ['irregular-verb', word, folder, role].join('::');
        }

        if (tags.includes('irregular-comparative') || tags.includes('irregular-superlative')) {
            const irregularTag = tags.includes('irregular-comparative')
                ? 'irregular-comparative'
                : 'irregular-superlative';
            return [irregularTag, word, folder, role, pos].join('::');
        }

        return word;
    },

    /**
     * Lấy map identityKey -> card để import đúng các trường hợp cùng word nhưng khác topic/role.
     */
    async _getExistingCardsByIdentity() {
        try {
            const cards = await FirestoreDB.getCards({ cardType: 'vocabulary' });
            const map = new Map();
            cards.forEach(c => {
                const fv = c.fieldValues || {};
                const key = this._buildIdentityKey(fv, c.folderId || null);
                if (key) map.set(key, c);
            });
            return map;
        } catch (e) {
            console.warn('[SeedImporter] Không đọc được cards hiện có:', e);
            return new Map();
        }
    },

    /**
     * Sanitize fieldValues theo schema vocabulary
     */
    _sanitize(fieldValues) {
        const schema = CardSchemas.getSchema('vocabulary');
        const out = {};
        schema.fields.forEach(f => {
            const v = fieldValues[f.key];
            if (v === undefined || v === null) {
                if (f.default !== undefined) out[f.key] = f.default;
                return;
            }
            out[f.key] = v;
        });
        // Đảm bảo difficulty default
        if (!out.difficulty) out.difficulty = 'intermediate';
        // Đảm bảo tags là array
        if (out.tags && !Array.isArray(out.tags)) out.tags = [];
        return out;
    },

    /**
     * Import seed JSON vào Firestore (skip nếu word đã tồn tại)
     * @param {Object} seed - { _meta, cases, cards: [...] }
     * @param {Function} onProgress - callback({ current, total, word, status })
     * @returns {Promise<{ created, skipped, failed, total }>}
     */
    async importSeed(seed, onProgress) {
        if (!seed || !Array.isArray(seed.cards)) {
            throw new Error('File seed không hợp lệ (thiếu mảng cards)');
        }

        const defaultFolderId = (seed._meta && seed._meta.topicId) || null;
        const existingMap = await this._getExistingCardsByIdentity();
        const total = seed.cards.length;
        let created = 0;
        let skipped = 0;
        let updated = 0;
        let failed = 0;
        const errors = [];
        // Các field cần đồng bộ lại với seed khi card đã tồn tại đúng cùng identity.
        // Với irregular verbs, identity là word + folderId + irregularRole để không làm mất
        // các trường hợp cùng surface-form nhưng thuộc topic/role khác nhau.
        // Với irregular comparative/superlative, identity cần thêm partOfSpeech để giữ đồng thời
        // các cặp cùng surface-form như "better" (adjective) và "better" (adverb).
        // LƯU Ý: KHÔNG đưa field mảng (vd 'tags') vào đây — so sánh !== với array luôn trả về true gây update vô hạn.
        const SYNC_FIELDS = ['example', 'irregularRole', 'baseForm', 'baseMeaning', 'meaning', 'ipa', 'partOfSpeech', 'difficulty', 'note', 'pastSimple', 'pastParticiple'];
        // Field mảng cần so sánh deep (JSON stringify)
        const SYNC_ARRAY_FIELDS = ['tags'];

        for (let i = 0; i < total; i++) {
            const entry = seed.cards[i];
            const fieldValues = this._sanitize(entry.fieldValues || {});
            const word = (fieldValues.word || '').trim();
            const folderId = entry.folderId || defaultFolderId;
            const identityKey = this._buildIdentityKey(fieldValues, folderId);

            if (!word) {
                failed++;
                errors.push(`Card #${i + 1}: thiếu word`);
                if (onProgress) onProgress({ current: i + 1, total, word: '?', status: 'failed' });
                continue;
            }

            if (existingMap.has(identityKey)) {
                // Card đã tồn tại: merge lại các field example nếu seed có giá trị khác (chỉ ghi đè, không xoá).
                const existingCard = existingMap.get(identityKey);
                const existingFv = existingCard.fieldValues || {};
                const patch = {};
                SYNC_FIELDS.forEach(k => {
                    const seedVal = fieldValues[k];
                    if (seedVal && seedVal !== existingFv[k]) {
                        patch[k] = seedVal;
                    }
                });
                SYNC_ARRAY_FIELDS.forEach(k => {
                    const seedVal = fieldValues[k];
                    if (Array.isArray(seedVal) && seedVal.length > 0) {
                        const existVal = existingFv[k];
                        const existJson = Array.isArray(existVal) ? JSON.stringify(existVal) : '';
                        if (JSON.stringify(seedVal) !== existJson) {
                            patch[k] = seedVal;
                        }
                    }
                });
                if (Object.keys(patch).length > 0) {
                    try {
                        const mergedFv = { ...existingFv, ...patch };
                        await FirestoreDB.updateCard(existingCard.id, { fieldValues: mergedFv });
                        updated++;
                        if (onProgress) onProgress({ current: i + 1, total, word, status: 'updated' });
                    } catch (e) {
                        failed++;
                        errors.push(`Card "${word}" (update): ${e.message}`);
                        if (onProgress) onProgress({ current: i + 1, total, word, status: 'failed' });
                    }
                } else {
                    skipped++;
                    if (onProgress) onProgress({ current: i + 1, total, word, status: 'skipped' });
                }
                continue;
            }

            try {
                const id = await FirestoreDB.createCard({
                    folderId,
                    cardType: 'vocabulary',
                    fieldValues
                });
                if (id) {
                    created++;
                    existingMap.set(identityKey, { id, folderId, fieldValues });
                    if (onProgress) onProgress({ current: i + 1, total, word, status: 'created' });
                } else {
                    failed++;
                    errors.push(`Card "${word}": createCard trả về null`);
                    if (onProgress) onProgress({ current: i + 1, total, word, status: 'failed' });
                }
            } catch (e) {
                failed++;
                errors.push(`Card "${word}": ${e.message}`);
                if (onProgress) onProgress({ current: i + 1, total, word, status: 'failed' });
            }
        }

        return { created, skipped, updated, failed, total, errors };
    },

    /**
     * Tiện lợi: import 1 file seed có sẵn trong /public/seed-vocabulary/
     */
    async importFile(filename, onProgress) {
        const seed = await this.loadSeedFile(filename);
        return await this.importSeed(seed, onProgress);
    }
};

window.SeedImporter = SeedImporter;
