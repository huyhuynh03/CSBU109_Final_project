# Hướng dẫn triển khai PWA - LinguaFlash

## Tổng quan

LinguaFlash là Progressive Web App (PWA) hoạt động trên tất cả nền tảng: Windows, macOS, iOS, Android. Người dùng cài app như native app trên mọi thiết bị.

## URL canonical

- **Production (DUY NHẤT cho user):** https://linguaflash-kohl.vercel.app
- ~~Firebase Hosting~~ — **đã chuyển sang redirect-only**, không phục vụ traffic trực tiếp.

> 🎯 **Quy ước:** Mọi link "Add to Home Screen" / cài PWA / share đường dẫn cho người dùng đều phải dùng `linguaflash-kohl.vercel.app`. Firebase Hosting (`linguaflash-f5591.web.app` / `linguaflash-f5591.firebaseapp.com`) chỉ còn 301 redirect về Vercel để bắt traffic cũ và bot search engine.
>
> ⚠️ **Auth domain Firebase** (`linguaflash-f5591.firebaseapp.com`) trong [`public/src/js/firebase-config.js`](../public/src/js/firebase-config.js:7) là **Firebase Auth handler URL**, KHÔNG phải hosting URL. Không được đổi — đây là endpoint Google OAuth cần tới.

---

## Bước 1: Deploy

### Cài CLI (chỉ cần 1 lần)

```bash
npm install -g vercel firebase-tools
```

### Đăng nhập

```bash
vercel login        # cho production hosting (Vercel)
firebase login      # cho project Firebase (Firestore, Functions, Auth, Messaging, redirect hosting)
```

### Deploy lên Vercel (workflow chính)

```bash
npm run deploy
```

Lệnh này tự động:
1. Tăng `APP_VERSION` (patch) trong [`public/sw.js`](../public/sw.js:1) → đổi `CACHE_NAME` → kích hoạt cleanup cache cũ ở SW.
2. Quét [`public/index.html`](../public/index.html:1), tính SHA-256 của từng JS/CSS local, ghi đè `?v=<hash 10 ký tự>` cho mỗi `<script>` / `<link>`.
3. Chạy `vercel --prod`.

**Biến thể bump version:**

```bash
npm run deploy          # bump patch (5.146 → 5.146.1)
npm run deploy:minor    # bump minor (5.146 → 5.147)
npm run deploy:major    # bump major (5.146 → 6.0.0)
```

**Tiện ích phát triển:**

```bash
npm run sync           # CHỈ đồng bộ ?v=<hash>, không bump version (dùng khi develop local)
npm run bump           # CHỈ bump APP_VERSION + sync, không deploy
```

### Deploy Firebase (chỉ khi cần)

Firebase Hosting hiện chỉ phục vụ 301 redirect → Vercel. Chỉ deploy khi:
- Cập nhật rule redirect (sửa [`firebase.json`](../firebase.json:1))
- Cập nhật Firestore rules ([`firestore.rules`](../firestore.rules:1))
- Cập nhật Cloud Functions ([`functions/`](../functions))

```bash
firebase deploy --only hosting     # cập nhật redirect
firebase deploy --only firestore   # cập nhật Firestore rules
firebase deploy --only functions   # cập nhật Functions
firebase deploy                    # cập nhật toàn bộ Firebase
```

### Deploy thủ công Vercel (KHÔNG khuyến nghị)

```bash
vercel --prod                     # bỏ qua bump version
```

> ⚠️ Bỏ qua bước bump → user PWA có thể không nhận được bản mới vì `CACHE_NAME` không đổi → SW không cleanup cache cũ.

### Cách user PWA nhận bản mới (sau deploy)

[`sw-update.js`](../public/src/js/sw-update.js:1) sẽ:
- Định kỳ check update mỗi 60 phút khi app đang mở
- Check ngay khi user quay lại tab (`visibilitychange`) hoặc browser online lại
- Khi phát hiện SW mới đã cài xong → hiện toast persistent **"✨ Có bản cập nhật mới — Tải lại"**
- User bấm Tải lại → SW mới activate → page reload với phiên bản mới

