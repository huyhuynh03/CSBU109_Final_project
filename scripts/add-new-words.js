// ============================================
// add-new-words.js
// Thêm 15 từ mới + gia đình từ vào các file seed phù hợp.
// - Idempotent: nếu từ đã tồn tại trong file thì bỏ qua.
// - Cập nhật _meta.totalCards + _meta.totalFamilies (nếu có).
// - Giữ nguyên định dạng 2-space indent như các file seed hiện có.
//
// CÁC DẠNG ĐÃ TỒN TẠI Ở TOPIC KHÁC (KHÔNG thêm lại), theo audit:
//   association@psychology, lonely@emotion-feelings, recognition@psychology,
//   light@physics, certainly/uncertain/uncertainty, extensively, experiment@physics
// Các từ mới dưới đây vẫn cụm gia đình cùng gốc trong CHÍNH topic của chúng.
// ============================================
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SEED_DIR = path.resolve(__dirname, '../packages/shell/public/seed-vocabulary');

function norm(w) { return String(w || '').trim().toLowerCase(); }

function card(fv) {
    // Đảm bảo thứ tự key nhất quán với schema seed hiện có.
    const out = {
        word: fv.word,
        ipa: fv.ipa,
        partOfSpeech: fv.partOfSpeech,
        difficulty: fv.difficulty || 'intermediate',
        meaning: fv.meaning,
        example: fv.example
    };
    if (fv.note) out.note = fv.note;
    out.familyId = fv.familyId || '';
    out.familyOrder = fv.familyOrder || 1;
    out.tags = fv.tags || [];
    return { fieldValues: out };
}

