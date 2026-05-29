# Thêm một ngôn ngữ mới vào LinguaFlash

Tài liệu này mô tả cách thêm một **language module** mới sau khi Phase 4.0 hoàn tất.

Có 2 kiểu module:

| Kiểu | Khi nào dùng | Nằm ở đâu |
|------|--------------|-----------|
| `local` | Module gắn liền với app chính, deploy cùng shell | Trong monorepo này (`packages/<lang>`) |
| `remote` | Module độc lập, repo + deploy riêng, không đụng code shell | Hosting riêng (vd `japanese.linguaflash.app`) |

Hiện tại **English là `local`**. Khi thêm ngôn ngữ mới, khuyến nghị dùng `remote` để giữ shell gọn và deploy độc lập.

---

## A. Thông tin chung — Module Contract

Mọi module (local hay remote) phải `export default` một object theo contract sau
(xem [`plans/microfrontend-architecture.md`](../plans/microfrontend-architecture.md) mục 3):

```js
export default {
  id: 'japanese',
  version: '1.0.0',
  meta: {
    name: 'Tiếng Nhật',
    nameNative: '日本語',
    flagLabel: 'JP',
    icon: 'translate',
    color: '#EF4444',
    colorGradient: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
    description: 'Học Hiragana, Katakana, Kanji và ngữ pháp tiếng Nhật'
  },
  basePath: '/japanese',
  defaultRoute: '/japanese/hiragana',
  sidebarItems: [
    { id: 'jp-hiragana', icon: 'abc', label: 'Hiragana', route: '/japanese/hiragana' }
    // ...
  ],
  routes: [
    { path: '/japanese/hiragana', page: HiraganaPage }
    // ...
  ],
  async install(host) { /* setup: inject CSS, listeners... */ },
  async uninstall() { /* cleanup khi user đổi ngôn ngữ */ }
};
```

**Nguyên tắc bất biến**: module **chỉ** giao tiếp với shell qua `window.LinguaFlashHost`
(auth, data, router, ui, fsrs, tts, helpers). KHÔNG import `firebase`, KHÔNG truy cập
`FirestoreDB`/`Auth` trực tiếp. Đây là contract cho phép shell đổi backend mà module không vỡ.

`host.version` hiện là `1.0.0`. Module khai báo `minHostVersion`; nếu shell cũ hơn,
ModuleLoader sẽ từ chối load và báo "Vui lòng cập nhật ứng dụng".

---

## B. Thêm module REMOTE (khuyến nghị cho ngôn ngữ mới)

### Bước 1 — Tạo repo riêng

Cấu trúc tối thiểu (tham khảo `packages/english` làm khuôn mẫu):

```
linguaflash-japanese/
├── package.json
├── vite.config.js          # build lib mode, formats: ['es']
├── public/
│   ├── manifest.json        # ← shell đọc file này
│   └── seed-data/...
└── src/
    ├── index.js             # export default { Module Contract }
    ├── pages/...
    └── styles/japanese.css
```

`vite.config.js` build ra 1 bundle ESM duy nhất (giống [`packages/english/vite.config.js`](../packages/english/vite.config.js)):

```js
build: {
  lib: { entry: 'src/index.js', formats: ['es'], fileName: () => 'japanese-module.js' },
  rollupOptions: { output: { inlineDynamicImports: true } },
  cssCodeSplit: false
}
```

### Bước 2 — Tạo `manifest.json` cho module

Deploy cùng module (vd tại `https://japanese.linguaflash.app/manifest.json`):

```json
{
  "id": "japanese",
  "version": "1.0.0",
  "name": "Tiếng Nhật",
  "entryUrl": "https://japanese.linguaflash.app/dist/japanese-module-1.0.0.js",
  "stylesUrl": "https://japanese.linguaflash.app/dist/japanese-module-1.0.0.css",
  "minHostVersion": "1.0.0"
}
```

> Dùng **versioned filename** (`...-1.0.0.js`). Đổi version = đổi URL = không bị cache cũ.

### Bước 3 — Deploy module lên hosting riêng

Bất kỳ static host nào (Firebase Hosting site riêng, Vercel, Netlify...). Yêu cầu:

- **CORS**: shell ở `linguaflash.app` cần `import()` bundle từ origin khác →
  bật header `Access-Control-Allow-Origin` cho origin shell (hoặc `*` nếu chấp nhận).
- **Cache**: đặt `Cache-Control: public, max-age=31536000, immutable` cho file
  `*-module-<version>.js` (an toàn vì URL đã versioned).

### Bước 4 — Đăng ký vào registry của shell

Mở [`packages/shell/public/modules-registry.json`](../packages/shell/public/modules-registry.json),
sửa entry tương ứng (hoặc thêm mới) — **đây là thay đổi DUY NHẤT phía shell**:

```json
{
  "id": "japanese",
  "type": "remote",
  "available": true,
  "minHostVersion": "1.0.0",
  "manifestUrl": "https://japanese.linguaflash.app/manifest.json",
  "basePath": "/japanese",
  "defaultRoute": "/japanese/hiragana",
  "meta": { "...": "..." },
  "sidebarItems": [ { "...": "..." } ]
}
```

Đổi `available` từ `false` → `true` để bật. Redeploy shell.

### Bước 5 — Xong

- Dashboard tự hiện card "Tiếng Nhật".
- Sidebar tự hiện items khi vào `/japanese/*`.
- Lần đầu user vào `/japanese/*`: shell fetch manifest → `import(entryUrl)` →
  inject `stylesUrl` → `install(host)` → register routes. Các lần sau dùng cache.

---

## C. Thêm module LOCAL (gắn liền app chính, như English)

1. Tạo `packages/<lang>/` theo khuôn `packages/english`.
2. Thêm alias trong [`packages/shell/vite.config.js`](../packages/shell/vite.config.js):
   `'@<lang>': resolve(__dirname, '../<lang>/src')`.
3. Thêm importer trong [`packages/shell/src/js/module-loader.js`](../packages/shell/src/js/module-loader.js)
   → `_localImporters`:
   ```js
   _localImporters: {
     english: () => import('@english/index.js'),
     korean:  () => import('@korean/index.js')   // ← thêm dòng này
   }
   ```
4. Thêm entry vào `modules-registry.json` với `"type": "local"` (không cần `manifestUrl`).
5. Vite tự code-split: bundle ngôn ngữ chỉ tải khi user vào `/<lang>/*`.

---

## D. Checklist nhanh

- [ ] Module `export default` đúng Module Contract (`id`, `meta`, `routes`, `install/uninstall`)
- [ ] Module chỉ dùng `window.LinguaFlashHost`, không import firebase
- [ ] (remote) Bundle versioned + CORS + cache headers
- [ ] (remote) `manifest.json` có `entryUrl` đúng
- [ ] Entry trong `modules-registry.json` với `type` + `available: true` + `minHostVersion`
- [ ] Redeploy shell, test: dashboard card → sidebar → load route lần đầu
