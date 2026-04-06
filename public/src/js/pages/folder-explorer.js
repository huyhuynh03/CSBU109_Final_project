// ============================================
// Folder Explorer Page - Cây thư mục dạng Windows Explorer
// ============================================

const FolderExplorerPage = {
    folders: [],
    expandedFolders: new Set(),

    /**
     * Render the folder explorer page
     * @returns {string} HTML
     */
    async render() {
        if (!Auth.isSignedIn()) {
            return `
                <div class="page-container animate-fade-in" style="text-align:center;padding:var(--spacing-2xl);">
                    <span class="material-icons-round" style="font-size:64px;color:var(--color-text-muted);">login</span>
                    <h2 style="margin-top:var(--spacing-md);">Đăng nhập để xem thư mục</h2>
                    <p style="margin-top:var(--spacing-sm);">Bạn cần đăng nhập để sử dụng tính năng này.</p>
                    <button class="btn btn-primary" onclick="Router.navigate('/auth')" style="margin-top:var(--spacing-lg);">
                        <span class="material-icons-round">login</span>
                        Đăng nhập
                    </button>
                </div>
            `;
        }

        // Load folders
        try {
            this.folders = await FirestoreDB.getFolders();
        } catch (error) {
            console.error('[FolderExplorer] Error loading folders:', error);
            this.folders = [];
        }

        return this._renderPage();
    },

    /**
     * Render page HTML
     * @private
     * @returns {string}
     */
    _renderPage() {
        const tree = this._buildTree();

        let treeContent;
        if (tree.length === 0) {
            treeContent = `
                <div class="explorer-empty">
                    <span class="material-icons-round">folder_off</span>
                    <p>Chưa có thư mục nào</p>
                    <button class="btn btn-primary" onclick="FolderTree.showCreateModal()" style="margin-top:var(--spacing-md);">
                        <span class="material-icons-round">create_new_folder</span>
                        Tạo thư mục đầu tiên
                    </button>
                </div>
            `;
        } else {
            treeContent = `
                <div class="explorer-tree">
                    ${tree.map(folder => this._renderNode(folder, 0)).join('')}
                </div>
            `;
        }

        return `
            <div class="page-container animate-fade-in">
                <div class="explorer-page">
                    <div class="explorer-header">
                        <div class="explorer-header-left">
                            <button class="icon-btn" onclick="history.back()" aria-label="Quay lại" title="Quay lại">
                                <span class="material-icons-round">arrow_back</span>
                            </button>
                            <h2>
                                <span class="material-icons-round" style="vertical-align:middle;margin-right:var(--spacing-xs);">account_tree</span>
                                Cây thư mục
                            </h2>
                        </div>
                        <button class="icon-btn" onclick="FolderTree.showCreateModal()" aria-label="Tạo thư mục mới" title="Tạo thư mục mới">
                            <span class="material-icons-round">create_new_folder</span>
                        </button>
                    </div>
                    <div class="explorer-body glass-card">
                        ${treeContent}
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Build tree structure from flat list
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
     * Render a single tree node - Windows Explorer style
     * @private
     * @param {Object} folder
     * @param {number} depth
     * @returns {string} HTML
     */
    _renderNode(folder, depth = 0) {
        const hasChildren = folder.children && folder.children.length > 0;
        const isExpanded = this.expandedFolders.has(folder.id);
        const indent = depth * 20 + 12;

        // Expand/collapse arrow
        const expandArrow = hasChildren
            ? `<button class="explorer-expand-btn" 
                       onclick="event.stopPropagation();FolderExplorerPage.toggleExpand('${folder.id}')"
                       aria-label="${isExpanded ? 'Thu gọn' : 'Mở rộng'}">
                   <span class="material-icons-round explorer-expand-icon ${isExpanded ? 'expanded' : ''}">
                       chevron_right
                   </span>
               </button>`
            : `<span class="explorer-expand-placeholder"></span>`;

        // Children HTML (recursive)
        const childrenHtml = hasChildren && isExpanded
            ? `<div class="explorer-tree-children">${folder.children.map(child => this._renderNode(child, depth + 1)).join('')}</div>`
            : '';

        return `
            <div class="explorer-tree-node" data-folder-id="${folder.id}">
                <div class="explorer-tree-row" style="padding-left:${indent}px;"
                     onclick="FolderExplorerPage.navigateToFolder('${folder.id}')">
                    ${expandArrow}
                    <span class="material-icons-round explorer-folder-icon">
                        ${isExpanded && hasChildren ? 'folder_open' : 'folder'}
                    </span>
                    <span class="explorer-folder-name">${Helpers.escapeHtml(folder.name)}</span>
                </div>
                ${childrenHtml}
            </div>
        `;
    },

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
        this._refreshTree();
    },

    /**
     * Navigate to folder view
     * @param {string} folderId
     */
    navigateToFolder(folderId) {
        Router.navigate(`/folder/${folderId}`);
    },

    /**
     * Refresh tree content only (not whole page)
     * @private
     */
    _refreshTree() {
        const body = document.querySelector('.explorer-body');
        if (!body) return;

        const tree = this._buildTree();
        if (tree.length === 0) {
            body.innerHTML = `
                <div class="explorer-empty">
                    <span class="material-icons-round">folder_off</span>
                    <p>Chưa có thư mục nào</p>
                </div>
            `;
        } else {
            body.innerHTML = `
                <div class="explorer-tree">
                    ${tree.map(folder => this._renderNode(folder, 0)).join('')}
                </div>
            `;
        }
    }
};
