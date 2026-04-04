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
        // Stub implementation - will be replaced with full FSRS v5 algorithm
        const now = new Date();
        const updatedCard = { ...card };

        updatedCard.reps++;
        updatedCard.lastReview = now;

        // Simple interval calculation (placeholder)
        let interval;
        switch (rating) {
            case this.Rating.AGAIN:
                interval = 1; // 1 minute
                updatedCard.lapses++;
                updatedCard.state = this.State.RELEARNING;
                break;
            case this.Rating.HARD:
                interval = card.state === this.State.NEW ? 5 : Math.max(1, card.stability * 1.2);
                updatedCard.state = this.State.LEARNING;
                break;
            case this.Rating.GOOD:
                interval = card.state === this.State.NEW ? 10 : Math.max(1, card.stability * 2.5);
                updatedCard.state = this.State.REVIEW;
                break;
            case this.Rating.EASY:
                interval = card.state === this.State.NEW ? 1440 : Math.max(1, card.stability * 3.5);
                updatedCard.state = this.State.REVIEW;
                break;
            default:
                interval = 10;
        }

        // Convert interval (minutes) to due date
        if (interval < 1440) {
            // Less than a day - use minutes
            updatedCard.dueDate = new Date(now.getTime() + interval * 60 * 1000);
        } else {
            // Days
            const days = interval / 1440;
            updatedCard.dueDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
        }

        updatedCard.stability = interval;
        updatedCard.difficulty = Math.max(0, Math.min(1, card.difficulty + (rating < 3 ? 0.1 : -0.05)));

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
