# Irregular Verbs V1 (Base Form) Topics

## Tổng quan
- **Tổng số động từ bất quy tắc V1**: 132 từ
- **Số từ đã có sẵn**: 1 từ (teach trong education-intermediate.json)
- **Số từ mới tạo**: 131 từ
- **Số topic được tạo**: 20 topics

## Danh sách Topics

### 1. verbs-basic-essential.json (15 từ)
**Độ khó**: beginner  
**Mô tả**: Các động từ cơ bản nhất, dùng hàng ngày  
**Từ**: be, have, do, get, make, go, come, take, give, put, let, keep, hold, set, leave

### 2. verbs-communication.json (8 từ)
**Độ khó**: beginner  
**Mô tả**: Nói, viết, truyền đạt thông tin  
**Từ**: say, tell, speak, mean, read, write, broadcast, teach

### 3. verbs-movement-travel.json (12 từ)
**Độ khó**: beginner  
**Mô tả**: Các động từ về di chuyển, vận động  
**Từ**: run, fly, drive, ride, swim, dive, fall, rise, leap, slide, flee, withdraw

### 4. verbs-cognition-thinking.json (8 từ)
**Độ khó**: intermediate  
**Mô tả**: Suy nghĩ, hiểu biết, nhớ quên  
**Từ**: think, know, understand, forget, choose, forecast, meet, begin

### 5. verbs-perception-senses.json (7 từ)
**Độ khó**: beginner  
**Mô tả**: Nhìn, nghe, cảm nhận  
**Từ**: see, hear, feel, show, hide, shine, light

### 6. verbs-eating-drinking.json (5 từ)
**Độ khó**: beginner  
**Mô tả**: Các động từ liên quan đến ăn uống  
**Từ**: eat, drink, feed, bite, spit

### 7. verbs-body-position.json (8 từ)
**Độ khó**: beginner  
**Mô tả**: Ngồi, đứng, nằm, quỳ  
**Từ**: sit, stand, lie, lay, kneel, hang, sleep, wake

### 8. verbs-physical-actions.json (10 từ)
**Độ khó**: intermediate  
**Mô tả**: Đánh, ném, bắt, đẩy, kéo  
**Từ**: hit, strike, throw, catch, shoot, fling, swing, shake, blow, cast

### 9. verbs-cutting-breaking.json (8 từ)
**Độ khó**: intermediate  
**Mô tả**: Cắt, chẻ, phá, vỡ  
**Từ**: cut, tear, break, burst, split, slit, bend, wind

### 10. verbs-creation-building.json (8 từ)
**Độ khó**: intermediate  
**Mô tả**: Xây, dựng, tạo ra  
**Từ**: build, draw, weave, knit, sew, breed, grow, spread

### 11. verbs-destruction-damage.json (4 từ)
**Độ khó**: intermediate  
**Mô tả**: Đốt, hỏng, phá  
**Từ**: burn, spoil, hurt, bleed

### 12. verbs-possession-transaction.json (8 từ)
**Độ khó**: intermediate  
**Mô tả**: Mua, bán, trả, cho vay  
**Từ**: buy, pay, lend, spend, deal, send, bring, bear

### 13. verbs-searching-finding.json (4 từ)
**Độ khó**: intermediate  
**Mô tả**: Tìm, kiếm, mất, ẩn  
**Từ**: find, seek, lose, lead

### 14. verbs-fighting-conflict.json (8 từ)
**Độ khó**: intermediate  
**Mô tả**: Đánh nhau, chiến đấu, vượt qua  
**Từ**: fight, overcome, overrun, steal, forbid, forgive, swear, win

### 15. verbs-change-transformation.json (5 từ)
**Độ khó**: intermediate  
**Mô tả**: Thay đổi, lớn lên, co lại  
**Từ**: freeze, shrink, sink, spring, bind

### 16. verbs-sound-music.json (2 từ)
**Độ khó**: intermediate  
**Mô tả**: Hát, rung chuông  
**Từ**: sing, ring

### 17. verbs-cleaning-maintenance.json (5 từ)
**Độ khó**: intermediate  
**Mô tả**: Quét, cắt cỏ, gieo hạt  
**Từ**: sweep, mow, sow, dig, grind

### 18. verbs-attachment-connection.json (4 từ)
**Độ khó**: intermediate  
**Mô tả**: Bám, dính, đóng, mở  
**Từ**: cling, shut, quit, creep

### 19. verbs-clothing-appearance.json (2 từ)
**Độ khó**: intermediate  
**Mô tả**: Mặc, vừa vặn  
**Từ**: wear, fit

### 20. verbs-spanning-covering.json (1 từ)
**Độ khó**: advanced  
**Mô tả**: Bắc qua, trải rộng  
**Từ**: span

## Thống kê theo độ khó
- **Beginner**: 63 từ (6 topics)
- **Intermediate**: 68 từ (13 topics)
- **Advanced**: 1 từ (1 topic)

## Cấu trúc mỗi card
Mỗi card trong các file topic bao gồm:
- `word`: Dạng V1 (base form) của động từ
- `ipa`: Phiên âm IPA
- `partOfSpeech`: "verb"
- `difficulty`: beginner/intermediate/advanced
- `meaning`: Nghĩa tiếng Việt
- `example`: Câu ví dụ tiếng Anh
- `tags`: ["irregular-verb", "base-form"]

## Lưu ý
- Tất cả các động từ này đều là động từ bất quy tắc, có dạng V2 và V3 khác với quy tắc thêm -ed
- Các file V2 và V3 tương ứng đã được tạo trước đó (irregular-verb-v2.json và irregular-verb-v3.json)
- Người dùng có thể học V1, V2, V3 độc lập hoặc kết hợp thông qua family word manager

## Files đã tạo
- **data/seed-vocabulary/**: 20 files JSON
- **public/seed-vocabulary/**: 20 files JSON (copy từ data/)
- **scripts/generate-v1-topics.js**: Script tự động generate các file
- **data/seed-vocabulary/irregular-verbs-v1-classification.json**: File phân loại chi tiết
