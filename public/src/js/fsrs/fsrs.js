// ============================================
// FSRS - Free Spaced Repetition Scheduler
// ============================================
// Phiên bản hiện tại: scheduling theo bậc cố định (Anki-style fixed steps)
// Lịch ôn: 10 phút -> 1 ngày -> 3 ngày -> 1 tuần -> 1 tháng (cap)

const FSRS = {
    // Default parameters (FSRS v5) - giữ lại cho tương thích / mở rộng sau
    params: {
        w: [0.4, 0.6, 2.4, 5.8, 4.93, 0.94, 0.86, 0.01, 1.49, 0.14, 0.94, 2.18, 0.05, 0.34, 1.26, 0.29, 2.61],
        requestRetention: 0.9,
        maximumInterval: 36500
    },

    // Bậc ôn tập cố định (đơn vị: phút)
    Steps: [
        10,        // bậc 0: 10 phút      (lần ôn đầu sau khi học)
        1440,      // bậc 1: 1 ngày
        4320,      // bậc 2: 3 ngày
        10080,     // bậc 3: 1 tuần
        43200      // bậc 4: 1 tháng (cap)
    ],

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
            stepIndex: -1,        // -1 = chưa từng bước vào lịch (NEW)
            dueDate: new Date(),
            reps: 0,
            lapses: 0,
            lastReview: null
        };
    },

    /**
     * Lấy interval (phút) ứng với 1 bậc trong Steps. Nếu vượt cap -> bậc cuối.
     */
    _stepMinutes(index) {
        const i = Math.max(0, Math.min(this.Steps.length - 1, index));
        return this.Steps[i];
    },

    /**
     * Process a review rating for a card
     * @param {Object} card - Card with FSRS parameters
     * @param {number} rating - 1=Again, 2=Hard, 3=Good, 4=Easy
     * @returns {Object} Updated card
     */
    review(card, rating) {
        const now = new Date();
        const updatedCard = { ...card };

        const prevState = card.state ?? this.State.NEW;
        // stepIndex hợp lệ; nếu thiếu thì coi như -1 (chưa vào bậc)
        const prevStep = (typeof card.stepIndex === 'number') ? card.stepIndex : -1;
        const lastIdx = this.Steps.length - 1;

        updatedCard.reps = (card.reps || 0) + 1;
        updatedCard.lastReview = now;

        let nextStep;
        let nextState;

        switch (rating) {
            case this.Rating.AGAIN:
                // Quên: reset về bậc 0 (10 phút).
                // Nếu đã từng REVIEW thì coi là RELEARNING (lapse), còn lại là LEARNING.
                nextStep = 0;
                updatedCard.lapses = (card.lapses || 0) + 1;
                nextState = (prevState === this.State.REVIEW || prevState === this.State.RELEARNING)
                    ? this.State.RELEARNING
                    : this.State.LEARNING;
                break;

            case this.Rating.HARD:
                // Khó: giữ nguyên bậc hiện tại (không tiến).
                // Nếu là NEW thì cho vào bậc 0 (10 phút).
                nextStep = prevStep < 0 ? 0 : prevStep;
                // State: vào REVIEW khi đã ở bậc >= 1 (>= 1 ngày), ngược lại còn LEARNING/RELEARNING.
                if (nextStep >= 1) {
                    nextState = (prevState === this.State.RELEARNING) ? this.State.REVIEW : this.State.REVIEW;
                } else {
                    nextState = (prevState === this.State.REVIEW || prevState === this.State.RELEARNING)
                        ? this.State.RELEARNING
                        : this.State.LEARNING;
                }
                break;

            case this.Rating.GOOD:
                // Tốt: tiến lên 1 bậc.
                nextStep = prevStep < 0 ? 0 : Math.min(lastIdx, prevStep + 1);
                nextState = nextStep >= 1 ? this.State.REVIEW
                    : (prevState === this.State.REVIEW ? this.State.REVIEW : this.State.LEARNING);
                break;

            case this.Rating.EASY:
                // Dễ: nhảy thẳng 2 bậc.
                nextStep = prevStep < 0 ? 1 : Math.min(lastIdx, prevStep + 2);
                nextState = this.State.REVIEW;
                break;

            default:
                nextStep = prevStep < 0 ? 0 : prevStep;
                nextState = prevState;
        }

        const interval = this._stepMinutes(nextStep);

        updatedCard.stepIndex = nextStep;
        updatedCard.state = nextState;
        updatedCard.stability = interval;       // giữ field cũ (đơn vị phút)
        updatedCard.dueDate = new Date(now.getTime() + interval * 60 * 1000);

        const dDelta = rating < 3 ? 0.1 : -0.05;
        const baseDifficulty = Number(card.difficulty) || 0;
        updatedCard.difficulty = Math.max(0, Math.min(1, baseDifficulty + dDelta));

        return updatedCard;
    },

    /**
     * Check if a card is due for review
     */
    isDue(card) {
        if (!card || !card.dueDate) return true;
        const dueDate = card.dueDate instanceof Date ? card.dueDate : new Date(card.dueDate);
        return dueDate <= new Date();
    },

    /**
     * Get rating label in Vietnamese
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

    /**
     * Nhãn bậc hiện tại để debug / UI
     */
    getStepLabel(stepIndex) {
        const labels = ['10 phút', '1 ngày', '3 ngày', '1 tuần', '1 tháng'];
        const i = Math.max(0, Math.min(labels.length - 1, stepIndex ?? 0));
        return labels[i];
    },

    init() {
        console.log('[FSRS] Initialized (fixed-step mode):', this.Steps.map((m, i) => `${i}=${this.getStepLabel(i)}`).join(' | '));
    }
};
