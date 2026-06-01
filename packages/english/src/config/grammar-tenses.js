// ============================================
// Grammar Tenses - Cấu hình 12 thì + nội dung học
// ============================================
// Song song với vocabulary-topics.js: mỗi thì = 1 "folder".
// - GrammarTenses: danh sách 12 thì (metadata để render grid).
// - GrammarTenseContent: nội dung học chi tiết theo id (thì nào chưa có → undefined).
// Thì đánh dấu ielts=true là bộ thì dùng chính trong IELTS Writing.

const GrammarTenses = [
    { id: 'present-simple',              nameVi: 'Hiện tại đơn',                     nameEn: 'Present Simple',              ielts: true,  icon: 'wb_sunny',           order: 1 },
    { id: 'present-continuous',          nameVi: 'Hiện tại tiếp diễn',               nameEn: 'Present Continuous',          ielts: false, icon: 'sync',               order: 2 },
    { id: 'present-perfect',             nameVi: 'Hiện tại hoàn thành',              nameEn: 'Present Perfect',             ielts: true,  icon: 'done_all',           order: 3 },
    { id: 'present-perfect-continuous',  nameVi: 'Hiện tại hoàn thành tiếp diễn',    nameEn: 'Present Perfect Continuous',  ielts: false, icon: 'autorenew',          order: 4 },
    { id: 'past-simple',                 nameVi: 'Quá khứ đơn',                      nameEn: 'Past Simple',                 ielts: true,  icon: 'history',            order: 5 },
    { id: 'past-continuous',             nameVi: 'Quá khứ tiếp diễn',                nameEn: 'Past Continuous',             ielts: false, icon: 'restore',            order: 6 },
    { id: 'past-perfect',                nameVi: 'Quá khứ hoàn thành',               nameEn: 'Past Perfect',                ielts: false, icon: 'history_toggle_off', order: 7 },
    { id: 'past-perfect-continuous',     nameVi: 'Quá khứ hoàn thành tiếp diễn',     nameEn: 'Past Perfect Continuous',     ielts: false, icon: 'update',             order: 8 },
    { id: 'future-simple',               nameVi: 'Tương lai đơn',                    nameEn: 'Future Simple',               ielts: true,  icon: 'trending_flat',      order: 9 },
    { id: 'future-continuous',           nameVi: 'Tương lai tiếp diễn',              nameEn: 'Future Continuous',           ielts: false, icon: 'fast_forward',       order: 10 },
    { id: 'future-perfect',              nameVi: 'Tương lai hoàn thành',             nameEn: 'Future Perfect',              ielts: false, icon: 'skip_next',          order: 11 },
    { id: 'future-perfect-continuous',   nameVi: 'Tương lai hoàn thành tiếp diễn',   nameEn: 'Future Perfect Continuous',   ielts: false, icon: 'double_arrow',       order: 12 }
];