User KHÔNG cần clear cache, gỡ cài đặt PWA, hay bất kỳ thao tác phức tạp nào.

---

## Bước 2: Cài đặt PWA trên từng nền tảng

### 🪟 Windows (Chrome/Edge)

1. Mở https://linguaflash-kohl.vercel.app trên Chrome hoặc Edge
2. Click icon **⊕** (Install) trên thanh địa chỉ (góc phải)
3. Hoặc: Menu ⋮ → "Install LinguaFlash"
4. App sẽ xuất hiện trong Start Menu và Taskbar

**Kết quả:** Cửa sổ riêng, không có thanh URL, icon trên Desktop/Taskbar.

### 🍎 macOS

#### Chrome:
1. Mở https://linguaflash-kohl.vercel.app trên Chrome
2. Click icon **⊕** (Install) trên thanh địa chỉ
3. Hoặc: Menu ⋮ → "Install LinguaFlash"
4. App xuất hiện trong Launchpad và Dock

#### Safari (macOS Sonoma 14+):
1. Mở https://linguaflash-kohl.vercel.app trên Safari
2. File → "Add to Dock"
3. App xuất hiện trên Dock

**Kết quả:** Cửa sổ standalone, icon trên Dock, hoạt động như native app.

### 📱 iOS (iPhone/iPad)

1. Mở https://linguaflash-kohl.vercel.app trên **Safari** (bắt buộc Safari)
2. Tap icon **Share** (hình vuông có mũi tên lên) ở thanh dưới
3. Cuộn xuống → tap **"Add to Home Screen"** (Thêm vào MH chính)
4. Đặt tên "LinguaFlash" → tap "Add"

**Kết quả:** Icon trên Home Screen, mở fullscreen không có thanh Safari.

**Lưu ý iOS:**
- Chỉ Safari mới hỗ trợ "Add to Home Screen" (Chrome/Firefox trên iOS không hỗ trợ)
- Push notification hỗ trợ từ iOS 16.4+
- Dữ liệu được sync qua Firestore nên không mất khi Safari xóa cache

### 🤖 Android (Chrome)

1. Mở https://linguaflash-kohl.vercel.app trên Chrome
2. Chrome sẽ tự hiện banner **"Add LinguaFlash to Home screen"** ở dưới
3. Hoặc: Menu ⋮ → "Install app" / "Add to Home screen"
4. Tap "Install"

**Kết quả:** Icon trên Home Screen, splash screen khi mở, chạy fullscreen.

---

## Kiểm tra PWA đã hoạt động đúng

### Chrome DevTools
1. Mở app trên Chrome
2. F12 → Tab "Application"
3. Kiểm tra:
   - **Manifest:** Hiển thị đầy đủ thông tin app
   - **Service Workers:** Status "activated and running"
   - **Cache Storage:** Có cache `linguaflash-v<APP_VERSION>` (xem [`public/sw.js`](../public/sw.js:1) hằng `APP_VERSION`)

### Verify HTTP Cache Headers

Sau khi deploy, kiểm tra headers bằng curl hoặc DevTools → Network:

```bash
curl -I https://linguaflash-kohl.vercel.app/index.html
# Phải có: Cache-Control: no-cache, max-age=0, must-revalidate

curl -I https://linguaflash-kohl.vercel.app/sw.js
# Phải có: Cache-Control: no-cache, no-store, must-revalidate
#         Service-Worker-Allowed: /

curl -I https://linguaflash-kohl.vercel.app/src/js/app.js?v=2f98fd2055
# Phải có: Cache-Control: public, max-age=31536000, immutable
```

### Lighthouse PWA Audit
1. F12 → Tab "Lighthouse"
2. Check "Progressive Web App"
3. Click "Analyze page load"
4. Kết quả nên đạt tất cả tiêu chí PWA

---

## Cấu hình đã sẵn sàng

