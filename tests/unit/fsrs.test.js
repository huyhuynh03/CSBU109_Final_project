import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import FSRS from '../../packages/shell/src/js/fsrs/fsrs.js';

const { Rating, State } = FSRS;
const MIN = 60 * 1000;

describe('FSRS - cấu hình bậc ôn tập', () => {
    it('có đúng 5 bậc cố định theo đơn vị phút', () => {
        expect(FSRS.Steps).toEqual([30, 1440, 10080, 30240, 64800]);
    });

    it('getStepLabel trả nhãn đúng và kẹp index ngoài phạm vi', () => {
        expect(FSRS.getStepLabel(0)).toBe('30 phút');
        expect(FSRS.getStepLabel(4)).toBe('45 ngày');
        expect(FSRS.getStepLabel(-1)).toBe('30 phút');
        expect(FSRS.getStepLabel(10)).toBe('45 ngày');
        expect(FSRS.getStepLabel(null)).toBe('30 phút');
    });

    it('getRatingLabel trả nhãn tiếng Việt, rỗng với rating lạ', () => {
        expect(FSRS.getRatingLabel(Rating.AGAIN)).toBe('Quên');
        expect(FSRS.getRatingLabel(Rating.HARD)).toBe('Khó');
        expect(FSRS.getRatingLabel(Rating.GOOD)).toBe('Tốt');
        expect(FSRS.getRatingLabel(Rating.EASY)).toBe('Dễ');
        expect(FSRS.getRatingLabel(99)).toBe('');
    });
});

describe('FSRS - createCard', () => {
    it('tạo thẻ mới với trạng thái NEW và stepIndex = -1', () => {
        const card = FSRS.createCard();
        expect(card.state).toBe(State.NEW);
        expect(card.stepIndex).toBe(-1);
        expect(card.reps).toBe(0);
        expect(card.lapses).toBe(0);
        expect(card.lastReview).toBeNull();
        expect(card.dueDate).toBeInstanceOf(Date);
    });
});

describe('FSRS - _computeNextStep', () => {
    it('thẻ NEW (cur < 0): GOOD/HARD/AGAIN về bậc 0, EASY nhảy lên bậc 1', () => {
        expect(FSRS._computeNextStep(-1, Rating.GOOD)).toBe(0);
        expect(FSRS._computeNextStep(-1, Rating.HARD)).toBe(0);
        expect(FSRS._computeNextStep(-1, Rating.AGAIN)).toBe(0);
        expect(FSRS._computeNextStep(-1, Rating.EASY)).toBe(1);
    });

    it('AGAIN lùi 1 bậc, không xuống dưới 0', () => {
        expect(FSRS._computeNextStep(3, Rating.AGAIN)).toBe(2);
        expect(FSRS._computeNextStep(0, Rating.AGAIN)).toBe(0);
    });

    it('HARD giữ nguyên bậc', () => {
        expect(FSRS._computeNextStep(2, Rating.HARD)).toBe(2);
    });

    it('GOOD tiến 1 bậc, bị cap ở bậc cuối', () => {
        expect(FSRS._computeNextStep(1, Rating.GOOD)).toBe(2);
        expect(FSRS._computeNextStep(4, Rating.GOOD)).toBe(4);
    });

    it('EASY tiến 2 bậc, bị cap ở bậc cuối', () => {
        expect(FSRS._computeNextStep(1, Rating.EASY)).toBe(3);
        expect(FSRS._computeNextStep(3, Rating.EASY)).toBe(4);
        expect(FSRS._computeNextStep(4, Rating.EASY)).toBe(4);
    });

    it('rating không hợp lệ giữ nguyên bậc hiện tại', () => {
        expect(FSRS._computeNextStep(2, 0)).toBe(2);
        expect(FSRS._computeNextStep(-1, 0)).toBe(0);
    });
});

describe('FSRS - _computeNextState', () => {
    it('PASS (HARD/GOOD/EASY) luôn chuyển sang REVIEW', () => {
        for (const prev of [State.NEW, State.LEARNING, State.REVIEW, State.RELEARNING]) {
            expect(FSRS._computeNextState(prev, Rating.HARD)).toBe(State.REVIEW);
            expect(FSRS._computeNextState(prev, Rating.GOOD)).toBe(State.REVIEW);
            expect(FSRS._computeNextState(prev, Rating.EASY)).toBe(State.REVIEW);
        }
    });

    it('AGAIN từ NEW/LEARNING -> LEARNING', () => {
        expect(FSRS._computeNextState(State.NEW, Rating.AGAIN)).toBe(State.LEARNING);
        expect(FSRS._computeNextState(State.LEARNING, Rating.AGAIN)).toBe(State.LEARNING);
    });

    it('AGAIN từ REVIEW/RELEARNING -> RELEARNING (lapse)', () => {
        expect(FSRS._computeNextState(State.REVIEW, Rating.AGAIN)).toBe(State.RELEARNING);
        expect(FSRS._computeNextState(State.RELEARNING, Rating.AGAIN)).toBe(State.RELEARNING);
    });
});

