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
            { id: 6, sentence: 'Would you mind ___ (close) the door?', answer: 'closing', hint: 'sau mind', kind: 'nghi vấn' },
            { id: 7, sentence: 'He avoided ___ (talk) about the problem.', answer: 'talking', hint: 'sau avoid', kind: 'khẳng định' },
            { id: 8, sentence: '___ (smoke) is not allowed here. (chủ ngữ)', answer: 'Smoking', hint: 'chủ ngữ', kind: 'khẳng định' },
            { id: 9, sentence: 'She suggested ___ (go) to the cinema.', answer: 'going', hint: 'sau suggest', kind: 'khẳng định' },
            { id: 10, sentence: 'I\'m interested in ___ (learn) Spanish.', answer: 'learning', hint: 'sau giới từ', kind: 'khẳng định' },
            { id: 11, sentence: 'They practised ___ (speak) English every day.', answer: 'speaking', hint: 'sau practise', kind: 'khẳng định' },
            { id: 12, sentence: 'He denied ___ (steal) the money.', answer: 'stealing', hint: 'sau deny', kind: 'khẳng định' },
            { id: 13, sentence: 'I look forward to ___ (hear) from you.', answer: 'hearing', hint: 'to là giới từ', kind: 'khẳng định' },
            { id: 14, sentence: '___ (exercise) regularly improves your health. (chủ ngữ)', answer: 'Exercising', hint: 'chủ ngữ', kind: 'khẳng định' },
            { id: 15, sentence: 'She is afraid of ___ (fly).', answer: 'flying', hint: 'sau giới từ', kind: 'khẳng định' },
            { id: 16, sentence: 'We considered ___ (move) to a bigger house.', answer: 'moving', hint: 'sau consider', kind: 'khẳng định' },
            { id: 17, sentence: 'Thank you for ___ (invite) me to the party.', answer: 'inviting', hint: 'sau giới từ', kind: 'khẳng định' },
            { id: 18, sentence: 'Do you mind ___ (wait) a few minutes?', answer: 'waiting', hint: 'sau mind', kind: 'nghi vấn' },
            { id: 19, sentence: 'He admitted ___ (break) the window.', answer: 'breaking', hint: 'sau admit', kind: 'khẳng định' },
            { id: 20, sentence: 'I can\'t help ___ (laugh) at his jokes.', answer: 'laughing', hint: "can't help + V-ing", kind: 'khẳng định' }
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
            { id: 6, sentence: 'We hope ___ (win) the game.', answer: 'to win', hint: 'sau hope', kind: 'khẳng định' },
            { id: 7, sentence: 'He promised ___ (return) the book soon.', answer: 'to return', hint: 'sau promise', kind: 'khẳng định' },
            { id: 8, sentence: 'They agreed ___ (meet) at noon.', answer: 'to meet', hint: 'sau agree', kind: 'khẳng định' },
            { id: 9, sentence: 'She refused ___ (answer) the question.', answer: 'to answer', hint: 'sau refuse', kind: 'khẳng định' },
            { id: 10, sentence: 'I\'m learning ___ (drive) a car.', answer: 'to drive', hint: 'sau learn', kind: 'khẳng định' },
            { id: 11, sentence: 'The teacher told us ___ (open) our books.', answer: 'to open', hint: 'O + to V', kind: 'khẳng định' },
            { id: 12, sentence: 'It\'s hard ___ (believe) this story.', answer: 'to believe', hint: 'sau tính từ', kind: 'khẳng định' },
            { id: 13, sentence: 'We expect ___ (arrive) by evening.', answer: 'to arrive', hint: 'sau expect', kind: 'khẳng định' },
            { id: 14, sentence: 'He offered ___ (help) us move the boxes.', answer: 'to help', hint: 'sau offer', kind: 'khẳng định' },
            { id: 15, sentence: 'I called the office ___ (book) an appointment. (mục đích)', answer: 'to book', hint: 'mục đích', kind: 'khẳng định' },
            { id: 16, sentence: 'She advised me ___ (see) a specialist.', answer: 'to see', hint: 'O + to V', kind: 'khẳng định' },
            { id: 17, sentence: 'They plan ___ (open) a new branch.', answer: 'to open', hint: 'sau plan', kind: 'khẳng định' },
            { id: 18, sentence: 'I\'m glad ___ (meet) you at last.', answer: 'to meet', hint: 'sau tính từ', kind: 'khẳng định' },
            { id: 19, sentence: 'He wants his children ___ (study) hard.', answer: 'to study', hint: 'O + to V', kind: 'khẳng định' },
            { id: 20, sentence: 'We went outside ___ (get) some fresh air. (mục đích)', answer: 'to get', hint: 'mục đích', kind: 'khẳng định' }
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
            { id: 6, sentence: 'I tried ___ (open) the door but it was locked. (cố gắng)', answer: 'to open', hint: 'to V', kind: 'khẳng định' },
            { id: 7, sentence: 'Why don\'t you try ___ (restart) the computer? (thử cách)', answer: 'restarting', hint: 'V-ing', kind: 'khẳng định' },
            { id: 8, sentence: 'I regret ___ (tell) you that the trip is cancelled. (lấy làm tiếc thông báo)', answer: 'to tell', hint: 'to V', kind: 'khẳng định' },
            { id: 9, sentence: 'He regrets ___ (not/study) harder at school. (tiếc đã)', answer: 'not studying', hint: 'V-ing', kind: 'phủ định' },
            { id: 10, sentence: 'She forgot ___ (lock) the door, so it was open all day. (quên phải làm)', answer: 'to lock', hint: 'to V', kind: 'khẳng định' },
            { id: 11, sentence: 'I\'ll never forget ___ (see) the Eiffel Tower for the first time. (nhớ đã)', answer: 'seeing', hint: 'V-ing', kind: 'khẳng định' },
            { id: 12, sentence: 'We stopped ___ (talk) when the teacher came in. (ngừng hẳn)', answer: 'talking', hint: 'V-ing', kind: 'khẳng định' },
            { id: 13, sentence: 'They stopped ___ (rest) for a few minutes. (dừng để)', answer: 'to rest', hint: 'to V', kind: 'khẳng định' },
            { id: 14, sentence: 'Did you remember ___ (post) the letter? (nhớ phải làm)', answer: 'to post', hint: 'to V', kind: 'nghi vấn' },
            { id: 15, sentence: 'I clearly remember ___ (pay) the bill last week. (nhớ đã)', answer: 'paying', hint: 'V-ing', kind: 'khẳng định' },
            { id: 16, sentence: 'He meant ___ (call) you, but he forgot. (định làm)', answer: 'to call', hint: 'to V', kind: 'khẳng định' },
            { id: 17, sentence: 'Getting a visa means ___ (fill) in many forms. (kéo theo)', answer: 'filling', hint: 'V-ing', kind: 'khẳng định' },
            { id: 18, sentence: 'Try ___ (drink) some warm milk to sleep better. (thử cách)', answer: 'drinking', hint: 'V-ing', kind: 'khẳng định' },
            { id: 19, sentence: 'She regrets ___ (say) those words to him. (tiếc đã)', answer: 'saying', hint: 'V-ing', kind: 'khẳng định' },
            { id: 20, sentence: 'Please remember ___ (bring) your ID tomorrow. (nhớ phải làm)', answer: 'to bring', hint: 'to V', kind: 'khẳng định' }
        ]
    }
};

export default { group, content };
