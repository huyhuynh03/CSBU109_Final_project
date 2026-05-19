// ============================================
// Service Worker Update Manager
// ============================================
// Quản lý vòng đời update của Service Worker phía main thread:
//   - Đăng ký SW
//   - Định kỳ kiểm tra bản mới
//   - So sánh APP_VERSION giữa SW cũ và mới (tránh false positive khi
//     browser nghĩ là có update nhưng APP_VERSION thực không đổi —
//     ví dụ Vercel CDN serve khác bytes do whitespace / edge node khác nhau)
//   - Hiển thị toast "Có bản mới — Tải lại" CHỈ khi version thực sự đổi
//   - Reload sau khi user xác nhận
//
// Dùng kèm với public/sw.js (đã hỗ trợ message {type:'SKIP_WAITING'}
// và {type:'GET_VERSION'}).

const SwUpdate = {
    // Cấu hình
    SW_URL: '/sw.js',
    FCM_SW_URL: '/firebase-messaging-sw.js',
    CHECK_INTERVAL_MS: 60 * 60 * 1000, // 60 phút
    VERSION_QUERY_TIMEOUT_MS: 2000,

    _refreshing: false,
    _registration: null,

    /**
     * Khởi tạo: đăng ký SW + thiết lập listeners.
     * Nên gọi một lần sau khi DOM ready (App.init).
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

        // Đăng ký main SW
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

        // Đăng ký FCM SW (cho push notifications) — không quản update flow
        navigator.serviceWorker.register(this.FCM_SW_URL)
            .then((reg) => console.log('[SwUpdate] FCM SW registered, scope:', reg.scope))
            .catch((err) => console.error('[SwUpdate] FCM SW registration failed:', err));
    },

    /**
     * Xử lý 1 SW registration: detect waiting / installing.
     */
    _handleRegistration(reg) {
        // Trường hợp: load page và đã có SW waiting sẵn (deploy giữa lúc user offline rồi vào lại)
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
                // Khi cài xong và đã có controller cũ → đây CÓ THỂ là update.
                // Cần verify bằng cách so APP_VERSION trước khi show toast,
                // tránh false positive khi browser thấy bytes khác nhưng version giống.
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
        // Check ngay khi user quay lại tab
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this._checkForUpdate(reg);
            }
        });

        // Check định kỳ
        setInterval(() => {
            if (document.visibilityState === 'visible') {
                this._checkForUpdate(reg);
            }
        }, this.CHECK_INTERVAL_MS);

        // Check khi browser back online
        window.addEventListener('online', () => {
            this._checkForUpdate(reg);
        });
    },

    _checkForUpdate(reg) {
        if (!reg) return;
        reg.update().catch((err) => {
            // update() có thể fail khi offline - không phải lỗi nghiêm trọng
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
     * Nếu version giống → đây là false positive (Vercel CDN bytes khác
     * nhưng nội dung không đổi) → silent skip.
     */
    async _maybeShowUpdateToast(reg) {
        const newSw = reg.waiting || reg.installing;
        const oldSw = navigator.serviceWorker.controller;

        if (!newSw || !oldSw) {
            // Không đủ điều kiện, fallback show toast
            this._showUpdateToast(reg);
            return;
        }

        const [newVer, oldVer] = await Promise.all([
            this._getVersionFromSw(newSw),
            this._getVersionFromSw(oldSw)
        ]);

        console.log(`[SwUpdate] Version check: old=${oldVer || '?'} new=${newVer || '?'}`);

        // Trường hợp 1: cả hai trả version GIỐNG NHAU → false positive (CDN bytes diff)
        // → silent skip + auto activate SW mới để dọn dẹp.
        if (newVer && oldVer && newVer === oldVer) {
            console.log('[SwUpdate] Same APP_VERSION - silent skip toast, auto-activating new SW');
            if (reg.waiting) {
                this._refreshing = true;
                reg.waiting.postMessage({ type: 'SKIP_WAITING' });
                setTimeout(() => { this._refreshing = false; }, 2000);
            }
            return;
        }

        // Trường hợp 2: oldVer null (SW cũ là phiên bản trước khi có GET_VERSION handler)
        // → đây là update LỚN từ legacy SW lên SW mới → MUST show toast (1 lần thôi,
        // sau khi user reload, SW mới sẽ có handler GET_VERSION → từ đó hết false positive).
        if (!oldVer && newVer) {
            console.log('[SwUpdate] Legacy SW detected (no GET_VERSION) - showing update toast');
            this._showUpdateToast(reg);
            return;
        }

        // Trường hợp 3: version khác nhau rõ ràng → update thật → show toast
        this._showUpdateToast(reg);
    },

    /**
     * Hiện toast yêu cầu user reload để áp dụng bản mới.
     */
    _showUpdateToast(reg) {
        const waiting = reg.waiting;
        if (!waiting) return;

        if (typeof Toast === 'undefined' || !Toast.show) {
            // Fallback: tự reload sau 3s nếu không có Toast
            console.warn('[SwUpdate] Toast not available - auto reload in 3s');
            setTimeout(() => this._applyUpdate(reg), 3000);
            return;
        }

        Toast.show({
            type: 'info',
            title: '✨ Có bản cập nhật mới',
            message: 'Bấm Tải lại để áp dụng phiên bản mới nhất.',
            duration: 0, // persistent
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
     *
     * Thêm fallback: trên Android PWA standalone, controllerchange đôi khi
     * không fire sau skipWaiting → cần force reload sau timeout.
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
        // Android Chrome PWA standalone đôi khi không trigger controllerchange.
        setTimeout(() => {
            if (!this._refreshing) {
                console.warn('[SwUpdate] controllerchange did not fire - force reloading');
                this._forceReload();
            }
        }, 2000);
    },

    /**
     * Force page reload, bypass HTTP cache nếu có thể.
     */
    _forceReload() {
        this._refreshing = true; // prevent double reload from controllerchange
        try {
            // Một số trình duyệt hỗ trợ reload(true) để bypass cache (deprecated trong spec
            // nhưng vẫn có hiệu lực thực tế trên Chrome/Firefox).
            window.location.reload(true);
        } catch (e) {
            window.location.reload();
        }
    },

    /**
     * Public API: cho phép code khác trigger check update thủ công.
     */
    checkNow() {
        if (this._registration) {
            this._checkForUpdate(this._registration);
        }
    },

    /**
     * Lấy APP_VERSION của Service Worker đang điều khiển page.
     * @returns {Promise<string|null>} version string hoặc null nếu chưa có SW / SW cũ không hỗ trợ
     */
    async getCurrentVersion() {
        const sw = navigator.serviceWorker?.controller;
        if (!sw) return null;
        return await this._getVersionFromSw(sw);
    }
};

window.SwUpdate = SwUpdate;