describe('FSRS - review', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('không mutate thẻ đầu vào', () => {
        const card = FSRS.createCard();
        const snapshot = { ...card };
        FSRS.review(card, Rating.GOOD);
        expect(card).toEqual(snapshot);
    });

    it('thẻ NEW + GOOD: lên bậc 0, REVIEW, due sau 30 phút, reps = 1', () => {
        const next = FSRS.review(FSRS.createCard(), Rating.GOOD);
        expect(next.stepIndex).toBe(0);
        expect(next.state).toBe(State.REVIEW);
        expect(next.stability).toBe(30);
        expect(next.dueDate.getTime()).toBe(Date.now() + 30 * MIN);
        expect(next.reps).toBe(1);
        expect(next.lapses).toBe(0);
        expect(next.lastReview).toEqual(new Date(Date.now()));
    });

    it('thẻ NEW + EASY: nhảy sang bậc 1 (24 giờ)', () => {
        const next = FSRS.review(FSRS.createCard(), Rating.EASY);
        expect(next.stepIndex).toBe(1);
        expect(next.dueDate.getTime()).toBe(Date.now() + 1440 * MIN);
    });

    it('thẻ NEW + AGAIN: LEARNING, bậc 0, tăng lapses', () => {
        const next = FSRS.review(FSRS.createCard(), Rating.AGAIN);
        expect(next.state).toBe(State.LEARNING);
        expect(next.stepIndex).toBe(0);
        expect(next.lapses).toBe(1);
        expect(next.reps).toBe(1);
    });

    it('thẻ REVIEW ở bậc 2 + AGAIN: RELEARNING, lùi về bậc 1, lapses tăng', () => {
        const card = { ...FSRS.createCard(), state: State.REVIEW, stepIndex: 2, lapses: 1, reps: 5 };
        const next = FSRS.review(card, Rating.AGAIN);
        expect(next.state).toBe(State.RELEARNING);
        expect(next.stepIndex).toBe(1);
        expect(next.lapses).toBe(2);
        expect(next.reps).toBe(6);
    });

    it('thẻ ở bậc cao nhất + GOOD vẫn ở bậc cuối', () => {
        const card = { ...FSRS.createCard(), state: State.REVIEW, stepIndex: 4 };
        const next = FSRS.review(card, Rating.GOOD);
        expect(next.stepIndex).toBe(4);
        expect(next.dueDate.getTime()).toBe(Date.now() + 64800 * MIN);
    });

    it('difficulty tăng 0.1 khi AGAIN/HARD, giảm 0.05 khi GOOD/EASY, kẹp trong [0, 1]', () => {
        const base = FSRS.createCard();
        expect(FSRS.review(base, Rating.AGAIN).difficulty).toBeCloseTo(0.1);
        expect(FSRS.review(base, Rating.HARD).difficulty).toBeCloseTo(0.1);
        expect(FSRS.review(base, Rating.GOOD).difficulty).toBe(0);
        expect(FSRS.review({ ...base, difficulty: 0.5 }, Rating.GOOD).difficulty).toBeCloseTo(0.45);
        expect(FSRS.review({ ...base, difficulty: 0.95 }, Rating.AGAIN).difficulty).toBe(1);
    });

    it('xử lý thẻ thiếu field (state/stepIndex/reps/difficulty undefined)', () => {
        const next = FSRS.review({ dueDate: new Date() }, Rating.GOOD);
        expect(next.stepIndex).toBe(0);
        expect(next.state).toBe(State.REVIEW);
        expect(next.reps).toBe(1);
        expect(next.difficulty).toBe(0);
    });
});

describe('FSRS - isDue', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-01-01T12:00:00.000Z'));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('thẻ null hoặc không có dueDate luôn được coi là đến hạn', () => {
        expect(FSRS.isDue(null)).toBe(true);
        expect(FSRS.isDue(undefined)).toBe(true);
        expect(FSRS.isDue({})).toBe(true);
    });

    it('dueDate trong quá khứ hoặc bằng hiện tại -> đến hạn', () => {
        expect(FSRS.isDue({ dueDate: new Date('2025-12-31T00:00:00Z') })).toBe(true);
        expect(FSRS.isDue({ dueDate: new Date() })).toBe(true);
    });

    it('dueDate trong tương lai -> chưa đến hạn', () => {
        expect(FSRS.isDue({ dueDate: new Date('2026-01-02T00:00:00Z') })).toBe(false);
    });

    it('hỗ trợ dueDate dạng chuỗi ISO', () => {
        expect(FSRS.isDue({ dueDate: '2025-06-01T00:00:00Z' })).toBe(true);
        expect(FSRS.isDue({ dueDate: '2027-06-01T00:00:00Z' })).toBe(false);
    });
});
