# Cấp độ ôn tập — Mapping & Quy ước đánh số

> File tham chiếu nhanh để mọi developer (và tương lai của bạn) hiểu ngay hệ thống cấp độ ôn tập trong LinguaFlash, tránh nhầm lẫn giữa **index trong code** và **nhãn hiển thị cho user**.

---

## 1. Quy ước đánh số

| Ngữ cảnh | Giá trị dùng | Phạm vi |
|---|---|---|
| **Data / Code** (Firestore, FSRS, migration) | `stepIndex` | `-1, 0, 1, 2, 3, 4` |
| **UI hiển thị cho user** (modal, thống kê, toast) | `"Cấp độ N"` | `Cấp độ 1 … Cấp độ 5` |

**Quy tắc dịch:** `UI = stepIndex + 1`.
Ví dụ: `stepIndex = 2` ↔ hiển thị **"Cấp độ 3"**.

`stepIndex = -1` chỉ tồn tại ở code, nghĩa là thẻ đang ở trạng thái NEW (chưa bước vào lịch ôn), **không có nhãn UI** cho giá trị này.

---

## 2. Bảng mapping đầy đủ

| `stepIndex` | UI | Thời gian chờ ôn kế tiếp | Phút | State điển hình |
|:---:|:---:|:---:|---:|:---|
| `-1` | — (không hiển thị) | — | — | `NEW` (chưa học lần nào) |
| `0` | **Cấp độ 1** | 30 phút | 30 | `LEARNING` / `REVIEW` sau lần học đầu |
| `1` | **Cấp độ 2** | 24 giờ (1 ngày) | 1 440 | `REVIEW` |
| `2` | **Cấp độ 3** | 7 ngày | 10 080 | `REVIEW` |
| `3` | **Cấp độ 4** | 21 ngày | 30 240 | `REVIEW` |
| `4` | **Cấp độ 5** | 45 ngày | 64 800 | `REVIEW` (bậc cao nhất — cap) |

Mảng gốc: [`FSRS.Steps`](../public/src/js/fsrs/fsrs.js:38)

```js
Steps: [30, 1440, 10080, 30240, 64800]  // phút
```

---

## 3. Quy tắc chuyển cấp sau mỗi lần ôn

Hàm [`_computeNextStep(prevStep, rating)`](../public/src/js/fsrs/fsrs.js) trong `fsrs.js`:

| Rating | Mô tả (tín hiệu user) | `stepIndex` mới |
|---|---|---|
| `AGAIN` | Sai ít nhất 1 lần (hoặc revealed) | **Lùi 1 bậc** `max(0, prev - 1)` (không xuống dưới Cấp độ 1) |
| `HARD` | Đúng nhưng khó | Giữ nguyên `prev` |
| `GOOD` | Đúng bình thường | `prev + 1` |
| `EASY` | Quá dễ | `prev + 2` |

Sau đó cap `min(maxIdx, value)` với `maxIdx = Steps.length - 1 = 4` (Cấp độ 5).

> **Luật khi sai:** chỉ cần user sai 1 lần trong phiên ôn → rating = `AGAIN` → từ bị **lùi xuống 1 cấp độ** so với cấp hiện tại (ví dụ Cấp độ 5 → Cấp độ 4), không tụt thẳng về Cấp độ 1. Cấp độ thấp nhất là Cấp độ 1 (`stepIndex = 0`). Xem [`ReviewPage._computeFinalRating`](../public/src/js/pages/review.js:716) và [`StudyPage._finalizeCard`](../public/src/js/pages/study.js:720).

---

## 4. Migration từ hệ cũ (pre-stepIndex)

Các thẻ được tạo trước phiên bản `v5.30` không có field `stepIndex`. Module [`FsrsMigration`](../public/src/js/fsrs/migration.js) ánh xạ `stability` (cũ, tính bằng phút) sang `stepIndex` mới:

| `stability` (phút) | `stepIndex` gán | UI |
|---|:---:|:---:|
| `< 720` (< 12h) | `0` | Cấp độ 1 |
| `< 4320` (< 3 ngày) | `1` | Cấp độ 2 |
| `< 20160` (< 2 tuần) | `2` | Cấp độ 3 |
| `< 64800` (< 45 ngày) | `3` | Cấp độ 4 |
| `≥ 64800` | `4` | Cấp độ 5 |

Migration là **idempotent** — được guard bằng `localStorage['lf_fsrs_migration_v1_<uid>']`.

---

## 5. Nơi hiển thị "Cấp độ N" trong UI

| Vị trí | File | Ghi chú |
|---|---|---|
| Modal đổi mode — nút chọn bậc | [`card-mode-manager.js`](../public/src/js/fsrs/card-mode-manager.js:176) | 5 nút "Cấp độ 1..5" |
| Modal đổi mode — note dưới grid | [`card-mode-manager.js`](../public/src/js/fsrs/card-mode-manager.js:183) | "Cấp độ 1 = 30 phút · Cấp độ 5 = 45 ngày" |
| Dialog xác nhận đổi mode | [`card-mode-manager.js`](../public/src/js/fsrs/card-mode-manager.js:236) | Tiêu đề: "Chuyển sang ôn tập ở Cấp độ N?" |
| Toast thành công | [`card-mode-manager.js`](../public/src/js/fsrs/card-mode-manager.js:248) | "Cấp độ N · <label thời gian>" |
| Section phân bố trên trang Từ vựng | [`vocabulary.js`](../public/src/js/pages/vocabulary.js:268) | 5 ô "Cấp độ 1..5" + progress bar |

---

## 6. Khi muốn thêm / sửa cấp độ

**Checklist khi thay đổi mảng `Steps`:**

1. Sửa [`FSRS.Steps`](../public/src/js/fsrs/fsrs.js:38) (giá trị phút).
2. Sửa comment mapping ở đầu file `fsrs.js` cho khớp.
3. Cập nhật bảng ở **mục 2** và **mục 4** trong file này.
4. Kiểm tra `FSRS.getStepLabel(i)` trả về nhãn thời gian mới (hiện đang trả: `['30 phút','24 giờ','7 ngày','21 ngày','45 ngày']`).
5. Nếu số lượng cấp thay đổi (thêm/bớt bậc):
   - Xem lại [`FsrsMigration._mapStabilityToStep`](../public/src/js/fsrs/migration.js) để chia ngưỡng stability.
   - Trong CSS [`components.css`](../public/src/css/components.css), grid `.vocab-level-cells` và `.lf-mode-option-group__steps` đang dùng `repeat(5, 1fr)` — đổi theo số cấp mới.
6. Bump version `sw.js` + file liên quan trong `index.html`.

---

## 7. FAQ

**Q: Tại sao không để `stepIndex` 1-based luôn trong data cho đỡ phải dịch?**
A: Vì `stepIndex = -1` (NEW) đã là một giá trị sentinel có nghĩa. Dời sang 0-based cho array index (`FSRS.Steps[stepIndex]`) tự nhiên và không có off-by-one. Chỉ tầng UI mới cần 1-based cho thân thiện với user.

**Q: "Cấp độ" có phải là stability không?**
A: Không. `stability` (số phút) là đại lượng liên tục, từng dùng ở thuật toán FSRS nguyên bản. Còn **`stepIndex` = cấp độ** là chỉ số rời rạc vào mảng `Steps` theo kiểu Anki. Hiện tại app dùng `stepIndex` là nguồn sự thật; `stability` được set bằng `Steps[stepIndex]` để giữ tương thích ngược.
