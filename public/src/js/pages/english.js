// ============================================
// English Dashboard - Trang chính cho miền Tiếng Anh
// ============================================

const EnglishPage = {
    async render() {
        const isSignedIn = Auth.isSignedIn();

        if (!isSignedIn) {
            Router.navigate('/auth');
            return '<div class="page-enter"></div>';
        }

        // Load folders for tree
        await FolderTree.loadFolders();

        return `
            <div class="english-page page-enter">
                <!-- Header with back button -->
                <div class="domain-header">
                    <button class="btn btn-ghost" onclick="Router.navigate('/')">
                        <span class="material-icons-round">arrow_back</span>
                        Trở về
                    </button>
                    <div class="domain-header__info">
                        <span class="domain-header__flag">EN</span>
                        <div>
                            <h2 class="domain-header__title">Tiếng Anh</h2>
                            <p class="domain-header__subtitle">English</p>
                        </div>
                    </div>
                </div>

                <!-- Stats -->
                <div class="home-stats" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:var(--spacing-md);margin:var(--spacing-lg) 0;">
                    <div class="glass-card hover-lift stat-card">
                        <span class="material-icons-round" style="font-size:32px;color:#3B82F6;">style</span>
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

                <!-- Folder Tree -->
                <div class="home-folders glass-card" style="padding:var(--spacing-lg);">
                    ${FolderTree.render()}
                </div>
            </div>
        `;
    },

    async onEnter() {
        console.log('[EnglishPage] Entered');
    }
};
