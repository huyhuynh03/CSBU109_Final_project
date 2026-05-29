// ============================================
// Reusable UI Components
// ============================================

const Components = {
    /**
     * Create a modal dialog
     * @param {Object} options
     * @param {string} options.title
     * @param {string|HTMLElement} options.content - HTML string or DOM element
     * @param {Array} [options.actions] - Array of { label, type, onClick }
     * @param {boolean} [options.closable=true]
     * @returns {Object} { overlay, modal, close }
     */
    createModal({ title, content, actions = [], closable = true }) {
        const overlay = document.createElement('div');
        overlay.className = 'glass-overlay';
        overlay.innerHTML = `
            <div class="glass-modal animate-scale-in">
                <div class="modal-header" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--spacing-lg);">
                    <h3 style="margin:0;">${Helpers.escapeHtml(title)}</h3>
                    ${closable ? `
                        <button class="icon-btn modal-close-btn" aria-label="Đóng">
                            <span class="material-icons-round">close</span>
                        </button>
                    ` : ''}
                </div>
                <div class="modal-body"></div>
                ${actions.length > 0 ? `
                    <div class="modal-actions" style="display:flex;gap:var(--spacing-sm);justify-content:flex-end;margin-top:var(--spacing-lg);"></div>
                ` : ''}
            </div>
        `;

        // Set body content
        const body = overlay.querySelector('.modal-body');
        if (typeof content === 'string') {
            body.innerHTML = content;
        } else if (content instanceof HTMLElement) {
            body.appendChild(content);
        }

        // Create action buttons
        if (actions.length > 0) {
            const actionsContainer = overlay.querySelector('.modal-actions');
            actions.forEach(action => {
                const btn = document.createElement('button');
                btn.className = `btn btn-${action.type || 'secondary'}`;
                btn.textContent = action.label;
                btn.addEventListener('click', () => {
                    if (action.onClick) action.onClick();
                    if (action.closeOnClick !== false) close();
                });
                actionsContainer.appendChild(btn);
            });
        }

        // Close function
        const close = () => {
            overlay.style.opacity = '0';
            setTimeout(() => overlay.remove(), 250);
        };

        // Close on overlay click
        if (closable) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) close();
            });
            const closeBtn = overlay.querySelector('.modal-close-btn');
            if (closeBtn) closeBtn.addEventListener('click', close);
        }

        // Close on Escape
        const escHandler = (e) => {
            if (e.key === 'Escape' && closable) {
                close();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);

        document.body.appendChild(overlay);

        return { overlay, modal: overlay.querySelector('.glass-modal'), close };
    },

    /**
     * Show confirmation dialog
     * @param {string} title
     * @param {string} message
     * @param {Object} [options]
     * @returns {Promise<boolean>}
     */
    confirm(title, message, options = {}) {
        return new Promise((resolve) => {
            this.createModal({
                title,
                content: `<p style="color:var(--color-text-secondary)">${Helpers.escapeHtml(message)}</p>`,
                actions: [
                    {
                        label: options.cancelText || 'Hủy',
                        type: 'secondary',
                        onClick: () => resolve(false)
                    },
                    {
                        label: options.confirmText || 'Xác nhận',
                        type: options.danger ? 'danger' : 'primary',
                        onClick: () => resolve(true)
                    }
                ]
            });
        });
    },

    /**
     * Show loading overlay
     * @param {string} [message='Đang xử lý...']
     * @returns {Function} dismiss function
     */
    showLoading(message = 'Đang xử lý...') {
        const overlay = document.createElement('div');
        overlay.className = 'glass-overlay';
        overlay.style.cursor = 'wait';
        overlay.innerHTML = `
            <div style="text-align:center;color:var(--color-text);">
                <span class="material-icons-round" style="font-size:48px;animation:spin 1s linear infinite;color:var(--color-primary);">sync</span>
                <p style="margin-top:var(--spacing-md);color:var(--color-text-secondary)">${Helpers.escapeHtml(message)}</p>
            </div>
        `;
        document.body.appendChild(overlay);

        return () => {
            overlay.style.opacity = '0';
            setTimeout(() => overlay.remove(), 250);
        };
    }
};


export default Components;
