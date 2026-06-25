#!/usr/bin/env node
// ============================================================================
// preview-elevenlabs.js — Nghe THỬ giọng ElevenLabs trước khi quyết định dùng
// ----------------------------------------------------------------------------
// Render một vài từ mẫu cho MỘT HOẶC NHIỀU voice rồi xuất ra:
//   scripts/tts/preview/elevenlabs/<voiceId>/<slug>.mp3
//   scripts/tts/preview/elevenlabs/index.html   ← mở bằng trình duyệt để bấm nghe
//
// Mục tiêu: so sánh nhiều giọng cạnh nhau, chọn voiceId ưng ý, rồi mới dán vào
// scripts/tts/config.js và generate toàn bộ. KHÔNG đụng tới audio chính của app.
//
// Key đọc từ .env ở gốc repo (ELEVENLABS_API_KEY) — KHÔNG bao giờ in ra.
//
// ── CÁCH DÙNG ───────────────────────────────────────────────────────────────
//   # 1) Xem có voice nào trong tài khoản:
//   node scripts/tts/list-voices.js
//
//   # 2) Nghe thử các voice đó (mặc định dùng voiceId trong config nếu bỏ trống):
//   node scripts/tts/preview-elevenlabs.js --voices VOICE_ID_1,VOICE_ID_2
//
//   # 3) Đổi bộ từ mẫu / model:
//   node scripts/tts/preview-elevenlabs.js --voices id1 --words "hello,water,routine" --model eleven_turbo_v2_5
//
// Cờ:
//   --voices <id,id>   Danh sách voiceId cần thử (mặc định: lấy từ config.js)
//   --words  <a,b,c>   Từ mẫu (mặc định: bộ từ đa dạng âm sẵn có)
//   --model  <id>      modelId (mặc định: eleven_multilingual_v2)
//   --force            Render lại cả file đã có (mặc định: bỏ qua = resume)
//   --help, -h         In trợ giúp
// ----------------------------------------------------------------------------

const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');

// Nạp .env ở gốc repo.
try {
    const envPath = path.join(__dirname, '..', '..', '.env');
    if (fs.existsSync(envPath) && typeof process.loadEnvFile === 'function') {
        process.loadEnvFile(envPath);
    }
} catch (err) {
    console.warn(`[env] Không nạp được .env (${err.message}).`);
}

const { LANGUAGES } = require('./config');
const elevenlabs = require('./providers/elevenlabs');
const { slugify } = require('./lib/slug');

const PREVIEW_DIR = path.join(__dirname, 'preview', 'elevenlabs');
const VOICES_ENDPOINT = 'https://api.elevenlabs.io/v1/voices';

// Bộ từ mẫu mặc định — đa dạng âm để cảm nhận chất giọng.
const DEFAULT_WORDS = [
    'hello', 'water', 'routine', 'thorough',
    'comfortable', 'schedule', 'vocabulary', 'pronunciation'
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function parseArgs(argv) {
    const args = { voices: null, words: null, model: 'eleven_multilingual_v2', force: false, help: false };
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        switch (a) {
            case '--voices':
                args.voices = String(argv[++i] || '').split(',').map((s) => s.trim()).filter(Boolean);
                break;
            case '--words':
                args.words = String(argv[++i] || '').split(',').map((s) => s.trim()).filter(Boolean);
                break;
            case '--model': args.model = argv[++i]; break;
            case '--force': args.force = true; break;
            case '--help':
            case '-h': args.help = true; break;
            default: console.warn(`[args] Bỏ qua tham số không nhận diện: ${a}`);
        }
    }
    return args;
}

function printHelp() {
    console.log(`
Nghe thử giọng ElevenLabs trước khi quyết định dùng.

  node scripts/tts/preview-elevenlabs.js [options]

Options:
  --voices <id,id>   Danh sách voiceId cần thử (mặc định: lấy từ config.js)
  --words  <a,b,c>   Từ mẫu (mặc định: ${DEFAULT_WORDS.join(', ')})
  --model  <id>      modelId (mặc định: eleven_multilingual_v2)
  --force            Render lại cả file đã có (mặc định: bỏ qua)
  --help, -h         In trợ giúp

Tip: chạy "node scripts/tts/list-voices.js" trước để lấy voiceId.
`);
}

/**
 * Lấy danh sách voiceId mặc định từ config (tất cả variant tiếng Anh).
 */
function voiceIdsFromConfig() {
    const ids = new Set();
    const variants = (LANGUAGES.english && LANGUAGES.english.variants) || {};
    for (const v of Object.values(variants)) {
        const el = v.voices && v.voices.elevenlabs;
        if (el && el.voiceId) ids.add(el.voiceId);
    }
    return [...ids];
}

/**
 * Hỏi ElevenLabs tên hiển thị của các voice (để hiện đẹp trong trang HTML).
 * Lỗi/không có key vẫn không sao — chỉ thiếu tên đẹp.
 * @returns {Promise<Object>} map voiceId -> { name, accent, gender }
 */
async function fetchVoiceMeta(apiKey) {
    const meta = {};
    try {
        const res = await fetch(VOICES_ENDPOINT, { headers: { 'xi-api-key': apiKey } });
        if (!res.ok) return meta;
        const json = await res.json();
        for (const v of (json.voices || [])) {
            meta[v.voice_id] = {
                name: v.name,
                accent: (v.labels || {}).accent || '',
                gender: (v.labels || {}).gender || ''
            };
        }
    } catch { /* bỏ qua — chỉ là metadata làm đẹp */ }
    return meta;
}

