// ============================================
// Service Worker Update Manager
// ============================================
// Quản lý vòng đời update của Service Worker phía main thread:
//   - Đăng ký SW
//   - Định kỳ kiểm tra bản mới
//   - Hiển thị toast "Có bản mới — Tải lại" khi SW mới sẵn sàng
//   - Reload sau khi user xác nhận
//
// Dùng kèm với public/sw.js (đã hỗ trợ message {type:'SKIP_WAITING'}).

const SwUpdate = {
    // Cấu hình
    SW_URL: '/sw.js',
    FCM_SW_URL: '/firebase-messaging-sw.js',
    CHECK_INTERVAL_MS: 60 * 60 * 1000, // 60 phút

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
            this._showUpdateToast(reg);
        }

        // Listen sự kiện updatefound khi browser tải SW mới
        reg.addEventListener('updatefound', () => {
            const newSw = reg.installing;
            if (!newSw) return;
            console.log('[SwUpdate] New SW found, state:', newSw.state);

            newSw.addEventListener('statechange', () => {
                console.log('[SwUpdate] New SW state:', newSw.state);
                // Khi cài xong và đã có controller cũ → đây là update thật (không phải lần đầu)
                if (newSw.state === 'installed' && navigator.serviceWorker.controller) {
                    this._showUpdateToast(reg);
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
                    // Đóng toast trước cho mượt
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
        if (waiting) {
            waiting.postMessage({ type: 'SKIP_WAITING' });
        } else {
            // Không có waiting (lạ) → reload thẳng
            window.location.reload();
        }
    },

    /**
     * Public API: cho phép code khác trigger check update thủ công
     * (ví dụ trong Settings page có nút "Kiểm tra cập nhật")
     */
    checkNow() {
        if (this._registration) {
            this._checkForUpdate(this._registration);
        }
    }
};

window.SwUpdate = SwUpdate;
