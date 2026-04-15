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
            { key: 'meaning', label: 'Nghĩa', type: 'text', required: true, placeholder: 'VD: từ bỏ, bỏ rơi' },
            { key: 'example', label: 'Câu ví dụ', type: 'textarea', required: false, placeholder: 'VD: He abandoned his car in the parking lot.' },
            { key: 'note', label: 'Ghi chú', type: 'textarea', required: false, placeholder: 'Ghi chú thêm...' }
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
            values[field.key] = '';
        });
        return values;
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
