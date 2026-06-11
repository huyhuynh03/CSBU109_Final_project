// ============================================
// FSRS - Free Spaced Repetition Scheduler
// ============================================
// Phiên bản hiện tại: scheduling theo bậc cố định (Anki-style fixed steps).
//
// ⚠ QUY ƯỚC QUAN TRỌNG về đánh số cấp độ:
//   - Trong DATA / CODE: dùng `stepIndex` 0-based (0..4)
//   - Trong UI / hiển thị cho user: dùng "Cấp độ N" 1-based (1..5) = stepIndex + 1
//   Bất cứ chỗ nào cần render ra màn hình hoặc toast, phải dịch `i + 1`.
//
// Bảng ánh xạ stepIndex ↔ "Cấp độ N" ↔ khoảng thời gian ôn lại:
//
//   stepIndex | UI        | Thời gian chờ ôn | Ghi chú
//   ----------|-----------|------------------|------------------------------------------
//     -1      | (n/a)     | —                | NEW, chưa bước vào lịch ôn
//     0       | Cấp độ 1  | 30 phút          | Lần ôn đầu sau khi học, cũng là bậc thấp nhất khi sai
//     1       | Cấp độ 2  | 24 giờ (1 ngày)  |
//     2       | Cấp độ 3  | 7 ngày           |
//     3       | Cấp độ 4  | 21 ngày          |
//     4       | Cấp độ 5  | 45 ngày (cap)    | Bậc cao nhất
//
// Quy tắc chuyển bậc khi ôn:
//   - AGAIN (sai 1 lần)        → lùi 1 bậc: stepIndex - 1 (không xuống dưới 0 = Cấp độ 1)
//   - HARD                     → giữ nguyên stepIndex hiện tại
//   - GOOD                     → stepIndex + 1 (tiến 1 cấp)
//   - EASY                     → stepIndex + 2 (nhảy 2 cấp)
//   (Tất cả đều bị cap tại stepIndex = 4 = Cấp độ 5)
//
// Xem thêm: plans/review-levels-mapping.md

const FSRS = {
    // Default parameters (FSRS v5) - giữ lại cho tương thích / mở rộng sau
    params: {
        w: [0.4, 0.6, 2.4, 5.8, 4.93, 0.94, 0.86, 0.01, 1.49, 0.14, 0.94, 2.18, 0.05, 0.34, 1.26, 0.29, 2.61],
        requestRetention: 0.9,
        maximumInterval: 36500
    },

    // Bậc ôn tập cố định (đơn vị: phút)
    // LƯU Ý: stepIndex trong code là 0-based, nhưng UI hiển thị là "Cấp độ N" (1-based).
    Steps: [
        30,         // stepIndex 0 = UI "Cấp độ 1" → 30 phút  (lần ôn đầu sau khi học, cũng là điểm reset khi sai)
        1440,       // stepIndex 1 = UI "Cấp độ 2" → 24 giờ (1 ngày)
        10080,      // stepIndex 2 = UI "Cấp độ 3" → 7 ngày
        30240,      // stepIndex 3 = UI "Cấp độ 4" → 21 ngày
        64800       // stepIndex 4 = UI "Cấp độ 5" → 45 ngày (cap - bậc cao nhất)
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
     *   AGAIN -> lùi 1 bậc: max(0, cur - 1) (NEW => 0, không xuống dưới Cấp độ 1)
     *   HARD  -> giữ nguyên (NEW => 0)
     *   GOOD  -> tiến +1 bậc (NEW => 0)
     *   EASY  -> tiến +2 bậc (NEW => 1, nhảy bỏ 10 phút)
     * Cap ở bậc cuối (Steps.length - 1).
     */
    _computeNextStep(prevStep, rating) {
        const last = this.Steps.length - 1;
        const cur = (typeof prevStep === 'number' && prevStep >= 0) ? prevStep : -1;

        switch (rating) {
            case this.Rating.AGAIN: return cur < 0 ? 0 : Math.max(0, cur - 1);
            case this.Rating.HARD:  return cur < 0 ? 0 : cur;
            case this.Rating.GOOD:  return cur < 0 ? 0 : Math.min(last, cur + 1);
            case this.Rating.EASY:  return cur < 0 ? 1 : Math.min(last, cur + 2);
            default:                return cur < 0 ? 0 : cur;
        }
    },

    /**
     * Tính state kế tiếp dựa trên (state trước, rating).
     * Quy tắc dứt khoát theo rating (không nhìn bậc sau):
     *   - PASS (HARD / GOOD / EASY): luôn REVIEW — card đã graduate vào pipeline ôn tập,
     *     cho dù bậc hiện tại mới là Cấp độ 1 (30 phút).
     *   - AGAIN:
     *       + nếu trước là REVIEW / RELEARNING -> RELEARNING (lapse)
     *       + ngược lại (NEW / LEARNING)       -> LEARNING  (vẫn ở pool học mới)
     *
     * Lý do bỏ nhánh cũ "nextStep=0 + NEW -> LEARNING":
     *   Nhánh đó khiến từ vừa học xong lần đầu (Cấp độ 1) vẫn bị coi là "chưa học",
     *   xuất hiện trở lại trong màn Học mới — tạo cảm giác phải học 2 lần mới "chốt".
     *   Semantic đúng: cứ pass = graduate, chỉ AGAIN mới quay lại pool học mới.
     */
    _computeNextState(prevState, rating) {
        const wasMature = (prevState === this.State.REVIEW || prevState === this.State.RELEARNING);
        if (rating === this.Rating.AGAIN) {
            return wasMature ? this.State.RELEARNING : this.State.LEARNING;
        }
        return this.State.REVIEW;
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
        const nextState = this._computeNextState(prevState, rating);
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
        const labels = ['30 phút', '24 giờ', '7 ngày', '21 ngày', '45 ngày'];
        const i = Math.max(0, Math.min(labels.length - 1, stepIndex ?? 0));
        return labels[i];
    },

    init() {
        console.log('[FSRS] Initialized (fixed-step mode):', this.Steps.map((m, i) => `${i}=${this.getStepLabel(i)}`).join(' | '));
    }
};


export default FSRS;
