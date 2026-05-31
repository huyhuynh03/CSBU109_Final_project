// ============================================================================
// slug.js — Sinh tên file audio deterministic từ một "từ"
// ----------------------------------------------------------------------------
// QUAN TRỌNG: hàm slugify ở đây PHẢI khớp 1:1 với hàm cùng tên phía client
// (packages/shell/src/js/utils/tts.js). Nhờ vậy app suy ra được đường dẫn
// audio từ chính từ vựng mà KHÔNG cần lưu audioUrl vào seed.
//
// Quy tắc:
//   "routine"        -> "routine.mp3"
//   "season ticket"  -> "season-ticket.mp3"
//   "hat trick"      -> "hat-trick.mp3"
//   "re-enter"       -> "re-enter.mp3"
//   "naïve café"     -> "naive-cafe.mp3"  (bỏ dấu, hạ chữ thường)
//
// Lưu ý: slugify có thể gây va chạm hiếm gặp (vd "co-op" vs "co op"). Bước
// trích từ (extract-words.js) sẽ phát hiện và cảnh báo va chạm để xử lý tay.
// ============================================================================

/**
 * Chuẩn hoá một từ thành slug an toàn cho tên file.
 * @param {string} word
 * @returns {string}
 */
function slugify(word) {
    return String(word)
        .normalize('NFD')                 // tách dấu khỏi ký tự gốc
        .replace(/[\u0300-\u036f]/g, '')  // bỏ dấu (diacritics)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')      // mọi ký tự không phải alnum -> '-'
        .replace(/^-+|-+$/g, '');         // bỏ '-' ở đầu/cuối
}

/**
 * Trả về tên file đầy đủ cho một từ.
 * @param {string} word
 * @param {string} ext  phần mở rộng không có dấu chấm (vd 'mp3')
 * @returns {string}
 */
function audioFileName(word, ext = 'mp3') {
    return `${slugify(word)}.${ext}`;
}

module.exports = { slugify, audioFileName };
