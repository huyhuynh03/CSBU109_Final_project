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
     * Process a review rating for a card.
     * Anki-style learning steps cho thẻ mới (đảm bảo user sẽ thấy thẻ
     * tới hạn ôn tập trong vài phút sau khi học, không phải sau 1 ngày).
     *
     * NEW (vừa học lần đầu):
     *   AGAIN → 1 min  (RELEARNING)
     *   HARD  → 5 min  (LEARNING)
     *   GOOD  → 10 min (LEARNING) — graduate sau 1 cycle GOOD nữa
     *   EASY  → 4 giờ (REVIEW)   — graduate ngay nhưng vẫn review trong ngày
     *
     * LEARNING (đang trong learning steps):
     *   AGAIN → 1 min  (LEARNING)
     *   HARD  → 10 min (LEARNING)
     *   GOOD  → 1 day  (REVIEW)  — graduate
     *   EASY  → 4 day  (REVIEW)
     *
     * REVIEW (đã graduate):
     *   AGAIN → 10 min (RELEARNING) + lapse++
     *   HARD  → stability * 1.2 (min 1 day)
     *   GOOD  → stability * 2.5
     *   EASY  → stability * 3.5
     *
     * RELEARNING:
     *   AGAIN → 1 min
     *   HARD  → 10 min
     *   GOOD  → 1 day  (REVIEW)
     *   EASY  → 2 day  (REVIEW)
     */
    review(card, rating) {
        const now = new Date();
        const updatedCard = { ...card };

        updatedCard.reps++;
        updatedCard.lastReview = now;

        const ONE_DAY = 1440;
        const state = (card.state === undefined || card.state === null) ? this.State.NEW : card.state;
        let interval;       // phút
        let nextState;

        if (state === this.State.NEW || state === 'new') {
            switch (rating) {
                case this.Rating.AGAIN: interval = 1;       nextState = this.State.RELEARNING; updatedCard.lapses++; break;
                case this.Rating.HARD:  interval = 5;       nextState = this.State.LEARNING;   break;
                case this.Rating.GOOD:  interval = 10;      nextState = this.State.LEARNING;   break;
                case this.Rating.EASY:  interval = 240;     nextState = this.State.REVIEW;     break; // 4h
                default:                interval = 10;      nextState = this.State.LEARNING;
            }
        } else if (state === this.State.LEARNING || state === 'learning') {
            switch (rating) {
                case this.Rating.AGAIN: interval = 1;             nextState = this.State.LEARNING; updatedCard.lapses++; break;
                case this.Rating.HARD:  interval = 10;            nextState = this.State.LEARNING; break;
                case this.Rating.GOOD:  interval = ONE_DAY;       nextState = this.State.REVIEW;   break;
                case this.Rating.EASY:  interval = ONE_DAY * 4;   nextState = this.State.REVIEW;   break;
                default:                interval = ONE_DAY;       nextState = this.State.REVIEW;
            }
        } else if (state === this.State.RELEARNING || state === 'relearning') {
            switch (rating) {
                case this.Rating.AGAIN: interval = 1;             nextState = this.State.RELEARNING; updatedCard.lapses++; break;
                case this.Rating.HARD:  interval = 10;            nextState = this.State.RELEARNING; break;
                case this.Rating.GOOD:  interval = ONE_DAY;       nextState = this.State.REVIEW;     break;
                case this.Rating.EASY:  interval = ONE_DAY * 2;   nextState = this.State.REVIEW;     break;
                default:                interval = ONE_DAY;       nextState = this.State.REVIEW;
            }
        } else {
            // REVIEW
            const stab = Math.max(card.stability || ONE_DAY, ONE_DAY); // tối thiểu 1 ngày
            switch (rating) {
                case this.Rating.AGAIN: interval = 10;                            nextState = this.State.RELEARNING; updatedCard.lapses++; break;
                case this.Rating.HARD:  interval = Math.max(ONE_DAY, stab * 1.2); nextState = this.State.REVIEW; break;
                case this.Rating.GOOD:  interval = stab * 2.5;                    nextState = this.State.REVIEW; break;
                case this.Rating.EASY:  interval = stab * 3.5;                    nextState = this.State.REVIEW; break;
                default:                interval = stab * 2;                      nextState = this.State.REVIEW;
            }
            // Cap maximumInterval
            const maxMin = this.params.maximumInterval * ONE_DAY;
            if (interval > maxMin) interval = maxMin;
        }

        updatedCard.state = nextState;
        updatedCard.stability = interval;
        updatedCard.difficulty = Math.max(0, Math.min(1, (card.difficulty || 0) + (rating < 3 ? 0.1 : -0.05)));

        // Convert interval (minutes) → dueDate
        updatedCard.dueDate = new Date(now.getTime() + interval * 60 * 1000);

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
