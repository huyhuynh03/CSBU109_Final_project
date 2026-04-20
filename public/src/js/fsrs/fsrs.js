// ============================================
// FSRS - Free Spaced Repetition Scheduler
// ============================================
// Stub - Will be fully implemented in Phase 4
// Based on FSRS v5 algorithm

const FSRS = {
    // Default parameters (FSRS v5)
    params: {
        w: [0.4, 0.6, 2.4, 5.8, 4.93, 0.94, 0.86, 0.01, 1.49, 0.14, 0.94, 2.18, 0.05, 0.34, 1.26, 0.29, 2.61],
        requestRetention: 0.9,
        maximumInterval: 36500
    },

    // Card states
    State: {
        NEW: 0,
        LEARNING: 1,
        REVIEW: 2,
        RELEARNING: 3
    },

    // Rating levels
    Rating: {
        AGAIN: 1,
        HARD: 2,
        GOOD: 3,
        EASY: 4
    },

    /**
     * Create a new card with default FSRS parameters
     * @returns {Object}
     */
    createCard() {
        return {
            state: this.State.NEW,
            difficulty: 0,
            stability: 0,
            dueDate: new Date(),
            reps: 0,
            lapses: 0,
            lastReview: null
        };
    },

    /**
     * Process a review rating for a card
     * @param {Object} card - Card with FSRS parameters
     * @param {number} rating - 1=Again, 2=Hard, 3=Good, 4=Easy
     * @returns {Object} Updated card
     */
    review(card, rating) {
        // Stub implementation - giữ nguyên thang interval cũ,
        // chỉ phân loại state rõ ràng theo (state, rating) để tránh ghi đè sai.
        const now = new Date();
        const updatedCard = { ...card };
        const prevState = card.state ?? this.State.NEW;
        const prevStability = Number(card.stability) > 0 ? Number(card.stability) : 0;

        updatedCard.reps = (card.reps || 0) + 1;
        updatedCard.lastReview = now;

        let interval;   // tính bằng phút
        let nextState;

        switch (rating) {
            case this.Rating.AGAIN:
                // Quên: luôn 1 phút.
                // NEW/LEARNING -> LEARNING (chưa từng tốt nghiệp);
                // REVIEW/RELEARNING -> RELEARNING (đã từng tốt nghiệp, giờ học lại).
                interval = 1;
                updatedCard.lapses = (card.lapses || 0) + 1;
                if (prevState === this.State.NEW || prevState === this.State.LEARNING) {
                    nextState = this.State.LEARNING;
                } else {
                    nextState = this.State.RELEARNING;
                }
                break;

            case this.Rating.HARD:
                // Khó: NEW -> 5 phút (LEARNING).
                // LEARNING/RELEARNING -> giữ nguyên state, nhân nhẹ stability.
                // REVIEW -> giữ nguyên REVIEW (KHÔNG tụt về LEARNING), nhân 1.2.
                if (prevState === this.State.NEW) {
                    interval = 5;
                    nextState = this.State.LEARNING;
                } else if (prevState === this.State.REVIEW) {
                    interval = Math.max(1, prevStability * 1.2);
                    nextState = this.State.REVIEW;
                } else {
                    interval = Math.max(5, prevStability * 1.2);
                    nextState = prevState; // LEARNING hoặc RELEARNING
                }
                break;

            case this.Rating.GOOD:
                // Tốt: NEW -> 10 phút, tốt nghiệp sang REVIEW.
                // LEARNING/RELEARNING -> tốt nghiệp sang REVIEW.
                // REVIEW -> REVIEW, nhân 2.5.
                if (prevState === this.State.NEW) {
                    interval = 10;
                } else if (prevState === this.State.REVIEW) {
                    interval = Math.max(10, prevStability * 2.5);
                } else {
                    // LEARNING / RELEARNING graduate -> dùng tối thiểu 10 phút,
                    // nếu đã có stability cũ thì tận dụng (ví dụ relearning sau lapse).
                    interval = Math.max(10, prevStability * 2.5);
                }
                nextState = this.State.REVIEW;
                break;

            case this.Rating.EASY:
                // Dễ: NEW -> 1 ngày (1440 phút), tốt nghiệp REVIEW.
                // REVIEW -> nhân 3.5.
                // LEARNING/RELEARNING -> tốt nghiệp REVIEW với bonus.
                if (prevState === this.State.NEW) {
                    interval = 1440;
                } else if (prevState === this.State.REVIEW) {
                    interval = Math.max(1440, prevStability * 3.5);
                } else {
                    interval = Math.max(1440, prevStability * 3.5);
                }
                nextState = this.State.REVIEW;
                break;

            default:
                interval = 10;
                nextState = prevState;
        }

        updatedCard.state = nextState;

        // Convert interval (minutes) to due date - dùng cùng công thức cho mọi nhánh
        updatedCard.dueDate = new Date(now.getTime() + interval * 60 * 1000);

        updatedCard.stability = interval;
        const dDelta = rating < 3 ? 0.1 : -0.05;
        const baseDifficulty = Number(card.difficulty) || 0;
        updatedCard.difficulty = Math.max(0, Math.min(1, baseDifficulty + dDelta));

        return updatedCard;
    },

    /**
     * Check if a card is due for review
     * @param {Object} card
     * @returns {boolean}
     */
    isDue(card) {
        if (!card || !card.dueDate) return true;
        const dueDate = card.dueDate instanceof Date ? card.dueDate : new Date(card.dueDate);
        return dueDate <= new Date();
    },

    /**
     * Get rating label in Vietnamese
     * @param {number} rating
     * @returns {string}
     */
    getRatingLabel(rating) {
        const labels = {
            1: 'Quên',
            2: 'Khó',
            3: 'Tốt',
            4: 'Dễ'
        };
        return labels[rating] || '';
    },

    init() {
        console.log('[FSRS] Initialized');
    }
};
