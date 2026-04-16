// ============================================
// Grammar Page - Trang Ngữ pháp
// ============================================

const GrammarPage = {
    async render() {
        const isSignedIn = Auth.isSignedIn();

        if (!isSignedIn) {
            Router.navigate('/auth');
            return '<div class="page-enter"></div>';
        }

        return `
            <div class="grammar-page page-enter">
                <!-- Domain Header -->
                <div class="domain-header">
                    <div class="domain-header__info">
                        <div class="domain-header__icon-wrapper" style="background: linear-gradient(135deg, #10B981 0%, #059669 100%);">
                            <span class="material-icons-round" style="color:#fff;font-size:24px;">school</span>
                        </div>
                        <div>
                            <h2 class="domain-header__title">Ngữ pháp</h2>
                            <p class="domain-header__subtitle">Grammar</p>
                        </div>
                    </div>
                </div>

                <!-- Study / Review Action Cards -->
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--spacing-lg);margin:var(--spacing-lg) 0;">
                    <div class="glass-card hover-lift"
                         onclick="Router.navigate('/study?type=grammar')" style="cursor:pointer;padding:var(--spacing-lg);text-align:center;border:2px solid transparent;transition:all 0.3s ease;">
                        <div style="width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg, #10B981 0%, #059669 100%);display:flex;align-items:center;justify-content:center;margin:0 auto var(--spacing-sm);">
                            <span class="material-icons-round" style="font-size:24px;color:#fff;">auto_stories</span>
                        </div>
                        <h3 style="margin:0 0 var(--spacing-xs);font-size:var(--font-size-base);">Học mới</h3>
                        <p id="grammar-new-action" style="font-size:var(--font-size-sm);color:var(--color-text-muted);margin:0;">
                            <span class="material-icons-round" style="font-size:14px;vertical-align:middle;">hourglass_empty</span>
                            Đang tải...
                        </p>
                    </div>
                    <div class="glass-card hover-lift"
                         onclick="Router.navigate('/review?type=grammar')" style="cursor:pointer;padding:var(--spacing-lg);text-align:center;border:2px solid transparent;transition:all 0.3s ease;">
                        <div style="width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);display:flex;align-items:center;justify-content:center;margin:0 auto var(--spacing-sm);">
                            <span class="material-icons-round" style="font-size:24px;color:#fff;">replay</span>
                        </div>
                        <h3 style="margin:0 0 var(--spacing-xs);font-size:var(--font-size-base);">Ôn tập</h3>
                        <p id="grammar-due-action" style="font-size:var(--font-size-sm);color:var(--color-text-muted);margin:0;">
                            <span class="material-icons-round" style="font-size:14px;vertical-align:middle;">hourglass_empty</span>
                            Đang tải...
                        </p>
                    </div>
                </div>

                <!-- Stats -->
                <div class="home-stats" id="grammar-stats" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:var(--spacing-md);margin-bottom:var(--spacing-lg);">
                    <div class="glass-card hover-lift stat-card">
                        <span class="material-icons-round" style="font-size:32px;color:#10B981;">style</span>
                        <h3 id="grammar-total-count" style="margin-top:var(--spacing-xs);">—</h3>
                        <p style="font-size:var(--font-size-xs);">Tổng số thẻ</p>
                    </div>
                    <div class="glass-card hover-lift stat-card">
                        <span class="material-icons-round" style="font-size:32px;color:var(--color-success);">fiber_new</span>
                        <h3 id="grammar-new-count" style="margin-top:var(--spacing-xs);">—</h3>
                        <p style="font-size:var(--font-size-xs);">Thẻ mới</p>
                    </div>
                    <div class="glass-card hover-lift stat-card">
                        <span class="material-icons-round" style="font-size:32px;color:var(--color-warning);">schedule</span>
                        <h3 id="grammar-due-count" style="margin-top:var(--spacing-xs);">—</h3>
                        <p style="font-size:var(--font-size-xs);">Cần ôn tập</p>
                    </div>
                </div>

                <div class="glass-card" style="padding:var(--spacing-xl);text-align:center;">
                    <span class="material-icons-round" style="font-size:48px;color:var(--color-text-muted);">construction</span>
                    <p style="color:var(--color-text-muted);margin-top:var(--spacing-sm);">Các chủ đề ngữ pháp sẽ sớm được cập nhật.</p>
                </div>
            </div>
        `;
    },

    async onEnter() {
        console.log('[GrammarPage] Entered');
        // Load stats async
        this._loadStats();
    },

    async _loadStats() {
        try {
            const cards = await FirestoreDB.getCards({ cardType: 'grammar' });
            const total = cards.length;
            const newCount = cards.filter(c => c.state === 'new').length;
            const now = new Date();
            const dueCount = cards.filter(c => {
                if (!c.dueDate) return false;
                const dueDate = c.dueDate.toDate ? c.dueDate.toDate() : new Date(c.dueDate);
                return dueDate <= now;
            }).length;

            const totalEl = document.getElementById('grammar-total-count');
            const newEl = document.getElementById('grammar-new-count');
            const dueEl = document.getElementById('grammar-due-count');
            if (totalEl) totalEl.textContent = total;
            if (newEl) newEl.textContent = newCount;
            if (dueEl) dueEl.textContent = dueCount;

            // Update action card counts
            const newActionEl = document.getElementById('grammar-new-action');
            const dueActionEl = document.getElementById('grammar-due-action');
            if (newActionEl) {
                newActionEl.innerHTML = newCount > 0
                    ? `<span style="font-size:var(--font-size-lg);font-weight:700;color:var(--color-success);">${newCount}</span> thẻ chưa học`
                    : `<span style="color:var(--color-text-muted);">Không có thẻ mới</span>`;
            }
            if (dueActionEl) {
                dueActionEl.innerHTML = dueCount > 0
                    ? `<span style="font-size:var(--font-size-lg);font-weight:700;color:var(--color-warning);">${dueCount}</span> thẻ đến hạn`
                    : `<span style="color:var(--color-text-muted);">Không có thẻ cần ôn</span>`;
            }
        } catch (error) {
            console.error('[GrammarPage] Error loading stats:', error);
        }
    }
};
