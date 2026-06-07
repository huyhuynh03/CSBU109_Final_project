# Kế hoạch triển khai Ngữ pháp tiếng Anh

> Tài liệu khung sườn cho 15 nhóm cấu trúc ngữ pháp của trang [`/english/grammar`](../packages/english/src/pages/grammar.js).
> Giai đoạn hiện tại: **chỉ dựng khung sườn** (tên 15 nhóm). Chi tiết từng nhóm sẽ được bổ sung dần ở các section bên dưới.

---

## Mục tiêu

- Định nghĩa taxonomy ngữ pháp song song với mô hình topic của từ vựng ([`VocabularyTopics`](../packages/english/src/config/vocabulary-topics.js)).
- Mỗi nhóm cấp 1 (15 nhóm) sẽ chia thành các bài học con (lessons) khi đi vào chi tiết.
- Tận dụng lại hạ tầng study/review hiện có ở mức tối đa, nhưng dự kiến cần thêm loại "thẻ bảng/hệ hình" cho các nhóm như Đại từ.

---

## Tổng quan 15 nhóm cấu trúc

| # | id (dự kiến) | Tên tiếng Việt | Tên tiếng Anh | Cấp độ dự kiến | Trạng thái |
|---|--------------|----------------|---------------|----------------|------------|
| 1 | `tenses` | Thì động từ | Tenses | Intermediate → Advanced | ✅ Hoàn thiện |
| 2 | `modal-verbs` | Động từ khuyết thiếu | Modal Verbs | Intermediate | ✅ Hoàn thiện |
| 3 | `passive-voice` | Câu bị động | Passive Voice | Intermediate → Advanced | ✅ Hoàn thiện |
| 4 | `conditionals` | Câu điều kiện | Conditionals | Intermediate → Advanced | ✅ Hoàn thiện |
| 5 | `reported-speech` | Câu tường thuật | Reported Speech | Advanced | ✅ Hoàn thiện |
| 6 | `clauses` | Mệnh đề | Clauses | Advanced | ✅ Hoàn thiện |
| 7 | `gerunds-infinitives` | Danh động từ & Động từ nguyên mẫu | Gerunds & Infinitives | Advanced | ✅ Hoàn thiện |
| 8 | `nouns-articles-quantifiers` | Danh từ, Mạo từ & Lượng từ | Nouns, Articles & Quantifiers | Intermediate | ✅ Hoàn thiện |
| 9 | `pronouns` | Đại từ | Pronouns | Intermediate | ✅ Hoàn thiện |
| 10 | `adjectives-adverbs` | Tính từ & Trạng từ | Adjectives & Adverbs | Intermediate | ✅ Hoàn thiện |
| 11 | `prepositions` | Giới từ | Prepositions | Intermediate | ✅ Hoàn thiện |
| 12 | `sentence-structure` | Cấu trúc câu nâng cao | Sentence Structure | Advanced | ✅ Hoàn thiện |
| 13 | `connectors` | Từ nối & Liên từ | Connectors | Intermediate → Advanced | ✅ Hoàn thiện |
| 14 | `questions` | Câu hỏi | Questions | Intermediate | ✅ Hoàn thiện |
| 15 | `special-structures` | Cấu trúc đặc biệt | Special Structures | Advanced | ✅ Hoàn thiện |

**Chú thích trạng thái:** ⬜ Khung (chỉ có tên) · 🟨 Đang chi tiết · ✅ Hoàn thiện

---

## 1. Thì động từ (Tenses)

> **Nhãn nhóm hiển thị:** `Thì động từ (Tense)` — đóng vai trò như nhãn nhóm chủ đề (category label) ở [`TopicCategories`](../packages/english/src/config/vocabulary-topics.js) bên trang từ vựng. Đây là tiêu đề bao toàn bộ tập hợp các thì.
> **Mỗi thì = một mục/thư mục riêng** (tương tự topic folder bên từ vựng).
> Giai đoạn này: **để trống nội dung bên trong mỗi thư mục thì** — chỉ dựng danh sách tên 12 thì trước, chưa thêm thẻ/bài học.
> Thì được dùng **chính** trong IELTS Writing được đánh dấu **(IELTS)**.

### Danh sách 12 thì (folders)

