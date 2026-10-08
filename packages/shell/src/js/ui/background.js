// ============================================
// Floating Background - Kahoot-style animation
// ============================================

const FloatingBackground = {
    container: null,
    icons: ['school', 'translate', 'auto_stories', 'psychology', 'language', 'quiz',
            'menu_book', 'spellcheck', 'record_voice_over', 'abc', 'edit_note',
            'lightbulb', 'star', 'emoji_objects', 'workspace_premium'],
    // Vibrant color palette for floating icons
    colors: [
        'rgba(108, 99, 255, 0.4)',   // Purple (primary)
        'rgba(168, 85, 247, 0.4)',   // Violet
        'rgba(236, 72, 153, 0.35)',  // Pink
        'rgba(59, 130, 246, 0.4)',   // Blue
        'rgba(14, 165, 233, 0.35)',  // Sky blue
        'rgba(20, 184, 166, 0.35)',  // Teal
        'rgba(16, 185, 129, 0.35)', // Emerald
        'rgba(245, 158, 11, 0.3)',  // Amber
        'rgba(239, 68, 68, 0.3)',   // Red
        'rgba(249, 115, 22, 0.3)',  // Orange
    ],
    maxIcons: 6,
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

        // Create initial batch of icons (giảm từ 8 → 4 để nhẹ hơn)
        for (let i = 0; i < 4; i++) {
            setTimeout(() => this._createIcon(), i * 1200);
        }

        // Continuously create new icons (giảm tần suất: 3s → 6s)
        this.intervalId = setInterval(() => {
            if (this.container.children.length < this.maxIcons) {
                this._createIcon();
            }
        }, 6000);
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
        const size = 36 + Math.random() * 52; // 36-88px
        const left = Math.random() * 100;      // 0-100% horizontal position
        const duration = 15 + Math.random() * 25; // 15-40s float duration
        const delay = Math.random() * 5;        // 0-5s delay

        // Pick random color from palette
        const color = this.colors[Math.floor(Math.random() * this.colors.length)];

        icon.style.cssText = `
            font-size: ${size}px;
            left: ${left}%;
            animation-duration: ${duration}s;
            animation-delay: ${delay}s;
            color: ${color};
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


export default FloatingBackground;
