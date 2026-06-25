#!/usr/bin/env node
// ============================================================================
// generate-audio.js — CLI sinh audio phát âm cho từ vựng (pre-generate 1 lần)
// ----------------------------------------------------------------------------
// Chạy ở MÁY DEV (không phải trong app/PWA). Gọi TTS API một lần để tạo file
// MP3 tĩnh, lưu vào public/audio/<lang>/<variant> rồi bundle vào PWA. Sau đó
// app phát file tĩnh — không gọi API, không tốn phí, chạy offline vĩnh viễn.
//
// Hỗ trợ NHIỀU ACCENT (variant): cùng một danh sách từ vựng được đọc lại theo
// từng giọng, ví dụ Anh-Mỹ (us) và Anh-Anh (gb):
//   audio/en/us/<slug>.mp3
//   audio/en/gb/<slug>.mp3
//
// API key đọc từ BIẾN MÔI TRƯỜNG (không bao giờ ghi vào code/seed):
//   google      -> GOOGLE_TTS_API_KEY
//   openai      -> OPENAI_API_KEY
//   elevenlabs  -> ELEVENLABS_API_KEY
//
// ── CÁCH DÙNG ───────────────────────────────────────────────────────────────
//   node scripts/tts/generate-audio.js --lang english --provider google --variant us,gb
//
// Cờ:
//   --lang <id>        ngôn ngữ (mặc định: english)
//   --provider <id>    google | openai | elevenlabs (mặc định: google)
//   --variant <ids>    accent: us | gb | us,gb | all (mặc định: defaultVariant của lang)
//   --dry-run          chỉ liệt kê + ước tính chi phí, KHÔNG gọi API, KHÔNG cần key
//   --limit <n>        chỉ xử lý n từ đầu (để test nhanh)
//   --only <a,b,c>     chỉ generate đúng các từ này (không phân biệt hoa thường)
//   --force            ghi đè cả file audio đã tồn tại (mặc định: bỏ qua = resume)
//   --manifest         ghi audio-manifest.json (map slug -> fileName) cho mỗi variant
//   --concurrency <n>  số request song song (mặc định: theo config)
//   --help             in trợ giúp
// ----------------------------------------------------------------------------

const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');

// ----------------------------------------------------------------------------
// Tự nạp .env ở gốc repo (Node >= 20.6 có sẵn process.loadEnvFile — KHÔNG cần dotenv).
// Nhờ vậy chỉ cần chạy `node scripts/tts/generate-audio.js ...` là key tự được đọc.
// File .env đã được .gitignore → API key KHÔNG bao giờ lọt vào repo, app hay bundle.
// Guard bằng existsSync để chạy bình thường ngay cả khi chưa tạo .env (vd --dry-run).
// ----------------------------------------------------------------------------
try {
    const envPath = path.join(__dirname, '..', '..', '.env');
    if (fs.existsSync(envPath) && typeof process.loadEnvFile === 'function') {
        process.loadEnvFile(envPath);
    }
} catch (err) {
    console.warn(`[env] Không nạp được .env (${err.message}). Có thể đặt key thủ công qua biến môi trường.`);
}

const { DEFAULTS, PROVIDERS, getLanguage, resolveVariants } = require('./config');
const { extractWords } = require('./lib/extract-words');

// Giá tham khảo (USD / 1 triệu ký tự). Chỉ để ước tính trong --dry-run.
// Số liệu có thể đổi theo thời điểm — xem trang giá chính thức của provider.
const PRICE_PER_MILLION = {
    google: 16,      // Neural2/WaveNet (free tier 1M ký tự/tháng, tính theo nhóm giọng)
    openai: 15,      // tts-1
    elevenlabs: 100  // ước tính thô; ElevenLabs tính theo gói thuê bao
};

// ----------------------------------------------------------------------------
// Parse tham số dòng lệnh (đơn giản, không cần thư viện ngoài)
// ----------------------------------------------------------------------------
function parseArgs(argv) {
    const args = {
        lang: 'english',
        provider: DEFAULTS.provider,
        variant: null,
        dryRun: false,
        limit: null,
        only: null,
        force: false,
        manifest: false,
        concurrency: DEFAULTS.concurrency,
        help: false
    };

    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        switch (a) {
            case '--lang': args.lang = argv[++i]; break;
            case '--provider': args.provider = argv[++i]; break;
            case '--variant': args.variant = argv[++i]; break;
            case '--dry-run': args.dryRun = true; break;
            case '--limit': args.limit = parseInt(argv[++i], 10); break;
            case '--only':
                args.only = new Set(
                    String(argv[++i] || '')
                        .split(',')
                        .map((s) => s.trim().toLowerCase())
                        .filter(Boolean)
                );
                break;
            case '--force': args.force = true; break;
            case '--manifest': args.manifest = true; break;
            case '--concurrency': args.concurrency = parseInt(argv[++i], 10); break;
            case '--help':
            case '-h': args.help = true; break;
            default:
                console.warn(`[args] Bỏ qua tham số không nhận diện: ${a}`);
        }
    }
    return args;
}