// Nhóm thẻ mới theo file seed đích.
const ADDITIONS = {
    'psychology.json': [
        card({ word: 'associate', ipa: '/əˈsəʊʃieɪt/', partOfSpeech: 'verb', difficulty: 'intermediate',
            meaning: 'liên hệ, liên tưởng; kết giao', example: 'We tend to associate certain smells with childhood memories.',
            familyId: 'associate', familyOrder: 1 }),
        card({ word: 'associated', ipa: '/əˈsəʊʃieɪtɪd/', partOfSpeech: 'adjective', difficulty: 'advanced',
            meaning: 'có liên quan, có liên hệ', example: 'There are several risks associated with this treatment.',
            familyId: 'associate', familyOrder: 2 }),
        card({ word: 'recognize', ipa: '/ˈrekəɡnaɪz/', partOfSpeech: 'verb', difficulty: 'intermediate',
            meaning: 'nhận ra, công nhận', example: "I didn't recognize her after all these years.",
            familyId: 'recognize', familyOrder: 1 }),
        card({ word: 'recognizable', ipa: '/ˈrekəɡnaɪzəbl/', partOfSpeech: 'adjective', difficulty: 'advanced',
            meaning: 'dễ nhận ra, có thể nhận biết', example: 'His voice is instantly recognizable.',
            familyId: 'recognize', familyOrder: 2 })
    ],
    'emotion-feelings.json': [
        card({ word: 'loneliness', ipa: '/ˈləʊnlinəs/', partOfSpeech: 'noun', difficulty: 'advanced',
            meaning: 'sự cô đơn, nỗi cô đơn', example: 'She felt a deep sense of loneliness after moving abroad.',
            familyId: 'lonely', familyOrder: 2 })
    ],
    'communication-social.json': [
        card({ word: 'acknowledge', ipa: '/əkˈnɒlɪdʒ/', partOfSpeech: 'verb', difficulty: 'intermediate',
            meaning: 'thừa nhận, công nhận; xác nhận', example: 'She acknowledged that she had made a mistake.',
            familyId: 'acknowledge', familyOrder: 1 }),
        card({ word: 'acknowledgement', ipa: '/əkˈnɒlɪdʒmənt/', partOfSpeech: 'noun', difficulty: 'advanced',
            meaning: 'sự thừa nhận, sự xác nhận', example: 'He nodded in acknowledgement of her help.',
            familyId: 'acknowledge', familyOrder: 2 })
    ],
    'politics.json': [
        card({ word: 'merit', ipa: '/ˈmerɪt/', partOfSpeech: 'noun', difficulty: 'intermediate',
            meaning: 'giá trị, ưu điểm; công trạng', example: 'Each proposal was judged on its own merit.',
            familyId: 'merit', familyOrder: 1 }),
        card({ word: 'meritocratic', ipa: '/ˌmerɪtəˈkrætɪk/', partOfSpeech: 'adjective', difficulty: 'advanced',
            meaning: 'thuộc chế độ trọng dụng nhân tài', example: 'The company promotes a meritocratic culture.',
            familyId: 'merit', familyOrder: 2 }),
        card({ word: 'meritocracy', ipa: '/ˌmerɪˈtɒkrəsi/', partOfSpeech: 'noun', difficulty: 'advanced',
            meaning: 'chế độ trọng dụng nhân tài', example: 'They believe society should be a meritocracy based on talent and effort.',
            familyId: 'merit', familyOrder: 3 })
    ],
    'personal-qualities.json': [
        card({ word: 'weird', ipa: '/wɪəd/', partOfSpeech: 'adjective', difficulty: 'intermediate',
            meaning: 'kỳ lạ, kỳ quái', example: 'It felt weird to be back at my old school.',
            familyId: 'weird', familyOrder: 1 }),
        card({ word: 'weirdly', ipa: '/ˈwɪədli/', partOfSpeech: 'adverb', difficulty: 'advanced',
            meaning: 'một cách kỳ lạ', example: 'The house was weirdly quiet that night.',
            familyId: 'weird', familyOrder: 2 }),
        card({ word: 'weirdness', ipa: '/ˈwɪədnəs/', partOfSpeech: 'noun', difficulty: 'advanced',
            meaning: 'sự kỳ lạ, tính kỳ quái', example: 'There was a certain weirdness to the whole situation.',
            familyId: 'weird', familyOrder: 3 })
    ],
    'daily-life.json': [
        card({ word: 'certain', ipa: '/ˈsɜːtn/', partOfSpeech: 'adjective', difficulty: 'intermediate',
            meaning: 'chắc chắn; nào đó', example: "I'm certain that I locked the door.",
            familyId: 'certain', familyOrder: 1 }),
        card({ word: 'certainty', ipa: '/ˈsɜːtnti/', partOfSpeech: 'noun', difficulty: 'advanced',
            meaning: 'sự chắc chắn, điều chắc chắn', example: 'There is no certainty that prices will fall.',
            familyId: 'certain', familyOrder: 2 }),
        card({ word: 'lighten', ipa: '/ˈlaɪtn/', partOfSpeech: 'verb', difficulty: 'intermediate',
            meaning: 'làm sáng lên; làm nhẹ bớt', example: 'A few jokes helped to lighten the mood.',
            familyId: 'lighten', familyOrder: 1 }),
        card({ word: 'lightening', ipa: '/ˈlaɪtnɪŋ/', partOfSpeech: 'noun', difficulty: 'advanced',
            meaning: 'sự làm sáng lên; sự làm nhẹ bớt',
            example: 'The lightening of her mood was obvious to everyone.',
            note: 'Lightening (làm sáng/nhẹ hơn) khác với lightning (tia chớp, sét).',
            familyId: 'lighten', familyOrder: 2 })
    ],
    'business.json': [
        card({ word: 'extent', ipa: '/ɪkˈstent/', partOfSpeech: 'noun', difficulty: 'intermediate',
            meaning: 'mức độ, phạm vi', example: 'To some extent, I agree with you.',
            familyId: 'extend', familyOrder: 1 }),
        card({ word: 'extend', ipa: '/ɪkˈstend/', partOfSpeech: 'verb', difficulty: 'intermediate',
            meaning: 'mở rộng, kéo dài; gia hạn', example: 'They decided to extend the deadline by a week.',
            familyId: 'extend', familyOrder: 2 }),
        card({ word: 'extension', ipa: '/ɪkˈstenʃn/', partOfSpeech: 'noun', difficulty: 'advanced',
            meaning: 'sự mở rộng; sự gia hạn; phần mở rộng', example: 'We applied for an extension of the contract.',
            familyId: 'extend', familyOrder: 3 }),
        card({ word: 'extensive', ipa: '/ɪkˈstensɪv/', partOfSpeech: 'adjective', difficulty: 'advanced',
            meaning: 'rộng rãi, sâu rộng, quy mô lớn', example: 'The report is based on extensive research.',
            familyId: 'extend', familyOrder: 4 }),
        card({ word: 'guarantee', ipa: '/ˌɡærənˈtiː/', partOfSpeech: 'noun', difficulty: 'intermediate',
            meaning: 'sự đảm bảo, sự bảo hành; đảm bảo', example: 'The product comes with a two-year guarantee.',
            familyId: 'guarantee', familyOrder: 1 }),
        card({ word: 'guaranteed', ipa: '/ˌɡærənˈtiːd/', partOfSpeech: 'adjective', difficulty: 'advanced',
            meaning: 'được đảm bảo, chắc chắn', example: 'Success is not guaranteed, even with hard work.',
            familyId: 'guarantee', familyOrder: 2 })
    ],
    'physics.json': [
        card({ word: 'cog', ipa: '/kɒɡ/', partOfSpeech: 'noun', difficulty: 'advanced',
            meaning: 'bánh răng cưa', example: 'Each cog in the machine must turn smoothly.',
            familyId: 'cog', familyOrder: 1 }),
        card({ word: 'experimentation', ipa: '/ɪkˌsperɪmenˈteɪʃn/', partOfSpeech: 'noun', difficulty: 'advanced',
            meaning: 'sự thử nghiệm, sự thí nghiệm', example: 'Scientific progress depends on constant experimentation.',
            familyId: 'experiment', familyOrder: 2 }),
        card({ word: 'experimental', ipa: '/ɪkˌsperɪˈmentl/', partOfSpeech: 'adjective', difficulty: 'advanced',
            meaning: 'mang tính thử nghiệm, thực nghiệm', example: 'The drug is still at an experimental stage.',
            familyId: 'experiment', familyOrder: 3 })
    ],
    'information-technology.json': [
        card({ word: 'drone', ipa: '/drəʊn/', partOfSpeech: 'noun', difficulty: 'intermediate',
            meaning: 'máy bay không người lái, thiết bị bay điều khiển từ xa',
            example: 'The company uses drones to deliver small packages.',
            familyId: 'drone', familyOrder: 1 })
    ],
    'employment.json': [
        card({ word: 'cubicle', ipa: '/ˈkjuːbɪkl/', partOfSpeech: 'noun', difficulty: 'advanced',
            meaning: 'ngăn làm việc, buồng nhỏ', example: 'She spends eight hours a day in a small office cubicle.',
            familyId: 'cubicle', familyOrder: 1 })
    ],
    'media-entertainment.json': [
        card({ word: 'mystery', ipa: '/ˈmɪstri/', partOfSpeech: 'noun', difficulty: 'intermediate',
            meaning: 'điều bí ẩn, sự huyền bí', example: 'The cause of the fire remains a mystery.',
            familyId: 'mystery', familyOrder: 1 }),
        card({ word: 'mysterious', ipa: '/mɪˈstɪəriəs/', partOfSpeech: 'adjective', difficulty: 'advanced',
            meaning: 'bí ẩn, huyền bí', example: 'A mysterious stranger appeared at the door.',
            familyId: 'mystery', familyOrder: 2 }),
        card({ word: 'mysteriously', ipa: '/mɪˈstɪəriəsli/', partOfSpeech: 'adverb', difficulty: 'advanced',
            meaning: 'một cách bí ẩn', example: 'The documents mysteriously disappeared overnight.',
            familyId: 'mystery', familyOrder: 3 })
    ]
};

