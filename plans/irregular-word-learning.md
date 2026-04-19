# Irregular Word Learning - Cơ chế học từ bất quy tắc

## Quyết định kiến trúc (chốt 2026-04-19)

Khác biệt rõ giữa Family Word và Irregular Word:

| | Family Word | Irregular Word |
|---|---|---|
| Số thẻ trong DB | N thẻ (mỗi biến thể 1 thẻ độc lập, có nghĩa riêng) | **1 thẻ duy nhất** chứa cả bundle |
| Pop-up gợi ý | Có, user chọn "Học ngay" hoặc "Để sau" | KHÔNG, chạy tuần tự bắt buộc |
| Thoát giữa chừng | Được, lưu pendingFamilies | KHÔNG, phải hoàn thành cả bundle |
| Lưu trong DB | Mỗi biến thể có state/dueDate riêng | Cả bundle dùng chung 1 state/dueDate |
| Ôn tập | Mỗi biến thể ôn theo lịch riêng | Random 1 dạng (V1/V2/V3) mỗi lần ôn |

## Data model (KHÔNG đổi schema)

Tận dụng các field sẵn có trong `vocabulary` schema:
- `tags`: chứa `'irregular-verb' | 'irregular-adjective' | 'irregular-adverb'`
- `pastSimple`, `pastParticiple`: cho irregular verb
- `comparative`, `superlative`: cho irregular adj/adv

Helper mới trong `CardSchemas`:
- `isIrregular(card)` → boolean
- `getIrregularType(card)` → `'verb' | 'adjective' | 'adverb' | null`
- `getIrregularVariants(card)` → `[{ key, label, value }]`
  - verb: `[{ key:'pastSimple', label:'V2', value:'wrote' }, { key:'pastParticiple', label:'V3', value:'written' }]`
  - adj/adv: `[{ key:'comparative', label:'So sánh hơn', value:'better' }, { key:'superlative', label:'So sánh nhất', value:'best' }]`

## UI - Topic Detail

Mỗi thẻ irregular hiển thị:
- Badge `🔀 V1·V2·V3` (verb tím) / `🔀 So sánh BQT` (adj cam) / `🔀 Trạng từ BQT` (adv hồng)
- Secondary text show kèm các dạng: `viết (wrote / written)`, `tốt (better / best)`

## Luồng học (Study)

Sau khi user hoàn thành Step 1-3 chuẩn của 1 thẻ:
- Nếu thẻ có `isIrregular === true` → đẩy thêm các step phụ vào session cho chính thẻ này:
  - Step 4: Học V2 (intro biến thể) → gõ V2
  - Step 5: Học V3 (intro biến thể) → gõ V3
  - (adj/adv: tương tự cho comparative/superlative)
- User KHÔNG thể "Hủy" hay "Skip" giữa các step phụ
- Khi hoàn thành tất cả → thẻ mới chuyển state `review`

Implementation: thêm field `bundleSteps` vào session để liệt kê các step phụ, render chung pattern `_renderTypeStep()` nhưng `data-expected` là variant value, instruction được điều chỉnh.

## Luồng ôn (Review)

Khi tới thẻ irregular trong vòng ôn:
- Random chọn 1 dạng (V1, V2, hoặc V3) làm câu hỏi
- Hỏi pattern: "Cho `wrote` (V2), gõ V1?" hoặc "Cho `viết` (V1), gõ V2?"
- Đáp án và prompt thay đổi theo dạng được random

## Test sample (đã có)

7 thẻ trong `test-samples.json`:
- 4 thẻ family `beauty/beautify/beautiful/beautifully` (không irregular, test family popup)
- 1 thẻ `write` (irregular verb, bundle 3 step: V1/V2/V3)
- 1 thẻ `good` (irregular adj, bundle 3 step: positive/comparative/superlative)
- 1 thẻ `well` (irregular adv, bundle 3 step)

→ Tổng "dạng từ" user phải học = 4 + 3 + 3 + 3 = 13 dạng, dù chỉ có 7 thẻ.

## Note phụ

User đã quyết: **KHÔNG tô màu nền thẻ theo độ khó** (gây loạn). Chỉ giữ badge text "Dễ"/"Khó" ở góc.
