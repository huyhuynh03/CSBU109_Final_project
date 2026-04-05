// ============================================
// Account Page - Quản lý tài khoản
// ============================================

const AccountPage = {
    render() {
        const user = Auth.currentUser;
        if (!user) {
            return `
                <div class="page-enter" style="text-align:center;padding:var(--spacing-2xl);">
                    <span class="material-icons-round" style="font-size:64px;color:var(--color-text-muted);">lock</span>
                    <h3 style="margin-top:var(--spacing-md);">Chưa đăng nhập</h3>
                    <p style="color:var(--color-text-secondary);margin-bottom:var(--spacing-lg);">Vui lòng đăng nhập để xem thông tin tài khoản.</p>
                    <button class="btn btn-primary" onclick="Router.navigate('/auth')">
                        <span class="material-icons-round">login</span> Đăng nhập
                    </button>
                </div>
            `;
        }

        const isEmailUser = user.providerData.some(p => p.providerId === 'password');
        const isGoogleUser = user.providerData.some(p => p.providerId === 'google.com');
        const providerLabel = isGoogleUser ? 'Google' : 'Email / Mật khẩu';
        const providerIcon = isGoogleUser ? 'g_mobiledata' : 'email';

        return `
            <div class="account-page page-enter">
                <h2 style="margin-bottom:var(--spacing-xl);">
                    <span class="material-icons-round" style="vertical-align:middle;margin-right:var(--spacing-sm);">manage_accounts</span>
                    Tài khoản
                </h2>

                <!-- Thông tin tài khoản -->
                <div class="glass-card" style="margin-bottom:var(--spacing-lg);">
                    <h4 style="margin-bottom:var(--spacing-md);">Thông tin cá nhân</h4>
                    <div style="display:flex;align-items:center;gap:var(--spacing-lg);margin-bottom:var(--spacing-md);">
                        <div style="width:64px;height:64px;border-radius:50%;overflow:hidden;flex-shrink:0;border:2px solid var(--color-primary);">
                            <img src="${user.photoURL || Auth._generateAvatarUrl(user.displayName || user.email)}" 
                                 alt="Avatar" 
                                 style="width:100%;height:100%;object-fit:cover;">
                        </div>
                        <div>
                            <p style="font-weight:600;font-size:var(--font-size-lg);color:var(--color-text);">
                                ${Helpers.escapeHtml(user.displayName || 'Người dùng')}
                            </p>
                            <p style="font-size:var(--font-size-sm);color:var(--color-text-secondary);">
                                ${Helpers.escapeHtml(user.email)}
                            </p>
                        </div>
                    </div>
                    <div style="display:flex;flex-wrap:wrap;gap:var(--spacing-md);font-size:var(--font-size-sm);color:var(--color-text-muted);">
                        <div style="display:flex;align-items:center;gap:var(--spacing-xs);">
                            <span class="material-icons-round" style="font-size:16px;">${providerIcon}</span>
                            <span>Đăng nhập bằng: ${providerLabel}</span>
                        </div>
                        <div style="display:flex;align-items:center;gap:var(--spacing-xs);">
                            <span class="material-icons-round" style="font-size:16px;">verified_user</span>
                            <span>Email ${user.emailVerified ? 'đã xác thực ✅' : 'chưa xác thực ⚠️'}</span>
                        </div>
                    </div>
                </div>

                <!-- Đổi mật khẩu -->
                ${isEmailUser ? `
                <div class="glass-card" style="margin-bottom:var(--spacing-lg);">
                    <h4 style="margin-bottom:var(--spacing-md);">Đổi mật khẩu</h4>
                    <div class="form-group">
                        <label class="form-label">Mật khẩu hiện tại</label>
                        <input type="password" id="acc-current-password" class="form-input" placeholder="Nhập mật khẩu hiện tại">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Mật khẩu mới</label>
                        <input type="password" id="acc-new-password" class="form-input" placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Xác nhận mật khẩu mới</label>
                        <input type="password" id="acc-confirm-password" class="form-input" placeholder="Nhập lại mật khẩu mới">
                    </div>
                    <button class="btn btn-primary btn-sm" onclick="AccountPage.changePassword()">
                        <span class="material-icons-round" style="font-size:16px;">lock</span> Đổi mật khẩu
                    </button>
                </div>
                ` : `
                <div class="glass-card" style="margin-bottom:var(--spacing-lg);">
                    <h4 style="margin-bottom:var(--spacing-md);">Đổi mật khẩu</h4>
                    <p style="font-size:var(--font-size-sm);color:var(--color-text-muted);">
                        <span class="material-icons-round" style="font-size:16px;vertical-align:middle;">info</span>
                        Tài khoản đăng nhập bằng Google không hỗ trợ đổi mật khẩu tại đây. 
                        Bạn có thể đổi mật khẩu Google tại 
                        <a href="https://myaccount.google.com/security" target="_blank" style="color:var(--color-primary);">myaccount.google.com</a>.
                    </p>
                </div>
                `}

                <!-- Xóa tài khoản -->
                <div class="glass-card" style="border:1px solid var(--color-danger);">
                    <h4 style="margin-bottom:var(--spacing-md);color:var(--color-danger);">
                        <span class="material-icons-round" style="vertical-align:middle;margin-right:var(--spacing-xs);">warning</span>
                        Vùng nguy hiểm
                    </h4>
                    <p style="font-size:var(--font-size-sm);color:var(--color-text-secondary);margin-bottom:var(--spacing-md);">
                        Xóa tài khoản sẽ xóa toàn bộ dữ liệu học tập của bạn. 
                        Hành động này <strong>không thể hoàn tác</strong>.
                    </p>
                    <button class="btn btn-danger btn-sm" onclick="AccountPage.deleteAccount()">
                        <span class="material-icons-round" style="font-size:16px;">delete_forever</span> Xóa tài khoản
                    </button>
                </div>

                <div style="margin-top:var(--spacing-xl);">
                    <button class="btn btn-ghost" onclick="Router.navigate('/')">
                        <span class="material-icons-round">arrow_back</span>
                        Quay lại trang chính
                    </button>
                </div>
            </div>
        `;
    },

    onEnter() {
        if (!Auth.isSignedIn()) {
            Router.navigate('/auth');
            return;
        }
        console.log('[AccountPage] Entered');
    },

    async changePassword() {
        const current = document.getElementById('acc-current-password').value;
        const newPass = document.getElementById('acc-new-password').value;
        const confirm = document.getElementById('acc-confirm-password').value;

        if (!current || !newPass || !confirm) {
            Toast.warning('Vui lòng điền đầy đủ thông tin');
            return;
        }
        if (newPass.length < 6) {
            Toast.warning('Mật khẩu mới phải có ít nhất 6 ký tự');
            return;
        }
        if (newPass !== confirm) {
            Toast.warning('Mật khẩu xác nhận không khớp');
            return;
        }
        try {
            await Auth.changePassword(current, newPass);
            // Clear fields on success
            document.getElementById('acc-current-password').value = '';
            document.getElementById('acc-new-password').value = '';
            document.getElementById('acc-confirm-password').value = '';
        } catch (e) {
            // Error already handled in Auth module
        }
    },

    async deleteAccount() {
        const confirmed = await Components.confirm(
            'Xóa tài khoản',
            'Bạn có chắc chắn muốn xóa tài khoản? Tất cả dữ liệu học tập sẽ bị mất vĩnh viễn và không thể khôi phục.',
            { confirmText: 'Xóa tài khoản', cancelText: 'Hủy', danger: true }
        );

        if (confirmed) {
            try {
                await Auth.deleteAccount();
            } catch (e) {
                // Error already handled
            }
        }
    }
};
