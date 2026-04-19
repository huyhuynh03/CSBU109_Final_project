# Plan: Topic Detail Page (Trang chi tiết chủ đề từ vựng)

## Mục tiêu
Khi click vào 1 topic card trong [`vocabulary.js`](../public/src/js/pages/vocabulary.js), mở trang chi tiết hiển thị danh sách thẻ từ vựng thuộc topic đó, kèm nút Học hoặc Ôn tập tương ứng với trạng thái từng thẻ.

## Vấn đề hiện tại
- `onclick="Router.navigate('/folder/${topic.id}')"` ở [`vocabulary.js:295`](../public/src/js/pages/vocabulary.js:295) navigate đến route `/folder/:id` **không được đăng ký** trong [`app.js`](../public/src/js/app.js:58) → router fallback về `/`, kết quả nhảy về dashboard.

## Phương án

### 1. Route & file mới
- Tạo file [`public/src/js/pages/topic-detail.js`](../public/src/js/pages/topic-detail.js) với object `TopicDetailPage` (render, onEnter, _loadCards, ...).
- Đăng ký route `/topic/:id` trong [`app.js`](../public/src/js/app.js:58):
  ```js
  Router.register('/topic/:id', {
      render: () => TopicDetailPage.render(),
      onEnter: (params) => TopicDetailPage.onEnter && TopicDetailPage.onEnter(params)
  });
  ```
- Sửa [`vocabulary.js:295`](../public/src/js/pages/vocabulary.js:295): `/folder/${topic.id}` → `/topic/${topic.id}`.

### 2. Layout trang Topic Detail
```
┌──────────────────────────────────────────────────────┐
│ ← [icon] Giáo dục                          7 thẻ     │
│   Tổng 7 • Mới 5 • Đã thuộc 2                        │
├──────────────────────────────────────────────────────┤
│ Danh sách từ vựng                                     │
│ ┌─────────────────────────────────────────┐          │
│ │ educate         (verb)              [Dễ]│          │
│ │ giáo dục, đào tạo            [Học →]   │          │
│ ├─────────────────────────────────────────┤          │
│ │ student         (noun)              [Dễ]│          │
│ │ học sinh                     [Ôn tập →]│          │
│ └─────────────────────────────────────────┘          │
└──────────────────────────────────────────────────────┘
```

### 3. Thẻ từ vựng (vocab row)
- **Layout list-row** (full width), border-left màu theo difficulty.
- **Bên trái**:
  - Dòng 1: `word` (font lớn, đậm) + badge `partOfSpeech` nhỏ.
  - Dòng 2: `meaning` (tiếng Việt).
- **Góc phải-trên**: badge nhỏ "Dễ" hoặc "Khó" lấy từ `CardSchemas.DIFFICULTY_LEVELS[difficulty].short`.
- **Bên phải**: 1 nút action **dynamic theo state**:
  - State `new (0)` hoặc `learning (1)` → nút **"Học"** (màu xanh, var `--color-success`).
    - Click → `Router.navigate('/study?type=vocabulary&cardId=<id>')`
  - State `review (2)` hoặc `relearning (3)` → nút **"Ôn tập"** (màu cam, var `--color-warning`).
    - Click → `Router.navigate('/review?type=vocabulary&cardId=<id>')`
- **Màu thẻ theo difficulty** (dùng vars có sẵn):
  - `intermediate` (Dễ): `--difficulty-int` (xanh).
  - `advanced` (Khó): `--difficulty-adv` (đỏ/cam).

### 4. Sửa Study & Review để hỗ trợ học/ôn 1 thẻ riêng lẻ
- [`study.js`](../public/src/js/pages/study.js:33) `_init()`:
  - Đọc thêm `cardId` từ URL params.
  - Nếu có `cardId`: lọc `cards = cards.filter(c => c.id === cardId)` sau filter state new/learning.
- [`review.js`](../public/src/js/pages/review.js:33) `_init()`:
  - Tương tự, lọc theo `cardId` sau filter state review/relearning.
- Nếu sau filter mảng rỗng → `_renderEmpty()` với message phù hợp ("Thẻ không khả dụng cho chế độ này").

### 5. Empty state
- Topic chưa có thẻ → hiển thị icon + text "Chưa có từ vựng trong chủ đề này" + nút "← Quay lại".

### 6. CSS mới (trong [`components.css`](../public/src/css/components.css))
Class chính cần tạo:
- `.topic-detail-page`, `.topic-detail-header`, `.topic-detail-header__icon`, `.topic-detail-header__back`, `.topic-detail-stats`
- `.topic-detail-list` (container)
- `.topic-vocab-row` (mỗi card)
  - Modifier `.topic-vocab-row--easy` / `.topic-vocab-row--hard` để set border-left & subtle bg.
- `.topic-vocab-row__main`, `.topic-vocab-row__word`, `.topic-vocab-row__pos`, `.topic-vocab-row__meaning`
- `.topic-vocab-row__diff-badge` (góc phải trên)
- `.topic-vocab-row__action`
- `.topic-vocab-btn`, `.topic-vocab-btn--study` (xanh), `.topic-vocab-btn--review` (cam)
- Tận dụng `--difficulty-int`, `--difficulty-adv` đã có sẵn trong [`variables.css`](../public/src/css/variables.css).

### 7. Cập nhật cache & deploy
- Bump SW lên `v5.12` ([`sw.js`](../public/sw.js)).
- Bump version các script trong [`index.html`](../public/index.html):
  - `vocabulary.js?v=7`
  - `app.js?v=N+1`
  - Thêm `<script src="/src/js/pages/topic-detail.js?v=1"></script>`
- Thêm `topic-detail.js` vào `STATIC_ASSETS` trong [`sw.js`](../public/sw.js).
- Git commit + push.

## Checklist triển khai
- [ ] Tạo [`topic-detail.js`](../public/src/js/pages/topic-detail.js) với template, _loadCards, render row, helper xác định nút Học/Ôn tập theo state.
- [ ] Đăng ký route `/topic/:id` trong [`app.js`](../public/src/js/app.js).
- [ ] Sửa [`vocabulary.js`](../public/src/js/pages/vocabulary.js) navigate `/topic/...` thay vì `/folder/...`.
- [ ] Thêm filter `cardId` trong [`study.js`](../public/src/js/pages/study.js) `_init()`.
- [ ] Thêm filter `cardId` trong [`review.js`](../public/src/js/pages/review.js) `_init()`.
- [ ] Thêm CSS `.topic-detail-*` và `.topic-vocab-row*` trong [`components.css`](../public/src/css/components.css).
- [ ] Add script tag + bump versions trong [`index.html`](../public/index.html).
- [ ] Bump SW cache version + thêm asset trong [`sw.js`](../public/sw.js).
- [ ] Git push.
