# Luật chọn nội dung từ vựng (Vocabulary Content Rules)

> Quy định BẮT BUỘC khi thêm từ vựng vào file seed trong
> [`packages/shell/public/seed-vocabulary/`](../packages/shell/public/seed-vocabulary) — nguồn seed duy nhất app nạp & deploy.
> Mục tiêu: chỉ học những đơn vị từ vựng thực sự đáng học, tránh rác từ vựng
> (danh từ riêng hiếm gặp, cụm từ dịch word-by-word).

> ⚠️ **Xóa từ vựng phải làm đủ các lớp** — xem mục 6. Chỉ sửa seed JSON là KHÔNG
> đủ vì thẻ cũ đã nằm trong Firestore `users/{uid}/cards` của user.

> 🔊 **Audio phát âm BẮT BUỘC render từ giọng đọc AI** — xem mục 0. Mọi từ mới
> thêm vào seed phải có file audio AI sinh từ pipeline TTS có sẵn của project.

---

## 0. Audio phát âm BẮT BUỘC render từ giọng đọc AI

Mọi audio phát âm gắn với từ vựng **bắt buộc** phải là audio được render từ
giọng đọc AI (AI TTS) thông qua hệ thống pre-generate có sẵn của project. Cấm
dùng audio thu âm thủ công, tải từ nguồn ngoài, hay nhúng URL TTS gọi runtime.

### 0.1. Nguồn chính thức duy nhất

- Pipeline sinh audio: [`scripts/tts/generate-audio.js`](../scripts/tts/generate-audio.js)
  — gọi TTS một lần ở máy dev, xuất file MP3 tĩnh.
- Cấu hình ngôn ngữ / accent / giọng: [`scripts/tts/config.js`](../scripts/tts/config.js).
- Provider hợp lệ: `edge`, `shopaikey`, `gemini`, `google`, `openai`, `elevenlabs`
  (xem `PROVIDERS` trong [`config.js`](../scripts/tts/config.js)).
- 🥇 **`edge` là provider CHÍNH THỨC đang dùng** (Microsoft Edge Neural TTS —
  miễn phí, KHÔNG cần API key). Client [`tts.js`](../packages/shell/src/js/utils/tts.js)
  duyệt nguồn theo thứ tự `['edge', 'elevenlabs', '']` (xem `_sources`). Nếu một
  từ **thiếu file Edge**, app rớt dần xuống nguồn khác, và cuối cùng rơi về
  **Web Speech API của trình duyệt** → giọng đọc lệ thuộc thiết bị, nghe KHÁC
  hẳn các từ khác (đây chính là lỗi "từ `bad` sai giọng").
- Giọng Edge cố định cho từng accent (xem `voices.edge` trong [`config.js`](../scripts/tts/config.js)):
  - **US** (giọng nam Anh-Mỹ): `en-US-GuyNeural`
  - **GB** (giọng nữ Anh-Anh): `en-GB-SoniaNeural`
- API key (nếu dùng provider khác) **chỉ** đọc từ biến môi trường (`.env` đã
  `.gitignore`) — KHÔNG bao giờ ghi key vào code/seed/bundle. `edge` không cần key.

### 0.2. Quy ước output

- File MP3 tĩnh lưu tại `packages/shell/public/audio/<lang>/<variant>/<slug>.mp3`
  (ví dụ `audio/en/us/<slug>.mp3`, `audio/en/gb/<slug>.mp3`).
- Slug suy ra từ `card.fieldValues.word` qua [`lib/slug.js`](../scripts/tts/lib/slug.js).
- App phát file tĩnh đã bundle — KHÔNG gọi API lúc chạy, không tốn phí, chạy
  offline.

### 0.3. Quy trình BẮT BUỘC khi thêm từ mới

> 🔊 Provider mặc định để generate là **`edge`** — giọng nữ Anh-Anh
> (`en-GB-SoniaNeural`) và giọng nam Anh-Mỹ (`en-US-GuyNeural`). Đây đúng là
> nguồn client ưu tiên số 1, nên PHẢI generate bằng `edge` để đồng nhất giọng.

Sau khi thêm từ vào seed (mục 5), phải sinh audio Edge cho từ đó:

