/**
 * Thống kê số từ vựng trong seed files mà app thực sự nạp.
 *
 * Sau khi hợp nhất nguồn seed (phương án "một nguồn duy nhất"), repo chỉ còn
 * MỘT thư mục seed: packages/shell/public/seed-vocabulary/ — đây chính là bộ
 * 3623 thẻ mà app load & deploy.
 *
 * Script này chỉ tính đúng 43 topic app nạp (theo VocabularyPage._seedTopics),
 * KHÔNG quét rộng các file phụ trợ nếu có.
 *
 * Chạy: node docs/audit-vocabulary-seeds.js
 */

const fs = require('fs');
const path = require('path');

// Thư mục seed duy nhất app nạp & deploy.
const SEED_DIR = path.join(__dirname, '..', 'packages', 'shell', 'public', 'seed-vocabulary');

// Danh sách file seed app thực sự nạp — đồng bộ với
// packages/english/src/pages/vocabulary.js (_seedTopics).
const SEED_FILES = [
    'family-relationships.json',
    'daily-life.json',
    'home-living.json',
    'food-drink.json',
    'daily-activities.json',
    'health.json',
    'communication-social.json',
    'media-entertainment.json',
    'sports.json',
    'travel.json',
    'personal-qualities.json',
    'emotion-feelings.json',
    'education.json',
    'psychology.json',
    'culture.json',
    'arts.json',
    'literature-reading.json',
    'science.json',
    'mathematics.json',
    'biology.json',
    'chemistry.json',
    'physics.json',
    'information-technology.json',
    'space.json',
    'environment-climate.json',
    'energy-resources.json',
    'economy.json',
    'finance.json',
    'investment.json',
    'business.json',
    'law.json',
    'crime.json',
    'politics.json',
    'employment.json',
    'urbanization.json',
    'history-archeology.json',
    'idioms.json',
    'irregular-verb-v1.json',
    'irregular-verb-v2.json',
    'irregular-verb-v3.json',
    'irregular-comparative.json',
    'irregular-superlative.json',
    'phrasal-verbs.json'
];

function getCardCount(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
        const data = JSON.parse(content);

        if (Array.isArray(data)) return data.length;
        if (data && data.cards && Array.isArray(data.cards)) return data.cards.length;
        if (data && data._meta && typeof data._meta.totalCards === 'number') return data._meta.totalCards;
        return 0;
    } catch (error) {
        return null; // null = lỗi đọc/parse (phân biệt với file 0 card)
    }
}

function auditVocabularySeeds() {
    console.log('🔍 Thống kê từ vựng từ seed files (nguồn app nạp)...\n');
    console.log(`📂 Thư mục: packages/shell/public/seed-vocabulary\n`);

    if (!fs.existsSync(SEED_DIR)) {
        console.error('❌ Không tìm thấy thư mục seed:', SEED_DIR);
        process.exit(1);
    }

    const stats = {};
    let totalWords = 0;
    const missing = [];

    for (const file of SEED_FILES) {
        const filePath = path.join(SEED_DIR, file);
        const topicName = file.replace('.json', '');

        if (!fs.existsSync(filePath)) {
            missing.push(file);
            continue;
        }

        const count = getCardCount(filePath);
        if (count === null) {
            console.warn(`⚠️  Lỗi đọc/parse: ${file}`);
            continue;
        }

        stats[topicName] = count;
        totalWords += count;
    }

    // Bảng thống kê (sắp xếp giảm dần theo số thẻ)
    const sortedTopics = Object.entries(stats).sort((a, b) => b[1] - a[1]);

    console.log('📊 THỐNG KÊ TỪ VỰNG THEO TOPIC\n');
    console.log('┌─ Topic'.padEnd(45) + '│ Cards');
    console.log('├' + '─'.repeat(43) + '┼──────');

    sortedTopics.forEach(([topic, count]) => {
        console.log('  ' + topic.padEnd(42) + '│ ' + count);
    });

    console.log('├' + '─'.repeat(43) + '┼──────');
    console.log('  TỔNG'.padEnd(45) + '│ ' + totalWords);
    console.log('└' + '─'.repeat(43) + '┴──────');

    // Cảnh báo file thiếu
    if (missing.length > 0) {
        console.log('\n' + '='.repeat(70));
        console.log('❌ THIẾU FILE SEED (khai báo trong _seedTopics nhưng không tồn tại)');
        console.log('='.repeat(70));
        missing.forEach(f => console.log(`   - ${f}`));
    }

    // Tóm tắt
    console.log('\n' + '='.repeat(70));
    console.log('📈 TÓM TẮT');
    console.log('='.repeat(70));
    console.log(`\n✅ Tổng topics app nạp: ${SEED_FILES.length}`);
    console.log(`📊 Topics đọc được: ${sortedTopics.length}`);
    console.log(`📚 Tổng từ vựng (app nạp): ${totalWords}`);
    if (missing.length > 0) console.log(`❌ File thiếu: ${missing.length}`);

    // Lưu kết quả
    const result = {
        timestamp: new Date().toISOString(),
        seedDir: 'packages/shell/public/seed-vocabulary',
        totalTopics: SEED_FILES.length,
        totalWords,
        missing,
        stats: Object.fromEntries(sortedTopics)
    };

    const resultPath = path.join(__dirname, 'audit-vocabulary-seeds-result.json');
    fs.writeFileSync(resultPath, JSON.stringify(result, null, 2));

    console.log(`\n💾 Kết quả lưu tại: ${resultPath}`);
    console.log('\n✅ Hoàn thành!');

    return result;
}

auditVocabularySeeds();
