# 🔍 Hướng Dẫn Thống Kê Số Thẻ Học Theo Topic

Tài liệu này hướng dẫn cách sử dụng các script để thống kê và kiểm tra sự chênh lệch số thẻ học giữa seed files và Firestore.

> **Chú thích — "trang học từ vựng" / "từ vựng đã nạp trong các topic của app" là phần đang chứa 3623 thẻ.**
>
> Repo hiện chỉ còn MỘT nguồn seed duy nhất: `packages/shell/public/seed-vocabulary/`
> (43 file = **3623 thẻ**), được khai báo ở
> [`VocabularyPage._seedTopics`](../packages/english/src/pages/vocabulary.js). Đây vừa là
> nguồn app nạp/deploy, vừa là nguồn cho mọi script generate/audit/TTS.
>
> Thư mục `data/seed-vocabulary/` cũ (từng chứa 64 file = 3726 thẻ gồm draft/test/verbs)
> đã được GỠ BỎ để tránh lệch dữ liệu giữa hai nơi. Mọi script đã trỏ về nguồn duy nhất ở trên.
>
> Lưu ý lịch sử: các báo cáo cũ như `QUICK-SUMMARY.md`, `VOCABULARY-AUDIT-REPORT.md` được
> tạo khi còn 2 thư mục seed nên có số liệu (2.736, public-vs-data) không còn phản ánh hiện trạng.
>
> Chạy `node docs/audit-vocabulary-seeds.js` để xem thống kê cập nhật theo nguồn duy nhất.

---

## 📋 Danh Sách Scripts

| Script | Mục đích | Cách chạy |
|--------|---------|----------|
| [`audit-vocabulary-seeds.js`](audit-vocabulary-seeds.js) | Thống kê từ vựng từ seed files | `node docs/audit-vocabulary-seeds.js` |
| [`firestore-cards-audit-by-topic.js`](firestore-cards-audit-by-topic.js) | Thống kê thẻ học trong Firestore | Chạy trong browser console |
| [`audit-cards-browser-console.js`](audit-cards-browser-console.js) | Thống kê chi tiết thẻ theo folder | Chạy trong browser console |
| [`compare-seed-vs-firestore.js`](compare-seed-vs-firestore.js) | So sánh seed vs Firestore | Chạy trong browser console |

---

## 🚀 Cách Sử Dụng

### 1️⃣ Thống Kê Seed Files (Node.js)

**Mục đích:** Kiểm tra số từ vựng trong các file seed

**Cách chạy:**
```bash
node docs/audit-vocabulary-seeds.js
```

**Kết quả:**
- In ra bảng thống kê số từ vựng của từng topic
- Phát hiện topics có chênh lệch giữa `public` và `data`
- Lưu kết quả vào `docs/audit-vocabulary-seeds-result.json`

**Ví dụ output:**
```
📊 THỐNG KÊ TỪ VỰNG THEO TOPIC

┌─ Topic                                     │ Public │ Data │ Total
├───────────────────────────────────────────┼────────┼──────┼──────
✅ emotion-feelings                          │ 140  │ 140 │ 140
⚠️  irregular-verb-v2                         │ 114  │ 133 │ 133
...
```

---

### 2️⃣ Thống Kê Thẻ Trong Firestore (Browser Console)

**Mục đích:** Kiểm tra số thẻ học hiện tại trong Firestore

**Cách chạy:**

1. Mở app LinguaFlash trong trình duyệt
2. Đăng nhập vào tài khoản của bạn
3. Mở Developer Tools (F12)
4. Chuyển sang tab **Console**
5. Copy toàn bộ nội dung file [`firestore-cards-audit-by-topic.js`](firestore-cards-audit-by-topic.js)
6. Dán vào console và nhấn Enter

**Kết quả:**
- In ra bảng thống kê số thẻ của từng topic
- Hiển thị trạng thái (state) của mỗi thẻ
- Lưu kết quả vào `window.firestoreAuditResult`

**Ví dụ output:**
```
📊 Tổng số thẻ: 2500

📋 Chi tiết từng topic:

┌─ Topic                                     │ Số thẻ │ States
├───────────────────────────────────────────┼────────┼─────────────────────
emotion-feelings                            │ 140   │ new:50, learning:60, review:30
...
```

---

### 3️⃣ Thống Kê Chi Tiết Thẻ Theo Folder (Browser Console)

**Mục đích:** Kiểm tra chi tiết thẻ của từng topic, phát hiện sự chênh lệch giữa các folder

**Cách chạy:**

1. Mở app LinguaFlash
2. Đăng nhập
3. Mở Developer Tools (F12)
4. Chuyển sang tab **Console**
5. Copy toàn bộ nội dung file [`audit-cards-browser-console.js`](audit-cards-browser-console.js)
6. Dán vào console và nhấn Enter

**Kết quả:**
- Thống kê chi tiết từng topic
- Phát hiện topics có chênh lệch giữa các folder
- Cho phép export kết quả

---

### 4️⃣ So Sánh Seed vs Firestore (Browser Console)

**Mục đích:** So sánh số từ vựng trong seed files với số thẻ trong Firestore

**Cách chạy:**

