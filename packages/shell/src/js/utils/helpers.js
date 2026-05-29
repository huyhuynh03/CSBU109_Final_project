// ============================================
// Utility Helpers
// ============================================

const Helpers = {
    /**
     * Generate a unique ID
     * @returns {string}
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    },

    /**
     * Debounce function
     * @param {Function} fn
     * @param {number} delay
     * @returns {Function}
     */
    debounce(fn, delay = 300) {
        let timer;
        return function (...args) {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), delay);
        };
    },

    /**
     * Throttle function
     * @param {Function} fn
     * @param {number} limit
     * @returns {Function}
     */
    throttle(fn, limit = 300) {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                fn.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * Escape HTML to prevent XSS
     * @param {string} str
     * @returns {string}
     */
    escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    /**
     * Format date to locale string
     * @param {Date|Object} date - Date object or Firestore timestamp
     * @returns {string}
     */
    formatDate(date) {
        if (!date) return '';
        // Handle Firestore timestamp
        if (date.toDate) date = date.toDate();
        if (typeof date === 'number') date = new Date(date);
        return new Intl.DateTimeFormat('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).format(date);
    },

    /**
     * Format relative time (e.g., "2 phút trước")
     * @param {Date|Object} date
     * @returns {string}
     */
    formatRelativeTime(date) {
        if (!date) return '';
        if (date.toDate) date = date.toDate();
        if (typeof date === 'number') date = new Date(date);

        const now = new Date();
        const diff = now - date;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (seconds < 60) return 'Vừa xong';
        if (minutes < 60) return `${minutes} phút trước`;
        if (hours < 24) return `${hours} giờ trước`;
        if (days < 7) return `${days} ngày trước`;
        return Helpers.formatDate(date);
    },

    /**
     * Compare strings case-insensitive (for vocabulary matching)
     * @param {string} a
     * @param {string} b
     * @returns {boolean}
     */
    compareIgnoreCase(a, b) {
        if (!a || !b) return false;
        return a.trim().toLowerCase() === b.trim().toLowerCase();
    },

    /**
     * Compare strings with fuzzy matching (ignore extra spaces, punctuation)
     * @param {string} input - User's input
     * @param {string} answer - Correct answer
     * @returns {boolean}
     */
    fuzzyCompare(input, answer) {
        if (!input || !answer) return false;
        const normalize = (str) => str
            .trim()
            .toLowerCase()
            .replace(/[.,!?;:'"()\-]/g, '')  // Remove punctuation
            .replace(/\s+/g, ' ');             // Normalize spaces
        return normalize(input) === normalize(answer);
    },

    /**
     * Wait for milliseconds
     * @param {number} ms
     * @returns {Promise}
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    /**
     * Safe JSON parse
     * @param {string} str
     * @param {*} fallback
     * @returns {*}
     */
    jsonParse(str, fallback = null) {
        try {
            return JSON.parse(str);
        } catch {
            return fallback;
        }
    },

    /**
     * Local storage helpers with JSON support
     */
    storage: {
        get(key, fallback = null) {
            try {
                const val = localStorage.getItem(key);
                return val !== null ? JSON.parse(val) : fallback;
            } catch {
                return fallback;
            }
        },
        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
            } catch (e) {
                console.warn('[Storage] Failed to save:', e);
            }
        },
        remove(key) {
            localStorage.removeItem(key);
        }
    },

    /**
     * Create DOM element with attributes and children
     * @param {string} tag
     * @param {Object} attrs
     * @param {...(string|Node)} children
     * @returns {HTMLElement}
     */
    createElement(tag, attrs = {}, ...children) {
        const el = document.createElement(tag);
        for (const [key, value] of Object.entries(attrs)) {
            if (key === 'className') {
                el.className = value;
            } else if (key === 'style' && typeof value === 'object') {
                Object.assign(el.style, value);
            } else if (key.startsWith('on') && typeof value === 'function') {
                el.addEventListener(key.slice(2).toLowerCase(), value);
            } else if (key === 'dataset') {
                Object.assign(el.dataset, value);
            } else {
                el.setAttribute(key, value);
            }
        }
        children.forEach(child => {
            if (typeof child === 'string') {
                el.appendChild(document.createTextNode(child));
            } else if (child instanceof Node) {
                el.appendChild(child);
            }
        });
        return el;
    }
};


export default Helpers;
