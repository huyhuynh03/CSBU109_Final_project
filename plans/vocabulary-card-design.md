# Thiết kế thẻ học từ vựng

> Mô tả chi tiết các thành phần cần có trong một thẻ học từ vựng, chia theo 2 chế độ: **Học mới** và **Ôn tập**.

---

## Các trường (fields) của thẻ từ vựng

### Trường chung (tất cả từ vựng đều có)

| # | Tên trường | Mô tả | Bắt buộc? |
|---|-----------|-------|-----------|
| 1 | Từ vựng (word) | Từ tiếng Anh cần học | ✅ Có |
| 2 | Phát âm IPA (ipa) | Phiên âm quốc tế của từ | ✅ Có |
| 3 | Từ loại (partOfSpeech) | Danh từ, động từ, tính từ, trạng từ... | ✅ Có |
| 4 | Nghĩa tiếng Việt (meaning) | Nghĩa của từ vựng | ✅ Có |
| 5 | Audio phát âm (audioUrl) | File audio hoặc URL phát âm từ vựng | ❌ Không |
| 6 | Câu ví dụ (exampleSentence) | Câu ví dụ có chứa từ vựng, dùng cho đục lỗ | ✅ Có |

---

### 3 trường hợp từ vựng

#### Trường hợp 1: Từ bình thường (không bất quy tắc)

> Danh từ, động từ quy tắc, tính từ/trạng từ quy tắc...
> Chỉ cần các trường chung ở trên, không có trường bổ sung.

**Ví dụ:** `book` (n), `play` (v — played/played), `beautiful` (adj — more beautiful/most beautiful)

#### Trường hợp 2: Động từ bất quy tắc

> Khi từ loại = `verb` và là động từ bất quy tắc → hiển thị thêm 2 trường:

| Tên trường | Mô tả | Ví dụ |
|-----------|-------|-------|
| Past simple - V2 (pastSimple) | Dạng quá khứ đơn | go → **went** |
| Past participle - V3 (pastParticiple) | Dạng quá khứ phân từ | go → **gone** |

**Ví dụ:** `go` → went / gone, `eat` → ate / eaten, `write` → wrote / written

#### Trường hợp 3: Tính từ / Trạng từ bất quy tắc trong so sánh

> Khi từ loại = `adjective` hoặc `adverb` và có dạng so sánh bất quy tắc → hiển thị thêm 2 trường:

| Tên trường | Mô tả | Ví dụ |
|-----------|-------|-------|
| So sánh hơn (comparative) | Dạng so sánh hơn bất quy tắc | good → **better** |
| So sánh nhất (superlative) | Dạng so sánh nhất bất quy tắc | good → **best** |

**Ví dụ:** `good` → better / best, `bad` → worse / worst, `far` → further / furthest

---

### Tổng hợp tất cả trường (data model)

| # | Tên trường | Loại từ áp dụng | Bắt buộc? |
|---|-----------|----------------|-----------|
| 1 | word | Tất cả | ✅ |
| 2 | ipa | Tất cả | ✅ |
| 3 | partOfSpeech | Tất cả | ✅ |
| 4 | meaning | Tất cả | ✅ |
| 5 | pastSimple | Động từ bất quy tắc | ❌ |
| 6 | pastParticiple | Động từ bất quy tắc | ❌ |
| 7 | comparative | Tính từ/Trạng từ bất quy tắc | ❌ |
| 8 | superlative | Tính từ/Trạng từ bất quy tắc | ❌ |
| 9 | audioUrl | Tất cả | ❌ |
| 10 | exampleSentence | Tất cả | ✅ |

---

## Chế độ 1: HỌC MỚI (Study)

> Dành cho các thẻ chưa từng học. Mục tiêu: giới thiệu từ mới + ghi nhớ mặt từ bằng cách gõ lại.

### Hiển thị thẻ học mới

Thẻ hiển thị **toàn bộ thông tin** để người dùng nhìn và ghi nhớ, đồng thời có **ô đục lỗ** để gõ lại từ:

