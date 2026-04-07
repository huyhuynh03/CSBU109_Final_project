// ============================================
// Profile Folder Tree - Cây thư mục hồ sơ cấu hình
// ============================================
// Tách biệt khỏi FolderTree (lobby), dùng collection profileFolders
// v4: Context menu giống lobby + tính năng Ảnh bìa

const ProfileFolderTree = {
    folders: [],
    tree: [],
    expandedFolders: new Set(),
    editingFolderId: null,
    contextMenuFolderId: null,

    /**
     * Load profile folders from Firestore
     */
    async loadFolders() {
        try {
            this.folders = await FirestoreDB.getProfileFolders();
        } catch (error) {
            console.error('[ProfileFolderTree] Error loading folders:', error);
            this.folders = [];
        }
        this.buildTree();
    },

    /**
     * Build tree structure from flat folder list
     */
    buildTree() {
        const map = {};
        this.folders.forEach(f => {
            map[f.id] = { ...f, children: [] };
        });

        const tree = [];
        this.folders.forEach(f => {
            if (f.parentId && map[f.parentId]) {
                map[f.parentId].children.push(map[f.id]);
            } else {
                tree.push(map[f.id]);
            }
        });

        const sortByOrder = (arr) => {
            arr.sort((a, b) => (a.order || 0) - (b.order || 0));
            arr.forEach(node => sortByOrder(node.children));
        };
        sortByOrder(tree);

        this.tree = tree;
    },

    // ==========================================
    // Folder Icon (Cover Image support)
    // ==========================================

    /**
     * Render folder icon - show cover image if available, else Material Icon
     * @param {Object} folder
     * @param {boolean} isExpanded
     * @param {string} cssClass - CSS class for the icon element
     * @param {number} [size=20] - Size in px for cover image
     * @returns {string} HTML
     */
    _renderFolderIcon(folder, isExpanded, cssClass, size = 20) {
        if (folder.coverImage) {
            return `<img src="${Helpers.escapeHtml(folder.coverImage)}"
                         alt="" class="${cssClass} folder-cover-img"
                         style="width:${size}px;height:${size}px;max-width:none;object-fit:cover;border-radius:4px;flex-shrink:0;">`;
        }
        return `<span class="material-icons-round ${cssClass}" style="font-size:${size}px;color:var(--color-primary);">${isExpanded ? 'folder_open' : 'folder'}</span>`;
    },

    /**
     * Render a single tree node
     */
    renderNode(folder, depth = 0) {
        const hasChildren = folder.children && folder.children.length > 0;
        const isExpanded = this.expandedFolders.has(folder.id);
        const isEditing = this.editingFolderId === folder.id;

        const indent = depth * 20;
        const expandIcon = hasChildren
            ? `<span class="material-icons-round tree-expand" style="font-size:18px;transition:transform 0.2s;${isExpanded ? 'transform:rotate(90deg);' : ''}"
                    onclick="event.stopPropagation();ProfileFolderTree.toggleExpand('${folder.id}')">chevron_right</span>`
            : `<span style="width:18px;display:inline-block;"></span>`;

        const folderIcon = this._renderFolderIcon(folder, isExpanded, 'folder-icon');

        const nameHtml = isEditing
            ? `<input type="text" class="folder-rename-input form-input" value="${Helpers.escapeHtml(folder.name)}"
                    onblur="ProfileFolderTree.finishRename('${folder.id}', this.value)"
                    onkeydown="if(event.key==='Enter')this.blur();if(event.key==='Escape')ProfileFolderTree.cancelRename();"
                    onclick="event.stopPropagation()" autofocus>`
            : `<span class="folder-name">${Helpers.escapeHtml(folder.name)}</span>`;

        let childrenHtml = '';
        if (hasChildren && isExpanded) {
            childrenHtml = folder.children.map(child => this.renderNode(child, depth + 1)).join('');
        }

        return `
            <div class="folder-node" data-folder-id="${folder.id}">
                <div class="folder-row hover-lift" style="padding-left:${indent + 8}px;"
                     onclick="ProfileFolderTree.onFolderClick('${folder.id}')"
                     oncontextmenu="event.preventDefault();ProfileFolderTree.showContextMenu(event,'${folder.id}')">
                    ${expandIcon}
                    ${folderIcon}
                    ${nameHtml}
                    <button class="folder-menu-btn icon-btn"
                            onclick="event.stopPropagation();ProfileFolderTree.showContextMenu(event,'${folder.id}')"
                            aria-label="Menu thư mục">
                        <span class="material-icons-round" style="font-size:18px;">more_vert</span>
                    </button>
                </div>
                ${childrenHtml}
            </div>
        `;
    },

    /**
     * Render the entire tree
     * @returns {string} HTML string
     */
    render() {
        if (this.folders.length === 0) {
            return `
                <div class="folder-tree">
                    <div class="folder-tree-header">
                        <h3><span class="material-icons-round" style="vertical-align:middle;margin-right:var(--spacing-xs);">folder</span>Thư mục hồ sơ</h3>
                        <button class="icon-btn" onclick="ProfileFolderTree.showCreateModal()" aria-label="Tạo thư mục mới" title="Tạo thư mục mới">
                            <span class="material-icons-round">create_new_folder</span>
                        </button>
                    </div>
                    <div class="empty-state" style="padding:var(--spacing-lg);text-align:center;">
                        <span class="material-icons-round" style="font-size:48px;color:var(--color-text-muted);opacity:0.5;">folder_off</span>
                        <p style="color:var(--color-text-muted);margin-top:var(--spacing-sm);">Chưa có thư mục nào</p>
                        <button class="btn btn-primary btn-sm" style="margin-top:var(--spacing-md);"
                                onclick="ProfileFolderTree.showCreateModal()">
                            <span class="material-icons-round" style="font-size:16px;">create_new_folder</span>
                            Tạo thư mục
                        </button>
                    </div>
                </div>
            `;
        }

        const treeHtml = this.tree.map(node => this.renderNode(node)).join('');

        return `
            <div class="folder-tree">
                <div class="folder-tree-header">
                    <h3><span class="material-icons-round" style="vertical-align:middle;margin-right:var(--spacing-xs);">folder</span>Thư mục hồ sơ</h3>
                    <button class="icon-btn" onclick="ProfileFolderTree.showCreateModal()" aria-label="Tạo thư mục mới" title="Tạo thư mục mới">
                        <span class="material-icons-round">create_new_folder</span>
                    </button>
                </div>
                <div class="folder-tree-nodes">
                    ${treeHtml}
                </div>
            </div>
        `;
    },

    // ==========================================
    // Navigation & Expand
    // ==========================================

    /**
     * Toggle expand/collapse
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
     * Navigate into folder (lobby-style)
     */
    onFolderClick(folderId) {
        Router.navigate(`/profiles/folder/${folderId}`);
    },

    /**
     * Refresh the tree in the DOM
     */
    refresh() {
        const container = document.querySelector('.folder-tree');
        if (container) {
            container.outerHTML = this.render();
        }
    },

    // ==========================================
    // Utility
    // ==========================================

    /**
     * Get breadcrumb path for a folder
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
     */
    getChildren(parentId) {
        return this.folders
            .filter(f => (parentId ? f.parentId === parentId : !f.parentId))
            .sort((a, b) => (a.order || 0) - (b.order || 0));
    },

    // ==========================================
    // Create Folder
    // ==========================================

    /**
     * Show create folder modal
     */
    showCreateModal(parentId = null) {
        Components.createModal({
            title: parentId ? 'Tạo thư mục con' : 'Tạo thư mục mới',
            content: `
                <div class="form-group">
                    <label class="form-label">Tên thư mục</label>
                    <input type="text" id="new-pf-folder-name" class="form-input" placeholder="Nhập tên thư mục" autofocus
                           onkeydown="if(event.key==='Enter'){event.preventDefault();ProfileFolderTree.createFolder('${parentId || ''}');}">
                </div>
            `,
            actions: [
                {
                    label: 'Tạo',
                    type: 'primary',
                    onClick: () => this.createFolder(parentId),
                    closeOnClick: false
                }
            ]
        });
    },

    /**
     * Create folder
     */
    async createFolder(parentId) {
        const nameInput = document.getElementById('new-pf-folder-name');
        const name = nameInput?.value.trim();

        if (!name) {
            Toast.warning('Thiếu tên', 'Vui lòng nhập tên thư mục.');
            nameInput?.focus();
            return;
        }

        try {
            const siblings = this.folders.filter(f => f.parentId === parentId);
            const folderId = await FirestoreDB.createProfileFolder({
                name,
                parentId: parentId || null,
                order: siblings.length
            });

            if (folderId) {
                Toast.success('Đã tạo thư mục');
                this.closeModal();
                await this.loadFolders();
                if (parentId) this.expandedFolders.add(parentId);
                this.refresh();
            }
        } catch (error) {
            Toast.error('Lỗi tạo thư mục', error.message);
        }
    },

    // ==========================================
    // Rename Folder
    // ==========================================

    /**
     * Start renaming a folder
     */
    startRename(folderId) {
        this.editingFolderId = folderId;
        this.closeContextMenu();
        this.refresh();

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
     */
    async finishRename(folderId, newName) {
        this.editingFolderId = null;
        newName = newName.trim();

        const folder = this.folders.find(f => f.id === folderId);
        if (!folder || !newName || newName === folder.name) {
            this.refresh();
            return;
        }

        try {
            await FirestoreDB.updateProfileFolder(folderId, { name: newName });
            folder.name = newName;
            this.buildTree();
            this.refresh();
        } catch (error) {
            Toast.error('Lỗi đổi tên', error.message);
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
     */
    showDeleteConfirm(folderId) {
        const folder = this.folders.find(f => f.id === folderId);
        if (!folder) return;

        const countDescendants = (parentId) => {
            const children = this.folders.filter(f => f.parentId === parentId);
            return children.reduce((sum, child) => sum + 1 + countDescendants(child.id), 0);
        };

        const descendantCount = countDescendants(folderId);
        const message = descendantCount > 0
            ? `Bạn có chắc muốn xóa thư mục "${folder.name}" và ${descendantCount} thư mục con?`
            : `Bạn có chắc muốn xóa thư mục "${folder.name}"?`;

        this.closeContextMenu();
        Components.confirm('Xóa thư mục', message, {
            confirmText: 'Xóa',
            confirmClass: 'btn-danger',
            onConfirm: () => this.deleteFolder(folderId)
        });
    },

    /**
     * Delete folder and descendants
     */
    async deleteFolder(folderId) {
        try {
            const collectDescendants = (parentId) => {
                const children = this.folders.filter(f => f.parentId === parentId);
                let ids = [parentId];
                children.forEach(child => {
                    ids = ids.concat(collectDescendants(child.id));
                });
                return ids;
            };

            const idsToDelete = collectDescendants(folderId);

            // Move cardTypes in these folders to unfiled
            const allCardTypes = await FirestoreDB.getCardTypes();
            for (const ct of allCardTypes) {
                if (idsToDelete.includes(ct.folderId)) {
                    await FirestoreDB.updateCardType(ct.id, { folderId: null });
                }
            }

            // Delete folders
            for (const id of idsToDelete) {
                await FirestoreDB.deleteProfileFolder(id);
            }

            Toast.success('Đã xóa thư mục');
            await this.loadFolders();
            this.refresh();

            // If currently viewing this folder, navigate back to profiles
            const currentPath = Router.getPath();
            if (currentPath.startsWith('/profiles/folder/')) {
                const viewingFolderId = currentPath.replace('/profiles/folder/', '');
                if (idsToDelete.includes(viewingFolderId)) {
                    Router.navigate('/profiles');
                }
            }
        } catch (error) {
            Toast.error('Lỗi xóa thư mục', error.message);
        }
    },

    // ==========================================
    // Context Menu (giống lobby FolderTree)
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

        const menuHtml = `
            <div id="pf-context-menu" class="folder-context-menu glass-panel animate-scale-in"
                 style="position:fixed;top:${event.clientY}px;left:${event.clientX}px;z-index:var(--z-dropdown);">
                <button class="menu-item" onclick="ProfileFolderTree.showCreateModal('${folderId}')">
                    <span class="material-icons-round">create_new_folder</span>
                    <span>Tạo thư mục con</span>
                </button>
                <button class="menu-item" onclick="ProfileFolderTree.startRename('${folderId}')">
                    <span class="material-icons-round">edit</span>
                    <span>Đổi tên</span>
                </button>
                <button class="menu-item" onclick="ProfileFolderTree.showCoverImageModal('${folderId}')">
                    <span class="material-icons-round">image</span>
                    <span>Ảnh bìa</span>
                </button>
                <div class="menu-divider"></div>
                <button class="menu-item menu-item-danger" onclick="ProfileFolderTree.showDeleteConfirm('${folderId}')">
                    <span class="material-icons-round">delete</span>
                    <span>Xóa thư mục</span>
                </button>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', menuHtml);

        // Adjust position if overflows viewport
        setTimeout(() => {
            const menu = document.getElementById('pf-context-menu');
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
            if (!e.target.closest('#pf-context-menu')) {
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
        const menu = document.getElementById('pf-context-menu');
        if (menu) menu.remove();
        this.contextMenuFolderId = null;
    },

    /**
     * Close modal
     */
    closeModal() {
        const modal = document.querySelector('.modal-overlay') || document.getElementById('pf-cover-image-modal');
        if (modal) modal.remove();
    },

    // ==========================================
    // Cover Image (Ảnh bìa thư mục hồ sơ)
    // ==========================================

    /**
     * Show modal to set cover image (upload or URL)
     * @param {string} folderId
     */
    showCoverImageModal(folderId) {
        this.closeContextMenu();
        const folder = this.folders.find(f => f.id === folderId);
        if (!folder) return;

        const currentPreview = folder.coverImage
            ? `<div style="position:relative;display:inline-block;">
                    <img src="${Helpers.escapeHtml(folder.coverImage)}" alt="Ảnh bìa hiện tại"
                         style="width:80px;height:80px;object-fit:cover;border-radius:8px;border:2px solid var(--color-border);">
                    <button onclick="ProfileFolderTree.removeCoverImage('${folderId}')" title="Xóa ảnh bìa"
                            style="position:absolute;top:-8px;right:-8px;width:22px;height:22px;border-radius:50%;
                                   background:var(--color-error, #e53935);color:#fff;border:2px solid var(--color-bg);
                                   display:flex;align-items:center;justify-content:center;cursor:pointer;
                                   font-size:14px;line-height:1;padding:0;">
                        <span class="material-icons-round" style="font-size:14px;">close</span>
                    </button>
               </div>`
            : `<span class="material-icons-round" style="font-size:48px;color:var(--color-text-muted);">image</span>`;

        const modalHtml = `
            <div id="pf-cover-image-modal" class="modal-overlay" onclick="if(event.target===this)ProfileFolderTree.closeModal()">
                <div class="modal-content glass-card animate-scale-in" style="max-width:440px;padding:var(--spacing-xl);">
                    <h3 style="margin-bottom:var(--spacing-lg);">
                        <span class="material-icons-round" style="vertical-align:middle;margin-right:var(--spacing-xs);">image</span>
                        Ảnh bìa: ${Helpers.escapeHtml(folder.name)}
                    </h3>
                    
                    <!-- Preview -->
                    <div style="text-align:center;margin-bottom:var(--spacing-lg);">
                        <div id="pf-cover-preview">${currentPreview}</div>
                    </div>

                    <!-- Tab: Upload -->
                    <div class="form-group">
                        <label class="form-label">
                            <span class="material-icons-round" style="font-size:16px;vertical-align:middle;">upload_file</span>
                            Tải lên từ máy tính
                        </label>
                        <input type="file" id="pf-cover-file-input" accept="image/*"
                               onchange="ProfileFolderTree._handleCoverFileUpload('${folderId}', this)"
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
                            <input type="url" id="pf-cover-url-input" class="form-input"
                                   placeholder="https://example.com/image.png"
                                   style="flex:1;">
                            <button class="btn btn-primary btn-sm" onclick="ProfileFolderTree._setCoverFromUrl('${folderId}')">
                                <span class="material-icons-round">check</span>
                            </button>
                        </div>
                    </div>

                    <div style="display:flex;gap:var(--spacing-sm);margin-top:var(--spacing-lg);">
                        <button class="btn btn-secondary btn-full" onclick="ProfileFolderTree.closeModal()">Đóng</button>
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
            console.error('[ProfileFolderTree] Cover upload error:', error);
            Toast.error('Lỗi', 'Không thể tải ảnh lên.');
        }
    },

    /**
     * Set cover from external URL
     * @param {string} folderId
     */
    async _setCoverFromUrl(folderId) {
        const urlInput = document.getElementById('pf-cover-url-input');
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
            console.error('[ProfileFolderTree] Cover URL error:', error);
            Toast.error('Lỗi', 'Không thể lưu ảnh bìa.');
        }
    },

    /**
     * Save cover image to Firestore and refresh UI
     * @param {string} folderId
     * @param {string} imageUrl - base64 data URL or external URL
     */
    async _saveCoverImage(folderId, imageUrl) {
        await FirestoreDB.updateProfileFolder(folderId, { coverImage: imageUrl });
        Toast.success('Đã cập nhật', 'Ảnh bìa thư mục đã được thay đổi.');

        // Update local folder data immediately
        const folder = this.folders.find(f => f.id === folderId);
        if (folder) folder.coverImage = imageUrl;

        // Update preview in modal
        const preview = document.getElementById('pf-cover-preview');
        if (preview) {
            preview.innerHTML = `<img src="${Helpers.escapeHtml(imageUrl)}" alt="Ảnh bìa"
                style="width:80px;height:80px;object-fit:cover;border-radius:8px;border:2px solid var(--color-border);">`;
        }

        // Refresh folder tree in DOM
        this.refresh();

        // Also refresh profile-folder-view if visible
        const folderHeader = document.querySelector('.folder-view-header');
        if (folderHeader && folder) {
            const iconEl = folderHeader.querySelector('.folder-header-icon, .material-icons-round');
            if (iconEl) {
                iconEl.outerHTML = this._renderFolderIcon(folder, true, 'folder-header-icon', 40);
            }
        }
    },

    /**
     * Remove cover image from folder
     * @param {string} folderId
     */
    async removeCoverImage(folderId) {
        this.closeContextMenu();
        this.closeModal();
        try {
            await FirestoreDB.updateProfileFolder(folderId, { coverImage: null });
            Toast.success('Đã xóa', 'Ảnh bìa đã được gỡ bỏ.');

            // Update local folder data immediately
            const folder = this.folders.find(f => f.id === folderId);
            if (folder) folder.coverImage = null;

            // Refresh folder tree in DOM
            this.refresh();
        } catch (error) {
            console.error('[ProfileFolderTree] Remove cover error:', error);
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
