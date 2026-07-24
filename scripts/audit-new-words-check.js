// ============================================
// Audit: kiểm tra 15 từ mới + gia đình từ có trùng với kho seed hiện có không
// Chạy: node scripts/audit-new-words-check.js
// ============================================
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SEED_DIR = path.resolve(__dirname, '../packages/shell/public/seed-vocabulary');

// Chuẩn hoá từ: lowercase, bỏ khoảng trắng thừa
function norm(w) {
    return String(w || '').trim().toLowerCase();
}

// Đọc toàn bộ từ vựng hiện có từ tất cả file seed
function loadExistingWords() {
    const files = fs.readdirSync(SEED_DIR).filter(f => f.endsWith('.json'));
    // map: normWord -> [{ topicId, file, word, partOfSpeech }]
    const index = new Map();
    let totalCards = 0;

    for (const file of files) {
        const full = path.join(SEED_DIR, file);
        let data;
        try {
            data = JSON.parse(fs.readFileSync(full, 'utf8'));
        } catch (e) {
            console.error(`[SKIP] Không parse được ${file}: ${e.message}`);
            continue;
        }
        const topicId = data?._meta?.topicId || file.replace(/\.json$/, '');
        const cards = Array.isArray(data?.cards) ? data.cards : [];
        for (const c of cards) {
            const fv = c.fieldValues || {};
            const w = norm(fv.word);
            if (!w) continue;
            totalCards++;
            if (!index.has(w)) index.set(w, []);
            index.get(w).push({
                topicId,
                file,
                word: fv.word,
                partOfSpeech: fv.partOfSpeech || '',
                baseForm: fv.baseForm || ''
            });
        }
    }
    return { index, totalCards, fileCount: files.length };
}

// ============================================
// 15 từ mục tiêu + gia đình từ dự kiến (word family)
// Mỗi entry: từ gốc user yêu cầu + các dạng phái sinh cùng gốc
// ============================================
const TARGETS = [
    { base: 'associate', family: ['associate', 'association', 'associated', 'associative'] },
    { base: 'loneliness', family: ['loneliness', 'lonely', 'lone', 'loner'] },
    { base: 'acknowledge', family: ['acknowledge', 'acknowledgement', 'acknowledgment', 'acknowledged'] },
    { base: 'recognize', family: ['recognize', 'recognise', 'recognition', 'recognizable', 'recognized'] },
    { base: 'meritocracy', family: ['meritocracy', 'meritocratic', 'merit'] },
    { base: 'lightening', family: ['lightening', 'lighten', 'light', 'lightning'] },
    { base: 'weird', family: ['weird', 'weirdly', 'weirdness', 'weirdo'] },
    { base: 'certain', family: ['certain', 'certainly', 'certainty', 'uncertain', 'uncertainty'] },
    { base: 'extent', family: ['extent', 'extend', 'extension', 'extensive', 'extensively'] },
    { base: 'drone', family: ['drone', 'drones'] },
    { base: 'cog', family: ['cog', 'cogs'] },
    { base: 'experimentation', family: ['experimentation', 'experiment', 'experimental', 'experimentally'] },
    { base: 'cubicle', family: ['cubicle', 'cubicles'] },
    { base: 'mysteriously', family: ['mysteriously', 'mysterious', 'mystery', 'mysteries'] },
    { base: 'guaranteed', family: ['guaranteed', 'guarantee', 'guarantees', 'guaranteeing'] }
];

function main() {
    const { index, totalCards, fileCount } = loadExistingWords();
    console.log('='.repeat(70));
    console.log(`Đã quét ${fileCount} file seed, tổng ${totalCards} thẻ từ vựng.`);
    console.log('='.repeat(70));

    const report = [];
    for (const t of TARGETS) {
        const baseExists = index.has(norm(t.base));
        const familyHits = [];
        for (const fw of t.family) {
            const hits = index.get(norm(fw));
            if (hits && hits.length) {
                familyHits.push({ word: fw, hits });
            }
        }
        report.push({ base: t.base, family: t.family, baseExists, familyHits });
    }

    // In báo cáo chi tiết
    console.log('\n### CHI TIẾT RÀ SOÁT ###\n');
    for (const r of report) {
        const status = r.baseExists ? 'ĐÃ CÓ' : 'CHƯA CÓ';
        console.log(`\n▶ ${r.base.toUpperCase()}  → từ gốc: ${status}`);
        if (r.familyHits.length) {
            console.log(`  Các dạng gia đình từ đã tồn tại trong kho:`);
            for (const fh of r.familyHits) {
                const locs = fh.hits.map(h => `${h.word}[${h.partOfSpeech}]@${h.topicId}`).join(', ');
                console.log(`    - "${fh.word}": ${locs}`);
            }
        } else {
            console.log(`  Chưa có dạng nào của gia đình từ này trong kho.`);
        }
    }

    // Tổng kết
    console.log('\n' + '='.repeat(70));
    console.log('### TỔNG KẾT ###');
    const baseMissing = report.filter(r => !r.baseExists).map(r => r.base);
    const baseDup = report.filter(r => r.baseExists).map(r => r.base);
    console.log(`\nTừ GỐC đã có (không cần thêm): ${baseDup.length ? baseDup.join(', ') : '(không)'}`);
    console.log(`\nTừ GỐC chưa có (cần thêm): ${baseMissing.length ? baseMissing.join(', ') : '(không)'}`);

    console.log('\nGia đình từ - các dạng ĐÃ tồn tại (tránh thêm trùng khi tạo family):');
    for (const r of report) {
        if (r.familyHits.length) {
            console.log(`  ${r.base}: ${r.familyHits.map(f => f.word).join(', ')}`);
        }
    }
    console.log('\n' + '='.repeat(70));
}

main();
