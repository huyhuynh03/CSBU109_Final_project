// ============================================
// Study Page - Learn new cards
// ============================================
// Stub - Will be fully implemented in Phase 4

const StudyPage = {
    render() {
        return `
            <div class="study-page page-enter">
                <div class="empty-state">
                    <img src="/icons/icon-512.png" alt="Học mới" style="width:256px;height:256px;border-radius:32px;margin-bottom:var(--spacing-lg);">
                    <h3 class="empty-state-title">Học mới</h3>
                    <p class="empty-state-desc">Tính năng này sẽ được triển khai trong Phase 4. Bạn sẽ có thể học kiến thức mới với flashcard tại đây.</p>
                    <button class="btn btn-secondary" onclick="Router.navigate('/')">
                        <span class="material-icons-round">arrow_back</span>
                        Quay lại trang chính
                    </button>
                </div>
            </div>
        `;
    },

    onEnter() {
        console.log('[StudyPage] Entered');
    }
};