1. Dry-run để kiểm tra danh sách:
   `node scripts/tts/generate-audio.js --lang english --provider edge --variant us,gb --dry-run`
2. Generate thật (resume — chỉ tạo file còn thiếu) + ghi manifest:
   `node scripts/tts/generate-audio.js --lang english --provider edge --variant us,gb --manifest`
   - Chỉ một vài từ: thêm `--only word1,word2`.
   - `edge` miễn phí, KHÔNG cần API key.
3. **Audit BẮT BUỘC** — xác nhận không còn từ nào thiếu file Edge:
   `node scripts/tts/audit-missing-edge.js`
   - Kết quả phải là **Missing 0/N** cho CẢ `us` và `gb`. Nếu còn thiếu, script
     in sẵn lệnh generate cho các từ đó → chạy rồi audit lại tới khi sạch.
   - ⚠️ Audit chỉ **phát hiện** file thiếu, KHÔNG tự sinh. Bỏ qua bước 2 mà chỉ
     audit thì file vẫn thiếu — đây chính là nguyên nhân lỗi ở mục 0.4.
4. Tăng `APP_VERSION` trong [`packages/shell/public/sw.js`](../packages/shell/public/sw.js)
   để service worker nạp audio mới (xem mục 6 — Lớp 3).

> ⚠️ Một mục từ vựng chỉ được coi là hoàn chỉnh khi đã có đủ file audio Edge cho
> mọi variant (accent) mà ngôn ngữ đó hỗ trợ VÀ audit báo Missing 0.

### 0.4. Vì sao trước đây nhiều từ bị thiếu audio (nguyên nhân gốc rễ)

Đã có lúc 311 từ (gồm cả `bad`) thiếu file Edge → app rớt về Web Speech API,
nghe khác hẳn các từ khác. Nguyên nhân:

1. **Từ được thêm vào seed nhưng bỏ qua bước generate** (mục 0.3 bước 2). Seed
   JSON có từ mới nhưng thư mục `audio/en/*_edge/` không có MP3 tương ứng.
2. **Nhầm giữa audit và generate.** `audit-missing-edge.js` chỉ *liệt kê* từ
   thiếu; nó KHÔNG tạo file. Chạy audit rồi tưởng đã xong là sai.
3. **Đổi provider chính sang `edge` nhưng chưa render lại toàn bộ.** Các từ cũ
   từng chỉ có file provider khác (hoặc chưa có file Edge) nên khi client ưu tiên
   `edge` thì không tìm thấy → fallback Web Speech.
4. **Commit thiếu MP3 thực tế.** Có lần chỉ commit doc + script audit mà quên
   `git add` các file `.mp3` mới → deploy xong vẫn thiếu audio.

**Cách phòng tránh:** luôn chạy đủ mục 0.3 (generate → audit Missing 0 → bump
`APP_VERSION`), và khi commit nhớ `git add` cả thư mục `audio/en/us_edge` +
`audio/en/gb_edge` (MP3 + `audio-manifest.json`).

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

## 2.3. Gán `familyId` — chỉ cho họ từ phái sinh cùng gốc

`familyId` dùng để gom **nhóm từ cùng họ** (gốc + biến đổi đuôi) phục vụ gợi ý
học theo nhóm. **KHÔNG** dùng `familyId` như nhãn chủ đề ngữ nghĩa.

- ✅ Cùng gốc phái sinh: `art / artist / artistic / artwork` → `familyId: "art"`.
- ❌ Cùng chủ đề nhưng khác gốc: `fat, protein, fiber` (dinh dưỡng);
  `breakfast, lunch, dinner` (bữa ăn) → KHÔNG gán chung `familyId`.

Tiêu chí kỹ thuật (LCP ≥ 3 ký tự VÀ ≥ 50% độ dài từ ngắn hơn) và cơ chế xác
thực runtime được mô tả đầy đủ ở **mục 0** của
[`family-word-learning-flow.md`](family-word-learning-flow.md). Đọc kỹ trước khi
gán `familyId` cho từ mới.

---

## 3. NGOẠI LỆ: Phrasal verb

**Phrasal verb KHÔNG bị áp dụng các quy định ở mục 1.** Phrasal verb luôn được
phép thêm, kể cả khi nghĩa có vẻ đoán được từ các thành phần, vì bản chất
phrasal verb là đơn vị từ vựng cố định cần học riêng.

