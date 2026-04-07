// ============================================
// Sidebar Menu - Thanh menu bên trái
// ============================================

const Sidebar = {
    isOpen: false,
    _initialized: false,

    /**
     * Menu items configuration
     */
    menuItems: [
        {
            id: 'folder-tree',
            icon: 'account_tree',
            label: 'Cây thư mục',
            route: '/folders',
            requireAuth: true
        }
        // Thêm menu items khác ở đây sau này
    ],

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
        const overlay = document.getElementById('sidebar-overlay');
        if (overlay) {
            overlay.addEventListener('click', () => {
                this.close();
            });
        }

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
    open() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        if (!sidebar || !overlay) return;

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
     * Render sidebar menu content
     * @private
     */
    _renderContent() {
        const content = document.getElementById('sidebar-content');
        if (!content) return;

        const isSignedIn = Auth.isSignedIn();

        const menuHtml = this.menuItems
            .filter(item => !item.requireAuth || isSignedIn)
            .map(item => `
                <button class="sidebar-menu-item" onclick="Sidebar._onMenuItemClick('${item.route}')">
                    <span class="material-icons-round sidebar-menu-icon">${item.icon}</span>
                    <span class="sidebar-menu-label">${item.label}</span>
                    <span class="material-icons-round sidebar-menu-arrow">chevron_right</span>
                </button>
            `).join('');

        if (!menuHtml) {
            content.innerHTML = `
                <div class="sidebar-empty">
                    <span class="material-icons-round">login</span>
                    <p>Đăng nhập để sử dụng menu</p>
                </div>
            `;
            return;
        }

        content.innerHTML = `
            <div class="sidebar-menu-list">
                ${menuHtml}
            </div>
        `;
    },

    /**
     * Handle menu item click
     * @param {string} route
     */
    _onMenuItemClick(route) {
        this.close();
        Router.navigate(route);
    }
};
