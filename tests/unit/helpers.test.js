// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import Helpers from '../../packages/shell/src/js/utils/helpers.js';

describe('Helpers - generateId', () => {
    it('trả về chuỗi không rỗng và khác nhau giữa các lần gọi', () => {
        const a = Helpers.generateId();
        const b = Helpers.generateId();
        expect(typeof a).toBe('string');
        expect(a.length).toBeGreaterThan(0);
        expect(a).not.toBe(b);
    });
});

describe('Helpers - debounce', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('chỉ gọi hàm gốc một lần sau chuỗi lệnh liên tiếp, với đối số cuối cùng', () => {
        const fn = vi.fn();
        const debounced = Helpers.debounce(fn, 300);
        debounced('a');
        debounced('b');
        debounced('c');
        expect(fn).not.toHaveBeenCalled();
        vi.advanceTimersByTime(299);
        expect(fn).not.toHaveBeenCalled();
        vi.advanceTimersByTime(1);
        expect(fn).toHaveBeenCalledTimes(1);
        expect(fn).toHaveBeenCalledWith('c');
    });

    it('dùng delay mặc định 300ms', () => {
        const fn = vi.fn();
        Helpers.debounce(fn)();
        vi.advanceTimersByTime(300);
        expect(fn).toHaveBeenCalledTimes(1);
    });
});

describe('Helpers - throttle', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('gọi ngay lần đầu, bỏ qua các lần gọi trong khoảng limit', () => {
        const fn = vi.fn();
        const throttled = Helpers.throttle(fn, 200);
        throttled(1);
        throttled(2);
        throttled(3);
        expect(fn).toHaveBeenCalledTimes(1);
        expect(fn).toHaveBeenCalledWith(1);
    });

    it('cho phép gọi lại sau khi hết limit', () => {
        const fn = vi.fn();
        const throttled = Helpers.throttle(fn, 200);
        throttled('first');
        vi.advanceTimersByTime(200);
        throttled('second');
        expect(fn).toHaveBeenCalledTimes(2);
        expect(fn).toHaveBeenLastCalledWith('second');
    });
});

describe('Helpers - escapeHtml', () => {
    it('escape các ký tự HTML nguy hiểm', () => {
        expect(Helpers.escapeHtml('<script>alert("x")</script>'))
            .toBe('&lt;script&gt;alert("x")&lt;/script&gt;');
        expect(Helpers.escapeHtml('a & b')).toBe('a &amp; b');
    });

    it('trả về chuỗi rỗng cho đầu vào rỗng', () => {
        expect(Helpers.escapeHtml('')).toBe('');
    });
});

describe('Helpers - formatDate', () => {
    it('trả về chuỗi rỗng khi không có date', () => {
        expect(Helpers.formatDate(null)).toBe('');
        expect(Helpers.formatDate(undefined)).toBe('');
    });

    it('định dạng Date theo vi-VN (dd/mm/yyyy)', () => {
        expect(Helpers.formatDate(new Date(2026, 0, 15))).toBe('15/01/2026');
    });

    it('hỗ trợ timestamp dạng number', () => {
        expect(Helpers.formatDate(new Date(2026, 4, 3).getTime())).toBe('03/05/2026');
    });

    it('hỗ trợ Firestore Timestamp (có toDate)', () => {
        const ts = { toDate: () => new Date(2026, 11, 31) };
        expect(Helpers.formatDate(ts)).toBe('31/12/2026');
    });
});

describe('Helpers - formatRelativeTime', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 0, 10, 12, 0, 0));
    });
    afterEach(() => vi.useRealTimers());

    it('trả về chuỗi rỗng khi không có date', () => {
        expect(Helpers.formatRelativeTime(null)).toBe('');
    });

    it('dưới 60 giây -> "Vừa xong"', () => {
        expect(Helpers.formatRelativeTime(new Date(Date.now() - 30 * 1000))).toBe('Vừa xong');
    });

    it('dưới 60 phút -> số phút', () => {
        expect(Helpers.formatRelativeTime(new Date(Date.now() - 5 * 60 * 1000))).toBe('5 phút trước');
    });

    it('dưới 24 giờ -> số giờ', () => {
        expect(Helpers.formatRelativeTime(new Date(Date.now() - 3 * 60 * 60 * 1000))).toBe('3 giờ trước');
    });

    it('dưới 7 ngày -> số ngày', () => {
        expect(Helpers.formatRelativeTime(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000))).toBe('2 ngày trước');
    });

    it('từ 7 ngày trở lên -> hiển thị ngày đầy đủ', () => {
        const old = new Date(2025, 11, 1);
        expect(Helpers.formatRelativeTime(old)).toBe('01/12/2025');
    });

    it('hỗ trợ timestamp number và Firestore Timestamp', () => {
        expect(Helpers.formatRelativeTime(Date.now() - 120 * 1000)).toBe('2 phút trước');
        expect(Helpers.formatRelativeTime({ toDate: () => new Date(Date.now() - 4 * 60 * 60 * 1000) }))
            .toBe('4 giờ trước');
    });
});