- Các phrasal verb tập trung trong [`phrasal-verbs.json`](../packages/shell/public/seed-vocabulary/phrasal-verbs.json).
- Idiom tập trung trong [`idioms.json`](../packages/shell/public/seed-vocabulary/idioms.json).
- Hai file này **không bị rà soát/xóa** theo luật mục 1.

---

## 4. Checklist trước khi thêm 1 mục mới

1. Có phải danh từ riêng ít phổ biến không? → Nếu có: **loại**.
2. Có phải cụm nhiều từ không?
   - Là phrasal verb? → **Được thêm** (bỏ qua các bước sau).
   - Dịch word-by-word ra nghĩa giống hệt? → **Loại**.
   - Nghĩa thay đổi so với dịch word-by-word? → **Được thêm**.
3. Từ đơn thông dụng? → **Được thêm**.
4. Đã thêm vào seed? → **Generate audio Edge** cho từ (mục 0.3): chạy
   `generate-audio.js --provider edge --variant us,gb --manifest` (giọng nữ
   Anh-Anh `en-GB-SoniaNeural` + nam Anh-Mỹ `en-US-GuyNeural`), rồi
   `audit-missing-edge.js` phải báo **Missing 0** cho cả us/gb, cuối cùng bump
   `APP_VERSION`. Chưa đủ các bước này thì từ CHƯA hoàn chỉnh.

---

## 5. Nguồn seed duy nhất

Repo chỉ còn MỘT thư mục seed (đã gỡ `data/seed-vocabulary/` để tránh lệch dữ liệu):

- [`packages/shell/public/seed-vocabulary/*.json`](../packages/shell/public/seed-vocabulary) — vừa là nguồn gốc, vừa là bản app nạp & deploy.

Mọi thay đổi nội dung từ vựng chỉ cần áp dụng ở thư mục này. Các script generate/audit/TTS cũng đã trỏ về đây.

để tránh lệch dữ liệu giữa nguồn và bản phục vụ. Thư mục `dist/` và
`node_modules/@linguaflash/*` là build artifact tự sinh — KHÔNG sửa tay.

---

## 6. Xóa từ vựng triệt để (2 lớp)

Sửa seed JSON **không đủ** để gỡ một từ khỏi app. Thẻ học của user được lưu ở
Firestore `users/{uid}/cards`; seed chỉ tác động lần import mới, thẻ cũ vẫn hiển
thị (có nút "Học"/"Ôn ngay"). Phải xử lý đủ 2 lớp:

### Lớp 1 — Seed JSON

Xóa mục khỏi cả 2 thư mục ở mục 5. Có thể dùng:

- [`scripts/audit-content-rules.js`](../scripts/audit-content-rules.js): liệt kê ứng viên vi phạm.
- [`scripts/clean-content-rules.js`](../scripts/clean-content-rules.js): dọn dẹp (dry-run mặc định, `--apply` để xóa thật).

### Lớp 2 — Firestore user data (cleanup tự động trong app)

Thêm word cần xóa vào `REMOVED_VOCABULARY_WORDS` trong
[`content-rules-cleanup.js`](../packages/english/src/fsrs/content-rules-cleanup.js)
và **tăng `VERSION_KEY`** (vd `_v1` → `_v2`) để cleanup chạy lại cho mọi user.

Cơ chế:
- [`ContentRulesCleanup.run()`](../packages/english/src/fsrs/content-rules-cleanup.js) được gọi trong [`VocabularyPage._autoSeedTopics()`](../packages/english/src/pages/vocabulary.js) — xóa batch các thẻ vi phạm, idempotent qua localStorage flag.
- UI guard [`TopicDetailPage._purgeContentRuleViolationCards()`](../packages/english/src/pages/topic-detail.js) ẩn + xóa thẻ ngay khi mở trang topic, kể cả khi cleanup nền chưa chạy xong.

### Lớp 3 — Cache bust

Tăng `APP_VERSION` trong [`packages/shell/public/sw.js`](../packages/shell/public/sw.js)
để service worker đổi `CACHE_NAME` và nạp bundle mới.
