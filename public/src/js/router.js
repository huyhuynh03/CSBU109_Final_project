// ============================================
// SPA Router - Hash-based routing
// ============================================

const Router = {
    routes: {},
    currentRoute: null,
    mainContent: null,

    /**
     * Initialize router
     */
    init() {
        this.mainContent = document.getElementById('main-content');

        // Listen for hash changes
        window.addEventListener('hashchange', () => this._handleRoute());

        // Handle initial route
        this._handleRoute();

        console.log('[Router] Initialized');
    },

    /**
     * Register a route
     * @param {string} path - Route path (e.g., '/', '/study', '/settings')
     * @param {Object} handler - { render(), onEnter(), onLeave() }
     */
    register(path, handler) {
        this.routes[path] = handler;
    },

    /**
     * Navigate to a route
     * @param {string} path
     */
    navigate(path) {
        window.location.hash = path;
    },

    /**
     * Get current route path
     * @returns {string}
     */
    getPath() {
        const hash = window.location.hash.slice(1) || '/';
        return hash;
    },

    /**
     * Parse route parameters
     * @param {string} pattern - e.g., '/folder/:id'
     * @param {string} path - e.g., '/folder/abc123'
     * @returns {Object|null} - { id: 'abc123' } or null if no match
     */
    matchRoute(pattern, path) {
        const patternParts = pattern.split('/');
        const pathParts = path.split('/');

        if (patternParts.length !== pathParts.length) return null;

        const params = {};
        for (let i = 0; i < patternParts.length; i++) {
            if (patternParts[i].startsWith(':')) {
                params[patternParts[i].slice(1)] = decodeURIComponent(pathParts[i]);
            } else if (patternParts[i] !== pathParts[i]) {
                return null;
            }
        }
        return params;
    },

    /**
     * Handle route change
     * @private
     */
    async _handleRoute() {
        const path = this.getPath();

        // Call onLeave for current route
        if (this.currentRoute && this.routes[this.currentRoute]) {
            const currentHandler = this.routes[this.currentRoute];
            if (currentHandler.onLeave) {
                await currentHandler.onLeave();
            }
        }

        // Find matching route
        let handler = null;
        let params = {};

        // Try exact match first
        if (this.routes[path]) {
            handler = this.routes[path];
        } else {
            // Try pattern matching
            for (const [pattern, routeHandler] of Object.entries(this.routes)) {
                const match = this.matchRoute(pattern, path);
                if (match) {
                    handler = routeHandler;
                    params = match;
                    break;
                }
            }
        }

        // Fallback to 404 or home
        if (!handler) {
            console.warn('[Router] No route found for:', path);
            handler = this.routes['/'] || this.routes['*'];
            if (!handler) return;
        }

        // Page transition
        this.mainContent.classList.add('page-exit');
        await Helpers.sleep(150);

        // Render new page
        this.currentRoute = path;
        if (handler.render) {
            const content = await handler.render(params);
            if (typeof content === 'string') {
                this.mainContent.innerHTML = content;
            } else if (content instanceof HTMLElement) {
                this.mainContent.innerHTML = '';
                this.mainContent.appendChild(content);
            }
        }

        // Page enter animation
        this.mainContent.classList.remove('page-exit');
        this.mainContent.classList.add('page-enter');
        setTimeout(() => this.mainContent.classList.remove('page-enter'), 300);

        // Call onEnter
        if (handler.onEnter) {
            await handler.onEnter(params);
        }

        // Scroll to top
        window.scrollTo(0, 0);

        console.log('[Router] Navigated to:', path);
    }
};
