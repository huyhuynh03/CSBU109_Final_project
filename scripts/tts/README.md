# TTS Audio Generation

Sinh **file audio phát âm tĩnh** cho từ vựng bằng cách gọi TTS API chất lượng cao
**một lần duy nhất** ở máy dev. File MP3 tạo ra được bundle vào PWA → app phát
trực tiếp, **không gọi API lúc chạy, không tốn phí lặp lại, hoạt động offline**.

Hỗ trợ **nhiều accent** (variant) cho cùng một bộ từ vựng — ví dụ Anh-Mỹ (`us`)
và Anh-Anh (`gb`).

> Web Speech API (giọng mặc định của trình duyệt) vẫn được giữ làm **fallback**
> cho từ người dùng tự thêm. Audio cho **câu ví dụ** hiện KHÔNG pre-generate
> (xem mục 7) — giữ Web Speech cho ví dụ.

---

## 1. Kiến trúc

```
scripts/tts/
├── config.js                 # ⭐ Nơi DUY NHẤT cần sửa: ngôn ngữ + variant + giọng + đường dẫn
├── generate-audio.js         # CLI entry point
├── lib/
│   ├── slug.js               # word → tên file (PHẢI khớp client tts.js)
│   └── extract-words.js      # trích từ vựng duy nhất từ seed (dedup + cảnh báo va chạm)
└── providers/
    ├── google.js             # Google Cloud TTS  (env: GOOGLE_TTS_API_KEY)
    ├── openai.js             # OpenAI TTS        (env: OPENAI_API_KEY)
    ├── elevenlabs.js         # ElevenLabs TTS    (env: ELEVENLABS_API_KEY)
    ├── gemini.js             # Gemini TTS native (env: GEMINI_API_KEY)
    ├── shopaikey.js          # Shopaikey → Gemini (env: SHOPAIKEY_API_KEY)
    └── edge.js               # Microsoft Edge TTS — KEYLESS (không cần key)
```