1. Mở app LinguaFlash
2. Đăng nhập
3. Mở Developer Tools (F12)
4. Chuyển sang tab **Console**
5. Copy toàn bộ nội dung file [`compare-seed-vs-firestore.js`](compare-seed-vs-firestore.js)
6. Dán vào console và nhấn Enter

**Kết quả:**
- Bảng so sánh seed vs Firestore
- Phát hiện topics có chênh lệch
- Gợi ý topics nào cần cập nhật

---

## 📊 Báo Cáo Thống Kê

Xem báo cáo chi tiết tại: [`VOCABULARY-AUDIT-REPORT.md`](VOCABULARY-AUDIT-REPORT.md)

**Tóm tắt:**
- ✅ **27 topics** khớp hoàn toàn
- ⚠️ **26 topics** có chênh lệch
- 📂 **2 topics** chỉ ở `public`
- 📂 **22 topics** chỉ ở `data`

---

## 🔴 Vấn Đề Chính Cần Xử Lý

### 1. Irregular Verbs
- `irregular-verb-v1`: 132 từ (chỉ ở public)
- `irregular-verb-v2`: 114 vs 133 (chênh lệch +19)
- `irregular-verb-v3`: 56 vs 132 (chênh lệch +76)

**Khuyến nghị:** Kiểm tra xem `data` hay `public` là phiên bản chính, sau đó đồng bộ

### 2. Education
- `education`: 95 từ (chỉ ở public)
- `education-intermediate`: 96 từ (chỉ ở data)

**Khuyến nghị:** Quyết định giữ cái nào, hoặc đồng bộ giữa hai thư mục

### 3. Verbs Categories
- 21 topics về verbs chỉ ở `data` (155 từ tổng cộng)

**Khuyến nghị:** Quyết định có thêm vào app không, nếu có thì copy sang `public`

---

## 💡 Quy Trình Kiểm Tra Đầy Đủ

### Bước 1: Thống kê seed files
```bash
node docs/audit-vocabulary-seeds.js
```
→ Xem báo cáo: [`VOCABULARY-AUDIT-REPORT.md`](VOCABULARY-AUDIT-REPORT.md)

### Bước 2: Thống kê Firestore
- Chạy [`firestore-cards-audit-by-topic.js`](firestore-cards-audit-by-topic.js) trong browser console
- Ghi lại số thẻ của từng topic

### Bước 3: So sánh
- Chạy [`compare-seed-vs-firestore.js`](compare-seed-vs-firestore.js) trong browser console
- Phát hiện topics có chênh lệch

### Bước 4: Xác định nguyên nhân
- Nếu seed > Firestore: Có từ vựng chưa được thêm vào app
- Nếu Firestore > seed: Có thẻ được thêm thủ công hoặc từ nguồn khác

### Bước 5: Sửa chữa
- Cập nhật seed files nếu cần
- Đồng bộ giữa `public` và `data`
- Cập nhật Firestore nếu cần

---

## 📝 Ghi Chú Quan Trọng

### Khi chạy script trong Browser Console

1. **Phải đăng nhập** vào app trước
2. **Phải có quyền truy cập** Firestore
3. **Kết quả được lưu** vào `window` object:
   - `window.firestoreAuditResult` - Kết quả từ Firestore
   - `window.compareResult` - Kết quả so sánh
   - `window.auditResult` - Kết quả audit chi tiết

### Export kết quả từ Browser Console

```javascript
// Copy kết quả vào clipboard
copy(JSON.stringify(window.firestoreAuditResult, null, 2))

// Hoặc download file
const a = document.createElement("a");
a.href = URL.createObjectURL(new Blob([JSON.stringify(window.firestoreAuditResult, null, 2)], {type: "application/json"}));
a.download = "audit-result.json";
a.click();
```

---

## 🔗 File Liên Quan

- [`docs/audit-vocabulary-seeds.js`](audit-vocabulary-seeds.js) - Script Node.js
- [`docs/firestore-cards-audit-by-topic.js`](firestore-cards-audit-by-topic.js) - Script Browser
- [`docs/audit-cards-browser-console.js`](audit-cards-browser-console.js) - Script Browser
- [`docs/compare-seed-vs-firestore.js`](compare-seed-vs-firestore.js) - Script Browser
- [`docs/audit-vocabulary-seeds-result.json`](audit-vocabulary-seeds-result.json) - Kết quả JSON
- [`docs/VOCABULARY-AUDIT-REPORT.md`](VOCABULARY-AUDIT-REPORT.md) - Báo cáo chi tiết

---

## ❓ Câu Hỏi Thường Gặp

**Q: Tại sao có chênh lệch giữa seed và Firestore?**
A: Có thể do:
- Từ vựng được thêm thủ công vào Firestore
- Từ vựng được xóa khỏi Firestore
- Seed files chưa được cập nhật
- Có lỗi trong quá trình import

**Q: Làm sao để đồng bộ seed và Firestore?**
A: 
1. Xác định nguồn chính (seed hay Firestore)
2. Export dữ liệu từ nguồn chính
3. Import vào nguồn khác
4. Kiểm tra lại bằng script

**Q: Có thể chạy script này trên production không?**
A: Có, nhưng nên:
- Chạy vào giờ ít người dùng
- Backup dữ liệu trước
- Kiểm tra kỹ trước khi thực hiện thay đổi

---

**Cập nhật lần cuối:** 2026-05-14
