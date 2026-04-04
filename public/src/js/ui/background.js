// ============================================
// Floating Background - Kahoot-style animation
// ============================================

const FloatingBackground = {
    container: null,
    icons: ['school', 'translate', 'auto_stories', 'psychology', 'language', 'quiz',
            'menu_book', 'spellcheck', 'record_voice_over', 'abc', 'edit_note',
            'lightbulb', 'star', 'emoji_objects', 'workspace_premium'],
    maxIcons: 15,
    intervalId: null,

    /**
     * Initialize floating background
     */
    init() {
        this.container = document.getElementById('floating-bg');
        if (!this.container) return;

        // Check reduced motion preference
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        // Create initial batch of icons
        for (let i = 0; i < 8; i++) {
            setTimeout(() => this._createIcon(), i * 800);
        }

        // Continuously create new icons
        this.intervalId = setInterval(() => {
            if (this.container.children.length < this.maxIcons) {
                this._createIcon();
            }
        }, 3000);
    },

    /**
     * Create a single floating icon
     * @private
     */
    _createIcon() {
        if (!this.container) return;

        const icon = document.createElement('span');
        icon.className = 'material-icons-round floating-icon';
        icon.textContent = this.icons[Math.floor(Math.random() * this.icons.length)];

        // Random properties
        const size = 24 + Math.random() * 40; // 24-64px
        const left = Math.random() * 100;      // 0-100% horizontal position
        const duration = 15 + Math.random() * 25; // 15-40s float duration
        const delay = Math.random() * 5;        // 0-5s delay

        icon.style.cssText = `
            font-size: ${size}px;
            left: ${left}%;
            animation-duration: ${duration}s;
            animation-delay: ${delay}s;
            opacity: ${0.3 + Math.random() * 0.4};
        `;

        // Remove icon after animation completes
        icon.addEventListener('animationend', () => {
            icon.remove();
        });

        this.container.appendChild(icon);
    },

    /**
     * Stop all floating icons
     */
    destroy() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
};
