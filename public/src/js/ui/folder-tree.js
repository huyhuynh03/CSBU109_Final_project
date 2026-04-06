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

        return `
            <div class="folder-node" data-folder-id="${folder.id}">
                <div class="folder-row hover-lift" style="padding-left:${indent + 8}px;" 
                     onclick="FolderTree.onFolderClick('${folder.id}')"
                     oncontextmenu="event.preventDefault();FolderTree.showContextMenu(event,'${folder.id}')">
                    ${expandIcon}
                    <span class="material-icons-round folder-icon">${isExpanded ? 'folder_open' : 'folder'}</span>
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
    }
};
