// ============================================
// Folder View Page - Xem nội dung thư mục + thẻ học
// ============================================

const FolderViewPage = {
    currentFolderId: null,
    currentFolder: null,
    cards: [],

    async render(params) {
        this.currentFolderId = params?.id || null;

        if (!this.currentFolderId) {
            return `
                <div class="folder-view-page page-enter">
                    <div class="empty-state">
                        <span class="material-icons-round empty-state-icon">folder_off</span>
                        <h3 class="empty-state-title">Thư mục không tồn tại</h3>
                        <button class="btn btn-secondary" onclick="Router.navigate('/')">
                            <span class="material-icons-round">arrow_back</span>
                            Quay lại trang chính
                        </button>
                    </div>
                </div>
            `;
        }

        // Load folder data (load all types so we can find the folder)
        await FolderTree.loadFolders(null);
        this.currentFolder = FolderTree.folders.find(f => f.id === this.currentFolderId);

        if (!this.currentFolder) {
            return `
                <div class="folder-view-page page-enter">
                    <div class="empty-state">
                        <span class="material-icons-round empty-state-icon">folder_off</span>
                        <h3 class="empty-state-title">Thư mục không tồn tại</h3>
                        <p class="empty-state-desc">Thư mục này có thể đã bị xóa.</p>
                        <button class="btn btn-secondary" onclick="Router.navigate('/')">
                            <span class="material-icons-round">arrow_back</span>
                            Quay lại trang chính
                        </button>
                    </div>
                </div>
            `;
        }

        // Load cards in this folder
        try {
            this.cards = await FirestoreDB.getCards({ folderId: this.currentFolderId });
        } catch (error) {
            console.error('[FolderView] Error loading cards:', error);
            this.cards = [];
        }

        // Get breadcrumb, subfolders
        const breadcrumb = FolderTree.getBreadcrumb(this.currentFolderId);
        const subfolders = FolderTree.getChildren(this.currentFolderId);
        const folderType = this.currentFolder.type || 'vocabulary';
        const schema = CardSchemas.getSchema(folderType);
        const schemaLabel = schema ? schema.label : folderType;
        const schemaIcon = schema ? schema.icon : 'style';
        const schemaColor = schema ? schema.color : '#6C63FF';

        // Determine back route based on folder type
        const backRoute = folderType === 'grammar' ? '/grammar' : '/vocabulary';

        return `
            <div class="folder-view-page page-enter">
                <!-- Breadcrumb -->
                <nav class="breadcrumb">
                    <a href="#${backRoute}" class="breadcrumb-item" onclick="Router.navigate('${backRoute}');return false;">
                        <span class="material-icons-round" style="font-size:18px;">${schemaIcon}</span>
                        <span>${schemaLabel}</span>
                    </a>
                    ${breadcrumb.map((item, idx) => `
                        <span class="material-icons-round breadcrumb-separator">chevron_right</span>
                        ${idx === breadcrumb.length - 1
                            ? `<span class="breadcrumb-item breadcrumb-current">${Helpers.escapeHtml(item.name)}</span>`
                            : `<a href="#/folder/${item.id}" class="breadcrumb-item">${Helpers.escapeHtml(item.name)}</a>`
                        }
                    `).join('')}
                </nav>

                <!-- Folder Header -->
                <div class="folder-view-header">
                    <div class="folder-view-title">
                        ${this.currentFolder.coverImage
                            ? `<img src="${Helpers.escapeHtml(this.currentFolder.coverImage)}" alt=""
                                    style="width:40px;height:40px;max-width:none;object-fit:cover;border-radius:8px;flex-shrink:0;">`
                            : `<span class="material-icons-round" style="font-size:32px;color:${schemaColor};">folder_open</span>`
                        }
                        <h2>${Helpers.escapeHtml(this.currentFolder.name)}</h2>
                        <span style="font-size:var(--font-size-xs);color:var(--color-text-muted);background:var(--color-surface);padding:2px 8px;border-radius:var(--radius-sm);">${schemaLabel}</span>
                    </div>
                    <div class="folder-view-actions">
                        <button class="btn btn-primary btn-sm" onclick="FolderViewPage.showAddCardModal()">
                            <span class="material-icons-round">add</span>
                            Thêm thẻ
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="FolderTree.showCreateModal('${this.currentFolderId}')">
                            <span class="material-icons-round">create_new_folder</span>
                            Thư mục con
                        </button>
                        <button class="icon-btn" onclick="FolderTree.startRename('${this.currentFolderId}')" title="Đổi tên">
                            <span class="material-icons-round">edit</span>
                        </button>
                        <button class="icon-btn" onclick="FolderTree.showDeleteConfirm('${this.currentFolderId}')" title="Xóa">
                            <span class="material-icons-round" style="color:var(--color-error);">delete</span>
                        </button>
                    </div>
                </div>

                <!-- Subfolders -->
                ${subfolders.length > 0 ? `
                    <div class="folder-view-section">
                        <h4 class="folder-view-section-title">
                            <span class="material-icons-round" style="font-size:20px;">folder</span>
                            Thư mục con (${subfolders.length})
                        </h4>
                        <div class="subfolder-grid">
                            ${subfolders.map(sub => `
                                <div class="subfolder-card glass-card hover-lift" onclick="Router.navigate('/folder/${sub.id}')">
                                    ${FolderTree._renderFolderIcon(sub, false, 'subfolder-icon', 28)}
                                    <span class="subfolder-name">${Helpers.escapeHtml(sub.name)}</span>
                                    <span class="material-icons-round subfolder-arrow">chevron_right</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                <!-- Cards -->
                <div class="folder-view-section">
                    <h4 class="folder-view-section-title">
                        <span class="material-icons-round" style="font-size:20px;color:${schemaColor};">${schemaIcon}</span>
                        Thẻ ${schemaLabel} ${this.cards.length > 0 ? `(${this.cards.length})` : ''}
                    </h4>
                    <div id="cards-list">
                        ${this._renderCardsList()}
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Render cards list
     * @private
     */
    _renderCardsList() {
        if (this.cards.length === 0) {
            const folderType = this.currentFolder?.type || 'vocabulary';
            const schema = CardSchemas.getSchema(folderType);
            return `
                <div class="empty-state" style="padding:var(--spacing-xl) 0;">
                    <span class="material-icons-round" style="font-size:48px;color:var(--color-text-muted);">note_add</span>
                    <p style="color:var(--color-text-muted);font-size:var(--font-size-sm);margin-top:var(--spacing-sm);">
                        Chưa có thẻ nào trong thư mục này.
                    </p>
                    <button class="btn btn-primary btn-sm" onclick="FolderViewPage.showAddCardModal()" style="margin-top:var(--spacing-md);">
                        <span class="material-icons-round">add</span>
                        Thêm thẻ ${schema ? schema.label : ''}
                    </button>
                </div>
            `;
        }

        const folderType = this.currentFolder?.type || 'vocabulary';
        const schema = CardSchemas.getSchema(folderType);

        return `
            <div style="display:flex;flex-direction:column;gap:var(--spacing-sm);">
                ${this.cards.map((card, index) => {
                    const displayText = schema 
                        ? schema.getDisplayText(card.fieldValues || {})
                        : { primary: 'Thẻ ' + (index + 1), secondary: '' };

                    const stateColors = {
                        'new': 'var(--color-info)',
                        'learning': 'var(--color-warning)',
                        'review': 'var(--color-success)',
                        'relearning': 'var(--color-error)'
                    };
                    const stateLabels = {
                        'new': 'Mới',
                        'learning': 'Đang học',
                        'review': 'Ôn tập',
                        'relearning': 'Học lại'
                    };
                    const state = card.state || 'new';

                    return `
                        <div class="glass-card hover-lift" 
                             style="padding:var(--spacing-md);cursor:pointer;display:flex;align-items:center;gap:var(--spacing-md);"
                             onclick="FolderViewPage.showCardDetail('${card.id}')">
                            <div style="width:8px;height:40px;border-radius:4px;background:${stateColors[state] || 'var(--color-text-muted)'};flex-shrink:0;"></div>
                            <div style="flex:1;min-width:0;">
                                <div style="font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                                    ${Helpers.escapeHtml(displayText.primary)}
                                </div>
                                ${displayText.secondary ? `
                                    <div style="font-size:var(--font-size-xs);color:var(--color-text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:2px;">
                                        ${Helpers.escapeHtml(displayText.secondary)}
                                    </div>
                                ` : ''}
                            </div>
                            <span style="font-size:var(--font-size-xs);color:${stateColors[state]};padding:2px 8px;border-radius:var(--radius-sm);background:var(--color-surface);">
                                ${stateLabels[state] || state}
                            </span>
                            <button class="icon-btn" onclick="event.stopPropagation();FolderViewPage.showDeleteCardConfirm('${card.id}')" title="Xóa" style="width:32px;height:32px;">
                                <span class="material-icons-round" style="font-size:18px;color:var(--color-error);">delete</span>
                            </button>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    // ==========================================
    // Add Card Modal
    // ==========================================

    showAddCardModal(editCardId = null) {
        const folderType = this.currentFolder?.type || 'vocabulary';
        const schema = CardSchemas.getSchema(folderType);
        if (!schema) {
            Toast.error('Lỗi', 'Không tìm thấy schema cho loại thẻ này.');
            return;
        }

        // Check if editing an existing card
        let existingCard = null;
        if (editCardId) {
            existingCard = this.cards.find(c => c.id === editCardId);
        }

        const isEdit = !!existingCard;
        const title = isEdit ? `Sửa thẻ ${schema.label}` : `Thêm thẻ ${schema.label}`;
        const submitLabel = isEdit ? 'Lưu' : 'Thêm';
        const submitFn = isEdit ? `FolderViewPage._updateCard('${editCardId}')` : 'FolderViewPage._createCard()';

        const fieldsHtml = schema.fields.map(field => {
            const value = existingCard ? (existingCard.fieldValues?.[field.key] || '') : '';
            const requiredMark = field.required ? ' <span style="color:var(--color-error);">*</span>' : '';

            if (field.type === 'textarea') {
                return `
                    <div class="form-group">
                        <label class="form-label">${field.label}${requiredMark}</label>
                        <textarea id="card-field-${field.key}" class="form-input" rows="3" 
                                  placeholder="${field.placeholder || ''}">${Helpers.escapeHtml(value)}</textarea>
                    </div>
                `;
            }
            return `
                <div class="form-group">
                    <label class="form-label">${field.label}${requiredMark}</label>
                    <input type="text" id="card-field-${field.key}" class="form-input" 
                           value="${Helpers.escapeHtml(value)}"
                           placeholder="${field.placeholder || ''}">
                </div>
            `;
        }).join('');

        Components.createModal({
            title,
            content: fieldsHtml,
            actions: [
                {
                    label: submitLabel,
                    type: 'primary',
                    closeOnClick: false,
                    onClick: () => { eval(submitFn); }
                }
            ]
        });

        // Focus first field
        setTimeout(() => {
            const firstField = document.getElementById(`card-field-${schema.fields[0].key}`);
            if (firstField) firstField.focus();
        }, 100);
    },

    /**
     * Create a new card
     * @private
     */
    async _createCard() {
        const folderType = this.currentFolder?.type || 'vocabulary';
        const schema = CardSchemas.getSchema(folderType);
        if (!schema) return;

        // Collect field values
        const fieldValues = {};
        schema.fields.forEach(field => {
            const el = document.getElementById(`card-field-${field.key}`);
            fieldValues[field.key] = el ? el.value.trim() : '';
        });

        // Validate
        const validation = CardSchemas.validate(folderType, fieldValues);
        if (!validation.valid) {
            Toast.warning('Thiếu thông tin', validation.errors[0]);
            return;
        }

        try {
            const cardId = await FirestoreDB.createCard({
                folderId: this.currentFolderId,
                cardType: folderType,
                fieldValues
            });

            if (cardId) {
                Toast.success('Đã thêm thẻ');
                // Close modal
                const overlay = document.querySelector('.modal-overlay');
                if (overlay) overlay.remove();
                // Reload cards
                this.cards = await FirestoreDB.getCards({ folderId: this.currentFolderId });
                const cardsList = document.getElementById('cards-list');
                if (cardsList) cardsList.innerHTML = this._renderCardsList();
            }
        } catch (error) {
            Toast.error('Lỗi', 'Không thể thêm thẻ.');
            console.error('[FolderView] Error creating card:', error);
        }
    },

    /**
     * Update an existing card
     * @private
     */
    async _updateCard(cardId) {
        const folderType = this.currentFolder?.type || 'vocabulary';
        const schema = CardSchemas.getSchema(folderType);
        if (!schema) return;

        // Collect field values
        const fieldValues = {};
        schema.fields.forEach(field => {
            const el = document.getElementById(`card-field-${field.key}`);
            fieldValues[field.key] = el ? el.value.trim() : '';
        });

        // Validate
        const validation = CardSchemas.validate(folderType, fieldValues);
        if (!validation.valid) {
            Toast.warning('Thiếu thông tin', validation.errors[0]);
            return;
        }

        try {
            await FirestoreDB.updateCard(cardId, { fieldValues });
            Toast.success('Đã cập nhật thẻ');
            // Close modal
            const overlay = document.querySelector('.modal-overlay');
            if (overlay) overlay.remove();
            // Reload cards
            this.cards = await FirestoreDB.getCards({ folderId: this.currentFolderId });
            const cardsList = document.getElementById('cards-list');
            if (cardsList) cardsList.innerHTML = this._renderCardsList();
        } catch (error) {
            Toast.error('Lỗi', 'Không thể cập nhật thẻ.');
            console.error('[FolderView] Error updating card:', error);
        }
    },

    // ==========================================
    // Card Detail
    // ==========================================

    showCardDetail(cardId) {
        const card = this.cards.find(c => c.id === cardId);
        if (!card) return;

        const folderType = this.currentFolder?.type || 'vocabulary';
        const schema = CardSchemas.getSchema(folderType);
        if (!schema) return;

        const fieldsHtml = schema.fields.map(field => {
            const value = card.fieldValues?.[field.key] || '';
            return `
                <div style="margin-bottom:var(--spacing-sm);">
                    <label style="font-size:var(--font-size-xs);color:var(--color-text-muted);text-transform:uppercase;letter-spacing:0.5px;">${field.label}</label>
                    <div style="margin-top:2px;font-size:var(--font-size-sm);${!value ? 'color:var(--color-text-muted);font-style:italic;' : ''}">
                        ${value ? Helpers.escapeHtml(value) : '(trống)'}
                    </div>
                </div>
            `;
        }).join('');

        const stateLabels = { 'new': 'Mới', 'learning': 'Đang học', 'review': 'Ôn tập', 'relearning': 'Học lại' };

        Components.createModal({
            title: schema.getDisplayText(card.fieldValues || {}).primary,
            content: `
                ${fieldsHtml}
                <div style="border-top:1px solid var(--color-border);padding-top:var(--spacing-sm);margin-top:var(--spacing-md);">
                    <span style="font-size:var(--font-size-xs);color:var(--color-text-muted);">
                        Trạng thái: ${stateLabels[card.state] || card.state} · 
                        Ôn ${card.reps || 0} lần · 
                        Quên ${card.lapses || 0} lần
                    </span>
                </div>
            `,
            actions: [
                {
                    label: 'Sửa',
                    type: 'secondary',
                    closeOnClick: true,
                    onClick: () => {
                        setTimeout(() => this.showAddCardModal(cardId), 200);
                    }
                },
                {
                    label: 'Xóa',
                    type: 'danger',
                    closeOnClick: true,
                    onClick: () => {
                        setTimeout(() => this.showDeleteCardConfirm(cardId), 200);
                    }
                }
            ]
        });
    },

    // ==========================================
    // Delete Card
    // ==========================================

    showDeleteCardConfirm(cardId) {
        const card = this.cards.find(c => c.id === cardId);
        if (!card) return;

        const folderType = this.currentFolder?.type || 'vocabulary';
        const schema = CardSchemas.getSchema(folderType);
        const displayText = schema ? schema.getDisplayText(card.fieldValues || {}).primary : 'thẻ này';

        Components.confirm(
            'Xóa thẻ',
            `Bạn có chắc muốn xóa thẻ "${displayText}"? Thao tác này không thể hoàn tác.`,
            {
                confirmText: 'Xóa',
                confirmClass: 'btn-danger',
                onConfirm: () => this._deleteCard(cardId)
            }
        );
    },

    async _deleteCard(cardId) {
        try {
            await FirestoreDB.deleteCard(cardId);
            Toast.success('Đã xóa thẻ');
            // Remove from local array
            this.cards = this.cards.filter(c => c.id !== cardId);
            const cardsList = document.getElementById('cards-list');
            if (cardsList) cardsList.innerHTML = this._renderCardsList();
        } catch (error) {
            Toast.error('Lỗi', 'Không thể xóa thẻ.');
            console.error('[FolderView] Error deleting card:', error);
        }
    },

    onEnter(params) {
        console.log('[FolderViewPage] Entered, folder:', params?.id);
    }
};
