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
     * @param {number} [options.duration=3000] - Duration in ms (0 = persistent, no auto-dismiss)
     * @param {Object} [options.action] - Optional action button { label, onClick }
     * @param {string} [options.id] - Optional id to dedupe (replace existing toast with same id)
     * @returns {HTMLElement} The toast element
     */
    show({ type = 'info', title, message = '', duration = 3000, action = null, id = null }) {
        if (!this.container) this.init();

        // Dedupe by id - remove previous toast with same id
        if (id) {
            const existing = this.container.querySelector(`[data-toast-id="${CSS.escape(id)}"]`);
            if (existing) existing.remove();
        }

        const icons = {
            success: 'check_circle',
            error: 'error',
            warning: 'warning',
            info: 'info'
        };

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        if (id) toast.dataset.toastId = id;

        const actionHtml = action && action.label
            ? `<button class="toast-action btn btn-text" type="button">${Helpers.escapeHtml(action.label)}</button>`
            : '';

        toast.innerHTML = `
            <span class="material-icons-round toast-icon">${icons[type]}</span>
            <div class="toast-content">
                <div class="toast-title">${Helpers.escapeHtml(title)}</div>
                ${message ? `<div class="toast-message">${Helpers.escapeHtml(message)}</div>` : ''}
            </div>
            ${actionHtml}
            <button class="toast-close icon-btn" aria-label="Đóng">
                <span class="material-icons-round" style="font-size:18px">close</span>
            </button>
        `;

        // Action button handler
        if (action && typeof action.onClick === 'function') {
            const actionBtn = toast.querySelector('.toast-action');
            if (actionBtn) {
                actionBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    try {
                        action.onClick(toast);
                    } catch (err) {
                        console.error('[Toast] Action handler error:', err);
                    }
                });
            }
        }

        // Close button handler
        toast.querySelector('.toast-close').addEventListener('click', () => {
            this._dismiss(toast);
        });

        this.container.appendChild(toast);

        // Auto dismiss (0 = persistent)
        if (duration > 0) {
            setTimeout(() => this._dismiss(toast), duration);
        }

        return toast;
    },

    /**
     * Manually dismiss a toast (public API)
     */
    dismiss(toast) {
        this._dismiss(toast);
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


export default Toast;
