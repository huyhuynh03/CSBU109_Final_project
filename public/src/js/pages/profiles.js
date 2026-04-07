// ============================================
// Profiles Page - Hồ sơ cấu hình thẻ học tập
// ============================================

const ProfilesPage = {
    /**
     * Render placeholder page
     */
    render() {
        return `
            <div class="page-container" style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;text-align:center;padding:var(--spacing-xl);">
                <span class="material-icons-round" style="font-size:72px;color:var(--color-primary-light);opacity:0.6;margin-bottom:var(--spacing-lg);">tune</span>
                <h2 style="margin-bottom:var(--spacing-md);color:var(--color-text);">Hồ sơ cấu hình</h2>
                <p style="color:var(--color-text-muted);font-size:var(--font-size-base);max-width:400px;line-height:1.6;">
                    Lưu trữ và quản lý các profile cấu hình thẻ học tập.<br>
                    Tính năng đang được phát triển.
                </p>
                <div style="margin-top:var(--spacing-xl);padding:var(--spacing-md) var(--spacing-lg);border-radius:var(--radius-lg);background:var(--color-surface);border:1px dashed var(--color-border);">
                    <span class="material-icons-round" style="font-size:20px;vertical-align:middle;color:var(--color-warning);margin-right:var(--spacing-xs);">construction</span>
                    <span style="color:var(--color-text-muted);font-size:var(--font-size-sm);">Coming Soon</span>
                </div>
                <button class="btn btn-secondary" style="margin-top:var(--spacing-xl);" onclick="Router.navigate('/')">
                    <span class="material-icons-round" style="font-size:18px;vertical-align:middle;margin-right:4px;">arrow_back</span>
                    Về trang chủ
                </button>
            </div>
        `;
    }
};
