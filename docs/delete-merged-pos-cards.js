/**
 * Script xoá các thẻ từ vựng có partOfSpeech ở dạng "gộp"
 * (VD: "verb, noun", "noun/verb", "adjective and noun"...).
 *
 * Bối cảnh:
 *   - Seed hiện tại đã tách mỗi POS thành 1 thẻ riêng (Plan A).
 *   - Nhưng trong Firestore của user có thể còn các thẻ cũ có
 *     partOfSpeech dạng combo (do bản app trước hoặc migration cũ).
 *   - Các thẻ này khiến search hiển thị "commute VERB, NOUN" trên
 *     cùng 1 dòng, và làm FSRS tracking không tách được từng nghĩa.
 *
 * Cơ chế:
 *   1. Fetch toàn bộ vocabulary cards.
 *   2. Với mỗi card có partOfSpeech chứa separator (",", "/", "&",
 *      " and ", " or "), coi là "merged card".
 *   3. Tách merged POS thành các POS con hợp lệ.
 *   4. Kiểm tra: mỗi POS con đã có thẻ đơn lẻ (cùng word + folderId
 *      + POS) chưa. Nếu chưa → cảnh báo (auto-seed sẽ tự bổ sung
 *      khi bạn reload trang /vocabulary vì SeedImporter buildIdentityKey
 *      theo từng POS riêng).
 *   5. Xoá merged card.
 *
 * Cách dùng:
 *   1. Mở app trong browser và đăng nhập.
 *   2. Vào trang /vocabulary.
 *   3. Mở DevTools Console (F12).
 *   4. Paste toàn bộ nội dung file này vào Console → Enter.
 *   5. Đọc log để xác nhận, sau đó reload trang để auto-seed
 *      bổ sung các thẻ đơn lẻ còn thiếu (nếu có).
 */

