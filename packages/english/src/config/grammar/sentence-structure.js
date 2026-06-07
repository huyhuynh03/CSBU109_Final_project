// ============================================
// Grammar Group: Sentence Structure (Cấu trúc câu nâng cao)
// ============================================

const group = {
    id: 'sentence-structure',
    nameVi: 'Cấu trúc câu nâng cao',
    nameEn: 'Sentence Structure',
    icon: 'segment',
    order: 12,
    lessons: [
        { id: 'sentence-types', nameVi: 'Các loại câu', nameEn: 'Sentence Types', icon: 'view_agenda', ielts: true },
        { id: 'inversion', nameVi: 'Đảo ngữ', nameEn: 'Inversion', icon: 'swap_vert', ielts: true },
        { id: 'cleft-sentences', nameVi: 'Câu chẻ nhấn mạnh', nameEn: 'Cleft Sentences', icon: 'call_split', ielts: false }
    ]
};

const content = {
    'sentence-types': {
        usage: {
            intro: 'Câu được phân loại theo cấu trúc mệnh đề: <b>đơn, ghép, phức, phức-ghép</b>.',
            items: [
                { title: 'Câu đơn (simple) — 1 mệnh đề độc lập', icon: 'looks_one', examples: ['I like coffee.', 'She runs every morning.'] },
                { title: 'Câu ghép (compound) — 2 mệnh đề + and/but/or', icon: 'looks_two', examples: ['I like tea, <b>but</b> she likes coffee.'] },
                { title: 'Câu phức (complex) — chính + phụ thuộc', icon: 'looks_3', examples: ['<b>When it rains</b>, I stay home.'] }
            ],
            signalWords: { label: 'Liên kết', words: ['FANBOYS (for, and, nor, but, or, yet, so) → câu ghép', 'because, when, although... → câu phức'] }
        },
        formula: {
            note: 'Câu ghép nối hai mệnh đề <b>ngang hàng</b>; câu phức có một mệnh đề <b>phụ thuộc</b>.',
            groups: [
                {
                    label: 'Các loại câu',
                    sub: 'sentence types',
                    sentences: [
                        { kind: 'Đơn', sign: '+', formula: 'S + V (+ O)', examples: ['Birds <b>fly</b>.'] },
                        { kind: 'Ghép', sign: '+', formula: 'S+V, FANBOYS S+V', examples: ['I came, <b>and</b> I saw.'] },
                        { kind: 'Phức', sign: '+', formula: 'Liên từ phụ thuộc + S+V, S+V', examples: ['<b>Because</b> I was tired, I slept.'] }
                    ],
                    subject: {
                        headers: ['Loại câu', 'Số mệnh đề', 'Liên kết'],
                        rows: [['Đơn', '1 độc lập', '—'], ['Ghép', '2 độc lập', 'and, but, or, so'], ['Phức', '1 chính + 1 phụ', 'when, because, if'], ['Phức-ghép', '2 chính + 1 phụ', 'kết hợp']]
                    },
                    note: 'Trong IELTS Writing, dùng đa dạng loại câu (đặc biệt câu phức) giúp đạt band cao về Grammatical Range.'
                }
            ],
            contractions: []
        },
        exercises: [
            { id: 1, sentence: 'I wanted to go, ___ it was raining. (nhưng → câu ghép)', answer: 'but', hint: 'FANBOYS', kind: 'khẳng định' },
            { id: 2, sentence: '___ she was tired, she finished the work. (mặc dù → câu phức)', answer: 'Although', hint: 'liên từ phụ thuộc', kind: 'khẳng định' },
            { id: 3, sentence: 'He studied hard, ___ he passed the exam. (vì vậy)', answer: 'so', hint: 'FANBOYS', kind: 'khẳng định' },
            { id: 4, sentence: 'We stayed home ___ it was cold. (bởi vì)', answer: 'because', hint: 'liên từ phụ thuộc', kind: 'khẳng định' },
            { id: 5, sentence: 'You can have tea ___ coffee. (hoặc)', answer: 'or', hint: 'FANBOYS', kind: 'khẳng định' },
            { id: 6, sentence: '___ you finish, let me know. (khi nào)', answer: 'When', hint: 'liên từ phụ thuộc', kind: 'khẳng định' }
        ]
    },
    'inversion': {
        usage: {
            intro: 'Đảo ngữ là việc <b>đảo trợ động từ lên trước chủ ngữ</b> để nhấn mạnh, thường khi câu bắt đầu bằng trạng từ phủ định.',
            items: [
                { title: 'Sau trạng từ phủ định đầu câu', icon: 'priority_high', examples: ['<b>Never have</b> I seen such a thing.', '<b>Rarely does</b> he complain.'] },
                { title: 'Sau "Not only... but also"', icon: 'add_circle', examples: ['<b>Not only did</b> she sing, but she also danced.'] },
                { title: 'Sau "Hardly/No sooner... when/than"', icon: 'bolt', examples: ['<b>Hardly had</b> I arrived when it started.'] }
            ],
            signalWords: { label: 'Cụm đảo ngữ', words: ['Never, Rarely, Seldom, Hardly', 'Not only, No sooner', 'Only then, Little did'] }
        },
        formula: {
            note: 'Cấu trúc đảo ngữ giống cấu trúc <b>câu hỏi</b>: trợ động từ + S + V.',
            groups: [
                {
                    label: 'Đảo ngữ',
                    sub: 'inversion',
                    sentences: [
                        { kind: 'Phủ định đầu câu', sign: '+', formula: 'Never/Rarely + aux + S + V', examples: ['<b>Never have</b> I been so happy.'] },
                        { kind: 'Not only', sign: '+', formula: 'Not only + aux + S + V, but...', examples: ['<b>Not only is</b> he smart, but kind.'] }
                    ],
                    subject: {
                        headers: ['Trạng từ đầu câu', 'Cấu trúc đảo'],
                        rows: [['Never/Rarely/Seldom', 'aux + S + V'], ['Hardly...when', 'had + S + V3'], ['Only then', 'aux + S + V'], ['Not until', 'aux + S + V']]
                    },
                    note: 'Đảo ngữ tạo văn phong trang trọng, học thuật — hữu ích cho IELTS Writing band cao.'
                }
            ],
            contractions: []
        },
        exercises: [
            { id: 1, sentence: 'Never ___ I seen such beauty. (đảo ngữ HT hoàn thành)', answer: 'have', hint: 'aux + S', kind: 'khẳng định' },
            { id: 2, sentence: 'Rarely ___ he go out at night. (đảo ngữ HT đơn)', answer: 'does', hint: 'aux + S', kind: 'khẳng định' },
            { id: 3, sentence: 'Not only ___ she beautiful, but also kind. (to be)', answer: 'is', hint: 'aux + S', kind: 'khẳng định' },
            { id: 4, sentence: 'Hardly ___ I arrived when the phone rang. (QK hoàn thành)', answer: 'had', hint: 'had + S + V3', kind: 'khẳng định' },
            { id: 5, sentence: 'Seldom ___ we see such talent. (HT đơn)', answer: 'do', hint: 'aux + S', kind: 'khẳng định' },
            { id: 6, sentence: 'Only then ___ I understand the truth. (QK đơn)', answer: 'did', hint: 'aux + S', kind: 'khẳng định' }
        ]
    },
    'cleft-sentences': {
        usage: {
            intro: 'Câu chẻ tách câu thành hai phần để <b>nhấn mạnh</b> một thành phần cụ thể, dùng "It is/was..." hoặc "What...".',
            items: [
                { title: 'It-cleft (nhấn mạnh chủ ngữ/tân ngữ)', icon: 'gps_fixed', examples: ['<b>It was John</b> who broke the window.', '<b>It is money</b> that he wants.'] },
                { title: 'Wh-cleft (nhấn mạnh hành động)', icon: 'highlight', examples: ['<b>What I need</b> is a holiday.', '<b>What she did</b> was amazing.'] }
            ],
            signalWords: { label: 'Cấu trúc', words: ['It + be + X + that/who...', 'What + S + V + be + ...'] }
        },
        formula: {
            note: 'Câu chẻ làm nổi bật thông tin quan trọng bằng cách đặt nó vào vị trí được nhấn mạnh.',
            groups: [
                {
                    label: 'Câu chẻ',
                    sub: 'cleft sentences',
                    sentences: [
                        { kind: 'It-cleft', sign: '+', formula: 'It + be + [nhấn mạnh] + that/who + ...', examples: ['<b>It was Tom that</b> called.'] },
                        { kind: 'Wh-cleft', sign: '+', formula: 'What + S + V + be + [nhấn mạnh]', examples: ['<b>What I want is</b> peace.'] }
                    ],
                    subject: {
                        headers: ['Câu gốc', 'Câu chẻ (nhấn mạnh)'],
                        rows: [['Tom called.', 'It was Tom who called.'], ['I need rest.', 'What I need is rest.']]
                    },
                    note: 'Dùng <b>who</b> khi nhấn mạnh người, <b>that/which</b> cho vật trong It-cleft.'
                }
            ],
            contractions: []
        },
        exercises: [
            { id: 1, sentence: 'It was Mary ___ won the prize. (người)', answer: 'who', hint: 'who/that', kind: 'khẳng định' },
            { id: 2, sentence: '___ I really want is some rest. (wh-cleft)', answer: 'What', hint: 'What...', kind: 'khẳng định' },
            { id: 3, sentence: 'It is your help ___ I need most. (vật)', answer: 'that', hint: 'that', kind: 'khẳng định' },
            { id: 4, sentence: 'It was ___ Paris that we first met. (nơi chốn → giới từ)', answer: 'in', hint: 'in Paris', kind: 'khẳng định' },
            { id: 5, sentence: 'What he ___ was tell the truth. (hành động đã làm)', answer: 'did', hint: 'did', kind: 'khẳng định' },
            { id: 6, sentence: 'It was yesterday ___ she called. (thời gian)', answer: 'that', hint: 'that', kind: 'khẳng định' }
        ]
    }
};

export default { group, content };
