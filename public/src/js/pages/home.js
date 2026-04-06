// ============================================
// Home Page - Main dashboard with folder tree
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

        // Load folders for tree
        await FolderTree.loadFolders();

        return `
            <div class="home-page page-enter">
                <!-- Welcome -->
                <div class="home-welcome">
                    <h2>Chào mừng trở lại! 👋</h2>
                    <p>Tiếp tục hành trình học tập của bạn</p>
                </div>

                <!-- Stats -->
                <div class="home-stats" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:var(--spacing-md);margin:var(--spacing-lg) 0;">
                    <div class="glass-card hover-lift stat-card">
                        <span class="material-icons-round" style="font-size:32px;color:var(--color-primary);">style</span>
                        <h3 style="margin-top:var(--spacing-xs);">0</h3>
                        <p style="font-size:var(--font-size-xs);">Tổng số thẻ</p>
                    </div>
                    <div class="glass-card hover-lift stat-card">
                        <span class="material-icons-round" style="font-size:32px;color:var(--color-success);">check_circle</span>
                        <h3 style="margin-top:var(--spacing-xs);">0</h3>
                        <p style="font-size:var(--font-size-xs);">Đã học hôm nay</p>
                    </div>
                    <div class="glass-card hover-lift stat-card">
                        <span class="material-icons-round" style="font-size:32px;color:var(--color-warning);">schedule</span>
                        <h3 style="margin-top:var(--spacing-xs);">0</h3>
                        <p style="font-size:var(--font-size-xs);">Cần ôn tập</p>
                    </div>
                    <div class="glass-card hover-lift stat-card">
                        <span class="material-icons-round" style="font-size:32px;color:var(--color-info);">local_fire_department</span>
                        <h3 style="margin-top:var(--spacing-xs);">0</h3>
                        <p style="font-size:var(--font-size-xs);">Streak ngày</p>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="home-quick-actions" style="display:flex;gap:var(--spacing-md);margin-bottom:var(--spacing-lg);">
                    <button class="btn btn-primary btn-lg btn-full" onclick="Router.navigate('/study')" style="flex:1;">
                        <span class="material-icons-round">auto_stories</span>
                        Học mới
                    </button>
                    <button class="btn btn-secondary btn-lg btn-full" onclick="Router.navigate('/review')" style="flex:1;">
                        <span class="material-icons-round">replay</span>
                        Ôn tập
                    </button>
                </div>

                <!-- Folder Tree -->
                <div class="home-folders glass-card" style="padding:var(--spacing-lg);">
                    ${FolderTree.render()}
                </div>
            </div>
        `;
    },

    async onEnter() {
        console.log('[HomePage] Entered');
    }
};
