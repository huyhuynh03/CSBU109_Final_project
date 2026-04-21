# Học từ bất quy tắc — Schema v2

> **Lịch sử:** Phiên bản trước (v1) gộp 3 biến thể (V1/V2/V3 hoặc nguyên mẫu/so sánh hơn/so sánh nhất) vào **một thẻ duy nhất**, ép user học cả 3 dạng trong 1 lượt. Cách này gây quá nhiều lỗi (ví dụ sai ngữ pháp giữa các biến thể, FSRS không phân biệt được dạng nào đã thuộc, popup family rối, code review/study phức tạp với `_chosenForms`/`variantIndex`/`_renderVariantIntroStep`...).
> **v2:** Tách thành **6 topic độc lập**, mỗi thẻ chỉ chứa **1 dạng duy nhất**. Nguyên mẫu (`baseForm`) chỉ là chú thích, không kiểm tra.

## 1. Sáu topic mới

| Topic ID | Tên hiển thị | Ghi chú |
|----------|-------------|---------|
| `irregular-verb-v2` | Động từ BQT – V2 (Quá khứ đơn) | thẻ test `wrote`, `went`, ... — `baseForm = write/go` |
| `irregular-verb-v3` | Động từ BQT – V3 (Quá khứ phân từ) | thẻ test `written`, `gone`, ... |
| `irregular-adj-comparative` | Tính từ BQT – So sánh hơn | `better`, `worse`, ... — `baseForm = good/bad` |
| `irregular-adj-superlative` | Tính từ BQT – So sánh nhất | `best`, `worst`, ... |
| `irregular-adv-comparative` | Trạng từ BQT – So sánh hơn | `better`, `worse`, ... — `baseForm = well/badly` |
| `irregular-adv-superlative` | Trạng từ BQT – So sánh nhất | `best`, `worst`, ... |

Cả 6 topic nằm trong category mới `irregular` (`Bất quy tắc`), order 30-35.

## 2. Schema thẻ (vocabulary v2)

Thẻ BQT giữ nguyên schema vocabulary cơ bản + thêm **3 field ẩn**:

```js
{
  word:          "wrote",                         // dạng được kiểm tra
  ipa:           "/roʊt/",
  partOfSpeech:  "verb",
  meaning:       "đã viết (quá khứ đơn của write)",
  example:       "He wrote a long email last night.",
  tags:          ["irregular-verb"],
  irregularRole: "pastSimple",                    // pastSimple|pastParticiple|comparative|superlative
  baseForm:      "write",                         // CHÚ THÍCH (không test)
  baseMeaning:   "viết"                           // CHÚ THÍCH
}
```

**Hợp lệ là BQT v2 ⇔** có tag `irregular-*` **và** có `irregularRole`. Nếu thiếu `irregularRole` → coi như thẻ thường (hoặc legacy → bị cleanup xoá).

## 3. Luồng học mới (study.js)

Bỏ hoàn toàn `_renderVariantIntroStep` và `_renderVariantTypeStep`. Mỗi thẻ chỉ qua đúng **3 bước cũ**:

1. **Bước 1 – Giới thiệu**: Hiển thị `word`, IPA, nghĩa, ví dụ.
   - Nếu là BQT v2: thêm badge vai trò (`Động từ BQT · V2`) và khối chú thích **`Nguyên mẫu: write — viết`**.
2. **Bước 2 – Tập viết** (VN→EN): gõ chính xác `word`.
3. **Bước 3 – Tập nghe** (Listen→EN): gõ chính xác `word`.

Sau bước 3 → finalize FSRS như thẻ thường, không còn step 4/5.

## 4. Luồng ôn tập mới (review.js)

Bỏ hoàn toàn `_chosenForms`. Mỗi thẻ chỉ test đúng **`word`** ở cả 2 vòng:

- **Vòng 1**: hiện nghĩa → gõ `word`.
- **Vòng 2**: phát âm → gõ `word`.
- BQT v2 hiển thị badge vai trò + chú thích `(nguyên mẫu: write)` ở khu vực hint.
- **Backside**: hiển thị `word` (màu theo loại BQT), ví dụ, và khối chú thích **`Nguyên mẫu: write — viết`** ở dưới cùng.

## 5. Cleanup dữ liệu cũ (Firestore)

[`public/src/js/fsrs/bqt-v2-cleanup.js`](public/src/js/fsrs/bqt-v2-cleanup.js:1) chạy 1 lần/user (flag `lf_bqt_v2_cleanup_v1` trong localStorage), được gọi đầu hàm [`VocabularyPage._autoSeedTopics()`](public/src/js/pages/vocabulary.js:964) trước khi seed 6 topic v2.

Điều kiện xoá:
- Thẻ có bất kỳ field legacy nào: `pastSimple`, `pastParticiple`, `comparative`, `superlative`, **HOẶC**
- Thẻ có tag `irregular-*` nhưng thiếu `irregularRole`.

Sau khi cleanup, seed importer tự đổ 6 topic v2 từ [`public/seed-vocabulary/irregular-*.json`](public/seed-vocabulary/irregular-verb-v2.json:1).

## 6. Các API CardSchemas còn dùng

- `CardSchemas.isIrregular(card)` — chỉ true khi v2 hợp lệ.
- `CardSchemas.isLegacyIrregular(card)` — phát hiện thẻ cũ.
- `CardSchemas.getIrregularMeta(card)` → `{ tag, type, label, color, bg, role, roleLabel, roleShort }`.
- `CardSchemas.IRREGULAR_ROLE_LABELS` — map role → nhãn hiển thị.
- `CardSchemas.getIrregularVariants()` / `getIrregularVariantsShort()` — **deprecated**, luôn trả `[]`/`''`.

## 7. Family popup

Luồng mới: 6 topic BQT không share `familyId` (mỗi card BQT độc lập). `_maybeShowFamilyPopup` tự động bỏ qua khi `familyId` không tồn tại — không cần gỡ.

## 8. Checklist refactor (đã hoàn thành)

- [x] Schema v2: `irregularRole` + `baseForm` + `baseMeaning` (hidden).
- [x] 6 topic config + category `irregular`.
- [x] 6 seed JSON (data/ + public/seed-vocabulary/).
- [x] Auto-seed map.
- [x] [`StudyPage`](public/src/js/pages/study.js:8): xoá variant flow, intro step hiển thị baseForm.
- [x] [`ReviewPage`](public/src/js/pages/review.js:7): xoá `_chosenForms`, backside hiển thị baseForm.
- [x] Cleanup Firestore legacy (`BqtV2Cleanup`).
- [x] Bump cache + sw.