| # | id (dự kiến) | Tên tiếng Việt | Tên tiếng Anh | IELTS | Nội dung |
|---|--------------|----------------|---------------|-------|----------|
| 1 | `present-simple` | Hiện tại đơn | Present Simple | ✅ (IELTS) | 🟨 [Chi tiết](grammar/present-simple.md) |
| 2 | `present-continuous` | Hiện tại tiếp diễn | Present Continuous | — | ⬜ Trống |
| 3 | `present-perfect` | Hiện tại hoàn thành | Present Perfect | ✅ (IELTS) | ⬜ Trống |
| 4 | `present-perfect-continuous` | Hiện tại hoàn thành tiếp diễn | Present Perfect Continuous | — | ⬜ Trống |
| 5 | `past-simple` | Quá khứ đơn | Past Simple | ✅ (IELTS) | ⬜ Trống |
| 6 | `past-continuous` | Quá khứ tiếp diễn | Past Continuous | — | ⬜ Trống |
| 7 | `past-perfect` | Quá khứ hoàn thành | Past Perfect | — | ⬜ Trống |
| 8 | `past-perfect-continuous` | Quá khứ hoàn thành tiếp diễn | Past Perfect Continuous | — | ⬜ Trống |
| 9 | `future-simple` | Tương lai đơn | Future Simple | ✅ (IELTS) | ⬜ Trống |
| 10 | `future-continuous` | Tương lai tiếp diễn | Future Continuous | — | ⬜ Trống |
| 11 | `future-perfect` | Tương lai hoàn thành | Future Perfect | — | ⬜ Trống |
| 12 | `future-perfect-continuous` | Tương lai hoàn thành tiếp diễn | Future Perfect Continuous | — | ⬜ Trống |

**Ghi chú:**
- Cột **Nội dung = ⬜ Trống**: thư mục thì đã có tên nhưng chưa có thẻ/bài học bên trong (đúng yêu cầu giai đoạn này).
- 4 thì đánh dấu **(IELTS)** — `present-simple`, `present-perfect`, `past-simple`, `future-simple` — là bộ thì dùng chính trong IELTS Writing (mô tả xu hướng/biểu đồ, nêu quan điểm, dự đoán tương lai). 8 thì còn lại vẫn giữ trong danh sách để đủ hệ thống 12 thì và phục vụ Speaking/Reading, nhưng không phải trọng tâm Writing nên không đánh dấu.
- Dạng `be going to` (tương lai gần) và `Future in the past` sẽ được dạy lồng trong `future-simple` hoặc tách thành mục bổ sung khi đi vào chi tiết từng thì.

---

## 2. Động từ khuyết thiếu (Modal Verbs)

_Chi tiết sẽ được bổ sung sau._

---

## 3. Câu bị động (Passive Voice)

_Chi tiết sẽ được bổ sung sau._

---

## 4. Câu điều kiện (Conditionals)

_Chi tiết sẽ được bổ sung sau._

---

## 5. Câu tường thuật (Reported Speech)

_Chi tiết sẽ được bổ sung sau._

---

## 6. Mệnh đề (Clauses)

_Chi tiết sẽ được bổ sung sau._

---

## 7. Danh động từ & Động từ nguyên mẫu (Gerunds & Infinitives)

_Chi tiết sẽ được bổ sung sau._

---

## 8. Danh từ, Mạo từ & Lượng từ (Nouns, Articles & Quantifiers)

_Chi tiết sẽ được bổ sung sau._

---

## 9. Đại từ (Pronouns)

_Chi tiết sẽ được bổ sung sau._

---

## 10. Tính từ & Trạng từ (Adjectives & Adverbs)

_Chi tiết sẽ được bổ sung sau._

---

## 11. Giới từ (Prepositions)

_Chi tiết sẽ được bổ sung sau._

---

## 12. Cấu trúc câu nâng cao (Sentence Structure)

_Chi tiết sẽ được bổ sung sau._

---

## 13. Từ nối & Liên từ (Connectors)

_Chi tiết sẽ được bổ sung sau._

---

## 14. Câu hỏi (Questions)

_Chi tiết sẽ được bổ sung sau._

---

## 15. Cấu trúc đặc biệt (Special Structures)

_Chi tiết sẽ được bổ sung sau._
