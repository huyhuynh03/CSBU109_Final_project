// ============================================
// Fields Page - Tổng hợp trường từ tất cả hồ sơ
// ============================================

const FieldsPage = {
    async render() {
        if (!Auth.isSignedIn()) {
            return `
                <div class="page-enter" style="padding:var(--spacing-xl);text-align:center;">
                    <span class="material-icons-round" style="font-size:64px;color:var(--color-text-muted);">lock</span>
                    <h3 style="margin-top:var(--spacing-md);">Đăng nhập để sử dụng</h3>
                    <button class="btn btn-primary" onclick="Router.navigate('/auth')" style="margin-top:var(--spacing-md);">Đăng nhập</button>
                </div>
            `;
        }

        const cardTypes = await FirestoreDB.getCardTypes();

        return `
            <div class="fields-page page-enter" style="max-width:700px;margin:0 auto;">
                <!-- Header -->
                <div style="display:flex;align-items:center;gap:var(--spacing-sm);margin-bottom:var(--spacing-lg);">
                    <button class="icon-btn" onclick="Router.navigate('/')" title="Quay lại">
                        <span class="material-icons-round">arrow_back</span>
                    </button>
                    <h2 style="margin:0;font-size:var(--font-size-xl);">Trường</h2>
                </div>

                ${this._renderFieldGroups(cardTypes)}
            </div>
        `;
    },

    /**
     * Render fields grouped by card type
     */
    _renderFieldGroups(cardTypes) {
        if (cardTypes.length === 0) {
            return `
                <div class="empty-state" style="padding:var(--spacing-2xl) var(--spacing-lg);text-align:center;">
                    <span class="material-icons-round empty-state-icon" style="font-size:48px;">text_fields</span>
                    <h3 class="empty-state-title">Chưa có trường nào</h3>
                    <p class="empty-state-desc">Tạo hồ sơ cấu hình và thêm trường để bắt đầu.</p>
                    <button class="btn btn-primary" onclick="Router.navigate('/profiles')">
                        <span class="material-icons-round">tune</span>
                        Đi tới Hồ sơ cấu hình
                    </button>
                </div>
            `;
        }

        // Filter card types that have at least one field
        const typesWithFields = cardTypes.filter(ct => ct.fields && ct.fields.length > 0);
        const typesWithoutFields = cardTypes.filter(ct => !ct.fields || ct.fields.length === 0);

        if (typesWithFields.length === 0) {
            return `
                <div class="empty-state" style="padding:var(--spacing-2xl) var(--spacing-lg);text-align:center;">
                    <span class="material-icons-round empty-state-icon" style="font-size:48px;">text_fields</span>
                    <h3 class="empty-state-title">Chưa có trường nào</h3>
                    <p class="empty-state-desc">Có ${cardTypes.length} hồ sơ nhưng chưa hồ sơ nào có trường. Thêm trường vào hồ sơ cấu hình.</p>
                    <button class="btn btn-primary" onclick="Router.navigate('/profiles')">
                        <span class="material-icons-round">tune</span>
                        Đi tới Hồ sơ cấu hình
                    </button>
                </div>
            `;
        }

        let totalFields = 0;
        const groupsHtml = typesWithFields.map(ct => {
            const fields = ct.fields || [];
            totalFields += fields.length;

            const fieldsHtml = fields.map((field, i) => {
                const typeLabel = { text: 'Văn bản', textarea: 'Đoạn văn' }[field.type] || field.type;
                return `
                    <div style="display:flex;align-items:center;gap:var(--spacing-sm);padding:var(--spacing-xs) 0;${i < fields.length - 1 ? 'border-bottom:1px solid var(--color-border);' : ''}">
                        <span class="material-icons-round" style="font-size:16px;color:var(--color-text-muted);">label</span>
                        <span style="flex:1;font-size:var(--font-size-sm);">${Helpers.escapeHtml(field.name)}</span>
                        <span style="font-size:var(--font-size-xs);color:var(--color-text-muted);padding:2px 8px;border-radius:var(--radius-sm);background:var(--color-surface);">${typeLabel}</span>
                        ${field.required ? '<span style="font-size:var(--font-size-xs);color:var(--color-primary);">Bắt buộc</span>' : ''}
                    </div>
                `;
            }).join('');

            return `
                <div class="glass-card" style="padding:var(--spacing-md);margin-bottom:var(--spacing-md);">
                    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--spacing-sm);padding-bottom:var(--spacing-sm);border-bottom:2px solid var(--color-primary-alpha, rgba(108,99,255,0.2));">
                        <div style="display:flex;align-items:center;gap:var(--spacing-sm);">
                            <span class="material-icons-round" style="font-size:20px;color:var(--color-primary);">description</span>
                            <h4 style="margin:0;">${Helpers.escapeHtml(ct.name)}</h4>
                        </div>
                        <button class="btn btn-sm btn-secondary" onclick="Router.navigate('/profiles/${ct.id}')" style="font-size:var(--font-size-xs);">
                            <span class="material-icons-round" style="font-size:14px;">edit</span> Sửa
                        </button>
                    </div>
                    ${fieldsHtml}
                </div>
            `;
        }).join('');

        // Summary
        const summary = `
            <div style="display:flex;gap:var(--spacing-md);margin-bottom:var(--spacing-lg);">
                <div class="glass-card" style="flex:1;padding:var(--spacing-md);text-align:center;">
                    <div style="font-size:var(--font-size-2xl);font-weight:700;color:var(--color-primary);">${totalFields}</div>
                    <div style="font-size:var(--font-size-xs);color:var(--color-text-muted);">Tổng số trường</div>
                </div>
                <div class="glass-card" style="flex:1;padding:var(--spacing-md);text-align:center;">
                    <div style="font-size:var(--font-size-2xl);font-weight:700;color:var(--color-primary);">${typesWithFields.length}</div>
                    <div style="font-size:var(--font-size-xs);color:var(--color-text-muted);">Hồ sơ có trường</div>
                </div>
                ${typesWithoutFields.length > 0 ? `
                <div class="glass-card" style="flex:1;padding:var(--spacing-md);text-align:center;">
                    <div style="font-size:var(--font-size-2xl);font-weight:700;color:var(--color-warning);">${typesWithoutFields.length}</div>
                    <div style="font-size:var(--font-size-xs);color:var(--color-text-muted);">Hồ sơ chưa có trường</div>
                </div>
                ` : ''}
            </div>
        `;

        return summary + groupsHtml;
    }
};
