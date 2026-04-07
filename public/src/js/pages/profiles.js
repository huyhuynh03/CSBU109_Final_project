// ============================================
// Profiles Page - Hồ sơ cấu hình thẻ học tập
// ============================================

const ProfilesPage = {
    cardTypes: [],
    _folderListener: null,

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

        // Load data
        await ProfileFolderTree.loadFolders();
        this.cardTypes = await FirestoreDB.getCardTypes();

        const selectedFolderId = ProfileFolderTree.selectedFolderId;
        const filteredTypes = this._getFilteredCardTypes(selectedFolderId);

        return `
            <div class="profiles-page page-enter">
                <!-- Header -->
                <div class="profiles-header" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--spacing-lg);">
                    <div style="display:flex;align-items:center;gap:var(--spacing-sm);">
                        <button class="icon-btn" onclick="Router.navigate('/')" title="Quay lại">
                            <span class="material-icons-round">arrow_back</span>
                        </button>
                        <h2 style="margin:0;font-size:var(--font-size-xl);">Hồ sơ cấu hình</h2>
                    </div>
                    <button class="btn btn-primary btn-sm" onclick="ProfilesPage.showCreateTypeModal()">
                        <span class="material-icons-round" style="font-size:18px;">add</span>
                        Tạo mới
                    </button>
                </div>

                <!-- 2-column layout -->
                <div class="profiles-layout" style="display:grid;grid-template-columns:260px 1fr;gap:var(--spacing-lg);align-items:start;">
                    <!-- Left: Folder Tree -->
                    <div class="profiles-sidebar glass-card" style="padding:var(--spacing-md);">
                        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--spacing-sm);">
                            <h4 style="margin:0;font-size:var(--font-size-sm);color:var(--color-text-muted);text-transform:uppercase;letter-spacing:0.5px;">Thư mục</h4>
                            <button class="icon-btn" onclick="ProfileFolderTree.showCreateModal()" title="Tạo thư mục" style="width:28px;height:28px;">
                                <span class="material-icons-round" style="font-size:18px;">create_new_folder</span>
                            </button>
                        </div>
                        <!-- "All" button -->
                        <div class="tree-item ${!selectedFolderId ? 'tree-item-selected' : ''}"
                             style="display:flex;align-items:center;gap:4px;padding:6px 8px;border-radius:var(--radius-sm);cursor:pointer;margin-bottom:var(--spacing-xs);"
                             onclick="ProfileFolderTree.selectedFolderId=null;ProfileFolderTree.refresh();window.dispatchEvent(new CustomEvent('profile-folder-selected',{detail:{folderId:null}}));">
                            <span class="material-icons-round" style="font-size:20px;color:var(--color-text-muted);">folder_open</span>
                            <span style="flex:1;font-size:var(--font-size-sm);">Tất cả</span>
                            <span style="font-size:var(--font-size-xs);color:var(--color-text-muted);">${this.cardTypes.length}</span>
                        </div>
                        ${ProfileFolderTree.render()}
                    </div>

                    <!-- Right: Card Types List -->
                    <div class="profiles-content">
                        ${this._renderCardTypesList(filteredTypes, selectedFolderId)}
                    </div>
                </div>
            </div>
        `;
    },

    onEnter() {
        // Listen for folder selection changes
        this._folderListener = (e) => {
            this._refreshContent(e.detail.folderId);
        };
        window.addEventListener('profile-folder-selected', this._folderListener);
    },

    onLeave() {
        if (this._folderListener) {
            window.removeEventListener('profile-folder-selected', this._folderListener);
            this._folderListener = null;
        }
    },

    /**
     * Get card types filtered by folder
     */
    _getFilteredCardTypes(folderId) {
        if (!folderId) return this.cardTypes;
        return this.cardTypes.filter(ct => ct.folderId === folderId);
    },

    /**
     * Render card types list
     */
    _renderCardTypesList(types, selectedFolderId) {
        if (types.length === 0) {
            const folderName = selectedFolderId
                ? ProfileFolderTree.folders.find(f => f.id === selectedFolderId)?.name || 'thư mục này'
                : '';
            return `
                <div class="empty-state" style="padding:var(--spacing-2xl) var(--spacing-lg);text-align:center;">
                    <span class="material-icons-round empty-state-icon" style="font-size:48px;">description</span>
                    <h3 class="empty-state-title">Chưa có hồ sơ cấu hình</h3>
                    <p class="empty-state-desc">${selectedFolderId ? `Thư mục "${folderName}" chưa có hồ sơ nào.` : 'Tạo hồ sơ cấu hình để định nghĩa các loại thẻ học tập.'}</p>
                    <button class="btn btn-primary" onclick="ProfilesPage.showCreateTypeModal()">
                        <span class="material-icons-round">add</span>
                        Tạo hồ sơ mới
                    </button>
                </div>
            `;
        }

        const cardsHtml = types.map(ct => {
            const fieldCount = ct.fields ? ct.fields.length : 0;
            const folderInfo = ct.folderId
                ? ProfileFolderTree.folders.find(f => f.id === ct.folderId)?.name || ''
                : '';
            return `
                <div class="glass-card hover-lift" 
                     style="padding:var(--spacing-md);cursor:pointer;display:flex;align-items:center;gap:var(--spacing-md);"
                     onclick="Router.navigate('/profiles/${ct.id}')">
                    <div style="width:44px;height:44px;border-radius:var(--radius-md);background:var(--color-primary-alpha, rgba(108,99,255,0.15));display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                        <span class="material-icons-round" style="color:var(--color-primary);font-size:24px;">description</span>
                    </div>
                    <div style="flex:1;min-width:0;">
                        <h4 style="margin:0;font-size:var(--font-size-md);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${Helpers.escapeHtml(ct.name)}</h4>
                        <div style="display:flex;align-items:center;gap:var(--spacing-sm);margin-top:2px;">
                            <span style="font-size:var(--font-size-xs);color:var(--color-text-muted);">${fieldCount} trường</span>
                            ${folderInfo ? `<span style="font-size:var(--font-size-xs);color:var(--color-text-muted);">• ${Helpers.escapeHtml(folderInfo)}</span>` : ''}
                        </div>
                    </div>
                    <button class="icon-btn" onclick="event.stopPropagation();ProfilesPage.showDeleteTypeConfirm('${ct.id}')" title="Xóa" style="width:32px;height:32px;">
                        <span class="material-icons-round" style="font-size:18px;color:var(--color-error);">delete</span>
                    </button>
                </div>
            `;
        }).join('');

        return `
            <div class="card-types-list" style="display:flex;flex-direction:column;gap:var(--spacing-sm);">
                ${cardsHtml}
            </div>
        `;
    },

    /**
     * Refresh only the content area when folder changes
     */
    async _refreshContent(folderId) {
        this.cardTypes = await FirestoreDB.getCardTypes();
        const filteredTypes = this._getFilteredCardTypes(folderId);
        const contentEl = document.querySelector('.profiles-content');
        if (contentEl) {
            contentEl.innerHTML = this._renderCardTypesList(filteredTypes, folderId);
        }
    },

    // ==========================================
    // Create Card Type
    // ==========================================

    showCreateTypeModal() {
        const selectedFolderId = ProfileFolderTree.selectedFolderId;

        // Build folder options
        let folderOptions = '<option value="">-- Không phân loại --</option>';
        ProfileFolderTree.folders.forEach(f => {
            const selected = f.id === selectedFolderId ? 'selected' : '';
            folderOptions += `<option value="${f.id}" ${selected}>${Helpers.escapeHtml(f.name)}</option>`;
        });

        Components.createModal({
            title: 'Tạo hồ sơ cấu hình',
            content: `
                <div class="form-group">
                    <label class="form-label">Tên hồ sơ</label>
                    <input type="text" id="ct-name" class="form-input" placeholder="VD: Từ vựng N5, Ngữ pháp..." autofocus>
                </div>
                <div class="form-group">
                    <label class="form-label">Thư mục</label>
                    <select id="ct-folder" class="form-input">${folderOptions}</select>
                </div>
            `,
            actions: [
                {
                    text: 'Tạo',
                    class: 'btn-primary',
                    onClick: () => this._createCardType()
                }
            ]
        });

        setTimeout(() => {
            const input = document.getElementById('ct-name');
            if (input) input.focus();
        }, 100);
    },

    async _createCardType() {
        const nameInput = document.getElementById('ct-name');
        const folderSelect = document.getElementById('ct-folder');
        const name = nameInput ? nameInput.value.trim() : '';
        const folderId = folderSelect ? folderSelect.value : null;

        if (!name) {
            Toast.warning('Vui lòng nhập tên hồ sơ');
            return;
        }

        try {
            const typeId = await FirestoreDB.createCardType({
                name,
                folderId: folderId || null,
                fields: [],
                order: this.cardTypes.length
            });

            if (typeId) {
                Toast.success('Đã tạo hồ sơ');
                // Close modal and navigate to editor
                const overlay = document.querySelector('.modal-overlay');
                if (overlay) overlay.remove();
                Router.navigate(`/profiles/${typeId}`);
            }
        } catch (error) {
            Toast.error('Lỗi tạo hồ sơ', error.message);
        }
    },

    // ==========================================
    // Delete Card Type
    // ==========================================

    showDeleteTypeConfirm(typeId) {
        const cardType = this.cardTypes.find(ct => ct.id === typeId);
        if (!cardType) return;

        Components.confirm(
            'Xóa hồ sơ cấu hình',
            `Bạn có chắc muốn xóa hồ sơ "${cardType.name}"? Thao tác này không thể hoàn tác.`,
            {
                confirmText: 'Xóa',
                confirmClass: 'btn-danger',
                onConfirm: () => this._deleteCardType(typeId)
            }
        );
    },

    async _deleteCardType(typeId) {
        try {
            await FirestoreDB.deleteCardType(typeId);
            Toast.success('Đã xóa hồ sơ');
            await this._refreshContent(ProfileFolderTree.selectedFolderId);
        } catch (error) {
            Toast.error('Lỗi xóa hồ sơ', error.message);
        }
    }
};
