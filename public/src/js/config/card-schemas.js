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
            { key: 'pastSimple', label: 'Quá khứ đơn (V2)', type: 'text', required: false, placeholder: 'VD: went', hidden: true },
            { key: 'pastParticiple', label: 'Quá khứ phân từ (V3)', type: 'text', required: false, placeholder: 'VD: gone', hidden: true },
            { key: 'comparative', label: 'So sánh hơn', type: 'text', required: false, placeholder: 'VD: better', hidden: true },
            { key: 'superlative', label: 'So sánh nhất', type: 'text', required: false, placeholder: 'VD: best', hidden: true }
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
     * Irregular word helpers
     * ============================================
     * Tags: 'irregular-verb', 'irregular-adjective', 'irregular-adverb'
     * Variants được lưu trong fields: pastSimple, pastParticiple, comparative, superlative
     */
    IRREGULAR_TAGS: {
        'irregular-verb':      { type: 'verb',      label: 'V1·V2·V3',      shortLabel: 'BQT', color: '#8B5CF6', bg: 'rgba(139,92,246,0.18)' },
        'irregular-adjective': { type: 'adjective', label: 'So sánh BQT',   shortLabel: 'BQT', color: '#F59E0B', bg: 'rgba(245,158,11,0.18)' },
        'irregular-adverb':    { type: 'adverb',    label: 'Trạng từ BQT', shortLabel: 'BQT', color: '#EC4899', bg: 'rgba(236,72,153,0.18)' }
    },

    /**
     * Check if a card is irregular (has irregular tag + has variants)
     */
    isIrregular(card) {
        if (!card || !card.fieldValues) return false;
        const tags = card.fieldValues.tags || [];
        if (!Array.isArray(tags)) return false;
        return tags.some(t => this.IRREGULAR_TAGS[t]);
    },

    /**
     * Get irregular meta { type, label, color, bg } for a card; null if not irregular
     */
    getIrregularMeta(card) {
        if (!card || !card.fieldValues) return null;
        const tags = card.fieldValues.tags || [];
        if (!Array.isArray(tags)) return null;
        for (const t of tags) {
            if (this.IRREGULAR_TAGS[t]) return { tag: t, ...this.IRREGULAR_TAGS[t] };
        }
        return null;
    },

    /**
     * Get list of irregular variants for a card.
     * Returns: [{ key, label, value, hint }] - empty array if no variants found.
     * Verb: pastSimple (V2), pastParticiple (V3)
     * Adj/Adv: comparative, superlative
     */
    getIrregularVariants(card) {
        const meta = this.getIrregularMeta(card);
        if (!meta) return [];
        const fv = card.fieldValues || {};
        const variants = [];
        if (meta.type === 'verb') {
            if (fv.pastSimple) variants.push({ key: 'pastSimple', label: 'Quá khứ đơn (V2)', shortLabel: 'V2', value: fv.pastSimple });
            if (fv.pastParticiple) variants.push({ key: 'pastParticiple', label: 'Quá khứ phân từ (V3)', shortLabel: 'V3', value: fv.pastParticiple });
        } else if (meta.type === 'adjective' || meta.type === 'adverb') {
            if (fv.comparative) variants.push({ key: 'comparative', label: 'So sánh hơn', shortLabel: 'So sánh hơn', value: fv.comparative });
            if (fv.superlative) variants.push({ key: 'superlative', label: 'So sánh nhất', shortLabel: 'So sánh nhất', value: fv.superlative });
        }
        return variants;
    },

    /**
     * Get short text "wrote / written" or "better / best" to show in lists.
     */
    getIrregularVariantsShort(card) {
        const variants = this.getIrregularVariants(card);
        if (!variants.length) return '';
        return variants.map(v => v.value).join(' / ');
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