function printHelp() {
    console.log(`
Sinh audio phát âm từ vựng (pre-generate một lần), hỗ trợ nhiều accent.

  node scripts/tts/generate-audio.js [options]

Options:
  --lang <id>          Ngôn ngữ (mặc định: english)
  --provider <id>      ${PROVIDERS.join(' | ')} (mặc định: ${DEFAULTS.provider})
  --variant <ids>      Accent: us | gb | us,gb | all (mặc định: defaultVariant)
  --dry-run            Chỉ liệt kê + ước tính chi phí, không gọi API, không cần key
  --limit <n>          Chỉ xử lý n từ đầu (test nhanh)
  --only <a,b,c>       Chỉ generate các từ liệt kê
  --force              Ghi đè file audio đã tồn tại (mặc định: resume — bỏ qua)
  --manifest           Ghi audio-manifest.json cho mỗi variant
  --concurrency <n>    Số request song song (mặc định: ${DEFAULTS.concurrency})
  --help, -h           In trợ giúp

API key (biến môi trường):
  gemini      GEMINI_API_KEY       (mặc định — Google AI Studio)
  google      GOOGLE_TTS_API_KEY
  openai      OPENAI_API_KEY
  elevenlabs  ELEVENLABS_API_KEY

Lưu ý accent theo provider:
  google      Tách US/GB rõ ràng (en-US-* vs en-GB-*). Tốt nhất cho accent.
  openai      Không có giọng Anh-Anh thật sự → variant gb nghe vẫn như US.
  elevenlabs  Accent phụ thuộc voiceId; cần đặt voiceId riêng cho từng accent.
`);
}

// ----------------------------------------------------------------------------
// Tiện ích
// ----------------------------------------------------------------------------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function fmtBytes(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

/**
 * Gọi synthesize với retry + exponential backoff.
 */
async function synthesizeWithRetry(provider, text, voiceConfig, apiKey) {
    let lastErr;
    for (let attempt = 1; attempt <= DEFAULTS.retries; attempt++) {
        try {
            return await provider.synthesize(text, voiceConfig, apiKey);
        } catch (err) {
            lastErr = err;
            if (attempt === DEFAULTS.retries) break;
            const delay = DEFAULTS.retryBaseDelayMs * Math.pow(2, attempt - 1);
            console.warn(`     ↻ thử lại (${attempt}/${DEFAULTS.retries}) sau ${delay}ms — ${err.message}`);
            await sleep(delay);
        }
    }
    throw lastErr;
}

/**
 * Chạy danh sách task với giới hạn song song (concurrency pool).
 */
async function runPool(items, limit, worker) {
    let cursor = 0;
    const size = Math.max(1, Math.min(limit, items.length || 1));
    const runners = new Array(size).fill(0).map(async () => {
        while (cursor < items.length) {
            const idx = cursor++;
            await worker(items[idx], idx);
            if (DEFAULTS.requestDelayMs) await sleep(DEFAULTS.requestDelayMs);
        }
    });
    await Promise.all(runners);
}

/**
 * Lọc danh sách từ còn cần generate cho một thư mục output (resume).
 * @returns {{ pending: Array, existing: number }}
 */
function filterPending(words, outDir, force) {
    let existing = 0;
    const pending = [];
    for (const w of words) {
        const dest = path.join(outDir, w.fileName);
        if (!force && fs.existsSync(dest)) existing++;
        else pending.push(w);
    }
    return { pending, existing };
}

