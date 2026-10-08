// ============================================
// Theme Manager - Dark / Light / System Mode
// ============================================

const ThemeManager = {
    STORAGE_KEY: 'linguaflash-theme',
    currentTheme: 'dark', // Default

    /**
     * Initialize theme system
     */
    init() {
        // Prevent flash of wrong theme
        document.body.classList.add('no-transition');

        // Load saved theme or detect system preference
        const savedTheme = Helpers.storage.get(this.STORAGE_KEY, 'system');
        this.apply(savedTheme);

        // Listen for system theme changes
        this._watchSystemTheme();

        // Remove no-transition class after paint
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                document.body.classList.remove('no-transition');
            });
        });

        console.log('[Theme] Initialized:', savedTheme);
    },

    /**
     * Apply a theme
     * @param {'dark'|'light'|'system'} theme
     */
    apply(theme) {
        this.currentTheme = theme;
        Helpers.storage.set(this.STORAGE_KEY, theme);

        let resolvedTheme = theme;
        if (theme === 'system') {
            resolvedTheme = this._getSystemTheme();
        }

        document.documentElement.setAttribute('data-theme', resolvedTheme);

        // Update meta theme-color
        const themeColor = resolvedTheme === 'dark' ? '#0F0E17' : '#F8F7FF';
        const metaTheme = document.querySelector('meta[name="theme-color"]');
        if (metaTheme) metaTheme.content = themeColor;
    },

    /**
     * Get current resolved theme (always 'dark' or 'light')
     * @returns {'dark'|'light'}
     */
    getResolved() {
        if (this.currentTheme === 'system') {
            return this._getSystemTheme();
        }
        return this.currentTheme;
    },

    /**
     * Toggle between themes: dark -> light -> system -> dark
     */
    toggle() {
        const order = ['dark', 'light', 'system'];
        const currentIndex = order.indexOf(this.currentTheme);
        const nextTheme = order[(currentIndex + 1) % order.length];
        this.apply(nextTheme);
        return nextTheme;
    },

    /**
     * Get label for current theme
     * @returns {string}
     */
    getLabel() {
        const labels = {
            dark: 'Tối',
            light: 'Sáng',
            system: 'Theo thiết bị'
        };
        return labels[this.currentTheme] || 'Tối';
    },

    /**
     * Get icon for current theme
     * @returns {string}
     */
    getIcon() {
        const icons = {
            dark: 'dark_mode',
            light: 'light_mode',
            system: 'settings_brightness'
        };
        return icons[this.currentTheme] || 'dark_mode';
    },

    /**
     * Detect system color scheme preference
     * @private
     * @returns {'dark'|'light'}
     */
    _getSystemTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            return 'light';
        }
        return 'dark';
    },

    /**
     * Watch for system theme changes
     * @private
     */
    _watchSystemTheme() {
        if (!window.matchMedia) return;
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
            if (this.currentTheme === 'system') {
                this.apply('system');
            }
        });
    }
};


export default ThemeManager;