1. **Từ vựng** — hiển thị rõ ràng, font lớn (user nhìn thấy từ)
2. **Phát âm IPA** — ví dụ: `/dɪˈzaɪər/`
3. **Từ loại** — ví dụ: `verb`
4. **Nghĩa tiếng Việt** — ví dụ: `khao khát, mong muốn`
5. **Audio phát âm** — **tự động phát** khi vào thẻ lần đầu, sau đó user nhấn nút 🔊 để nghe lại
6. **Câu ví dụ với khoảng trống** — câu có chừa blank, từ vựng bị ẩn
   - Ví dụ: `"She has a strong _____ to succeed."`
7. **Ô đục lỗ điền từ (cloze input)** — user gõ lại từ vựng đã nhìn thấy ở trên để ghi nhớ mặt từ
   - Khi gõ → khoảng trống trong câu ví dụ cập nhật real-time

**Phần bổ sung theo trường hợp:**

| Trường hợp | Hiển thị thêm | Ví dụ |
|-----------|--------------|-------|
| 1. Từ bình thường | *(không có thêm)* | `book` (n) — quyển sách |
| 2. Động từ bất quy tắc | V2 / V3 | `go` → went / gone |
| 3. Tính từ/Trạng từ BQT | Comparative / Superlative | `good` → better / best |

### Luồng tương tác - Học mới

```
1. Hiển thị toàn bộ thông tin thẻ (từ, IPA, từ loại, nghĩa, câu ví dụ với blank)
2. Audio tự động phát âm từ vựng
3. User nhìn từ vựng → gõ lại vào ô đục lỗ để ghi nhớ mặt từ
4. Khoảng trống trong câu ví dụ cập nhật real-time khi gõ
5. User nhấn "Kiểm tra" → hệ thống so sánh đáp án
6a. ✅ Đúng 100% → Thẻ chuyển sang trạng thái "đã học", lên lịch ôn tập theo FSRS
6b. ❌ Sai (bất kỳ lỗi nào) → Lặp lại chế độ học mới của từ này (quay lại bước 1)
```

> ⚠️ **Quy tắc quan trọng:** User phải gõ **đúng 100%** mới được chuyển sang chế độ ôn tập. Nếu sai, thẻ vẫn giữ trạng thái "new" và lặp lại cho đến khi đúng.

> **Khác biệt với Ôn tập:** Ở chế độ Học mới, từ vựng **được hiển thị** để user nhìn và gõ lại (mục đích ghi nhớ mặt từ). Ở chế độ Ôn tập, từ vựng **bị ẩn** (mục đích kiểm tra trí nhớ).

---

## Chế độ 2: ÔN TẬP (Review)

> Dành cho các thẻ đã học và đến hạn ôn. Mục tiêu: kiểm tra khả năng nhớ từ.

### Mặt trước thẻ (Front) — Câu hỏi

1. **Nghĩa tiếng Việt** — hiển thị nghĩa để người dùng biết từ cần điền
   - Ví dụ: `khao khát, mong muốn`

2. **Câu ví dụ với khoảng trống (cloze/đục lỗ)**
   - Câu ví dụ được hiển thị nhưng từ vựng cần học bị thay bằng khoảng trống `_____`
   - Ví dụ: `"She has a strong _____ to succeed."`

3. **Ô nhập đục lỗ (cloze input)**
   - Người dùng gõ từ vào ô input
   - Khi gõ, từ đang nhập **hiển thị đồng thời** vào khoảng trống trong câu ví dụ (real-time binding)
   - Ví dụ: gõ "des" → câu hiện `"She has a strong des_____ to succeed."`
   - Gõ đủ "desire" → câu hiện `"She has a strong desire to succeed."`

### Mặt sau thẻ (Back) — Kết quả

Sau khi người dùng submit đáp án:

