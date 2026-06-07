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
        usage: {
            intro: 'Thì hiện tại đơn diễn tả hành động/trạng thái mang tính <b>thường xuyên, lặp lại, hoặc luôn đúng</b> — không gắn với một thời điểm cụ thể nào.',
            items: [
                { title: 'Sự thật hiển nhiên / chân lý khoa học', icon: 'public', examples: ['The Earth <b>revolves</b> around the Sun.', 'Water <b>boils</b> at 100°C.'] },
                { title: 'Thói quen / hành động lặp lại', icon: 'repeat', examples: ['I <b>brush</b> my teeth every morning.', 'She <b>goes</b> to the gym three times a week.'] },
                { title: 'Lịch trình / thời gian biểu cố định', icon: 'event', examples: ['The train <b>leaves</b> at 9 AM tomorrow.', 'The meeting <b>starts</b> at 2 PM.'] },
                { title: 'Trạng thái, cảm xúc, sở hữu (stative verbs)', icon: 'favorite', examples: ['She <b>loves</b> music.', 'I <b>have</b> two cats.', 'He <b>knows</b> the answer.'] },
                { title: 'Hướng dẫn, chỉ dẫn, công thức nấu ăn', icon: 'directions', examples: ['You <b>turn</b> left at the corner.', 'First, you <b>mix</b> the flour and sugar.'] },
                { title: 'Tường thuật thể thao / kể chuyện sinh động', icon: 'sports_soccer', examples: ['He <b>passes</b> the ball to Ronaldo — and he <b>scores</b>!'] }
            ],
            signalWords: {
                label: 'Dấu hiệu nhận biết (signal words)',
                words: ['always', 'usually', 'often', 'sometimes', 'rarely', 'never', 'every day/week/month/year', 'once a week', 'twice a month', 'in the morning/evening']
            }
        },
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
        exercises: [
            // to be - khẳng định
            { id: 1, sentence: 'She ___ a doctor.', answer: 'is', hint: 'to be', kind: 'khẳng định' },
            { id: 2, sentence: 'I ___ happy today.', answer: 'am', hint: 'to be', kind: 'khẳng định' },
            { id: 3, sentence: 'They ___ students at this school.', answer: 'are', hint: 'to be', kind: 'khẳng định' },
            // to be - phủ định
            { id: 4, sentence: 'He ___ not at home right now.', answer: 'is', hint: 'to be', kind: 'phủ định' },
            { id: 5, sentence: 'We ___ not tired after the trip.', answer: 'are', hint: 'to be', kind: 'phủ định' },
            // to be - nghi vấn
            { id: 6, sentence: '___ you ready for the exam?', answer: 'Are', hint: 'to be', kind: 'nghi vấn' },
            { id: 7, sentence: '___ it cold outside?', answer: 'Is', hint: 'to be', kind: 'nghi vấn' },
            // chia động từ - khẳng định (he/she/it + s/es)
            { id: 8, sentence: 'She ___ (go) to school every day.', answer: 'goes', hint: 'chia động từ', kind: 'khẳng định' },
            { id: 9, sentence: 'He ___ (watch) TV every evening.', answer: 'watches', hint: 'chia động từ', kind: 'khẳng định' },
            { id: 10, sentence: 'My mother ___ (cook) dinner at 7 PM.', answer: 'cooks', hint: 'chia động từ', kind: 'khẳng định' },
            { id: 11, sentence: 'The baby ___ (cry) every night.', answer: 'cries', hint: 'chia động từ', kind: 'khẳng định' },
            { id: 12, sentence: 'Tom ___ (play) guitar very well.', answer: 'plays', hint: 'chia động từ', kind: 'khẳng định' },
            { id: 13, sentence: 'She ___ (study) English on Mondays.', answer: 'studies', hint: 'chia động từ', kind: 'khẳng định' },
            { id: 14, sentence: 'Water ___ (freeze) at 0°C.', answer: 'freezes', hint: 'chia động từ', kind: 'khẳng định' },
            // trợ động từ - phủ định
            { id: 15, sentence: 'They ___ not like coffee.', answer: 'do', hint: 'trợ động từ', kind: 'phủ định' },
            { id: 16, sentence: 'She ___ not work on Sundays.', answer: 'does', hint: 'trợ động từ', kind: 'phủ định' },
            { id: 17, sentence: 'I ___ not understand this question.', answer: 'do', hint: 'trợ động từ', kind: 'phủ định' },
            { id: 18, sentence: 'He ___ not eat meat.', answer: 'does', hint: 'trợ động từ', kind: 'phủ định' },
            // trợ động từ - nghi vấn
            { id: 19, sentence: '___ he speak French?', answer: 'Does', hint: 'trợ động từ', kind: 'nghi vấn' },
            { id: 20, sentence: '___ they live in London?', answer: 'Do', hint: 'trợ động từ', kind: 'nghi vấn' }
        ],
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
    },
    'present-continuous': {
        usage: {
            intro: 'Thì hiện tại tiếp diễn diễn tả hành động <b>đang xảy ra ngay lúc nói</b> hoặc <b>xung quanh thời điểm hiện tại</b>.',
            items: [
                { title: 'Hành động đang xảy ra ngay lúc nói', icon: 'visibility', examples: ['She <b>is reading</b> a book right now.', 'Look! The baby <b>is crying</b>.'] },
                { title: 'Hành động tạm thời xung quanh hiện tại', icon: 'hourglass_top', examples: ['I <b>am staying</b> with my friend this week.', 'He <b>is working</b> on a new project these days.'] },
                { title: 'Kế hoạch đã sắp xếp trong tương lai gần', icon: 'event_available', examples: ['We <b>are meeting</b> them tomorrow.', 'She <b>is flying</b> to Paris next Monday.'] },
                { title: 'Sự thay đổi / xu hướng đang diễn ra', icon: 'trending_up', examples: ['The weather <b>is getting</b> colder.', 'More people <b>are using</b> electric cars.'] },
                { title: 'Phàn nàn với "always" (hành động lặp lại gây khó chịu)', icon: 'sentiment_dissatisfied', examples: ['He <b>is always losing</b> his keys!', 'You <b>are always complaining</b>!'] }
            ],
            signalWords: { label: 'Dấu hiệu nhận biết', words: ['now', 'right now', 'at the moment', 'currently', 'today', 'this week/month', 'Look!', 'Listen!', 'still'] }
        },
        formula: {
            note: 'Dùng trợ động từ <b>am/is/are</b> + <b>V-ing</b>.',
            groups: [
                {
                    label: 'Tất cả động từ',
                    sub: 'am/is/are + V-ing',
                    sentences: [
                        { kind: 'Khẳng định', sign: '+', formula: 'S + am/is/are + V-ing', examples: ['I <b>am studying</b>.', 'She <b>is cooking</b>.', 'They <b>are playing</b>.'] },
                        { kind: 'Phủ định', sign: '−', formula: 'S + am/is/are + not + V-ing', examples: ['I <b>am not sleeping</b>.', 'He <b>is not working</b>.'] },
                        { kind: 'Nghi vấn', sign: '?', formula: 'Am/Is/Are + S + V-ing?', examples: ['<b>Are</b> you <b>listening</b>?', '<b>Is</b> she <b>coming</b>?'] }
                    ],
                    subject: { headers: ['Chủ ngữ', 'to be'], rows: [['I', 'am'], ['He / She / It', 'is'], ['You / We / They', 'are']] },
                    note: 'Một số động từ trạng thái (stative verbs) <b>không dùng</b> ở tiếp diễn: know, believe, love, hate, want, need, prefer, understand.'
                }
            ],
            contractions: ['isn\'t = is not', 'aren\'t = are not', 'I\'m = I am', 'he\'s = he is', 'they\'re = they are']
        },
        exercises: [
            { id: 1, sentence: 'She ___ (read) a book now.', answer: 'is reading', hint: 'V-ing', kind: 'khẳng định' },
            { id: 2, sentence: 'I ___ (wait) for the bus at the moment.', answer: 'am waiting', hint: 'V-ing', kind: 'khẳng định' },
            { id: 3, sentence: 'They ___ (play) football in the park.', answer: 'are playing', hint: 'V-ing', kind: 'khẳng định' },
            { id: 4, sentence: 'He ___ (not/work) today.', answer: 'is not working', hint: 'phủ định', kind: 'phủ định' },
            { id: 5, sentence: 'We ___ (not/watch) TV right now.', answer: 'are not watching', hint: 'phủ định', kind: 'phủ định' },
            { id: 6, sentence: '___ you ___ (listen) to me?', answer: 'Are listening', hint: 'nghi vấn', kind: 'nghi vấn' },
            { id: 7, sentence: '___ it ___ (rain) outside?', answer: 'Is raining', hint: 'nghi vấn', kind: 'nghi vấn' },
            { id: 8, sentence: 'The children ___ (swim) in the pool.', answer: 'are swimming', hint: 'V-ing', kind: 'khẳng định' },
            { id: 9, sentence: 'My sister ___ (study) for her exam this week.', answer: 'is studying', hint: 'V-ing', kind: 'khẳng định' },
            { id: 10, sentence: 'Look! The cat ___ (climb) the tree.', answer: 'is climbing', hint: 'V-ing', kind: 'khẳng định' },
            { id: 11, sentence: 'I ___ (not/eat) anything right now.', answer: 'am not eating', hint: 'phủ định', kind: 'phủ định' },
            { id: 12, sentence: 'She ___ (not/sleep) yet.', answer: 'is not sleeping', hint: 'phủ định', kind: 'phủ định' },
            { id: 13, sentence: '___ he ___ (come) to the party tonight?', answer: 'Is coming', hint: 'nghi vấn', kind: 'nghi vấn' },
            { id: 14, sentence: 'The temperature ___ (rise) every year.', answer: 'is rising', hint: 'xu hướng', kind: 'khẳng định' },
            { id: 15, sentence: 'We ___ (move) to a new house next week.', answer: 'are moving', hint: 'kế hoạch', kind: 'khẳng định' },
            { id: 16, sentence: 'He ___ always ___ (forget) his homework!', answer: 'is forgetting', hint: 'phàn nàn', kind: 'khẳng định' },
            { id: 17, sentence: 'I ___ (learn) Japanese this semester.', answer: 'am learning', hint: 'tạm thời', kind: 'khẳng định' },
            { id: 18, sentence: 'They ___ (not/travel) this month.', answer: 'are not traveling', hint: 'phủ định', kind: 'phủ định' },
            { id: 19, sentence: '___ the students ___ (do) their homework?', answer: 'Are doing', hint: 'nghi vấn', kind: 'nghi vấn' },
            { id: 20, sentence: 'My phone ___ (not/work) properly.', answer: 'is not working', hint: 'phủ định', kind: 'phủ định' }
        ]
    },
    'present-perfect': {
        usage: {
            intro: 'Thì hiện tại hoàn thành diễn tả hành động <b>đã xảy ra trong quá khứ nhưng có kết quả/liên hệ với hiện tại</b>, hoặc hành động bắt đầu trong quá khứ và kéo dài đến nay.',
            items: [
                { title: 'Hành động vừa mới xảy ra (kết quả còn ở hiện tại)', icon: 'new_releases', examples: ['I <b>have just finished</b> my homework.', 'She <b>has lost</b> her keys. (vẫn chưa tìm thấy)'] },
                { title: 'Kinh nghiệm / trải nghiệm (đã từng / chưa từng)', icon: 'explore', examples: ['I <b>have visited</b> Paris twice.', 'He <b>has never eaten</b> sushi.'] },
                { title: 'Hành động bắt đầu trong quá khứ, kéo dài đến hiện tại', icon: 'timelapse', examples: ['We <b>have lived</b> here since 2010.', 'She <b>has worked</b> here for 5 years.'] },
                { title: 'Thay đổi so với trước', icon: 'compare_arrows', examples: ['You <b>have grown</b> so much!', 'The city <b>has changed</b> a lot.'] }
            ],
            signalWords: { label: 'Dấu hiệu nhận biết', words: ['just', 'already', 'yet', 'ever', 'never', 'recently', 'lately', 'since', 'for', 'so far', 'up to now'] }
        },
        formula: {
            note: 'Dùng trợ động từ <b>have/has</b> + <b>V3 (past participle)</b>.',
            groups: [
                {
                    label: 'Tất cả động từ',
                    sub: 'have/has + V3',
                    sentences: [
                        { kind: 'Khẳng định', sign: '+', formula: 'S + have/has + V3', examples: ['I <b>have seen</b> that movie.', 'She <b>has gone</b> home.'] },
                        { kind: 'Phủ định', sign: '−', formula: 'S + have/has + not + V3', examples: ['I <b>have not finished</b> yet.', 'He <b>has not called</b> me.'] },
                        { kind: 'Nghi vấn', sign: '?', formula: 'Have/Has + S + V3?', examples: ['<b>Have</b> you <b>eaten</b> lunch?', '<b>Has</b> she <b>arrived</b>?'] }
                    ],
                    subject: { headers: ['Chủ ngữ', 'Trợ động từ'], rows: [['I / You / We / They', 'have'], ['He / She / It', 'has']] },
                    note: 'V3 = past participle. Động từ có quy tắc: V + ed. Bất quy tắc: phải học thuộc (gone, seen, eaten...).'
                }
            ],
            contractions: ['haven\'t = have not', 'hasn\'t = has not', 'I\'ve = I have', 'he\'s = he has', 'they\'ve = they have']
        },
        exercises: [
            { id: 1, sentence: 'I ___ (see) that movie before.', answer: 'have seen', hint: 'have/has + V3', kind: 'khẳng định' },
            { id: 2, sentence: 'She ___ (live) here since 2015.', answer: 'has lived', hint: 'have/has + V3', kind: 'khẳng định' },
            { id: 3, sentence: 'They ___ (finish) their project.', answer: 'have finished', hint: 'have/has + V3', kind: 'khẳng định' },
            { id: 4, sentence: 'He ___ (not/eat) anything today.', answer: 'has not eaten', hint: 'phủ định', kind: 'phủ định' },
            { id: 5, sentence: 'We ___ (not/visit) that museum yet.', answer: 'have not visited', hint: 'phủ định', kind: 'phủ định' },
            { id: 6, sentence: '___ you ever ___ (be) to Japan?', answer: 'Have been', hint: 'nghi vấn', kind: 'nghi vấn' },
            { id: 7, sentence: '___ she ___ (call) you back?', answer: 'Has called', hint: 'nghi vấn', kind: 'nghi vấn' },
            { id: 8, sentence: 'I ___ just ___ (arrive) home.', answer: 'have arrived', hint: 'just', kind: 'khẳng định' },
            { id: 9, sentence: 'He ___ already ___ (leave).', answer: 'has left', hint: 'already', kind: 'khẳng định' },
            { id: 10, sentence: 'We ___ (know) each other for 10 years.', answer: 'have known', hint: 'for', kind: 'khẳng định' },
            { id: 11, sentence: 'She ___ (not/reply) to my email yet.', answer: 'has not replied', hint: 'phủ định', kind: 'phủ định' },
            { id: 12, sentence: 'I ___ (not/decide) yet.', answer: 'have not decided', hint: 'phủ định', kind: 'phủ định' },
            { id: 13, sentence: '___ they ___ (arrive) at the hotel?', answer: 'Have arrived', hint: 'nghi vấn', kind: 'nghi vấn' },
            { id: 14, sentence: 'The city ___ (change) a lot recently.', answer: 'has changed', hint: 'recently', kind: 'khẳng định' },
            { id: 15, sentence: 'I ___ never ___ (fly) in a helicopter.', answer: 'have flown', hint: 'never', kind: 'khẳng định' },
            { id: 16, sentence: 'She ___ (write) three books so far.', answer: 'has written', hint: 'so far', kind: 'khẳng định' },
            { id: 17, sentence: 'We ___ (not/hear) from him lately.', answer: 'have not heard', hint: 'phủ định', kind: 'phủ định' },
            { id: 18, sentence: '___ he ___ (pass) the exam?', answer: 'Has passed', hint: 'nghi vấn', kind: 'nghi vấn' },
            { id: 19, sentence: 'They ___ (build) a new bridge since last year.', answer: 'have built', hint: 'since', kind: 'khẳng định' },
            { id: 20, sentence: 'I ___ (not/sleep) well this week.', answer: 'have not slept', hint: 'phủ định', kind: 'phủ định' }
        ]
    },
    'present-perfect-continuous': {
        usage: {
            intro: 'Thì hiện tại hoàn thành tiếp diễn nhấn mạnh <b>quá trình / thời gian kéo dài</b> của hành động bắt đầu trong quá khứ và vẫn tiếp tục hoặc vừa mới dừng.',
            items: [
                { title: 'Hành động bắt đầu trong quá khứ, vẫn đang tiếp diễn', icon: 'timer', examples: ['I <b>have been waiting</b> for 2 hours.', 'She <b>has been studying</b> since morning.'] },
                { title: 'Hành động vừa dừng nhưng kết quả còn thấy rõ', icon: 'visibility', examples: ['He is tired because he <b>has been running</b>.', 'The ground is wet — it <b>has been raining</b>.'] },
                { title: 'Nhấn mạnh thời gian / quá trình (hơn là kết quả)', icon: 'schedule', examples: ['They <b>have been building</b> that house for months.', 'We <b>have been discussing</b> this issue all day.'] }
            ],
            signalWords: { label: 'Dấu hiệu nhận biết', words: ['for', 'since', 'all day/morning/week', 'how long', 'recently', 'lately'] }
        },
        formula: {
            note: 'Dùng <b>have/has + been + V-ing</b>.',
            groups: [
                {
                    label: 'Tất cả động từ',
                    sub: 'have/has + been + V-ing',
                    sentences: [
                        { kind: 'Khẳng định', sign: '+', formula: 'S + have/has + been + V-ing', examples: ['I <b>have been working</b> all day.', 'She <b>has been cooking</b> since noon.'] },
                        { kind: 'Phủ định', sign: '−', formula: 'S + have/has + not + been + V-ing', examples: ['I <b>have not been sleeping</b> well.', 'He <b>has not been exercising</b> lately.'] },
                        { kind: 'Nghi vấn', sign: '?', formula: 'Have/Has + S + been + V-ing?', examples: ['<b>Have</b> you <b>been waiting</b> long?', '<b>Has</b> she <b>been crying</b>?'] }
                    ],
                    subject: { headers: ['Chủ ngữ', 'Trợ động từ'], rows: [['I / You / We / They', 'have'], ['He / She / It', 'has']] },
                    note: ''
                }
            ],
            contractions: ['haven\'t = have not', 'hasn\'t = has not', 'I\'ve been = I have been']
        },
        exercises: [
            { id: 1, sentence: 'I ___ (wait) here for 30 minutes.', answer: 'have been waiting', hint: 'have/has been V-ing', kind: 'khẳng định' },
            { id: 2, sentence: 'She ___ (study) English since 2020.', answer: 'has been studying', hint: 'have/has been V-ing', kind: 'khẳng định' },
            { id: 3, sentence: 'They ___ (work) on this project all week.', answer: 'have been working', hint: 'have/has been V-ing', kind: 'khẳng định' },
            { id: 4, sentence: 'He ___ (not/feel) well lately.', answer: 'has not been feeling', hint: 'phủ định', kind: 'phủ định' },
            { id: 5, sentence: 'We ___ (not/sleep) enough recently.', answer: 'have not been sleeping', hint: 'phủ định', kind: 'phủ định' },
            { id: 6, sentence: '___ you ___ (exercise) regularly?', answer: 'Have been exercising', hint: 'nghi vấn', kind: 'nghi vấn' },
            { id: 7, sentence: '___ it ___ (rain) all day?', answer: 'Has been raining', hint: 'nghi vấn', kind: 'nghi vấn' },
            { id: 8, sentence: 'I ___ (learn) to drive for 3 months.', answer: 'have been learning', hint: 'for', kind: 'khẳng định' },
            { id: 9, sentence: 'She ___ (teach) at this school since 2018.', answer: 'has been teaching', hint: 'since', kind: 'khẳng định' },
            { id: 10, sentence: 'The kids ___ (play) outside all afternoon.', answer: 'have been playing', hint: 'all afternoon', kind: 'khẳng định' },
            { id: 11, sentence: 'He ___ (not/eat) properly these days.', answer: 'has not been eating', hint: 'phủ định', kind: 'phủ định' },
            { id: 12, sentence: 'I ___ (not/practice) piano lately.', answer: 'have not been practicing', hint: 'phủ định', kind: 'phủ định' },
            { id: 13, sentence: 'How long ___ you ___ (live) here?', answer: 'have been living', hint: 'how long', kind: 'nghi vấn' },
            { id: 14, sentence: '___ he ___ (train) for the marathon?', answer: 'Has been training', hint: 'nghi vấn', kind: 'nghi vấn' },
            { id: 15, sentence: 'My eyes hurt because I ___ (read) all day.', answer: 'have been reading', hint: 'nguyên nhân', kind: 'khẳng định' },
            { id: 16, sentence: 'She ___ (cook) since this morning.', answer: 'has been cooking', hint: 'since', kind: 'khẳng định' },
            { id: 17, sentence: 'We ___ (not/communicate) well recently.', answer: 'have not been communicating', hint: 'phủ định', kind: 'phủ định' },
            { id: 18, sentence: 'The company ___ (grow) rapidly this year.', answer: 'has been growing', hint: 'this year', kind: 'khẳng định' },
            { id: 19, sentence: '___ they ___ (argue) again?', answer: 'Have been arguing', hint: 'nghi vấn', kind: 'nghi vấn' },
            { id: 20, sentence: 'I ___ (try) to call you all morning.', answer: 'have been trying', hint: 'all morning', kind: 'khẳng định' }
        ]
    },
    'past-simple': {
        usage: {
            intro: 'Thì quá khứ đơn diễn tả hành động <b>đã xảy ra và kết thúc hoàn toàn trong quá khứ</b>, tại một thời điểm xác định.',
            items: [
                { title: 'Hành động đã hoàn tất trong quá khứ (thời gian xác định)', icon: 'event_busy', examples: ['I <b>visited</b> Paris last summer.', 'She <b>graduated</b> in 2020.'] },
                { title: 'Chuỗi hành động liên tiếp trong quá khứ', icon: 'format_list_numbered', examples: ['He <b>woke</b> up, <b>brushed</b> his teeth, and <b>left</b>.'] },
                { title: 'Thói quen / trạng thái trong quá khứ (không còn nữa)', icon: 'history', examples: ['She <b>lived</b> in London for 5 years. (giờ không ở nữa)', 'I <b>played</b> tennis when I was young.'] },
                { title: 'Sự kiện lịch sử', icon: 'public', examples: ['World War II <b>ended</b> in 1945.'] }
            ],
            signalWords: { label: 'Dấu hiệu nhận biết', words: ['yesterday', 'last week/month/year', 'ago', 'in 2010', 'when I was young', 'at that time', 'the other day'] }
        },
        formula: {
            note: 'Chia làm 2 nhóm: <b>động từ thường</b> (dùng V2 / did) và <b>động từ to be</b> (was/were).',
            groups: [
                {
                    label: 'Động từ thường',
                    sub: 'V2 / did + V',
                    sentences: [
                        { kind: 'Khẳng định', sign: '+', formula: 'S + V2 (past form)', examples: ['I <b>worked</b> yesterday.', 'She <b>went</b> to school.'] },
                        { kind: 'Phủ định', sign: '−', formula: 'S + did not + V (nguyên thể)', examples: ['I <b>did not work</b> yesterday.', 'She <b>didn\'t go</b>.'] },
                        { kind: 'Nghi vấn', sign: '?', formula: 'Did + S + V (nguyên thể)?', examples: ['<b>Did</b> you <b>work</b> yesterday?', '<b>Did</b> she <b>go</b>?'] }
                    ],
                    subject: { headers: ['Chủ ngữ', 'Trợ động từ'], rows: [['Tất cả ngôi', 'did']] },
                    note: 'V2: động từ có quy tắc thêm -ed (worked, played). Bất quy tắc phải học thuộc (went, saw, ate...).'
                },
                {
                    label: 'Động từ "to be"',
                    sub: 'was / were',
                    sentences: [
                        { kind: 'Khẳng định', sign: '+', formula: 'S + was/were + ...', examples: ['I <b>was</b> happy.', 'They <b>were</b> at home.'] },
                        { kind: 'Phủ định', sign: '−', formula: 'S + was/were + not + ...', examples: ['He <b>was not</b> ready.', 'We <b>were not</b> there.'] },
                        { kind: 'Nghi vấn', sign: '?', formula: 'Was/Were + S + ...?', examples: ['<b>Was</b> she late?', '<b>Were</b> they happy?'] }
                    ],
                    subject: { headers: ['Chủ ngữ', 'to be'], rows: [['I / He / She / It', 'was'], ['You / We / They', 'were']] },
                    note: ''
                }
            ],
            contractions: ['didn\'t = did not', 'wasn\'t = was not', 'weren\'t = were not']
        },
        exercises: [
            { id: 1, sentence: 'She ___ (go) to the market yesterday.', answer: 'went', hint: 'V2', kind: 'khẳng định' },
            { id: 2, sentence: 'I ___ (be) very tired last night.', answer: 'was', hint: 'to be', kind: 'khẳng định' },
            { id: 3, sentence: 'They ___ (play) football last Sunday.', answer: 'played', hint: 'V2', kind: 'khẳng định' },
            { id: 4, sentence: 'He ___ (not/come) to the party.', answer: 'did not come', hint: 'phủ định', kind: 'phủ định' },
            { id: 5, sentence: 'We ___ (not/be) at school yesterday.', answer: 'were not', hint: 'to be phủ định', kind: 'phủ định' },
            { id: 6, sentence: '___ you ___ (see) that movie?', answer: 'Did see', hint: 'nghi vấn', kind: 'nghi vấn' },
            { id: 7, sentence: '___ she ___ (be) happy?', answer: 'Was', hint: 'to be nghi vấn', kind: 'nghi vấn' },
            { id: 8, sentence: 'The train ___ (arrive) at 9 AM.', answer: 'arrived', hint: 'V2', kind: 'khẳng định' },
            { id: 9, sentence: 'I ___ (eat) sushi for the first time last week.', answer: 'ate', hint: 'V2 bất quy tắc', kind: 'khẳng định' },
            { id: 10, sentence: 'She ___ (write) a letter to her friend.', answer: 'wrote', hint: 'V2 bất quy tắc', kind: 'khẳng định' },
            { id: 11, sentence: 'He ___ (not/know) the answer.', answer: 'did not know', hint: 'phủ định', kind: 'phủ định' },
            { id: 12, sentence: 'It ___ (not/be) cold yesterday.', answer: 'was not', hint: 'to be phủ định', kind: 'phủ định' },
            { id: 13, sentence: '___ they ___ (finish) on time?', answer: 'Did finish', hint: 'nghi vấn', kind: 'nghi vấn' },
            { id: 14, sentence: 'We ___ (move) to this city in 2015.', answer: 'moved', hint: 'V2', kind: 'khẳng định' },
            { id: 15, sentence: 'The children ___ (be) very excited.', answer: 'were', hint: 'to be', kind: 'khẳng định' },
            { id: 16, sentence: 'I ___ (not/understand) the lesson.', answer: 'did not understand', hint: 'phủ định', kind: 'phủ định' },
            { id: 17, sentence: 'She ___ (buy) a new car last month.', answer: 'bought', hint: 'V2 bất quy tắc', kind: 'khẳng định' },
            { id: 18, sentence: '___ it ___ (rain) yesterday?', answer: 'Did rain', hint: 'nghi vấn', kind: 'nghi vấn' },
            { id: 19, sentence: 'He ___ (study) hard for the exam.', answer: 'studied', hint: 'V2', kind: 'khẳng định' },
            { id: 20, sentence: 'They ___ (not/want) to leave.', answer: 'did not want', hint: 'phủ định', kind: 'phủ định' }
        ]
    },
    'past-continuous': {
        usage: {
            intro: 'Thì quá khứ tiếp diễn diễn tả hành động <b>đang xảy ra tại một thời điểm cụ thể trong quá khứ</b>.',
            items: [
                { title: 'Hành động đang diễn ra tại thời điểm xác định trong quá khứ', icon: 'access_time', examples: ['At 8 PM last night, I <b>was watching</b> TV.'] },
                { title: 'Hành động đang xảy ra thì bị ngắt bởi hành động khác', icon: 'flash_on', examples: ['I <b>was cooking</b> when the phone <b>rang</b>.'] },
                { title: 'Hai hành động diễn ra song song trong quá khứ', icon: 'compare_arrows', examples: ['While I <b>was studying</b>, my brother <b>was playing</b> games.'] },
                { title: 'Bối cảnh / mô tả trong câu chuyện', icon: 'auto_stories', examples: ['The sun <b>was shining</b> and the birds <b>were singing</b>.'] }
            ],
            signalWords: { label: 'Dấu hiệu nhận biết', words: ['at that time', 'at 8 PM yesterday', 'when', 'while', 'as', 'all day yesterday'] }
        },
        formula: {
            note: 'Dùng <b>was/were + V-ing</b>.',
            groups: [
                {
                    label: 'Tất cả động từ',
                    sub: 'was/were + V-ing',
                    sentences: [
                        { kind: 'Khẳng định', sign: '+', formula: 'S + was/were + V-ing', examples: ['I <b>was reading</b>.', 'They <b>were playing</b>.'] },
                        { kind: 'Phủ định', sign: '−', formula: 'S + was/were + not + V-ing', examples: ['She <b>was not sleeping</b>.'] },
                        { kind: 'Nghi vấn', sign: '?', formula: 'Was/Were + S + V-ing?', examples: ['<b>Were</b> you <b>listening</b>?'] }
                    ],
                    subject: { headers: ['Chủ ngữ', 'to be (quá khứ)'], rows: [['I / He / She / It', 'was'], ['You / We / They', 'were']] },
                    note: ''
                }
            ],
            contractions: ['wasn\'t = was not', 'weren\'t = were not']
        },
        exercises: [
            { id: 1, sentence: 'I ___ (study) at 9 PM last night.', answer: 'was studying', hint: 'was/were + V-ing', kind: 'khẳng định' },
            { id: 2, sentence: 'They ___ (play) when it started to rain.', answer: 'were playing', hint: 'was/were + V-ing', kind: 'khẳng định' },
            { id: 3, sentence: 'She ___ (cook) dinner at 6 PM.', answer: 'was cooking', hint: 'was/were + V-ing', kind: 'khẳng định' },
            { id: 4, sentence: 'He ___ (not/sleep) when I called.', answer: 'was not sleeping', hint: 'phủ định', kind: 'phủ định' },
            { id: 5, sentence: 'We ___ (not/watch) TV at that time.', answer: 'were not watching', hint: 'phủ định', kind: 'phủ định' },
            { id: 6, sentence: '___ you ___ (work) at 3 PM yesterday?', answer: 'Were working', hint: 'nghi vấn', kind: 'nghi vấn' },
            { id: 7, sentence: '___ she ___ (drive) when the accident happened?', answer: 'Was driving', hint: 'nghi vấn', kind: 'nghi vấn' },
            { id: 8, sentence: 'While I ___ (read), my phone rang.', answer: 'was reading', hint: 'while', kind: 'khẳng định' },
            { id: 9, sentence: 'The children ___ (run) in the park.', answer: 'were running', hint: 'was/were + V-ing', kind: 'khẳng định' },
            { id: 10, sentence: 'At midnight, everyone ___ (sleep).', answer: 'was sleeping', hint: 'was/were + V-ing', kind: 'khẳng định' },
            { id: 11, sentence: 'I ___ (not/listen) to music then.', answer: 'was not listening', hint: 'phủ định', kind: 'phủ định' },
            { id: 12, sentence: 'They ___ (not/pay) attention.', answer: 'were not paying', hint: 'phủ định', kind: 'phủ định' },
            { id: 13, sentence: '___ he ___ (wait) for you?', answer: 'Was waiting', hint: 'nghi vấn', kind: 'nghi vấn' },
            { id: 14, sentence: 'While she ___ (sing), he ___ (play) guitar.', answer: 'was singing', hint: 'song song', kind: 'khẳng định' },
            { id: 15, sentence: 'The sun ___ (shine) brightly that morning.', answer: 'was shining', hint: 'bối cảnh', kind: 'khẳng định' },
            { id: 16, sentence: 'I ___ (walk) home when I saw her.', answer: 'was walking', hint: 'when', kind: 'khẳng định' },
            { id: 17, sentence: 'We ___ (not/expect) any visitors.', answer: 'were not expecting', hint: 'phủ định', kind: 'phủ định' },
            { id: 18, sentence: '___ they ___ (argue) when you arrived?', answer: 'Were arguing', hint: 'nghi vấn', kind: 'nghi vấn' },
            { id: 19, sentence: 'She ___ (wear) a red dress.', answer: 'was wearing', hint: 'mô tả', kind: 'khẳng định' },
            { id: 20, sentence: 'It ___ (not/snow) when we left.', answer: 'was not snowing', hint: 'phủ định', kind: 'phủ định' }
        ]
    },
    'past-perfect': {
        usage: {
            intro: 'Thì quá khứ hoàn thành diễn tả hành động <b>đã xảy ra và hoàn tất trước một hành động/thời điểm khác trong quá khứ</b>.',
            items: [
                { title: 'Hành động xảy ra trước một hành động khác trong quá khứ', icon: 'first_page', examples: ['When I arrived, she <b>had already left</b>.'] },
                { title: 'Nguyên nhân của sự việc trong quá khứ', icon: 'help_outline', examples: ['I was tired because I <b>had worked</b> all day.'] },
                { title: 'Câu điều kiện loại 3', icon: 'alt_route', examples: ['If I <b>had known</b>, I would have helped.'] },
                { title: 'Reported speech (tường thuật)', icon: 'record_voice_over', examples: ['She said she <b>had seen</b> him before.'] }
            ],
            signalWords: { label: 'Dấu hiệu nhận biết', words: ['before', 'after', 'by the time', 'when', 'already', 'just', 'never...before', 'until'] }
        },
        formula: {
            note: 'Dùng <b>had + V3 (past participle)</b> cho tất cả các ngôi.',
            groups: [
                {
                    label: 'Tất cả động từ',
                    sub: 'had + V3',
                    sentences: [
                        { kind: 'Khẳng định', sign: '+', formula: 'S + had + V3', examples: ['I <b>had eaten</b> before she arrived.'] },
                        { kind: 'Phủ định', sign: '−', formula: 'S + had not + V3', examples: ['I <b>had not seen</b> him before.'] },
                        { kind: 'Nghi vấn', sign: '?', formula: 'Had + S + V3?', examples: ['<b>Had</b> you <b>met</b> her before?'] }
                    ],
                    subject: { headers: ['Chủ ngữ', 'Trợ động từ'], rows: [['Tất cả ngôi', 'had']] },
                    note: ''
                }
            ],
            contractions: ['hadn\'t = had not', 'I\'d = I had', 'they\'d = they had']
        },
        exercises: [
            { id: 1, sentence: 'She ___ (leave) before I arrived.', answer: 'had left', hint: 'had + V3', kind: 'khẳng định' },
            { id: 2, sentence: 'I ___ (finish) my homework before dinner.', answer: 'had finished', hint: 'had + V3', kind: 'khẳng định' },
            { id: 3, sentence: 'They ___ (never/see) snow before that trip.', answer: 'had never seen', hint: 'had + V3', kind: 'khẳng định' },
            { id: 4, sentence: 'He ___ (not/eat) anything all day.', answer: 'had not eaten', hint: 'phủ định', kind: 'phủ định' },
            { id: 5, sentence: 'We ___ (not/meet) before the party.', answer: 'had not met', hint: 'phủ định', kind: 'phủ định' },
            { id: 6, sentence: '___ you ___ (read) the book before the movie?', answer: 'Had read', hint: 'nghi vấn', kind: 'nghi vấn' },
            { id: 7, sentence: '___ she ___ (visit) Japan before?', answer: 'Had visited', hint: 'nghi vấn', kind: 'nghi vấn' },
            { id: 8, sentence: 'By the time we arrived, the show ___ (start).', answer: 'had started', hint: 'by the time', kind: 'khẳng định' },
            { id: 9, sentence: 'I was hungry because I ___ (not/have) breakfast.', answer: 'had not had', hint: 'nguyên nhân', kind: 'phủ định' },
            { id: 10, sentence: 'After she ___ (cook), we ate dinner.', answer: 'had cooked', hint: 'after', kind: 'khẳng định' },
            { id: 11, sentence: 'He ___ (already/go) when I called.', answer: 'had already gone', hint: 'already', kind: 'khẳng định' },
            { id: 12, sentence: 'They ___ (not/finish) by Friday.', answer: 'had not finished', hint: 'phủ định', kind: 'phủ định' },
            { id: 13, sentence: '___ he ___ (study) English before moving?', answer: 'Had studied', hint: 'nghi vấn', kind: 'nghi vấn' },
            { id: 14, sentence: 'She told me she ___ (lose) her wallet.', answer: 'had lost', hint: 'reported speech', kind: 'khẳng định' },
            { id: 15, sentence: 'If I ___ (know), I would have told you.', answer: 'had known', hint: 'điều kiện 3', kind: 'khẳng định' },
            { id: 16, sentence: 'The train ___ (leave) by the time we got there.', answer: 'had left', hint: 'by the time', kind: 'khẳng định' },
            { id: 17, sentence: 'I ___ (not/travel) abroad before 2018.', answer: 'had not traveled', hint: 'phủ định', kind: 'phủ định' },
            { id: 18, sentence: '___ they ___ (decide) before the meeting?', answer: 'Had decided', hint: 'nghi vấn', kind: 'nghi vấn' },
            { id: 19, sentence: 'She ___ (write) 3 books before turning 30.', answer: 'had written', hint: 'before', kind: 'khẳng định' },
            { id: 20, sentence: 'We ___ (not/hear) the news until evening.', answer: 'had not heard', hint: 'phủ định', kind: 'phủ định' }
        ]
    },
    'past-perfect-continuous': {
        usage: {
            intro: 'Thì quá khứ hoàn thành tiếp diễn nhấn mạnh <b>quá trình / thời gian kéo dài</b> của hành động trước một thời điểm/hành động khác trong quá khứ.',
            items: [
                { title: 'Hành động kéo dài trước một sự kiện trong quá khứ', icon: 'timer', examples: ['I <b>had been waiting</b> for 2 hours before the bus came.'] },
                { title: 'Nguyên nhân của trạng thái trong quá khứ', icon: 'help_outline', examples: ['He was tired because he <b>had been running</b>.'] },
                { title: 'Nhấn mạnh thời gian / quá trình', icon: 'schedule', examples: ['They <b>had been discussing</b> for hours before deciding.'] }
            ],
            signalWords: { label: 'Dấu hiệu nhận biết', words: ['for', 'since', 'before', 'by the time', 'how long', 'all day/morning'] }
        },
        formula: {
            note: 'Dùng <b>had been + V-ing</b> cho tất cả các ngôi.',
            groups: [
                {
                    label: 'Tất cả động từ',
                    sub: 'had been + V-ing',
                    sentences: [
                        { kind: 'Khẳng định', sign: '+', formula: 'S + had been + V-ing', examples: ['I <b>had been studying</b> for 3 hours.'] },
                        { kind: 'Phủ định', sign: '−', formula: 'S + had not been + V-ing', examples: ['He <b>had not been sleeping</b> well.'] },
                        { kind: 'Nghi vấn', sign: '?', formula: 'Had + S + been + V-ing?', examples: ['<b>Had</b> you <b>been waiting</b> long?'] }
                    ],
                    subject: { headers: ['Chủ ngữ', 'Trợ động từ'], rows: [['Tất cả ngôi', 'had']] },
                    note: ''
                }
            ],
            contractions: ['hadn\'t been = had not been']
        },
        exercises: [
            { id: 1, sentence: 'I ___ (wait) for an hour before she arrived.', answer: 'had been waiting', hint: 'had been V-ing', kind: 'khẳng định' },
            { id: 2, sentence: 'She ___ (work) there for 3 years before quitting.', answer: 'had been working', hint: 'had been V-ing', kind: 'khẳng định' },
            { id: 3, sentence: 'They ___ (travel) all day before reaching the hotel.', answer: 'had been traveling', hint: 'had been V-ing', kind: 'khẳng định' },
            { id: 4, sentence: 'He ___ (not/study) hard before the exam.', answer: 'had not been studying', hint: 'phủ định', kind: 'phủ định' },
            { id: 5, sentence: 'We ___ (not/sleep) well before the trip.', answer: 'had not been sleeping', hint: 'phủ định', kind: 'phủ định' },
            { id: 6, sentence: '___ you ___ (practice) before the concert?', answer: 'Had been practicing', hint: 'nghi vấn', kind: 'nghi vấn' },
            { id: 7, sentence: '___ it ___ (rain) before you went out?', answer: 'Had been raining', hint: 'nghi vấn', kind: 'nghi vấn' },
            { id: 8, sentence: 'He was out of breath because he ___ (run).', answer: 'had been running', hint: 'nguyên nhân', kind: 'khẳng định' },
            { id: 9, sentence: 'The ground was wet because it ___ (rain) all night.', answer: 'had been raining', hint: 'nguyên nhân', kind: 'khẳng định' },
            { id: 10, sentence: 'She ___ (teach) for 20 years before retiring.', answer: 'had been teaching', hint: 'for', kind: 'khẳng định' },
            { id: 11, sentence: 'I ___ (not/feel) well for days before seeing the doctor.', answer: 'had not been feeling', hint: 'phủ định', kind: 'phủ định' },
            { id: 12, sentence: 'They ___ (not/communicate) for months.', answer: 'had not been communicating', hint: 'phủ định', kind: 'phủ định' },
            { id: 13, sentence: 'How long ___ you ___ (live) there before moving?', answer: 'had been living', hint: 'how long', kind: 'nghi vấn' },
            { id: 14, sentence: '___ he ___ (train) before the competition?', answer: 'Had been training', hint: 'nghi vấn', kind: 'nghi vấn' },
            { id: 15, sentence: 'By the time I arrived, they ___ (argue) for an hour.', answer: 'had been arguing', hint: 'by the time', kind: 'khẳng định' },
            { id: 16, sentence: 'She ___ (cry) before I saw her.', answer: 'had been crying', hint: 'before', kind: 'khẳng định' },
            { id: 17, sentence: 'We ___ (not/exercise) regularly before the warning.', answer: 'had not been exercising', hint: 'phủ định', kind: 'phủ định' },
            { id: 18, sentence: 'The kids ___ (play) in the mud all morning.', answer: 'had been playing', hint: 'all morning', kind: 'khẳng định' },
            { id: 19, sentence: '___ she ___ (look) for a job long?', answer: 'Had been looking', hint: 'nghi vấn', kind: 'nghi vấn' },
            { id: 20, sentence: 'I ___ (drive) for 5 hours before stopping.', answer: 'had been driving', hint: 'for', kind: 'khẳng định' }
        ]
    },
    'future-simple': {
        usage: {
            intro: 'Thì tương lai đơn diễn tả hành động <b>sẽ xảy ra trong tương lai</b>, quyết định tức thời, dự đoán, lời hứa.',
            items: [
                { title: 'Quyết định tức thời (ngay lúc nói)', icon: 'bolt', examples: ['I\'m cold. I <b>will close</b> the window.', 'The phone is ringing. I <b>will answer</b> it.'] },
                { title: 'Dự đoán (không có bằng chứng rõ ràng)', icon: 'psychology', examples: ['I think it <b>will rain</b> tomorrow.', 'She <b>will probably pass</b> the exam.'] },
                { title: 'Lời hứa / đề nghị / từ chối', icon: 'handshake', examples: ['I <b>will help</b> you with that.', 'I <b>won\'t tell</b> anyone.'] },
                { title: 'Sự kiện chắc chắn trong tương lai', icon: 'event', examples: ['He <b>will be</b> 30 next year.', 'The sun <b>will rise</b> at 6 AM.'] }
            ],
            signalWords: { label: 'Dấu hiệu nhận biết', words: ['tomorrow', 'next week/month/year', 'in the future', 'I think', 'probably', 'perhaps', 'soon'] }
        },
        formula: {
            note: 'Dùng <b>will + V (nguyên thể)</b> cho tất cả các ngôi.',
            groups: [
                {
                    label: 'Tất cả động từ',
                    sub: 'will + V',
                    sentences: [
                        { kind: 'Khẳng định', sign: '+', formula: 'S + will + V (nguyên thể)', examples: ['I <b>will come</b> tomorrow.', 'She <b>will help</b> you.'] },
                        { kind: 'Phủ định', sign: '−', formula: 'S + will not + V', examples: ['I <b>will not forget</b>.', 'He <b>won\'t be</b> late.'] },
                        { kind: 'Nghi vấn', sign: '?', formula: 'Will + S + V?', examples: ['<b>Will</b> you <b>come</b>?', '<b>Will</b> it <b>rain</b>?'] }
                    ],
                    subject: { headers: ['Chủ ngữ', 'Trợ động từ'], rows: [['Tất cả ngôi', 'will']] },
                    note: 'Phân biệt: <b>will</b> = quyết định tức thời / dự đoán. <b>be going to</b> = kế hoạch đã có / bằng chứng rõ ràng.'
                }
            ],
            contractions: ['won\'t = will not', 'I\'ll = I will', 'he\'ll = he will', 'they\'ll = they will']
        },
        exercises: [
            { id: 1, sentence: 'I ___ (help) you with your homework.', answer: 'will help', hint: 'will + V', kind: 'khẳng định' },
            { id: 2, sentence: 'She ___ (call) you later.', answer: 'will call', hint: 'will + V', kind: 'khẳng định' },
            { id: 3, sentence: 'They ___ (arrive) tomorrow morning.', answer: 'will arrive', hint: 'will + V', kind: 'khẳng định' },
            { id: 4, sentence: 'I ___ (not/forget) your birthday.', answer: 'will not forget', hint: 'phủ định', kind: 'phủ định' },
            { id: 5, sentence: 'He ___ (not/be) late again.', answer: 'will not be', hint: 'phủ định', kind: 'phủ định' },
            { id: 6, sentence: '___ you ___ (come) to the party?', answer: 'Will come', hint: 'nghi vấn', kind: 'nghi vấn' },
            { id: 7, sentence: '___ it ___ (rain) tomorrow?', answer: 'Will rain', hint: 'nghi vấn', kind: 'nghi vấn' },
            { id: 8, sentence: 'I think she ___ (pass) the exam.', answer: 'will pass', hint: 'dự đoán', kind: 'khẳng định' },
            { id: 9, sentence: 'Don\'t worry, I ___ (not/tell) anyone.', answer: 'will not tell', hint: 'lời hứa', kind: 'phủ định' },
            { id: 10, sentence: 'We ___ (meet) again soon.', answer: 'will meet', hint: 'will + V', kind: 'khẳng định' },
            { id: 11, sentence: 'He ___ (be) 25 next month.', answer: 'will be', hint: 'sự kiện chắc chắn', kind: 'khẳng định' },
            { id: 12, sentence: 'I ___ (not/go) to work tomorrow.', answer: 'will not go', hint: 'phủ định', kind: 'phủ định' },
            { id: 13, sentence: '___ they ___ (finish) on time?', answer: 'Will finish', hint: 'nghi vấn', kind: 'nghi vấn' },
            { id: 14, sentence: 'She ___ probably ___ (win) the prize.', answer: 'will win', hint: 'probably', kind: 'khẳng định' },
            { id: 15, sentence: 'I ___ (open) the door for you.', answer: 'will open', hint: 'đề nghị', kind: 'khẳng định' },
            { id: 16, sentence: 'We ___ (not/accept) this offer.', answer: 'will not accept', hint: 'phủ định', kind: 'phủ định' },
            { id: 17, sentence: '___ she ___ (join) us for dinner?', answer: 'Will join', hint: 'nghi vấn', kind: 'nghi vấn' },
            { id: 18, sentence: 'The concert ___ (start) at 8 PM.', answer: 'will start', hint: 'will + V', kind: 'khẳng định' },
            { id: 19, sentence: 'I ___ (not/change) my mind.', answer: 'will not change', hint: 'phủ định', kind: 'phủ định' },
            { id: 20, sentence: '___ you ___ (marry) me?', answer: 'Will marry', hint: 'nghi vấn', kind: 'nghi vấn' }
        ]
    },
    'future-continuous': {
        usage: {
            intro: 'Thì tương lai tiếp diễn diễn tả hành động <b>sẽ đang xảy ra tại một thời điểm cụ thể trong tương lai</b>.',
            items: [
                { title: 'Hành động sẽ đang diễn ra tại thời điểm xác định trong tương lai', icon: 'schedule', examples: ['At 8 PM tonight, I <b>will be watching</b> TV.', 'This time tomorrow, she <b>will be flying</b> to London.'] },
                { title: 'Hành động sẽ xảy ra theo kế hoạch / thường lệ', icon: 'event_repeat', examples: ['I <b>will be working</b> late tomorrow.', 'They <b>will be attending</b> the conference next week.'] },
                { title: 'Hỏi lịch trình một cách lịch sự', icon: 'help', examples: ['<b>Will</b> you <b>be using</b> the car tonight?'] }
            ],
            signalWords: { label: 'Dấu hiệu nhận biết', words: ['at this time tomorrow', 'at 8 PM tonight', 'this time next week', 'all day tomorrow', 'when you arrive'] }
        },
        formula: {
            note: 'Dùng <b>will be + V-ing</b>.',
            groups: [
                {
                    label: 'Tất cả động từ',
                    sub: 'will be + V-ing',
                    sentences: [
                        { kind: 'Khẳng định', sign: '+', formula: 'S + will be + V-ing', examples: ['I <b>will be sleeping</b> at midnight.'] },
                        { kind: 'Phủ định', sign: '−', formula: 'S + will not be + V-ing', examples: ['She <b>won\'t be working</b> tomorrow.'] },
                        { kind: 'Nghi vấn', sign: '?', formula: 'Will + S + be + V-ing?', examples: ['<b>Will</b> you <b>be waiting</b> for me?'] }
                    ],
                    subject: { headers: ['Chủ ngữ', 'Trợ động từ'], rows: [['Tất cả ngôi', 'will']] },
                    note: ''
                }
            ],
            contractions: ['won\'t be = will not be', 'I\'ll be = I will be']
        },
        exercises: [
            { id: 1, sentence: 'At 10 PM tonight, I ___ (sleep).', answer: 'will be sleeping', hint: 'will be V-ing', kind: 'khẳng định' },
            { id: 2, sentence: 'This time tomorrow, she ___ (fly) to Paris.', answer: 'will be flying', hint: 'will be V-ing', kind: 'khẳng định' },
            { id: 3, sentence: 'They ___ (work) all day tomorrow.', answer: 'will be working', hint: 'will be V-ing', kind: 'khẳng định' },
            { id: 4, sentence: 'I ___ (not/use) the car tonight.', answer: 'will not be using', hint: 'phủ định', kind: 'phủ định' },
            { id: 5, sentence: 'He ___ (not/attend) the meeting tomorrow.', answer: 'will not be attending', hint: 'phủ định', kind: 'phủ định' },
            { id: 6, sentence: '___ you ___ (wait) for me at the station?', answer: 'Will be waiting', hint: 'nghi vấn', kind: 'nghi vấn' },
            { id: 7, sentence: '___ she ___ (study) at that time?', answer: 'Will be studying', hint: 'nghi vấn', kind: 'nghi vấn' },
            { id: 8, sentence: 'We ___ (have) dinner at 7 PM.', answer: 'will be having', hint: 'will be V-ing', kind: 'khẳng định' },
            { id: 9, sentence: 'At noon, the students ___ (take) their exam.', answer: 'will be taking', hint: 'will be V-ing', kind: 'khẳng định' },
            { id: 10, sentence: 'I ___ (drive) to work at 8 AM tomorrow.', answer: 'will be driving', hint: 'will be V-ing', kind: 'khẳng định' },
            { id: 11, sentence: 'She ___ (not/cook) when you arrive.', answer: 'will not be cooking', hint: 'phủ định', kind: 'phủ định' },
            { id: 12, sentence: 'They ___ (not/play) football this evening.', answer: 'will not be playing', hint: 'phủ định', kind: 'phủ định' },
            { id: 13, sentence: '___ he ___ (travel) next week?', answer: 'Will be traveling', hint: 'nghi vấn', kind: 'nghi vấn' },
            { id: 14, sentence: 'This time next year, I ___ (live) in Japan.', answer: 'will be living', hint: 'this time next year', kind: 'khẳng định' },
            { id: 15, sentence: 'When you call, I ___ (exercise).', answer: 'will be exercising', hint: 'when', kind: 'khẳng định' },
            { id: 16, sentence: 'We ___ (not/watch) TV at that hour.', answer: 'will not be watching', hint: 'phủ định', kind: 'phủ định' },
            { id: 17, sentence: '___ they ___ (stay) at the hotel?', answer: 'Will be staying', hint: 'nghi vấn', kind: 'nghi vấn' },
            { id: 18, sentence: 'He ___ (teach) a class at 2 PM.', answer: 'will be teaching', hint: 'will be V-ing', kind: 'khẳng định' },
            { id: 19, sentence: 'I ___ (not/sleep) when you get home.', answer: 'will not be sleeping', hint: 'phủ định', kind: 'phủ định' },
            { id: 20, sentence: '___ you ___ (use) the computer later?', answer: 'Will be using', hint: 'nghi vấn', kind: 'nghi vấn' }
        ]
    },
    'future-perfect': {
        usage: {
            intro: 'Thì tương lai hoàn thành diễn tả hành động <b>sẽ hoàn tất trước một thời điểm/sự kiện trong tương lai</b>.',
            items: [
                { title: 'Hành động sẽ hoàn thành trước một mốc thời gian trong tương lai', icon: 'task_alt', examples: ['By next Friday, I <b>will have finished</b> the report.', 'She <b>will have graduated</b> by June.'] },
                { title: 'Dự đoán về điều đã hoàn tất', icon: 'psychology', examples: ['He <b>will have left</b> by now. (chắc giờ đã đi rồi)'] },
                { title: 'Thành tựu tính đến một mốc tương lai', icon: 'emoji_events', examples: ['By 2030, they <b>will have built</b> 100 schools.'] }
            ],
            signalWords: { label: 'Dấu hiệu nhận biết', words: ['by tomorrow', 'by next week/month/year', 'by the time', 'before', 'by then', 'by 2030'] }
        },
        formula: {
            note: 'Dùng <b>will have + V3</b>.',
            groups: [
                {
                    label: 'Tất cả động từ',
                    sub: 'will have + V3',
                    sentences: [
                        { kind: 'Khẳng định', sign: '+', formula: 'S + will have + V3', examples: ['I <b>will have finished</b> by 5 PM.'] },
                        { kind: 'Phủ định', sign: '−', formula: 'S + will not have + V3', examples: ['She <b>won\'t have arrived</b> by then.'] },
                        { kind: 'Nghi vấn', sign: '?', formula: 'Will + S + have + V3?', examples: ['<b>Will</b> you <b>have completed</b> it by Friday?'] }
                    ],
                    subject: { headers: ['Chủ ngữ', 'Trợ động từ'], rows: [['Tất cả ngôi', 'will']] },
                    note: ''
                }
            ],
            contractions: ['won\'t have = will not have']
        },
        exercises: [
            { id: 1, sentence: 'By next month, I ___ (finish) the course.', answer: 'will have finished', hint: 'will have V3', kind: 'khẳng định' },
            { id: 2, sentence: 'She ___ (graduate) by June.', answer: 'will have graduated', hint: 'will have V3', kind: 'khẳng định' },
            { id: 3, sentence: 'They ___ (build) the bridge by 2027.', answer: 'will have built', hint: 'will have V3', kind: 'khẳng định' },
            { id: 4, sentence: 'I ___ (not/complete) the project by Friday.', answer: 'will not have completed', hint: 'phủ định', kind: 'phủ định' },
            { id: 5, sentence: 'He ___ (not/arrive) by the time we leave.', answer: 'will not have arrived', hint: 'phủ định', kind: 'phủ định' },
            { id: 6, sentence: '___ you ___ (read) the book by tomorrow?', answer: 'Will have read', hint: 'nghi vấn', kind: 'nghi vấn' },
            { id: 7, sentence: '___ she ___ (save) enough money by then?', answer: 'Will have saved', hint: 'nghi vấn', kind: 'nghi vấn' },
            { id: 8, sentence: 'By 10 PM, we ___ (eat) dinner.', answer: 'will have eaten', hint: 'by', kind: 'khẳng định' },
            { id: 9, sentence: 'By the time you arrive, I ___ (cook) dinner.', answer: 'will have cooked', hint: 'by the time', kind: 'khẳng định' },
            { id: 10, sentence: 'He ___ (write) 5 books by next year.', answer: 'will have written', hint: 'by next year', kind: 'khẳng định' },
            { id: 11, sentence: 'We ___ (not/finish) before midnight.', answer: 'will not have finished', hint: 'phủ định', kind: 'phủ định' },
            { id: 12, sentence: 'She ___ (not/learn) enough by the exam.', answer: 'will not have learned', hint: 'phủ định', kind: 'phủ định' },
            { id: 13, sentence: '___ they ___ (move) by next month?', answer: 'Will have moved', hint: 'nghi vấn', kind: 'nghi vấn' },
            { id: 14, sentence: 'By 2030, scientists ___ (discover) a cure.', answer: 'will have discovered', hint: 'by 2030', kind: 'khẳng định' },
            { id: 15, sentence: 'I ___ (pay) off my loan by December.', answer: 'will have paid', hint: 'by', kind: 'khẳng định' },
            { id: 16, sentence: 'He ___ (not/return) by evening.', answer: 'will not have returned', hint: 'phủ định', kind: 'phủ định' },
            { id: 17, sentence: '___ you ___ (finish) your thesis by May?', answer: 'Will have finished', hint: 'nghi vấn', kind: 'nghi vấn' },
            { id: 18, sentence: 'By tomorrow, she ___ (travel) 1000 km.', answer: 'will have traveled', hint: 'by tomorrow', kind: 'khẳng định' },
            { id: 19, sentence: 'We ___ (not/sell) all tickets by then.', answer: 'will not have sold', hint: 'phủ định', kind: 'phủ định' },
            { id: 20, sentence: '___ he ___ (retire) by 60?', answer: 'Will have retired', hint: 'nghi vấn', kind: 'nghi vấn' }
        ]
    },
    'future-perfect-continuous': {
        usage: {
            intro: 'Thì tương lai hoàn thành tiếp diễn nhấn mạnh <b>thời gian kéo dài</b> của hành động tính đến một mốc trong tương lai.',
            items: [
                { title: 'Hành động sẽ kéo dài liên tục đến một mốc tương lai', icon: 'timer', examples: ['By next month, I <b>will have been working</b> here for 5 years.', 'By 6 PM, she <b>will have been studying</b> for 8 hours.'] },
                { title: 'Nhấn mạnh quá trình / thời gian (hơn kết quả)', icon: 'hourglass_full', examples: ['By the time he retires, he <b>will have been teaching</b> for 40 years.'] }
            ],
            signalWords: { label: 'Dấu hiệu nhận biết', words: ['by', 'by the time', 'for + thời gian', 'by next year', 'when'] }
        },
        formula: {
            note: 'Dùng <b>will have been + V-ing</b>.',
            groups: [
                {
                    label: 'Tất cả động từ',
                    sub: 'will have been + V-ing',
                    sentences: [
                        { kind: 'Khẳng định', sign: '+', formula: 'S + will have been + V-ing', examples: ['I <b>will have been living</b> here for 10 years by 2030.'] },
                        { kind: 'Phủ định', sign: '−', formula: 'S + will not have been + V-ing', examples: ['She <b>won\'t have been working</b> long enough.'] },
                        { kind: 'Nghi vấn', sign: '?', formula: 'Will + S + have been + V-ing?', examples: ['<b>Will</b> you <b>have been waiting</b> long?'] }
                    ],
                    subject: { headers: ['Chủ ngữ', 'Trợ động từ'], rows: [['Tất cả ngôi', 'will']] },
                    note: ''
                }
            ],
            contractions: ['won\'t have been = will not have been']
        },
        exercises: [
            { id: 1, sentence: 'By next year, I ___ (work) here for 10 years.', answer: 'will have been working', hint: 'will have been V-ing', kind: 'khẳng định' },
            { id: 2, sentence: 'By 6 PM, she ___ (study) for 8 hours.', answer: 'will have been studying', hint: 'will have been V-ing', kind: 'khẳng định' },
            { id: 3, sentence: 'By the time he retires, he ___ (teach) for 40 years.', answer: 'will have been teaching', hint: 'will have been V-ing', kind: 'khẳng định' },
            { id: 4, sentence: 'I ___ (not/wait) that long by then.', answer: 'will not have been waiting', hint: 'phủ định', kind: 'phủ định' },
            { id: 5, sentence: 'She ___ (not/live) here long enough by May.', answer: 'will not have been living', hint: 'phủ định', kind: 'phủ định' },
            { id: 6, sentence: '___ you ___ (drive) for 5 hours by noon?', answer: 'Will have been driving', hint: 'nghi vấn', kind: 'nghi vấn' },
            { id: 7, sentence: '___ they ___ (build) the house for a year by December?', answer: 'Will have been building', hint: 'nghi vấn', kind: 'nghi vấn' },
            { id: 8, sentence: 'By midnight, we ___ (travel) for 12 hours.', answer: 'will have been traveling', hint: 'for', kind: 'khẳng định' },
            { id: 9, sentence: 'By next month, he ___ (learn) English for 2 years.', answer: 'will have been learning', hint: 'for', kind: 'khẳng định' },
            { id: 10, sentence: 'She ___ (run) for an hour by the time you join.', answer: 'will have been running', hint: 'by the time', kind: 'khẳng định' },
            { id: 11, sentence: 'I ___ (not/sleep) long enough by 5 AM.', answer: 'will not have been sleeping', hint: 'phủ định', kind: 'phủ định' },
            { id: 12, sentence: 'They ___ (not/practice) long enough for the show.', answer: 'will not have been practicing', hint: 'phủ định', kind: 'phủ định' },
            { id: 13, sentence: '___ she ___ (cook) all day by dinner time?', answer: 'Will have been cooking', hint: 'nghi vấn', kind: 'nghi vấn' },
            { id: 14, sentence: 'By Friday, we ___ (discuss) this for a week.', answer: 'will have been discussing', hint: 'for', kind: 'khẳng định' },
            { id: 15, sentence: 'He ___ (play) piano for 15 years by next June.', answer: 'will have been playing', hint: 'for', kind: 'khẳng định' },
            { id: 16, sentence: 'I ___ (not/exercise) long enough to see results.', answer: 'will not have been exercising', hint: 'phủ định', kind: 'phủ định' },
            { id: 17, sentence: '___ he ___ (work) here for 5 years by March?', answer: 'Will have been working', hint: 'nghi vấn', kind: 'nghi vấn' },
            { id: 18, sentence: 'By the end of this year, I ___ (save) money for 3 years.', answer: 'will have been saving', hint: 'for', kind: 'khẳng định' },
            { id: 19, sentence: 'She ___ (not/teach) long enough to get tenure.', answer: 'will not have been teaching', hint: 'phủ định', kind: 'phủ định' },
            { id: 20, sentence: '___ you ___ (wait) for 2 hours by then?', answer: 'Will have been waiting', hint: 'nghi vấn', kind: 'nghi vấn' }
        ]
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
