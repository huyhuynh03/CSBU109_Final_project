// ============================================
// Card Schemas - Định nghĩa fields cố định cho các loại thẻ
// ============================================

const CardSchemas = {
    /**
     * Schema cho thẻ Từ vựng
     */
    vocabulary: {
        type: 'vocabulary',
        label: 'Từ vựng',
        icon: 'menu_book',
        color: '#3B82F6',
        fields: [
            { key: 'word', label: 'Từ vựng', type: 'text', required: true, placeholder: 'VD: abandon' },
            { key: 'ipa', label: 'Phiên âm (IPA)', type: 'text', required: false, placeholder: 'VD: /əˈbæn.dən/' },
            { key: 'partOfSpeech', label: 'Loại từ', type: 'select', required: false, placeholder: 'VD: noun, verb, adjective',
                options: ['noun', 'verb', 'adjective', 'adverb', 'preposition', 'conjunction', 'interjection', 'pronoun', 'determiner', 'idiom', 'phrasal verb'] },
            { key: 'difficulty', label: 'Độ khó', type: 'select', required: false, default: 'intermediate',
                options: ['intermediate', 'advanced'] },
            { key: 'meaning', label: 'Nghĩa', type: 'text', required: true, placeholder: 'VD: từ bỏ, bỏ rơi' },
            { key: 'example', label: 'Câu ví dụ', type: 'textarea', required: false, placeholder: 'VD: He abandoned his car in the parking lot.' },
            { key: 'note', label: 'Ghi chú', type: 'textarea', required: false, placeholder: 'Ghi chú thêm...' },
            { key: 'familyId', label: 'Family ID', type: 'text', required: false, placeholder: 'VD: educate (gốc từ chung)', hidden: true },
            { key: 'familyOrder', label: 'Thứ tự trong family', type: 'number', required: false, placeholder: '1 = gốc, 2,3... = biến thể', hidden: true },
            { key: 'tags', label: 'Tags', type: 'tags', required: false, placeholder: 'VD: irregular-verb, phrasal-verb',
                allowedValues: ['idiom', 'phrasal-verb', 'irregular-verb', 'irregular-adjective', 'irregular-adverb'] },
            // ==== BQT (v2 schema): mỗi thẻ = 1 dạng độc lập ====
            // irregularRole: pastSimple | pastParticiple | comparative | superlative
            // baseForm: nguyên mẫu tham chiếu (hiển thị chú thích, không kiểm tra)
            { key: 'irregularRole', label: 'Vai trò BQT', type: 'select', required: false, hidden: true,
                options: ['', 'pastSimple', 'pastParticiple', 'comparative', 'superlative'] },
            { key: 'baseForm', label: 'Nguyên mẫu', type: 'text', required: false, placeholder: 'VD: well (trạng từ nguyên mẫu của best)', hidden: true },
            { key: 'baseMeaning', label: 'Nghĩa nguyên mẫu', type: 'text', required: false, hidden: true }
        ],
        /**
         * Get display text for a card (used in lists)
         * @param {Object} fieldValues
         * @returns {{ primary: string, secondary: string }}
         */
        getDisplayText(fieldValues) {
            return {
                primary: fieldValues.word || '(chưa có từ)',
                secondary: fieldValues.meaning || ''
            };
        }
    },

    /**
     * Schema cho thẻ Ngữ pháp
     */
    grammar: {
        type: 'grammar',
        label: 'Ngữ pháp',
        icon: 'school',
        color: '#10B981',
        fields: [
            { key: 'title', label: 'Tên cấu trúc', type: 'text', required: true, placeholder: 'VD: Present Perfect' },
            { key: 'structure', label: 'Công thức', type: 'text', required: true, placeholder: 'VD: S + have/has + V3' },
            { key: 'usage', label: 'Cách dùng', type: 'textarea', required: true, placeholder: 'Mô tả cách sử dụng...' },
            { key: 'example', label: 'Câu ví dụ', type: 'textarea', required: false, placeholder: 'VD: I have lived in Saigon for 5 years.' },
            { key: 'note', label: 'Ghi chú', type: 'textarea', required: false, placeholder: 'Ghi chú thêm...' }
        ],
        /**
         * Get display text for a card (used in lists)
         * @param {Object} fieldValues
         * @returns {{ primary: string, secondary: string }}
         */
        getDisplayText(fieldValues) {
            return {
                primary: fieldValues.title || '(chưa có tiêu đề)',
                secondary: fieldValues.structure || ''
            };
        }
    },

    /**
     * Get schema by card type
     * @param {string} cardType - 'vocabulary' or 'grammar'
     * @returns {Object|null}
     */
    getSchema(cardType) {
        return this[cardType] || null;
    },

    /**
     * Get all available schemas
     * @returns {Array}
     */
    getAllSchemas() {
        return [this.vocabulary, this.grammar];
    },

    /**
     * Create empty field values for a card type
     * @param {string} cardType
     * @returns {Object}
     */
    createEmptyFieldValues(cardType) {
        const schema = this.getSchema(cardType);
        if (!schema) return {};
        const values = {};
        schema.fields.forEach(field => {
            values[field.key] = field.default !== undefined ? field.default : '';
        });
        return values;
    },

    /**
     * Difficulty levels metadata (for vocabulary)
     */
    DIFFICULTY_LEVELS: {
        intermediate: { key: 'intermediate', label: 'Intermediate', short: 'Dễ', band: '4.0 - 5.5' },
        advanced: { key: 'advanced', label: 'Advanced', short: 'Khó', band: '6.0 - 7.5+' }
    },

    /**
     * Get difficulty metadata
     * @param {string} difficulty
     * @returns {Object}
     */
    getDifficultyMeta(difficulty) {
        return this.DIFFICULTY_LEVELS[difficulty] || this.DIFFICULTY_LEVELS.intermediate;
    },

    /**
     * Irregular word helpers (SCHEMA v2 — mỗi thẻ = 1 dạng độc lập)
     * ============================================
     * Tags: 'irregular-verb', 'irregular-adjective', 'irregular-adverb' — dùng để chọn màu/nhãn nhóm.
     * Thẻ mới có: irregularRole (pastSimple|pastParticiple|comparative|superlative) + baseForm (nguyên mẫu).
     */
    IRREGULAR_TAGS: {
        'irregular-verb':      { type: 'verb',      label: 'Động từ BQT',  note: 'Động từ BQT',  shortLabel: 'BQT', color: '#8B5CF6', bg: 'rgba(139,92,246,0.18)' },
        'irregular-adjective': { type: 'adjective', label: 'Tính từ BQT',  note: 'Tính từ BQT',  shortLabel: 'BQT', color: '#F59E0B', bg: 'rgba(245,158,11,0.18)' },
        'irregular-adverb':    { type: 'adverb',    label: 'Trạng từ BQT', note: 'Trạng từ BQT', shortLabel: 'BQT', color: '#EC4899', bg: 'rgba(236,72,153,0.18)' }
    },

    IRREGULAR_ROLE_LABELS: {
        pastSimple:     { label: 'V2 (Quá khứ đơn)',         short: 'V2' },
        pastParticiple: { label: 'V3 (Quá khứ phân từ)',     short: 'V3' },
        comparative:    { label: 'So sánh hơn',              short: 'So sánh hơn' },
        superlative:    { label: 'So sánh nhất',             short: 'So sánh nhất' }
    },

    /**
     * Check if a card is irregular variant (schema v2).
     * LEGACY cards (có pastSimple/pastParticiple/comparative/superlative trên cùng 1 thẻ) KHÔNG còn được nhận diện là irregular
     * → user sẽ bị bắt xoá/migrate qua module tách thẻ.
     */
    isIrregular(card) {
        if (!card || !card.fieldValues) return false;
        const fv = card.fieldValues;
        const tags = fv.tags || [];
        if (!Array.isArray(tags)) return false;
        const hasIrrTag = tags.some(t => this.IRREGULAR_TAGS[t]);
        return hasIrrTag && !!fv.irregularRole;
    },

    /**
     * Check if card is legacy BQT (cấu trúc cũ gộp nhiều biến thể vào 1 thẻ). Trả true nếu phát hiện field biến thể cũ.
     */
    isLegacyIrregular(card) {
        if (!card || !card.fieldValues) return false;
        const fv = card.fieldValues;
        return !!(fv.pastSimple || fv.pastParticiple || fv.comparative || fv.superlative);
    },

    /**
     * Get irregular meta { type, label, color, bg, role, roleLabel, roleShort } for a card; null if not irregular v2.
     */
    getIrregularMeta(card) {
        if (!this.isIrregular(card)) return null;
        const fv = card.fieldValues;
        const tags = fv.tags || [];
        let base = null;
        for (const t of tags) {
            if (this.IRREGULAR_TAGS[t]) { base = { tag: t, ...this.IRREGULAR_TAGS[t] }; break; }
        }
        if (!base) return null;
        const roleMeta = this.IRREGULAR_ROLE_LABELS[fv.irregularRole] || null;
        return {
            ...base,
            role: fv.irregularRole,
            roleLabel: roleMeta ? roleMeta.label : '',
            roleShort: roleMeta ? roleMeta.short : ''
        };
    },

    /**
     * Luồng mới: thẻ chỉ có 1 dạng → không còn variants → luôn trả []. Giữ hàm để tương thích các chỗ gọi cũ.
     */
    getIrregularVariants(card) {
        return [];
    },

    getIrregularVariantsShort(card) {
        return '';
    },

    /**
     * Validate field values against schema
     * @param {string} cardType
     * @param {Object} fieldValues
     * @returns {{ valid: boolean, errors: string[] }}
     */
    validate(cardType, fieldValues) {
        const schema = this.getSchema(cardType);
        if (!schema) return { valid: false, errors: ['Loại thẻ không hợp lệ'] };

        const errors = [];
        schema.fields.forEach(field => {
            if (field.required && (!fieldValues[field.key] || !fieldValues[field.key].trim())) {
                errors.push(`"${field.label}" là bắt buộc`);
            }
        });

        return { valid: errors.length === 0, errors };
    }
};
