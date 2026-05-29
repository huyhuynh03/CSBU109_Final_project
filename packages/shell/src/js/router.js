// ============================================
// SPA Router - Hash-based routing
// ============================================

const Router = {
    routes: {},
    currentRoute: null,
    mainContent: null,
    // Navigation token: tăng mỗi lần navigate. Async work của navigation cũ
    // phải kiểm tra token trước khi mutate DOM, để tránh navigation cũ ghi đè
    // navigation mới khi user chuyển tab nhanh.
    _navToken: 0,

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
     * Trả về token hiện tại — page có thể lưu lại trước khi await,
     * sau đó so với isTokenValid() để biết có nên cập nhật DOM hay không.
     */
    getNavToken() {
        return this._navToken;
    },

    /**
     * Kiểm tra token còn hợp lệ (chưa có navigation mới sau đó).
     */
    isTokenValid(token) {
        return token === this._navToken;
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
        // Strip query params for route matching
        const qIndex = hash.indexOf('?');
        return qIndex >= 0 ? hash.substring(0, qIndex) : hash;
    },

    /**
     * Get full path including query string
     * @returns {string}
     */
    getFullPath() {
        return window.location.hash.slice(1) || '/';
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

        // Guard: skip nếu route đang xử lý đã match path mới.
        // QUAN TRỌNG: So sánh với _pendingRoute (route đang xử lý / hoặc đã render)
        // thay vì currentRoute (route đã render xong) để tránh race condition khi
        // user navigate nhanh A→B→A:
        //   - Step 1: path A, _pendingRoute='A' (init)
        //   - Step 2: click B → _handleRoute(B), pass guard, _pendingRoute='B', sleep
        //   - Step 3: nhanh chóng click A → _handleRoute(A), path A
        //   - Cũ: path === currentRoute (vẫn 'A' vì B chưa render xong) → return
        //         → B wake up từ sleep, render B → ghi đè trong khi URL='A' ❌
        //   - Mới: path A !== _pendingRoute 'B' → pass guard, increment token
        //         → B wake up, isStale=true, bỏ render ✅
        if (path === this._pendingRoute) return;
        this._pendingRoute = path;

        // Cấp token mới cho navigation này. Mọi async step bên dưới
        // sẽ bail-out nếu một navigation mới hơn đã bắt đầu.
        const token = ++this._navToken;
        const isStale = () => token !== this._navToken;

        // Lazy-load language module (e.g. English) nếu path thuộc module đó.
        // Module sẽ tự đăng ký routes của nó với Router trước khi ta match.
        if (window.ModuleLoader) {
            try {
                await window.ModuleLoader.ensureLoadedFor(path);
            } catch (e) {
                console.error('[Router] Failed to load module for path', path, e);
                // Tiếp tục: nếu không load được module, route sẽ không match
                // và fallback về home — user thấy thông báo thay vì màn trắng.
            }
            if (isStale()) return;
        }

        // Call onLeave for current route
        if (this.currentRoute && this.routes[this.currentRoute]) {
            const currentHandler = this.routes[this.currentRoute];
            if (currentHandler.onLeave) {
                try {
                    await currentHandler.onLeave();
                } catch (e) {
                    console.warn('[Router] onLeave error:', e);
                }
            }
        }
        if (isStale()) return;

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

        // Page transition — giảm delay để navigation cảm giác nhanh hơn
        this.mainContent.classList.add('page-exit');
        await Helpers.sleep(50);
        if (isStale()) return;

        // Render new page
        this.currentRoute = path;
        if (handler.render) {
            const content = await handler.render(params);
            // Sau await: kiểm tra lại token trước khi đụng vào DOM, nếu không
            // navigation cũ sẽ ghi đè HTML của navigation mới.
            if (isStale()) return;
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
        setTimeout(() => {
            // Chỉ remove khi token còn valid để tránh xoá animation của nav khác
            if (!isStale()) this.mainContent.classList.remove('page-enter');
        }, 300);

        // Call onEnter — truyền token để page tự kiểm tra trước khi update DOM async
        if (handler.onEnter) {
            try {
                await handler.onEnter(params, token);
            } catch (e) {
                console.warn('[Router] onEnter error:', e);
            }
        }
        if (isStale()) return;

        // Scroll to top
        window.scrollTo(0, 0);

        console.log('[Router] Navigated to:', path);
    }
};


export default Router;
