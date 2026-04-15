// ============================================
// Folder Explorer Page - Cây thư mục dạng tổng quan
// Hiển thị tất cả thư mục (Từ vựng + Ngữ pháp) phân nhóm
// ============================================

const FolderExplorerPage = {
    vocabFolders: [],
    grammarFolders: [],
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

        // Load both folder types
        try {
            const [vocab, grammar] = await Promise.all([
                FirestoreDB.getFolders('vocabulary'),
                FirestoreDB.getFolders('grammar')
            ]);
            this.vocabFolders = vocab;
            this.grammarFolders = grammar;
        } catch (error) {
            console.error('[FolderExplorer] Error loading folders:', error);
            this.vocabFolders = [];
            this.grammarFolders = [];
        }

        return this._renderPage();
    },

    /**
     * Render page HTML
     * @private
     * @returns {string}
     */
    _renderPage() {
        const vocabTree = this._buildTree(this.vocabFolders);
        const grammarTree = this._buildTree(this.grammarFolders);

        const totalVocab = this.vocabFolders.length;
        const totalGrammar = this.grammarFolders.length;

        return `
            <div class="page-container animate-fade-in">
                <div class="explorer-page">
                    <div class="explorer-header">
                        <div class="explorer-header-left">
                            <button class="icon-btn" onclick="Router.navigate('/')" aria-label="Quay lại" title="Quay lại">
                                <span class="material-icons-round">arrow_back</span>
                            </button>
                            <h2>
                                <span class="material-icons-round" style="vertical-align:middle;margin-right:var(--spacing-xs);">account_tree</span>
                                Cây thư mục
                            </h2>
                        </div>
                    </div>

                    <!-- Vocabulary Section -->
                    <div class="explorer-section">
                        <div class="explorer-section-header" style="display:flex;align-items:center;gap:var(--spacing-sm);margin-bottom:var(--spacing-md);">
                            <span class="material-icons-round" style="color:#3B82F6;font-size:28px;">menu_book</span>
                            <h3 style="margin:0;flex:1;">Từ vựng</h3>
                            <span class="badge" style="background:rgba(59,130,246,0.15);color:#3B82F6;">${totalVocab} thư mục</span>
                            <button class="icon-btn" onclick="FolderExplorerPage._createFolder('vocabulary')" aria-label="Tạo thư mục từ vựng" title="Tạo thư mục từ vựng">
                                <span class="material-icons-round">create_new_folder</span>
                            </button>
                        </div>
                        <div class="explorer-body glass-card">
                            ${this._renderTreeContent(vocabTree, 'vocabulary')}
                        </div>
                    </div>

                    <!-- Grammar Section -->
                    <div class="explorer-section" style="margin-top:var(--spacing-xl);">
                        <div class="explorer-section-header" style="display:flex;align-items:center;gap:var(--spacing-sm);margin-bottom:var(--spacing-md);">
                            <span class="material-icons-round" style="color:#10B981;font-size:28px;">school</span>
                            <h3 style="margin:0;flex:1;">Ngữ pháp</h3>
                            <span class="badge" style="background:rgba(16,185,129,0.15);color:#10B981;">${totalGrammar} thư mục</span>
                            <button class="icon-btn" onclick="FolderExplorerPage._createFolder('grammar')" aria-label="Tạo thư mục ngữ pháp" title="Tạo thư mục ngữ pháp">
                                <span class="material-icons-round">create_new_folder</span>
                            </button>
                        </div>
                        <div class="explorer-body glass-card">
                            ${this._renderTreeContent(grammarTree, 'grammar')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Render tree content or empty state
     * @private
     */
    _renderTreeContent(tree, type) {
        if (tree.length === 0) {
            const label = type === 'vocabulary' ? 'từ vựng' : 'ngữ pháp';
            return `
                <div class="explorer-empty">
                    <span class="material-icons-round">folder_off</span>
                    <p>Chưa có thư mục ${label} nào</p>
                    <button class="btn btn-primary" onclick="FolderExplorerPage._createFolder('${type}')" style="margin-top:var(--spacing-md);">
                        <span class="material-icons-round">create_new_folder</span>
                        Tạo thư mục đầu tiên
                    </button>
                </div>
            `;
        }

        return `
            <div class="explorer-tree explorer-grid">
                ${tree.map(folder => this._renderNode(folder, 0, type)).join('')}
            </div>
        `;
    },

    /**
     * Build tree structure from flat list
     * @private
     * @returns {Array}
     */
    _buildTree(folders) {
        const map = {};
        const roots = [];

        folders.forEach(f => {
            map[f.id] = { ...f, children: [] };
        });

        folders.forEach(f => {
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
     * Render a single tree node - Explorer style
     * @private
     */
    _renderNode(folder, depth = 0, type = 'vocabulary') {
        const hasChildren = folder.children && folder.children.length > 0;
        const isExpanded = this.expandedFolders.has(folder.id);

        // Expand/collapse arrow
        const expandIndicator = hasChildren
            ? `<button class="explorer-expand-btn"
                       onclick="event.stopPropagation();FolderExplorerPage.toggleExpand('${folder.id}')"
                       aria-label="${isExpanded ? 'Thu gọn' : 'Mở rộng'}">
                   <span class="material-icons-round explorer-expand-icon ${isExpanded ? 'expanded' : ''}">
                       expand_more
                   </span>
               </button>`
            : '';

        // Children HTML (recursive) - also a grid
        const childrenHtml = hasChildren && isExpanded
            ? `<div class="explorer-tree-children explorer-grid">
                   ${folder.children.map(child => this._renderNode(child, depth + 1, type)).join('')}
               </div>`
            : '';

        const folderIcon = FolderTree._renderFolderIcon(folder, isExpanded && hasChildren, 'explorer-folder-icon', 32);

        // Type badge color
        const typeColor = type === 'vocabulary' ? '#3B82F6' : '#10B981';

        return `
            <div class="explorer-tree-node ${isExpanded ? 'node-expanded' : ''}" data-folder-id="${folder.id}" data-depth="${depth}">
                <div class="explorer-folder-card glass-card"
                     onclick="FolderExplorerPage.navigateToFolder('${folder.id}')"
                     style="border-left:3px solid ${typeColor};">
                    ${folderIcon}
                    <span class="explorer-folder-name">${Helpers.escapeHtml(folder.name)}</span>
                    ${expandIndicator}
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
     * Create folder via FolderTree modal (with type preset)
     * @param {string} type - 'vocabulary' or 'grammar'
     */
    _createFolder(type) {
        // Set type on FolderTree before showing modal
        FolderTree.currentType = type;
        FolderTree.showCreateModal();
    },

    /**
     * Refresh tree content only (not whole page)
     * @private
     */
    async _refreshTree() {
        // Re-render both sections
        try {
            const [vocab, grammar] = await Promise.all([
                FirestoreDB.getFolders('vocabulary'),
                FirestoreDB.getFolders('grammar')
            ]);
            this.vocabFolders = vocab;
            this.grammarFolders = grammar;
        } catch (error) {
            console.error('[FolderExplorer] Error refreshing:', error);
        }

        const vocabBody = document.querySelectorAll('.explorer-body')[0];
        const grammarBody = document.querySelectorAll('.explorer-body')[1];

        const vocabTree = this._buildTree(this.vocabFolders);
        const grammarTree = this._buildTree(this.grammarFolders);

        if (vocabBody) {
            vocabBody.innerHTML = this._renderTreeContent(vocabTree, 'vocabulary');
        }
        if (grammarBody) {
            grammarBody.innerHTML = this._renderTreeContent(grammarTree, 'grammar');
        }
    }
};
