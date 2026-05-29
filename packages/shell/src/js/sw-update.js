// ============================================
// Service Worker Update Manager
// ============================================
// Quản lý vòng đời update của Service Worker phía main thread:
//   - Đăng ký SW
//   - Cleanup FCM SW cũ nếu nó đang chiếm scope / (bug từ bản trước)
//   - Định kỳ kiểm tra bản mới
//   - So sánh APP_VERSION giữa SW cũ và mới (tránh false positive)
//   - Hiển thị toast "Có bản mới — Tải lại" CHỈ khi version thực sự đổi
//   - Reload sau khi user xác nhận
//
// Dùng kèm với public/sw.js (hỗ trợ message {type:'SKIP_WAITING'}
// và {type:'GET_VERSION'}).
//
// QUAN TRỌNG: KHÔNG register firebase-messaging-sw.js ở đây!
// Firebase Messaging SDK tự register nó với scope riêng
// (/firebase-cloud-messaging-push-scope) khi gọi getToken().
// Register thủ công tại scope / sẽ THAY THẾ main SW → phá GET_VERSION.

const SwUpdate = {
    // Cấu hình
    SW_URL: '/sw.js',
    CHECK_INTERVAL_MS: 60 * 60 * 1000, // 60 phút
    VERSION_QUERY_TIMEOUT_MS: 2000,

    _refreshing: false,
    _registration: null,

    /**
     * Khởi tạo: đăng ký SW + thiết lập listeners.
     * Nên gọi một lần sau khi DOM ready.
     */
    init() {
        if (!('serviceWorker' in navigator)) {
            console.log('[SwUpdate] Service Worker không hỗ trợ trên trình duyệt này');
            return;
        }

        // Reload toàn page khi controller mới active (sau SKIP_WAITING)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (this._refreshing) return;
            this._refreshing = true;
            console.log('[SwUpdate] Controller changed - reloading...');
            window.location.reload();
        });

        // Cleanup: unregister FCM SW cũ nếu nó đang chiếm scope / (bug từ bản trước).
        this._cleanupStaleRegistrations();

        // Đăng ký main SW (scope /)
        navigator.serviceWorker.register(this.SW_URL)
            .then((reg) => {
                console.log('[SwUpdate] SW registered, scope:', reg.scope);
                this._registration = reg;
                this._handleRegistration(reg);
                this._setupAutoCheck(reg);
            })
            .catch((err) => {
                console.error('[SwUpdate] SW registration failed:', err);
            });
    },

    /**
     * Cleanup: tìm và unregister bất kỳ SW nào đăng ký tại scope / mà KHÔNG phải sw.js.
     * Đây là hậu quả của bug cũ (register firebase-messaging-sw.js tại scope /).
     */
    async _cleanupStaleRegistrations() {
        try {
            const registrations = await navigator.serviceWorker.getRegistrations();
            for (const reg of registrations) {
                // Chỉ xử lý root scope
                const scopeUrl = new URL(reg.scope);
                if (scopeUrl.pathname !== '/') continue;

                // Check active SW script URL — nếu là firebase-messaging-sw.js → unregister
                const activeSw = reg.active || reg.waiting || reg.installing;
                if (activeSw && activeSw.scriptURL && activeSw.scriptURL.includes('firebase-messaging-sw')) {
                    console.warn('[SwUpdate] Found stale FCM SW at root scope - unregistering:', activeSw.scriptURL);
                    await reg.unregister();
                    console.log('[SwUpdate] Stale FCM SW unregistered successfully');
                }
            }
        } catch (err) {
            console.debug('[SwUpdate] Cleanup error (non-critical):', err.message);
        }
    },

    /**
     * Xử lý 1 SW registration: detect waiting / installing.
     */
    _handleRegistration(reg) {
        // Trường hợp: load page và đã có SW waiting sẵn
        if (reg.waiting && navigator.serviceWorker.controller) {
            this._maybeShowUpdateToast(reg);
        }

        // Listen sự kiện updatefound khi browser tải SW mới
        reg.addEventListener('updatefound', () => {
            const newSw = reg.installing;
            if (!newSw) return;
            console.log('[SwUpdate] New SW found, state:', newSw.state);

            newSw.addEventListener('statechange', () => {
                console.log('[SwUpdate] New SW state:', newSw.state);
                if (newSw.state === 'installed' && navigator.serviceWorker.controller) {
                    this._maybeShowUpdateToast(reg);
                }
            });
        });
    },

    /**
     * Định kỳ check update khi tab visible.
     */
    _setupAutoCheck(reg) {
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this._checkForUpdate(reg);
            }
        });

        setInterval(() => {
            if (document.visibilityState === 'visible') {
                this._checkForUpdate(reg);
            }
        }, this.CHECK_INTERVAL_MS);

        window.addEventListener('online', () => {
            this._checkForUpdate(reg);
        });
    },

    _checkForUpdate(reg) {
        if (!reg) return;
        reg.update().catch((err) => {
            console.debug('[SwUpdate] update() failed:', err.message);
        });
    },

    /**
     * Hỏi SW một version qua MessageChannel.
     * Trả về null nếu timeout / SW không response.
     */
    _getVersionFromSw(sw) {
        return new Promise((resolve) => {
            if (!sw) return resolve(null);
            try {
                const channel = new MessageChannel();
                const timer = setTimeout(() => resolve(null), this.VERSION_QUERY_TIMEOUT_MS);
                channel.port1.onmessage = (event) => {
                    clearTimeout(timer);
                    resolve(event.data && event.data.version ? event.data.version : null);
                };
                sw.postMessage({ type: 'GET_VERSION' }, [channel.port2]);
            } catch (err) {
                console.debug('[SwUpdate] postMessage failed:', err.message);
                resolve(null);
            }
        });
    },

    /**
     * Show toast NẾU SW mới có APP_VERSION khác SW cũ.
     */
    async _maybeShowUpdateToast(reg) {
        const newSw = reg.waiting || reg.installing;
        const oldSw = navigator.serviceWorker.controller;

        if (!newSw || !oldSw) {
            this._showUpdateToast(reg);
            return;
        }

        const [newVer, oldVer] = await Promise.all([
            this._getVersionFromSw(newSw),
            this._getVersionFromSw(oldSw)
        ]);

        console.log(`[SwUpdate] Version check: old=${oldVer || '?'} new=${newVer || '?'}`);

        // Case 1: cả hai trả version GIỐNG NHAU → false positive (CDN bytes diff)
        if (newVer && oldVer && newVer === oldVer) {
            console.log('[SwUpdate] Same APP_VERSION - silent skip toast, auto-activating new SW');
            if (reg.waiting) {
                this._refreshing = true;
                reg.waiting.postMessage({ type: 'SKIP_WAITING' });
                setTimeout(() => { this._refreshing = false; }, 2000);
            }
            return;
        }

        // Case 2: oldVer null nhưng newVer có → controller hiện tại không phải main SW
        // (có thể là FCM SW cũ chiếm scope, hoặc SW legacy chưa có GET_VERSION).
        // Sau cleanup, lần reload tiếp theo main SW sẽ là controller → hết vấn đề.
        // Tạm thời: silent skip + force activate SW mới (có GET_VERSION) để fix ngay.
        if (!oldVer && newVer) {
            console.log('[SwUpdate] Controller has no GET_VERSION - auto-activating new SW silently');
            if (reg.waiting) {
                this._refreshing = true;
                reg.waiting.postMessage({ type: 'SKIP_WAITING' });
                // Cho phép reload lần này để main SW trở thành controller
                setTimeout(() => { this._refreshing = false; }, 100);
            }
            return;
        }

        // Case 3: cả hai null → không xác định được → silent skip (tránh spam toast)
        if (!oldVer && !newVer) {
            console.log('[SwUpdate] Both versions unknown - silent skip');
            if (reg.waiting) {
                this._refreshing = true;
                reg.waiting.postMessage({ type: 'SKIP_WAITING' });
                setTimeout(() => { this._refreshing = false; }, 2000);
            }
            return;
        }

        // Case 4: version khác nhau rõ ràng → update thật → show toast
        this._showUpdateToast(reg);
    },

    /**
     * Hiện toast yêu cầu user reload để áp dụng bản mới.
     */
    _showUpdateToast(reg) {
        const waiting = reg.waiting;
        if (!waiting) return;

        if (typeof Toast === 'undefined' || !Toast.show) {
            console.warn('[SwUpdate] Toast not available - auto reload in 3s');
            setTimeout(() => this._applyUpdate(reg), 3000);
            return;
        }

        Toast.show({
            type: 'info',
            title: '✨ Có bản cập nhật mới',
            message: 'Bấm Tải lại để áp dụng phiên bản mới nhất.',
            duration: 0,
            id: 'sw-update-available',
            action: {
                label: 'Tải lại',
                onClick: (toastEl) => {
                    Toast.dismiss(toastEl);
                    this._applyUpdate(reg);
                }
            }
        });
    },

    /**
     * Yêu cầu SW mới skip waiting → trigger controllerchange → reload.
     */
    _applyUpdate(reg) {
        const waiting = reg.waiting;

        if (!waiting) {
            console.log('[SwUpdate] No waiting SW, force reload');
            this._forceReload();
            return;
        }

        console.log('[SwUpdate] Posting SKIP_WAITING to new SW');
        waiting.postMessage({ type: 'SKIP_WAITING' });

        // Fallback: nếu controllerchange không fire trong 2s, force reload.
        setTimeout(() => {
            if (!this._refreshing) {
                console.warn('[SwUpdate] controllerchange did not fire - force reloading');
                this._forceReload();
            }
        }, 2000);
    },

    /**
     * Force page reload.
     */
    _forceReload() {
        this._refreshing = true;
        try {
            window.location.reload(true);
        } catch (e) {
            window.location.reload();
        }
    },

    /**
     * Public API: trigger check update thủ công.
     */
    checkNow() {
        if (this._registration) {
            this._checkForUpdate(this._registration);
        }
    },

    /**
     * Lấy APP_VERSION của Service Worker đang điều khiển page.
     * @returns {Promise<string|null>}
     */
    async getCurrentVersion() {
        const sw = navigator.serviceWorker && navigator.serviceWorker.controller;
        if (!sw) return null;
        return await this._getVersionFromSw(sw);
    }
};

window.SwUpdate = SwUpdate;


export default SwUpdate;