// Nội dung học chi tiết. Mỗi thì có thể có các khối: formula (công thức ráp câu),
// spelling (mẹo chia -s/-es). Các khối "Cách dùng" / "Bài tập" để thảo luận sau.
const GrammarTenseContent = {
    'present-simple': {
        formula: {
            note: 'Thì hiện tại đơn chia làm 2 nhóm động từ: <b>động từ thường</b> và <b>động từ to be</b>. Mỗi nhóm có 3 dạng câu.',
            groups: [
                {
                    label: 'Động từ thường',
                    sub: 'ordinary verbs',
                    sentences: [
                        { kind: 'Khẳng định', sign: '+', formula: 'S + V(nguyên thể)<br><small>thêm <b>s/es</b> nếu chủ ngữ là He / She / It</small>', examples: ['They <b>work</b> every day.', 'She <b>works</b> every day.'] },
                        { kind: 'Phủ định',   sign: '−', formula: 'S + do/does + not + V(nguyên thể)', examples: ['They <b>don\'t work</b> today.', 'She <b>doesn\'t work</b> today.'] },
                        { kind: 'Nghi vấn',   sign: '?', formula: 'Do/Does + S + V(nguyên thể)?', examples: ['<b>Do</b> they <b>work</b> here?', '<b>Does</b> she <b>work</b> here?'] }
                    ],
                    subject: {
                        headers: ['Chủ ngữ', 'Động từ (khẳng định)', 'Trợ động từ'],
                        rows: [
                            ['I / You / We / They', 'V (nguyên thể)', 'do'],
                            ['He / She / It', 'V + <b>s/es</b>', 'does']
                        ]
                    },
                    note: 'Ở câu phủ định và nghi vấn, động từ chính <b>luôn ở nguyên thể</b> (đã có <code>does</code> gánh phần "số ít"). Viết đúng: <b>She doesn\'t work</b> — KHÔNG phải <i>doesn\'t works</i>.'
                },
                {
                    label: 'Động từ "to be"',
                    sub: 'am / is / are',
                    sentences: [
                        { kind: 'Khẳng định', sign: '+', formula: 'S + am/is/are + ...', examples: ['I <b>am</b> a student.', 'He <b>is</b> late.', 'They <b>are</b> ready.'] },
                        { kind: 'Phủ định',   sign: '−', formula: 'S + am/is/are + not + ...', examples: ['I <b>am not</b> tired.', 'He <b>is not</b> late.', 'They <b>are not</b> ready.'] },
                        { kind: 'Nghi vấn',   sign: '?', formula: 'Am/Is/Are + S + ...?', examples: ['<b>Am</b> I right?', '<b>Is</b> he late?', '<b>Are</b> they ready?'] }
                    ],
                    subject: {
                        headers: ['Chủ ngữ', 'to be'],
                        rows: [
                            ['I', 'am'],
                            ['He / She / It', 'is'],
                            ['You / We / They', 'are']
                        ]
                    },
                    note: ''
                }
            ],
            contractions: [
                'don\'t = do not',
                'doesn\'t = does not',
                'isn\'t = is not',
                'aren\'t = are not',
                'I\'m = I am',
                'he\'s / she\'s / it\'s = he/she/it is',
                'you\'re / we\'re / they\'re = ... are'
            ]
        },
        spelling: {
            intro: 'Chỉ áp dụng khi chủ ngữ là <b>He / She / It</b> (hoặc danh từ số ít) ở câu khẳng định với động từ thường.',
            rows: [
                { case: 'Hầu hết động từ', rule: '+ s', example: 'work → work<b>s</b>, read → read<b>s</b>, sleep → sleep<b>s</b>' },
                { case: 'Tận cùng -o, -s, -ss, -sh, -ch, -x, -z', rule: '+ es', example: 'go → go<b>es</b>, kiss → kiss<b>es</b>, wash → wash<b>es</b>, watch → watch<b>es</b>, fix → fix<b>es</b>' },
                { case: 'Phụ âm + y', rule: 'đổi y → i rồi + es', example: 'study → stud<b>ies</b>, fly → fl<b>ies</b>, carry → carr<b>ies</b>' },
                { case: 'Nguyên âm + y', rule: 'giữ nguyên y, + s', example: 'play → play<b>s</b>, buy → buy<b>s</b>, enjoy → enjoy<b>s</b>' }
            ],
            mnemonics: [
                { title: 'Mẹo nhóm "+es"', text: 'Ghi nhớ chuỗi đuôi <b>O – S – SS – SH – CH – X – Z</b>. Động từ tận cùng bằng một trong các đuôi này thì thêm <b>es</b> thay vì chỉ <b>s</b>.' },
                { title: 'Mẹo động từ tận cùng -y', text: 'Nhìn chữ ngay trước -y: nếu là <b>phụ âm</b> → đổi <b>y → ies</b> (study → studies); nếu là <b>nguyên âm</b> → chỉ <b>+ s</b> (play → plays).' }
            ]
        }
    }
};

/**
 * Lấy metadata 1 thì theo id.
 */
function getTense(id) {
    return GrammarTenses.find(t => t.id === id) || null;
}

/**
 * Lấy nội dung học chi tiết của 1 thì (hoặc null nếu chưa có).
 */
function getTenseContent(id) {
    return GrammarTenseContent[id] || null;
}

export { GrammarTenses, GrammarTenseContent, getTense, getTenseContent };
