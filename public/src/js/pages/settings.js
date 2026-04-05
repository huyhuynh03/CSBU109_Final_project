// ============================================
// Settings Page
// ============================================
// Stub - Will be fully implemented in Phase 3

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
                    <div style="display:flex;align-items:center;justify-content:space-between;">
                        <div style="display:flex;align-items:center;gap:var(--spacing-md);">
                            <span class="material-icons-round" style="color:var(--color-primary);">${themeIcon}</span>
                            <div>
                                <p style="font-weight:500;color:var(--color-text);">Chế độ hiển thị</p>
                                <p style="font-size:var(--font-size-sm);color:var(--color-text-muted);">Hiện tại: ${themeLabel}</p>
                            </div>
                        </div>
                        <div style="display:flex;gap:var(--spacing-sm);">
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
        // Load saved API key
        const savedKey = Helpers.storage.get('linguaflash-api-key', '');
        const input = document.getElementById('api-key-input');
        if (input && savedKey) {
            input.value = savedKey;
        }
        console.log('[SettingsPage] Entered');
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