function escapeHtml(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/**
 * Sinh trang HTML so sánh: mỗi voice một hàng, mỗi từ một nút play.
 */
function buildHtml({ voiceRows, words, model }) {
    const head = words.map((w) => `<th>${escapeHtml(w)}</th>`).join('');

    const rows = voiceRows.map((row) => {
        const label = row.meta && row.meta.name
            ? `${escapeHtml(row.meta.name)}`
            : escapeHtml(row.voiceId);
        const sub = row.meta && (row.meta.accent || row.meta.gender)
            ? `<div class="sub">${escapeHtml([row.meta.accent, row.meta.gender].filter(Boolean).join(' · '))}</div>`
            : '';
        const idLine = `<div class="vid">${escapeHtml(row.voiceId)}</div>`;

        const cells = words.map((w) => {
            const file = row.files[w];
            if (!file) return '<td class="miss">—</td>';
            const src = `${encodeURIComponent(row.voiceId)}/${encodeURIComponent(file)}`;
            return `<td><audio controls preload="none" src="${src}"></audio></td>`;
        }).join('');

        return `<tr><td class="voice">${label}${sub}${idLine}</td>${cells}</tr>`;
    }).join('\n');

    return `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ElevenLabs — Nghe thử giọng</title>
<style>
  :root { color-scheme: light dark; }
  body { font-family: system-ui, -apple-system, "Segoe UI", sans-serif; margin: 24px; line-height: 1.5; }
  h1 { font-size: 20px; margin: 0 0 4px; }
  p.meta { color: #888; margin: 0 0 20px; font-size: 14px; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid #ccc4; padding: 8px 10px; text-align: left; vertical-align: middle; }
  th { background: #8881; font-weight: 600; }
  td.voice { white-space: nowrap; font-weight: 600; }
  td.voice .sub { font-weight: 400; color: #888; font-size: 12px; }
  td.voice .vid { font-weight: 400; color: #aaa; font-size: 11px; font-family: monospace; }
  td.miss { color: #c00; text-align: center; }
  audio { height: 32px; }
  code { background: #8882; padding: 1px 5px; border-radius: 4px; }
</style>
</head>
<body>
  <h1>ElevenLabs — Nghe thử giọng</h1>
  <p class="meta">Model: <code>${escapeHtml(model)}</code> · ${voiceRows.length} voice · ${words.length} từ mẫu · tạo lúc ${new Date().toLocaleString('vi-VN')}</p>
  <table>
    <thead><tr><th>Voice</th>${head}</tr></thead>
    <tbody>
${rows}
    </tbody>
  </table>
</body>
</html>`;
}

async function main() {
    const args = parseArgs(process.argv.slice(2));
    if (args.help) { printHelp(); return; }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
        console.error('✗ Thiếu ELEVENLABS_API_KEY (đặt trong .env ở gốc repo).');
        console.error('  PowerShell:  $env:ELEVENLABS_API_KEY="..."');
        process.exit(1);
    }

    const voiceIds = args.voices && args.voices.length ? args.voices : voiceIdsFromConfig();
    if (!voiceIds.length) {
        console.error('✗ Không có voiceId nào để thử.');
        console.error('  → Chạy: node scripts/tts/list-voices.js  để lấy voiceId,');
        console.error('    rồi:  node scripts/tts/preview-elevenlabs.js --voices ID1,ID2');
        process.exit(1);
    }

    const words = args.words && args.words.length ? args.words : DEFAULT_WORDS;

    console.log('============================================================');
    console.log(` ElevenLabs Preview — ${voiceIds.length} voice × ${words.length} từ`);
    console.log(` Model: ${args.model}`);
    console.log('============================================================');

    const meta = await fetchVoiceMeta(apiKey);

    const voiceRows = [];
    let done = 0, failed = 0, skipped = 0;

    for (const voiceId of voiceIds) {
        const outDir = path.join(PREVIEW_DIR, voiceId);
        await fsp.mkdir(outDir, { recursive: true });

        const niceName = (meta[voiceId] && meta[voiceId].name) || voiceId;
        console.log(`\n• Voice: ${niceName} (${voiceId})`);

        const files = {};
        for (const word of words) {
            const fileName = `${slugify(word)}.mp3`;
            const dest = path.join(outDir, fileName);
            files[word] = fileName;

            if (!args.force && fs.existsSync(dest)) {
                skipped++;
                console.log(`    · ${word}  (đã có — bỏ qua)`);
                continue;
            }

            try {
                const buf = await elevenlabs.synthesize(
                    word,
                    { voiceId, modelId: args.model },
                    apiKey
                );
                await fsp.writeFile(dest, buf);
                done++;
                console.log(`    ✓ ${word}  (${(buf.length / 1024).toFixed(1)} KB)`);
            } catch (err) {
                failed++;
                console.error(`    ✗ ${word} — ${err.message}`);
            }
            await sleep(120);
        }

        voiceRows.push({ voiceId, meta: meta[voiceId], files });
    }

    // Ghi trang HTML so sánh
    const html = buildHtml({ voiceRows, words, model: args.model });
    const htmlPath = path.join(PREVIEW_DIR, 'index.html');
    await fsp.writeFile(htmlPath, html, 'utf8');

    console.log('\n============================================================');
    console.log(` Xong: ${done} render, ${skipped} bỏ qua, ${failed} lỗi`);
    console.log(` Trang nghe thử: ${htmlPath}`);
    console.log('============================================================');
    console.log('\n→ Mở file index.html ở trên bằng trình duyệt để bấm nghe & so sánh.');
    console.log('  Ưng voice nào thì dán voiceId vào scripts/tts/config.js');
    console.log('  (voices.elevenlabs.voiceId của variant us / gb).');

    if (failed) process.exitCode = 1;
}

main().catch((err) => {
    console.error('\n✗ Lỗi không mong đợi:', err);
    process.exit(1);
});