(async function deleteMergedPosCards() {
    console.log('=== BẮT ĐẦU XOÁ MERGED POS CARDS ===');

    if (!window.FirestoreDB) {
        console.error('❌ FirestoreDB không sẵn sàng. Hãy đảm bảo bạn đang ở trang app và đã đăng nhập.');
        return;
    }

    const normalize = (v) => String(v || '').trim().toLowerCase();

    // Bộ POS chuẩn (theo CardSchemas)
    const VALID_POS = new Set([
        'noun', 'verb', 'adjective', 'adverb',
        'preposition', 'conjunction', 'interjection',
        'pronoun', 'determiner', 'idiom', 'phrasal verb'
    ]);

    /**
     * Kiểm tra và tách partOfSpeech thành các POS con.
     * @returns {string[]|null} - Trả về mảng POS nếu là merged, null nếu không phải merged.
     */
    const splitMergedPos = (rawPos) => {
        const pos = normalize(rawPos);
        if (!pos) return null;
        // Nếu POS đơn lẻ và hợp lệ → không phải merged.
        if (VALID_POS.has(pos)) return null;

        // Tách theo các separator phổ biến.
        // Regex: dấu phẩy, dấu "/", dấu "&", hoặc từ khoá " and " / " or " (có space đệm).
        const parts = pos
            .split(/\s*,\s*|\s*\/\s*|\s*&\s*|\s+and\s+|\s+or\s+/i)
            .map(p => p.trim())
            .filter(Boolean);

        if (parts.length < 2) return null;

        // Mọi phần phải là POS hợp lệ mới coi là merged (tránh nhầm với text lạ).
        const allValid = parts.every(p => VALID_POS.has(p));
        if (!allValid) {
            console.warn(`⚠️  POS "${rawPos}" tách ra không toàn POS hợp lệ:`, parts);
            return null;
        }
        return parts;
    };

    try {
        // 1. Fetch toàn bộ cards
        console.log('📥 Đang tải cards từ Firestore...');
        const allCards = await FirestoreDB.getCards({});
        const vocabCards = (allCards || []).filter(c => c.cardType === 'vocabulary' || !c.cardType);
        console.log(`✓ Đã tải ${vocabCards.length} vocabulary cards`);

        // 2. Nhóm thẻ theo (folderId + word + POS) để tra "single POS card" đã tồn tại chưa
        const singleKeyMap = new Map();
        vocabCards.forEach(card => {
            const fv = card.fieldValues || {};
            const word = normalize(fv.word);
            const pos = normalize(fv.partOfSpeech);
            if (!word || !pos || !VALID_POS.has(pos)) return;
            const key = [normalize(card.folderId), word, pos].join('|');
            if (!singleKeyMap.has(key)) singleKeyMap.set(key, []);
            singleKeyMap.get(key).push(card);
        });

        // 3. Tìm merged cards
        const mergedFindings = []; // { card, word, folderId, mergedPos, splitParts, missingSingles }
        vocabCards.forEach(card => {
            const fv = card.fieldValues || {};
            const word = normalize(fv.word);
            if (!word) return;
            const parts = splitMergedPos(fv.partOfSpeech);
            if (!parts) return;
            const folderId = normalize(card.folderId);
            const missingSingles = parts.filter(p => {
                const key = [folderId, word, p].join('|');
                return !singleKeyMap.has(key);
            });
            mergedFindings.push({
                card,
                word: fv.word,
                folderId: card.folderId,
                mergedPos: fv.partOfSpeech,
                splitParts: parts,
                missingSingles
            });
        });

        // 4. Báo cáo
        if (mergedFindings.length === 0) {
            console.log('✅ Không tìm thấy merged POS card nào. Database đã sạch.');
            return;
        }

        console.log(`\n📊 Tìm thấy ${mergedFindings.length} thẻ có POS gộp:`);
        console.table(mergedFindings.map(f => ({
            word: f.word,
            folder: f.folderId,
            mergedPos: f.mergedPos,
            splitInto: f.splitParts.join(' + '),
            missingSingles: f.missingSingles.join(', ') || '(đã có đủ)'
        })));

        const totalMissing = mergedFindings.reduce((sum, f) => sum + f.missingSingles.length, 0);
        if (totalMissing > 0) {
            console.warn(
                `\n⚠️  Sau khi xoá merged card, sẽ còn thiếu ${totalMissing} thẻ đơn lẻ.\n` +
                `    Đừng lo — auto-seed sẽ tự bổ sung khi bạn reload trang /vocabulary,\n` +
                `    vì các thẻ này đều có trong seed data theo từng POS riêng.`
            );
        }

        // 5. Xác nhận
        console.log(`\n⏳ Sẽ xoá ${mergedFindings.length} merged cards trong 3 giây... (Ctrl+C để hủy)`);
        await new Promise(resolve => setTimeout(resolve, 3000));

        // 6. Xoá
        console.log('\n🗑️  Đang xoá...');
        let deleted = 0;
        let failed = 0;
        for (const f of mergedFindings) {
            try {
                const ok = await FirestoreDB.deleteCard(f.card.id);
                if (ok) {
                    deleted++;
                    console.log(`  ✓ Xoá "${f.word}" [${f.mergedPos}] trong topic "${f.folderId}"`);
                } else {
                    failed++;
                    console.warn(`  ⚠️  deleteCard trả về falsy cho id=${f.card.id}`);
                }
            } catch (e) {
                failed++;
                console.error(`  ❌ Xoá thất bại id=${f.card.id}:`, e);
            }
        }

        console.log('\n=== HOÀN TẤT ===');
        console.log(`  Xoá thành công: ${deleted}/${mergedFindings.length}`);
        if (failed > 0) console.log(`  Thất bại: ${failed}`);
        console.log('\n👉 Hãy RELOAD trang /vocabulary để auto-seed bổ sung thẻ đơn lẻ còn thiếu.');
    } catch (e) {
        console.error('❌ Lỗi khi chạy script:', e);
    }
})();
