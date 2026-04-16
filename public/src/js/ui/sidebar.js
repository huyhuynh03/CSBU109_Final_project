// ============================================
// Sidebar Menu - Navigation Rail (expand/collapse)
// ============================================

const Sidebar = {
    isExpanded: false,
    _initialized: false,

    /**
     * Routes that show the sidebar (when user is signed in)
     */
    _sidebarRoutes: [
        '/', '/vocabulary', '/grammar', '/study', '/review',
        '/account', '/settings'
    ],

    /**
     * Menu items configuration
     */
    menuItems: [
        {
            id: 'home',
            icon: 'home',
            label: 'Trang chủ',
            route: '/',
            requireAuth: true
        },
        {
            id: 'vocabulary',
            icon: 'menu_book',
            label: 'Từ vựng',
            route: '/vocabulary',
            requireAuth: true
        },
        {
            id: 'grammar',
            icon: 'school',
            label: 'Ngữ pháp',
            route: '/grammar',
            requireAuth: true
        },
        {
            id: 'dictation',
            icon: 'hearing',
            label: 'Luyện chính tả',
            route: null,
            requireAuth: true,
            comingSoon: true
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

        // Update visibility based on current context
        this._updateVisibility();
        window.addEventListener('resize', () => this._updateVisibility());

        this._initialized = true;
        console.log('[Sidebar] Initialized');
    },

    /**
     * Check if a path should show the sidebar
     * @param {string} path
     * @returns {boolean}
     * @private
     */
    _isSidebarRoute(path) {
        return this._sidebarRoutes.some(route => {
            if (route.endsWith('/')) {
                return path.startsWith(route);
            }
            return path === route || path.startsWith(route + '/');
        });
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
     * Update sidebar visibility based on screen size and auth state
     * @private
     */
    _updateVisibility() {
        const sidebar = document.getElementById('sidebar');
        const btnMenu = document.getElementById('btn-menu');
        if (!sidebar) return;

        const isSignedIn = Auth.isSignedIn();
        const currentPath = (window.location.hash.slice(1) || '/');

        // Hide sidebar when not signed in or on auth page
        if (!isSignedIn || currentPath === '/auth') {
            sidebar.classList.remove('sidebar-visible');
            sidebar.style.display = 'none';
            if (btnMenu) btnMenu.style.display = 'none';
            document.body.classList.remove('has-sidebar');
            if (this.isExpanded) this.collapse();
            return;
        }

        // Signed in - show sidebar on sidebar routes
        if (this._isSidebarRoute(currentPath)) {
            sidebar.style.display = '';
            if (btnMenu) btnMenu.style.display = '';
            document.body.classList.add('has-sidebar');

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
        } else {
            sidebar.classList.remove('sidebar-visible');
            sidebar.style.display = 'none';
            if (btnMenu) btnMenu.style.display = 'none';
            document.body.classList.remove('has-sidebar');
            if (this.isExpanded) this.collapse();
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
            const itemRoute = item.route;

            const isActive = itemRoute === currentPath ||
                (itemRoute && currentPath.startsWith(itemRoute + '/'));
            // Special: dashboard '/' is active only when exactly on '/'
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
                        onclick="Sidebar._onItemClick('${itemRoute}')"
                        title="${item.label}">
                    <span class="material-icons-round sidebar-nav-icon">${item.icon}</span>
                    <span class="sidebar-nav-label">${item.label}</span>
                </button>
            `;
        }).join('');

        // "Switch language" button at bottom (coming soon)
        const switchLangHtml = `
            <button class="sidebar-nav-item sidebar-nav-item--disabled sidebar-nav-item--switch" 
                    onclick="Toast.info('Sắp ra mắt', 'Tính năng chọn ngôn ngữ đang được phát triển!')"
                    title="Chọn ngôn ngữ">
                <span class="material-icons-round sidebar-nav-icon">language</span>
                <span class="sidebar-nav-label">Chọn ngôn ngữ</span>
            </button>
        `;

        content.innerHTML = `
            <nav class="sidebar-nav">
                ${menuHtml}
            </nav>
            <div class="sidebar-footer">
                ${switchLangHtml}
            </div>
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
        this._updateVisibility();
    }
};
