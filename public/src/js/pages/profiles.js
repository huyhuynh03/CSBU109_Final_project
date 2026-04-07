// ============================================
// Profiles Page - Hồ sơ cấu hình thẻ học tập
// ============================================
// v4: Refactor - bỏ layout 2 cột, dùng mô hình giống lobby
// Hiển thị cây thư mục + card types chưa phân loại (folderId=null)

const ProfilesPage = {
    cardTypes: [],

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

        // Card types chưa phân loại (folderId = null)
        const unfiledTypes = this.cardTypes.filter(ct => !ct.folderId);

        return `
            <div class="profiles-page page-enter">
                <!-- Header -->
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--spacing-lg);">
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

                <!-- Folder Tree -->
                <div class="glass-card" style="padding:var(--spacing-lg);margin-bottom:var(--spacing-lg);">
                    ${ProfileFolderTree.render()}
                </div>

                <!-- Unfiled Card Types -->
                ${unfiledTypes.length > 0 ? `
                    <div class="glass-card" style="padding:var(--spacing-lg);">
                        <h3 style="margin:0 0 var(--spacing-md) 0;font-size:var(--font-size-md);display:flex;align-items:center;gap:var(--spacing-xs);">
                            <span class="material-icons-round" style="font-size:20px;color:var(--color-text-muted);">description</span>
                            Hồ sơ chưa phân loại
                            <span style="font-size:var(--font-size-xs);color:var(--color-text-muted);margin-left:var(--spacing-xs);">(${unfiledTypes.length})</span>
                        </h3>
                        <div class="card-types-list" style="display:flex;flex-direction:column;gap:var(--spacing-sm);">
                            ${unfiledTypes.map(ct => this._renderCardTypeItem(ct)).join('')}
                        </div>
                    </div>
                ` : this.cardTypes.length === 0 && ProfileFolderTree.folders.length === 0 ? `
                    <div class="empty-state glass-card" style="padding:var(--spacing-2xl) var(--spacing-lg);text-align:center;">
                        <span class="material-icons-round empty-state-icon" style="font-size:48px;">description</span>
                        <h3 class="empty-state-title">Chưa có hồ sơ cấu hình</h3>
                        <p class="empty-state-desc">Nhấn nút "Tạo mới" ở góc trên bên phải để tạo hồ sơ đầu tiên.</p>
                    </div>
                ` : ''}
            </div>
        `;
    },

    /**
     * Render a single card type item
     */
    _renderCardTypeItem(ct) {
        const fieldCount = ct.fields ? ct.fields.length : 0;
        return `
            <div class="glass-card hover-lift"
                 style="padding:var(--spacing-md);cursor:pointer;display:flex;align-items:center;gap:var(--spacing-md);"
                 onclick="Router.navigate('/profiles/${ct.id}')">
                <div style="width:44px;height:44px;border-radius:var(--radius-md);background:var(--color-primary-alpha, rgba(108,99,255,0.15));display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                    <span class="material-icons-round" style="color:var(--color-primary);font-size:24px;">description</span>
                </div>
                <div style="flex:1;min-width:0;">
                    <h4 style="margin:0;font-size:var(--font-size-md);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${Helpers.escapeHtml(ct.name)}</h4>
                    <span style="font-size:var(--font-size-xs);color:var(--color-text-muted);">${fieldCount} trường</span>
                </div>
                <button class="icon-btn" onclick="event.stopPropagation();ProfilesPage.showDeleteTypeConfirm('${ct.id}')" title="Xóa" style="width:32px;height:32px;">
                    <span class="material-icons-round" style="font-size:18px;color:var(--color-error);">delete</span>
                </button>
            </div>
        `;
    },

    // ==========================================
    // Create Card Type
    // ==========================================

    showCreateTypeModal(preselectedFolderId = null) {
        // Build folder options
        let folderOptions = '<option value="">-- Không phân loại --</option>';
        ProfileFolderTree.folders.forEach(f => {
            const selected = f.id === preselectedFolderId ? 'selected' : '';
            folderOptions += `<option value="${f.id}" ${selected}>${Helpers.escapeHtml(f.name)}</option>`;
        });

        Components.createModal({
            title: 'Tạo hồ sơ cấu hình',
            content: `
                <div class="form-group">
                    <label class="form-label">Tên hồ sơ</label>
                    <input type="text" id="ct-name" class="form-input" placeholder="VD: Từ vựng N5, Ngữ pháp..."
                           onkeydown="if(event.key==='Enter'){event.preventDefault();ProfilesPage._createCardType();}" autofocus>
                </div>
                <div class="form-group">
                    <label class="form-label">Thư mục</label>
                    <select id="ct-folder" class="form-input">${folderOptions}</select>
                </div>
            `,
            actions: [
                {
                    label: 'Tạo',
                    type: 'primary',
                    closeOnClick: false,
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
            // Reload page
            Router._handleRoute();
        } catch (error) {
            Toast.error('Lỗi xóa hồ sơ', error.message);
        }
    }
};
