// ============================================
// Settings Page
// ============================================

const SettingsPage = {
    render() {
        const currentTheme = ThemeManager.currentTheme;
        const themeIcon = ThemeManager.getIcon();
        const themeLabel = ThemeManager.getLabel();

        // Notification status
        const permStatus = PushNotificationManager.getPermissionStatus();
        const isSupported = PushNotificationManager.isSupported();

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

                <!-- Notification Settings -->
                <div class="glass-card" style="margin-bottom:var(--spacing-lg);">
                    <h4 style="margin-bottom:var(--spacing-md);">
                        <span class="material-icons-round" style="vertical-align:middle;margin-right:var(--spacing-xs);color:var(--color-primary);">notifications</span>
                        Thông báo nhắc ôn
                    </h4>
                    ${this._renderNotificationSection(isSupported, permStatus)}
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

    /**
     * Render notification settings section based on support/permission status
     */
    _renderNotificationSection(isSupported, permStatus) {
        if (!isSupported) {
            return `
                <div style="display:flex;align-items:center;gap:var(--spacing-md);padding:var(--spacing-md);background:var(--color-surface-alt);border-radius:var(--radius-md);">
                    <span class="material-icons-round" style="color:var(--color-text-muted);">notifications_off</span>
                    <div>
                        <p style="font-weight:500;color:var(--color-text);">Không hỗ trợ</p>
                        <p style="font-size:var(--font-size-sm);color:var(--color-text-muted);">
                            Trình duyệt này không hỗ trợ push notification. Hãy dùng Chrome/Edge hoặc thêm app vào Home Screen (iOS).
                        </p>
                    </div>
                </div>
            `;
        }

        if (permStatus === 'denied') {
            return `
                <div style="display:flex;align-items:center;gap:var(--spacing-md);padding:var(--spacing-md);background:var(--color-surface-alt);border-radius:var(--radius-md);">
                    <span class="material-icons-round" style="color:var(--color-danger);">block</span>
                    <div>
                        <p style="font-weight:500;color:var(--color-text);">Đã bị chặn</p>
                        <p style="font-size:var(--font-size-sm);color:var(--color-text-muted);">
                            Bạn đã chặn quyền thông báo. Vào cài đặt trình duyệt → Site Settings → Notifications để bật lại.
                        </p>
                    </div>
                </div>
            `;
        }

        // Permission is 'default' or 'granted'
        return `
            <div id="notification-settings-content">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--spacing-md);">
                    <div style="display:flex;align-items:center;gap:var(--spacing-md);">
                        <span class="material-icons-round" style="color:var(--color-primary);">alarm</span>
                        <div>
                            <p style="font-weight:500;color:var(--color-text);">Nhắc ôn hàng ngày</p>
                            <p style="font-size:var(--font-size-sm);color:var(--color-text-muted);">
                                Nhận thông báo khi có từ cần ôn
                            </p>
                        </div>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" id="notification-toggle" onchange="SettingsPage.toggleNotification(this.checked)">
                        <span class="toggle-slider"></span>
                    </label>
                </div>

                <div id="notification-time-section" style="display:none;margin-top:var(--spacing-md);padding-top:var(--spacing-md);border-top:1px solid var(--color-border);">
                    <div style="display:flex;align-items:center;justify-content:space-between;">
                        <div style="display:flex;align-items:center;gap:var(--spacing-md);">
                            <span class="material-icons-round" style="color:var(--color-secondary);">schedule</span>
                            <div>
                                <p style="font-weight:500;color:var(--color-text);">Giờ nhắc</p>
                                <p style="font-size:var(--font-size-sm);color:var(--color-text-muted);">Chọn thời gian nhận thông báo</p>
                            </div>
                        </div>
                        <input type="time" id="notification-time" value="08:00" 
                               onchange="SettingsPage.updateReminderTime(this.value)"
                               style="padding:var(--spacing-sm) var(--spacing-md);border-radius:var(--radius-md);border:1px solid var(--color-border);background:var(--color-surface);color:var(--color-text);font-size:var(--font-size-md);">
                    </div>
                </div>

                <div id="notification-status" style="margin-top:var(--spacing-md);display:none;">
                    <p style="font-size:var(--font-size-sm);color:var(--color-success);display:flex;align-items:center;gap:var(--spacing-xs);">
                        <span class="material-icons-round" style="font-size:16px;">check_circle</span>
                        <span id="notification-status-text">Đã bật thông báo</span>
                    </p>
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

        // Load notification settings
        await this._loadNotificationSettings();

        console.log('[SettingsPage] Entered');
    },

    /**
     * Load notification settings from Firestore and update UI
     */
    async _loadNotificationSettings() {
        const toggle = document.getElementById('notification-toggle');
        const timeSection = document.getElementById('notification-time-section');
        const timeInput = document.getElementById('notification-time');
        const statusDiv = document.getElementById('notification-status');
        const statusText = document.getElementById('notification-status-text');

        if (!toggle) return;

        try {
            const settings = await PushNotificationManager.getSettings();

            if (settings && settings.enabled) {
                toggle.checked = true;
                if (timeSection) timeSection.style.display = 'block';
                if (timeInput && settings.reminderTime) {
                    timeInput.value = settings.reminderTime;
                }
                if (statusDiv) {
                    statusDiv.style.display = 'block';
                    if (statusText) {
                        statusText.textContent = `Đã bật — nhắc lúc ${settings.reminderTime || '08:00'}`;
                    }
                }
            }
        } catch (err) {
            console.warn('[SettingsPage] Load notification settings error:', err);
        }
    },

    /**
     * Toggle notification on/off
     */
    async toggleNotification(enabled) {
        const timeSection = document.getElementById('notification-time-section');
        const statusDiv = document.getElementById('notification-status');
        const statusText = document.getElementById('notification-status-text');
        const timeInput = document.getElementById('notification-time');

        if (enabled) {
            // Check if user is logged in
            if (!auth.currentUser) {
                Toast.warning('Cần đăng nhập', 'Đăng nhập để bật thông báo nhắc ôn');
                document.getElementById('notification-toggle').checked = false;
                return;
            }

            // Request permission
            const granted = await PushNotificationManager.requestPermission();
            if (!granted) {
                document.getElementById('notification-toggle').checked = false;
                return;
            }

            // Save settings
            const reminderTime = timeInput ? timeInput.value : '08:00';
            await PushNotificationManager.saveSettings({
                enabled: true,
                reminderTime: reminderTime,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            });

            // Update UI
            if (timeSection) timeSection.style.display = 'block';
            if (statusDiv) statusDiv.style.display = 'block';
            if (statusText) statusText.textContent = `Đã bật — nhắc lúc ${reminderTime}`;

            Toast.success('Đã bật thông báo', `Sẽ nhắc ôn lúc ${reminderTime} mỗi ngày`);
        } else {
            // Disable notifications
            await PushNotificationManager.removeToken();
            await PushNotificationManager.saveSettings({
                enabled: false,
                reminderTime: timeInput ? timeInput.value : '08:00',
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            });

            // Update UI
            if (timeSection) timeSection.style.display = 'none';
            if (statusDiv) statusDiv.style.display = 'none';

            Toast.info('Đã tắt thông báo');
        }
    },

    /**
     * Update reminder time
     */
    async updateReminderTime(time) {
        const statusText = document.getElementById('notification-status-text');

        await PushNotificationManager.saveSettings({
            enabled: true,
            reminderTime: time,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        });

        if (statusText) {
            statusText.textContent = `Đã bật — nhắc lúc ${time}`;
        }

        Toast.success('Đã cập nhật', `Giờ nhắc: ${time}`);
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
