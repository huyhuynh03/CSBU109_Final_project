// ============================================
// Toast Notification System
// ============================================

const Toast = {
    container: null,

    init() {
        this.container = document.getElementById('toast-container');
    },

    /**
     * Show a toast notification
     * @param {Object} options
     * @param {string} options.type - 'success' | 'error' | 'warning' | 'info'
     * @param {string} options.title - Toast title
     * @param {string} [options.message] - Toast message (optional)
     * @param {number} [options.duration=3000] - Duration in ms
     */
    show({ type = 'info', title, message = '', duration = 3000 }) {
        if (!this.container) this.init();

        const icons = {
            success: 'check_circle',
            error: 'error',
            warning: 'warning',
            info: 'info'
        };

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <span class="material-icons-round toast-icon">${icons[type]}</span>
            <div class="toast-content">
                <div class="toast-title">${Helpers.escapeHtml(title)}</div>
                ${message ? `<div class="toast-message">${Helpers.escapeHtml(message)}</div>` : ''}
            </div>
            <button class="toast-close icon-btn" aria-label="Đóng">
                <span class="material-icons-round" style="font-size:18px">close</span>
            </button>
        `;

        // Close button handler
        toast.querySelector('.toast-close').addEventListener('click', () => {
            this._dismiss(toast);
        });

        this.container.appendChild(toast);

        // Auto dismiss
        if (duration > 0) {
            setTimeout(() => this._dismiss(toast), duration);
        }

        return toast;
    },

    _dismiss(toast) {
        if (!toast || !toast.parentNode) return;
        toast.classList.add('toast-exit');
        toast.addEventListener('animationend', () => {
            toast.remove();
        });
    },

    // Shorthand methods
    success(title, message) {
        return this.show({ type: 'success', title, message });
    },

    error(title, message) {
        return this.show({ type: 'error', title, message, duration: 5000 });
    },

    warning(title, message) {
        return this.show({ type: 'warning', title, message, duration: 4000 });
    },

    info(title, message) {
        return this.show({ type: 'info', title, message });
    }
};
