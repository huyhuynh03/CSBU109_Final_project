# Luật chọn nội dung từ vựng (Vocabulary Content Rules)

> Quy định BẮT BUỘC khi thêm từ vựng vào bất kỳ file seed nào trong
> [`data/seed-vocabulary/`](../data/seed-vocabulary) và [`public/seed-vocabulary/`](../public/seed-vocabulary).
> Mục tiêu: chỉ học những đơn vị từ vựng thực sự đáng học, tránh rác từ vựng
> (danh từ riêng hiếm gặp, cụm từ dịch word-by-word).

---

## 1. KHÔNG được thêm

### 1.1. Danh từ riêng ít phổ biến

Không thêm tên riêng (proper noun) hiếm gặp, mang tính chuyên biệt về một
trường phái / phong cách / địa danh / thương hiệu... mà người học phổ thông
hiếm khi cần.

**Ví dụ loại bỏ:** `Gothic`, `Baroque`, `Renaissance` (khi dùng như tên phong
cách riêng), tên riêng địa phương, tên trường phái nghệ thuật hiếm...

> **Ngoại lệ 1 — Danh từ riêng cực kỳ phổ biến:** vẫn có thể giữ nếu cần cho
> giao tiếp/đọc hiểu cơ bản (cân nhắc theo tần suất sử dụng thực tế).

> **Ngoại lệ 2 — Tính từ phái sinh thông dụng:** GIỮ LẠI các tính từ được tạo
> từ danh từ riêng nhưng đã trở thành thuật ngữ mô tả thông dụng (không còn là
> tên riêng nữa). Đây là từ vựng mang nghĩa khái quát, hữu ích để học.
>
> **Ví dụ giữ lại:** `Martian` (thuộc sao Hỏa), `Venusian` (thuộc sao Kim),
> `Jovian` (thuộc sao Mộc), `Arctic` (thuộc Bắc Cực)... — các tính từ thiên văn
> / địa lý / khoa học dùng để mô tả đặc tính.
>
> **Cách phân biệt:** nếu từ là *tên gọi* của một phong cách/trường phái/thực
> thể cụ thể → loại (vd `Gothic`, `Baroque`). Nếu từ là *tính từ mô tả* đặc
> tính chung và xuất hiện thường xuyên trong văn cảnh khoa học/đời sống → giữ
> (vd `Martian`).

### 1.2. Cụm từ dịch word-by-word (nghĩa không đổi)

Không thêm cụm từ được ghép từ các từ đơn mà nghĩa của cả cụm **giống hệt**
khi dịch word-by-word từng từ lẻ. Lý do: học từng từ đơn là đủ, không cần học
lại cụm.

**Ví dụ loại bỏ** (`partOfSpeech: "phrase"`):

| Cụm từ | Dịch word-by-word | Kết luận |
|--------|-------------------|----------|
| `clean the house` | dọn dẹp + ngôi nhà = dọn dẹp nhà cửa | ❌ Loại |
| `cook dinner` | nấu + bữa tối = nấu bữa tối | ❌ Loại |
| `feed the pet` | cho ăn + thú cưng = cho thú cưng ăn | ❌ Loại |
| `meet friends` | gặp + bạn bè = gặp bạn bè | ❌ Loại |
| `prepare breakfast` | chuẩn bị + bữa sáng = chuẩn bị bữa sáng | ❌ Loại |
| `reply to messages` | trả lời + tin nhắn = trả lời tin nhắn | ❌ Loại |

---

## 2. ĐƯỢC thêm

### 2.1. Từ đơn

Danh từ, động từ, tính từ, trạng từ... thông dụng.

### 2.2. Từ ghép / cụm có nghĩa THAY ĐỔI so với dịch word-by-word

Chỉ thêm cụm nhiều từ khi nghĩa tổng thể **khác** với việc dịch ghép từng từ
lẻ (nghĩa bóng, idiom, collocation cố định, compound có nghĩa riêng).

**Ví dụ giữ lại:**

| Cụm từ | Dịch word-by-word | Nghĩa thực | Kết luận |
|--------|-------------------|-----------|----------|
| `break the ice` | làm vỡ băng | phá tan sự ngại ngùng | ✅ Giữ |
| `hot dog` | con chó nóng | bánh mì kẹp xúc xích | ✅ Giữ |
| `deadline` | đường chết | hạn chót | ✅ Giữ |
| `take place` | lấy chỗ | diễn ra | ✅ Giữ |

---

## 3. NGOẠI LỆ: Phrasal verb

**Phrasal verb KHÔNG bị áp dụng các quy định ở mục 1.** Phrasal verb luôn được
phép thêm, kể cả khi nghĩa có vẻ đoán được từ các thành phần, vì bản chất
phrasal verb là đơn vị từ vựng cố định cần học riêng.

- Các phrasal verb tập trung trong [`phrasal-verbs.json`](../data/seed-vocabulary/phrasal-verbs.json).
- Idiom tập trung trong [`idioms.json`](../data/seed-vocabulary/idioms.json).
- Hai file này **không bị rà soát/xóa** theo luật mục 1.

---

## 4. Checklist trước khi thêm 1 mục mới

1. Có phải danh từ riêng ít phổ biến không? → Nếu có: **loại**.
2. Có phải cụm nhiều từ không?
   - Là phrasal verb? → **Được thêm** (bỏ qua các bước sau).
   - Dịch word-by-word ra nghĩa giống hệt? → **Loại**.
   - Nghĩa thay đổi so với dịch word-by-word? → **Được thêm**.
3. Từ đơn thông dụng? → **Được thêm**.

---

## 5. Đồng bộ 2 thư mục

Mọi thay đổi nội dung từ vựng phải áp dụng song song cho:

- [`data/seed-vocabulary/*.json`](../data/seed-vocabulary)
- [`public/seed-vocabulary/*.json`](../public/seed-vocabulary)

(và các bản copy trong `packages/*` nếu có) để tránh lệch dữ liệu giữa nguồn và
bản phục vụ.
