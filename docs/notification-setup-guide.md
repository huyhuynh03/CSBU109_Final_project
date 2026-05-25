# Setup Notification System (Vercel + cron-job.org)

Hướng dẫn setup tính năng "Thông báo nhắc ôn tập" sau khi đã chuyển từ Firebase Cloud Functions sang Vercel API Routes.

## 1. Lấy Firebase Service Account credentials

1. Vào [Firebase Console](https://console.firebase.google.com/project/linguaflash-f5591/settings/serviceaccounts/adminsdk)
2. Tab **Service accounts** → Click **Generate new private key**
3. File JSON tải về sẽ có dạng:
   ```json
   {
     "project_id": "linguaflash-f5591",
     "client_email": "firebase-adminsdk-xxx@linguaflash-f5591.iam.gserviceaccount.com",
     "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   }
   ```

## 2. Setup Vercel Environment Variables

Vào [Vercel Dashboard](https://vercel.com/) → Project linguaflash → **Settings** → **Environment Variables**

Thêm 4 biến (tất cả: Production + Preview + Development):

| Name | Value |
|------|-------|
| `FIREBASE_PROJECT_ID` | `linguaflash-f5591` |
| `FIREBASE_CLIENT_EMAIL` | giá trị `client_email` từ JSON |
| `FIREBASE_PRIVATE_KEY` | giá trị `private_key` từ JSON (giữ nguyên `\n` literal, KHÔNG xuống dòng thật) |
| `CRON_SECRET` | chuỗi random bí mật, ví dụ tạo bằng: `openssl rand -hex 32` |

**Lưu ý FIREBASE_PRIVATE_KEY:** copy nguyên xi từ JSON, bao gồm cả dấu `\n` (literal 2 ký tự, không phải newline thật). Code sẽ tự convert thành newline.

## 3. Deploy lên Vercel

```bash
git push
```

Vercel sẽ auto-deploy. Sau khi deploy xong, test ngay:

```bash
curl https://linguaflash-kohl.vercel.app/api/send-reminders?secret=<CRON_SECRET>
```

Phải trả `{"ok":true,"sent":0,"skipped":N}` (N = số user đã bật notification nhưng chưa due).

## 4. Test "Gửi thông báo thử"

1. Vào app → Cài đặt
2. Bật toggle "Nhắc ôn tập"
3. Click nút **"Gửi thông báo thử"**
4. Kiểm tra notification trên thanh thông báo điện thoại

## 5. Setup Cron trên cron-job.org

1. Đăng ký tài khoản miễn phí tại [cron-job.org](https://cron-job.org/)
2. Click **CREATE CRONJOB**
3. Cấu hình:
   - **Title**: `LinguaFlash Review Reminders`
   - **URL**: `https://linguaflash-kohl.vercel.app/api/send-reminders?secret=<CRON_SECRET>`
   - **Schedule**: Every 15 minutes (`*/15 * * * *`)
   - **Request method**: GET
4. Save → Cron sẽ tự chạy mỗi 15 phút

**Bảo mật:** URL chứa CRON_SECRET như query param. Chỉ ai biết secret mới gọi được.

## 6. Monitor

- **Vercel logs**: Dashboard → Project → Functions → xem logs real-time
- **cron-job.org**: Dashboard → click vào cronjob → tab "History" để xem các lần chạy

## Troubleshooting

### Lỗi "Invalid token" khi nhấn "Gửi thông báo thử"
→ Đăng xuất rồi đăng nhập lại để refresh ID token.

### Lỗi "Chưa có thiết bị nào đăng ký"
→ Tắt rồi bật lại toggle notification để re-register FCM token.

### cron-job.org chạy nhưng không có notification
→ Check Vercel logs. Có thể do:
- User chưa due cards
- Đã gửi trong ngày (logic dedup `lastNotifiedDate`)
- Firebase token expired (cần re-bật notification)

### CRON_SECRET sai
→ Vercel API trả 401. Verify env var đã set đúng và chưa có space thừa.