1. **Kết quả đúng/sai** — hiển thị rõ ràng (✅ Đúng / ❌ Sai)
2. **Từ vựng** — hiển thị từ đúng
3. **Phát âm IPA** — ví dụ: `/dɪˈzaɪər/`
4. **Từ loại** — ví dụ: `noun`
5. **Nghĩa tiếng Việt** — ví dụ: `khao khát, mong muốn`
6. **V2 / V3** (nếu là động từ bất quy tắc)
7. **Comparative / Superlative** (nếu là tính từ/trạng từ bất quy tắc)
8. **Nút phát audio** — click để nghe phát âm
8. **Câu ví dụ đầy đủ** — từ được highlight/in đậm trong câu

### Luồng tương tác - Ôn tập

```
1. Hiển thị nghĩa tiếng Việt + câu ví dụ với khoảng trống
2. User gõ vào ô đục lỗ → khoảng trống trong câu cập nhật real-time
3. User nhấn "Kiểm tra" → So sánh đáp án
4. Hiển thị kết quả đúng/sai + toàn bộ thông tin thẻ (mặt sau)
5. Hệ thống TỰ ĐỘNG quyết định FSRS rating (5 mức) dựa trên kết quả:
```

### Bảng 5 mức FSRS tự động

| Mức | Rating | Điều kiện | Lịch ôn tiếp theo |
|-----|--------|-----------|-------------------|
| 1 | Again | Sai hoàn toàn / không nhớ | 15 phút nữa |
| 2 | Hard | Sai chính tả nhỏ / gần đúng | 24 giờ (1 ngày) |
| 3 | Good | Đúng nhưng mất thời gian suy nghĩ | 3 ngày |
| 4 | Easy | Đúng nhanh, nhớ tốt | 1 tuần (7 ngày) |
| 5 | Perfect | Đúng ngay lập tức, không cần suy nghĩ | 1 tháng (30 ngày) |

> **Lưu ý:** Người dùng KHÔNG cần tự chọn rating. Hệ thống tự xác định dựa trên:
> - **Đúng/sai** của đáp án
> - **Thời gian phản hồi** (bao lâu user mới gõ xong)
> - **Mức độ chính xác** (đúng hoàn toàn vs gần đúng)

---

## So sánh 2 chế độ

| Đặc điểm | Học mới | Ôn tập |
|----------|---------|--------|
| Đối tượng | Thẻ chưa học (state = new) | Thẻ đến hạn ôn (due date ≤ today) |
| Mục đích | Ghi nhớ mặt từ | Kiểm tra trí nhớ |
| Từ vựng | **Hiển thị** (nhìn để gõ lại) | **Ẩn** (phải nhớ để gõ) |
| Hiển thị ban đầu | Toàn bộ thông tin + câu đục lỗ | Chỉ nghĩa + câu đục lỗ |
| Audio tự động phát | ✅ Có (lần đầu vào thẻ) | ❌ Không |
| Yêu cầu nhập | Gõ lại từ vào ô đục lỗ | Gõ từ vào ô đục lỗ |
| Kiểm tra đáp án | Có (đúng/sai) | Có (đúng/sai) |
| FSRS rating | Hệ thống tự quyết định 5 mức | Hệ thống tự quyết định 5 mức |
| Real-time binding | Có (gõ → câu cập nhật) | Có (gõ → câu cập nhật) |

---

## Ghi chú thêm

- Từ vựng trong câu ví dụ cần được đánh dấu bằng cú pháp đặc biệt khi tạo thẻ, ví dụ: `"She has a strong {{desire}} to succeed."` — phần trong `{{ }}` sẽ bị ẩn thành khoảng trống khi ôn tập
- Audio có thể là URL bên ngoài hoặc sử dụng Web Speech API (TTS) nếu không có file audio
- Cần hỗ trợ nhiều từ loại cho cùng một từ (ví dụ: `desire` vừa là noun vừa là verb)
- **V2/V3** chỉ hiển thị khi từ loại là động từ (verb) VÀ là bất quy tắc
- **Comparative/Superlative** chỉ hiển thị khi từ loại là tính từ/trạng từ VÀ là bất quy tắc
- Form tạo thẻ cần tự động ẩn/hiện các trường bổ sung dựa trên từ loại được chọn
