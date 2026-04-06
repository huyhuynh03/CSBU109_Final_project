// ============================================
// Sidebar Menu - Thanh menu bên trái
// ============================================

const Sidebar = {
    isOpen: false,
    expandedFolders: new Set(),
    folders: [],
    _initialized: false,
    _closeOnOutsideClick: null,

    /**
     * Initialize sidebar - setup event listeners
     */
    init() {
        if (this._initialized) return;

        const btnMenu = document.getElementById('btn-menu');
        if (btnMenu) {
            btnMenu.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggle();
            });
        }

        // Close on overlay click
        this._closeOnOutsideClick = (e) => {
            const sidebar = document.getElementById('sidebar');
            const btnMenu = document.getElementById('btn-menu');
            if (this.isOpen && sidebar && !sidebar.contains(e.target) && !btnMenu.contains(e.target)) {
                this.close();
            }
        };
        document.addEventListener('click', this._closeOnOutsideClick);

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });

        this._initialized = true;
        console.log('[Sidebar] Initialized');
    },

    /**
     * Toggle sidebar open/close
     */
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    },

    /**
     * Open sidebar
     */
    async open() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        if (!sidebar || !overlay) return;

        // Load folders if signed in
        if (Auth.isSignedIn()) {
            await this._loadFolders();
        }

        this._renderContent();
        this.isOpen = true;
        sidebar.classList.add('sidebar-open');
        overlay.classList.add('sidebar-overlay-visible');
        document.body.style.overflow = 'hidden';
    },

    /**
     * Close sidebar
     */
    close() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        if (!sidebar || !overlay) return;

        this.isOpen = false;
        sidebar.classList.remove('sidebar-open');
        overlay.classList.remove('sidebar-overlay-visible');
        document.body.style.overflow = '';
    },

    /**
     * Load folders from Firestore
     * @private
     */
    async _loadFolders() {
        try {
            this.folders = await FirestoreDB.getFolders();
        } catch (error) {
            console.error('[Sidebar] Error loading folders:', error);
            this.folders = [];
        }
    },

    /**
     * Build tree structure from flat folder list
     * @private
     * @returns {Array}
     */
    _buildTree() {
        const map = {};
        const roots = [];

        this.folders.forEach(f => {
            map[f.id] = { ...f, children: [] };
        });

        this.folders.forEach(f => {
            if (f.parentId && map[f.parentId]) {
                map[f.parentId].children.push(map[f.id]);
            } else {
                roots.push(map[f.id]);
            }
        });

        const sortByOrder = (arr) => {
            arr.sort((a, b) => (a.order || 0) - (b.order || 0));
            arr.forEach(item => sortByOrder(item.children));
        };
        sortByOrder(roots);

        return roots;
    },

    /**
     * Count cards in a folder (placeholder - will be enhanced later)
     * @private
     * @param {string} folderId
     * @returns {number}
     */
    _getCardCount(folderId) {
        // TODO: Implement actual card count when cards are implemented
        return 0;
    },

    /**
     * Render a single tree node for sidebar
     * @private
     * @param {Object} folder
     * @param {number} depth
     * @returns {string} HTML
     */
    _renderTreeNode(folder, depth = 0) {
        const hasChildren = folder.children && folder.children.length > 0;
        const isExpanded = this.expandedFolders.has(folder.id);
        const indent = depth * 16 + 12;

        // Expand arrow (right side, only if has children)
        const expandArrow = hasChildren
            ? `<button class="sidebar-expand-btn" 
                       onclick="event.stopPropagation();Sidebar.toggleExpand('${folder.id}')"
                       aria-label="${isExpanded ? 'Thu gọn' : 'Mở rộng'}">
                   <span class="material-icons-round sidebar-expand-icon ${isExpanded ? 'expanded' : ''}">
                       expand_more
                   </span>
               </button>`
            : '';

        // Children HTML (recursive)
        const childrenHtml = hasChildren && isExpanded
            ? `<div class="sidebar-tree-children">${folder.children.map(child => this._renderTreeNode(child, depth + 1)).join('')}</div>`
            : '';

        return `
            <div class="sidebar-tree-node" data-folder-id="${folder.id}">
                <div class="sidebar-tree-row" style="padding-left:${indent}px;"
                     onclick="Sidebar.navigateToFolder('${folder.id}')">
                    <span class="material-icons-round sidebar-folder-icon">
                        ${isExpanded && hasChildren ? 'folder_open' : 'folder'}
                    </span>
                    <span class="sidebar-folder-name">${Helpers.escapeHtml(folder.name)}</span>
                    ${expandArrow}
                </div>
                ${childrenHtml}
            </div>
        `;
    },

    /**
     * Render sidebar content
     * @private
     */
    _renderContent() {
        const content = document.getElementById('sidebar-content');
        if (!content) return;

        if (!Auth.isSignedIn()) {
            content.innerHTML = `
                <div class="sidebar-section">
                    <div class="sidebar-section-header">
                        <span class="material-icons-round">account_tree</span>
                        <span>Cây thư mục</span>
                    </div>
                    <div class="sidebar-empty">
                        <span class="material-icons-round">login</span>
                        <p>Đăng nhập để xem thư mục</p>
                    </div>
                </div>
            `;
            return;
        }

        const tree = this._buildTree();

        let treeHtml;
        if (tree.length === 0) {
            treeHtml = `
                <div class="sidebar-empty">
                    <span class="material-icons-round">folder_off</span>
                    <p>Chưa có thư mục nào</p>
                    <button class="btn btn-primary btn-sm" onclick="Sidebar.close();FolderTree.showCreateModal();" style="margin-top:var(--spacing-sm);">
                        <span class="material-icons-round">create_new_folder</span>
                        Tạo thư mục
                    </button>
                </div>
            `;
        } else {
            treeHtml = `
                <div class="sidebar-tree">
                    ${tree.map(folder => this._renderTreeNode(folder, 0)).join('')}
                </div>
            `;
        }

        content.innerHTML = `
            <div class="sidebar-section">
                <div class="sidebar-section-header">
                    <span class="material-icons-round">account_tree</span>
                    <span>Cây thư mục</span>
                    <button class="icon-btn sidebar-section-action" 
                            onclick="event.stopPropagation();Sidebar.close();FolderTree.showCreateModal();" 
                            title="Tạo thư mục mới">
                        <span class="material-icons-round" style="font-size:20px;">create_new_folder</span>
                    </button>
                </div>
                ${treeHtml}
            </div>
        `;
    },

    /**
     * Toggle expand/collapse a folder in sidebar
     * @param {string} folderId
     */
    toggleExpand(folderId) {
        if (this.expandedFolders.has(folderId)) {
            this.expandedFolders.delete(folderId);
        } else {
            this.expandedFolders.add(folderId);
        }
        this._renderContent();
    },

    /**
     * Navigate to a folder and close sidebar
     * @param {string} folderId
     */
    navigateToFolder(folderId) {
        this.close();
        Router.navigate(`/folder/${folderId}`);
    },

    /**
     * Refresh sidebar content (e.g., after folder changes)
     */
    async refresh() {
        if (!this.isOpen) return;
        await this._loadFolders();
        this._renderContent();
    }
};