// ----------------------------------------------------------------------------
// Generate cho MỘT variant
// ----------------------------------------------------------------------------
async function generateVariant({ variant, words, provider, apiKey, langConfig, args }) {
    // Provider có outputSubDir → ghi vào folder anh em "<accent>_<provider>" (vd gb_elevenlabs/).
    // Không có → ghi thẳng vào root accent như cũ.
    const outDir = provider.outputSubDir
        ? path.join(langConfig.outputBaseDir, `${variant.subDir}_${provider.outputSubDir}`)
        : path.join(langConfig.outputBaseDir, variant.subDir);
    const voiceConfig = variant.voices[provider.id];

    console.log(`\n──────────────────────────────────────────────────────────`);
    console.log(` Variant: ${variant.label} (${variant.id})  →  ${outDir}`);
    console.log(`──────────────────────────────────────────────────────────`);

    if (!voiceConfig) {
        console.warn(`  ⚠ Variant "${variant.id}" chưa cấu hình giọng cho provider "${provider.id}". Bỏ qua.`);
        return { done: 0, failed: 0, bytes: 0, skipped: words.length, failures: [] };
    }

    const { pending, existing } = filterPending(words, outDir, args.force);
    if (existing) console.log(`  • Đã có sẵn ${existing} file (bỏ qua — dùng --force để ghi đè)`);

    // Ghi manifest (gồm TẤT CẢ từ, kể cả đã có) nếu yêu cầu
    if (args.manifest) {
        await fsp.mkdir(outDir, { recursive: true });
        const manifest = {
            _meta: {
                lang: langConfig.id,
                variant: variant.id,
                provider: provider.id,
                generatedAt: new Date().toISOString(),
                total: words.length
            },
            files: {}
        };
        for (const w of words) manifest.files[w.slug] = w.fileName;
        await fsp.writeFile(path.join(outDir, 'audio-manifest.json'), JSON.stringify(manifest, null, 2));
        console.log(`  • Đã ghi manifest: ${path.join(outDir, 'audio-manifest.json')}`);
    }

    if (!pending.length) {
        console.log('  ✓ Không có gì để làm (tất cả đã tồn tại).');
        return { done: 0, failed: 0, bytes: 0, skipped: existing, failures: [] };
    }

    await fsp.mkdir(outDir, { recursive: true });
    console.log(`  ▶ Generate ${pending.length} từ (song song ${args.concurrency})...`);

    let done = 0, failed = 0, bytes = 0;
    const failures = [];

    await runPool(pending, args.concurrency, async (w) => {
        const dest = path.join(outDir, w.fileName);
        try {
            const buf = await synthesizeWithRetry(provider, w.word, voiceConfig, apiKey);
            await fsp.writeFile(dest, buf);
            done++;
            bytes += buf.length;
            console.log(`    ✓ [${done + failed}/${pending.length}] ${w.word}  (${fmtBytes(buf.length)})`);
        } catch (err) {
            failed++;
            failures.push({ word: w.word, error: err.message });
            console.error(`    ✗ [${done + failed}/${pending.length}] ${w.word} — ${err.message}`);
        }
    });

    return { done, failed, bytes, skipped: existing, failures };
}

