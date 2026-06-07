# Grammar Tense Implementation - Tổng kết triển khai

## Cấu trúc đã triển khai cho Present Simple (mẫu chuẩn)

Mỗi thì trong `GrammarTenseContent` gồm các khối sau:

### 1. Cách dùng (`usage`)
```js
usage: {
    intro: 'Mô tả ngắn gọn thì này dùng khi nào',
    items: [
        { title: 'Tên cách dùng', icon: 'material_icon', examples: ['Câu ví dụ 1', 'Câu ví dụ 2'] }
    ],
    signalWords: {
        label: 'Dấu hiệu nhận biết (signal words)',
        words: ['always', 'usually', ...]
    }
}
```

### 2. Công thức (`formula`)
```js
formula: {
    note: 'Ghi chú tổng quan',
    groups: [
        {
            label: 'Tên nhóm (VD: Động từ thường)',
            sub: 'phụ đề tiếng Anh',
            sentences: [
                { kind: 'Khẳng định', sign: '+', formula: 'S + V...', examples: ['...'] },
                { kind: 'Phủ định', sign: '−', formula: 'S + ...', examples: ['...'] },
                { kind: 'Nghi vấn', sign: '?', formula: '... + S + ...?', examples: ['...'] }
            ],
            subject: {
                headers: ['Chủ ngữ', 'Cột 2', ...],
                rows: [['I/You/We/They', '...'], ['He/She/It', '...']]
            },
            note: 'Lưu ý quan trọng (optional)'
        }
    ],
    contractions: ['don\'t = do not', ...]
}
```

### 3. Mẹo chính tả (`spelling`) — chỉ áp dụng cho Present Simple
```js
spelling: {
    intro: '...',
    rows: [{ case: '...', rule: '...', example: '...' }],
    mnemonics: [{ title: '...', text: '...' }]
}
```

### 4. Bài tập (`exercises`) — 20 câu fill-in-the-blank
```js
exercises: [
    { id: 1, sentence: 'She ___ a doctor.', answer: 'is', hint: 'to be', kind: 'khẳng định' },
    // ... 20 câu cover đủ: to be (khẳng định/phủ định/nghi vấn) + chia động từ + trợ động từ
]
```

## Renderer (grammar-tense.js)

| Khối | Method | Thứ tự hiển thị |
|------|--------|-----------------|
| Cách dùng | `_usageBlock(usage)` | 1 (đầu tiên) |
| Công thức | `_formulaBlock(formula)` | 2 |
| Mẹo chính tả | `_spellingBlock(spelling)` | 3 (nếu có) |
| Bài tập | `_exerciseBlock(exercises)` | 4 (cuối) |

## Logic bài tập

- Mỗi câu có nút "Kiểm tra" riêng → `GrammarTensePage.checkSingle(id)`
- Nút "Nộp tất cả" ở cuối → `GrammarTensePage.checkAll()`
- So sánh case-insensitive
- Hiện feedback: ✓ Đúng (xanh) / ✗ Sai + đáp án (đỏ)
- Input đổi viền + background theo kết quả
- Tổng kết: "X/20 câu đúng" với màu theo tỷ lệ

## Files liên quan

- `packages/english/src/config/grammar-tenses.js` — data (metadata 12 thì + nội dung chi tiết)
- `packages/english/src/pages/grammar-tense.js` — renderer + logic
- `packages/english/src/pages/grammar.js` — trang grid 12 thì
- `packages/english/src/index.js` — wire routes + assign window globals

## Quy tắc khi thêm thì mới

1. Thêm object vào `GrammarTenseContent[tense-id]` trong `grammar-tenses.js`
2. Bao gồm: `usage`, `formula`, `exercises` (bắt buộc). `spelling` chỉ khi cần.
3. Exercises phải có 20 câu, cover đủ các dạng câu của thì đó.
4. Renderer tự detect và render — không cần sửa `grammar-tense.js`.
