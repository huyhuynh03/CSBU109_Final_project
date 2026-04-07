// ============================================
// Profile Folder View Page - Xem chi tiết thư mục hồ sơ
// ============================================
// Giống FolderViewPage nhưng dùng ProfileFolderTree + cardTypes
// v2: Dùng _renderFolderIcon() cho cover image support

const ProfileFolderViewPage = {
    currentFolderId: null,
    currentFolder: null,

    async render(params) {
        this.currentFolderId = params?.id || null;

        if (!this.currentFolderId) {
            return `
                <div class="page-enter" style="padding:var(--spacing-xl);text-align:center;">
                    <span class="material-icons-round" style="font-size:64px;color:var(--color-text-muted);">folder_off</span>
                    <h3 style="margin-top:var(--spacing-md);">Thư mục không tồn tại</h3>
                    <button class="btn btn-secondary" onclick="Router.navigate('/profiles')">
                        <span class="material-icons-round">arrow_back</span>
                        Quay lại
                    </button>
                </div>
            `;
        }

        // Load data
        await ProfileFolderTree.loadFolders();
        this.currentFolder = ProfileFolderTree.folders.find(f => f.id === this.currentFolderId);

        if (!this.currentFolder) {
            return `
                <div class="page-enter" style="padding:var(--spacing-xl);text-align:center;">
                    <span class="material-icons-round" style="font-size:64px;color:var(--color-text-muted);">folder_off</span>
                    <h3 style="margin-top:var(--spacing-md);">Thư mục không tồn tại</h3>
                    <p style="color:var(--color-text-muted);font-size:var(--font-size-sm);">Thư mục này có thể đã bị xóa.</p>
                    <button class="btn btn-secondary" onclick="Router.navigate('/profiles')" style="margin-top:var(--spacing-md);">
                        <span class="material-icons-round">arrow_back</span>
                        Quay lại
                    </button>
                </div>
            `;
        }

        // Get breadcrumb, subfolders, and card types in this folder
        const breadcrumb = ProfileFolderTree.getBreadcrumb(this.currentFolderId);
        const subfolders = ProfileFolderTree.getChildren(this.currentFolderId);
        const cardTypes = await FirestoreDB.getCardTypes(this.currentFolderId);

        return `
            <div class="profile-folder-view-page page-enter">
                <!-- Breadcrumb -->
                <nav class="breadcrumb">
                    <a href="#/profiles" class="breadcrumb-item" onclick="Router.navigate('/profiles');return false;">
                        <span class="material-icons-round" style="font-size:18px;">tune</span>
                        <span>Hồ sơ</span>
                    </a>
                    ${breadcrumb.map((item, idx) => `
                        <span class="material-icons-round breadcrumb-separator">chevron_right</span>
                        ${idx === breadcrumb.length - 1
                            ? `<span class="breadcrumb-item breadcrumb-current">${Helpers.escapeHtml(item.name)}</span>`
                            : `<a href="#/profiles/folder/${item.id}" class="breadcrumb-item" onclick="Router.navigate('/profiles/folder/${item.id}');return false;">${Helpers.escapeHtml(item.name)}</a>`
                        }
                    `).join('')}
                </nav>

                <!-- Folder Header -->
                <div class="folder-view-header">
                    <div class="folder-view-title">
                        ${ProfileFolderTree._renderFolderIcon(this.currentFolder, true, 'folder-header-icon', 32)}
                        <h2>${Helpers.escapeHtml(this.currentFolder.name)}</h2>
                    </div>
                    <div class="folder-view-actions">
                        <button class="btn btn-primary btn-sm" onclick="ProfileFolderTree.showCreateModal('${this.currentFolderId}')">
                            <span class="material-icons-round">create_new_folder</span>
                            Thư mục con
                        </button>
                        <button class="btn btn-sm btn-secondary" onclick="ProfilesPage.showCreateTypeModal('${this.currentFolderId}')">
                            <span class="material-icons-round">add</span>
                            Tạo hồ sơ
                        </button>
                        <button class="icon-btn" onclick="ProfileFolderTree.startRename('${this.currentFolderId}')" title="Đổi tên">
                            <span class="material-icons-round">edit</span>
                        </button>
                        <button class="icon-btn" onclick="ProfileFolderViewPage._confirmDeleteFolder()" title="Xóa">
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
                                <div class="subfolder-card glass-card hover-lift" onclick="Router.navigate('/profiles/folder/${sub.id}')">
                                    ${ProfileFolderTree._renderFolderIcon(sub, false, 'subfolder-icon', 28)}
                                    <span class="subfolder-name">${Helpers.escapeHtml(sub.name)}</span>
                                    <span class="material-icons-round subfolder-arrow">chevron_right</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                <!-- Card Types in this folder -->
                <div class="folder-view-section">
                    <h4 class="folder-view-section-title">
                        <span class="material-icons-round" style="font-size:20px;">description</span>
                        Hồ sơ cấu hình ${cardTypes.length > 0 ? `(${cardTypes.length})` : ''}
                    </h4>
                    ${cardTypes.length > 0 ? `
                        <div class="card-types-list" style="display:flex;flex-direction:column;gap:var(--spacing-sm);">
                            ${cardTypes.map(ct => this._renderCardTypeItem(ct)).join('')}
                        </div>
                    ` : `
                        <div style="text-align:center;padding:var(--spacing-xl) 0;">
                            <span class="material-icons-round" style="font-size:48px;color:var(--color-text-muted);">note_add</span>
                            <p style="color:var(--color-text-muted);font-size:var(--font-size-sm);margin-top:var(--spacing-sm);">
                                Chưa có hồ sơ nào trong thư mục này.
                            </p>
                            <button class="btn btn-primary btn-sm" onclick="ProfilesPage.showCreateTypeModal('${this.currentFolderId}')" style="margin-top:var(--spacing-md);">
                                <span class="material-icons-round">add</span>
                                Tạo hồ sơ
                            </button>
                        </div>
                    `}
                </div>
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
                <button class="icon-btn" onclick="event.stopPropagation();ProfileFolderViewPage._confirmDeleteType('${ct.id}','${Helpers.escapeHtml(ct.name)}')" title="Xóa" style="width:32px;height:32px;">
                    <span class="material-icons-round" style="font-size:18px;color:var(--color-error);">delete</span>
                </button>
            </div>
        `;
    },

    /**
     * Confirm delete current folder
     */
    _confirmDeleteFolder() {
        if (!this.currentFolder) return;

        const folder = this.currentFolder;
        const childCount = ProfileFolderTree.getChildren(folder.id).length;
        const message = childCount > 0
            ? `Bạn có chắc muốn xóa thư mục "${folder.name}" và tất cả thư mục con? Các hồ sơ trong đó sẽ trở thành chưa phân loại.`
            : `Bạn có chắc muốn xóa thư mục "${folder.name}"? Các hồ sơ trong đó sẽ trở thành chưa phân loại.`;

        Components.confirm('Xóa thư mục', message, {
            confirmText: 'Xóa',
            confirmClass: 'btn-danger',
            onConfirm: async () => {
                await ProfileFolderTree.deleteFolder(folder.id);
                // deleteFolder already navigates to /profiles if viewing deleted folder
            }
        });
    },

    /**
     * Confirm delete a card type
     */
    _confirmDeleteType(typeId, typeName) {
        Components.confirm(
            'Xóa hồ sơ cấu hình',
            `Bạn có chắc muốn xóa hồ sơ "${typeName}"? Thao tác này không thể hoàn tác.`,
            {
                confirmText: 'Xóa',
                confirmClass: 'btn-danger',
                onConfirm: async () => {
                    try {
                        await FirestoreDB.deleteCardType(typeId);
                        Toast.success('Đã xóa hồ sơ');
                        // Reload current page
                        Router._handleRoute();
                    } catch (error) {
                        Toast.error('Lỗi xóa hồ sơ', error.message);
                    }
                }
            }
        );
    }
};
