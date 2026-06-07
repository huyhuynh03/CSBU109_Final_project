// ============================================
// Sidebar Menu - Navigation Rail (expand/collapse)
// State-based: globalItems + languageItems + activeLanguageId
// ============================================

const Sidebar = {
    isExpanded: false,
    _initialized: false,

    // ==========================================
    // State
    // ==========================================

    /**
     * Currently active language module id (null = global/no language selected)
     */
    _activeLanguageId: null,

    /**
     * Global items — always visible regardless of active language
     */
    _globalItems: [
        {
            id: 'home',
            icon: 'home',
            label: 'Trang chủ',
            route: '/',
            requireAuth: true
        }
    ],

    /**
     * Language-scoped items — only visible when a language module is active.
     * Populated by setLanguageItems() when a module activates.
     */
    _languageItems: [],

    /**
     * Footer items — always visible
     */
    _footerItems: [],

    /**
     * Routes that show the sidebar (when user is signed in).
     * Includes /english/* and other language prefixes dynamically.
     */
    _sidebarRoutes: [
        '/', '/english/', '/account', '/settings'
    ],

    // ==========================================
    // Public API
    // ==========================================

    /**
     * Set the active language and its sidebar items.
     * Called by router when URL prefix changes to a language scope.
     * @param {string|null} languageId - e.g. 'english', null to clear
     * @param {Array} [items] - sidebar items for this language module
     */
    setLanguageScope(languageId, items) {
        const changed = this._activeLanguageId !== languageId;
        this._activeLanguageId = languageId;
        if (items) {
            this._languageItems = items;
        } else if (!languageId) {
            this._languageItems = [];
        }
        if (changed || items) {
            this._renderContent();
        }
    },

    /**
     * Get current active language id
     * @returns {string|null}
     */
    getActiveLanguageId() {
        return this._activeLanguageId;
    },

    /**
     * Initialize sidebar
     */
    init() {
        if (this._initialized) return;

        // Toggle button in header (id="sidebar-toggle" trong index.html)
        const btnMenu = document.getElementById('sidebar-toggle');
        if (btnMenu) {
            btnMenu.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggle();
            });
        }

        // Close button inside sidebar header
        const btnClose = document.querySelector('.sidebar-close-btn');
        if (btnClose) {
            btnClose.addEventListener('click', (e) => {
                e.stopPropagation();
                this.collapse();
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
            this._onRouteChange();
        });

        // Render initial content
        this._onRouteChange();

        // Update visibility based on current context
        this._updateVisibility();
        window.addEventListener('resize', () => this._updateVisibility());

        this._initialized = true;
        console.log('[Sidebar] Initialized');
    },

    // ==========================================
    // Internal
    // ==========================================

    /**
     * Called on every route change — derive activeLanguageId from URL,
     * then re-render sidebar content and update visibility.
     * @private
     */
    _onRouteChange() {
        const path = (window.location.hash.slice(1) || '/');

        // Derive activeLanguageId from URL prefix
        const langId = this._parseLanguageFromPath(path);

        if (langId !== this._activeLanguageId) {
            this._activeLanguageId = langId;
            // If switching to a known language, set its items
            if (langId) {
                const items = this._getLanguageItems(langId);
                if (items) this._languageItems = items;
            } else {
                this._languageItems = [];
            }
        }

        this._renderContent();
        this._updateVisibility();
    },

    /**
     * Parse language id from URL path.
     * e.g. '/english/vocabulary' → 'english'
     *      '/languages' → null
     *      '/' → null
     * @param {string} path
     * @returns {string|null}
     * @private
     */
    _parseLanguageFromPath(path) {
        // Match /{languageId}/... pattern
        const match = path.match(/^\/([a-z]+)\//);
        if (match) {
            const candidate = match[1];
            // Only recognize known language prefixes (not shell routes)
            const shellRoutes = ['auth', 'account', 'settings'];
            if (!shellRoutes.includes(candidate)) {
                return candidate;
            }
        }
        return null;
    },

    /**
     * Get sidebar items for a known language module.
     * Phase 4: đọc từ ModuleLoader registry (single source of truth —
     * modules-registry.json). Fallback hardcode 'english' nếu registry
     * chưa kịp load (defensive, để sidebar không trống).
     * @param {string} langId
     * @returns {Array|null}
     * @private
     */
    _getLanguageItems(langId) {
        // Ưu tiên registry (ModuleLoader.loadRegistry() chạy lúc App.init)
        if (window.ModuleLoader && typeof window.ModuleLoader.getSidebarItems === 'function') {
            const items = window.ModuleLoader.getSidebarItems(langId);
            if (items) return items;
        }
        // Fallback an toàn cho English khi registry chưa sẵn sàng
        const fallback = {
            english: [
                { id: 'en-vocab', icon: 'menu_book', label: 'Từ vựng', route: '/english/vocabulary' },
                { id: 'en-grammar', icon: 'school', label: 'Ngữ pháp', route: '/english/grammar' }
            ]
        };
        return fallback[langId] || null;
    },

    /**
     * Check if a path should show the sidebar
     * @param {string} path
     * @returns {boolean}
     * @private
     */
    _isSidebarRoute(path) {
        // Always show sidebar on these exact/prefix routes
        return this._sidebarRoutes.some(route => {
            if (route.endsWith('/')) {
                return path === route.slice(0, -1) || path.startsWith(route);
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
        const btnMenu = document.getElementById('sidebar-toggle');
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
     * Render sidebar menu content based on current state.
     * Two zones: global items + language-scoped items (if active).
     * @private
     */
    _renderContent() {
        const content = document.getElementById('sidebar-content');
        if (!content) return;

        const isSignedIn = Auth.isSignedIn();
        const currentPath = (typeof Router !== 'undefined') ? Router.getPath() : (window.location.hash.slice(1) || '/');

        // --- Global items ---
        const globalHtml = this._globalItems
            .filter(item => !item.requireAuth || isSignedIn)
            .map(item => this._renderItem(item, currentPath))
            .join('');

        // --- Language-scoped items (only when a language is active) ---
        let languageHtml = '';
        if (this._activeLanguageId && this._languageItems.length > 0) {
            languageHtml = `
                <div class="sidebar-nav-divider"></div>
                ${this._languageItems.map(item => this._renderItem(item, currentPath)).join('')}
            `;
        }

        // --- Footer: PWA install + Switch language ---
        const footerItemsHtml = this._footerItems
            .filter(item => !item.requireAuth || isSignedIn)
            .map(item => {
                const isActive = item.route === currentPath;
                return `
                    <button class="sidebar-nav-item sidebar-nav-item--switch ${isActive ? 'sidebar-nav-item--active' : ''}"
                            onclick="Sidebar._onItemClick('${item.route}')"
                            title="${item.label}">
                        <span class="material-icons-round sidebar-nav-icon">${item.icon}</span>
                        <span class="sidebar-nav-label">${item.label}</span>
                    </button>
                `;
            }).join('');

        // PWA Install button (hidden if already installed or running standalone)
        const installBtnHtml = (typeof PWAInstall !== 'undefined' && !PWAInstall._isInstalled) ? `
            <button class="sidebar-nav-item sidebar-nav-item--install"
                    onclick="PWAInstall.install()"
                    title="Cài đặt ứng dụng">
                <span class="material-icons-round sidebar-nav-icon">download</span>
                <span class="sidebar-nav-label">Cài đặt ứng dụng</span>
            </button>
        ` : '';

        content.innerHTML = `
            <nav class="sidebar-nav">
                ${globalHtml}
                ${languageHtml}
            </nav>
            <div class="sidebar-footer">
                ${installBtnHtml}
                ${footerItemsHtml}
            </div>
        `;
    },

    /**
     * Render a single sidebar item
     * @param {Object} item
     * @param {string} currentPath
     * @returns {string}
     * @private
     */
    _renderItem(item, currentPath) {
        const itemRoute = item.route;

        // Active state: exact match or prefix match (for nested routes)
        let isActive = false;
        if (itemRoute === '/') {
            isActive = currentPath === '/';
        } else if (itemRoute) {
            isActive = currentPath === itemRoute || currentPath.startsWith(itemRoute + '/');
        }

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
        this._onRouteChange();
    }
};


export default Sidebar;
