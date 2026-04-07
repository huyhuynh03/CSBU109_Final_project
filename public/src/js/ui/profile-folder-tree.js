// ============================================
// Profile Folder Tree - Cây thư mục hồ sơ cấu hình
// ============================================
// Tách biệt khỏi FolderTree (lobby), dùng collection profileFolders

const ProfileFolderTree = {
    folders: [],
    tree: [],
    expandedFolders: new Set(),
    selectedFolderId: null,
    renamingFolderId: null,

    /**
     * Load profile folders from Firestore
     */
    async loadFolders() {
        this.folders = await FirestoreDB.getProfileFolders();
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
        const isSelected = this.selectedFolderId === folder.id;
        const isRenaming = this.renamingFolderId === folder.id;

        const indent = depth * 20;
        const expandIcon = hasChildren
            ? `<span class="material-icons-round tree-expand" style="font-size:18px;transition:transform 0.2s;${isExpanded ? 'transform:rotate(90deg);' : ''}"
                    onclick="event.stopPropagation();ProfileFolderTree.toggleExpand('${folder.id}')">chevron_right</span>`
            : `<span style="width:18px;display:inline-block;"></span>`;

        const nameHtml = isRenaming
            ? `<input type="text" class="tree-rename-input" value="${Helpers.escapeHtml(folder.name)}"
                    onblur="ProfileFolderTree.finishRename('${folder.id}', this.value)"
                    onkeydown="if(event.key==='Enter')this.blur();if(event.key==='Escape')ProfileFolderTree.cancelRename();"
                    style="flex:1;padding:2px 6px;font-size:var(--font-size-sm);border:1px solid var(--color-primary);border-radius:var(--radius-sm);background:var(--color-surface);color:var(--color-text);">`
            : `<span class="tree-name" style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${Helpers.escapeHtml(folder.name)}</span>`;

        let childrenHtml = '';
        if (hasChildren && isExpanded) {
            childrenHtml = folder.children.map(child => this.renderNode(child, depth + 1)).join('');
        }

        return `
            <div class="tree-node" data-folder-id="${folder.id}">
                <div class="tree-item ${isSelected ? 'tree-item-selected' : ''}"
                     style="padding-left:${indent + 8}px;display:flex;align-items:center;gap:4px;padding-top:6px;padding-bottom:6px;padding-right:8px;border-radius:var(--radius-sm);cursor:pointer;"
                     onclick="ProfileFolderTree.onFolderClick('${folder.id}')"
                     oncontextmenu="event.preventDefault();ProfileFolderTree.showContextMenu(event,'${folder.id}')">
                    ${expandIcon}
                    <span class="material-icons-round" style="font-size:20px;color:var(--color-primary);">folder</span>
                    ${nameHtml}
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
                <div class="profile-folder-tree" style="padding:var(--spacing-sm);">
                    <div style="text-align:center;padding:var(--spacing-lg) 0;color:var(--color-text-muted);">
                        <span class="material-icons-round" style="font-size:36px;">create_new_folder</span>
                        <p style="font-size:var(--font-size-sm);margin-top:var(--spacing-xs);">Chưa có thư mục</p>
                    </div>
                </div>
            `;
        }

        const nodesHtml = this.tree.map(node => this.renderNode(node, 0)).join('');
        return `
            <div class="profile-folder-tree" style="padding:var(--spacing-xs) 0;">
                ${nodesHtml}
            </div>
        `;
    },

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
     * Handle folder click (select)
     */
    onFolderClick(folderId) {
        this.selectedFolderId = (this.selectedFolderId === folderId) ? null : folderId;
        this.refresh();
        // Dispatch event so ProfilesPage can react
        window.dispatchEvent(new CustomEvent('profile-folder-selected', { detail: { folderId: this.selectedFolderId } }));
    },

    /**
     * Refresh tree in DOM
     */
    refresh() {
        const container = document.querySelector('.profile-folder-tree');
        if (container) {
            container.outerHTML = this.render();
        }
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
                    <input type="text" id="pf-folder-name" class="form-input" placeholder="Nhập tên thư mục" autofocus>
                </div>
            `,
            actions: [
                {
                    text: 'Tạo',
                    class: 'btn-primary',
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
        this.renamingFolderId = folderId;
        this.closeContextMenu();
        this.refresh();

        setTimeout(() => {
            const input = document.querySelector('.tree-rename-input');
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
        this.renamingFolderId = null;
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
        this.renamingFolderId = null;
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

            // Also move cardTypes in these folders to unfiled
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

            if (this.selectedFolderId && idsToDelete.includes(this.selectedFolderId)) {
                this.selectedFolderId = null;
                window.dispatchEvent(new CustomEvent('profile-folder-selected', { detail: { folderId: null } }));
            }

            Toast.success('Đã xóa thư mục');
            await this.loadFolders();
            this.refresh();
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
    },

    /**
     * Get children of a folder
     */
    getChildren(parentId) {
        return this.folders.filter(f => f.parentId === parentId);
    }
};