function main() {
    let totalAdded = 0;
    let totalSkipped = 0;

    for (const [file, newCards] of Object.entries(ADDITIONS)) {
        const fp = path.join(SEED_DIR, file);
        if (!fs.existsSync(fp)) {
            console.log(`✗ KHÔNG tìm thấy file: ${file}`);
            continue;
        }
        const data = JSON.parse(fs.readFileSync(fp, 'utf8'));
        if (!Array.isArray(data.cards)) {
            console.log(`✗ ${file}: không có mảng cards.`);
            continue;
        }

        const existing = new Set(data.cards.map(c => norm(c?.fieldValues?.word)));
        const familyIdsBefore = new Set(
            data.cards.map(c => c?.fieldValues?.familyId).filter(Boolean)
        );

        const added = [];
        for (const nc of newCards) {
            const w = norm(nc.fieldValues.word);
            if (existing.has(w)) {
                console.log(`  - bỏ qua (đã có): ${nc.fieldValues.word} @${file}`);
                totalSkipped++;
                continue;
            }
            data.cards.push(nc);
            existing.add(w);
            added.push(nc.fieldValues.word);
        }

        if (added.length === 0) {
            console.log(`= ${file}: không có gì để thêm.`);
            continue;
        }

        // Cập nhật _meta nếu có.
        if (data._meta) {
            if (typeof data._meta.totalCards === 'number') {
                data._meta.totalCards = data.cards.length;
            }
            if (typeof data._meta.totalFamilies === 'number') {
                const fam = new Set(
                    data.cards.map(c => c?.fieldValues?.familyId).filter(Boolean)
                );
                data._meta.totalFamilies = fam.size;
            }
        }

        fs.writeFileSync(fp, JSON.stringify(data, null, 2) + '\n', 'utf8');
        totalAdded += added.length;
        console.log(`✓ ${file}: +${added.length} thẻ [${added.join(', ')}] (tổng ${data.cards.length})`);
    }

    console.log('\n======================================================================');
    console.log(`### KẾT QUẢ: đã thêm ${totalAdded} thẻ, bỏ qua ${totalSkipped} thẻ (đã tồn tại). ###`);
    console.log('======================================================================');
}

main();
