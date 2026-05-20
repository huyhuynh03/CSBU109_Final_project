// ============================================
// Push Notification Manager
// ============================================
// Quản lý FCM token, permission, và notification settings.
// Sử dụng Firebase Cloud Messaging (compat SDK).

const PushNotificationManager = {
    _messaging: null,
    _currentToken: null,
    _isSupported: false,

    // VAPID key từ Firebase Console > Cloud Messaging > Web Push certificates
    // Sẽ được set sau khi generate từ Firebase Console
    VAPID_KEY: 'BLCynPD4ZtTRsmNsGOV7vUS81BWl5mwTEgSNVnrrbsUh6Dh1J_AWjyl8RRR5yBlypC7kptbF5SfJ-RBClS3D_p4',

    /**
     * Khởi tạo Push Manager
     * Gọi sau khi Firebase đã init xong
     */
    async init() {
        try {
            // Check browser support
            if (!('Notification' in window)) {
                console.log('[PushManager] Notifications not supported');
                this._isSupported = false;
                return;
            }

            if (!('serviceWorker' in navigator)) {
                console.log('[PushManager] Service Worker not supported');
                this._isSupported = false;
                return;
            }

            // Check if firebase.messaging is available
            if (!firebase.messaging) {
                console.log('[PushManager] Firebase Messaging SDK not loaded');
                this._isSupported = false;
                return;
            }

            this._messaging = firebase.messaging();
            this._isSupported = true;

            // Nếu đã có permission, refresh token
            if (Notification.permission === 'granted') {
                await this._refreshToken();
            }

            // Listen for foreground messages
            this._messaging.onMessage((payload) => {
                console.log('[PushManager] Foreground message:', payload);
                this._showForegroundNotification(payload);
            });

            console.log('[PushManager] Initialized successfully');
        } catch (err) {
            console.warn('[PushManager] Init error:', err);
            this._isSupported = false;
        }
    },

    /**
     * Kiểm tra browser có hỗ trợ push notification không
     */
    isSupported() {
        return this._isSupported;
    },

    /**
     * Lấy trạng thái permission hiện tại
     * @returns {'granted'|'denied'|'default'|'unsupported'}
     */
    getPermissionStatus() {
        if (!('Notification' in window)) return 'unsupported';
        return Notification.permission;
    },

    /**
     * Request notification permission và lấy FCM token
     * @returns {boolean} true nếu thành công
     */
    async requestPermission() {
        if (!this._isSupported) {
            Toast.error('Trình duyệt không hỗ trợ thông báo');
            return false;
        }

        try {
            const permission = await Notification.requestPermission();
            console.log('[PushManager] Permission result:', permission);

            if (permission !== 'granted') {
                Toast.warning('Bạn đã từ chối quyền thông báo', 'Vào cài đặt trình duyệt để bật lại');
                return false;
            }

            // Lấy FCM token
            const token = await this._getToken();
            if (!token) {
                Toast.error('Không thể đăng ký thông báo', 'Vui lòng thử lại');
                return false;
            }

            // Lưu token vào Firestore
            await this._saveTokenToFirestore(token);
            this._currentToken = token;

            return true;
        } catch (err) {
            console.error('[PushManager] requestPermission error:', err);
            Toast.error('Lỗi đăng ký thông báo', err.message);
            return false;
        }
    },

    /**
     * Lấy FCM token từ Firebase Messaging
     * @returns {string|null}
     */
    async _getToken() {
        try {
            // Register firebase-messaging-sw.js explicitly với scope đúng
            // để FCM SDK dùng đúng SW có onBackgroundMessage handler.
            let registration;
            try {
                registration = await navigator.serviceWorker.register(
                    '/firebase-messaging-sw.js',
                    { scope: '/firebase-cloud-messaging-push-scope' }
                );
                // Đợi SW active
                if (registration.installing) {
                    await new Promise((resolve) => {
                        registration.installing.addEventListener('statechange', (e) => {
                            if (e.target.state === 'activated') resolve();
                        });
                    });
                }
                console.log('[PushManager] FCM SW registered, scope:', registration.scope);
            } catch (regErr) {
                console.warn('[PushManager] FCM SW register failed, fallback to ready:', regErr);
                registration = await navigator.serviceWorker.ready;
            }

            const token = await this._messaging.getToken({
                vapidKey: this.VAPID_KEY,
                serviceWorkerRegistration: registration
            });

            if (token) {
                console.log('[PushManager] FCM Token obtained');
                return token;
            }

            console.warn('[PushManager] No token available');
            return null;
        } catch (err) {
            console.error('[PushManager] getToken error:', err);
            return null;
        }
    },

    /**
     * Refresh token (gọi khi app khởi động nếu đã có permission)
     */
    async _refreshToken() {
        try {
            const token = await this._getToken();
            if (token && token !== this._currentToken) {
                await this._saveTokenToFirestore(token);
                this._currentToken = token;
                console.log('[PushManager] Token refreshed');
            }
        } catch (err) {
            console.warn('[PushManager] Token refresh failed:', err);
        }
    },

    /**
     * Lưu FCM token vào Firestore
     * Collection: users/{uid}/devices/{tokenHash}
     */
    async _saveTokenToFirestore(token) {
        const user = auth.currentUser;
        if (!user) {
            console.warn('[PushManager] No user logged in, cannot save token');
            return;
        }

        const tokenHash = await this._hashToken(token);
        const platform = this._detectPlatform();

        const deviceData = {
            token: token,
            platform: platform.os,
            browser: platform.browser,
            lastActive: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        try {
            const docRef = db.collection('users').doc(user.uid)
                .collection('devices').doc(tokenHash);

            const doc = await docRef.get();
            if (doc.exists) {
                // Update lastActive
                await docRef.update({
                    token: token,
                    lastActive: firebase.firestore.FieldValue.serverTimestamp()
                });
            } else {
                // New device
                deviceData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                await docRef.set(deviceData);
            }

            console.log('[PushManager] Token saved to Firestore');
        } catch (err) {
            console.error('[PushManager] Save token error:', err);
        }
    },

    /**
     * Xóa token khỏi Firestore (khi user tắt notification)
     */
    async removeToken() {
        if (!this._currentToken) return;

        const user = auth.currentUser;
        if (!user) return;

        try {
            // Xóa token khỏi FCM
            await this._messaging.deleteToken();

            // Xóa khỏi Firestore
            const tokenHash = await this._hashToken(this._currentToken);
            await db.collection('users').doc(user.uid)
                .collection('devices').doc(tokenHash).delete();

            this._currentToken = null;
            console.log('[PushManager] Token removed');
        } catch (err) {
            console.error('[PushManager] Remove token error:', err);
        }
    },

    /**
     * Lưu notification settings vào Firestore.
     * Schema mới: { enabled, timezone } — không còn reminderTime (gửi bất kỳ lúc nào có cards due).
     */
    async saveSettings(settings) {
        const user = auth.currentUser;
        if (!user) return;

        try {
            await db.collection('users').doc(user.uid).set({
                notificationSettings: {
                    enabled: settings.enabled,
                    timezone: settings.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                }
            }, { merge: true });

            console.log('[PushManager] Settings saved');
        } catch (err) {
            console.error('[PushManager] Save settings error:', err);
        }
    },

    /**
     * Đọc notification settings từ Firestore
     * @returns {Object|null}
     */
    async getSettings() {
        const user = auth.currentUser;
        if (!user) return null;

        try {
            const doc = await db.collection('users').doc(user.uid).get();
            if (doc.exists) {
                return doc.data().notificationSettings || null;
            }
            return null;
        } catch (err) {
            console.error('[PushManager] Get settings error:', err);
            return null;
        }
    },

    /**
     * Hiển thị notification khi app ở foreground (in-app toast).
     * Body cố định, không tiết lộ số lượng / từ cụ thể.
     */
    _showForegroundNotification(payload) {
        const notification = payload.notification || {};

        const title = notification.title || 'LinguaFlash';
        const body = notification.body || 'Có từ cần ôn tập 📚';

        if (typeof Toast !== 'undefined') {
            Toast.info(title, body);
        }
    },

    /**
     * Tự động bật notification cho user mới.
     * Chỉ chạy khi:
     *   - User đã đăng nhập
     *   - Browser hỗ trợ notification
     *   - Permission state = 'default' (chưa hỏi lần nào)
     *   - User chưa có settings trong Firestore
     *
     * Logic: gọi requestPermission() → nếu user grant → save enabled=true.
     * Nếu user deny → silent skip, không retry (tránh annoy).
     */
    async autoEnableForNewUser() {
        if (!this._isSupported) return false;
        if (!auth.currentUser) return false;
        if (Notification.permission !== 'default') return false;

        try {
            const existingSettings = await this.getSettings();
            if (existingSettings) {
                // User đã có settings (đã từng tắt/bật) → respect lựa chọn cũ
                return false;
            }

            console.log('[PushManager] Auto-enabling notifications for new user');
            const granted = await this.requestPermission();
            if (granted) {
                await this.saveSettings({
                    enabled: true,
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
                });
                console.log('[PushManager] Auto-enabled successfully');
                return true;
            }
        } catch (err) {
            console.warn('[PushManager] autoEnableForNewUser error:', err);
        }
        return false;
    },

    /**
     * Hash token để dùng làm document ID (tránh token quá dài)
     */
    async _hashToken(token) {
        const encoder = new TextEncoder();
        const data = encoder.encode(token);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 32);
    },

    /**
     * Detect platform và browser
     */
    _detectPlatform() {
        const ua = navigator.userAgent;
        let os = 'unknown';
        let browser = 'unknown';

        // Detect OS
        if (/Android/i.test(ua)) os = 'android';
        else if (/iPad|iPhone|iPod/.test(ua)) os = 'ios';
        else if (/Macintosh|Mac OS X/.test(ua)) os = 'macos';
        else if (/Windows/.test(ua)) os = 'windows';
        else if (/Linux/.test(ua)) os = 'linux';

        // Detect Browser
        if (/Edg\//i.test(ua)) browser = 'edge';
        else if (/Chrome/i.test(ua)) browser = 'chrome';
        else if (/Safari/i.test(ua)) browser = 'safari';
        else if (/Firefox/i.test(ua)) browser = 'firefox';

        return { os, browser };
    }
};
