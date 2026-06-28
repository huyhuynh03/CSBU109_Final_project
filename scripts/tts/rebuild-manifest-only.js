#!/usr/bin/env node
/**
 * Rebuild audio-manifest.json từ seed words — không cần API key, không generate mp3.
 * Đồng thời phát hiện và tùy chọn xóa orphan mp3 (file còn trong folder nhưng không có trong seed).
 *
 * Usage:
 *   node scripts/tts/rebuild-manifest-only.js              # dry-run: chỉ báo cáo
 *   node scripts/tts/rebuild-manifest-only.js --write      # ghi manifest mới
 *   node scripts/tts/rebuild-manifest-only.js --clean      # xóa orphan + ghi manifest
 */

const path = require('path');
const fs = require('fs');
const fsp = require('fs/promises');
const { getLanguage } = require('./config');
const { extractWords } = require('./lib/extract-words');

const ROOT = path.resolve(__dirname, '../../');
const AUDIO_EXT = 'mp3';

// Các thư mục audio cần xử lý (subDir tương đối so với outputBaseDir)
const SUBDIRS = ['us', 'gb', 'gb_elevenlabs'];

// ──────────────────────────────────────────────────────────────────────────────

async function main() {
    const args = process.argv.slice(2);
    const doWrite = args.includes('--write') || args.includes('--clean');
    const doClean = args.includes('--clean');

    console.log('============================================================');
    console.log(' Rebuild Audio Manifest' + (doWrite ? '' : ' [DRY-RUN — dùng --write để ghi]'));
    console.log('============================================================');

    // 1) Trích danh sách từ duy nhất từ seed
    const langConfig = getLanguage('english');
    const { words, stats, collisions } = extractWords(langConfig, { audioExt: AUDIO_EXT });

    console.log(`\nSeed: ${stats.filesRead} file, ${stats.totalCards} card, ${stats.uniqueWords} từ duy nhất`);
    if (stats.skipped) console.log(`  (bỏ qua ${stats.skipped} mục rỗng)`);

    if (collisions.length) {
        console.warn(`\n⚠ ${collisions.length} va chạm slug:`);
        for (const c of collisions) {
            console.warn(`   - ${c.slug}.${AUDIO_EXT}  ←  ${c.words.join(' | ')}`);
        }
    }

    // 2) Tạo set các fileName hợp lệ (theo seed)
    const validFileNames = new Set(words.map((w) => w.fileName));

    // 3) Xử lý từng thư mục
    let totalOrphans = 0;
    let totalDeleted = 0;
    let manifestsWritten = 0;

    for (const subDir of SUBDIRS) {
        const outDir = path.join(langConfig.outputBaseDir, subDir);

        console.log(`\n──────────────────────────────────────────────────`);
        console.log(` ${subDir}/  (${outDir})`);
        console.log(`──────────────────────────────────────────────────`);

        if (!fs.existsSync(outDir)) {
            console.log('  ⚠ Thư mục không tồn tại — bỏ qua.');
            continue;
        }

        // Đếm mp3 thực tế
        const allMp3 = fs.readdirSync(outDir).filter((f) => f.endsWith(`.${AUDIO_EXT}`));
        console.log(`  mp3 thực tế : ${allMp3.length}`);

        // Tìm orphan
        const orphans = allMp3.filter((f) => !validFileNames.has(f));
        console.log(`  trong seed  : ${allMp3.length - orphans.length}`);
        console.log(`  orphan      : ${orphans.length}`);
        totalOrphans += orphans.length;

        if (orphans.length > 0) {
            const preview = orphans.slice(0, 20);
            console.log(`\n  Orphan${orphans.length > 20 ? ` (20/${orphans.length})` : ''}:`);
            for (const f of preview) console.log(`    - ${f}`);

            if (doClean) {
                process.stdout.write(`\n  Đang xóa ${orphans.length} orphan...`);
                for (const f of orphans) {
                    await fsp.unlink(path.join(outDir, f));
                }
                totalDeleted += orphans.length;
                console.log(' ✓');
            }
        }

        // Ghi manifest
        // Với gb_elevenlabs không phải là "variant" chính của config, vẫn ghi manifest
        // để đảm bảo nhất quán (dùng variant id = tên subDir)
        const variantId = subDir; // 'us', 'gb', 'gb_elevenlabs'
        const manifest = {
            _meta: {
                lang: langConfig.id,
                variant: variantId,
                generatedAt: new Date().toISOString(),
                total: words.length,
            },
            files: {},
        };
        for (const w of words) {
            manifest.files[w.slug] = w.fileName;
        }

        const manifestPath = path.join(outDir, 'audio-manifest.json');
        const existingSize = fs.existsSync(manifestPath)
            ? fs.statSync(manifestPath).size
            : 0;

        if (doWrite) {
            await fsp.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
            manifestsWritten++;
            console.log(`\n  ✓ Manifest ghi: ${words.length} entries → audio-manifest.json`);
        } else {
            console.log(
                `\n  [DRY-RUN] Manifest sẽ ghi: ${words.length} entries` +
                    (existingSize ? ` (hiện tại: ${(existingSize / 1024).toFixed(1)} KB)` : ' (chưa tồn tại)')
            );
        }
    }

    // 4) Tổng kết
    console.log('\n============================================================');
    if (!doWrite) {
        console.log(` DRY-RUN hoàn tất.`);
        if (totalOrphans) {
            console.log(` Tổng orphan: ${totalOrphans} file → chạy --clean để xóa + ghi manifest`);
        } else {
            console.log(` Không có orphan. Chạy --write để rebuild manifest.`);
        }
    } else {
        if (doClean) console.log(` Đã xóa: ${totalDeleted} orphan mp3`);
        console.log(` Đã ghi: ${manifestsWritten} manifest`);
    }
    console.log('============================================================');
}

main().catch((err) => {
    console.error('✗ Lỗi:', err);
    process.exit(1);
});