describe('Helpers - compareIgnoreCase', () => {
    it('so sánh không phân biệt hoa thường và bỏ khoảng trắng đầu/cuối', () => {
        expect(Helpers.compareIgnoreCase('  Hello ', 'hello')).toBe(true);
        expect(Helpers.compareIgnoreCase('ABC', 'abd')).toBe(false);
    });

    it('trả về false nếu một trong hai đầu vào rỗng', () => {
        expect(Helpers.compareIgnoreCase('', 'a')).toBe(false);
        expect(Helpers.compareIgnoreCase('a', null)).toBe(false);
    });
});

describe('Helpers - fuzzyCompare', () => {
    it('bỏ qua hoa thường, dấu câu và khoảng trắng thừa', () => {
        expect(Helpers.fuzzyCompare('Hello,  World!', 'hello world')).toBe(true);
        expect(Helpers.fuzzyCompare("don't-stop", 'dont-stop')).toBe(true);
    });

    it('trả về false khi nội dung khác nhau', () => {
        expect(Helpers.fuzzyCompare('cat', 'dog')).toBe(false);
    });

    it('trả về false nếu một trong hai đầu vào rỗng', () => {
        expect(Helpers.fuzzyCompare('', 'a')).toBe(false);
        expect(Helpers.fuzzyCompare('a', '')).toBe(false);
    });
});

describe('Helpers - sleep', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('resolve sau đúng số ms chỉ định', async () => {
        let done = false;
        const p = Helpers.sleep(500).then(() => { done = true; });
        vi.advanceTimersByTime(499);
        await Promise.resolve();
        expect(done).toBe(false);
        vi.advanceTimersByTime(1);
        await p;
        expect(done).toBe(true);
    });
});

describe('Helpers - jsonParse', () => {
    it('parse JSON hợp lệ', () => {
        expect(Helpers.jsonParse('{"a":1}')).toEqual({ a: 1 });
    });

    it('trả về fallback mặc định (null) khi JSON lỗi', () => {
        expect(Helpers.jsonParse('{bad json')).toBeNull();
    });

    it('trả về fallback tuỳ chỉnh khi JSON lỗi', () => {
        expect(Helpers.jsonParse('not-json', [])).toEqual([]);
    });
});

describe('Helpers - storage', () => {
    beforeEach(() => localStorage.clear());

    it('set rồi get trả về đúng giá trị (đã serialize JSON)', () => {
        Helpers.storage.set('user', { name: 'An', level: 3 });
        expect(Helpers.storage.get('user')).toEqual({ name: 'An', level: 3 });
    });

    it('get key không tồn tại trả về fallback', () => {
        expect(Helpers.storage.get('missing')).toBeNull();
        expect(Helpers.storage.get('missing', 'def')).toBe('def');
    });

    it('get dữ liệu không phải JSON hợp lệ trả về fallback', () => {
        localStorage.setItem('broken', '{not json');
        expect(Helpers.storage.get('broken', 'fb')).toBe('fb');
    });

    it('remove xoá key', () => {
        Helpers.storage.set('k', 1);
        Helpers.storage.remove('k');
        expect(localStorage.getItem('k')).toBeNull();
    });

    it('set không throw khi localStorage lỗi (chỉ cảnh báo)', () => {
        const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            throw new Error('QuotaExceeded');
        });
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        expect(() => Helpers.storage.set('k', 'v')).not.toThrow();
        expect(warn).toHaveBeenCalled();
        spy.mockRestore();
        warn.mockRestore();
    });
});

describe('Helpers - createElement', () => {
    it('tạo element với tag, className, attribute và dataset', () => {
        const el = Helpers.createElement('div', {
            className: 'card active',
            id: 'c1',
            dataset: { level: '2' }
        });
        expect(el.tagName).toBe('DIV');
        expect(el.className).toBe('card active');
        expect(el.getAttribute('id')).toBe('c1');
        expect(el.dataset.level).toBe('2');
    });

    it('áp dụng style object', () => {
        const el = Helpers.createElement('span', { style: { color: 'red' } });
        expect(el.style.color).toBe('red');
    });

    it('gắn event listener từ thuộc tính onXxx', () => {
        const onClick = vi.fn();
        const el = Helpers.createElement('button', { onClick });
        el.click();
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('thêm children là chuỗi (text node) và Node', () => {
        const child = document.createElement('em');
        const el = Helpers.createElement('p', {}, 'Xin chào ', child);
        expect(el.textContent).toBe('Xin chào ');
        expect(el.querySelector('em')).toBe(child);
    });

    it('không chèn HTML từ chuỗi children (tránh XSS)', () => {
        const el = Helpers.createElement('p', {}, '<img src=x onerror=alert(1)>');
        expect(el.querySelector('img')).toBeNull();
        expect(el.textContent).toBe('<img src=x onerror=alert(1)>');
    });
});