// ----------------------------------------------------------------------------
// Main
// ----------------------------------------------------------------------------
async function main() {
    const args = parseArgs(process.argv.slice(2));

    if (args.help) { printHelp(); return; }

    if (!PROVIDERS.includes(args.provider)) {
        console.error(`✗ Provider không hợp lệ: "${args.provider}". Chọn: ${PROVIDERS.join(', ')}`);
        process.exit(1);
    }

    // Nạp cấu hình ngôn ngữ + variants
    let langConfig, variants;
    try {
        langConfig = getLanguage(args.lang);
        variants = resolveVariants(langConfig, args.variant);
    } catch (err) {
        console.error(`✗ ${err.message}`);
        process.exit(1);
    }

    const audioExt = DEFAULTS.audioExt;

    console.log('============================================================');
    console.log(` TTS Generate — lang=${langConfig.label}  provider=${args.provider}`);
    console.log(` Variants: ${variants.map((v) => v.id).join(', ')}`);
    console.log('============================================================');

    // 1) Trích từ vựng duy nhất (chung cho mọi variant)
    const { words, stats, collisions } = extractWords(langConfig, { audioExt });
    console.log(`• Đọc ${stats.filesRead} file seed, ${stats.totalCards} card`);
    console.log(`• Từ duy nhất: ${stats.uniqueWords} (bỏ qua ${stats.skipped} mục rỗng)`);

    if (collisions.length) {
        console.warn(`\n⚠ Phát hiện ${collisions.length} va chạm slug (từ khác nhau, cùng tên file):`);
        for (const c of collisions.slice(0, 20)) {
            console.warn(`   - ${c.slug}.${audioExt}  ←  ${c.words.join(' | ')}`);
        }
        console.warn('   → Các từ này sẽ ghi đè lên nhau. Cân nhắc đổi seed hoặc quy ước slug.\n');
    }

    // 2) Lọc theo --only / --limit
    let targets = words;
    if (args.only) {
        targets = targets.filter((w) => args.only.has(w.word.toLowerCase()));
        console.log(`• Lọc --only: còn ${targets.length} từ`);
    }
    if (Number.isInteger(args.limit) && args.limit > 0) {
        targets = targets.slice(0, args.limit);
        console.log(`• Giới hạn --limit: còn ${targets.length} từ`);
    }

    // 3) Ước tính chi phí (× số variant vì mỗi variant đọc lại toàn bộ)
    const charsPerVariant = targets.reduce((sum, w) => sum + w.word.length, 0);
    const totalChars = charsPerVariant * variants.length;
    const estCost = (totalChars / 1_000_000) * (PRICE_PER_MILLION[args.provider] || 0);
    console.log(`\n• ${targets.length} từ × ${variants.length} variant = ${targets.length * variants.length} file`);
    console.log(`• Tổng ký tự: ~${totalChars}  →  ước tính ${args.provider}: ~$${estCost.toFixed(4)} (một lần)`);

    // 4) Dry-run — dừng ở đây, không cần API key
    if (args.dryRun) {
        console.log('\n[DRY-RUN] Không gọi API, không ghi file.');
        // Provider có outputSubDir → file nằm trong folder anh em "<accent>_<provider>" (vd gb_elevenlabs/).
        const providerSubDir = require(`./providers/${args.provider}`).outputSubDir || null;
        for (const v of variants) {
            const outDir = providerSubDir
                ? path.join(langConfig.outputBaseDir, `${v.subDir}_${providerSubDir}`)
                : path.join(langConfig.outputBaseDir, v.subDir);
            const { pending, existing } = filterPending(targets, outDir, args.force);
            const hasVoice = !!v.voices[args.provider];
            console.log(`\n  • ${v.label} (${v.id}): cần ${pending.length}, đã có ${existing}` +
                (hasVoice ? '' : `  ⚠ thiếu giọng cho provider ${args.provider}`));
            const subParts = [path.basename(langConfig.outputBaseDir)];
            subParts.push(providerSubDir ? `${v.subDir}_${providerSubDir}` : v.subDir);
            for (const w of pending.slice(0, 5)) {
                console.log(`      ${w.word}  →  ${path.join('audio', ...subParts, w.fileName)}`);
            }
        }
        console.log('\nXong dry-run.');
        return;
    }

    if (!targets.length) {
        console.log('\n✓ Không có từ nào để xử lý.');
        return;
    }

    // 5) Nạp provider + API key (hỗ trợ fallback keys — vd cùng 1 GCP key cho nhiều service)
    const provider = require(`./providers/${args.provider}`);
    const envKeys = [provider.envKey, ...(provider.envKeyFallbacks || [])];
    let apiKey = null;
    let usedEnvKey = '';
    for (const ek of envKeys) {
        if (process.env[ek]) { apiKey = process.env[ek]; usedEnvKey = ek; break; }
    }
    if (!apiKey) {
        console.error(`\n✗ Thiếu API key. Hãy đặt biến môi trường ${envKeys[0]} rồi chạy lại.`);
        if (envKeys.length > 1) console.error(`  (hoặc: ${envKeys.slice(1).join(', ')})`);
        console.error(`  Windows (cmd):  set ${envKeys[0]}=YOUR_KEY`);
        console.error(`  PowerShell:     $env:${envKeys[0]}="YOUR_KEY"`);
        console.error(`  bash:           export ${envKeys[0]}=YOUR_KEY`);
        process.exit(1);
    }
    if (usedEnvKey !== provider.envKey) {
        console.log(`  ℹ Dùng key từ ${usedEnvKey} (fallback cho ${provider.envKey})`);
    }

    // 6) Generate lần lượt từng variant
    let totDone = 0, totFailed = 0, totBytes = 0;
    const allFailures = [];
    for (const variant of variants) {
        const r = await generateVariant({ variant, words: targets, provider, apiKey, langConfig, args });
        totDone += r.done;
        totFailed += r.failed;
        totBytes += r.bytes;
        for (const f of r.failures) allFailures.push({ variant: variant.id, ...f });
    }

    // 7) Tổng kết
    console.log('\n============================================================');
    console.log(` Hoàn tất: ${totDone} thành công, ${totFailed} lỗi, tổng ${fmtBytes(totBytes)}`);
    console.log('============================================================');
    if (allFailures.length) {
        console.log('Các từ lỗi (chạy lại script sẽ tự resume):');
        for (const f of allFailures.slice(0, 30)) console.log(`   - [${f.variant}] ${f.word}: ${f.error}`);
        process.exitCode = 1;
    }
}

main().catch((err) => {
    console.error('\n✗ Lỗi không mong đợi:', err);
    process.exit(1);
});
