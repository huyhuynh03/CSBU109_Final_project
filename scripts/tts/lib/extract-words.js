// ============================================================================
// extract-words.js — Trích danh sách từ vựng DUY NHẤT từ seed JSON
// ----------------------------------------------------------------------------
// Hoàn toàn language-agnostic: nhận vào một `langConfig` (từ config.js) và làm
// việc dựa trên langConfig.seedDirs + langConfig.seedField. Nhờ vậy module
// ngôn ngữ mới chỉ cần khai báo config là dùng lại được ngay.
//
// Trả về:
//   {
//     words:       [{ word, slug, fileName, sources: [seedFile,...] }, ...],
//     stats:       { totalCards, uniqueWords, skipped, filesRead },
//     collisions:  [{ slug, words: [w1, w2] }, ...]  // slug trùng từ khác nhau
//   }
//
// Dedup: theo dạng đã trim + hạ chữ thường, nhưng GIỮ lại bản viết gốc đầu tiên
// gặp được để gửi cho TTS (nhiều engine phát âm tốt hơn với chữ thường, nhưng
// ta tôn trọng nguyên gốc để an toàn cho danh từ riêng/viết tắt).
// ============================================================================

const fs = require('fs');
const path = require('path');
const { slugify, audioFileName } = require('./slug');

/**
 * Lấy giá trị lồng nhau theo đường dẫn mảng, an toàn với null/undefined.
 * getByPath({a:{b:1}}, ['a','b']) -> 1
 */
function getByPath(obj, pathArr) {
    let cur = obj;
    for (const key of pathArr) {
        if (cur == null || typeof cur !== 'object') return undefined;
        cur = cur[key];
    }
    return cur;
}

/**
 * Liệt kê file .json trong một thư mục (không đệ quy vào thư mục con như
 * backups/ để tránh nhặt phải dữ liệu trùng/cũ). Bỏ qua file không phải JSON.
 */
function listSeedFiles(dir) {
    let entries;
    try {
        entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch (err) {
        console.warn(`[extract] Không đọc được thư mục seed: ${dir} (${err.message})`);
        return [];
    }
    return entries
        .filter((e) => e.isFile() && e.name.toLowerCase().endsWith('.json'))
        .map((e) => path.join(dir, e.name));
}

/**
 * Trích các "từ" thô từ một file seed.
 * Hỗ trợ 2 hình dạng phổ biến:
 *   - { cards: [ { fieldValues: { word } }, ... ] }   (định dạng chuẩn repo)
 *   - [ { fieldValues: { word } }, ... ]              (mảng card trực tiếp)
 */
function extractRawWordsFromFile(filePath, seedField) {
    let json;
    try {
        json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (err) {
        console.warn(`[extract] Bỏ qua file lỗi JSON: ${filePath} (${err.message})`);
        return [];
    }

    const cards = Array.isArray(json) ? json : (Array.isArray(json.cards) ? json.cards : []);
    const words = [];
    for (const card of cards) {
        const raw = getByPath(card, seedField);
        if (typeof raw === 'string' && raw.trim()) {
            words.push(raw.trim());
        }
    }
    return words;
}

/**
 * Trích toàn bộ từ vựng duy nhất cho một ngôn ngữ.
 * @param {object} langConfig - một entry trong LANGUAGES (config.js)
 * @param {object} [opts]
 * @param {string} [opts.audioExt='mp3']
 * @returns {{words: Array, stats: object, collisions: Array}}
 */
function extractWords(langConfig, opts = {}) {
    const audioExt = opts.audioExt || 'mp3';
    const seedField = langConfig.seedField;

    const stats = { totalCards: 0, uniqueWords: 0, skipped: 0, filesRead: 0 };

    // dedup theo key chuẩn hoá (lowercase + trim)
    const byNormalized = new Map(); // normKey -> { word, slug, fileName, sources:Set }
    // theo dõi va chạm slug: slug -> Set(normKey gốc khác nhau)
    const slugOwners = new Map();   // slug -> Set(word gốc)

    for (const dir of langConfig.seedDirs) {
        const files = listSeedFiles(dir);
        for (const file of files) {
            stats.filesRead++;
            const rawWords = extractRawWordsFromFile(file, seedField);
            for (const raw of rawWords) {
                stats.totalCards++;
                const normKey = raw.toLowerCase();
                const slug = slugify(raw);

                if (!slug) {
                    stats.skipped++;
                    continue;
                }

                // ghi nhận chủ sở hữu slug để phát hiện va chạm
                if (!slugOwners.has(slug)) slugOwners.set(slug, new Set());
                slugOwners.get(slug).add(raw);

                if (byNormalized.has(normKey)) {
                    byNormalized.get(normKey).sources.add(path.basename(file));
                } else {
                    byNormalized.set(normKey, {
                        word: raw,
                        slug,
                        fileName: audioFileName(raw, audioExt),
                        sources: new Set([path.basename(file)])
                    });
                }
            }
        }
    }

    // chuẩn hoá output
    const words = Array.from(byNormalized.values())
        .map((w) => ({ ...w, sources: Array.from(w.sources).sort() }))
        .sort((a, b) => a.slug.localeCompare(b.slug));

    stats.uniqueWords = words.length;

    // va chạm slug: cùng 1 slug nhưng từ gốc (chuẩn hoá) khác nhau
    const collisions = [];
    for (const [slug, owners] of slugOwners.entries()) {
        const distinct = Array.from(new Set(Array.from(owners).map((w) => w.toLowerCase())));
        if (distinct.length > 1) {
            collisions.push({ slug, words: Array.from(owners) });
        }
    }

    return { words, stats, collisions };
}

module.exports = { extractWords, slugify, getByPath };
