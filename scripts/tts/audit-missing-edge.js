#!/usr/bin/env node
// ============================================================================
// audit-missing-edge.js — Rà soát từ vựng THIẾU file MP3 do Edge TTS tạo
// ----------------------------------------------------------------------------
// Vì sao cần: file audio Edge được generate theo mẻ; từ thêm vào seed SAU lần
// generate gần nhất sẽ chưa có MP3 → client fallback Web Speech API, nghe khác
// hẳn các từ còn lại (vd trường hợp từ "bad").
//
// Script này KHÔNG gọi API, KHÔNG ghi gì. Chỉ:
//   1) Trích danh sách từ duy nhất từ seed (dùng chung extractWords với generate)
//   2) So với file thực tế trong <accent>_edge/ (us_edge, gb_edge)
//   3) In ra những từ còn thiếu MP3 cho từng accent
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

    let grandTotalMissing = 0;
    const missingByVariant = {};

    for (const v of variants) {
        // Edge ghi vào folder anh em "<accent>_edge"
        const outDir = path.join(langConfig.outputBaseDir, `${v.subDir}_edge`);
        const missing = [];
        for (const w of words) {
            const dest = path.join(outDir, w.fileName);
            if (!fs.existsSync(dest)) missing.push(w.word);
        }
        missingByVariant[v.id] = missing;
        grandTotalMissing += missing.length;

        console.log(`\n── ${v.label} (${v.id})  →  ${outDir}`);
        console.log(`   Thiếu ${missing.length} / ${words.length} file MP3 Edge.`);
        if (missing.length) {
            missing.sort();
            for (const word of missing) console.log(`      ✗ ${word}`);
        } else {
            console.log('   ✓ Đủ toàn bộ.');
        }
    }

    // Gợi ý lệnh generate bù cho các từ thiếu (gộp mọi variant)
    const allMissing = new Set();
    for (const id of Object.keys(missingByVariant)) {
        for (const w of missingByVariant[id]) allMissing.add(w);
    }

    console.log('\n============================================================');
    if (!allMissing.size) {
        console.log(' ✓ Không có từ nào thiếu file Edge. Tất cả đồng nhất giọng.');
    } else {
        console.log(` ⚠ Tổng ${allMissing.size} từ (duy nhất) thiếu file Edge.`);
        const onlyList = Array.from(allMissing).join(',');
        const variantIds = variants.map((v) => v.id).join(',');
        console.log('\n Chạy lệnh sau để generate bù (Edge keyless, không cần key):');
        console.log(`   node scripts/tts/generate-audio.js --provider edge --variant ${variantIds} --only "${onlyList}" --manifest`);
    }
    console.log('============================================================');
}

main();
