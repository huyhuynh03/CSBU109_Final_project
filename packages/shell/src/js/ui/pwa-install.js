// ============================================
// PWA Install Manager
// Click nút "Cài đặt ứng dụng" → detect OS → cài luôn hoặc hiện hướng dẫn
// ============================================

const PWAInstall = {
    /** @type {Event|null} Deferred prompt event (Chrome/Edge) */
    _deferredPrompt: null,

    /** @type {boolean} Whether the app is already installed */
    _isInstalled: false,

    /** @type {HTMLElement|null} */
    _modal: null,

    /** @type {HTMLElement|null} Progress overlay element */
    _progressOverlay: null,

    /** @type {number|null} Progress animation interval */
    _progressInterval: null,

    /**
     * Initialize PWA Install manager
     */
    init() {
        // Capture beforeinstallprompt event (Chrome, Edge, Samsung Internet)
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this._deferredPrompt = e;
            console.log('[PWAInstall] beforeinstallprompt captured');
        });

        // Detect if app was installed
        window.addEventListener('appinstalled', () => {
            this._isInstalled = true;
            this._deferredPrompt = null;
            console.log('[PWAInstall] App installed successfully');
            // Đánh dấu đã nhận event, nhưng KHÔNG hoàn tất progress ngay
            // vì icon chưa xuất hiện trên thiết bị (cần thêm thời gian)
            this._appInstalledFired = true;
        });

        // Check if already running as standalone (installed)
        if (window.matchMedia('(display-mode: standalone)').matches ||
            window.navigator.standalone === true) {
            this._isInstalled = true;
        }

        console.log('[PWAInstall] Initialized');
    },

    /**
     * Detect current platform
     * @returns {'windows'|'android'|'ios'|'macos'|'unknown'}
     */
    _detectPlatform() {
        const ua = navigator.userAgent || '';
        const platform = navigator.platform || '';

        if (/iPad|iPhone|iPod/.test(ua) || (platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
            return 'ios';
        }
        if (/Android/.test(ua)) {
            return 'android';
        }
        if (/Macintosh|MacIntel/.test(ua)) {
            return 'macos';
        }
        if (/Win/.test(platform)) {
            return 'windows';
        }
        return 'unknown';
    },

    /**
     * Main action: click nút → detect OS → cài luôn hoặc hiện hướng dẫn
     */
    async install() {
        // Nếu đã cài rồi
        if (this._isInstalled) {
            Toast.show({ type: 'info', title: 'Đã cài đặt', message: 'Ứng dụng đã được cài trên thiết bị này.' });
            return;
        }

        // Nếu có native prompt (Chrome/Edge trên Windows, Android, macOS) → trigger ngay
        if (this._deferredPrompt) {
            try {
                this._deferredPrompt.prompt();
                const { outcome } = await this._deferredPrompt.userChoice;
                console.log('[PWAInstall] User choice:', outcome);
                this._deferredPrompt = null;
                if (outcome === 'accepted') {
                    this._showProgressOverlay();
                    return; // appinstalled event sẽ handle completion
                }
            } catch (err) {
                console.error('[PWAInstall] Install prompt error:', err);
            }
        }

        // Không có native prompt → hiện modal hướng dẫn cho OS hiện tại
        this._showInstructionsModal();
    },

    /**
     * Show instructions modal for current platform
     */
    _showInstructionsModal() {
        this._closeModal();

        const platform = this._detectPlatform();
        const instructions = this._getInstructions(platform);

        const modal = document.createElement('div');
        modal.id = 'pwa-install-modal';
        modal.className = 'pwa-install-overlay';
        modal.innerHTML = `
            <div class="pwa-install-modal glass-panel">
                <div class="pwa-install-header">
                    <div class="pwa-install-title-row">
                        <img src="/icons/icon-96.png" alt="LinguaFlash" class="pwa-install-logo">
                        <div>
                            <h2 class="pwa-install-title">Cài đặt LinguaFlash</h2>
                            <p class="pwa-install-subtitle">${instructions.title}</p>
                        </div>
                    </div>
                    <button class="icon-btn pwa-install-close" aria-label="Đóng">
                        <span class="material-icons-round">close</span>
                    </button>
                </div>

                <div class="pwa-install-body">
                    <ol class="pwa-instructions-steps">
                        ${instructions.steps.map(step => `<li>${step}</li>`).join('')}
                    </ol>
                    ${instructions.note ? `<p class="pwa-instructions-note">${instructions.note}</p>` : ''}
                </div>

                ${this._renderPlatformSwitcher(platform)}
            </div>
        `;

        document.body.appendChild(modal);
        this._modal = modal;

        // Event listeners
        modal.querySelector('.pwa-install-close').addEventListener('click', () => this._closeModal());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this._closeModal();
        });

        // Platform switcher
        modal.querySelectorAll('.pwa-platform-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const p = tab.dataset.platform;
                this._switchPlatformInstructions(p);
            });
        });

        // Animate in
        requestAnimationFrame(() => modal.classList.add('pwa-install-visible'));
    },

    /**
     * Render platform switcher tabs at bottom
     */
    _renderPlatformSwitcher(currentPlatform) {
        const platforms = [
            { id: 'windows', icon: 'desktop_windows', name: 'Windows' },
            { id: 'android', icon: 'phone_android', name: 'Android' },
            { id: 'ios', icon: 'phone_iphone', name: 'iOS' },
            { id: 'macos', icon: 'laptop_mac', name: 'macOS' }
        ];

        const tabs = platforms.map(p => `
            <button class="pwa-platform-tab ${p.id === currentPlatform ? 'pwa-platform-tab--active' : ''}" 
                    data-platform="${p.id}" title="${p.name}">
                <span class="material-icons-round">${p.icon}</span>
                <span class="pwa-platform-tab-label">${p.name}</span>
            </button>
        `).join('');

        return `
            <div class="pwa-platform-switcher">
                <span class="pwa-platform-switcher-label">Nền tảng khác:</span>
                <div class="pwa-platform-tabs">${tabs}</div>
            </div>
        `;
    },

    /**
     * Switch instructions to another platform
     */
    _switchPlatformInstructions(platform) {
        if (!this._modal) return;

        const instructions = this._getInstructions(platform);

        // Update subtitle
        const subtitle = this._modal.querySelector('.pwa-install-subtitle');
        if (subtitle) subtitle.textContent = instructions.title;

        // Update steps
        const stepsEl = this._modal.querySelector('.pwa-instructions-steps');
        if (stepsEl) {
            stepsEl.innerHTML = instructions.steps.map(step => `<li>${step}</li>`).join('');
        }

        // Update note
        const body = this._modal.querySelector('.pwa-install-body');
        const existingNote = body?.querySelector('.pwa-instructions-note');
        if (existingNote) existingNote.remove();
        if (instructions.note && body) {
            body.insertAdjacentHTML('beforeend', `<p class="pwa-instructions-note">${instructions.note}</p>`);
        }

        // Update active tab
        this._modal.querySelectorAll('.pwa-platform-tab').forEach(tab => {
            tab.classList.toggle('pwa-platform-tab--active', tab.dataset.platform === platform);
        });
    },

    /**
     * Get platform-specific installation instructions
     */
    _getInstructions(platform) {
        const instructions = {
            windows: {
                title: 'Hướng dẫn cài trên Windows',
                steps: [
                    'Mở trang web bằng <strong>Google Chrome</strong> hoặc <strong>Microsoft Edge</strong>',
                    'Nhấn vào biểu tượng <strong>⊕ Cài đặt</strong> trên thanh địa chỉ (góc phải)',
                    'Hoặc vào menu <strong>⋮ → Cài đặt ứng dụng...</strong>',
                    'Nhấn <strong>"Cài đặt"</strong> trong hộp thoại xác nhận',
                    'Ứng dụng sẽ xuất hiện trên Desktop và Start Menu'
                ],
                note: '💡 Nếu bạn thấy nút cài đặt trên thanh địa chỉ, nhấn vào đó là cách nhanh nhất.'
            },
            android: {
                title: 'Hướng dẫn cài trên Android',
                steps: [
                    'Mở trang web bằng <strong>Google Chrome</strong>',
                    'Nhấn vào menu <strong>⋮</strong> (3 chấm dọc, góc phải trên)',
                    'Chọn <strong>"Thêm vào Màn hình chính"</strong> hoặc <strong>"Cài đặt ứng dụng"</strong>',
                    'Nhấn <strong>"Cài đặt"</strong> hoặc <strong>"Thêm"</strong> để xác nhận',
                    'Ứng dụng sẽ xuất hiện trên màn hình chính như app thường'
                ],
                note: '💡 Trên Samsung Internet: menu → "Thêm trang vào" → "Màn hình chính".'
            },
            ios: {
                title: 'Hướng dẫn cài trên iOS (iPhone/iPad)',
                steps: [
                    'Mở trang web bằng <strong>Safari</strong> (bắt buộc dùng Safari)',
                    'Nhấn nút <strong>Chia sẻ</strong> ⬆ (hình vuông có mũi tên, thanh dưới)',
                    'Cuộn xuống và chọn <strong>"Thêm vào Màn hình chính"</strong>',
                    'Đặt tên (hoặc giữ nguyên) rồi nhấn <strong>"Thêm"</strong>',
                    'Ứng dụng sẽ xuất hiện trên màn hình chính'
                ],
                note: '⚠️ Trên iOS, chỉ Safari mới hỗ trợ cài PWA. Chrome/Firefox trên iOS không có tính năng này.'
            },
            macos: {
                title: 'Hướng dẫn cài trên macOS',
                steps: [
                    'Mở trang web bằng <strong>Google Chrome</strong> hoặc <strong>Microsoft Edge</strong>',
                    'Nhấn vào biểu tượng <strong>⊕ Cài đặt</strong> trên thanh địa chỉ',
                    'Hoặc vào menu <strong>⋮ → Cài đặt ứng dụng...</strong>',
                    'Nhấn <strong>"Cài đặt"</strong> trong hộp thoại xác nhận',
                    'Ứng dụng sẽ xuất hiện trong Launchpad và Applications'
                ],
                note: '💡 Safari (macOS Sonoma 14+): File → "Add to Dock".'
            }
        };

        return instructions[platform] || instructions.windows;
    },

    /**
     * Close the install modal
     */
    _closeModal() {
        if (this._modal) {
            this._modal.classList.remove('pwa-install-visible');
            setTimeout(() => {
                this._modal?.remove();
                this._modal = null;
            }, 300);
        }
    },

    // ============================================
    // Progress Overlay - Simulated install progress
    // ============================================

    /**
     * Show progress overlay with simulated download/install animation
     */
    _showProgressOverlay() {
        this._closeProgressOverlay();

        const overlay = document.createElement('div');
        overlay.id = 'pwa-progress-overlay';
        overlay.className = 'pwa-progress-overlay';
        overlay.innerHTML = `
            <div class="pwa-progress-card glass-panel">
                <div class="pwa-progress-header">
                    <img src="/icons/icon-96.png" alt="LinguaFlash" class="pwa-progress-icon">
                    <div class="pwa-progress-info">
                        <h3 class="pwa-progress-title">Đang cài đặt LinguaFlash</h3>
                        <p class="pwa-progress-status">Đang tải xuống...</p>
                    </div>
                </div>
                <div class="pwa-progress-bar-container">
                    <div class="pwa-progress-bar">
                        <div class="pwa-progress-bar-fill"></div>
                    </div>
                    <span class="pwa-progress-percent">0%</span>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        this._progressOverlay = overlay;

        // Animate in
        requestAnimationFrame(() => overlay.classList.add('pwa-progress-visible'));

        // Start simulated progress
        this._simulateProgress();
    },

    /**
     * Simulate progress bar animation
     * Chạy đều đặn trong ~45-55 giây để khớp với thời gian thực tế
     * icon xuất hiện trên thiết bị di động
     */
    _simulateProgress() {
        let progress = 0;
        this._appInstalledFired = false;
        const fill = this._progressOverlay?.querySelector('.pwa-progress-bar-fill');
        const percent = this._progressOverlay?.querySelector('.pwa-progress-percent');
        const status = this._progressOverlay?.querySelector('.pwa-progress-status');

        if (!fill || !percent || !status) return;

        // Tổng thời gian mô phỏng: ~50 giây (250 ticks x 200ms)
        // Chia thành các giai đoạn với tốc độ khác nhau
        const TICK_INTERVAL = 200; // ms
        let tickCount = 0;

        this._progressInterval = setInterval(() => {
            tickCount++;

            // Giai đoạn 1: 0-20% trong ~8s (nhanh vừa - tải manifest)
            if (progress < 20) {
                progress += 0.5 + Math.random() * 0.3;
            }
            // Giai đoạn 2: 20-50% trong ~15s (tải assets chính)
            else if (progress < 50) {
                progress += 0.35 + Math.random() * 0.2;
            }
            // Giai đoạn 3: 50-75% trong ~12s (cài đặt & đăng ký)
            else if (progress < 75) {
                progress += 0.3 + Math.random() * 0.15;
            }
            // Giai đoạn 4: 75-90% trong ~10s (thiết lập shortcut)
            else if (progress < 90) {
                progress += 0.2 + Math.random() * 0.1;
            }
            // Giai đoạn 5: 90-98% - chỉ tiến khi đã nhận appinstalled
            else if (progress < 98) {
                if (this._appInstalledFired) {
                    progress += 0.4 + Math.random() * 0.3;
                } else {
                    // Chờ appinstalled, tiến rất chậm
                    progress += 0.02;
                }
            }
            // Giai đoạn cuối: 98-100% → hoàn tất
            else {
                this._completeProgress();
                return;
            }

            progress = Math.min(progress, 99.5);
            const rounded = Math.round(progress);

            fill.style.width = `${rounded}%`;
            percent.textContent = `${rounded}%`;

            // Cập nhật status text theo tiến trình
            if (progress < 20) {
                status.textContent = 'Đang tải dữ liệu...';
            } else if (progress < 50) {
                status.textContent = 'Đang tải tài nguyên...';
            } else if (progress < 75) {
                status.textContent = 'Đang cài đặt ứng dụng...';
            } else if (progress < 90) {
                status.textContent = 'Đang tạo shortcut...';
            } else {
                status.textContent = 'Đang hoàn tất...';
            }
        }, TICK_INTERVAL);

        // Timeout fallback: nếu sau 90s vẫn chưa xong → tự hoàn tất
        this._progressTimeout = setTimeout(() => {
            this._completeProgress();
        }, 90000);
    },

    /**
     * Complete the progress bar (called when appinstalled fires or timeout)
     */
    _completeProgress() {
        // Clear interval & timeout
        if (this._progressInterval) {
            clearInterval(this._progressInterval);
            this._progressInterval = null;
        }
        if (this._progressTimeout) {
            clearTimeout(this._progressTimeout);
            this._progressTimeout = null;
        }

        const fill = this._progressOverlay?.querySelector('.pwa-progress-bar-fill');
        const percent = this._progressOverlay?.querySelector('.pwa-progress-percent');
        const status = this._progressOverlay?.querySelector('.pwa-progress-status');
        const title = this._progressOverlay?.querySelector('.pwa-progress-title');
        const card = this._progressOverlay?.querySelector('.pwa-progress-card');

        if (!this._progressOverlay) {
            // Nếu không có overlay (trường hợp appinstalled fire mà không qua progress)
            Toast.show({ type: 'success', title: 'Đã cài đặt!', message: 'LinguaFlash đã được thêm vào thiết bị.' });
            return;
        }

        // Animate to 100%
        if (fill) fill.style.width = '100%';
        if (percent) percent.textContent = '100%';
        if (status) status.textContent = 'Hoàn tất!';
        if (title) title.textContent = 'Cài đặt thành công!';
        if (card) card.classList.add('pwa-progress-complete');

        // Auto close after 2.5s
        setTimeout(() => {
            this._closeProgressOverlay();
            Toast.show({ type: 'success', title: 'Đã cài đặt!', message: 'LinguaFlash đã được thêm vào thiết bị.' });
        }, 2500);
    },

    /**
     * Close and remove progress overlay
     */
    _closeProgressOverlay() {
        if (this._progressInterval) {
            clearInterval(this._progressInterval);
            this._progressInterval = null;
        }
        if (this._progressTimeout) {
            clearTimeout(this._progressTimeout);
            this._progressTimeout = null;
        }
        if (this._progressOverlay) {
            this._progressOverlay.classList.remove('pwa-progress-visible');
            setTimeout(() => {
                this._progressOverlay?.remove();
                this._progressOverlay = null;
            }, 300);
        }
    }
};


export default PWAInstall;
