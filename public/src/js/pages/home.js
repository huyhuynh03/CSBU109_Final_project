// ============================================
// Home Page - Dashboard with Study/Review buttons
// ============================================

const HomePage = {
    async render() {
        const isSignedIn = Auth.isSignedIn();

        if (!isSignedIn) {
            return `
                <div class="home-page page-enter">
                    <div class="home-welcome">
                        <h2>Chào mừng đến với LinguaFlash! 👋</h2>
                        <p>Ứng dụng học và ôn tập thông minh với Spaced Repetition</p>
                    </div>
                    <div class="home-actions" style="margin-top:var(--spacing-xl);">
                        <div class="empty-state" style="width:100%;">
                            <span class="material-icons-round empty-state-icon">login</span>
                            <h3 class="empty-state-title">Đăng nhập để bắt đầu học</h3>
                            <p class="empty-state-desc">Đăng nhập hoặc tạo tài khoản để lưu tiến độ học tập và đồng bộ giữa các thiết bị.</p>
                            <button class="btn btn-primary btn-lg" onclick="Router.navigate('/auth')">
                                <span class="material-icons-round">person_add</span>
                                Đăng nhập / Đăng ký
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }

        return `
            <div class="home-page page-enter">
                <!-- Welcome -->
                <div class="home-welcome">
                    <h2>Chào mừng trở lại! 👋</h2>
                    <p>Hôm nay bạn muốn làm gì?</p>
                </div>

                <!-- Study / Review Action Cards -->
                <div class="dashboard-actions" style="display:grid;grid-template-columns:1fr 1fr;gap:var(--spacing-lg);margin:var(--spacing-xl) 0;">
                    <!-- Học mới -->
                    <div class="glass-card hover-lift dashboard-action-card dashboard-action-card--study" 
                         onclick="Router.navigate('/study')" style="cursor:pointer;padding:var(--spacing-xl);text-align:center;border:2px solid transparent;transition:all 0.3s ease;">
                        <div class="dashboard-action-icon" style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg, #10B981 0%, #059669 100%);display:flex;align-items:center;justify-content:center;margin:0 auto var(--spacing-md);">
                            <span class="material-icons-round" style="font-size:32px;color:#fff;">auto_stories</span>
                        </div>
                        <h3 style="margin:0 0 var(--spacing-xs);font-size:var(--font-size-lg);">Học mới</h3>
                        <p id="dashboard-new-count" style="font-size:var(--font-size-sm);color:var(--color-text-muted);margin:0;">
                            <span class="material-icons-round" style="font-size:16px;vertical-align:middle;">hourglass_empty</span>
                            Đang tải...
                        </p>
                    </div>

                    <!-- Ôn tập -->
                    <div class="glass-card hover-lift dashboard-action-card dashboard-action-card--review" 
                         onclick="Router.navigate('/review')" style="cursor:pointer;padding:var(--spacing-xl);text-align:center;border:2px solid transparent;transition:all 0.3s ease;">
                        <div class="dashboard-action-icon" style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);display:flex;align-items:center;justify-content:center;margin:0 auto var(--spacing-md);">
                            <span class="material-icons-round" style="font-size:32px;color:#fff;">replay</span>
                        </div>
                        <h3 style="margin:0 0 var(--spacing-xs);font-size:var(--font-size-lg);">Ôn tập</h3>
                        <p id="dashboard-due-count" style="font-size:var(--font-size-sm);color:var(--color-text-muted);margin:0;">
                            <span class="material-icons-round" style="font-size:16px;vertical-align:middle;">hourglass_empty</span>
                            Đang tải...
                        </p>
                    </div>
                </div>

                <!-- Stats -->
                <div class="home-stats" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:var(--spacing-md);margin-bottom:var(--spacing-lg);">
                    <div class="glass-card hover-lift stat-card">
                        <span class="material-icons-round" style="font-size:32px;color:#6C63FF;">style</span>
                        <h3 id="dashboard-total-count" style="margin-top:var(--spacing-xs);">—</h3>
                        <p style="font-size:var(--font-size-xs);">Tổng số thẻ</p>
                    </div>
                    <div class="glass-card hover-lift stat-card">
                        <span class="material-icons-round" style="font-size:32px;color:#3B82F6;">menu_book</span>
                        <h3 id="dashboard-vocab-count" style="margin-top:var(--spacing-xs);">—</h3>
                        <p style="font-size:var(--font-size-xs);">Từ vựng</p>
                    </div>
                    <div class="glass-card hover-lift stat-card">
                        <span class="material-icons-round" style="font-size:32px;color:#10B981;">school</span>
                        <h3 id="dashboard-grammar-count" style="margin-top:var(--spacing-xs);">—</h3>
                        <p style="font-size:var(--font-size-xs);">Ngữ pháp</p>
                    </div>
                    <div class="glass-card hover-lift stat-card">
                        <span class="material-icons-round" style="font-size:32px;color:var(--color-info);">local_fire_department</span>
                        <h3 id="dashboard-streak" style="margin-top:var(--spacing-xs);">0</h3>
                        <p style="font-size:var(--font-size-xs);">Streak ngày</p>
                    </div>
                </div>

                <!-- Quick Links -->
                <div class="glass-card" style="padding:var(--spacing-lg);">
                    <h3 style="margin:0 0 var(--spacing-md);font-size:var(--font-size-md);display:flex;align-items:center;gap:var(--spacing-xs);">
                        <span class="material-icons-round" style="font-size:20px;color:var(--color-primary);">bolt</span>
                        Truy cập nhanh
                    </h3>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--spacing-sm);">
                        <button class="btn btn-secondary" onclick="Router.navigate('/vocabulary')" style="justify-content:flex-start;">
                            <span class="material-icons-round" style="color:#3B82F6;">menu_book</span>
                            Từ vựng
                        </button>
                        <button class="btn btn-secondary" onclick="Router.navigate('/grammar')" style="justify-content:flex-start;">
                            <span class="material-icons-round" style="color:#10B981;">school</span>
                            Ngữ pháp
                        </button>
                        <button class="btn btn-secondary" onclick="Router.navigate('/folders')" style="justify-content:flex-start;">
                            <span class="material-icons-round" style="color:var(--color-text-muted);">account_tree</span>
                            Cây thư mục
                        </button>
                        <button class="btn btn-secondary" onclick="Router.navigate('/settings')" style="justify-content:flex-start;">
                            <span class="material-icons-round" style="color:var(--color-text-muted);">settings</span>
                            Cài đặt
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    async onEnter() {
        console.log('[HomePage] Entered - Dashboard');

        if (!Auth.isSignedIn()) return;

        // Load stats asynchronously
        this._loadDashboardStats();
    },

    /**
     * Load dashboard statistics
     * @private
     */
    async _loadDashboardStats() {
        try {
            // Get all cards
            const allCards = await FirestoreDB.getCards({});
            const total = allCards.length;
            const vocabCount = allCards.filter(c => c.cardType === 'vocabulary').length;
            const grammarCount = allCards.filter(c => c.cardType === 'grammar').length;
            const newCount = allCards.filter(c => c.state === 'new').length;
            const now = new Date();
            const dueCount = allCards.filter(c => {
                if (!c.dueDate) return false;
                const dueDate = c.dueDate.toDate ? c.dueDate.toDate() : new Date(c.dueDate);
                return dueDate <= now;
            }).length;

            // Update dashboard counts
            const totalEl = document.getElementById('dashboard-total-count');
            const vocabEl = document.getElementById('dashboard-vocab-count');
            const grammarEl = document.getElementById('dashboard-grammar-count');
            const newEl = document.getElementById('dashboard-new-count');
            const dueEl = document.getElementById('dashboard-due-count');

            if (totalEl) totalEl.textContent = total;
            if (vocabEl) vocabEl.textContent = vocabCount;
            if (grammarEl) grammarEl.textContent = grammarCount;

            if (newEl) {
                newEl.innerHTML = newCount > 0
                    ? `<span style="font-size:var(--font-size-lg);font-weight:700;color:var(--color-success);">${newCount}</span> thẻ chưa học`
                    : `<span style="color:var(--color-text-muted);">Không có thẻ mới</span>`;
            }

            if (dueEl) {
                dueEl.innerHTML = dueCount > 0
                    ? `<span style="font-size:var(--font-size-lg);font-weight:700;color:var(--color-warning);">${dueCount}</span> thẻ đến hạn`
                    : `<span style="color:var(--color-text-muted);">Không có thẻ cần ôn</span>`;
            }
        } catch (error) {
            console.error('[HomePage] Error loading stats:', error);
        }
    }
};
