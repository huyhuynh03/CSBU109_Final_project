// ============================================
// Settings Page
// ============================================

const SettingsPage = {
    render() {
        const currentTheme = ThemeManager.currentTheme;
        const themeIcon = ThemeManager.getIcon();
        const themeLabel = ThemeManager.getLabel();

        return `
            <div class="settings-page page-enter">
                <h2 style="margin-bottom:var(--spacing-xl);">
                    <span class="material-icons-round" style="vertical-align:middle;margin-right:var(--spacing-sm);">settings</span>
                    Cài đặt
                </h2>

                <!-- Theme Settings -->
                <div class="glass-card" style="margin-bottom:var(--spacing-lg);">
                    <h4 style="margin-bottom:var(--spacing-md);">Giao diện</h4>
                    <div class="settings-theme-row" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--spacing-md);">
                        <div style="display:flex;align-items:center;gap:var(--spacing-sm);">
                            <span class="material-icons-round" style="color:var(--color-primary);">${themeIcon}</span>
                            <div>
                                <p style="font-weight:500;color:var(--color-text);white-space:nowrap;">Chế độ hiển thị</p>
                                <p style="font-size:var(--font-size-sm);color:var(--color-text-muted);white-space:nowrap;">Hiện tại: ${themeLabel}</p>
                            </div>
                        </div>
                        <div style="display:flex;gap:var(--spacing-xs);flex-wrap:wrap;">
                            <button class="btn btn-sm ${currentTheme === 'light' ? 'btn-primary' : 'btn-secondary'}"
                                    onclick="SettingsPage.setTheme('light')">
                                <span class="material-icons-round" style="font-size:16px;">light_mode</span> Sáng
                            </button>
                            <button class="btn btn-sm ${currentTheme === 'dark' ? 'btn-primary' : 'btn-secondary'}"
                                    onclick="SettingsPage.setTheme('dark')">
                                <span class="material-icons-round" style="font-size:16px;">dark_mode</span> Tối
                            </button>
                            <button class="btn btn-sm ${currentTheme === 'system' ? 'btn-primary' : 'btn-secondary'}"
                                    onclick="SettingsPage.setTheme('system')">
                                <span class="material-icons-round" style="font-size:16px;">settings_brightness</span> Tự động
                            </button>
                        </div>
                    </div>
                </div>

                <!-- AI API Key Settings -->
                <div class="glass-card" style="margin-bottom:var(--spacing-lg);">
                    <h4 style="margin-bottom:var(--spacing-md);">Trợ lý AI</h4>
                    <div class="form-group" style="margin-bottom:0;">
                        <label class="form-label">API Key (Gemini / OpenAI)</label>
                        <div class="input-group">
                            <span class="material-icons-round input-icon">key</span>
                            <input type="password" id="api-key-input" class="form-input" 
                                   placeholder="Nhập API key của bạn..." 
                                   style="padding-left:44px;">
                            <button class="input-action icon-btn" onclick="SettingsPage.toggleApiKeyVisibility()" aria-label="Hiện/ẩn">
                                <span class="material-icons-round" style="font-size:20px;">visibility</span>
                            </button>
                        </div>
                        <span class="form-hint">API key được lưu cục bộ trên thiết bị, không gửi lên server.</span>
                    </div>
                    <button class="btn btn-primary btn-sm" style="margin-top:var(--spacing-md);" onclick="SettingsPage.saveApiKey()">
                        <span class="material-icons-round" style="font-size:16px;">save</span> Lưu API Key
                    </button>
                </div>

                <!-- App Version & Update Check -->
                <div class="glass-card" style="margin-bottom:var(--spacing-lg);">
                    <h4 style="margin-bottom:var(--spacing-md);">
                        <span class="material-icons-round" style="vertical-align:middle;margin-right:var(--spacing-xs);color:var(--color-primary);">info</span>
                        Phiên bản ứng dụng
                    </h4>
                    <div style="display:flex;align-items:center;justify-content:space-between;gap:var(--spacing-md);flex-wrap:wrap;">
                        <div style="display:flex;align-items:center;gap:var(--spacing-md);">
                            <span class="material-icons-round" style="color:var(--color-secondary);">verified</span>
                            <div>
                                <p style="font-weight:500;color:var(--color-text);">LinguaFlash</p>
                                <p style="font-size:var(--font-size-sm);color:var(--color-text-muted);">
                                    Phiên bản: <strong id="app-version-label">đang tải...</strong>
                                </p>
                                <p id="app-version-status" style="font-size:var(--font-size-xs);color:var(--color-text-muted);margin-top:2px;"></p>
                            </div>
                        </div>
                        <button class="btn btn-secondary btn-sm" id="btn-check-update" onclick="SettingsPage.checkUpdate()">
                            <span class="material-icons-round" style="font-size:16px;">refresh</span>
                            Kiểm tra cập nhật
                        </button>
                    </div>
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

    async onEnter() {
        // Load saved API key
        const savedKey = Helpers.storage.get('linguaflash-api-key', '');
        const input = document.getElementById('api-key-input');
        if (input && savedKey) {
            input.value = savedKey;
        }

        // Load app version từ Service Worker
        await this._loadAppVersion();

        console.log('[SettingsPage] Entered');
    },

    /**
     * Lấy APP_VERSION từ Service Worker đang chạy và hiển thị.
     */
    async _loadAppVersion() {
        const label = document.getElementById('app-version-label');
        const status = document.getElementById('app-version-status');
        if (!label) return;

        try {
            if (typeof SwUpdate === 'undefined' || !SwUpdate.getCurrentVersion) {
                label.textContent = '—';
                if (status) status.textContent = 'Service Worker chưa khởi tạo';
                return;
            }

            const version = await SwUpdate.getCurrentVersion();
            if (version) {
                label.textContent = `v${version}`;
                if (status) {
                    status.textContent = 'Phiên bản đang chạy trên thiết bị này';
                    status.style.color = 'var(--color-success)';
                }
            } else {
                label.textContent = '—';
                if (status) {
                    status.textContent = 'Không lấy được version (SW cũ hoặc chưa active)';
                    status.style.color = 'var(--color-warning)';
                }
            }
        } catch (err) {
            console.warn('[SettingsPage] Load app version error:', err);
            label.textContent = 'lỗi';
        }
    },

    /**
     * Trigger check update thủ công.
     */
    async checkUpdate() {
        const btn = document.getElementById('btn-check-update');
        const status = document.getElementById('app-version-status');

        if (typeof SwUpdate === 'undefined' || !SwUpdate.checkNow) {
            Toast.warning('Không hỗ trợ', 'Service Worker chưa sẵn sàng');
            return;
        }

        if (btn) {
            btn.disabled = true;
            btn.style.opacity = '0.6';
        }
        if (status) {
            status.textContent = 'Đang kiểm tra...';
            status.style.color = 'var(--color-text-muted)';
        }

        try {
            SwUpdate.checkNow();
            // Đợi một chút để browser kịp fetch sw.js + so sánh
            await new Promise((r) => setTimeout(r, 1500));

            // Re-load version (có thể đã đổi nếu vừa nhận update)
            await this._loadAppVersion();

            // Nếu có waiting SW thì sw-update.js đã hiện toast rồi, không cần làm gì.
            // Còn không thì báo cho user biết là đang ở bản mới nhất.
            const reg = await navigator.serviceWorker?.getRegistration();
            if (reg && reg.waiting) {
                Toast.info('Có bản cập nhật mới', 'Xem thông báo phía dưới để tải lại');
            } else {
                Toast.success('Đã ở phiên bản mới nhất', '');
            }
        } catch (err) {
            console.warn('[SettingsPage] checkUpdate error:', err);
            Toast.error('Lỗi kiểm tra cập nhật', err.message || '');
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.style.opacity = '1';
            }
        }
    },

    setTheme(theme) {
        ThemeManager.apply(theme);
        // Re-render to update button states
        const content = this.render();
        document.getElementById('main-content').innerHTML = content;
        this.onEnter();
        Toast.success('Đã đổi giao diện', `Chế độ: ${ThemeManager.getLabel()}`);
    },

    toggleApiKeyVisibility() {
        const input = document.getElementById('api-key-input');
        const icon = input.parentElement.querySelector('.input-action .material-icons-round');
        if (input.type === 'password') {
            input.type = 'text';
            icon.textContent = 'visibility_off';
        } else {
            input.type = 'password';
            icon.textContent = 'visibility';
        }
    },

    saveApiKey() {
        const input = document.getElementById('api-key-input');
        if (input) {
            Helpers.storage.set('linguaflash-api-key', input.value.trim());
            Toast.success('Đã lưu API Key');
        }
    }
};


export default SettingsPage;
