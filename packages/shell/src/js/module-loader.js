// ============================================
// Module Loader (registry-driven)
// ============================================
// Quản lý vòng đời của language modules dựa trên một registry tĩnh
// (modules-registry.json deploy cùng shell).
//
// Mỗi module có `type`:
//   - 'local'  : nằm trong monorepo này, import qua importer dựng sẵn
//                (Vite code-split thành chunk riêng, lazy-load khi cần).
//   - 'remote' : nằm ở deploy riêng (repo + hosting khác). Shell fetch
//                manifest.json của module để lấy entryUrl rồi dynamic import.
//                Dùng khi thêm ngôn ngữ mới mà KHÔNG cần sửa code shell —
//                chỉ thêm 1 entry vào registry.
//
// Shell đọc registry để render sidebar + dashboard cards mà KHÔNG cần
// load bundle module (lazy-load vẫn đảm bảo). Bundle chỉ tải khi user
// thực sự navigate vào /{moduleId}/*.

const ModuleLoader = {
    /**
     * Importer cho các module type='local'. Dynamic import → Vite tách chunk.
     * Thêm ngôn ngữ local mới = thêm 1 dòng ở đây + 1 entry trong registry.
     * @private
     */
    _localImporters: {
        english: () => import('@english/index.js')
    },

    /**
     * Dữ liệu registry sau khi fetch. null = chưa load.
     * @private
     */
    _registryData: null,

    /**
     * Map moduleId → registry entry (để tra cứu O(1)).
     * @private
     */
    _entries: new Map(),

    /**
     * Map moduleId → module object đã install.
     * @private
     */
    _loaded: new Map(),

    /**
     * Map moduleId → loading Promise (de-dup khi 2 navigation gần nhau).
     * @private
     */
    _loading: new Map(),

    /**
     * Fetch và parse modules-registry.json. Gọi 1 lần lúc bootstrap
     * (App.init) trước khi Sidebar/Router init.
     *
     * Idempotent: gọi lại trả về registry đã cache.
     *
     * @returns {Promise<object>} registry data
     */
    async loadRegistry() {
        if (this._registryData) return this._registryData;

        try {
            const res = await fetch('/modules-registry.json', { cache: 'no-cache' });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            this._registryData = data;

            this._entries.clear();
            for (const entry of data.modules || []) {
                this._entries.set(entry.id, entry);
            }

            const available = (data.modules || []).filter(m => m.available);
            console.log(`[ModuleLoader] Registry loaded: ${this._entries.size} module(s), ${available.length} available`);
            return data;
        } catch (e) {
            console.error('[ModuleLoader] Failed to load registry, falling back to local-only:', e);
            // Fallback: dựng registry tối thiểu từ local importers để app vẫn chạy
            this._registryData = { version: '0.0.0', modules: [] };
            this._entries.clear();
            for (const id of Object.keys(this._localImporters)) {
                const fallback = { id, type: 'local', available: true, minHostVersion: '0.0.0' };
                this._entries.set(id, fallback);
            }
            return this._registryData;
        }
    },

    /**
     * Trả về registry entry của 1 module (hoặc null).
     */
    getRegistryEntry(moduleId) {
        return this._entries.get(moduleId) || null;
    },

    /**
     * Trả về TẤT CẢ module trong registry (kể cả chưa available).
     * Dùng cho dashboard để hiển thị cả card "Sắp ra mắt" (locked).
     */
    getAllModules() {
        return Array.from(this._entries.values());
    },

    /**
     * Trả về danh sách module available (đã sẵn sàng dùng), kèm meta.
     * Dùng cho dashboard language cards / trang chọn ngôn ngữ.
     */
    getAvailableModules() {
        return Array.from(this._entries.values()).filter(m => m.available);
    },

    /**
     * Sidebar items của 1 module (đọc từ registry — single source of truth).
     * @returns {Array|null}
     */
    getSidebarItems(moduleId) {
        const entry = this._entries.get(moduleId);
        return entry && Array.isArray(entry.sidebarItems) ? entry.sidebarItems : null;
    },

    /**
     * Default route của module (nơi đưa user vào khi click từ dashboard).
     */
    getDefaultRoute(moduleId) {
        const entry = this._entries.get(moduleId);
        return entry?.defaultRoute || null;
    },

    /**
     * Trích moduleId từ path. Ví dụ:
     *   /english/vocabulary  → 'english'
     *   /settings            → null
     * Chỉ trả về id nếu module đó có trong registry (hoặc local importer
     * khi registry chưa kịp load).
     *
     * @param {string} path
     * @returns {string|null}
     */
    getModuleIdFromPath(path) {
        const match = path.match(/^\/([a-z]+)\//);
        if (!match) return null;
        const candidate = match[1];
        if (this._entries.has(candidate)) return candidate;
        // Defensive: registry chưa load nhưng là local module đã biết
        if (this._localImporters[candidate]) return candidate;
        return null;
    },

    /**
     * Load 1 module theo id. Idempotent — gọi nhiều lần chỉ load 1 lần.
     *
     * @param {string} moduleId
     * @returns {Promise<object>} module object đã install
     */
    async load(moduleId) {
        if (this._loaded.has(moduleId)) {
            return this._loaded.get(moduleId);
        }
        if (this._loading.has(moduleId)) {
            return this._loading.get(moduleId);
        }

        const loadPromise = this._doLoad(moduleId)
            .finally(() => {
                this._loading.delete(moduleId);
            });

        this._loading.set(moduleId, loadPromise);
        return loadPromise;
    },

    /**
     * @private
     */
    async _doLoad(moduleId) {
        const startedAt = performance.now();
        const entry = this._entries.get(moduleId);

        if (!entry) {
            throw new Error(`[ModuleLoader] Module "${moduleId}" not found in registry`);
        }
        if (!entry.available) {
            throw new Error(`[ModuleLoader] Module "${moduleId}" is not available yet`);
        }

        // Version gate: module yêu cầu host mới hơn host hiện tại → từ chối
        const hostVersion = (window.LinguaFlashHost && window.LinguaFlashHost.version) || '0.0.0';
        if (entry.minHostVersion && this._compareVersions(entry.minHostVersion, hostVersion) > 0) {
            throw new Error(
                `[ModuleLoader] Module "${moduleId}" requires host >= ${entry.minHostVersion}, ` +
                `current host = ${hostVersion}. Vui lòng cập nhật ứng dụng.`
            );
        }

        console.log(`[ModuleLoader] Loading "${moduleId}" (type=${entry.type})...`);

        // Lấy module object theo type
        const imported = entry.type === 'remote'
            ? await this._importRemote(entry)
            : await this._importLocal(moduleId);

        const mod = imported.default || imported;

        if (!mod || typeof mod !== 'object') {
            throw new Error(`[ModuleLoader] Module "${moduleId}" did not export a valid default object`);
        }
        if (mod.id !== moduleId) {
            console.warn(`[ModuleLoader] Module id mismatch: registry="${moduleId}", module="${mod.id}"`);
        }
        if (!Array.isArray(mod.routes)) {
            throw new Error(`[ModuleLoader] Module "${moduleId}" has no routes array`);
        }

        // Lifecycle: install
        if (typeof mod.install === 'function') {
            await mod.install(window.LinguaFlashHost);
        }

        // Register routes với shell Router
        const Router = window.Router;
        for (const route of mod.routes) {
            const pageObj = route.page;
            Router.register(route.path, {
                render: (params) => (typeof pageObj.render === 'function' ? pageObj.render(params) : ''),
                onEnter: (params, token) => (typeof pageObj.onEnter === 'function' ? pageObj.onEnter(params, token) : undefined),
                onLeave: () => (typeof pageObj.onLeave === 'function' ? pageObj.onLeave() : undefined)
            });
        }

        this._loaded.set(moduleId, mod);

        const ms = Math.round(performance.now() - startedAt);
        console.log(`[ModuleLoader] ✓ "${moduleId}" loaded in ${ms}ms (${mod.routes.length} routes)`);

        return mod;
    },

    /**
     * Import module local qua importer dựng sẵn (Vite code-split).
     * @private
     */
    async _importLocal(moduleId) {
        const importer = this._localImporters[moduleId];
        if (!importer) {
            throw new Error(`[ModuleLoader] No local importer for "${moduleId}"`);
        }
        return importer();
    },

    /**
     * Import module remote: fetch manifest → import entryUrl + inject stylesUrl.
     * @private
     */
    async _importRemote(entry) {
        if (!entry.manifestUrl) {
            throw new Error(`[ModuleLoader] Remote module "${entry.id}" has no manifestUrl`);
        }

        const res = await fetch(entry.manifestUrl, { cache: 'no-cache' });
        if (!res.ok) throw new Error(`[ModuleLoader] manifest fetch failed: HTTP ${res.status}`);
        const manifest = await res.json();

        if (!manifest.entryUrl) {
            throw new Error(`[ModuleLoader] Remote manifest for "${entry.id}" missing entryUrl`);
        }

        // Inject CSS của module (nếu có) — versioned URL, immutable cache
        if (manifest.stylesUrl) {
            this._injectStyle(manifest.stylesUrl, entry.id);
        }

        // /* @vite-ignore */ để Vite KHÔNG cố bundle URL remote lúc build.
        // Đây là điểm mấu chốt cho phép load bundle từ origin khác lúc runtime.
        return import(/* @vite-ignore */ manifest.entryUrl);
    },

    /**
     * Inject 1 <link rel="stylesheet"> cho module remote (idempotent theo id).
     * @private
     */
    _injectStyle(href, moduleId) {
        const existing = document.querySelector(`link[data-module-style="${moduleId}"]`);
        if (existing) return;
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.setAttribute('data-module-style', moduleId);
        document.head.appendChild(link);
    },

    /**
     * So sánh 2 chuỗi semver "a.b.c". Trả về 1 nếu va>vb, -1 nếu va<vb, 0 nếu bằng.
     * @private
     */
    _compareVersions(va, vb) {
        const pa = String(va).split('.').map(n => parseInt(n, 10) || 0);
        const pb = String(vb).split('.').map(n => parseInt(n, 10) || 0);
        for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
            const a = pa[i] || 0;
            const b = pb[i] || 0;
            if (a > b) return 1;
            if (a < b) return -1;
        }
        return 0;
    },

    /**
     * Đảm bảo module cần cho path đã load. Gọi từ Router._handleRoute.
     * @param {string} path
     */
    async ensureLoadedFor(path) {
        const moduleId = this.getModuleIdFromPath(path);
        if (!moduleId) return;
        if (this._loaded.has(moduleId)) return;
        await this.load(moduleId);
    },

    /**
     * Module đã load chưa.
     */
    isLoaded(moduleId) {
        return this._loaded.has(moduleId);
    },

    /**
     * Lấy reference module đã load (hoặc null).
     */
    get(moduleId) {
        return this._loaded.get(moduleId) || null;
    }
};

export default ModuleLoader;
