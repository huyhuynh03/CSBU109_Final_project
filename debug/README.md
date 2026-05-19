# Debug Logs

Folder chứa log debug từ các platform khác nhau. Khi gặp bug, paste log vào file tương ứng rồi báo cho assistant.

## Cấu trúc

```
debug/
├── windows-log/
│   ├── console-log.txt
│   └── network-log.txt
├── android-log/
│   ├── console-log.txt
│   └── network-log.txt
├── ios-log/
│   ├── console-log.txt
│   └── network-log.txt
└── macOS-log/
    ├── console-log.txt
    └── network-log.txt
```

- `console-log.txt`: log từ tab **Console** trong DevTools (errors, warnings, `console.log` của app).
- `network-log.txt`: log từ tab **Network** (requests, response status, payload). Chỉ cần khi nghi ngờ lỗi từ phía API/Firebase.

## Bật Preserve log (rất quan trọng)

Bật ở **cả Console và Network** trước khi tái hiện bug — nếu bug khiến trang reload/redirect, log sẽ vẫn được giữ lại.

- **Console:** mở DevTools → Console → bấm icon ⚙️ Settings → check **"Preserve log"**.
- **Network:** mở DevTools → Network → check **"Preserve log"** ở thanh trên.

Cũng nên bấm icon 🚫 (Clear console / Clear network log) **trước** khi bấm action gây bug → log sạch sẽ, dễ đọc.

## Khi nào dán log nào

| Tình huống bug | File cần |
|---|---|
| Đăng nhập/đăng xuất, redirect, auth error | `console-log.txt` |
| App load không lên, Service Worker lỗi | `console-log.txt` |
| Reload loop, page tự refresh | `console-log.txt` |
| Push notification không tới | `console-log.txt` |
| Nghi ngờ Firebase API trả lỗi (4xx/5xx) | `network-log.txt` (lọc theo `identitytoolkit` hoặc `firestore`) |
| Tài nguyên 404, font/css không load | `network-log.txt` |
| Không chắc | Cả hai |

## Cách lấy log trên từng platform

### Windows (Chrome/Edge)
1. Mở app trong trình duyệt
2. Nhấn `F12` mở DevTools
3. **Tab Console:**
   - Bật Preserve log → tái hiện bug
   - Click chuột phải vào vùng log → `Save as...` → lưu thành `console-log.txt`
   - Hoặc Ctrl+A để chọn hết → Ctrl+C → dán vào `debug/windows-log/console-log.txt`
4. **Tab Network (nếu cần):**
   - Bật Preserve log → tái hiện bug
   - Click chuột phải vào danh sách request → `Save all as HAR with content` → đổi tên thành `network-log.txt`
   - Hoặc copy thủ công các request có status đỏ (4xx/5xx)

### Android (Chrome trên điện thoại)
**Cách duy nhất để lấy log đầy đủ — Remote debug từ desktop:**
1. Bật `Developer Options` trên Android → bật `USB Debugging`
2. Cắm cáp USB vào máy tính
3. Mở Chrome trên máy tính → vào `chrome://inspect#devices`
4. Trong list dưới `Remote Target`, tìm tab LinguaFlash → click `inspect`
5. DevTools mới mở ra (đây là DevTools của tab Android, không phải desktop)
6. Bật Preserve log ở cả Console và Network
7. Trên điện thoại Android: tái hiện bug
8. Trên desktop DevTools:
   - Tab Console → copy → paste vào `debug/android-log/console-log.txt`
   - Tab Network (nếu cần) → save HAR → `debug/android-log/network-log.txt`

> **Lưu ý:** Log Android logcat (lấy bằng `adb logcat`) là log hệ thống Android — KHÔNG phải log của app. Đừng dán log đó vào.

### iOS (Safari trên iPhone/iPad)
1. iPhone: `Cài đặt` → `Safari` → `Nâng cao` → bật **Trình kiểm tra Web**
2. Cắm iPhone vào Mac qua cáp USB (cần Mac, không debug được từ Windows/Linux)
3. Trên Mac: mở Safari → menu `Develop` → chọn iPhone → chọn tab app
4. Bật Preserve log ở Console và Network
5. Tái hiện bug → copy log:
   - Console → `console-log.txt`
   - Network → `network-log.txt`

### macOS (Safari hoặc Chrome)
**Safari:**
1. Menu `Safari` → `Cài đặt` → tab `Nâng cao` → bật `Hiển thị menu Develop`
2. Mở app → menu `Develop` → `Show Web Inspector`
3. Bật Preserve log → tái hiện bug → copy log

**Chrome:**
1. `Cmd + Option + J` để mở Console (`Cmd + Option + I` cho full DevTools)
2. Bật Preserve log → tái hiện bug → copy log

## Tips lấy log hữu ích

- **Lọc theo level:** Console có dropdown `All levels` — đôi khi error quan trọng nằm ở Verbose
- **Xóa filter trước khi copy:** ô Filter trống để thấy hết log
- **Service Worker:** DevTools → tab `Application` → `Service Workers` → xem version đang chạy
- **Cache:** DevTools → tab `Application` → `Cache Storage` → xóa cache nếu cần test sạch
- **Filter prefix khi đọc log:** `[SW]`, `[FCM-SW]`, `[Auth]`, `[PushManager]`, `[Router]`, `[App]`
