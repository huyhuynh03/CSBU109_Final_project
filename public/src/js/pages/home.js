// ============================================
// Home Page - Main dashboard with folder tree
// ============================================

const HomePage = {
    render() {
        return `
            <div class="home-page page-enter">
                <div class="home-welcome">
                    <h2>Chào mừng đến với LinguaFlash! 👋</h2>
                    <p>Ứng dụng học từ vựng ngoại ngữ thông minh với Spaced Repetition</p>
                </div>

                <div class="home-stats" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:var(--spacing-md);margin:var(--spacing-xl) 0;">
                    <div class="glass-card hover-lift" style="text-align:center;">
                        <span class="material-icons-round" style="font-size:36px;color:var(--color-primary);">style</span>
                        <h3 style="margin-top:var(--spacing-sm);">0</h3>
                        <p style="font-size:var(--font-size-sm);">Tổng số thẻ</p>
                    </div>
                    <div class="glass-card hover-lift" style="text-align:center;">
                        <span class="material-icons-round" style="font-size:36px;color:var(--color-success);">check_circle</span>
                        <h3 style="margin-top:var(--spacing-sm);">0</h3>
                        <p style="font-size:var(--font-size-sm);">Đã học hôm nay</p>
                    </div>
                    <div class="glass-card hover-lift" style="text-align:center;">
                        <span class="material-icons-round" style="font-size:36px;color:var(--color-warning);">schedule</span>
                        <h3 style="margin-top:var(--spacing-sm);">0</h3>
                        <p style="font-size:var(--font-size-sm);">Cần ôn tập</p>
                    </div>
                    <div class="glass-card hover-lift" style="text-align:center;">
                        <span class="material-icons-round" style="font-size:36px;color:var(--color-info);">local_fire_department</span>
                        <h3 style="margin-top:var(--spacing-sm);">0</h3>
                        <p style="font-size:var(--font-size-sm);">Streak ngày</p>
                    </div>
                </div>

                <div class="home-actions stagger-children" style="display:flex;flex-wrap:wrap;gap:var(--spacing-md);margin-top:var(--spacing-lg);">
                    ${Auth.isSignedIn() ? `
                        <button class="btn btn-primary btn-lg" onclick="Router.navigate('/study')">
                            <span class="material-icons-round">school</span>
                            Học mới
                        </button>
                        <button class="btn btn-secondary btn-lg" onclick="Router.navigate('/review')">
                            <span class="material-icons-round">replay</span>
                            Ôn tập
                        </button>
                    ` : `
                        <div class="empty-state" style="width:100%;">
                            <span class="material-icons-round empty-state-icon">login</span>
                            <h3 class="empty-state-title">Đăng nhập để bắt đầu học</h3>
                            <p class="empty-state-desc">Đăng nhập hoặc tạo tài khoản để lưu tiến độ học tập và đồng bộ giữa các thiết bị.</p>
                            <button class="btn btn-primary btn-lg" onclick="Router.navigate('/auth')">
                                <span class="material-icons-round">person_add</span>
                                Đăng nhập / Đăng ký
                            </button>
                        </div>
                    `}
                </div>
            </div>
        `;
    },

    onEnter() {
        // TODO: Load stats from Firestore when implemented
        console.log('[HomePage] Entered');
    }
};
