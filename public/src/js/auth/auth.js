// ============================================
// Auth Module - Firebase Authentication
// ============================================

const Auth = {
    currentUser: null,
    _redirectResultHandled: false,
    _redirectResultPromise: null,

    /**
     * Initialize auth listener
     */
    init() {
        auth.onAuthStateChanged((user) => {
            this.currentUser = user;
            this._updateUI(user);
            console.log('[Auth] State changed:', user ? user.email : 'signed out');

            // Chạy migration FSRS một lần (idempotent) khi user đăng nhập
            if (user && typeof FsrsMigration !== 'undefined') {
                FsrsMigration.run().catch(e => console.error('[Auth] FsrsMigration error:', e));
            }
        });

        // Bắt đầu xử lý redirect result (lưu promise để waitForInitialAuth có thể await)
        this._redirectResultPromise = this._handleRedirectResult();
    },

    /**
     * Detect mobile or PWA standalone mode (popup không hoạt động ổn định ở các môi trường này).
     * @returns {boolean}
     * @private
     */
    _shouldUseRedirect() {
        try {
            const ua = (navigator.userAgent || '').toLowerCase();
            const isMobile = /android|iphone|ipad|ipod|mobile|blackberry|iemobile|opera mini/i.test(ua);
            const isStandalone =
                (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
                window.navigator.standalone === true;
            return isMobile || isStandalone;
        } catch {
            return false;
        }
    },

    /**
     * Xử lý kết quả khi quay lại từ Google redirect sign-in.
     * @private
     */
    async _handleRedirectResult() {
        if (this._redirectResultHandled) return;
        this._redirectResultHandled = true;
        console.log('[Auth] _handleRedirectResult: starting check...');
        try {
            // Đảm bảo persistence đã sẵn sàng trước khi gọi getRedirectResult
            if (typeof authPersistenceReady !== 'undefined') {
                try { await authPersistenceReady; } catch {}
            }
            console.log('[Auth] _handleRedirectResult: calling getRedirectResult');
            const result = await auth.getRedirectResult();
            console.log('[Auth] _handleRedirectResult: result =', {
                hasUser: !!(result && result.user),
                userEmail: result && result.user ? result.user.email : null,
                providerId: result ? result.providerId : null,
                hasCredential: !!(result && result.credential),
                operationType: result ? result.operationType : null
            });
            if (result && result.user) {
                this.currentUser = result.user;
                console.log('[Auth] Redirect sign-in success:', result.user.email);
                Toast.success('Đăng nhập thành công!', `Chào ${result.user.displayName || result.user.email}`);
                // Lưu profile và điều hướng về trang chủ
                try {
                    if (typeof FirestoreDB !== 'undefined') {
                        await FirestoreDB.saveUserProfile(result.user);
                    }
                } catch (e) {
                    console.warn('[Auth] saveUserProfile after redirect failed:', e);
                }
                if (typeof Router !== 'undefined' && Router.getPath && Router.getPath() === '/auth') {
                    Router.navigate('/');
                }
            } else {
                console.log('[Auth] _handleRedirectResult: no pending redirect (normal page load)');
            }
        } catch (error) {
            console.error('[Auth] getRedirectResult error:', error.code || 'unknown', error.message || error);
            if (error && error.code && error.code !== 'auth/no-auth-event') {
                // Hiển thị lỗi cụ thể cho user, đặc biệt là auth/unauthorized-domain
                if (error.code === 'auth/unauthorized-domain') {
                    Toast.error(
                        'Lỗi cấu hình',
                        'Domain chưa được cấp phép trong Firebase Console. Liên hệ admin.'
                    );
                } else {
                    this._handleError(error);
                }
            }
        }
    },

    /**
     * Đợi Firebase khôi phục auth state lần đầu (khi reload trang).
     * Trả về Promise resolve với user (hoặc null nếu chưa đăng nhập).
     * Quan trọng để tránh race condition: render trang trước khi auth state restored.
     */
    async waitForInitialAuth() {
        // Đảm bảo persistence được set trước (tránh race khi reload lần đầu).
        if (typeof authPersistenceReady !== 'undefined') {
            try { await authPersistenceReady; } catch {}
        }
        // Đợi xử lý redirect result hoàn tất (nếu đang quay lại từ Google redirect sign-in)
        if (this._redirectResultPromise) {
            try { await this._redirectResultPromise; } catch {}
        }
        return new Promise((resolve) => {
            const unsub = auth.onAuthStateChanged((user) => {
                this.currentUser = user;
                unsub();
                resolve(user);
            });
        });
    },

    /**
     * Sign up with email and password
     * @param {string} email
     * @param {string} password
     * @param {string} displayName
     */
    async signUp(email, password, displayName) {
        try {
            const result = await auth.createUserWithEmailAndPassword(email, password);
            await result.user.updateProfile({ displayName });
            await result.user.sendEmailVerification();
            Toast.success('Đăng ký thành công!', 'Vui lòng kiểm tra email (kể cả thư mục Spam) để xác thực tài khoản.');
            return result.user;
        } catch (error) {
            this._handleError(error);
            throw error;
        }
    },

    /**
     * Sign in with email and password
     * @param {string} email
     * @param {string} password
     */
    async signIn(email, password) {
        try {
            const result = await auth.signInWithEmailAndPassword(email, password);
            // Cập nhật currentUser ngay lập tức để tránh race condition trên Android PWA:
            // (onAuthStateChanged có thể fire chậm, dẫn đến HomePage redirect ngược về /auth)
            this.currentUser = result.user;
            Toast.success('Đăng nhập thành công!', `Chào ${result.user.displayName || result.user.email}`);
            return result.user;
        } catch (error) {
            this._handleError(error);
            throw error;
        }
    },

    /**
     * Sign in with Google.
     * Trên mobile/PWA standalone (Android/iOS), dùng redirect thay vì popup vì popup thường bị
     * browser chặn hoặc mất context khi quay lại app.
     */
    async signInWithGoogle() {
        const provider = new firebase.auth.GoogleAuthProvider();
        // Đảm bảo persistence đã sẵn sàng trước khi gọi signIn (quan trọng để giữ session
        // qua redirect/reload trên Android)
        if (typeof authPersistenceReady !== 'undefined') {
            try { await authPersistenceReady; } catch {}
        }
        const useRedirect = this._shouldUseRedirect();
        console.log('[Auth] signInWithGoogle: useRedirect =', useRedirect, 'UA:', navigator.userAgent);
        try {
            if (useRedirect) {
                // Redirect flow: trang sẽ rời khỏi app rồi quay lại;
                // _handleRedirectResult() trong init() sẽ xử lý kết quả khi quay lại.
                console.log('[Auth] Calling signInWithRedirect...');
                await auth.signInWithRedirect(provider);
                // Promise dưới đây không bao giờ resolve trên cùng phiên (page sẽ navigate đi).
                return new Promise(() => {});
            }
            console.log('[Auth] Calling signInWithPopup...');
            const result = await auth.signInWithPopup(provider);
            this.currentUser = result.user;
            console.log('[Auth] Popup sign-in success:', result.user.email);
            Toast.success('Đăng nhập thành công!', `Chào ${result.user.displayName}`);
            return result.user;
        } catch (error) {
            console.error('[Auth] signInWithGoogle error:', error.code || 'unknown', error.message || error);
            // Nếu popup bị chặn, tự động fallback sang redirect
            if (error && (error.code === 'auth/popup-blocked' || error.code === 'auth/operation-not-supported-in-this-environment')) {
                console.warn('[Auth] Popup blocked, falling back to redirect');
                try {
                    await auth.signInWithRedirect(provider);
                    return new Promise(() => {});
                } catch (e2) {
                    this._handleError(e2);
                    throw e2;
                }
            }
            // Hiển thị thông báo cụ thể nếu domain chưa cấp phép
            if (error && error.code === 'auth/unauthorized-domain') {
                Toast.error(
                    'Lỗi cấu hình',
                    'Domain chưa được cấp phép trong Firebase Console. Liên hệ admin.'
                );
            } else {
                this._handleError(error);
            }
            throw error;
        }
    },

    /**
     * Sign out
     */
    async signOut() {
        try {
            await auth.signOut();
            Toast.info('Đã đăng xuất');
            Router.navigate('/');
        } catch (error) {
            Toast.error('Lỗi đăng xuất', error.message);
        }
    },

    /**
     * Send password reset email
     * @param {string} email
     */
    async resetPassword(email) {
        try {
            await auth.sendPasswordResetEmail(email);
            Toast.success('Đã gửi email', 'Kiểm tra hộp thư để đặt lại mật khẩu.');
        } catch (error) {
            this._handleError(error);
            throw error;
        }
    },

    /**
     * Change password (requires recent sign-in)
     * @param {string} currentPassword
     * @param {string} newPassword
     */
    async changePassword(currentPassword, newPassword) {
        try {
            const user = auth.currentUser;
            if (!user || !user.email) throw new Error('Chưa đăng nhập');

            // Re-authenticate
            const credential = firebase.auth.EmailAuthProvider.credential(user.email, currentPassword);
            await user.reauthenticateWithCredential(credential);

            // Update password
            await user.updatePassword(newPassword);
            Toast.success('Đổi mật khẩu thành công!');
        } catch (error) {
            this._handleError(error);
            throw error;
        }
    },

    /**
     * Delete account with re-authentication
     * @param {string} [password] - Required for email/password users
     */
    async deleteAccount(password) {
        try {
            const user = auth.currentUser;
            if (!user) throw new Error('Chưa đăng nhập');

            const isEmailUser = user.providerData.some(p => p.providerId === 'password');
            const isGoogleUser = user.providerData.some(p => p.providerId === 'google.com');

            // Re-authenticate before deletion
            if (isEmailUser) {
                if (!password) throw new Error('Cần nhập mật khẩu để xác thực');
                const credential = firebase.auth.EmailAuthProvider.credential(user.email, password);
                await user.reauthenticateWithCredential(credential);
            } else if (isGoogleUser) {
                const provider = new firebase.auth.GoogleAuthProvider();
                await user.reauthenticateWithPopup(provider);
            }

            // Delete user data from Firestore first
            await FirestoreDB.deleteUserData(user.uid);

            // Delete Firebase auth account
            await user.delete();
            Toast.info('Tài khoản đã bị xóa');
            Router.navigate('/');
        } catch (error) {
            if (error.code === 'auth/wrong-password') {
                Toast.error('Sai mật khẩu', 'Mật khẩu xác thực không đúng.');
            } else if (error.code === 'auth/requires-recent-login') {
                Toast.error('Cần đăng nhập lại', 'Vui lòng đăng nhập lại trước khi xóa tài khoản.');
            } else if (error.code === 'auth/popup-closed-by-user') {
                Toast.warning('Đã hủy', 'Bạn đã đóng cửa sổ xác thực Google.');
            } else {
                this._handleError(error);
            }
            throw error;
        }
    },

    /**
     * Check if user is signed in
     * @returns {boolean}
     */
    isSignedIn() {
        return !!this.currentUser;
    },

    /**
     * Get current user ID
     * @returns {string|null}
     */
    getUserId() {
        return this.currentUser ? this.currentUser.uid : null;
    },

    /**
     * Update header UI based on auth state
     * @private
     */
    _updateUI(user) {
        const btnAuth = document.getElementById('btn-auth');
        const userAvatar = document.getElementById('user-avatar');
        const avatarImg = document.getElementById('avatar-img');

        if (user) {
            // Signed in
            if (btnAuth) btnAuth.style.display = 'none';
            if (userAvatar) {
                userAvatar.style.display = 'block';
                if (avatarImg) {
                    avatarImg.src = user.photoURL || this._generateAvatarUrl(user.displayName || user.email);
                }
            }

            // Update menu info
            const menuAvatar = document.getElementById('menu-avatar');
            const menuName = document.getElementById('menu-user-name');
            const menuEmail = document.getElementById('menu-user-email');
            if (menuAvatar) menuAvatar.src = user.photoURL || this._generateAvatarUrl(user.displayName || user.email);
            if (menuName) menuName.textContent = user.displayName || 'Người dùng';
            if (menuEmail) menuEmail.textContent = user.email;

            // Refresh sidebar to show auth-required items
            if (typeof Sidebar !== 'undefined') {
                Sidebar.refresh();
            }

            // Re-render current page when auth state changes
            // (skip /auth page to avoid redirect loop)
            // Quan trọng: chỉ re-route nếu Router đã init (mainContent != null) — tránh
            // TypeError 'Cannot read properties of null (reading classList)' khi callback
            // onAuthStateChanged chạy trước Router.init() lần đầu.
            if (Router && Router.mainContent) {
                const currentPath = Router.getPath();
                if (currentPath !== '/auth') {
                    Router._handleRoute();
                }
            }
        } else {
            // Signed out
            if (btnAuth) btnAuth.style.display = 'flex';
            if (userAvatar) userAvatar.style.display = 'none';

            // Refresh sidebar to hide auth-required items
            if (typeof Sidebar !== 'undefined') {
                Sidebar.refresh();
            }
        }
    },

    /**
     * Generate avatar URL from name
     * @private
     */
    _generateAvatarUrl(name) {
        const initial = (name || '?').charAt(0).toUpperCase();
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#6C63FF';
        ctx.fillRect(0, 0, 64, 64);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 32px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(initial, 32, 32);
        return canvas.toDataURL();
    },

    /**
     * Handle Firebase auth errors with Vietnamese messages
     * @private
     */
    _handleError(error) {
        const messages = {
            'auth/email-already-in-use': 'Email này đã được sử dụng.',
            'auth/invalid-email': 'Email không hợp lệ.',
            'auth/operation-not-allowed': 'Phương thức đăng nhập chưa được bật.',
            'auth/weak-password': 'Mật khẩu quá yếu (tối thiểu 6 ký tự).',
            'auth/user-disabled': 'Tài khoản đã bị vô hiệu hóa.',
            'auth/user-not-found': 'Không tìm thấy tài khoản với email này.',
            'auth/wrong-password': 'Sai mật khẩu.',
            'auth/too-many-requests': 'Quá nhiều lần thử. Vui lòng thử lại sau.',
            'auth/popup-closed-by-user': 'Cửa sổ đăng nhập đã bị đóng.',
            'auth/requires-recent-login': 'Cần đăng nhập lại để thực hiện thao tác này.',
            'auth/invalid-credential': 'Thông tin đăng nhập không hợp lệ.',
            'auth/network-request-failed': 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet và thử lại.'
        };

        const msg = messages[error.code] || error.message;
        Toast.error('Lỗi xác thực', msg);
    }
};
