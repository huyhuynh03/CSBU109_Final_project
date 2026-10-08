// ============================================
// LinguaFlashHost — Public API surface for language modules
// ============================================
// Modules access the shell via window.LinguaFlashHost (or just `host`)
// instead of touching globals directly. This is the contract that lets
// us split modules into separate repos in Phase 4.
//
// Phase 2 implementation: thin wrappers around existing globals.
// Phase 3+: this becomes the only stable API exposed to lazy-loaded modules.
// ============================================

const LinguaFlashHost = {
    /**
     * Host API version. Modules declare `minHostVersion` in the registry;
     * ModuleLoader refuses to load a module requiring a newer host than this.
     * Bump MAJOR when removing/changing existing API shape (breaking),
     * MINOR when adding new API surface (backward-compatible).
     */
    version: '1.0.0',

    /**
     * Return the active language module id derived from URL.
     * Mirrors Sidebar._parseLanguageFromPath() so both stay in sync.
     * @returns {string|null}
     */
    getActiveLanguageId() {
        const path = (window.location.hash.slice(1) || '/');
        const match = path.match(/^\/([a-z]+)\//);
        if (!match) return null;
        const candidate = match[1];
        const shellRoutes = ['auth', 'account', 'settings'];
        if (shellRoutes.includes(candidate)) return null;
        return candidate;
    },

    // ==========================================
    // Data — auto-scoped by current languageId
    // ==========================================
    get data() { return FirestoreDB; },

    // ==========================================
    // Auth
    // ==========================================
    get auth() { return Auth; },

    // ==========================================
    // Router
    // ==========================================
    get router() { return Router; },

    // ==========================================
    // UI
    // ==========================================
    ui: {
        get toast() { return Toast; },
        get sidebar() { return Sidebar; }
    },

    // ==========================================
    // FSRS
    // ==========================================
    get fsrs() { return FSRS; },

    // ==========================================
    // Utilities
    // ==========================================
    get tts() { return typeof TTS !== 'undefined' ? TTS : null; },
    get helpers() { return Helpers; }
};

// Expose for modules
window.LinguaFlashHost = LinguaFlashHost;
window.host = LinguaFlashHost;


export default LinguaFlashHost;
