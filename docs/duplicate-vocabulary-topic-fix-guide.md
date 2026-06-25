# Hướng dẫn fix triệt để lỗi từ vựng bị lặp hoặc nằm sai topic

Tài liệu này ghi lại quy trình chuẩn sau case `atom` bị nằm trong topic Hóa học nhưng canonical topic đúng là Vật lý.

> **Chú thích — "trang học từ vựng" / "từ vựng đã nạp trong các topic của app" là phần đang chứa 3623 thẻ.**
>
> Mỗi khi tài liệu này (hoặc các tài liệu liên quan) nhắc đến "trang học từ vựng",
> "từ vựng đã nạp bên trong các topic của app", hãy hiểu đó là **đúng bộ 3623 thẻ**
> mà app thực sự load — KHÔNG phải toàn bộ file trong thư mục nguồn `data/seed-vocabulary/`.
>
> Có 2 thư mục seed dễ gây nhầm lẫn:
>
> | Thư mục | Vai trò | Số thẻ |
> |---------|---------|--------|
> | `packages/shell/public/seed-vocabulary/` | **Bản app thực sự nạp & deploy** | **3623** (43 file) |
> | `data/seed-vocabulary/` | Kho nguồn/nháp (gồm cả draft, test, verb-category chưa dùng) | 3726 (64 file) |
>
> App chỉ nạp đúng 43 file được khai báo trong [`VocabularyPage._seedTopics`](../packages/english/src/pages/vocabulary.js)
> từ `packages/shell/public/seed-vocabulary/`. Vì vậy con số chuẩn để đối chiếu với UI là **3623**.
> Chênh lệch 103 thẻ so với `data/` đến từ 23 file chỉ tồn tại trong `data/` mà app không nạp
> (ví dụ `education-intermediate.json`, `test-samples.json`, nhóm `verbs-*.json`).
>
> Khi audit "tổng số thẻ học từ vựng của app", luôn lọc theo danh sách `_seedTopics`
> thay vì quét toàn bộ thư mục, nếu không sẽ ra con số rộng hơn thực tế.

## 1. Nhận diện đúng bản chất lỗi

Trong app hiện tại, dữ liệu từ vựng thực tế của từng user nằm ở Firestore path:

```text
users/{userId}/cards/{cardId}
```

Không chỉ sửa seed JSON là đủ. Nếu user đã từng seed/import trước đó, card cũ vẫn nằm trong Firestore user data và app sẽ tiếp tục hiển thị card đó.

Triệu chứng thường gặp:

- Seed mới đã sửa nhưng UI vẫn còn từ cũ.
- Console log hiển thị topic được seed dạng `+0 created, 0 updated, N skipped`.
- Từ vựng vẫn hiện trong topic sai vì card cũ đã tồn tại và bị `skipped`.

## 2. Nguyên tắc fix chuẩn

Một lỗi trùng/sai topic phải xử lý đủ 4 lớp:

1. **Nguồn seed**: xóa/move từ khỏi file seed sai topic.
2. **Seed canonical**: đảm bảo từ đó tồn tại ở topic đúng nếu vẫn cần dùng.
3. **Migration/cleanup Firestore user data**: xóa hoặc move card cũ đã tồn tại trong `users/{userId}/cards`.
4. **UI guard/cache bust**: đảm bảo topic sai không hiển thị lại card trong lúc cleanup chạy hoặc khi cache cũ còn tồn tại.

## 3. Checklist xử lý nhanh

### Bước 1: Tìm tất cả nơi chứa từ

Chạy grep toàn repo theo từ cần xử lý, ví dụ với `atom`:

```bash
git grep -n "\batom\b"
```

Cần kiểm tra ít nhất:

- `packages/shell/public/seed-vocabulary/*.json` (nguồn seed duy nhất app nạp & deploy)
- Các script cleanup/migration trong `packages/english/src/pages/*.js`
- Các tài liệu/script maintenance trong `docs/*.js`

### Bước 2: Sửa seed sai topic

Nếu từ nằm sai ở topic A, xóa khỏi:

```text
packages/shell/public/seed-vocabulary/{topic-sai}.json
```

Nếu từ vẫn cần học ở topic B, đảm bảo nó có trong:

```text
packages/shell/public/seed-vocabulary/{topic-dung}.json
```

Sau đó cập nhật metadata nếu cần:

- `_meta.totalCards`
- `_meta.totalFamilies`
- `familyOrder`
- `familyId`
- note mô tả taxonomy

### Bước 3: Thêm migration/cleanup Firestore user data

Pattern đã dùng trong app nằm tại `public/src/js/pages/vocabulary.js`.

Ý tưởng:

- Query toàn bộ vocabulary cards bằng `FirestoreDB.getCards({})`.
- Tìm card có `folderId === fromFolder` và `fieldValues.word` thuộc danh sách cần migrate.
- Nếu topic đích đã có bản tương đương, xóa bản sai topic.
- Nếu topic đích chưa có, move card sang topic đúng bằng `FirestoreDB.updateCard()`.

Ví dụ pattern:

```js
const migrations = [
    {
        fromFolder: 'chemistry',
        toFolder: 'physics',
        words: new Set(['atom', 'proton', 'electron', 'neutron']),
        familyId: 'atomic-physics',
        examples: {
            atom: 'An atom contains a nucleus and electrons.'
        }
    }
];
```

Lưu ý quan trọng:

- `FirestoreDB.updateCard()` phải trả về `true/false` để migration biết update thành công.
- `FirestoreDB.deleteCard()` đã trả về `true/false`.
- Nếu không có quyền admin, cleanup client-side vẫn chạy được vì user chỉ xóa dữ liệu của chính user đó theo Firestore Rules.

