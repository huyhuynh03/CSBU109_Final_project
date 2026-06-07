// ============================================
// Grammar Group: Passive Voice (Câu bị động)
// ============================================

const group = {
    id: 'passive-voice',
    nameVi: 'Câu bị động',
    nameEn: 'Passive Voice',
    icon: 'swap_horiz',
    order: 3,
    lessons: [
        { id: 'passive-basic', nameVi: 'Bị động cơ bản', nameEn: 'Basic Passive', icon: 'sync_alt', ielts: true },
        { id: 'passive-tenses', nameVi: 'Bị động qua các thì', nameEn: 'Passive in Tenses', icon: 'schedule', ielts: true },
        { id: 'passive-special', nameVi: 'Bị động đặc biệt', nameEn: 'Special Passives', icon: 'star', ielts: false }
    ]
};

const content = {
    'passive-basic': {
        usage: {
            intro: 'Câu bị động dùng khi muốn nhấn mạnh <b>đối tượng chịu tác động</b> của hành động, hoặc khi không biết / không quan trọng ai thực hiện.',
            items: [
                { title: 'Nhấn mạnh đối tượng bị tác động', icon: 'center_focus_strong', examples: ['The Mona Lisa <b>was painted</b> by da Vinci.', 'This bridge <b>was built</b> in 1990.'] },
                { title: 'Không biết / không cần nêu chủ thể hành động', icon: 'help_outline', examples: ['My wallet <b>was stolen</b>. (không biết ai lấy)', 'English <b>is spoken</b> here.'] },
                { title: 'Văn phong khách quan, học thuật (IELTS Writing)', icon: 'school', examples: ['The data <b>was collected</b> over six months.', 'The results <b>are shown</b> in the chart.'] }
            ],
            signalWords: { label: 'Cấu trúc lõi', words: ['be + V3 (past participle)', 'by + tác nhân (optional)', 'chủ ngữ bị động = tân ngữ của câu chủ động'] }
        },
        formula: {
            note: 'Quy tắc chuyển: <b>Tân ngữ</b> câu chủ động → <b>chủ ngữ</b> câu bị động. Động từ → <b>be + V3</b> (be chia theo thì gốc). Chủ ngữ gốc → <b>by + ...</b> (có thể lược bỏ).',
            groups: [
                {
                    label: 'Công thức tổng quát',
                    sub: 'be + V3',
                    sentences: [
                        { kind: 'Chủ động', sign: '→', formula: 'S + V + O', examples: ['They <b>build</b> houses.'] },
                        { kind: 'Bị động', sign: '+', formula: 'O + be + V3 (+ by S)', examples: ['Houses <b>are built</b> (by them).'] },
                        { kind: 'Phủ định', sign: '−', formula: 'O + be + not + V3', examples: ['The car <b>isn\'t washed</b> daily.'] }
                    ],
                    subject: { headers: ['Câu chủ động', 'Câu bị động'], rows: [['S + V + O', 'O + be + V3 + (by S)'], ['Active: nhấn mạnh chủ thể', 'Passive: nhấn mạnh đối tượng']] },
                    note: 'Chỉ <b>ngoại động từ</b> (transitive verb — có tân ngữ) mới chuyển sang bị động được.'
                }
            ],
            contractions: ["isn't = is not", "aren't = are not", "wasn't = was not", "weren't = were not"]
        },
        exercises: [
            { id: 1, sentence: 'The letter ___ (write) by Tom. (quá khứ đơn)', answer: 'was written', hint: 'be + V3', kind: 'khẳng định' },
            { id: 2, sentence: 'Rice ___ (grow) in tropical countries. (hiện tại đơn)', answer: 'is grown', hint: 'be + V3', kind: 'khẳng định' },
            { id: 3, sentence: 'These cars ___ (make) in Japan.', answer: 'are made', hint: 'be + V3', kind: 'khẳng định' },
            { id: 4, sentence: 'The window ___ (not/clean) yesterday.', answer: 'was not cleaned', hint: 'phủ định', kind: 'phủ định' },
            { id: 5, sentence: 'English ___ (speak) in many countries.', answer: 'is spoken', hint: 'be + V3', kind: 'khẳng định' },
            { id: 6, sentence: 'The thief ___ (catch) by the police last night.', answer: 'was caught', hint: 'be + V3', kind: 'khẳng định' },
            { id: 7, sentence: 'Coffee ___ (produce) in Brazil. (hiện tại đơn)', answer: 'is produced', hint: 'be + V3', kind: 'khẳng định' },
            { id: 8, sentence: 'The bridge ___ (design) by a famous architect. (quá khứ)', answer: 'was designed', hint: 'be + V3', kind: 'khẳng định' },
            { id: 9, sentence: 'These products ___ (not/sell) in our shop.', answer: 'are not sold', hint: 'phủ định', kind: 'phủ định' },
            { id: 10, sentence: 'The museum ___ (visit) by thousands of tourists every year.', answer: 'is visited', hint: 'be + V3', kind: 'khẳng định' },
            { id: 11, sentence: 'My bike ___ (steal) last weekend.', answer: 'was stolen', hint: 'be + V3', kind: 'khẳng định' },
            { id: 12, sentence: 'Spanish ___ (teach) in this school.', answer: 'is taught', hint: 'be + V3', kind: 'khẳng định' },
            { id: 13, sentence: 'The documents ___ (not/sign) yesterday.', answer: 'were not signed', hint: 'phủ định', kind: 'phủ định' },
            { id: 14, sentence: 'The results ___ (announce) tomorrow.', answer: 'are announced', hint: 'be + V3', kind: 'khẳng định' },
            { id: 15, sentence: 'A new hospital ___ (open) last month.', answer: 'was opened', hint: 'be + V3', kind: 'khẳng định' },
            { id: 16, sentence: 'The food ___ (serve) at eight o\'clock.', answer: 'is served', hint: 'be + V3', kind: 'khẳng định' },
            { id: 17, sentence: 'The windows ___ (break) during the storm.', answer: 'were broken', hint: 'be + V3', kind: 'khẳng định' },
            { id: 18, sentence: 'This song ___ (love) by millions of fans.', answer: 'is loved', hint: 'be + V3', kind: 'khẳng định' },
            { id: 19, sentence: 'The lost child ___ (find) safe and well.', answer: 'was found', hint: 'be + V3', kind: 'khẳng định' },
            { id: 20, sentence: 'These rules ___ (not/understand) by the new students.', answer: 'are not understood', hint: 'phủ định', kind: 'phủ định' }
        ]
    },
    'passive-tenses': {
        usage: {
            intro: 'Câu bị động tồn tại ở mọi thì. Phần <b>be</b> được chia theo thì, còn động từ chính luôn ở dạng <b>V3</b>.',
            items: [
                { title: 'Hiện tại đơn / tiếp diễn', icon: 'wb_sunny', examples: ['The room <b>is cleaned</b> daily.', 'The house <b>is being painted</b> now.'] },
                { title: 'Quá khứ đơn / tiếp diễn', icon: 'history', examples: ['The cake <b>was eaten</b>.', 'The road <b>was being repaired</b>.'] },
                { title: 'Hoàn thành / tương lai', icon: 'done_all', examples: ['The work <b>has been done</b>.', 'It <b>will be finished</b> soon.'] }
            ],
            signalWords: { label: 'Ghi nhớ', words: ['am/is/are + V3', 'was/were + V3', 'has/have been + V3', 'will be + V3', 'is/are being + V3'] }
        },
        formula: {
            note: 'Bảng chuyển bị động theo thì — chỉ phần <b>be</b> thay đổi.',
            groups: [
                {
                    label: 'Bị động theo từng thì',
                    sub: 'be + V3',
                    sentences: [
                        { kind: 'HT đơn', sign: '+', formula: 'am/is/are + V3', examples: ['It <b>is done</b>.'] },
                        { kind: 'QK đơn', sign: '+', formula: 'was/were + V3', examples: ['It <b>was done</b>.'] },
                        { kind: 'HT hoàn thành', sign: '+', formula: 'has/have been + V3', examples: ['It <b>has been done</b>.'] }
                    ],
                    subject: {
                        headers: ['Thì', 'Bị động', 'Ví dụ'],
                        rows: [
                            ['Hiện tại đơn', 'am/is/are + V3', 'is cleaned'],
                            ['Hiện tại tiếp diễn', 'is/are being + V3', 'is being cleaned'],
                            ['Quá khứ đơn', 'was/were + V3', 'was cleaned'],
                            ['Hiện tại hoàn thành', 'has/have been + V3', 'has been cleaned'],
                            ['Tương lai đơn', 'will be + V3', 'will be cleaned'],
                            ['Modal', 'modal + be + V3', 'must be cleaned']
                        ]
                    },
                    note: 'Thì hoàn thành tiếp diễn và tương lai tiếp diễn hầu như KHÔNG dùng ở bị động (quá rườm rà).'
                }
            ],
            contractions: ["hasn't been = has not been", "won't be = will not be"]
        },
        exercises: [
            { id: 1, sentence: 'The house ___ (paint) right now. (HT tiếp diễn)', answer: 'is being painted', hint: 'is being + V3', kind: 'khẳng định' },
            { id: 2, sentence: 'The project ___ (complete) by next week. (tương lai)', answer: 'will be completed', hint: 'will be + V3', kind: 'khẳng định' },
            { id: 3, sentence: 'All the tickets ___ (sell) already. (HT hoàn thành)', answer: 'have been sold', hint: 'have been + V3', kind: 'khẳng định' },
            { id: 4, sentence: 'The bridge ___ (repair) when we arrived. (QK tiếp diễn)', answer: 'was being repaired', hint: 'was being + V3', kind: 'khẳng định' },
            { id: 5, sentence: 'This rule ___ (must/follow) by everyone. (modal)', answer: 'must be followed', hint: 'modal + be + V3', kind: 'khẳng định' },
            { id: 6, sentence: 'The report ___ (not/finish) yet. (HT hoàn thành phủ định)', answer: 'has not been finished', hint: 'phủ định', kind: 'phủ định' },
            { id: 7, sentence: 'The dinner ___ (cook) at the moment. (HT tiếp diễn)', answer: 'is being cooked', hint: 'is being + V3', kind: 'khẳng định' },
            { id: 8, sentence: 'The new stadium ___ (build) by 2030. (tương lai)', answer: 'will be built', hint: 'will be + V3', kind: 'khẳng định' },
            { id: 9, sentence: 'The keys ___ (lose) somewhere in the park. (HT hoàn thành)', answer: 'have been lost', hint: 'have been + V3', kind: 'khẳng định' },
            { id: 10, sentence: 'The streets ___ (clean) when I left this morning. (QK tiếp diễn)', answer: 'were being cleaned', hint: 'were being + V3', kind: 'khẳng định' },
            { id: 11, sentence: 'This medicine ___ (should/keep) in a cool place. (modal)', answer: 'should be kept', hint: 'modal + be + V3', kind: 'khẳng định' },
            { id: 12, sentence: 'The garden ___ (water) every morning. (HT đơn)', answer: 'is watered', hint: 'is + V3', kind: 'khẳng định' },
            { id: 13, sentence: 'The decision ___ (make) at yesterday\'s meeting. (QK đơn)', answer: 'was made', hint: 'was + V3', kind: 'khẳng định' },
            { id: 14, sentence: 'The package ___ (deliver) tomorrow morning. (tương lai)', answer: 'will be delivered', hint: 'will be + V3', kind: 'khẳng định' },
            { id: 15, sentence: 'The patient ___ (examine) by the doctor right now. (HT tiếp diễn)', answer: 'is being examined', hint: 'is being + V3', kind: 'khẳng định' },
            { id: 16, sentence: 'All the homework ___ (complete) already. (HT hoàn thành)', answer: 'has been completed', hint: 'has been + V3', kind: 'khẳng định' },
            { id: 17, sentence: 'The contract ___ (must/review) before signing. (modal)', answer: 'must be reviewed', hint: 'modal + be + V3', kind: 'khẳng định' },
            { id: 18, sentence: 'The classrooms ___ (not/use) during the holiday. (QK đơn phủ định)', answer: 'were not used', hint: 'phủ định', kind: 'phủ định' },
            { id: 19, sentence: 'The road ___ (repair) at the moment, so it\'s closed. (HT tiếp diễn)', answer: 'is being repaired', hint: 'is being + V3', kind: 'khẳng định' },
            { id: 20, sentence: 'The invitations ___ (send) by the end of the week. (tương lai)', answer: 'will be sent', hint: 'will be + V3', kind: 'khẳng định' }
        ]
    },
    'passive-special': {
        usage: {
            intro: 'Một số cấu trúc bị động đặc biệt thường gặp trong văn viết trang trọng và báo chí.',
            items: [
                { title: 'Bị động với động từ tường thuật (It is said that...)', icon: 'record_voice_over', examples: ['<b>It is said that</b> he is rich.', 'He <b>is said to be</b> rich.'] },
                { title: 'Bị động với have/get something done (nhờ làm)', icon: 'build', examples: ['I <b>had my car repaired</b>.', 'She <b>got her hair cut</b>.'] },
                { title: 'Bị động với động từ có 2 tân ngữ', icon: 'redo', examples: ['I <b>was given</b> a gift.', 'A gift <b>was given to</b> me.'] }
            ],
            signalWords: { label: 'Cấu trúc', words: ['It is said/believed/thought that + clause', 'S + be said to + V', 'have/get + O + V3'] }
        },
        formula: {
            note: 'Hai cách diễn đạt bị động tường thuật và cấu trúc "nhờ vả" (causative).',
            groups: [
                {
                    label: 'Bị động tường thuật & Causative',
                    sub: 'reporting / causative',
                    sentences: [
                        { kind: 'Mệnh đề', sign: '+', formula: 'It + be + V3(say/believe) + that + clause', examples: ['<b>It is believed that</b> she left.'] },
                        { kind: 'Rút gọn', sign: '+', formula: 'S + be + V3 + to + V', examples: ['She <b>is believed to have</b> left.'] },
                        { kind: 'Causative', sign: '+', formula: 'S + have/get + O + V3', examples: ['I <b>had my house painted</b>.'] }
                    ],
                    subject: { headers: ['Cấu trúc', 'Nghĩa'], rows: [['have/get + O + V3', 'nhờ/thuê người khác làm'], ['It is said that...', 'người ta nói rằng...']] },
                    note: 'Phân biệt: <b>I cut my hair</b> (tự cắt) vs <b>I had my hair cut</b> (nhờ thợ cắt).'
                }
            ],
            contractions: []
        },
        exercises: [
            { id: 1, sentence: 'It is ___ (say) that the company is in trouble.', answer: 'said', hint: 'V3', kind: 'khẳng định' },
            { id: 2, sentence: 'I had my computer ___ (fix) yesterday.', answer: 'fixed', hint: 'have + O + V3', kind: 'khẳng định' },
            { id: 3, sentence: 'She got her photo ___ (take) by a professional.', answer: 'taken', hint: 'get + O + V3', kind: 'khẳng định' },
            { id: 4, sentence: 'He is ___ (believe) to be the best player.', answer: 'believed', hint: 'V3', kind: 'khẳng định' },
            { id: 5, sentence: 'We are getting the roof ___ (repair) next week.', answer: 'repaired', hint: 'get + O + V3', kind: 'khẳng định' },
            { id: 6, sentence: 'It is ___ (think) that prices will rise.', answer: 'thought', hint: 'V3', kind: 'khẳng định' },
            { id: 7, sentence: 'He is ___ (know) to have lived abroad for years.', answer: 'known', hint: 'V3', kind: 'khẳng định' },
            { id: 8, sentence: 'They are getting their kitchen ___ (renovate) this summer.', answer: 'renovated', hint: 'get + O + V3', kind: 'khẳng định' },
            { id: 9, sentence: 'It is ___ (report) that the storm caused great damage.', answer: 'reported', hint: 'V3', kind: 'khẳng định' },
            { id: 10, sentence: 'I need to have my eyes ___ (test) soon.', answer: 'tested', hint: 'have + O + V3', kind: 'khẳng định' },
            { id: 11, sentence: 'The actor is ___ (rumour) to be retiring.', answer: 'rumoured', hint: 'V3', kind: 'khẳng định' },
            { id: 12, sentence: 'She had her passport ___ (renew) last month.', answer: 'renewed', hint: 'have + O + V3', kind: 'khẳng định' },
            { id: 13, sentence: 'It is ___ (expect) that the economy will improve.', answer: 'expected', hint: 'V3', kind: 'khẳng định' },
            { id: 14, sentence: 'We got the documents ___ (translate) by an expert.', answer: 'translated', hint: 'get + O + V3', kind: 'khẳng định' },
            { id: 15, sentence: 'The minister is ___ (suppose) to make a statement today.', answer: 'supposed', hint: 'V3', kind: 'khẳng định' },
            { id: 16, sentence: 'They are having a new fence ___ (install) around the garden.', answer: 'installed', hint: 'have + O + V3', kind: 'khẳng định' },
            { id: 17, sentence: 'It is ___ (claim) that the product is completely safe.', answer: 'claimed', hint: 'V3', kind: 'khẳng định' },
            { id: 18, sentence: 'I must get my watch ___ (repair) — it stopped working.', answer: 'repaired', hint: 'get + O + V3', kind: 'khẳng định' },
            { id: 19, sentence: 'The professor is ___ (consider) to be an expert in the field.', answer: 'considered', hint: 'V3', kind: 'khẳng định' },
            { id: 20, sentence: 'She had her portrait ___ (paint) by a famous artist.', answer: 'painted', hint: 'have + O + V3', kind: 'khẳng định' }
        ]
    }
};

export default { group, content };
