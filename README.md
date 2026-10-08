# LinguaFlash

Ứng dụng web học từ vựng tiếng Anh (PWA) xây dựng theo kiến trúc **micro-frontend**:
một **shell** (vỏ ứng dụng) chịu trách nhiệm xác thực, điều hướng, đồng bộ và giao diện;
mỗi **language module** là một package độc lập cung cấp nội dung học (từ vựng, ngữ pháp).

## Kiến trúc

```
packages/
├── shell/      # Vỏ ứng dụng: auth, router, DB sync, UI, PWA, FSRS engine
└── english/    # Module tiếng Anh: từ vựng, ngữ pháp, study/review
```

- **Shell** ([`packages/shell/`](packages/shell/package.json:1)) nạp module qua
  [`modules-registry.json`](packages/shell/public/modules-registry.json:1) và
  [`module-loader.js`](packages/shell/src/js/module-loader.js:1), cung cấp các API host
  (auth, db, router, toast, tts) cho module qua [`host.js`](packages/shell/src/js/host.js:1).
- **Module english** ([`packages/english/`](packages/english/package.json:1)) chỉ phụ thuộc vào
  API host, không truy cập trực tiếp Firebase — đảm bảo tách biệt và dễ mở rộng ngôn ngữ mới.

## Tính năng chính

- Đăng ký / đăng nhập (Firebase Auth), quản lý tài khoản.
- Học từ vựng theo chủ đề (44 chủ đề IELTS), thẻ ghi nhớ + phát âm (TTS).
- Học ngữ pháp theo thì và cấu trúc.
- Ôn tập theo thuật toán **FSRS** ([`packages/shell/src/js/fsrs/fsrs.js`](packages/shell/src/js/fsrs/fsrs.js:1)).
- Đồng bộ dữ liệu Firestore + offline persistence, PWA (service worker, install).

## Công nghệ

- **Vite** + **ES Modules** (vanilla JS).
- **Firebase** (Auth, Firestore) — cấu hình ở
  [`firebase-config.js`](packages/shell/src/js/firebase-config.js:1) (đã để placeholder an toàn).
- **Firestore Security Rules** tại [`firestore.rules`](firestore.rules:1).
- **npm workspaces** (monorepo).

## Chạy thử

```bash
npm install        # cài phụ thuộc cho toàn bộ workspace
npm run dev        # chạy dev server (shell)
npm run build      # build lần lượt english + shell
npm run preview    # xem thử bản build
```

## Ghi chú bảo mật

- Cấu hình Firebase trong mã nguồn là **placeholder**. Điền cấu hình thật qua file `.env` cục bộ
  (đã được `.gitignore` chặn), tham khảo [`.env.example`](.env.example:1).
- Không commit `.env`, service-account key hay cấu hình production lên repo công khai.