### Bước 4: Thêm UI guard ở topic sai

Để tránh user vẫn thấy card sai trong lúc cleanup chưa xong, thêm guard ngay trong trang topic detail.

Pattern đã dùng trong `public/src/js/pages/topic-detail.js`:

```js
if (this._topicId === 'chemistry') {
    topicCards = await this._purgeRemovedChemistryAtomCards(topicCards);
}
```

Trong hàm purge:

- Tìm card sai topic.
- Gọi `FirestoreDB.deleteCard(card.id)`.
- Luôn filter card đó khỏi UI, kể cả khi delete lỗi tạm thời.

Nguyên tắc này giúp UI sạch ngay lập tức, còn Firestore sẽ được dọn khi quyền/network cho phép.

### Bước 5: Bump cache-bust version

Sau khi sửa JS, tăng version query trong `public/index.html`, ví dụ:

```html
<script src="/src/js/db/firestore.js?v=12"></script>
<script src="/src/js/pages/topic-detail.js?v=11"></script>
<script src="/src/js/pages/vocabulary.js?v=56"></script>
```

Nếu không bump version, Vercel/browser/service worker có thể tiếp tục dùng file JS cũ.

### Bước 6: Kiểm tra trước khi push

Chạy kiểm tra cú pháp:

```bash
node --check public/src/js/pages/topic-detail.js
node --check public/src/js/pages/vocabulary.js
node --check public/src/js/db/firestore.js
```

Grep lại từ trong seed sai topic:

```bash
git grep -n "\batom\b" -- packages/shell/public/seed-vocabulary/chemistry.json
```

Kết quả đúng là không còn match trong topic sai.

### Bước 7: Commit và push

```bash
git add packages/english/src/pages/topic-detail.js packages/english/src/pages/vocabulary.js packages/shell/public/sw.js packages/shell/public/seed-vocabulary
git commit -m "Fix duplicate vocabulary topic migration"
git push
```

Sau khi push, kiểm tra Vercel deployment:

- Nếu deployment đang `Building`, chờ xong.
- Nếu production vẫn trỏ commit cũ, bản mới chưa promote.
- Nếu deployment fail, xem build log trước; không đoán từ màn hình summary.

## 4. Khi nào xóa, khi nào move?

### Nên xóa card sai topic nếu

- Topic đúng đã có card tương đương.
- Card sai topic chỉ là duplicate legacy.
- User không cần giữ tiến độ học của bản sai topic.

### Nên move card nếu

- Topic đúng chưa có card tương đương.
- Muốn giữ tiến độ FSRS/review của user.
- Từ đó vẫn hợp lệ nhưng bị đặt sai topic.

## 5. Quy tắc canonical topic

Trước khi fix, phải quyết định topic canonical cho từ đó.

Ví dụ case đã xử lý:

| Word | Topic sai | Topic đúng | Cách xử lý |
| --- | --- | --- | --- |
| `atom` | `chemistry` | `physics` | Xóa duplicate trong Chemistry nếu Physics đã có |
| `proton` | `chemistry` | `physics` | Move/xóa duplicate |
| `electron` | `chemistry` | `physics` | Move/xóa duplicate |
| `neutron` | `chemistry` | `physics` | Move/xóa duplicate |
| `laboratory` | `chemistry` | `science` | Move/xóa duplicate |

## 6. Script admin chỉ là phương án phụ

Firebase Admin SDK có thể xóa toàn cục nhưng cần credential admin. Nếu máy/dev environment không có service account hoặc ADC, script sẽ lỗi.

Vì vậy phương án bền nhất trong app này là:

- Sửa seed để không tạo lại lỗi.
- Thêm migration/cleanup client-side để dọn dữ liệu user hiện có.
- Thêm UI guard để không hiển thị card sai topic trong mọi tình huống.

## 7. Template fix nhanh cho một từ mới

Giả sử cần chuyển `WORD` từ `OLD_TOPIC` sang `NEW_TOPIC`:

1. Xóa `WORD` khỏi seed `OLD_TOPIC`.
2. Thêm/đảm bảo `WORD` có ở seed `NEW_TOPIC`.
3. Thêm migration:

```js
{
    fromFolder: 'OLD_TOPIC',
    toFolder: 'NEW_TOPIC',
    words: new Set(['WORD']),
    familyId: 'NEW_FAMILY_ID',
    examples: {
        WORD: 'Example sentence.'
    }
}
```

4. Nếu lỗi đang ảnh hưởng UI nghiêm trọng, thêm guard trong topic detail:

```js
if (this._topicId === 'OLD_TOPIC') {
    topicCards = await this._purgeRemovedOldTopicWordCards(topicCards);
}
```

5. Bump version trong `public/index.html`.
6. Chạy `node --check`.
7. Commit, push, kiểm tra Vercel.

## 8. Sai lầm cần tránh

- Chỉ sửa seed mà không dọn Firestore user data.
- Chạy script trong Firebase Console/browser console và mong có quyền xóa mọi collection.
- Quên bump version JS trong `public/index.html`.
- Không kiểm tra topic đúng đã có duplicate trước khi move.
- Xóa nhầm từ canonical ở topic đúng.
- Tạo root `package.json` maintenance không cần thiết cho project static deploy, có thể làm Vercel đổi pipeline deploy.

## 9. Kết luận

Cách fix triệt để luôn là: **seed sạch + migration/cleanup dữ liệu user + UI guard + cache bust + deploy sạch**.

Đây là pattern nên dùng cho mọi lỗi từ vựng bị lặp hoặc nằm sai topic trong LinguaFlash.
