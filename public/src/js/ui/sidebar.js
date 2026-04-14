// ============================================
// Sidebar Menu - Navigation Rail (expand/collapse)
// ============================================

const Sidebar = {
    isExpanded: false,
    _initialized: false,

    /**
     * Current language domain context (e.g., 'english')
     * Sidebar only shows when inside a language domain
     */
    currentDomain: null,

    /**
     * Routes that belong to a language domain context
     * When user is on these routes, sidebar should be visible
     */
    _domainRoutes: [
        '/english', '/study', '/review', '/folders', '/folder/',
        '/fields', '/profiles', '/profiles/', '/account', '/settings'
    ],

    /**
     * Menu items configuration
     */
    menuItems: [
        {
            id: 'home',
            icon: 'home',
            label: 'Trang chủ',
            route: 'domain-home', // Special: navigates to current domain dashboard
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
            this._detectDomain();
            this._renderContent();
            this._updateVisibility();
        });

        // Detect initial domain from current route
        this._detectDomain();

        // Render initial content
        this._renderContent();

        // Update visibility based on current context
        this._updateVisibility();
        window.addEventListener('resize', () => this._updateVisibility());

        this._initialized = true;
        console.log('[Sidebar] Initialized');
    },

    /**
     * Detect current language domain from route
     * @private
     */
    _detectDomain() {
        const currentPath = (window.location.hash.slice(1) || '/');

        // Check if current route is inside a language domain
        if (currentPath === '/english' || this._isDomainRoute(currentPath)) {
            // If navigating to /english, set domain
            if (currentPath === '/english') {
                this.currentDomain = 'english';
            }
            // For other domain routes, keep current domain if set
            // (user navigated from english dashboard to study/review/etc.)
            if (!this.currentDomain) {
                this.currentDomain = 'english'; // Default to english for now
            }
        } else {
            // Outside domain context (home page, auth page, etc.)
            this.currentDomain = null;
        }

        console.log('[Sidebar] Domain:', this.currentDomain, 'Path:', currentPath);
    },

    /**
     * Check if a path belongs to domain context
     * @param {string} path
     * @returns {boolean}
     * @private
     */
    _isDomainRoute(path) {
        return this._domainRoutes.some(route => {
            if (route.endsWith('/')) {
                return path.startsWith(route);
            }
            return path === route || path.startsWith(route + '/');
        });
    },

    /**
     * Get the home route for current domain
     * @returns {string}
     */
    getDomainHome() {
        return this.currentDomain ? `/${this.currentDomain}` : '/';
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
     * Update sidebar visibility based on screen size and domain context
     * @private
     */
    _updateVisibility() {
        const sidebar = document.getElementById('sidebar');
        const btnMenu = document.getElementById('btn-menu');
        if (!sidebar) return;

        // Hide sidebar when NOT inside a language domain
        if (!this.currentDomain) {
            sidebar.classList.remove('sidebar-visible');
            sidebar.style.display = 'none';
            if (btnMenu) btnMenu.style.display = 'none';
            document.body.classList.remove('has-sidebar');
            if (this.isExpanded) this.collapse();
            return;
        }

        // Inside a language domain - show sidebar
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
        const domainHome = this.getDomainHome();

        const visibleItems = this.menuItems
            .filter(item => !item.requireAuth || isSignedIn);

        const menuHtml = visibleItems.map(item => {
            // Resolve domain-home route
            const itemRoute = item.route === 'domain-home' ? domainHome : item.route;

            const isActive = itemRoute === currentPath ||
                (itemRoute && itemRoute !== domainHome && currentPath.startsWith(itemRoute));
            // Special: home is active when on domain home
            const isHomeActive = item.route === 'domain-home' && currentPath === domainHome;

            const activeClass = (isActive || isHomeActive) ? 'sidebar-nav-item--active' : '';
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

        // "Switch language" button at bottom
        const switchLangHtml = `
            <button class="sidebar-nav-item sidebar-nav-item--switch" 
                    onclick="Sidebar._onItemClick('/')"
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
        this._detectDomain();
        this._renderContent();
        this._updateVisibility();
    }
};
