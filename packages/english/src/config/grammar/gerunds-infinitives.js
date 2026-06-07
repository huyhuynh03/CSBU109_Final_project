// ============================================
// Grammar Group: Gerunds & Infinitives (Danh động từ & Động từ nguyên mẫu)
// ============================================

const group = {
    id: 'gerunds-infinitives',
    nameVi: 'Danh động từ & Động từ nguyên mẫu',
    nameEn: 'Gerunds & Infinitives',
    icon: 'merge_type',
    order: 7,
    lessons: [
        { id: 'gerund-usage', nameVi: 'Danh động từ (V-ing)', nameEn: 'Gerunds', icon: 'play_arrow', ielts: true },
        { id: 'infinitive-usage', nameVi: 'Động từ nguyên mẫu (to V)', nameEn: 'Infinitives', icon: 'arrow_forward', ielts: true },
        { id: 'gerund-vs-infinitive', nameVi: 'Phân biệt V-ing & to V', nameEn: 'Gerund vs Infinitive', icon: 'compare_arrows', ielts: false }
    ]
};

const content = {
    'gerund-usage': {
        usage: {
            intro: 'Danh động từ (gerund) là <b>V-ing</b> dùng như một danh từ — làm chủ ngữ, tân ngữ hoặc sau giới từ.',
            items: [
                { title: 'Làm chủ ngữ', icon: 'subject', examples: ['<b>Swimming</b> is good exercise.', '<b>Smoking</b> is harmful.'] },
                { title: 'Sau giới từ', icon: 'link', examples: ['She is good at <b>cooking</b>.', 'Thanks for <b>helping</b> me.'] },
                { title: 'Sau một số động từ (enjoy, avoid, finish...)', icon: 'list', examples: ['I enjoy <b>reading</b>.', 'He avoided <b>answering</b>.'] }
            ],
            signalWords: { label: 'Động từ + V-ing', words: ['enjoy, avoid, finish, mind, suggest', 'consider, practice, deny, admit', 'after giới từ (at, of, in, for, about)'] }
        },
        formula: {
            note: 'Sau <b>giới từ</b> luôn dùng V-ing, không dùng to V.',
            groups: [
                {
                    label: 'Danh động từ',
                    sub: 'V-ing as noun',
                    sentences: [
                        { kind: 'Chủ ngữ', sign: '+', formula: 'V-ing + V + ...', examples: ['<b>Running</b> keeps me fit.'] },
                        { kind: 'Sau động từ', sign: '+', formula: 'S + V + V-ing', examples: ['They enjoy <b>dancing</b>.'] },
                        { kind: 'Sau giới từ', sign: '+', formula: 'prep + V-ing', examples: ['I\'m interested in <b>learning</b>.'] }
                    ],
                    subject: { headers: ['Vị trí', 'Dùng V-ing'], rows: [['Sau enjoy/avoid/finish', 'Có'], ['Sau giới từ', 'Có'], ['Làm chủ ngữ', 'Có']] },
                    note: 'Lỗi thường gặp: SAI <i>I look forward to meet you</i> → ĐÚNG <b>I look forward to meeting you</b> (to ở đây là giới từ).'
                }
            ],
            contractions: []
        },
        exercises: [
            { id: 1, sentence: '___ (swim) is my favorite hobby.', answer: 'Swimming', hint: 'chủ ngữ', kind: 'khẳng định' },
            { id: 2, sentence: 'I enjoy ___ (read) books.', answer: 'reading', hint: 'sau enjoy', kind: 'khẳng định' },
            { id: 3, sentence: 'She is good at ___ (paint).', answer: 'painting', hint: 'sau giới từ', kind: 'khẳng định' },
            { id: 4, sentence: 'They finished ___ (clean) the house.', answer: 'cleaning', hint: 'sau finish', kind: 'khẳng định' },
            { id: 5, sentence: 'Thank you for ___ (help) me.', answer: 'helping', hint: 'sau giới từ', kind: 'khẳng định' },
            { id: 6, sentence: 'Would you mind ___ (close) the door?', answer: 'closing', hint: 'sau mind', kind: 'nghi vấn' }
        ]
    },
    'infinitive-usage': {
        usage: {
            intro: 'Động từ nguyên mẫu có "to" (<b>to + V</b>) dùng để diễn tả mục đích, sau một số động từ, tính từ.',
            items: [
                { title: 'Diễn tả mục đích', icon: 'flag', examples: ['I went out <b>to buy</b> milk.', 'She studies <b>to pass</b> the exam.'] },
                { title: 'Sau một số động từ (want, decide, hope...)', icon: 'list', examples: ['I want <b>to go</b> home.', 'They decided <b>to leave</b>.'] },
                { title: 'Sau tính từ', icon: 'star', examples: ['It\'s easy <b>to learn</b>.', 'I\'m happy <b>to help</b>.'] }
            ],
            signalWords: { label: 'Động từ + to V', words: ['want, decide, hope, plan, promise', 'agree, refuse, learn, offer, expect', 'sau tính từ: easy/hard/happy to V'] }
        },
        formula: {
            note: 'Một số động từ đi với <b>O + to V</b>: want/ask/tell/advise someone to do.',
            groups: [
                {
                    label: 'Động từ nguyên mẫu',
                    sub: 'to-infinitive',
                    sentences: [
                        { kind: 'Mục đích', sign: '+', formula: 'S + V + to + V', examples: ['He runs <b>to stay</b> healthy.'] },
                        { kind: 'Sau động từ', sign: '+', formula: 'S + V + to + V', examples: ['I hope <b>to see</b> you.'] },
                        { kind: 'O + to V', sign: '+', formula: 'S + V + O + to + V', examples: ['She wants me <b>to come</b>.'] }
                    ],
                    subject: { headers: ['Vị trí', 'Dùng to V'], rows: [['Sau want/decide/hope', 'Có'], ['Diễn tả mục đích', 'Có'], ['Sau tính từ', 'Có']] },
                    note: 'Sau modal verbs (can, must, will) dùng <b>V nguyên thể không to</b>: I can <b>swim</b> — không phải <i>to swim</i>.'
                }
            ],
            contractions: []
        },
        exercises: [
            { id: 1, sentence: 'I want ___ (travel) around the world.', answer: 'to travel', hint: 'sau want', kind: 'khẳng định' },
            { id: 2, sentence: 'She decided ___ (study) abroad.', answer: 'to study', hint: 'sau decide', kind: 'khẳng định' },
            { id: 3, sentence: 'He went to the shop ___ (buy) some bread. (mục đích)', answer: 'to buy', hint: 'mục đích', kind: 'khẳng định' },
            { id: 4, sentence: 'It is important ___ (be) honest.', answer: 'to be', hint: 'sau tính từ', kind: 'khẳng định' },
            { id: 5, sentence: 'They asked me ___ (wait) outside.', answer: 'to wait', hint: 'O + to V', kind: 'khẳng định' },
            { id: 6, sentence: 'We hope ___ (win) the game.', answer: 'to win', hint: 'sau hope', kind: 'khẳng định' }
        ]
    },
    'gerund-vs-infinitive': {
        usage: {
            intro: 'Một số động từ theo sau bằng cả V-ing và to V nhưng <b>nghĩa khác nhau</b> (remember, forget, stop, try).',
            items: [
                { title: 'stop + V-ing / to V', icon: 'pan_tool', examples: ['He stopped <b>smoking</b>. (bỏ thuốc)', 'He stopped <b>to smoke</b>. (dừng lại để hút)'] },
                { title: 'remember + V-ing / to V', icon: 'psychology', examples: ['I remember <b>locking</b> the door. (nhớ đã làm)', 'Remember <b>to lock</b> the door. (nhớ phải làm)'] },
                { title: 'try + V-ing / to V', icon: 'science', examples: ['Try <b>adding</b> salt. (thử cách)', 'Try <b>to finish</b>. (cố gắng)'] }
            ],
            signalWords: { label: 'Đổi nghĩa', words: ['stop, remember, forget, regret, try, mean', 'V-ing = việc đã/đang xảy ra', 'to V = việc sẽ/cần làm'] }
        },
        formula: {
            note: 'Quy tắc chung: <b>V-ing</b> nhìn về việc đã/đang diễn ra; <b>to V</b> nhìn về việc sẽ làm/cần làm.',
            groups: [
                {
                    label: 'Động từ đổi nghĩa',
                    sub: 'V-ing vs to V',
                    sentences: [
                        { kind: 'V-ing', sign: '+', formula: 'remember/forget + V-ing (đã làm)', examples: ['I forgot <b>meeting</b> him. (quên đã gặp)'] },
                        { kind: 'to V', sign: '+', formula: 'remember/forget + to V (cần làm)', examples: ['I forgot <b>to meet</b> him. (quên phải gặp)'] }
                    ],
                    subject: {
                        headers: ['Động từ', '+ V-ing', '+ to V'],
                        rows: [['stop', 'ngừng làm việc đó', 'dừng để làm việc khác'], ['remember', 'nhớ đã làm', 'nhớ phải làm'], ['try', 'thử nghiệm', 'cố gắng']]
                    },
                    note: 'Sau like/love/hate có thể dùng cả hai mà nghĩa gần như nhau (thiên về thói quen vs sở thích cụ thể).'
                }
            ],
            contractions: []
        },
        exercises: [
            { id: 1, sentence: 'Remember ___ (turn) off the lights before leaving. (cần làm)', answer: 'to turn', hint: 'to V', kind: 'khẳng định' },
            { id: 2, sentence: 'I remember ___ (visit) this place as a child. (đã làm)', answer: 'visiting', hint: 'V-ing', kind: 'khẳng định' },
            { id: 3, sentence: 'She stopped ___ (work) because she was tired. (ngừng hẳn)', answer: 'working', hint: 'V-ing', kind: 'khẳng định' },
            { id: 4, sentence: 'On the way, we stopped ___ (have) lunch. (dừng để)', answer: 'to have', hint: 'to V', kind: 'khẳng định' },
            { id: 5, sentence: 'Don\'t forget ___ (call) your mother. (cần làm)', answer: 'to call', hint: 'to V', kind: 'khẳng định' },
            { id: 6, sentence: 'I tried ___ (open) the door but it was locked. (cố gắng)', answer: 'to open', hint: 'to V', kind: 'khẳng định' }
        ]
    }
};

export default { group, content };
