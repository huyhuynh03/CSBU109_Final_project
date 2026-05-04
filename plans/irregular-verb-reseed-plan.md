# Kế hoạch reset và reseed irregular verbs

## Mục tiêu

Đồng bộ lại dữ liệu irregular verbs theo cấu trúc topic mới:

- [`irregular-verb-v1.json`](../public/seed-vocabulary/irregular-verb-v1.json): 132 thẻ V1
- [`irregular-verb-v2.json`](../public/seed-vocabulary/irregular-verb-v2.json): 114 thẻ V2
- [`irregular-verb-v3.json`](../public/seed-vocabulary/irregular-verb-v3.json): 56 thẻ V3

## Quy tắc dữ liệu mới

1. Nhóm `V1 = V2 = V3`
   - Chỉ tồn tại trong topic V1
   - Có chú thích `V1 = V2 = V3`

2. Nhóm `V2 = V3`, khác V1
   - V1 nằm trong topic V1
   - V2/V3 chỉ tồn tại một lần trong topic V2
   - Có chú thích `V2 = V3`

3. Nhóm còn lại
   - V1 ở topic V1
   - V2 ở topic V2
   - V3 ở topic V3

## Vì sao phải reset trước khi reseed

Cơ chế import hiện tại trong [`SeedImporter.importSeed()`](../public/src/js/utils/seed-importer.js:82) chống trùng theo `word` toàn cục.
Khi card đã tồn tại, importer chỉ cập nhật [`fieldValues`](../public/src/js/utils/seed-importer.js:139), không chuyển lại [`folderId`](../public/src/js/db/firestore.js:305).

Vì vậy nếu chỉ import đè, dữ liệu Firestore cũ sẽ tiếp tục làm lệch số lượng topic.

## Cách làm đúng

### Bước 1: Xóa dữ liệu 3 topic irregular verb cũ trong Firestore

Dùng [`FirestoreDB.deleteCardsInFolder()`](../public/src/js/db/firestore.js:336) để xóa lần lượt:

- `irregular-verb-v1`
- `irregular-verb-v2`
- `irregular-verb-v3`

### Bước 2: Reseed lại đúng thứ tự

Gọi [`SeedImporter.importFile()`](../public/src/js/utils/seed-importer.js:184) theo thứ tự:

1. `irregular-verb-v1.json`
2. `irregular-verb-v2.json`
3. `irregular-verb-v3.json`

Thứ tự này đảm bảo:
- mọi base form vào V1 trước
- các card V2 hợp lệ vào sau
- các card V3 thật sự khác V2 vào cuối

### Bước 3: Kiểm tra kết quả kỳ vọng

Sau reseed, số lượng kỳ vọng là:

- V1: `132`
- V2: `114`
- V3: `56`

## Console script đề xuất để chạy thủ công trong app

```js
(async () => {
  const folders = ['irregular-verb-v1', 'irregular-verb-v2', 'irregular-verb-v3'];

  for (const folderId of folders) {
    console.log('Deleting folder:', folderId);
    await FirestoreDB.deleteCardsInFolder(folderId);
  }

  const files = [
    'irregular-verb-v1.json',
    'irregular-verb-v2.json',
    'irregular-verb-v3.json'
  ];

  for (const filename of files) {
    console.log('Importing file:', filename);
    const result = await SeedImporter.importFile(filename);
    console.log(filename, result);
  }

  const cards = await FirestoreDB.getCards({ cardType: 'vocabulary' });
  const counts = cards.reduce((acc, card) => {
    const folderId = card.folderId || '(none)';
    acc[folderId] = (acc[folderId] || 0) + 1;
    return acc;
  }, {});

  console.log('Final counts:', {
    v1: counts['irregular-verb-v1'] || 0,
    v2: counts['irregular-verb-v2'] || 0,
    v3: counts['irregular-verb-v3'] || 0
  });
})();
```

## Lưu ý quan trọng

- Script trên chỉ xóa card trong 3 folder irregular verb, không đụng đến topic khác.
- Nếu trước đây có card irregular verb bị seed sai sang folder khác, script này không xóa được các card đó.
- Nếu cần làm sạch hoàn toàn irregular verbs bị lệch folder, bước tiếp theo nên là viết migration nâng cao theo `tags = irregular-verb` và `baseForm` để dọn sạch toàn bộ trước khi reseed.

## Trạng thái hiện tại

Đã hoàn tất:
- tái cấu trúc seed files
- thêm chú thích hiển thị `V1 = V2 = V3` và `V2 = V3` trong [`study.js`](../public/src/js/pages/study.js:277)
- thêm chú thích hiển thị trong [`review.js`](../public/src/js/pages/review.js:451)
- bổ sung hỗ trợ `baseForm` vào [`card-schemas.js`](../public/src/js/config/card-schemas.js:138)

Bước tiếp theo là chạy reset + reseed trên dữ liệu Firestore thực tế.