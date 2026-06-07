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
            { id: 6, sentence: 'The thief ___ (catch) by the police last night.', answer: 'was caught', hint: 'be + V3', kind: 'khẳng định' }
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
            { id: 6, sentence: 'The report ___ (not/finish) yet. (HT hoàn thành phủ định)', answer: 'has not been finished', hint: 'phủ định', kind: 'phủ định' }
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
            { id: 6, sentence: 'It is ___ (think) that prices will rise.', answer: 'thought', hint: 'V3', kind: 'khẳng định' }
        ]
    }
};

export default { group, content };
