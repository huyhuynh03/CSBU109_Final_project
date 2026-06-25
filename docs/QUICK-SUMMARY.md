# 📊 Tóm Tắt Thống Kê Thẻ Học Theo Topic

> ⚠️ **LỖI THỜI (2026-05-14).** Tóm tắt này dựa trên thời điểm repo còn 2 thư mục seed
> nên số liệu (2.736 từ, 26/53 topic chênh lệch) KHÔNG còn đúng. Repo nay chỉ còn MỘT
> nguồn seed `packages/shell/public/seed-vocabulary/` (43 topic = 3623 thẻ).
> Chạy `node docs/audit-vocabulary-seeds.js` để xem số liệu cập nhật.

**Ngày tạo:** 2026-05-14
**Tổng số từ vựng trong seed:** 2,736  
**Topics có chênh lệch:** 26/53

---

## 🎯 Kết Quả Chính

### ✅ Tốt (27 topics khớp hoàn toàn)
```
emotion-feelings (140)
sports (126)
food-drink (119)
media-entertainment (115)
travel (114)
communication-social (102)
energy-resources (100)
home-living (100)
psychology (93)
daily-activities (92)
health (88)
arts (86)
personal-qualities (86)
daily-life (82)
environment-climate (82)
family-relationships (81)
space (76)
information-technology (69)
culture (63)
science (61)
mathematics (57)
physics (46)
biology (40)
literature-reading (37)
chemistry (35)
irregular-comparative (7)
irregular-superlative (7)
```

---

## ⚠️ CẦN XỬ LÝ NGAY (26 topics)

### 🔴 Chênh lệch lớn

| Topic | Public | Data | Vấn đề |
|-------|--------|------|--------|
| **irregular-verb-v1** | 132 | 0 | ❌ Chỉ ở public |
| **education** | 95 | 0 | ❌ Chỉ ở public |
| **education-intermediate** | 0 | 96 | ❌ Chỉ ở data |
| **irregular-verb-v3** | 56 | 132 | ❌ Data +76 |
| **irregular-verb-v2** | 114 | 133 | ❌ Data +19 |

### 🟡 Chỉ ở data (21 topics verbs)

```
verbs-basic-essential (15)
verbs-movement-travel (12)
verbs-physical-actions (10)
verbs-body-position (8)
verbs-cognition-thinking (8)
verbs-communication (8)
verbs-creation-building (8)
verbs-cutting-breaking (8)
verbs-fighting-conflict (8)
verbs-possession-transaction (8)
test-samples (7)
verbs-perception-senses (7)
verbs-change-transformation (5)
verbs-cleaning-maintenance (5)
verbs-eating-drinking (5)
verbs-attachment-connection (4)
verbs-destruction-damage (4)
verbs-searching-finding (4)
verbs-clothing-appearance (2)
verbs-sound-music (2)
verbs-spanning-covering (1)
```

---

## 🚀 Cách Kiểm Tra Ngay

### 1. Thống kê seed files
```bash
node docs/audit-vocabulary-seeds.js
```

### 2. Thống kê Firestore (Browser Console)
```javascript
// Copy nội dung file này vào console
// docs/firestore-cards-audit-by-topic.js
```

### 3. So sánh (Browser Console)
```javascript
// Copy nội dung file này vào console
// docs/compare-seed-vs-firestore.js
```

---

## 📋 Danh Sách Scripts

| File | Mục đích | Cách chạy |
|------|---------|----------|
| `audit-vocabulary-seeds.js` | Thống kê seed files | Node.js |
| `firestore-cards-audit-by-topic.js` | Thống kê Firestore | Browser console |
| `audit-cards-browser-console.js` | Chi tiết thẻ theo folder | Browser console |
| `compare-seed-vs-firestore.js` | So sánh seed vs Firestore | Browser console |

---

## 💡 Khuyến Nghị

### Ưu tiên 1: Irregular Verbs
- Kiểm tra xem `data` hay `public` là phiên bản chính
- Đồng bộ giữa hai thư mục
- Cập nhật Firestore nếu cần

### Ưu tiên 2: Education
- Quyết định: giữ `education` hay `education-intermediate`?
- Nếu giữ cả hai, cần đồng bộ

### Ưu tiên 3: Verbs Categories
- Quyết định có thêm 21 topics verbs vào app không
- Nếu có, copy từ `data` sang `public`

---

## 📊 Thống Kê Tổng Hợp

| Chỉ số | Giá trị |
|-------|--------|
| Tổng topics | 53 |
| Topics khớp | 27 ✅ |
| Topics chênh lệch | 26 ⚠️ |
| Tổng từ vựng | 2,736 |
| Public | 2,501 |
| Data | 2,604 |
| Chênh lệch | +103 |

---

## 📁 File Liên Quan

- [`VOCABULARY-AUDIT-REPORT.md`](VOCABULARY-AUDIT-REPORT.md) - Báo cáo chi tiết
- [`AUDIT-GUIDE.md`](AUDIT-GUIDE.md) - Hướng dẫn sử dụng
- [`audit-vocabulary-seeds-result.json`](audit-vocabulary-seeds-result.json) - Kết quả JSON

---

**Cập nhật:** 2026-05-14T15:01:15Z
