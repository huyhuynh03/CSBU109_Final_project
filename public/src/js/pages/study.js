// ============================================
// Study Page - Learn new cards
// ============================================
// Stub - Will be fully implemented in Phase 4

const StudyPage = {
    render() {
        return `
            <div class="study-page page-enter">
                <div class="empty-state">
                    <img src="/icons/icon-192.png" alt="Học mới" class="empty-state-icon" style="width:64px;height:64px;border-radius:12px;">
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
