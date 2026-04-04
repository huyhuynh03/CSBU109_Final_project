// ============================================
// Review Page - Spaced Repetition Review
// ============================================
// Stub - Will be fully implemented in Phase 4

const ReviewPage = {
    render() {
        return `
            <div class="review-page page-enter">
                <div class="empty-state">
                    <span class="material-icons-round empty-state-icon">replay</span>
                    <h3 class="empty-state-title">Ôn tập</h3>
                    <p class="empty-state-desc">Tính năng này sẽ được triển khai trong Phase 4. Hệ thống FSRS sẽ tự động đưa thẻ cần ôn vào đây.</p>
                    <button class="btn btn-secondary" onclick="Router.navigate('/')">
                        <span class="material-icons-round">arrow_back</span>
                        Quay lại trang chính
                    </button>
                </div>
            </div>
        `;
    },

    onEnter() {
        console.log('[ReviewPage] Entered');
    }
};
