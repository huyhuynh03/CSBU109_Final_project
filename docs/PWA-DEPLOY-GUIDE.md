# Hướng dẫn triển khai PWA - LinguaFlash

## Tổng quan

LinguaFlash là Progressive Web App (PWA) hoạt động trên tất cả nền tảng: Windows, macOS, iOS, Android. Sau khi deploy, người dùng có thể cài đặt app như native app trên mọi thiết bị.

## URL sau khi deploy

- **Firebase Hosting:** https://linguaflash-f5591.web.app
- **Vercel (nếu dùng):** https://linguaflash.vercel.app

---

## Bước 1: Deploy lên Firebase Hosting

### Cài Firebase CLI (chỉ cần 1 lần)

```bash
npm install -g firebase-tools
```

### Đăng nhập Firebase

```bash
firebase login
```

Trình duyệt sẽ mở ra để xác thực Google account.

### Deploy

```bash
firebase deploy --only hosting
```

Sau khi deploy thành công, app sẽ live tại:
- https://linguaflash-f5591.web.app
- https://linguaflash-f5591.firebaseapp.com

---

## Bước 2: Cài đặt PWA trên từng nền tảng

### 🪟 Windows (Chrome/Edge)

1. Mở https://linguaflash-f5591.web.app trên Chrome hoặc Edge
2. Click icon **⊕** (Install) trên thanh địa chỉ (góc phải)
3. Hoặc: Menu ⋮ → "Install LinguaFlash"
4. App sẽ xuất hiện trong Start Menu và Taskbar

**Kết quả:** Cửa sổ riêng, không có thanh URL, icon trên Desktop/Taskbar.

### 🍎 macOS

#### Chrome:
1. Mở https://linguaflash-f5591.web.app trên Chrome
2. Click icon **⊕** (Install) trên thanh địa chỉ
3. Hoặc: Menu ⋮ → "Install LinguaFlash"
4. App xuất hiện trong Launchpad và Dock

#### Safari (macOS Sonoma 14+):
1. Mở https://linguaflash-f5591.web.app trên Safari
2. File → "Add to Dock"
3. App xuất hiện trên Dock

**Kết quả:** Cửa sổ standalone, icon trên Dock, hoạt động như native app.

### 📱 iOS (iPhone/iPad)

1. Mở https://linguaflash-f5591.web.app trên **Safari** (bắt buộc Safari)
2. Tap icon **Share** (hình vuông có mũi tên lên) ở thanh dưới
3. Cuộn xuống → tap **"Add to Home Screen"** (Thêm vào MH chính)
4. Đặt tên "LinguaFlash" → tap "Add"

**Kết quả:** Icon trên Home Screen, mở fullscreen không có thanh Safari.

**Lưu ý iOS:**
- Chỉ Safari mới hỗ trợ "Add to Home Screen" (Chrome/Firefox trên iOS không hỗ trợ)
- Push notification hỗ trợ từ iOS 16.4+
- Dữ liệu được sync qua Firestore nên không mất khi Safari xóa cache

### 🤖 Android (Chrome)

1. Mở https://linguaflash-f5591.web.app trên Chrome
2. Chrome sẽ tự hiện banner **"Add LinguaFlash to Home screen"** ở dưới
3. Hoặc: Menu ⋮ → "Install app" / "Add to Home screen"
4. Tap "Install"

**Kết quả:** Icon trên Home Screen, splash screen khi mở, chạy fullscreen.

---

## Bước 3 (Tùy chọn): Deploy lên Vercel

Nếu muốn dùng Vercel thay vì/bên cạnh Firebase:

```bash
# Cài Vercel CLI
npm install -g vercel

# Deploy (lần đầu sẽ hỏi cấu hình)
cd d:/personal_project/linguaflash
vercel --prod
```

Vercel sẽ tự detect `public/` folder từ `vercel.json`.

---

## Kiểm tra PWA đã hoạt động đúng

### Chrome DevTools
1. Mở app trên Chrome
2. F12 → Tab "Application"
3. Kiểm tra:
   - **Manifest:** Hiển thị đầy đủ thông tin app
   - **Service Workers:** Status "activated and running"
   - **Cache Storage:** Có cache `linguaflash-v5.129`

### Lighthouse PWA Audit
1. F12 → Tab "Lighthouse"
2. Check "Progressive Web App"
3. Click "Analyze page load"
4. Kết quả nên đạt tất cả tiêu chí PWA

---

## Cấu hình đã sẵn sàng

| Thành phần | File | Trạng thái |
|---|---|---|
| Web App Manifest | `public/manifest.json` | ✅ Đầy đủ |
| Service Worker | `public/sw.js` | ✅ Cache offline |
| iOS meta tags | `public/index.html` | ✅ apple-mobile-web-app |
| Windows meta tags | `public/index.html` | ✅ msapplication-TileColor |
| Icons (72-512px) | `public/icons/` | ✅ Đủ kích thước |
| Firebase Hosting | `firebase.json` | ✅ SPA rewrites + headers |
| Vercel config | `vercel.json` | ✅ Rewrites + headers |

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

---

## Quick Deploy Command

```bash
# One-liner deploy (sau khi đã login)
npx firebase-tools deploy --only hosting
```