| Thành phần | File | Trạng thái |
|---|---|---|
| Web App Manifest | [`public/manifest.json`](../public/manifest.json:1) | ✅ Đầy đủ |
| Service Worker | [`public/sw.js`](../public/sw.js:1) | ✅ Network-first navigation + SWR cho JS/CSS |
| Update flow ở main thread | [`public/src/js/sw-update.js`](../public/src/js/sw-update.js:1) | ✅ Toast "Có bản cập nhật mới" |
| iOS meta tags | [`public/index.html`](../public/index.html:1) | ✅ apple-mobile-web-app |
| Windows meta tags | [`public/index.html`](../public/index.html:1) | ✅ msapplication-TileColor |
| Icons (72-512px) | `public/icons/` | ✅ Đủ kích thước |
| Vercel hosting config | [`vercel.json`](../vercel.json:1) | ✅ Cache headers + SPA rewrites (production) |
| Firebase hosting config | [`firebase.json`](../firebase.json:1) | ✅ 301 redirect → Vercel |
| Auto-versioning script | [`tools/bump-version.js`](../tools/bump-version.js:1) | ✅ Bump APP_VERSION + sync hash |

---

## Tính năng PWA đã hỗ trợ

| Tính năng | Windows | macOS | iOS | Android |
|---|---|---|---|---|
| Install to Home/Desktop | ✅ | ✅ | ✅ | ✅ |
| Offline access | ✅ | ✅ | ✅ | ✅ |
| Standalone window | ✅ | ✅ | ✅ | ✅ |
| Custom splash screen | ✅ | ✅ | ⚠️ | ✅ |
| Background sync | ✅ | ✅ | ❌ | ✅ |
| Push notifications | ✅ | ✅ | ⚠️ 16.4+ | ✅ |
| Auto-update (toast prompt) | ✅ | ✅ | ✅ | ✅ |

---

## Quick Deploy Command

```bash
# One-liner deploy lên Vercel (production)
npm run deploy
```

Tương đương: `node tools/bump-version.js patch && vercel --prod`

---

## Troubleshooting

### User trên iOS PWA vẫn thấy bản cũ sau khi deploy

1. Kiểm tra response headers của `https://linguaflash-kohl.vercel.app/index.html` có `Cache-Control: no-cache, max-age=0, must-revalidate` không. Nếu không, headers trong [`vercel.json`](../vercel.json:1) chưa được áp dụng → deploy lại.
2. Force-quit PWA (vuốt từ task switcher) và mở lại 2-3 lần. iOS Safari cần ~2 navigation để revalidate.
3. Nếu vẫn kẹt: vào DevTools desktop, xem cache `linguaflash-v<...>` đang là version nào → nếu chưa bump → chạy lại `npm run deploy`.

### Hash trong index.html không đổi sau khi sửa file

- Hash sinh từ SHA-256 nội dung file. Nếu file thật sự không đổi (whitespace cũng không), hash sẽ giữ nguyên — đây là thiết kế đúng (idempotent).
- Nếu sửa file mà `npm run sync` báo "0 đổi": kiểm tra đã save file chưa, hoặc encoding (BOM) khác.

### Toast "Có bản cập nhật mới" không xuất hiện

- Lần deploy đầu tiên áp dụng update flow mới: SW cũ chưa biết flow → user dùng SW cũ vẫn `skipWaiting()` auto một lần cuối, từ deploy thứ 2 trở đi mới có toast.
- Verify trên Chrome DevTools: Application → Service Workers → check có 2 entries (active + waiting) không.
- Mở console xem log `[SwUpdate]` có chạy không.

### Vercel deploy bị lỗi rewrites

- Vercel đôi khi cache config cũ. Thử `vercel --prod --force` để force redeploy.
- Kiểm tra [`vercel.json`](../vercel.json:1) syntax bằng `vercel inspect`.

### User vẫn truy cập được Firebase Hosting URL

- Sau khi `firebase deploy --only hosting`, kiểm tra:
  ```bash
  curl -I https://linguaflash-f5591.web.app/
  # Phải trả 301 với Location: https://linguaflash-kohl.vercel.app/
  ```
- Nếu không thấy 301: cấu hình `redirects` trong [`firebase.json`](../firebase.json:1) chưa được áp dụng → deploy lại.
- Lưu ý: Firebase Hosting reserve các path bắt đầu bằng `/__/` (auth handler) → các path này **không bị redirect** dù `**` match. Đây là behavior đúng để Firebase Auth OAuth flow hoạt động bình thường.
