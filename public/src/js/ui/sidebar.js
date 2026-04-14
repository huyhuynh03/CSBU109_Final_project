// ============================================
// Sidebar Menu - Navigation Rail (expand/collapse)
// ============================================

const Sidebar = {
    isExpanded: false,
    _initialized: false,

    /**
     * Menu items configuration
     */
    menuItems: [
        {
            id: 'home',
            icon: 'home',
            label: 'Trang chủ',
            route: '/',
            requireAuth: false
        },
        {
            id: 'study',
            icon: 'auto_stories',
            label: 'Học mới',
            route: '/study',
            requireAuth: true
        },
        {
            id: 'review',
            icon: 'replay',
            label: 'Ôn tập',
            route: '/review',
            requireAuth: true
        },
        {
            id: 'dictation',
            icon: 'hearing',
            label: 'Luyện chính tả',
            route: null,
            requireAuth: true,
            comingSoon: true
        },
        {
            id: 'folder-tree',
            icon: 'account_tree',
            label: 'Cây thư mục',
            route: '/folders',
            requireAuth: true
        },
        {
            id: 'fields',
            icon: 'text_fields',
            label: 'Trường',
            route: '/fields',
            requireAuth: true
        },
        {
            id: 'profiles',
            icon: 'tune',
            label: 'Hồ sơ cấu hình',
            route: '/profiles',
            requireAuth: true
        }
    ],

    /**
     * Initialize sidebar
     */
    init() {
        if (this._initialized) return;

        // Toggle button in header
        const btnMenu = document.getElementById('btn-menu');
        if (btnMenu) {
            btnMenu.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggle();
            });
        }

        // Close on overlay click (mobile)
        const overlay = document.getElementById('sidebar-overlay');
        if (overlay) {
            overlay.addEventListener('click', () => {
                this.collapse();
            });
        }

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isExpanded) {
                this.collapse();
            }
        });

        // Listen for route changes to update active state & visibility
        window.addEventListener('hashchange', () => {
            this._renderContent();
            this._updateVisibility();
        });

        // Render initial content
        this._renderContent();

        // Show sidebar by default on desktop
        this._updateVisibility();
        window.addEventListener('resize', () => this._updateVisibility());

        this._initialized = true;
        console.log('[Sidebar] Initialized');
    },

    /**
     * Toggle sidebar expand/collapse
     */
    toggle() {
        if (this.isExpanded) {
            this.collapse();
        } else {
            this.expand();
        }
    },

    /**
     * Expand sidebar - show icon + label
     */
    expand() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        if (!sidebar) return;

        this.isExpanded = true;
        sidebar.classList.add('sidebar-expanded');
        document.body.classList.add('sidebar-is-expanded');

        // Show overlay on mobile
        if (window.innerWidth < 1024 && overlay) {
            overlay.classList.add('sidebar-overlay-visible');
        }
    },

    /**
     * Collapse sidebar - show only icons
     */
    collapse() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        if (!sidebar) return;

        this.isExpanded = false;
        sidebar.classList.remove('sidebar-expanded');
        document.body.classList.remove('sidebar-is-expanded');

        if (overlay) {
            overlay.classList.remove('sidebar-overlay-visible');
        }
    },

    /**
     * Update sidebar visibility based on screen size
     * @private
     */
    _updateVisibility() {
        const sidebar = document.getElementById('sidebar');
        const btnMenu = document.getElementById('btn-menu');
        if (!sidebar) return;

        // Hide sidebar completely on auth page
        const currentPath = (window.location.hash.slice(1) || '/');
        if (currentPath === '/auth') {
            sidebar.classList.remove('sidebar-visible');
            sidebar.style.display = 'none';
            if (btnMenu) btnMenu.style.display = 'none';
            if (this.isExpanded) this.collapse();
            return;
        }

        // Show sidebar & menu button on non-auth pages
        sidebar.style.display = '';
        if (btnMenu) btnMenu.style.display = '';

        if (window.innerWidth >= 1024) {
            // Desktop: always show sidebar (collapsed by default)
            sidebar.classList.add('sidebar-visible');
        } else {
            // Mobile: hide sidebar rail, only show when expanded
            sidebar.classList.remove('sidebar-visible');
            if (this.isExpanded) {
                this.collapse();
            }
        }
    },

    /**
     * Render sidebar menu content
     * @private
     */
    _renderContent() {
        const content = document.getElementById('sidebar-content');
        if (!content) return;

        const isSignedIn = Auth.isSignedIn();
        const currentPath = Router.getPath();

        const visibleItems = this.menuItems
            .filter(item => !item.requireAuth || isSignedIn);

        const menuHtml = visibleItems.map(item => {
            const isActive = item.route === currentPath ||
                (item.route && item.route !== '/' && currentPath.startsWith(item.route));
            const activeClass = isActive ? 'sidebar-nav-item--active' : '';
            const disabledClass = item.comingSoon ? 'sidebar-nav-item--disabled' : '';

            if (item.comingSoon) {
                return `
                    <button class="sidebar-nav-item ${disabledClass}" 
                            onclick="Toast.info('Sắp ra mắt', 'Tính năng ${item.label} đang được phát triển!')"
                            title="${item.label}">
                        <span class="material-icons-round sidebar-nav-icon">${item.icon}</span>
                        <span class="sidebar-nav-label">${item.label}</span>
                    </button>
                `;
            }

            return `
                <button class="sidebar-nav-item ${activeClass}" 
                        onclick="Sidebar._onItemClick('${item.route}')"
                        title="${item.label}">
                    <span class="material-icons-round sidebar-nav-icon">${item.icon}</span>
                    <span class="sidebar-nav-label">${item.label}</span>
                </button>
            `;
        }).join('');

        content.innerHTML = `
            <nav class="sidebar-nav">
                ${menuHtml}
            </nav>
        `;
    },

    /**
     * Handle menu item click
     * @param {string} route
     */
    _onItemClick(route) {
        // Collapse on mobile after navigation
        if (window.innerWidth < 1024) {
            this.collapse();
        }
        Router.navigate(route);
    },

    /**
     * Refresh sidebar content (e.g., after auth state change)
     */
    refresh() {
        this._renderContent();
    }
};
