// ============================================
// Profile Folder Tree - Cây thư mục hồ sơ cấu hình
// ============================================
// Tách biệt khỏi FolderTree (lobby), dùng collection profileFolders
// v3: Refactor - navigate vào folder thay vì filter sidebar

const ProfileFolderTree = {
    folders: [],
    tree: [],
    expandedFolders: new Set(),
    editingFolderId: null,

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
                    <span class="material-icons-round folder-icon" style="font-size:20px;color:var(--color-primary);">folder</span>
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
                    <div class="folder-tree-empty">
                        <span class="material-icons-round" style="font-size:48px;color:var(--color-text-muted);margin-bottom:var(--spacing-sm);">folder_off</span>
                        <p style="color:var(--color-text-muted);font-size:var(--font-size-sm);">Chưa có thư mục nào</p>
                        <button class="btn btn-primary btn-sm" onclick="ProfileFolderTree.showCreateModal()" style="margin-top:var(--spacing-md);">
                            <span class="material-icons-round">create_new_folder</span>
                            Tạo thư mục đầu tiên
                        </button>
                    </div>
                </div>
            `;
        }

        const nodesHtml = this.tree.map(node => this.renderNode(node, 0)).join('');
        return `
            <div class="folder-tree">
                <div class="folder-tree-header">
                    <h3><span class="material-icons-round" style="vertical-align:middle;margin-right:var(--spacing-xs);">folder</span>Thư mục hồ sơ</h3>
                    <button class="icon-btn" onclick="ProfileFolderTree.showCreateModal()" aria-label="Tạo thư mục mới" title="Tạo thư mục mới">
                        <span class="material-icons-round">create_new_folder</span>
                    </button>
                </div>
                <div class="folder-tree-content">
                    ${nodesHtml}
                </div>
            </div>
        `;
    },

    // ==========================================
    // Navigation
    // ==========================================

    /**
     * Toggle folder expand/collapse
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
     * Handle folder click - navigate to folder view (like lobby)
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
        Router.navigate(`/profiles/folder/${folderId}`);
    },

    /**
     * Refresh tree in DOM
     */
    refresh() {
        const container = document.querySelector('.folder-tree');
        if (container) {
            container.outerHTML = this.render();
        }
    },

    /**
     * Get breadcrumb path from root to given folder
     * @param {string} folderId
     * @returns {Array} [{id, name}, ...] from root to current
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
     * @param {string} parentId
     * @returns {Array}
     */
    getChildren(parentId) {
        return this.folders
            .filter(f => f.parentId === parentId)
            .sort((a, b) => (a.order || 0) - (b.order || 0));
    },

    // ==========================================
    // CRUD Operations
    // ==========================================

    /**
     * Show create folder modal
     */
    showCreateModal(parentId = null) {
        Components.createModal({
            title: parentId ? 'Tạo thư mục con' : 'Tạo thư mục hồ sơ',
            content: `
                <div class="form-group">
                    <label class="form-label">Tên thư mục</label>
                    <input type="text" id="pf-folder-name" class="form-input" placeholder="Nhập tên thư mục"
                           onkeydown="if(event.key==='Enter'){event.preventDefault();ProfileFolderTree.createFolder(${parentId ? `'${parentId}'` : 'null'});}" autofocus>
                </div>
            `,
            actions: [
                {
                    label: 'Tạo',
                    type: 'primary',
                    closeOnClick: false,
                    onClick: () => this.createFolder(parentId)
                }
            ]
        });

        setTimeout(() => {
            const input = document.getElementById('pf-folder-name');
            if (input) input.focus();
        }, 100);
    },

    /**
     * Create a new profile folder
     */
    async createFolder(parentId) {
        const input = document.getElementById('pf-folder-name');
        const name = input ? input.value.trim() : '';
        if (!name) {
            Toast.warning('Vui lòng nhập tên thư mục');
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
    // Context Menu
    // ==========================================

    showContextMenu(event, folderId) {
        event.preventDefault();
        event.stopPropagation();
        this.closeContextMenu();

        const menuItems = [
            { icon: 'create_new_folder', label: 'Tạo thư mục con', action: () => this.showCreateModal(folderId) },
            { icon: 'edit', label: 'Đổi tên', action: () => this.startRename(folderId) },
            { icon: 'delete', label: 'Xóa', action: () => this.showDeleteConfirm(folderId), danger: true }
        ];

        const menuHtml = menuItems.map(item => `
            <button class="context-menu-item ${item.danger ? 'context-menu-item-danger' : ''}"
                    onclick="event.stopPropagation();">
                <span class="material-icons-round" style="font-size:18px;">${item.icon}</span>
                ${item.label}
            </button>
        `).join('');

        const menu = document.createElement('div');
        menu.className = 'context-menu glass-panel';
        menu.id = 'pf-context-menu';
        menu.innerHTML = menuHtml;
        menu.style.cssText = `position:fixed;top:${event.clientY}px;left:${event.clientX}px;z-index:1000;min-width:180px;`;
        document.body.appendChild(menu);

        // Bind actions
        const buttons = menu.querySelectorAll('.context-menu-item');
        menuItems.forEach((item, i) => {
            buttons[i].addEventListener('click', () => {
                this.closeContextMenu();
                item.action();
            });
        });

        // Close on click outside
        const closeHandler = (e) => {
            if (!menu.contains(e.target)) {
                this.closeContextMenu();
                document.removeEventListener('click', closeHandler);
            }
        };
        setTimeout(() => document.addEventListener('click', closeHandler), 0);
    },

    closeContextMenu() {
        const menu = document.getElementById('pf-context-menu');
        if (menu) menu.remove();
    },

    closeModal() {
        const overlay = document.querySelector('.modal-overlay');
        if (overlay) overlay.remove();
    }
};
