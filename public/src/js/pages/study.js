// ============================================
// Study Page - Learn new cards
// ============================================
// Stub - Will be fully implemented in Phase 4

const StudyPage = {
    render() {
        return `
            <div class="study-page page-enter">
                <div class="empty-state">
                    <span class="material-icons-round empty-state-icon">school</span>
                    <h3 class="empty-state-title">Học từ mới</h3>
                    <p class="empty-state-desc">Tính năng này sẽ được triển khai trong Phase 4. Bạn sẽ có thể học từ vựng mới với flashcard tại đây.</p>
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
