#!/usr/bin/env node
// ============================================================================
// audit-missing-edge.js — Rà soát tính toàn vẹn Edge MP3 + audio-manifest
// ----------------------------------------------------------------------------
// Vì sao cần: file audio Edge được generate theo mẻ; từ thêm vào seed SAU lần
// generate gần nhất sẽ chưa có MP3 → client fallback Web Speech API, nghe khác
// hẳn các từ còn lại (vd trường hợp từ "bad").
//
// Script này KHÔNG gọi API, KHÔNG ghi gì. Kiểm tra độc lập cả 3 nguồn:
//   1) Từ trong seed
//   2) File MP3 thực tế trong <accent>_edge/
//   3) Entry trong audio-manifest.json
// Phát hiện: thiếu MP3, thiếu manifest entry, manifest trỏ file không tồn tại,
// filename sai, và MP3 mồ côi không thuộc seed.
//
// CÁCH DÙNG:
//   node scripts/tts/audit-missing-edge.js
//   node scripts/tts/audit-missing-edge.js --lang english --variant us,gb
// ============================================================================

const fs = require('fs');
const path = require('path');

const { getLanguage, resolveVariants } = require('./config');
const { extractWords } = require('./lib/extract-words');

function parseArgs(argv) {
    const args = { lang: 'english', variant: 'all' };
    for (let i = 0; i < argv.length; i++) {
        if (argv[i] === '--lang') args.lang = argv[++i];
        else if (argv[i] === '--variant') args.variant = argv[++i];
    }
    return args;
}

function main() {
    const args = parseArgs(process.argv.slice(2));
    const langConfig = getLanguage(args.lang);
    const variants = resolveVariants(langConfig, args.variant);

    const { words, stats } = extractWords(langConfig, { audioExt: 'mp3' });

    console.log('============================================================');
    console.log(` Audit Edge MP3 — lang=${langConfig.label}`);
    console.log(` Từ duy nhất trong seed: ${stats.uniqueWords}`);
    console.log('============================================================');

    let grandTotalIssues = 0;
    const missingFilesByVariant = {};

    function printIssues(label, issues, format = (x) => x) {
        console.log(`   ${label}: ${issues.length}`);
        if (issues.length) {
            for (const issue of issues.slice(0, 100)) console.log(`      ✗ ${format(issue)}`);
            if (issues.length > 100) console.log(`      … và ${issues.length - 100} lỗi khác`);
        }
    }

    for (const v of variants) {
        // Edge ghi vào folder anh em "<accent>_edge"
        const outDir = path.join(langConfig.outputBaseDir, `${v.subDir}_edge`);
        const manifestPath = path.join(outDir, 'audio-manifest.json');
        let manifest = null;
        try {
            manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        } catch (err) {
            console.error(`\n── ${v.label} (${v.id})  →  ${outDir}`);
            console.error(`   ✗ Không đọc được manifest: ${err.message}`);
            grandTotalIssues++;
            missingFilesByVariant[v.id] = [];
            continue;
        }

        const manifestFiles = manifest && manifest.files && typeof manifest.files === 'object'
            ? manifest.files
            : {};
        const seedBySlug = new Map(words.map((w) => [w.slug, w]));
        const missingMp3 = [];
        const missingManifest = [];
        const wrongManifestFilename = [];
        const danglingManifest = [];

        for (const w of words) {
            const dest = path.join(outDir, w.fileName);
            const hasMp3 = fs.existsSync(dest);
            const manifestFile = manifestFiles[w.slug];
            if (!hasMp3) missingMp3.push(w.word);
            if (!manifestFile) {
                missingManifest.push(w.word);
            } else {
                if (manifestFile !== w.fileName) {
                    wrongManifestFilename.push({ word: w.word, actual: manifestFile, expected: w.fileName });
                }
                if (!fs.existsSync(path.join(outDir, manifestFile))) {
                    danglingManifest.push({ slug: w.slug, file: manifestFile });
                }
            }
        }

        const orphanManifest = Object.keys(manifestFiles)
            .filter((slug) => !seedBySlug.has(slug))
            .map((slug) => ({ slug, file: manifestFiles[slug] }));
        const orphanMp3 = fs.readdirSync(outDir)
            .filter((name) => name.toLowerCase().endsWith('.mp3'))
            .filter((name) => !words.some((w) => w.fileName === name));

        const issueCount = missingMp3.length + missingManifest.length +
            wrongManifestFilename.length + danglingManifest.length +
            orphanManifest.length + orphanMp3.length;
        grandTotalIssues += issueCount;
        missingFilesByVariant[v.id] = missingMp3;

        console.log(`\n── ${v.label} (${v.id})  →  ${outDir}`);
        console.log(`   Seed=${words.length}, MP3=${fs.readdirSync(outDir).filter((x) => x.endsWith('.mp3')).length}, manifest=${Object.keys(manifestFiles).length}`);
        printIssues('Thiếu MP3', missingMp3);
        printIssues('MP3 có nhưng thiếu entry manifest', missingManifest);
        printIssues('Manifest sai filename', wrongManifestFilename,
            (x) => `${x.word}: ${x.actual} (đúng: ${x.expected})`);
        printIssues('Manifest trỏ file không tồn tại', danglingManifest,
            (x) => `${x.slug} → ${x.file}`);
        printIssues('Entry manifest không thuộc seed', orphanManifest,
            (x) => `${x.slug} → ${x.file}`);
        printIssues('MP3 không thuộc seed', orphanMp3);
        if (!issueCount) console.log('   ✓ MP3 và manifest toàn vẹn.');
    }

    // Gợi ý lệnh generate bù cho file thật sự thiếu; nếu chỉ hỏng manifest thì
    // generator resume sẽ không synthesize lại, nhưng vẫn dựng manifest đầy đủ.
    const allMissingMp3 = new Set();
    for (const id of Object.keys(missingFilesByVariant)) {
        for (const w of missingFilesByVariant[id]) allMissingMp3.add(w);
    }

    console.log('\n============================================================');
    if (!grandTotalIssues) {
        console.log(' ✓ Edge MP3 và manifest toàn vẹn. Tất cả từ có thể dùng đúng giọng.');
    } else {
        const variantIds = variants.map((v) => v.id).join(',');
        console.log(` ✗ Phát hiện tổng cộng ${grandTotalIssues} lỗi tính toàn vẹn.`);
        if (allMissingMp3.size) {
            const onlyList = Array.from(allMissingMp3).join(',');
            console.log('\n Generate bù MP3 thiếu + dựng lại manifest đầy đủ:');
            console.log(`   node scripts/tts/generate-audio.js --provider edge --variant ${variantIds} --only "${onlyList}" --manifest`);
        } else {
            console.log('\n MP3 đủ; chạy resume để chỉ dựng lại manifest đầy đủ:');
            console.log(`   node scripts/tts/generate-audio.js --provider edge --variant ${variantIds} --only "body" --manifest`);
        }
        process.exitCode = 1;
    }
    console.log('============================================================');
}

main();
