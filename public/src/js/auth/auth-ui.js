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
            case 'settings':
                Router.navigate('/settings');
                break;
            case 'change-password':
                this._showChangePasswordModal();
                break;
            case 'delete-account':
                this._showDeleteAccountModal();
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
     * Show delete account modal
     * @private
     */
    async _showDeleteAccountModal() {
        const confirmed = await Components.confirm(
            'Xóa tài khoản',
            'Bạn có chắc chắn muốn xóa tài khoản? Tất cả dữ liệu sẽ bị mất vĩnh viễn và không thể khôi phục.',
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
