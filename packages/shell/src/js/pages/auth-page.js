// ============================================
// Auth Page - Login / Register
// ============================================

const AuthPage = {
    mode: 'login', // 'login' | 'register' | 'reset'

    render() {
        return `
            <div class="auth-page page-enter" style="max-width:440px;margin:var(--spacing-2xl) auto;">
                <div class="glass-card" style="padding:var(--spacing-xl);">
                    <div style="text-align:center;margin-bottom:var(--spacing-xl);display:flex;flex-direction:column;align-items:center;">
                        <img src="/icons/icon-192.png" alt="LinguaFlash" style="width:96px;height:96px;max-width:none;border-radius:16px;">
                        <h2 class="brand-text" style="margin-top:var(--spacing-sm);">LinguaFlash</h2>
                        <p style="color:var(--color-text-muted);font-size:var(--font-size-sm);">Học và ôn tập thông minh</p>
                    </div>

                    <!-- Tab switch -->
                    <div id="auth-tabs" style="display:flex;gap:var(--spacing-sm);margin-bottom:var(--spacing-lg);">
                        <button class="btn btn-full ${this.mode === 'login' ? 'btn-primary' : 'btn-secondary'}" 
                                onclick="AuthPage.switchMode('login')">Đăng nhập</button>
                        <button class="btn btn-full ${this.mode === 'register' ? 'btn-primary' : 'btn-secondary'}" 
                                onclick="AuthPage.switchMode('register')">Đăng ký</button>
                    </div>

                    <!-- Form -->
                    <form id="auth-form" onsubmit="AuthPage.handleSubmit(event)">
                        ${this.mode === 'register' ? `
                        <div class="form-group">
                            <label class="form-label">Tên hiển thị</label>
                            <div class="input-group">
                                <span class="material-icons-round input-icon">person</span>
                                <input type="text" id="auth-name" class="form-input" placeholder="Nhập tên của bạn" required>
                            </div>
                        </div>
                        ` : ''}

                        <div class="form-group">
                            <label class="form-label">Email</label>
                            <div class="input-group">
                                <span class="material-icons-round input-icon">email</span>
                                <input type="email" id="auth-email" class="form-input" placeholder="email@example.com" required>
                            </div>
                        </div>

                        ${this.mode !== 'reset' ? `
                        <div class="form-group">
                            <label class="form-label">Mật khẩu</label>
                            <div class="input-group">
                                <span class="material-icons-round input-icon">lock</span>
                                <input type="password" id="auth-password" class="form-input" 
                                       placeholder="${this.mode === 'register' ? 'Tối thiểu 6 ký tự' : 'Nhập mật khẩu'}" 
                                       required minlength="6">
                                <button type="button" class="input-action icon-btn" onclick="AuthPage.togglePasswordVisibility()" aria-label="Hiện/ẩn">
                                    <span class="material-icons-round" style="font-size:20px;">visibility</span>
                                </button>
                            </div>
                        </div>

                        ${this.mode === 'register' ? `
                        <div class="form-group">
                            <label class="form-label">Xác nhận mật khẩu</label>
                            <div class="input-group">
                                <span class="material-icons-round input-icon">lock</span>
                                <input type="password" id="auth-confirm" class="form-input" placeholder="Nhập lại mật khẩu" required minlength="6">
                            </div>
                        </div>
                        ` : ''}
                        ` : ''}

                        <button type="submit" id="auth-submit" class="btn btn-primary btn-full btn-lg" style="margin-top:var(--spacing-md);">
                            ${this.mode === 'login' ? 'Đăng nhập' : this.mode === 'register' ? 'Đăng ký' : 'Gửi email đặt lại'}
                        </button>
                    </form>

                    ${this.mode === 'login' ? `
                    <p style="text-align:center;margin-top:var(--spacing-md);">
                        <a href="#" onclick="AuthPage.switchMode('reset');return false;" 
                           style="color:var(--color-primary);font-size:var(--font-size-sm);">Quên mật khẩu?</a>
                    </p>
                    ` : ''}

                    ${this.mode === 'reset' ? `
                    <p style="text-align:center;margin-top:var(--spacing-md);">
                        <a href="#" onclick="AuthPage.switchMode('login');return false;" 
                           style="color:var(--color-primary);font-size:var(--font-size-sm);">← Quay lại đăng nhập</a>
                    </p>
                    ` : ''}

                    <!-- Google Sign-in -->
                    ${this.mode !== 'reset' ? `
                    <div class="divider">
                        <span class="divider-text">hoặc</span>
                    </div>

                    <button class="btn btn-secondary btn-full" onclick="AuthPage.signInWithGoogle()" 
                            style="display:flex;align-items:center;justify-content:center;gap:var(--spacing-sm);">
                        <svg width="18" height="18" viewBox="0 0 48 48">
                            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
                        </svg>
                        Đăng nhập với Google
                    </button>
                    ` : ''}
                </div>

                <!-- PWA Install button - hiển thị bên ngoài card, dưới form -->
                <div id="auth-install-btn" style="text-align:center;margin-top:var(--spacing-lg);display:none;">
                    <button class="btn btn-secondary" onclick="PWAInstall.install()"
                            style="display:inline-flex;align-items:center;gap:var(--spacing-sm);padding:var(--spacing-sm) var(--spacing-lg);border-radius:var(--radius-full);">
                        <span class="material-icons-round" style="font-size:20px;">download</span>
                        Cài đặt ứng dụng
                    </button>
                </div>
            </div>
        `;
    },

    onEnter() {
        // If already signed in, redirect to home
        if (Auth.isSignedIn()) {
            Router.navigate('/');
        }
        // Show install button if app is not yet installed
        this._showInstallButton();
        console.log('[AuthPage] Entered, mode:', this.mode);
    },

    _showInstallButton() {
        const btn = document.getElementById('auth-install-btn');
        if (!btn) return;
        // Show if not already installed as standalone
        if (typeof PWAInstall !== 'undefined' && !PWAInstall._isInstalled) {
            btn.style.display = 'block';
        } else {
            btn.style.display = 'none';
        }
    },

    switchMode(mode) {
        this.mode = mode;
        const content = this.render();
        document.getElementById('main-content').innerHTML = content;
    },

    togglePasswordVisibility() {
        const input = document.getElementById('auth-password');
        const icon = input.parentElement.querySelector('.input-action .material-icons-round');
        if (input.type === 'password') {
            input.type = 'text';
            icon.textContent = 'visibility_off';
        } else {
            input.type = 'password';
            icon.textContent = 'visibility';
        }
    },

    async handleSubmit(e) {
        e.preventDefault();
        const submitBtn = document.getElementById('auth-submit');
        submitBtn.classList.add('btn-loading');

        try {
            if (this.mode === 'login') {
                const email = document.getElementById('auth-email').value.trim();
                const password = document.getElementById('auth-password').value;
                await Auth.signIn(email, password);
                Router.navigate('/');

            } else if (this.mode === 'register') {
                const name = document.getElementById('auth-name').value.trim();
                const email = document.getElementById('auth-email').value.trim();
                const password = document.getElementById('auth-password').value;
                const confirm = document.getElementById('auth-confirm').value;

                if (password !== confirm) {
                    Toast.warning('Mật khẩu xác nhận không khớp');
                    return;
                }

                const user = await Auth.signUp(email, password, name);
                await FirestoreDB.saveUserProfile(user);
                
                // Show email verification notice instead of navigating home
                this._showVerificationNotice(email);
                return;

            } else if (this.mode === 'reset') {
                const email = document.getElementById('auth-email').value.trim();
                await Auth.resetPassword(email);
                this.switchMode('login');
            }
        } catch (error) {
            // Errors already handled in Auth module
        } finally {
            submitBtn.classList.remove('btn-loading');
        }
    },

    async signInWithGoogle() {
        try {
            const user = await Auth.signInWithGoogle();
            await FirestoreDB.saveUserProfile(user);
            Router.navigate('/');
        } catch (error) {
            // Error already handled
        }
    },

    /**
     * Show email verification notice after registration
     * @param {string} email
     * @private
     */
    _showVerificationNotice(email) {
        const content = document.getElementById('main-content');
        content.innerHTML = `
            <div class="auth-page page-enter" style="max-width:440px;margin:var(--spacing-2xl) auto;">
                <div class="glass-card" style="padding:var(--spacing-xl);text-align:center;">
                    <span class="material-icons-round" style="font-size:64px;color:var(--color-primary);">mark_email_read</span>
                    <h2 style="margin-top:var(--spacing-md);margin-bottom:var(--spacing-sm);">Xác thực email</h2>
                    <p style="color:var(--color-text-secondary);margin-bottom:var(--spacing-md);">
                        Chúng tôi đã gửi email xác thực đến <strong style="color:var(--color-text);">${Helpers.escapeHtml(email)}</strong>.
                        Vui lòng nhấn vào liên kết trong email để hoàn tất đăng ký.
                    </p>
                    
                    <!-- Cảnh báo kiểm tra spam -->
                    <div style="background:rgba(255,193,7,0.1);border:1px solid rgba(255,193,7,0.3);border-radius:var(--radius-md);padding:var(--spacing-md);margin-bottom:var(--spacing-lg);text-align:left;">
                        <div style="display:flex;align-items:flex-start;gap:var(--spacing-sm);">
                            <span class="material-icons-round" style="color:#FFC107;font-size:20px;flex-shrink:0;margin-top:2px;">warning</span>
                            <div style="font-size:var(--font-size-sm);color:var(--color-text-secondary);">
                                <strong style="color:var(--color-text);">Không thấy email?</strong><br>
                                • Kiểm tra thư mục <strong>Spam / Thư rác</strong><br>
                                • Email gửi từ <em>noreply@linguaflash-f5591.firebaseapp.com</em><br>
                                • Nếu email nằm trong Spam, hãy đánh dấu <strong>"Không phải thư rác"</strong>
                            </div>
                        </div>
                    </div>

                    <div style="display:flex;flex-direction:column;gap:var(--spacing-sm);">
                        <button class="btn btn-primary btn-full" onclick="AuthPage.switchMode('login')">
                            <span class="material-icons-round">login</span> Đăng nhập
                        </button>
                        <button class="btn btn-secondary btn-full" onclick="AuthPage.resendVerification()">
                            <span class="material-icons-round">send</span> Gửi lại email xác thực
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Resend email verification
     */
    async resendVerification() {
        try {
            const user = auth.currentUser;
            if (user && !user.emailVerified) {
                await user.sendEmailVerification();
                Toast.success('Đã gửi lại email xác thực!', 'Vui lòng kiểm tra hộp thư, kể cả thư mục Spam.');
            } else {
                Toast.info('Email đã được xác thực hoặc chưa đăng nhập.');
            }
        } catch (error) {
            if (error.code === 'auth/too-many-requests') {
                Toast.warning('Quá nhiều yêu cầu', 'Vui lòng đợi một lát trước khi gửi lại.');
            } else {
                Toast.error('Lỗi', error.message);
            }
        }
    }
};


export default AuthPage;
