// ============================================
// Profile Editor Page - Chi tiết hồ sơ cấu hình
// ============================================
// v2: Back button thông minh - navigate về folder cha nếu có

const ProfileEditorPage = {
    cardType: null,
    editingFieldIndex: null,

    async render(params) {
        const typeId = params.id;

        if (!Auth.isSignedIn()) {
            return `
                <div class="page-enter" style="padding:var(--spacing-xl);text-align:center;">
                    <span class="material-icons-round" style="font-size:64px;color:var(--color-text-muted);">lock</span>
                    <h3 style="margin-top:var(--spacing-md);">Đăng nhập để sử dụng</h3>
                    <button class="btn btn-primary" onclick="Router.navigate('/auth')" style="margin-top:var(--spacing-md);">Đăng nhập</button>
                </div>
            `;
        }

        // Load card type
        this.cardType = await FirestoreDB.getCardType(typeId);
        if (!this.cardType) {
            return `
                <div class="page-enter" style="padding:var(--spacing-xl);text-align:center;">
                    <span class="material-icons-round" style="font-size:64px;color:var(--color-text-muted);">error_outline</span>
                    <h3 style="margin-top:var(--spacing-md);">Không tìm thấy hồ sơ</h3>
                    <button class="btn btn-secondary" onclick="Router.navigate('/profiles')" style="margin-top:var(--spacing-md);">
                        <span class="material-icons-round">arrow_back</span> Quay lại
                    </button>
                </div>
            `;
        }

        // Load profile folders for dropdown
        await ProfileFolderTree.loadFolders();

        return this._renderPage();
    },

    /**
     * Render the full editor page
     */
    _renderPage() {
        const ct = this.cardType;
        const fields = ct.fields || [];

        // Build folder dropdown
        let folderOptions = '<option value="">-- Không phân loại --</option>';
        ProfileFolderTree.folders.forEach(f => {
            const selected = f.id === ct.folderId ? 'selected' : '';
            folderOptions += `<option value="${f.id}" ${selected}>${Helpers.escapeHtml(f.name)}</option>`;
        });

        return `
            <div class="profile-editor-page page-enter" style="max-width:700px;margin:0 auto;">
                <!-- Header -->
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--spacing-lg);">
                    <div style="display:flex;align-items:center;gap:var(--spacing-sm);">
                        <button class="icon-btn" onclick="ProfileEditorPage._goBack()" title="Quay lại">
                            <span class="material-icons-round">arrow_back</span>
                        </button>
                        <h2 style="margin:0;font-size:var(--font-size-xl);">${Helpers.escapeHtml(ct.name)}</h2>
                    </div>
                    <div style="display:flex;gap:var(--spacing-sm);">
                        <button class="btn btn-primary btn-sm" onclick="ProfileEditorPage.saveAll()">
                            <span class="material-icons-round" style="font-size:18px;">save</span> Lưu
                        </button>
                        <button class="btn btn-sm" style="color:var(--color-error);" onclick="ProfileEditorPage.showDeleteConfirm()">
                            <span class="material-icons-round" style="font-size:18px;">delete</span>
                        </button>
                    </div>
                </div>

                <!-- Basic Info -->
                <div class="glass-card" style="padding:var(--spacing-lg);margin-bottom:var(--spacing-lg);">
                    <div class="form-group" style="margin-bottom:var(--spacing-md);">
                        <label class="form-label">Tên hồ sơ</label>
                        <input type="text" id="pe-name" class="form-input" value="${Helpers.escapeHtml(ct.name)}">
                    </div>
                    <div class="form-group" style="margin-bottom:0;">
                        <label class="form-label">Thư mục</label>
                        <select id="pe-folder" class="form-input">${folderOptions}</select>
                    </div>
                </div>

                <!-- Fields Section -->
                <div class="glass-card" style="padding:var(--spacing-lg);">
                    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--spacing-md);">
                        <h3 style="margin:0;font-size:var(--font-size-md);">Danh sách trường</h3>
                        <button class="btn btn-sm btn-secondary" onclick="ProfileEditorPage.addField()">
                            <span class="material-icons-round" style="font-size:18px;">add</span> Thêm trường
                        </button>
                    </div>

                    <div id="pe-fields-list">
                        ${this._renderFieldsList(fields)}
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Render the fields list
     */
    _renderFieldsList(fields) {
        if (!fields || fields.length === 0) {
            return `
                <div style="text-align:center;padding:var(--spacing-lg);color:var(--color-text-muted);">
                    <span class="material-icons-round" style="font-size:36px;">text_fields</span>
                    <p style="font-size:var(--font-size-sm);margin-top:var(--spacing-xs);">Chưa có trường nào. Nhấn "Thêm trường" để bắt đầu.</p>
                </div>
            `;
        }

        return fields.map((field, index) => {
            const isEditing = this.editingFieldIndex === index;
            const typeLabel = { text: 'Văn bản', textarea: 'Đoạn văn' }[field.type] || field.type;

            if (isEditing) {
                return `
                    <div class="field-item" style="border:1px solid var(--color-primary);border-radius:var(--radius-md);padding:var(--spacing-md);margin-bottom:var(--spacing-sm);background:var(--color-surface-alpha, rgba(255,255,255,0.03));">
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--spacing-sm);margin-bottom:var(--spacing-sm);">
                            <div class="form-group" style="margin:0;">
                                <label class="form-label" style="font-size:var(--font-size-xs);">Tên trường</label>
                                <input type="text" id="pe-field-name-${index}" class="form-input" value="${Helpers.escapeHtml(field.name)}" style="font-size:var(--font-size-sm);">
                            </div>
                            <div class="form-group" style="margin:0;">
                                <label class="form-label" style="font-size:var(--font-size-xs);">Loại</label>
                                <select id="pe-field-type-${index}" class="form-input" style="font-size:var(--font-size-sm);">
                                    <option value="text" ${field.type === 'text' ? 'selected' : ''}>Văn bản</option>
                                    <option value="textarea" ${field.type === 'textarea' ? 'selected' : ''}>Đoạn văn</option>
                                </select>
                            </div>
                        </div>
                        <div style="display:flex;align-items:center;justify-content:space-between;">
                            <label style="display:flex;align-items:center;gap:var(--spacing-xs);font-size:var(--font-size-sm);cursor:pointer;">
                                <input type="checkbox" id="pe-field-req-${index}" ${field.required ? 'checked' : ''}>
                                Bắt buộc
                            </label>
                            <div style="display:flex;gap:var(--spacing-xs);">
                                <button class="btn btn-sm btn-primary" onclick="ProfileEditorPage.saveField(${index})">Xong</button>
                                <button class="btn btn-sm btn-secondary" onclick="ProfileEditorPage.cancelEditField()">Hủy</button>
                            </div>
                        </div>
                    </div>
                `;
            }

            return `
                <div class="field-item" style="display:flex;align-items:center;gap:var(--spacing-sm);padding:var(--spacing-sm) var(--spacing-md);margin-bottom:var(--spacing-xs);border-radius:var(--radius-sm);border:1px solid var(--color-border);">
                    <!-- Drag handle / Order -->
                    <span style="color:var(--color-text-muted);font-size:var(--font-size-sm);min-width:20px;">${index + 1}.</span>
                    
                    <!-- Field info -->
                    <div style="flex:1;min-width:0;">
                        <span style="font-weight:500;">${Helpers.escapeHtml(field.name)}</span>
                        <span style="font-size:var(--font-size-xs);color:var(--color-text-muted);margin-left:var(--spacing-xs);">[${typeLabel}]</span>
                        ${field.required ? '<span style="font-size:var(--font-size-xs);color:var(--color-primary);margin-left:var(--spacing-xs);">• Bắt buộc</span>' : ''}
                    </div>

                    <!-- Move buttons -->
                    <button class="icon-btn" onclick="ProfileEditorPage.moveField(${index}, -1)" title="Lên" style="width:28px;height:28px;" ${index === 0 ? 'disabled' : ''}>
                        <span class="material-icons-round" style="font-size:16px;">arrow_upward</span>
                    </button>
                    <button class="icon-btn" onclick="ProfileEditorPage.moveField(${index}, 1)" title="Xuống" style="width:28px;height:28px;" ${index === fields.length - 1 ? 'disabled' : ''}>
                        <span class="material-icons-round" style="font-size:16px;">arrow_downward</span>
                    </button>

                    <!-- Edit -->
                    <button class="icon-btn" onclick="ProfileEditorPage.editField(${index})" title="Sửa" style="width:28px;height:28px;">
                        <span class="material-icons-round" style="font-size:16px;">edit</span>
                    </button>

                    <!-- Delete -->
                    <button class="icon-btn" onclick="ProfileEditorPage.removeField(${index})" title="Xóa" style="width:28px;height:28px;">
                        <span class="material-icons-round" style="font-size:16px;color:var(--color-error);">close</span>
                    </button>
                </div>
            `;
        }).join('');
    },

    /**
     * Refresh fields list in DOM
     */
    _refreshFields() {
        const container = document.getElementById('pe-fields-list');
        if (container) {
            container.innerHTML = this._renderFieldsList(this.cardType.fields || []);
        }
    },

    // ==========================================
    // Field CRUD
    // ==========================================

    /**
     * Add a new field
     */
    addField() {
        if (!this.cardType.fields) this.cardType.fields = [];
        this.cardType.fields.push({
            name: '',
            type: 'text',
            required: false,
            order: this.cardType.fields.length
        });
        this.editingFieldIndex = this.cardType.fields.length - 1;
        this._refreshFields();

        // Focus on name input
        setTimeout(() => {
            const input = document.getElementById(`pe-field-name-${this.editingFieldIndex}`);
            if (input) input.focus();
        }, 50);
    },

    /**
     * Edit an existing field
     */
    editField(index) {
        this.editingFieldIndex = index;
        this._refreshFields();
        setTimeout(() => {
            const input = document.getElementById(`pe-field-name-${index}`);
            if (input) input.focus();
        }, 50);
    },

    /**
     * Save field edits
     */
    saveField(index) {
        const nameInput = document.getElementById(`pe-field-name-${index}`);
        const typeSelect = document.getElementById(`pe-field-type-${index}`);
        const reqCheckbox = document.getElementById(`pe-field-req-${index}`);

        const name = nameInput ? nameInput.value.trim() : '';
        if (!name) {
            Toast.warning('Vui lòng nhập tên trường');
            return;
        }

        this.cardType.fields[index] = {
            name,
            type: typeSelect ? typeSelect.value : 'text',
            required: reqCheckbox ? reqCheckbox.checked : false,
            order: index
        };

        this.editingFieldIndex = null;
        this._refreshFields();
    },

    /**
     * Cancel editing field
     */
    cancelEditField() {
        // If the field is new (empty name), remove it
        if (this.editingFieldIndex !== null) {
            const field = this.cardType.fields[this.editingFieldIndex];
            if (!field.name) {
                this.cardType.fields.splice(this.editingFieldIndex, 1);
            }
        }
        this.editingFieldIndex = null;
        this._refreshFields();
    },

    /**
     * Remove a field
     */
    removeField(index) {
        const field = this.cardType.fields[index];
        const name = field.name || `Trường ${index + 1}`;

        Components.confirm('Xóa trường', `Bạn có chắc muốn xóa trường "${name}"?`, {
            confirmText: 'Xóa',
            confirmClass: 'btn-danger',
            onConfirm: () => {
                this.cardType.fields.splice(index, 1);
                // Update order
                this.cardType.fields.forEach((f, i) => f.order = i);
                this._refreshFields();
            }
        });
    },

    /**
     * Move field up or down
     */
    moveField(index, direction) {
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= this.cardType.fields.length) return;

        const fields = this.cardType.fields;
        [fields[index], fields[newIndex]] = [fields[newIndex], fields[index]];
        // Update order
        fields.forEach((f, i) => f.order = i);
        this._refreshFields();
    },

    // ==========================================
    // Save / Delete
    // ==========================================

    /**
     * Save all changes
     */
    async saveAll() {
        const nameInput = document.getElementById('pe-name');
        const folderSelect = document.getElementById('pe-folder');

        const name = nameInput ? nameInput.value.trim() : '';
        if (!name) {
            Toast.warning('Vui lòng nhập tên hồ sơ');
            return;
        }

        // Check for unsaved field edits
        if (this.editingFieldIndex !== null) {
            Toast.warning('Vui lòng hoàn tất chỉnh sửa trường trước khi lưu');
            return;
        }

        try {
            await FirestoreDB.updateCardType(this.cardType.id, {
                name,
                folderId: folderSelect ? (folderSelect.value || null) : null,
                fields: this.cardType.fields || []
            });

            this.cardType.name = name;
            this.cardType.folderId = folderSelect ? (folderSelect.value || null) : null;

            // Update header title
            const h2 = document.querySelector('.profile-editor-page h2');
            if (h2) h2.textContent = name;

            Toast.success('Đã lưu hồ sơ');
        } catch (error) {
            Toast.error('Lỗi lưu hồ sơ', error.message);
        }
    },

    /**
     * Show delete confirmation
     */
    showDeleteConfirm() {
        if (!this.cardType) return;

        Components.confirm(
            'Xóa hồ sơ cấu hình',
            `Bạn có chắc muốn xóa hồ sơ "${this.cardType.name}"? Thao tác này không thể hoàn tác.`,
            {
                confirmText: 'Xóa',
                confirmClass: 'btn-danger',
                onConfirm: async () => {
                    try {
                        const folderId = this.cardType.folderId;
                        await FirestoreDB.deleteCardType(this.cardType.id);
                        Toast.success('Đã xóa hồ sơ');
                        this._goBack(folderId);
                    } catch (error) {
                        Toast.error('Lỗi xóa hồ sơ', error.message);
                    }
                }
            }
        );
    },

    /**
     * Navigate back to parent folder or profiles list
     * @param {string} [folderId] - Optional override folderId
     */
    _goBack(folderId) {
        const targetFolderId = folderId !== undefined ? folderId : (this.cardType ? this.cardType.folderId : null);
        if (targetFolderId) {
            Router.navigate(`/profiles/folder/${targetFolderId}`);
        } else {
            Router.navigate('/profiles');
        }
    }
};
