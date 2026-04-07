// ============================================
// Folder Tree Component - Cây thư mục
// ============================================

const FolderTree = {
    folders: [],
    expandedFolders: new Set(),
    editingFolderId: null,
    contextMenuFolderId: null,

    /**
     * Load folders from Firestore
     */
    async loadFolders() {
        if (!Auth.isSignedIn()) {
            this.folders = [];
            return;
        }
        try {
            this.folders = await FirestoreDB.getFolders();
        } catch (error) {
            console.error('[FolderTree] Error loading folders:', error);
            this.folders = [];
        }
    },

    /**
     * Build tree structure from flat folder list
     * @returns {Array} Tree of folders with children
     */
    buildTree() {
        const map = {};
        const roots = [];

        // Index by id
        this.folders.forEach(f => {
            map[f.id] = { ...f, children: [] };
        });

        // Build parent-child relationships
        this.folders.forEach(f => {
            if (f.parentId && map[f.parentId]) {
                map[f.parentId].children.push(map[f.id]);
            } else {
                roots.push(map[f.id]);
            }
        });

        // Sort by order
        const sortByOrder = (arr) => {
            arr.sort((a, b) => (a.order || 0) - (b.order || 0));
            arr.forEach(item => sortByOrder(item.children));
        };
        sortByOrder(roots);

        return roots;
    },

    /**
     * Render a single folder node
     * @param {Object} folder 
     * @param {number} depth 
     * @returns {string} HTML
     */
    renderNode(folder, depth = 0) {
        const hasChildren = folder.children && folder.children.length > 0;
        const isExpanded = this.expandedFolders.has(folder.id);
        const isEditing = this.editingFolderId === folder.id;
        const indent = depth * 20;

        const childrenHtml = hasChildren && isExpanded
            ? folder.children.map(child => this.renderNode(child, depth + 1)).join('')
            : '';

        const expandIcon = hasChildren
            ? `<span class="material-icons-round folder-expand-icon ${isExpanded ? 'expanded' : ''}" 
                     onclick="event.stopPropagation();FolderTree.toggleExpand('${folder.id}')">
                     chevron_right
               </span>`
            : `<span class="folder-expand-placeholder"></span>`;

        const folderName = isEditing
            ? `<input type="text" class="folder-rename-input form-input" 
                      value="${Helpers.escapeHtml(folder.name)}" 
                      onblur="FolderTree.finishRename('${folder.id}', this.value)"
                      onkeydown="if(event.key==='Enter'){this.blur()}else if(event.key==='Escape'){FolderTree.cancelRename()}"
                      onclick="event.stopPropagation()"
                      autofocus>`
            : `<span class="folder-name">${Helpers.escapeHtml(folder.name)}</span>`;

        const folderIcon = this._renderFolderIcon(folder, isExpanded, 'folder-icon');

        return `
            <div class="folder-node" data-folder-id="${folder.id}">
                <div class="folder-row hover-lift" style="padding-left:${indent + 8}px;"
                     onclick="FolderTree.onFolderClick('${folder.id}')"
                     oncontextmenu="event.preventDefault();FolderTree.showContextMenu(event,'${folder.id}')">
                    ${expandIcon}
                    ${folderIcon}
                    ${folderName}
                    <button class="folder-menu-btn icon-btn" 
                            onclick="event.stopPropagation();FolderTree.showContextMenu(event,'${folder.id}')"
                            aria-label="Menu thư mục">
                        <span class="material-icons-round" style="font-size:18px;">more_vert</span>
                    </button>
                </div>
                ${childrenHtml}
            </div>
        `;
    },

    /**
     * Render the full folder tree
     * @returns {string} HTML
     */
    render() {
        const tree = this.buildTree();

        if (tree.length === 0) {
            return `
                <div class="folder-tree">
                    <div class="folder-tree-header">
                        <h3><span class="material-icons-round" style="vertical-align:middle;margin-right:var(--spacing-xs);">folder</span>Thư mục của tôi</h3>
                        <button class="icon-btn" onclick="FolderTree.showCreateModal()" aria-label="Tạo thư mục mới" title="Tạo thư mục mới">
                            <span class="material-icons-round">create_new_folder</span>
                        </button>
                    </div>
                    <div class="folder-tree-empty">
                        <span class="material-icons-round" style="font-size:48px;color:var(--color-text-muted);margin-bottom:var(--spacing-sm);">folder_off</span>
                        <p style="color:var(--color-text-muted);font-size:var(--font-size-sm);">Chưa có thư mục nào</p>
                        <button class="btn btn-primary btn-sm" onclick="FolderTree.showCreateModal()" style="margin-top:var(--spacing-md);">
                            <span class="material-icons-round">create_new_folder</span>
                            Tạo thư mục đầu tiên
                        </button>
                    </div>
                </div>
            `;
        }

        const treeHtml = tree.map(folder => this.renderNode(folder, 0)).join('');

        return `
            <div class="folder-tree">
                <div class="folder-tree-header">
                    <h3><span class="material-icons-round" style="vertical-align:middle;margin-right:var(--spacing-xs);">folder</span>Thư mục của tôi</h3>
                    <button class="icon-btn" onclick="FolderTree.showCreateModal()" aria-label="Tạo thư mục mới" title="Tạo thư mục mới">
                        <span class="material-icons-round">create_new_folder</span>
                    </button>
                </div>
                <div class="folder-tree-content">
                    ${treeHtml}
                </div>
            </div>
        `;
    },

    // ==========================================
    // Actions
    // ==========================================

    /**
     * Toggle expand/collapse a folder
     * @param {string} folderId
     */
    toggleExpand(folderId) {
        if (this.expandedFolders.has(folderId)) {
            this.expandedFolders.delete(folderId);
        } else {
            this.expandedFolders.add(folderId);
        }
        this.refresh();
    },

    /**
     * Handle folder click - navigate to folder view
     * @param {string} folderId
     */
    onFolderClick(folderId) {
        // Auto expand if has children
        const folder = this.folders.find(f => f.id === folderId);
        if (folder) {
            const hasChildren = this.folders.some(f => f.parentId === folderId);
            if (hasChildren && !this.expandedFolders.has(folderId)) {
                this.expandedFolders.add(folderId);
                this.refresh();
            }
        }
        Router.navigate(`/folder/${folderId}`);
    },

    /**
     * Refresh the folder tree in the DOM
     */
    refresh() {
        const container = document.querySelector('.folder-tree');
        if (container) {
            container.outerHTML = this.render();
        }
    },

    // ==========================================
    // Create Folder
    // ==========================================

    /**
     * Show create folder modal
     * @param {string|null} parentId - Parent folder ID (null = root)
     */
    showCreateModal(parentId = null) {
        if (!Auth.isSignedIn()) {
            Toast.warning('Cần đăng nhập', 'Vui lòng đăng nhập để tạo thư mục.');
            return;
        }

        const parentName = parentId
            ? (this.folders.find(f => f.id === parentId)?.name || 'Thư mục cha')
            : 'Gốc (root)';

        const modalHtml = `
            <div id="folder-modal" class="modal-overlay" onclick="if(event.target===this)FolderTree.closeModal()">
                <div class="modal-content glass-card animate-scale-in" style="max-width:400px;padding:var(--spacing-xl);">
                    <h3 style="margin-bottom:var(--spacing-lg);">
                        <span class="material-icons-round" style="vertical-align:middle;margin-right:var(--spacing-xs);">create_new_folder</span>
                        Tạo thư mục mới
                    </h3>
                    <div class="form-group">
                        <label class="form-label">Tên thư mục</label>
                        <input type="text" id="new-folder-name" class="form-input" 
                               placeholder="Nhập tên thư mục..." autofocus
                               onkeydown="if(event.key==='Enter')FolderTree.createFolder('${parentId || ''}')">
                    </div>
                    <div class="form-group" style="margin-bottom:0;">
                        <label class="form-label">Thư mục cha</label>
                        <p style="color:var(--color-text-muted);font-size:var(--font-size-sm);">
                            <span class="material-icons-round" style="font-size:16px;vertical-align:middle;">subdirectory_arrow_right</span>
                            ${Helpers.escapeHtml(parentName)}
                        </p>
                    </div>
                    <div style="display:flex;gap:var(--spacing-sm);margin-top:var(--spacing-lg);">
                        <button class="btn btn-secondary btn-full" onclick="FolderTree.closeModal()">Hủy</button>
                        <button class="btn btn-primary btn-full" onclick="FolderTree.createFolder('${parentId || ''}')">Tạo</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        setTimeout(() => document.getElementById('new-folder-name')?.focus(), 100);
    },

    /**
     * Create a new folder
     * @param {string} parentId
     */
    async createFolder(parentId) {
        const nameInput = document.getElementById('new-folder-name');
        const name = nameInput?.value.trim();

        if (!name) {
            Toast.warning('Thiếu tên', 'Vui lòng nhập tên thư mục.');
            nameInput?.focus();
            return;
        }

        try {
            // Calculate order (last among siblings)
            const siblings = this.folders.filter(f =>
                (parentId ? f.parentId === parentId : !f.parentId)
            );
            const maxOrder = siblings.reduce((max, f) => Math.max(max, f.order || 0), 0);

            const folderId = await FirestoreDB.createFolder({
                name,
                parentId: parentId || null,
                order: maxOrder + 1
            });

            if (folderId) {
                Toast.success('Đã tạo', `Thư mục "${name}" đã được tạo.`);
                this.closeModal();
                await this.loadFolders();
                // Expand parent if exists
                if (parentId) {
                    this.expandedFolders.add(parentId);
                }
                // Re-render current page to show new folder
                Router._handleRoute();
            }
        } catch (error) {
            console.error('[FolderTree] Error creating folder:', error);
            Toast.error('Lỗi', 'Không thể tạo thư mục.');
        }
    },

    // ==========================================
    // Rename Folder
    // ==========================================

    /**
     * Start renaming a folder (inline edit)
     * @param {string} folderId
     */
    startRename(folderId) {
        this.editingFolderId = folderId;
        this.closeContextMenu();
        this.refresh();
        // Focus input after render
        setTimeout(() => {
            const input = document.querySelector('.folder-rename-input');
            if (input) {
                input.focus();
                input.select();
            }
        }, 50);
    },

    /**
     * Finish renaming
     * @param {string} folderId
     * @param {string} newName
     */
    async finishRename(folderId, newName) {
        this.editingFolderId = null;
        newName = newName.trim();

        if (!newName) {
            this.refresh();
            return;
        }

        const folder = this.folders.find(f => f.id === folderId);
        if (!folder || folder.name === newName) {
            this.refresh();
            return;
        }

        try {
            await FirestoreDB.updateFolder(folderId, { name: newName });
            Toast.success('Đã đổi tên', `Thư mục đã được đổi thành "${newName}".`);
            await this.loadFolders();
            Router._handleRoute();
        } catch (error) {
            console.error('[FolderTree] Error renaming folder:', error);
            Toast.error('Lỗi', 'Không thể đổi tên thư mục.');
            this.refresh();
        }
    },

    /**
     * Cancel renaming
     */
    cancelRename() {
        this.editingFolderId = null;
        this.refresh();
    },

    // ==========================================
    // Delete Folder
    // ==========================================

    /**
     * Show delete confirmation
     * @param {string} folderId
     */
    showDeleteConfirm(folderId) {
        this.closeContextMenu();
        const folder = this.folders.find(f => f.id === folderId);
        if (!folder) return;

        // Count descendants
        const countDescendants = (parentId) => {
            const children = this.folders.filter(f => f.parentId === parentId);
            return children.reduce((count, child) => count + 1 + countDescendants(child.id), 0);
        };
        const descendantCount = countDescendants(folderId);

        const warningText = descendantCount > 0
            ? `<p style="color:var(--color-warning);font-size:var(--font-size-sm);margin-top:var(--spacing-sm);">
                ⚠️ Thư mục này chứa ${descendantCount} thư mục con. Tất cả sẽ bị xóa.
               </p>`
            : '';

        const modalHtml = `
            <div id="folder-modal" class="modal-overlay" onclick="if(event.target===this)FolderTree.closeModal()">
                <div class="modal-content glass-card animate-scale-in" style="max-width:400px;padding:var(--spacing-xl);">
                    <h3 style="margin-bottom:var(--spacing-md);color:var(--color-error);">
                        <span class="material-icons-round" style="vertical-align:middle;margin-right:var(--spacing-xs);">delete_forever</span>
                        Xóa thư mục
                    </h3>
                    <p>Bạn có chắc muốn xóa thư mục "<strong>${Helpers.escapeHtml(folder.name)}</strong>"?</p>
                    ${warningText}
                    <p style="color:var(--color-text-muted);font-size:var(--font-size-sm);margin-top:var(--spacing-sm);">
                        Hành động này không thể hoàn tác.
                    </p>
                    <div style="display:flex;gap:var(--spacing-sm);margin-top:var(--spacing-lg);">
                        <button class="btn btn-secondary btn-full" onclick="FolderTree.closeModal()">Hủy</button>
                        <button class="btn btn-danger btn-full" onclick="FolderTree.deleteFolder('${folderId}')">Xóa</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
    },

    /**
     * Delete a folder and its descendants
     * @param {string} folderId
     */
    async deleteFolder(folderId) {
        try {
            // Collect all descendant folder IDs
            const toDelete = [folderId];
            const collectDescendants = (parentId) => {
                this.folders.filter(f => f.parentId === parentId).forEach(child => {
                    toDelete.push(child.id);
                    collectDescendants(child.id);
                });
            };
            collectDescendants(folderId);

            // Delete all from Firestore
            for (const id of toDelete) {
                await FirestoreDB.deleteFolder(id);
            }

            Toast.success('Đã xóa', `Đã xóa ${toDelete.length} thư mục.`);
            this.closeModal();
            this.expandedFolders.delete(folderId);
            await this.loadFolders();
            
            // If viewing the deleted folder, go home
            const currentPath = Router.getPath();
            if (currentPath.includes(`/folder/${folderId}`)) {
                Router.navigate('/');
            } else {
                Router._handleRoute();
            }
        } catch (error) {
            console.error('[FolderTree] Error deleting folder:', error);
            Toast.error('Lỗi', 'Không thể xóa thư mục.');
        }
    },

    // ==========================================
    // Context Menu
    // ==========================================

    /**
     * Show context menu for a folder
     * @param {Event} event
     * @param {string} folderId
     */
    showContextMenu(event, folderId) {
        event.stopPropagation();
        this.closeContextMenu();
        this.contextMenuFolderId = folderId;

        const folder = this.folders.find(f => f.id === folderId);
        if (!folder) return;

        const hasCover = folder.coverImage ? true : false;
        const menuHtml = `
            <div id="folder-context-menu" class="folder-context-menu glass-panel animate-scale-in"
                 style="position:fixed;top:${event.clientY}px;left:${event.clientX}px;z-index:var(--z-dropdown);">
                <button class="menu-item" onclick="FolderTree.showCreateModal('${folderId}')">
                    <span class="material-icons-round">create_new_folder</span>
                    <span>Tạo thư mục con</span>
                </button>
                <button class="menu-item" onclick="FolderTree.startRename('${folderId}')">
                    <span class="material-icons-round">edit</span>
                    <span>Đổi tên</span>
                </button>
                <button class="menu-item" onclick="FolderTree.showCoverImageModal('${folderId}')">
                    <span class="material-icons-round">image</span>
                    <span>Đổi ảnh bìa</span>
                </button>
                ${hasCover ? `
                <button class="menu-item" onclick="FolderTree.removeCoverImage('${folderId}')">
                    <span class="material-icons-round">hide_image</span>
                    <span>Xóa ảnh bìa</span>
                </button>
                ` : ''}
                <div class="menu-divider"></div>
                <button class="menu-item menu-item-danger" onclick="FolderTree.showDeleteConfirm('${folderId}')">
                    <span class="material-icons-round">delete</span>
                    <span>Xóa thư mục</span>
                </button>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', menuHtml);

        // Adjust position if overflows viewport
        setTimeout(() => {
            const menu = document.getElementById('folder-context-menu');
            if (menu) {
                const rect = menu.getBoundingClientRect();
                if (rect.right > window.innerWidth) {
                    menu.style.left = (window.innerWidth - rect.width - 8) + 'px';
                }
                if (rect.bottom > window.innerHeight) {
                    menu.style.top = (window.innerHeight - rect.height - 8) + 'px';
                }
            }
        }, 0);

        // Close on click outside
        const closeHandler = (e) => {
            if (!e.target.closest('#folder-context-menu')) {
                this.closeContextMenu();
                document.removeEventListener('click', closeHandler);
            }
        };
        setTimeout(() => document.addEventListener('click', closeHandler), 0);
    },

    /**
     * Close context menu
     */
    closeContextMenu() {
        const menu = document.getElementById('folder-context-menu');
        if (menu) menu.remove();
        this.contextMenuFolderId = null;
    },

    /**
     * Close modal
     */
    closeModal() {
        const modal = document.getElementById('folder-modal');
        if (modal) modal.remove();
    },

    // ==========================================
    // Utility
    // ==========================================

    /**
     * Get breadcrumb path for a folder
     * @param {string} folderId
     * @returns {Array} Array of {id, name} from root to folder
     */
    getBreadcrumb(folderId) {
        const path = [];
        let current = this.folders.find(f => f.id === folderId);
        while (current) {
            path.unshift({ id: current.id, name: current.name });
            current = current.parentId
                ? this.folders.find(f => f.id === current.parentId)
                : null;
        }
        return path;
    },

    /**
     * Get direct children of a folder
     * @param {string|null} parentId
     * @returns {Array}
     */
    getChildren(parentId) {
        return this.folders
            .filter(f => (parentId ? f.parentId === parentId : !f.parentId))
            .sort((a, b) => (a.order || 0) - (b.order || 0));
    },

    // ==========================================
    // Cover Image (Ảnh bìa thư mục)
    // ==========================================

    /**
     * Render folder icon - show cover image if available, else Material Icon
     * @param {Object} folder
     * @param {boolean} isExpanded
     * @param {string} cssClass - CSS class for the icon element
     * @param {number} [size=24] - Size in px for cover image
     * @returns {string} HTML
     */
    _renderFolderIcon(folder, isExpanded, cssClass, size = 24) {
        if (folder.coverImage) {
            return `<img src="${Helpers.escapeHtml(folder.coverImage)}"
                         alt="" class="${cssClass} folder-cover-img"
                         style="width:${size}px;height:${size}px;max-width:none;object-fit:cover;border-radius:4px;flex-shrink:0;">`;
        }
        return `<span class="material-icons-round ${cssClass}">${isExpanded ? 'folder_open' : 'folder'}</span>`;
    },

    /**
     * Show modal to set cover image (upload or URL)
     * @param {string} folderId
     */
    showCoverImageModal(folderId) {
        this.closeContextMenu();
        const folder = this.folders.find(f => f.id === folderId);
        if (!folder) return;

        const currentPreview = folder.coverImage
            ? `<img src="${Helpers.escapeHtml(folder.coverImage)}" alt="Ảnh bìa hiện tại"
                    style="width:80px;height:80px;object-fit:cover;border-radius:8px;border:2px solid var(--color-border);">`
            : `<span class="material-icons-round" style="font-size:48px;color:var(--color-text-muted);">image</span>`;

        const modalHtml = `
            <div id="cover-image-modal" class="modal-overlay" onclick="if(event.target===this)FolderTree.closeModal()">
                <div class="modal-content glass-card animate-scale-in" style="max-width:440px;padding:var(--spacing-xl);">
                    <h3 style="margin-bottom:var(--spacing-lg);">
                        <span class="material-icons-round" style="vertical-align:middle;margin-right:var(--spacing-xs);">image</span>
                        Ảnh bìa: ${Helpers.escapeHtml(folder.name)}
                    </h3>
                    
                    <!-- Preview -->
                    <div style="text-align:center;margin-bottom:var(--spacing-lg);">
                        <div id="cover-preview">${currentPreview}</div>
                    </div>

                    <!-- Tab: Upload -->
                    <div class="form-group">
                        <label class="form-label">
                            <span class="material-icons-round" style="font-size:16px;vertical-align:middle;">upload_file</span>
                            Tải lên từ máy tính
                        </label>
                        <input type="file" id="cover-file-input" accept="image/*"
                               onchange="FolderTree._handleCoverFileUpload('${folderId}', this)"
                               style="width:100%;font-size:var(--font-size-sm);">
                        <p style="font-size:var(--font-size-xs);color:var(--color-text-muted);margin-top:4px;">
                            Ảnh sẽ được resize về tối đa 200×200px và lưu dạng base64.
                        </p>
                    </div>

                    <!-- Tab: URL -->
                    <div class="form-group" style="margin-top:var(--spacing-md);">
                        <label class="form-label">
                            <span class="material-icons-round" style="font-size:16px;vertical-align:middle;">link</span>
                            Hoặc nhập URL ảnh
                        </label>
                        <div style="display:flex;gap:var(--spacing-xs);">
                            <input type="url" id="cover-url-input" class="form-input"
                                   placeholder="https://example.com/image.png"
                                   style="flex:1;">
                            <button class="btn btn-primary btn-sm" onclick="FolderTree._setCoverFromUrl('${folderId}')">
                                <span class="material-icons-round">check</span>
                            </button>
                        </div>
                    </div>

                    <div style="display:flex;gap:var(--spacing-sm);margin-top:var(--spacing-lg);">
                        <button class="btn btn-secondary btn-full" onclick="FolderTree.closeModal()">Đóng</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
    },

    /**
     * Handle file upload for cover image - resize to max 200x200 and convert to base64
     * @param {string} folderId
     * @param {HTMLInputElement} input
     */
    async _handleCoverFileUpload(folderId, input) {
        const file = input.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            Toast.warning('Sai định dạng', 'Vui lòng chọn file ảnh (PNG, JPG, GIF...).');
            return;
        }

        // Max 5MB raw file
        if (file.size > 5 * 1024 * 1024) {
            Toast.warning('File quá lớn', 'Vui lòng chọn file ảnh dưới 5MB.');
            return;
        }

        try {
            const dataUrl = await this._resizeImageToBase64(file, 200, 200);
            await this._saveCoverImage(folderId, dataUrl);
        } catch (error) {
            console.error('[FolderTree] Cover upload error:', error);
            Toast.error('Lỗi', 'Không thể tải ảnh lên.');
        }
    },

    /**
     * Set cover from external URL
     * @param {string} folderId
     */
    async _setCoverFromUrl(folderId) {
        const urlInput = document.getElementById('cover-url-input');
        const url = urlInput?.value.trim();

        if (!url) {
            Toast.warning('Thiếu URL', 'Vui lòng nhập URL ảnh.');
            urlInput?.focus();
            return;
        }

        // Basic URL validation
        try {
            new URL(url);
        } catch {
            Toast.warning('URL không hợp lệ', 'Vui lòng nhập URL đúng định dạng.');
            urlInput?.focus();
            return;
        }

        try {
            await this._saveCoverImage(folderId, url);
        } catch (error) {
            console.error('[FolderTree] Cover URL error:', error);
            Toast.error('Lỗi', 'Không thể lưu ảnh bìa.');
        }
    },

    /**
     * Save cover image to Firestore and refresh UI
     * @param {string} folderId
     * @param {string} imageUrl - base64 data URL or external URL
     */
    async _saveCoverImage(folderId, imageUrl) {
        await FirestoreDB.updateFolder(folderId, { coverImage: imageUrl });
        Toast.success('Đã cập nhật', 'Ảnh bìa thư mục đã được thay đổi.');

        // Update preview in modal
        const preview = document.getElementById('cover-preview');
        if (preview) {
            preview.innerHTML = `<img src="${Helpers.escapeHtml(imageUrl)}" alt="Ảnh bìa"
                style="width:80px;height:80px;object-fit:cover;border-radius:8px;border:2px solid var(--color-border);">`;
        }

        // Reload and refresh
        await this.loadFolders();
        this.refresh();

        // Also refresh explorer if visible
        if (typeof FolderExplorerPage !== 'undefined') {
            const explorerGrid = document.querySelector('.explorer-grid');
            if (explorerGrid) {
                FolderExplorerPage.folders = this.folders;
                Router._handleRoute();
            }
        }
    },

    /**
     * Remove cover image from folder
     * @param {string} folderId
     */
    async removeCoverImage(folderId) {
        this.closeContextMenu();
        try {
            await FirestoreDB.updateFolder(folderId, { coverImage: null });
            Toast.success('Đã xóa', 'Ảnh bìa đã được gỡ bỏ.');
            await this.loadFolders();
            this.refresh();

            if (typeof FolderExplorerPage !== 'undefined') {
                const explorerGrid = document.querySelector('.explorer-grid');
                if (explorerGrid) {
                    FolderExplorerPage.folders = this.folders;
                    Router._handleRoute();
                }
            }
        } catch (error) {
            console.error('[FolderTree] Remove cover error:', error);
            Toast.error('Lỗi', 'Không thể xóa ảnh bìa.');
        }
    },

    /**
     * Resize an image file to max dimensions and return base64 data URL
     * @param {File} file
     * @param {number} maxWidth
     * @param {number} maxHeight
     * @returns {Promise<string>} base64 data URL
     */
    _resizeImageToBase64(file, maxWidth, maxHeight) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let { width, height } = img;

                    // Scale down proportionally
                    if (width > maxWidth || height > maxHeight) {
                        const ratio = Math.min(maxWidth / width, maxHeight / height);
                        width = Math.round(width * ratio);
                        height = Math.round(height * ratio);
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // Convert to base64 (JPEG for smaller size, 0.85 quality)
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
                    resolve(dataUrl);
                };
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
};
