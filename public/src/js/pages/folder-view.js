// ============================================
// Folder View Page - Xem nội dung thư mục
// ============================================

const FolderViewPage = {
    currentFolderId: null,
    currentFolder: null,

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

        // Load folder data
        await FolderTree.loadFolders();
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

        // Get breadcrumb, subfolders, and cards
        const breadcrumb = FolderTree.getBreadcrumb(this.currentFolderId);
        const subfolders = FolderTree.getChildren(this.currentFolderId);

        return `
            <div class="folder-view-page page-enter">
                <!-- Breadcrumb -->
                <nav class="breadcrumb">
                    <a href="#/" class="breadcrumb-item" onclick="Router.navigate('/');return false;">
                        <span class="material-icons-round" style="font-size:18px;">home</span>
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
                            : `<span class="material-icons-round" style="font-size:32px;color:var(--color-primary);">folder_open</span>`
                        }
                        <h2>${Helpers.escapeHtml(this.currentFolder.name)}</h2>
                    </div>
                    <div class="folder-view-actions">
                        <button class="btn btn-primary btn-sm" onclick="FolderTree.showCreateModal('${this.currentFolderId}')">
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

                <!-- Cards placeholder -->
                <div class="folder-view-section">
                    <h4 class="folder-view-section-title">
                        <span class="material-icons-round" style="font-size:20px;">style</span>
                        Thẻ học tập
                    </h4>
                    <div class="empty-state" style="padding:var(--spacing-xl) 0;">
                        <span class="material-icons-round" style="font-size:48px;color:var(--color-text-muted);">note_add</span>
                        <p style="color:var(--color-text-muted);font-size:var(--font-size-sm);margin-top:var(--spacing-sm);">
                            Chưa có thẻ nào trong thư mục này.
                        </p>
                        <p style="color:var(--color-text-muted);font-size:var(--font-size-xs);">
                            Tính năng tạo thẻ sẽ được triển khai trong bước tiếp theo.
                        </p>
                    </div>
                </div>
            </div>
        `;
    },

    onEnter(params) {
        console.log('[FolderViewPage] Entered, folder:', params?.id);
    }
};
