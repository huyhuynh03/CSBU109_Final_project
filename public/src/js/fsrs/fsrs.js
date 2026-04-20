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
    /**
     * Tính bậc kế tiếp dựa trên bậc trước và rating.
     * Hàm thuần (pure) - chỉ phụ thuộc 2 tham số -> không thể "ghi đè" nhau.
     *   AGAIN -> 0
     *   HARD  -> giữ nguyên (NEW => 0)
     *   GOOD  -> tiến +1 bậc (NEW => 0)
     *   EASY  -> tiến +2 bậc (NEW => 1, nhảy bỏ 10 phút)
     * Cap ở bậc cuối (Steps.length - 1).
     */
    _computeNextStep(prevStep, rating) {
        const last = this.Steps.length - 1;
        const cur = (typeof prevStep === 'number' && prevStep >= 0) ? prevStep : -1;

        switch (rating) {
            case this.Rating.AGAIN: return 0;
            case this.Rating.HARD:  return cur < 0 ? 0 : cur;
            case this.Rating.GOOD:  return cur < 0 ? 0 : Math.min(last, cur + 1);
            case this.Rating.EASY:  return cur < 0 ? 1 : Math.min(last, cur + 2);
            default:                return cur < 0 ? 0 : cur;
        }
    },

    /**
     * Tính state kế tiếp dựa trên (state trước, bậc sau, rating).
     * Quy tắc duy nhất, không phân tán theo case rating:
     *   - bậc sau = 0 (10 phút):
     *       + nếu trước là REVIEW/RELEARNING  -> RELEARNING (lapse)
     *       + ngược lại                       -> LEARNING
     *   - bậc sau >= 1 (>= 1 ngày): luôn REVIEW (đã graduate / đang trưởng thành)
     */
    _computeNextState(prevState, nextStep) {
        const wasMature = (prevState === this.State.REVIEW || prevState === this.State.RELEARNING);
        if (nextStep >= 1) return this.State.REVIEW;
        return wasMature ? this.State.RELEARNING : this.State.LEARNING;
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
        const prevStep  = (typeof card.stepIndex === 'number') ? card.stepIndex : -1;

        // 2 hàm thuần -> không thể ghi đè / chồng chéo nhau
        const nextStep  = this._computeNextStep(prevStep, rating);
        const nextState = this._computeNextState(prevState, nextStep);
        const interval  = this._stepMinutes(nextStep);

        updatedCard.reps      = (card.reps || 0) + 1;
        updatedCard.lastReview = now;
        if (rating === this.Rating.AGAIN) {
            updatedCard.lapses = (card.lapses || 0) + 1;
        }

        updatedCard.stepIndex  = nextStep;
        updatedCard.state      = nextState;
        updatedCard.stability  = interval;       // giữ field cũ (đơn vị phút)
        updatedCard.dueDate    = new Date(now.getTime() + interval * 60 * 1000);

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