> **Edge TTS (đang dùng làm nguồn ưu tiên số 1):** provider `edge` gọi dịch vụ
> Azure Speech ẩn sau trình duyệt Edge qua WebSocket công khai — **không cần API
> key, miễn phí**. Ghi vào subfolder `<accent>_edge` (vd `us_edge/`, `gb_edge/`).
> Giọng đang cấu hình trong [`config.js`](config.js):
>
> | Accent | Giọng Edge | Kiểu |
> |---|---|---|
> | `us` | `en-US-GuyNeural` | Nam, American English |
> | `gb` | `en-GB-SoniaNeural` | Nữ, British English |
>
> Client mặc định phát accent **`gb`** (`_defaultAccent: 'gb'` trong
> [`tts.js`](../../packages/shell/src/js/utils/tts.js)), nên phần lớn từ nghe là
> giọng **nữ Anh-Anh `en-GB-SoniaNeural`**. Prosody đọc chậm nhẹ (`rate: -8%`).
>
> ⚠ **Nếu một từ nghe khác hẳn các từ còn lại** (vd giọng máy/robot của hệ điều
> hành thay vì giọng Neural): gần như chắc chắn từ đó **thiếu file MP3** trong cả
> ba nguồn (`edge` → `elevenlabs` → mặc định) nên client **fallback Web Speech
> API**. Thường xảy ra khi từ được **thêm vào seed sau lần generate gần nhất**.
> Cách khắc phục: chạy lại generate cho riêng từ đó (xem mục 3, cờ `--only`):
>
> ```cmd
> node scripts/tts/generate-audio.js --provider edge --variant us,gb --only bad --manifest
> ```
>
> Muốn **rà soát toàn bộ** những từ nào đang thiếu file Edge (không chỉ một từ),
> chạy script audit ở [mục 3b](#3b-rà-soát-từ-thiếu-file-edge). Nó liệt kê hết từ
> thiếu và in sẵn lệnh generate bù.

Mô hình config: `LANGUAGES[lang].variants[variantId].voices[provider]`. Cùng một
danh sách từ được đọc lại theo từng variant → ra file ở subfolder riêng:

```
packages/shell/public/audio/en/
├── us/<slug>.mp3              # giọng Mỹ (mặc định: Google/OpenAI)
├── us/elevenlabs/<slug>.mp3   # bản ElevenLabs (nếu có) — tách riêng theo provider
├── gb/<slug>.mp3              # giọng Anh (mặc định)
└── gb/elevenlabs/<slug>.mp3   # bản ElevenLabs (nếu có)
```

> **Tách provider:** provider khai báo `outputSubDir` (vd ElevenLabs →
> `elevenlabs`) sẽ ghi vào subfolder riêng + manifest riêng, nên luôn biết file
> nào do nguồn nào tạo. Provider không khai báo (Google/OpenAI) ghi thẳng vào
> root accent như cũ. Client ưu tiên nguồn ElevenLabs khi có, không thì dùng bản
> mặc định, cuối cùng fallback Web Speech.

Mỗi provider là một adapter cùng interface:

```js
module.exports = {
  id: 'google',
  envKey: 'GOOGLE_TTS_API_KEY',
  async synthesize(text, voiceConfig, apiKey) { /* → trả về Buffer MP3 */ }
};
```

---

## 2. Chuẩn bị API key (KHÔNG ghi key vào code)

Key đọc từ **biến môi trường**, chỉ tồn tại trong phiên terminal của bạn.

| Provider | Biến môi trường | Lấy key tại |
|---|---|---|
| Google Cloud TTS | `GOOGLE_TTS_API_KEY` | Google Cloud Console → bật *Cloud Text-to-Speech API* → Credentials → API key |
| OpenAI (hoặc OpenAI-compatible) | `OPENAI_API_KEY` (+ tuỳ chọn `OPENAI_BASE_URL`) | https://platform.openai.com/api-keys — hoặc dashboard của provider tương thích |
| ElevenLabs | `ELEVENLABS_API_KEY` | https://elevenlabs.io → Profile → API Keys |

Đặt biến (Windows cmd — shell mặc định của máy này):

```cmd
set GOOGLE_TTS_API_KEY=AIza...
```

PowerShell: `$env:GOOGLE_TTS_API_KEY="AIza..."` — bash: `export GOOGLE_TTS_API_KEY=AIza...`

### Dùng provider OpenAI-compatible bên thứ 3

Adapter OpenAI hỗ trợ đổi base URL để dùng các provider tương thích (vd
`shopaikey`, `together.ai`, `openrouter`, gateway tự host…). Đặt
`OPENAI_BASE_URL` là URL gốc kết thúc bằng `/v1`:

```cmd
set OPENAI_API_KEY=sk-xxx
set OPENAI_BASE_URL=https://api.shopaikey.com/v1
```

```powershell
$env:OPENAI_API_KEY = "sk-xxx"
$env:OPENAI_BASE_URL = "https://api.shopaikey.com/v1"
```

Adapter sẽ tự nối `/audio/speech` vào sau base URL. Khi không đặt biến này,
mặc định vẫn là `https://api.openai.com/v1` (OpenAI chính thức).

Có thể override theo từng variant trong [`config.js`](config.js) bằng trường
`baseUrl` ở `voices.openai` — biến môi trường được dùng làm fallback toàn cục.

---

## 3. Sử dụng

Luôn chạy từ thư mục gốc repo.

**Bước 1 — Dry-run (không cần key, không tốn tiền)** cho cả 2 accent:

```cmd
node scripts/tts/generate-audio.js --provider google --variant us,gb --dry-run
```

**Bước 2 — Test 10 từ để nghe thử giọng:**

```cmd
node scripts/tts/generate-audio.js --provider google --variant us,gb --limit 10
```

**Bước 3 — Generate toàn bộ cả 2 accent:**

```cmd
node scripts/tts/generate-audio.js --provider google --variant us,gb --manifest
```

### Các cờ

| Cờ | Ý nghĩa |
|---|---|
| `--lang <id>` | Ngôn ngữ (mặc định `english`) |
| `--provider <id>` | `google` \| `openai` \| `elevenlabs` (mặc định `google`) |
| `--variant <ids>` | Accent: `us` \| `gb` \| `us,gb` \| `all` (mặc định: `defaultVariant`) |
| `--dry-run` | Chỉ liệt kê + ước tính chi phí, **không cần key** |
| `--limit <n>` | Chỉ xử lý `n` từ đầu (test nhanh) |
| `--only a,b,c` | Chỉ generate đúng các từ này |
| `--force` | Ghi đè file đã có (mặc định **resume** — bỏ qua file đã tạo) |
| `--manifest` | Ghi `audio-manifest.json` cho mỗi variant |
| `--concurrency <n>` | Số request song song |

> **Resume tự động:** chạy lại script bỏ qua mọi file đã tồn tại (theo từng
> variant). Bị ngắt giữa chừng hoặc lỗi mạng thì cứ chạy lại — chỉ từ còn
> thiếu được generate tiếp.

---

## 3b. Rà soát từ thiếu file Edge

Khi thêm từ mới vào seed sau lần generate gần nhất, các từ đó **chưa có file
MP3 Edge** nên client sẽ fallback sang Web Speech API (giọng hệ điều hành) —
nghe khác hẳn giọng Neural (đây chính là hiện tượng từ `bad` nghe lạ).

Script [`audit-missing-edge.js`](audit-missing-edge.js) **quét toàn bộ seed** và
so với file thực tế trong `<accent>_edge/`, liệt kê **tất cả** từ đang thiếu +
in sẵn lệnh generate bù. Script **không gọi API, không ghi file** — an toàn chạy
bất cứ lúc nào.

```cmd
node scripts/tts/audit-missing-edge.js
```

Ví dụ output:

```
── American English (us)  →  ...\audio\en\us_edge
   Thiếu 311 / 3888 file MP3 Edge.
      ✗ above
      ✗ bad
      ...
 ⚠ Tổng 311 từ (duy nhất) thiếu file Edge.
 Chạy lệnh sau để generate bù (Edge keyless, không cần key):
   node scripts/tts/generate-audio.js --provider edge --variant us,gb --only "above,bad,..." --manifest
```

> **Quy trình khuyến nghị sau khi thêm từ vào seed:** chạy audit → copy lệnh
> generate ở cuối output → chạy lệnh đó (nhớ có `--manifest` để cập nhật
> `audio-manifest.json`). Vì Edge keyless nên bước bù này miễn phí.

---

## 4. Accent theo provider

| Provider | Anh-Mỹ (us) | Anh-Anh (gb) |
|---|---|---|
| **edge** (đang dùng) | ✅ `en-US-GuyNeural` (nam) | ✅ `en-GB-SoniaNeural` (nữ) — **tách rõ, keyless, miễn phí** |
| **google** | ✅ `en-US-*` | ✅ `en-GB-*` — **tách rõ ràng, tốt nhất** |
| openai | ✅ giọng mặc định | ⚠ KHÔNG có giọng Anh-Anh thật → nghe vẫn như US |
| elevenlabs | ✅ theo voiceId | ⚠ phải đặt `voiceId` giọng Anh-Anh riêng trong config — hiện đặt **Bea** (`aHCytOTnUOgfGPn5n89j`) |

→ Nguồn thực tế app đang dùng là **Edge** (ưu tiên số 1, tách accent rõ + miễn
phí). Google là lựa chọn thay thế nếu cần chất lượng Neural2.

---

## 5. So sánh provider

| | Google Cloud TTS | OpenAI | ElevenLabs |
|---|---|---|---|
| Chất lượng | Cao (Neural2) | Cao | Tự nhiên nhất |
| Free tier | 1M ký tự/tháng (theo nhóm giọng) | Không (nạp tối thiểu) | Hạn chế |
| Accent US/GB | ✅ Tách rõ | ⚠ Chỉ US | ⚠ Theo voiceId |
| Lưu/phát lại vĩnh viễn (ToS) | ✅ Cho phép rõ ràng | Đọc policy hiện hành | Kiểm tra theo gói |

Với mục tiêu "generate một lần + accent US/GB", **Google Cloud TTS** là lựa chọn
hợp nhất. Tự kiểm tra điều khoản và giá hiện hành trước khi phát hành.

---

## 5b. Nghe thử ElevenLabs trước khi quyết định

ElevenLabs giọng tự nhiên nhưng tính phí theo gói — nên **nghe thử** rồi mới
chọn. Hai script riêng cho việc này, **không đụng** tới audio chính của app
(output vào `scripts/tts/preview/`, đã được `.gitignore`).

**Bước 1 — liệt kê voice trong tài khoản** (để lấy `voiceId`):

```cmd
node scripts/tts/list-voices.js
```

In ra tên, `voiceId`, accent, giới tính của từng giọng; phần ★ gợi ý nhanh các
giọng tiếng Anh (American/British).

**Bước 2 — render vài từ mẫu để nghe so sánh:**

```cmd
node scripts/tts/preview-elevenlabs.js --voices VOICE_ID_1,VOICE_ID_2
```

Tạo `scripts/tts/preview/elevenlabs/index.html` — mở bằng trình duyệt, mỗi voice
một hàng, mỗi từ một nút play để nghe cạnh nhau. Bỏ trống `--voices` sẽ dùng
`voiceId` đang khai báo trong [`config.js`](config.js).

Tuỳ chọn đổi từ mẫu / model:

```cmd
node scripts/tts/preview-elevenlabs.js --voices id1 --words "hello,water,thorough" --model eleven_turbo_v2_5
```

**Bước 3 — ưng giọng nào** thì dán `voiceId` vào [`config.js`](config.js)
(`voices.elevenlabs.voiceId` của variant `us` / `gb`), rồi generate như mục 3:

```cmd
node scripts/tts/generate-audio.js --provider elevenlabs --variant us,gb --manifest
```

> Cần `ELEVENLABS_API_KEY` trong `.env`. Hai script preview/list READ-ONLY hoặc
> chỉ render vài từ — tốn quota không đáng kể.

> **Hiện tại**: variant `gb` (UK) đang dùng giọng **Bea — Corporate, Polished
> and Clear** (`voiceId: aHCytOTnUOgfGPn5n89j`), giọng nữ Anh-Anh. Đây là
> *library voice* nên phải thêm vào **My Voices** trước khi dùng; gói free có thể
> bị chặn (lỗi **402 paid_plan_required**). Nếu gặp lỗi, quay lại giọng PREMADE
> như **Lily** (`pFZP5JQG7iQjIQuC4Bku`).

---

## 6. Thêm accent hoặc ngôn ngữ mới

Mở [`config.js`](config.js):

- **Thêm accent**: thêm một entry vào `LANGUAGES.english.variants` (vd `au` cho
  giọng Úc với `en-AU-*`), khai báo `subDir` + `voices`.
- **Thêm ngôn ngữ**: thêm một entry vào `LANGUAGES` (đã có sẵn block ví dụ
  `japanese` được comment) với `seedDirs`, `seedField`, `outputBaseDir`,
  `defaultVariant`, `variants`.

Không cần sửa gì khác.

---

## 7. Phạm vi & tích hợp vào app (bước tiếp theo)

**Đã chốt KHÔNG pre-generate audio cho câu ví dụ** — lý do: nhân theo accent thì
tổng dung lượng câu ví dụ quá lớn để bundle vào PWA (ước tính vài trăm MB). Câu
ví dụ giữ Web Speech API. Chỉ **từ vựng** được pre-generate (set nhỏ, giá trị cao).

Sau khi có file audio, bước tích hợp còn lại (chưa làm trong script này):

1. **Service worker** — thêm cache-first cho `/audio/*` trong
   [`packages/shell/public/sw.js`](../../packages/shell/public/sw.js) để phát
   offline tức thì.
2. **Client TTS** — sửa [`packages/shell/src/js/utils/tts.js`](../../packages/shell/src/js/utils/tts.js):
   - Có setting chọn accent (`us`/`gb`).
   - Suy đường dẫn `audio/en/<accent>/<slug>.mp3` từ `word` qua `slugify`
     (**phải khớp** [`lib/slug.js`](lib/slug.js)).
   - Không có file → fallback Web Speech API.
