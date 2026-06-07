// ============================================
// Grammar Group: Questions (Câu hỏi)
// ============================================

const group = {
    id: 'questions',
    nameVi: 'Câu hỏi',
    nameEn: 'Questions',
    icon: 'quiz',
    order: 14,
    lessons: [
        { id: 'yes-no-wh', nameVi: 'Câu hỏi Yes/No & Wh-', nameEn: 'Yes/No & Wh- Questions', icon: 'help', ielts: false },
        { id: 'tag-questions', nameVi: 'Câu hỏi đuôi', nameEn: 'Tag Questions', icon: 'more_horiz', ielts: false },
        { id: 'indirect-questions', nameVi: 'Câu hỏi gián tiếp', nameEn: 'Indirect Questions', icon: 'subdirectory_arrow_right', ielts: false }
    ]
};

const content = {
    'yes-no-wh': {
        usage: {
            intro: 'Câu hỏi Yes/No bắt đầu bằng trợ động từ; câu hỏi Wh- bắt đầu bằng từ để hỏi (what, where, when, why, who, how).',
            items: [
                { title: 'Yes/No — trợ động từ + S + V', icon: 'rule', examples: ['<b>Do</b> you like coffee?', '<b>Is</b> she here?'] },
                { title: 'Wh- hỏi thông tin', icon: 'help_outline', examples: ['<b>Where</b> do you live?', '<b>What</b> is your name?'] },
                { title: 'Câu hỏi về chủ ngữ (không đảo)', icon: 'person', examples: ['<b>Who</b> called you? (Tom called.)'] }
            ],
            signalWords: { label: 'Từ để hỏi', words: ['what (cái gì)', 'where (ở đâu)', 'when (khi nào)', 'why (tại sao)', 'who (ai)', 'how (như thế nào)'] }
        },
        formula: {
            note: 'Cấu trúc câu hỏi: <b>(Wh-) + trợ động từ + S + V chính?</b>',
            groups: [
                {
                    label: 'Câu hỏi Yes/No & Wh-',
                    sub: 'questions',
                    sentences: [
                        { kind: 'Yes/No', sign: '?', formula: 'Aux + S + V?', examples: ['<b>Does</b> he work here?'] },
                        { kind: 'Wh-', sign: '?', formula: 'Wh- + aux + S + V?', examples: ['<b>Where does</b> he work?'] },
                        { kind: 'Hỏi chủ ngữ', sign: '?', formula: 'Who/What + V?', examples: ['<b>Who lives</b> here?'] }
                    ],
                    subject: {
                        headers: ['Loại', 'Cấu trúc', 'Ví dụ'],
                        rows: [['Yes/No', 'aux + S + V', 'Did you go?'], ['Wh- (tân ngữ)', 'wh + aux + S + V', 'What did you buy?'], ['Wh- (chủ ngữ)', 'wh + V (không đảo)', 'Who broke it?']]
                    },
                    note: 'Khi hỏi về chủ ngữ (who/what làm chủ ngữ), KHÔNG dùng trợ động từ: <b>Who called?</b> — không phải <i>Who did call?</i>.'
                }
            ],
            contractions: []
        },
        exercises: [
            { id: 1, sentence: '___ you speak English? (Yes/No - HT đơn)', answer: 'Do', hint: 'aux', kind: 'nghi vấn' },
            { id: 2, sentence: '___ does she live? (hỏi nơi chốn)', answer: 'Where', hint: 'wh-word', kind: 'nghi vấn' },
            { id: 3, sentence: '___ is your favorite color? (hỏi cái gì)', answer: 'What', hint: 'wh-word', kind: 'nghi vấn' },
            { id: 4, sentence: '___ broke the window? (hỏi chủ ngữ - không đảo)', answer: 'Who', hint: 'hỏi chủ ngữ', kind: 'nghi vấn' },
            { id: 5, sentence: '___ did you arrive? (hỏi khi nào)', answer: 'When', hint: 'wh-word', kind: 'nghi vấn' },
            { id: 6, sentence: '___ she finished her homework? (Yes/No - HT hoàn thành)', answer: 'Has', hint: 'aux', kind: 'nghi vấn' }
        ]
    },
    'tag-questions': {
        usage: {
            intro: 'Câu hỏi đuôi là câu hỏi ngắn ở cuối câu để <b>xác nhận thông tin</b>. Câu khẳng định → đuôi phủ định và ngược lại.',
            items: [
                { title: 'Khẳng định → đuôi phủ định', icon: 'add', examples: ['You are tired, <b>aren\'t you</b>?', 'She likes it, <b>doesn\'t she</b>?'] },
                { title: 'Phủ định → đuôi khẳng định', icon: 'remove', examples: ['You aren\'t busy, <b>are you</b>?', 'He can\'t swim, <b>can he</b>?'] }
            ],
            signalWords: { label: 'Quy tắc', words: ['Khẳng định → đuôi (-)', 'Phủ định → đuôi (+)', 'dùng cùng trợ động từ + đại từ chủ ngữ'] }
        },
        formula: {
            note: 'Phần đuôi dùng <b>cùng trợ động từ</b> với mệnh đề chính + <b>đại từ</b> tương ứng chủ ngữ.',
            groups: [
                {
                    label: 'Câu hỏi đuôi',
                    sub: 'tag questions',
                    sentences: [
                        { kind: 'Câu (+)', sign: '+', formula: 'S + V(+), aux(−) + đại từ?', examples: ['She is nice, <b>isn\'t she</b>?'] },
                        { kind: 'Câu (−)', sign: '−', formula: 'S + V(−), aux(+) + đại từ?', examples: ['They don\'t know, <b>do they</b>?'] }
                    ],
                    subject: {
                        headers: ['Mệnh đề chính', 'Đuôi'],
                        rows: [['You are..., ', "aren't you?"], ["She doesn't..., ", 'does she?'], ['He can..., ', "can't he?"], ["I am..., ", "aren't I?"]]
                    },
                    note: 'Ngoại lệ: "I am..." → đuôi là <b>aren\'t I?</b>. "Let\'s..." → đuôi là <b>shall we?</b>.'
                }
            ],
            contractions: ["isn't = is not", "aren't = are not", "doesn't = does not"]
        },
        exercises: [
            { id: 1, sentence: 'You are a student, ___? (đuôi)', answer: 'aren\'t you', hint: 'khẳng định → phủ định', kind: 'nghi vấn' },
            { id: 2, sentence: 'She doesn\'t like fish, ___? (đuôi)', answer: 'does she', hint: 'phủ định → khẳng định', kind: 'nghi vấn' },
            { id: 3, sentence: 'They can swim, ___? (đuôi)', answer: 'can\'t they', hint: 'khẳng định → phủ định', kind: 'nghi vấn' },
            { id: 4, sentence: 'He won\'t come, ___? (đuôi)', answer: 'will he', hint: 'phủ định → khẳng định', kind: 'nghi vấn' },
            { id: 5, sentence: 'It is cold today, ___? (đuôi)', answer: 'isn\'t it', hint: 'khẳng định → phủ định', kind: 'nghi vấn' },
            { id: 6, sentence: 'We finished, ___? (đuôi HT đơn)', answer: 'didn\'t we', hint: 'khẳng định → phủ định', kind: 'nghi vấn' }
        ]
    },
    'indirect-questions': {
        usage: {
            intro: 'Câu hỏi gián tiếp lịch sự và trang trọng hơn, dùng mở đầu như "Could you tell me..." và trật tự <b>S + V</b> (không đảo).',
            items: [
                { title: 'Mở đầu lịch sự', icon: 'volunteer_activism', examples: ['<b>Could you tell me</b> where the bank is?', '<b>Do you know</b> what time it is?'] },
                { title: 'Yes/No → dùng if/whether', icon: 'rule', examples: ['<b>I wonder if</b> she is coming.'] }
            ],
            signalWords: { label: 'Mở đầu', words: ['Could you tell me...', 'Do you know...', 'I wonder...', 'Would you mind telling me...'] }
        },
        formula: {
            note: 'Trong câu hỏi gián tiếp, dùng trật tự câu kể <b>S + V</b>, KHÔNG đảo trợ động từ.',
            groups: [
                {
                    label: 'Câu hỏi gián tiếp',
                    sub: 'indirect questions',
                    sentences: [
                        { kind: 'Wh-', sign: '?', formula: 'Mở đầu + wh- + S + V?', examples: ['Do you know <b>where she lives</b>?'] },
                        { kind: 'Yes/No', sign: '?', formula: 'Mở đầu + if/whether + S + V?', examples: ['I wonder <b>if it is open</b>.'] }
                    ],
                    subject: {
                        headers: ['Trực tiếp', 'Gián tiếp'],
                        rows: [['Where is the station?', 'Could you tell me where the station is?'], ['Is it open?', 'Do you know if it is open?']]
                    },
                    note: 'Lỗi thường gặp: giữ trật tự đảo. SAI <i>Do you know where is it?</i> → ĐÚNG <b>Do you know where it is?</b>.'
                }
            ],
            contractions: []
        },
        exercises: [
            { id: 1, sentence: 'Could you tell me where the station ___? (gián tiếp)', answer: 'is', hint: 'S + V', kind: 'nghi vấn' },
            { id: 2, sentence: 'Do you know what time the shop ___ (open)? (gián tiếp)', answer: 'opens', hint: 'S + V', kind: 'nghi vấn' },
            { id: 3, sentence: 'I wonder ___ she will come. (Yes/No)', answer: 'if', hint: 'if/whether', kind: 'nghi vấn' },
            { id: 4, sentence: 'Can you tell me how much this ___ (cost)? (gián tiếp)', answer: 'costs', hint: 'S + V', kind: 'nghi vấn' },
            { id: 5, sentence: 'Do you know where he ___? (sống - gián tiếp)', answer: 'lives', hint: 'S + V', kind: 'nghi vấn' },
            { id: 6, sentence: 'I\'d like to know ___ the meeting is cancelled. (Yes/No)', answer: 'whether', hint: 'if/whether', kind: 'nghi vấn' }
        ]
    }
};

export default { group, content };
