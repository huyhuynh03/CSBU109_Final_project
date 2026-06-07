// ============================================
// Grammar Group: Clauses (Mệnh đề)
// ============================================

const group = {
    id: 'clauses',
    nameVi: 'Mệnh đề',
    nameEn: 'Clauses',
    icon: 'account_tree',
    order: 6,
    lessons: [
        { id: 'relative-clauses', nameVi: 'Mệnh đề quan hệ', nameEn: 'Relative Clauses', icon: 'link', ielts: true },
        { id: 'noun-clauses', nameVi: 'Mệnh đề danh từ', nameEn: 'Noun Clauses', icon: 'short_text', ielts: false },
        { id: 'adverbial-clauses', nameVi: 'Mệnh đề trạng ngữ', nameEn: 'Adverbial Clauses', icon: 'more_time', ielts: true }
    ]
};

const content = {
    'relative-clauses': {
        usage: {
            intro: 'Mệnh đề quan hệ <b>bổ nghĩa cho danh từ</b> đứng trước, dùng đại từ quan hệ (who, which, that, whose, where, when).',
            items: [
                { title: 'who/that — người', icon: 'person', examples: ['The man <b>who</b> called is my uncle.', 'The girl <b>that</b> won is happy.'] },
                { title: 'which/that — vật', icon: 'category', examples: ['The book <b>which</b> I read was great.', 'The car <b>that</b> broke down is old.'] },
                { title: 'whose / where / when', icon: 'place', examples: ['The boy <b>whose</b> dog is lost is crying.', 'The town <b>where</b> I grew up is small.'] }
            ],
            signalWords: { label: 'Đại từ quan hệ', words: ['who (người)', 'which (vật)', 'that (cả hai)', 'whose (sở hữu)', 'where (nơi chốn)', 'when (thời gian)'] }
        },
        formula: {
            note: 'Phân biệt mệnh đề <b>xác định</b> (không dấu phẩy, cần thiết) và <b>không xác định</b> (có dấu phẩy, bổ sung).',
            groups: [
                {
                    label: 'Mệnh đề quan hệ',
                    sub: 'relative clauses',
                    sentences: [
                        { kind: 'Xác định', sign: '+', formula: 'N + who/which/that + V...', examples: ['The person <b>who helps</b> us is kind.'] },
                        { kind: 'Không xác định', sign: '+', formula: 'N, who/which + V..., ', examples: ['My father, <b>who is 60</b>, still works.'] }
                    ],
                    subject: { headers: ['Loại', 'Dấu phẩy', 'Dùng that?'], rows: [['Xác định', 'Không', 'Được'], ['Không xác định', 'Có', 'KHÔNG dùng that']] },
                    note: 'Có thể lược bỏ đại từ quan hệ khi nó là <b>tân ngữ</b>: The book (that) I read → bỏ "that" được.'
                }
            ],
            contractions: []
        },
        exercises: [
            { id: 1, sentence: 'The woman ___ lives next door is a doctor.', answer: 'who', hint: 'người', kind: 'khẳng định' },
            { id: 2, sentence: 'This is the phone ___ I bought yesterday.', answer: 'which', hint: 'vật', kind: 'khẳng định' },
            { id: 3, sentence: 'The student ___ book is on the desk is absent.', answer: 'whose', hint: 'sở hữu', kind: 'khẳng định' },
            { id: 4, sentence: 'That is the house ___ I was born.', answer: 'where', hint: 'nơi chốn', kind: 'khẳng định' },
            { id: 5, sentence: 'I remember the day ___ we first met.', answer: 'when', hint: 'thời gian', kind: 'khẳng định' },
            { id: 6, sentence: 'The man ___ is talking to her is my boss.', answer: 'who', hint: 'người', kind: 'khẳng định' }
        ]
    },
    'noun-clauses': {
        usage: {
            intro: 'Mệnh đề danh từ đóng vai trò như một <b>danh từ</b> trong câu — làm chủ ngữ, tân ngữ hoặc bổ ngữ.',
            items: [
                { title: 'Làm tân ngữ (that-clause)', icon: 'input', examples: ['I know <b>that he is honest</b>.', 'She believes <b>that it will work</b>.'] },
                { title: 'Bắt đầu bằng wh-word', icon: 'help', examples: ['I don\'t know <b>what he wants</b>.', 'Tell me <b>where you live</b>.'] },
                { title: 'Làm chủ ngữ', icon: 'subject', examples: ['<b>What he said</b> surprised me.', '<b>That she lied</b> is obvious.'] }
            ],
            signalWords: { label: 'Từ mở đầu', words: ['that', 'what', 'whether/if', 'who', 'where', 'when', 'why', 'how'] }
        },
        formula: {
            note: 'Mệnh đề danh từ luôn có trật tự <b>S + V</b> (không đảo), kể cả khi bắt đầu bằng từ hỏi.',
            groups: [
                {
                    label: 'Mệnh đề danh từ',
                    sub: 'noun clauses',
                    sentences: [
                        { kind: 'Tân ngữ', sign: '+', formula: 'S + V + that + S + V', examples: ['I think <b>that it is true</b>.'] },
                        { kind: 'Wh-clause', sign: '+', formula: 'S + V + wh- + S + V', examples: ['I wonder <b>what time it is</b>.'] }
                    ],
                    subject: { headers: ['Vai trò', 'Ví dụ'], rows: [['Chủ ngữ', 'What you said is true.'], ['Tân ngữ', 'I know that you are right.'], ['Bổ ngữ', 'The problem is that we are late.']] },
                    note: 'Sau từ hỏi giữ trật tự S+V: <b>I know where he is</b> — KHÔNG phải <i>where is he</i>.'
                }
            ],
            contractions: []
        },
        exercises: [
            { id: 1, sentence: 'I believe ___ he is telling the truth.', answer: 'that', hint: 'that-clause', kind: 'khẳng định' },
            { id: 2, sentence: 'Do you know ___ the meeting starts? (thời gian)', answer: 'when', hint: 'wh-word', kind: 'nghi vấn' },
            { id: 3, sentence: 'Tell me ___ you want for dinner.', answer: 'what', hint: 'wh-word', kind: 'khẳng định' },
            { id: 4, sentence: 'I\'m not sure ___ he will come or not.', answer: 'whether', hint: 'whether/if', kind: 'khẳng định' },
            { id: 5, sentence: '___ she said made everyone laugh. (chủ ngữ)', answer: 'What', hint: 'wh-word', kind: 'khẳng định' },
            { id: 6, sentence: 'Nobody knows ___ he lives.', answer: 'where', hint: 'nơi chốn', kind: 'khẳng định' }
        ]
    },
    'adverbial-clauses': {
        usage: {
            intro: 'Mệnh đề trạng ngữ bổ nghĩa cho động từ, diễn tả <b>thời gian, nguyên nhân, mục đích, điều kiện, sự nhượng bộ</b>.',
            items: [
                { title: 'Thời gian (when, while, before, after)', icon: 'schedule', examples: ['<b>When</b> I arrived, she was cooking.', 'I\'ll call you <b>after</b> I finish.'] },
                { title: 'Nguyên nhân (because, since, as)', icon: 'help_outline', examples: ['I stayed home <b>because</b> it rained.'] },
                { title: 'Nhượng bộ (although, even though)', icon: 'compare_arrows', examples: ['<b>Although</b> he is rich, he is unhappy.'] }
            ],
            signalWords: { label: 'Liên từ', words: ['when, while, before, after (thời gian)', 'because, since, as (nguyên nhân)', 'although, though (nhượng bộ)', 'so that (mục đích)'] }
        },
        formula: {
            note: 'Mệnh đề trạng ngữ có thể đứng đầu (có dấu phẩy) hoặc cuối câu (không dấu phẩy).',
            groups: [
                {
                    label: 'Mệnh đề trạng ngữ',
                    sub: 'adverbial clauses',
                    sentences: [
                        { kind: 'Đầu câu', sign: '+', formula: 'Liên từ + S + V, + mệnh đề chính', examples: ['<b>Because it rained</b>, we stayed in.'] },
                        { kind: 'Cuối câu', sign: '+', formula: 'Mệnh đề chính + liên từ + S + V', examples: ['We stayed in <b>because it rained</b>.'] }
                    ],
                    subject: { headers: ['Loại', 'Liên từ'], rows: [['Thời gian', 'when, while, until, as soon as'], ['Nguyên nhân', 'because, since, as'], ['Nhượng bộ', 'although, even though'], ['Mục đích', 'so that, in order that']] },
                    note: 'Sau <b>although/though</b> dùng mệnh đề (S+V); sau <b>despite/in spite of</b> dùng danh từ/V-ing.'
                }
            ],
            contractions: []
        },
        exercises: [
            { id: 1, sentence: '___ I was young, I lived in the countryside. (thời gian)', answer: 'When', hint: 'thời gian', kind: 'khẳng định' },
            { id: 2, sentence: 'She was late ___ she missed the bus. (nguyên nhân)', answer: 'because', hint: 'nguyên nhân', kind: 'khẳng định' },
            { id: 3, sentence: '___ it was cold, we went swimming. (nhượng bộ)', answer: 'Although', hint: 'nhượng bộ', kind: 'khẳng định' },
            { id: 4, sentence: 'I\'ll wait here ___ you come back. (cho đến khi)', answer: 'until', hint: 'thời gian', kind: 'khẳng định' },
            { id: 5, sentence: 'He studied hard ___ that he could pass. (mục đích)', answer: 'so', hint: 'so that', kind: 'khẳng định' },
            { id: 6, sentence: 'Call me ___ as you arrive. (ngay khi)', answer: 'as soon', hint: 'as soon as', kind: 'khẳng định' }
        ]
    }
};

export default { group, content };
