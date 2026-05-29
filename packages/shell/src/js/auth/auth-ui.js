// ============================================
// Auth UI - Login/Register page components
// ============================================
// Will be fully implemented in Phase 3

const AuthUI = {
    /**
     * Setup auth UI event listeners
     */
    init() {
        // Auth button click → navigate to auth page
        const btnAuth = document.getElementById('btn-auth');
        if (btnAuth) {
            btnAuth.addEventListener('click', () => {
                Router.navigate('/auth');
            });
        }

        // User avatar click → toggle user menu
        const userAvatar = document.getElementById('user-avatar');
        const userMenu = document.getElementById('user-menu');
        if (userAvatar && userMenu) {
            userAvatar.addEventListener('click', (e) => {
                e.stopPropagation();
                const isVisible = userMenu.style.display !== 'none';
                userMenu.style.display = isVisible ? 'none' : 'block';
            });

            // Close menu on outside click
            document.addEventListener('click', (e) => {
                if (!userMenu.contains(e.target) && !userAvatar.contains(e.target)) {
                    userMenu.style.display = 'none';
                }
            });
        }

        // Menu item actions
        const menuItems = document.querySelectorAll('.menu-item[data-action]');
        menuItems.forEach(item => {
            item.addEventListener('click', () => {
                const action = item.dataset.action;
                userMenu.style.display = 'none';
                this._handleMenuAction(action);
            });
        });

        console.log('[AuthUI] Initialized');
    },

    /**
     * Handle menu item actions
     * @private
     */
    _handleMenuAction(action) {
        switch (action) {
            case 'account':
                Router.navigate('/account');
                break;
            case 'settings':
                Router.navigate('/settings');
                break;
            case 'logout':
                Auth.signOut();
                break;
        }
    },

    /**
     * Show change password modal
     * @private
     */
    _showChangePasswordModal() {
        const content = document.createElement('div');
        content.innerHTML = `
            <div class="form-group">
                <label class="form-label">Mật khẩu hiện tại</label>
                <input type="password" id="current-password" class="form-input" placeholder="Nhập mật khẩu hiện tại">
            </div>
            <div class="form-group">
                <label class="form-label">Mật khẩu mới</label>
                <input type="password" id="new-password" class="form-input" placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)">
            </div>
            <div class="form-group">
                <label class="form-label">Xác nhận mật khẩu mới</label>
                <input type="password" id="confirm-password" class="form-input" placeholder="Nhập lại mật khẩu mới">
            </div>
        `;

        Components.createModal({
            title: 'Đổi mật khẩu',
            content,
            actions: [
                { label: 'Hủy', type: 'secondary' },
                {
                    label: 'Đổi mật khẩu',
                    type: 'primary',
                    closeOnClick: false,
                    onClick: async () => {
                        const current = document.getElementById('current-password').value;
                        const newPass = document.getElementById('new-password').value;
                        const confirm = document.getElementById('confirm-password').value;

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
                        } catch (e) {
                            // Error already handled in Auth module
                        }
                    }
                }
            ]
        });
    },

    /**
     * Show delete account modal with re-authentication
     * @private
     */
    async _showDeleteAccountModal() {
        const user = Auth.currentUser;
        if (!user) return;

        const isEmailUser = user.providerData.some(p => p.providerId === 'password');

        if (isEmailUser) {
            // Email users: require password re-entry
            Components.createModal({
                title: '⚠️ Xóa tài khoản',
                content: `
                    <p style="color:var(--color-text-secondary);margin-bottom:var(--spacing-md);">
                        Hành động này sẽ <strong style="color:var(--color-danger);">xóa vĩnh viễn</strong> tài khoản và toàn bộ dữ liệu.
                        Không thể hoàn tác.
                    </p>
                    <div class="form-group">
                        <label class="form-label">Nhập mật khẩu để xác nhận</label>
                        <input type="password" id="delete-acc-password-menu" class="form-input" placeholder="Nhập mật khẩu hiện tại">
                    </div>
                `,
                actions: [
                    { label: 'Hủy', type: 'secondary', onClick: () => {} },
                    {
                        label: 'Xóa tài khoản',
                        type: 'danger',
                        onClick: async () => {
                            const password = document.getElementById('delete-acc-password-menu').value;
                            if (!password) {
                                Toast.warning('Vui lòng nhập mật khẩu để xác nhận');
                                return;
                            }
                            try {
                                await Auth.deleteAccount(password);
                            } catch (e) {
                                // Error already handled in Auth module
                            }
                        }
                    }
                ]
            });
        } else {
            // Google users: confirm then re-auth via popup
            const confirmed = await Components.confirm(
                '⚠️ Xóa tài khoản',
                'Hành động này sẽ xóa vĩnh viễn tài khoản và toàn bộ dữ liệu. Bạn sẽ cần xác thực lại bằng Google để xác nhận.',
                { confirmText: 'Xác thực & Xóa', cancelText: 'Hủy', danger: true }
            );
            if (confirmed) {
                try {
                    await Auth.deleteAccount();
                } catch (e) {
                    // Error already handled
                }
            }
        }
    }
};


export default AuthUI;
