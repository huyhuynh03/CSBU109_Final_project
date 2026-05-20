# 📊 Báo Cáo Thống Kê Từ Vựng - Vocabulary Audit Report

**Ngày tạo:** 2026-05-14  
**Tổng số topics:** 53  
**Tổng số từ vựng:** 2,736  
**Topics có chênh lệch:** 26  

---

## 📈 Tóm Tắt Chung

| Chỉ số | Giá trị |
|-------|--------|
| Tổng từ vựng trong `public/seed-vocabulary` | 2,501 |
| Tổng từ vựng trong `data/seed-vocabulary` | 2,604 |
| Chênh lệch tổng | +103 |
| Topics khớp hoàn toàn | 27 ✅ |
| Topics có chênh lệch | 26 ⚠️ |
| Topics chỉ ở `public` | 2 |
| Topics chỉ ở `data` | 22 |

---

## ⚠️ TOPICS CÓ SỰ CHÊNH LỆCH (26 topics)

### 🔴 Chênh lệch lớn (>10 từ)

| Topic | Public | Data | Chênh lệch | Ghi chú |
|-------|--------|------|-----------|---------|
| **irregular-verb-v3** | 56 | 132 | +76 | ❌ Data có 76 từ THÊM |
| **irregular-verb-v2** | 114 | 133 | +19 | ❌ Data có 19 từ THÊM |
| **education-intermediate** | 0 | 96 | +96 | ❌ Chỉ có trong data |
| **education** | 95 | 0 | -95 | ❌ Chỉ có trong public |
| **irregular-verb-v1** | 132 | 0 | -132 | ❌ Chỉ có trong public |

### 🟡 Chênh lệch nhỏ (1-10 từ)

| Topic | Public | Data | Chênh lệch | Ghi chú |
|-------|--------|------|-----------|---------|
| **verbs-basic-essential** | 0 | 15 | +15 | Chỉ có trong data |
| **verbs-movement-travel** | 0 | 12 | +12 | Chỉ có trong data |
| **verbs-physical-actions** | 0 | 10 | +10 | Chỉ có trong data |
| **verbs-body-position** | 0 | 8 | +8 | Chỉ có trong data |
| **verbs-cognition-thinking** | 0 | 8 | +8 | Chỉ có trong data |
| **verbs-communication** | 0 | 8 | +8 | Chỉ có trong data |
| **verbs-creation-building** | 0 | 8 | +8 | Chỉ có trong data |
| **verbs-cutting-breaking** | 0 | 8 | +8 | Chỉ có trong data |
| **verbs-fighting-conflict** | 0 | 8 | +8 | Chỉ có trong data |
| **verbs-possession-transaction** | 0 | 8 | +8 | Chỉ có trong data |
| **test-samples** | 0 | 7 | +7 | Chỉ có trong data |
| **verbs-perception-senses** | 0 | 7 | +7 | Chỉ có trong data |
| **verbs-change-transformation** | 0 | 5 | +5 | Chỉ có trong data |
| **verbs-cleaning-maintenance** | 0 | 5 | +5 | Chỉ có trong data |
| **verbs-eating-drinking** | 0 | 5 | +5 | Chỉ có trong data |
| **verbs-attachment-connection** | 0 | 4 | +4 | Chỉ có trong data |
| **verbs-destruction-damage** | 0 | 4 | +4 | Chỉ có trong data |
| **verbs-searching-finding** | 0 | 4 | +4 | Chỉ có trong data |
| **verbs-clothing-appearance** | 0 | 2 | +2 | Chỉ có trong data |
| **verbs-sound-music** | 0 | 2 | +2 | Chỉ có trong data |
| **verbs-spanning-covering** | 0 | 1 | +1 | Chỉ có trong data |

---

## ✅ TOPICS KHỚP HOÀN TOÀN (27 topics)

| Topic | Số từ |
|-------|-------|
| emotion-feelings | 140 |
| sports | 126 |
| food-drink | 119 |
| media-entertainment | 115 |
| travel | 114 |
| communication-social | 102 |
| energy-resources | 100 |
| home-living | 100 |
| psychology | 93 |
| daily-activities | 92 |
| health | 88 |
| arts | 86 |
| personal-qualities | 86 |
| daily-life | 82 |
| environment-climate | 82 |
| family-relationships | 81 |
| space | 76 |
| information-technology | 69 |
| culture | 63 |
| science | 61 |
| mathematics | 57 |
| physics | 46 |
| biology | 40 |
| literature-reading | 37 |
| chemistry | 35 |
| irregular-comparative | 7 |
| irregular-superlative | 7 |

---

## 🔍 Phân Tích Chi Tiết

### 1️⃣ Vấn Đề với Irregular Verbs

**Tình trạng hiện tại:**
- `irregular-verb-v1`: 132 từ (chỉ ở public)
- `irregular-verb-v2`: 114 từ (public) vs 133 từ (data) → **Chênh lệch +19**
- `irregular-verb-v3`: 56 từ (public) vs 132 từ (data) → **Chênh lệch +76**

**Khuyến nghị:**
- Cần kiểm tra xem `data/seed-vocabulary` có phải là phiên bản mới nhất không
- Nếu `data` là đúng, cần cập nhật `public/seed-vocabulary` để đồng bộ
- Nếu `public` là đúng, cần xóa hoặc cập nhật `data`

### 2️⃣ Vấn Đề với Education

**Tình trạng hiện tại:**
- `education`: 95 từ (chỉ ở public)
- `education-intermediate`: 96 từ (chỉ ở data)

**Khuyến nghị:**
- Có thể `education-intermediate` là phiên bản mới thay thế `education`
- Cần quyết định: giữ cả hai hay chỉ giữ một?
- Nếu giữ cả hai, cần đồng bộ giữa public và data

### 3️⃣ Vấn Đề với Verbs Categories

**Tình trạng hiện tại:**
- 21 topics về verbs chỉ có trong `data/seed-vocabulary`
- Tổng cộng: 155 từ

**Khuyến nghị:**
- Các topics này chưa được thêm vào `public/seed-vocabulary`
- Cần quyết định: có muốn thêm chúng vào app không?
- Nếu có, cần copy từ `data` sang `public`

---

## 📋 Danh Sách Topics Chỉ Có Trong Một Thư Mục

### 📂 Chỉ ở `public/seed-vocabulary` (2 topics)
1. **irregular-verb-v1** - 132 từ
2. **education** - 95 từ

### 📂 Chỉ ở `data/seed-vocabulary` (22 topics)
1. **education-intermediate** - 96 từ
2. **verbs-basic-essential** - 15 từ
3. **verbs-movement-travel** - 12 từ
4. **verbs-physical-actions** - 10 từ
5. **verbs-body-position** - 8 từ
6. **verbs-cognition-thinking** - 8 từ
7. **verbs-communication** - 8 từ
8. **verbs-creation-building** - 8 từ
9. **verbs-cutting-breaking** - 8 từ
10. **verbs-fighting-conflict** - 8 từ
11. **verbs-possession-transaction** - 8 từ
12. **test-samples** - 7 từ
13. **verbs-perception-senses** - 7 từ
14. **verbs-change-transformation** - 5 từ
15. **verbs-cleaning-maintenance** - 5 từ
16. **verbs-eating-drinking** - 5 từ
17. **verbs-attachment-connection** - 4 từ
18. **verbs-destruction-damage** - 4 từ
19. **verbs-searching-finding** - 4 từ
20. **verbs-clothing-appearance** - 2 từ
21. **verbs-sound-music** - 2 từ
22. **verbs-spanning-covering** - 1 từ

---

## 🛠️ Hướng Dẫn Sửa Chữa

### Bước 1: Xác định nguồn dữ liệu chính
- Quyết định `public` hay `data` là nguồn chính
- Thường `public` là phiên bản được sử dụng trong app

### Bước 2: Đồng bộ dữ liệu
```bash
# Nếu public là chính, copy sang data
cp public/seed-vocabulary/*.json data/seed-vocabulary/

# Nếu data là chính, copy sang public
cp data/seed-vocabulary/*.json public/seed-vocabulary/
```

### Bước 3: Kiểm tra Firestore
- Chạy script `docs/audit-cards-browser-console.js` để kiểm tra số thẻ trong Firestore
- So sánh với seed files để phát hiện thẻ bị mất hoặc thừa

### Bước 4: Cập nhật app
- Nếu thêm topics mới, cần cập nhật `public/src/js/config/vocabulary-topics.js`
- Nếu xóa topics, cần xóa thẻ liên quan từ Firestore

---

## 📝 Ghi Chú

- **Ngày tạo báo cáo:** 2026-05-14T14:59:41.361Z
- **Script sử dụng:** `docs/audit-vocabulary-seeds.js`
- **Dữ liệu chi tiết:** `docs/audit-vocabulary-seeds-result.json`

---

## 🔗 Liên Quan

- [`docs/audit-cards-browser-console.js`](audit-cards-browser-console.js) - Thống kê thẻ trong Firestore
- [`docs/compare-seed-vs-firestore.js`](compare-seed-vs-firestore.js) - So sánh seed vs Firestore
- [`public/src/js/config/vocabulary-topics.js`](../public/src/js/config/vocabulary-topics.js) - Danh sách topics trong app
