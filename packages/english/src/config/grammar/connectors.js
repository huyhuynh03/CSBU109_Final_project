// ============================================
// Grammar Group: Connectors (Từ nối & Liên từ)
// ============================================

const group = {
    id: 'connectors',
    nameVi: 'Từ nối & Liên từ',
    nameEn: 'Connectors',
    icon: 'hub',
    order: 13,
    lessons: [
        { id: 'coordinating', nameVi: 'Liên từ kết hợp', nameEn: 'Coordinating Conjunctions', icon: 'join_full', ielts: false },
        { id: 'subordinating', nameVi: 'Liên từ phụ thuộc', nameEn: 'Subordinating Conjunctions', icon: 'account_tree', ielts: true },
        { id: 'transitions', nameVi: 'Trạng từ liên kết', nameEn: 'Linking Adverbials', icon: 'forward', ielts: true }
    ]
};

const content = {
    'coordinating': {
        usage: {
            intro: 'Liên từ kết hợp (FANBOYS) nối các thành phần <b>ngang hàng</b>: từ, cụm từ, hoặc mệnh đề độc lập.',
            items: [
                { title: 'and (và), but (nhưng), or (hoặc)', icon: 'add', examples: ['tea <b>and</b> coffee', 'small <b>but</b> strong'] },
                { title: 'so (vì vậy), for (bởi vì), yet (tuy nhiên)', icon: 'east', examples: ['It rained, <b>so</b> we stayed in.'] },
                { title: 'nor (cũng không)', icon: 'remove', examples: ['He doesn\'t smoke, <b>nor</b> does he drink.'] }
            ],
            signalWords: { label: 'FANBOYS', words: ['For, And, Nor, But, Or, Yet, So'] }
        },
        formula: {
            note: 'Khi nối hai mệnh đề độc lập, dùng <b>dấu phẩy trước</b> FANBOYS.',
            groups: [
                {
                    label: 'Liên từ kết hợp',
                    sub: 'FANBOYS',
                    sentences: [
                        { kind: 'Nối mệnh đề', sign: '+', formula: 'S+V, FANBOYS S+V', examples: ['I tried, <b>but</b> I failed.'] },
                        { kind: 'Nối từ/cụm', sign: '+', formula: 'X + and/or + Y', examples: ['bread <b>and</b> butter'] }
                    ],
                    subject: {
                        headers: ['Liên từ', 'Nghĩa'],
                        rows: [['and', 'thêm vào'], ['but / yet', 'tương phản'], ['or', 'lựa chọn'], ['so', 'kết quả'], ['for', 'lý do']]
                    },
                    note: 'Không bắt đầu câu trang trọng bằng And/But trong văn viết học thuật — dùng Moreover/However thay thế.'
                }
            ],
            contractions: []
        },
        exercises: [
            { id: 1, sentence: 'I was tired, ___ I went to bed early. (kết quả)', answer: 'so', hint: 'FANBOYS', kind: 'khẳng định' },
            { id: 2, sentence: 'She is smart ___ hardworking. (thêm vào)', answer: 'and', hint: 'FANBOYS', kind: 'khẳng định' },
            { id: 3, sentence: 'He studied hard, ___ he failed. (tương phản)', answer: 'but', hint: 'FANBOYS', kind: 'khẳng định' },
            { id: 4, sentence: 'Would you like tea ___ coffee? (lựa chọn)', answer: 'or', hint: 'FANBOYS', kind: 'nghi vấn' },
            { id: 5, sentence: 'He stayed home, ___ he was sick. (lý do)', answer: 'for', hint: 'FANBOYS', kind: 'khẳng định' },
            { id: 6, sentence: 'It was late, ___ we kept working. (tuy nhiên)', answer: 'yet', hint: 'FANBOYS', kind: 'khẳng định' },
            { id: 7, sentence: 'We can go by bus ___ by train. (lựa chọn)', answer: 'or', hint: 'FANBOYS', kind: 'khẳng định' },
            { id: 8, sentence: 'She was hungry, ___ she made lunch. (kết quả)', answer: 'so', hint: 'FANBOYS', kind: 'khẳng định' },
            { id: 9, sentence: 'He is kind ___ generous. (thêm vào)', answer: 'and', hint: 'FANBOYS', kind: 'khẳng định' },
            { id: 10, sentence: 'I wanted to help, ___ I had no time. (tương phản)', answer: 'but', hint: 'FANBOYS', kind: 'khẳng định' },
            { id: 11, sentence: 'They left early, ___ the meeting was over. (lý do)', answer: 'for', hint: 'FANBOYS', kind: 'khẳng định' },
            { id: 12, sentence: 'She doesn\'t eat meat, ___ does she eat fish. (cũng không)', answer: 'nor', hint: 'FANBOYS', kind: 'phủ định' },
            { id: 13, sentence: 'The task was hard, ___ we completed it. (tuy nhiên)', answer: 'yet', hint: 'FANBOYS', kind: 'khẳng định' },
            { id: 14, sentence: 'You can stay here ___ come with us. (lựa chọn)', answer: 'or', hint: 'FANBOYS', kind: 'khẳng định' },
            { id: 15, sentence: 'It was cold, ___ I wore a jacket. (kết quả)', answer: 'so', hint: 'FANBOYS', kind: 'khẳng định' },
            { id: 16, sentence: 'We bought bread ___ milk. (thêm vào)', answer: 'and', hint: 'FANBOYS', kind: 'khẳng định' },
            { id: 17, sentence: 'He practised daily, ___ he didn\'t improve. (tương phản)', answer: 'but', hint: 'FANBOYS', kind: 'khẳng định' },
            { id: 18, sentence: 'She smiled, ___ she was very pleased. (lý do)', answer: 'for', hint: 'FANBOYS', kind: 'khẳng định' },
            { id: 19, sentence: 'The road was icy, ___ we drove slowly. (kết quả)', answer: 'so', hint: 'FANBOYS', kind: 'khẳng định' },
            { id: 20, sentence: 'It looked simple, ___ it was tricky. (tuy nhiên)', answer: 'yet', hint: 'FANBOYS', kind: 'khẳng định' }
        ]
    },
    'subordinating': {
        usage: {
            intro: 'Liên từ phụ thuộc nối mệnh đề phụ với mệnh đề chính, diễn tả quan hệ <b>thời gian, nguyên nhân, điều kiện, nhượng bộ</b>.',
            items: [
                { title: 'Thời gian: when, while, before, after', icon: 'schedule', examples: ['<b>When</b> I arrived, she left.'] },
                { title: 'Nguyên nhân: because, since, as', icon: 'help_outline', examples: ['<b>Since</b> it\'s late, let\'s go.'] },
                { title: 'Nhượng bộ: although, even though, whereas', icon: 'compare_arrows', examples: ['<b>Even though</b> he tried, he failed.'] }
            ],
            signalWords: { label: 'Loại liên từ', words: ['when, while, until, as soon as', 'because, since, as', 'although, though, even though', 'if, unless'] }
        },
        formula: {
            note: 'Mệnh đề phụ có thể đứng đầu (có dấu phẩy) hoặc cuối câu (không dấu phẩy).',
            groups: [
                {
                    label: 'Liên từ phụ thuộc',
                    sub: 'subordinating',
                    sentences: [
                        { kind: 'Phụ đầu', sign: '+', formula: 'Liên từ + S+V, S+V', examples: ['<b>Because</b> I was late, I ran.'] },
                        { kind: 'Phụ cuối', sign: '+', formula: 'S+V + liên từ + S+V', examples: ['I ran <b>because</b> I was late.'] }
                    ],
                    subject: {
                        headers: ['Quan hệ', 'Liên từ'],
                        rows: [['Thời gian', 'when, while, before, after, until'], ['Nguyên nhân', 'because, since, as'], ['Nhượng bộ', 'although, though, even though'], ['Điều kiện', 'if, unless, as long as']]
                    },
                    note: 'Phân biệt <b>because</b> (+ mệnh đề S+V) và <b>because of</b> (+ danh từ/V-ing).'
                }
            ],
            contractions: []
        },
        exercises: [
            { id: 1, sentence: '___ it was raining, we cancelled the trip. (bởi vì)', answer: 'Because', hint: 'nguyên nhân', kind: 'khẳng định' },
            { id: 2, sentence: 'I\'ll wait ___ you finish. (cho đến khi)', answer: 'until', hint: 'thời gian', kind: 'khẳng định' },
            { id: 3, sentence: '___ he is rich, he is not happy. (mặc dù)', answer: 'Although', hint: 'nhượng bộ', kind: 'khẳng định' },
            { id: 4, sentence: 'Call me ___ you arrive. (khi)', answer: 'when', hint: 'thời gian', kind: 'khẳng định' },
            { id: 5, sentence: 'You\'ll fail ___ you study. (trừ khi)', answer: 'unless', hint: 'điều kiện', kind: 'khẳng định' },
            { id: 6, sentence: '___ I was cooking, he was reading. (trong khi)', answer: 'While', hint: 'thời gian', kind: 'khẳng định' },
            { id: 7, sentence: 'We can go out ___ the rain stops. (ngay khi)', answer: 'as soon as', hint: 'thời gian', kind: 'khẳng định' },
            { id: 8, sentence: '___ he had little money, he was generous. (mặc dù)', answer: 'Although', hint: 'nhượng bộ', kind: 'khẳng định' },
            { id: 9, sentence: 'Take an umbrella ___ it rains. (trong trường hợp)', answer: 'in case', hint: 'điều kiện', kind: 'khẳng định' },
            { id: 10, sentence: '___ the weather was bad, we cancelled the picnic. (bởi vì)', answer: 'Because', hint: 'nguyên nhân', kind: 'khẳng định' },
            { id: 11, sentence: 'Wash your hands ___ you eat. (trước khi)', answer: 'before', hint: 'thời gian', kind: 'khẳng định' },
            { id: 12, sentence: '___ you work hard, you will succeed. (miễn là)', answer: 'As long as', hint: 'điều kiện', kind: 'khẳng định' },
            { id: 13, sentence: 'He stayed calm ___ everyone else panicked. (trong khi/ngược lại)', answer: 'whereas', hint: 'tương phản', kind: 'khẳng định' },
            { id: 14, sentence: '___ she finished her homework, she watched TV. (sau khi)', answer: 'After', hint: 'thời gian', kind: 'khẳng định' },
            { id: 15, sentence: 'I won\'t go ___ you come with me. (trừ khi)', answer: 'unless', hint: 'điều kiện', kind: 'khẳng định' },
            { id: 16, sentence: '___ it was getting dark, we headed home. (vì)', answer: 'Since', hint: 'nguyên nhân', kind: 'khẳng định' },
            { id: 17, sentence: 'Stay here ___ I come back. (cho đến khi)', answer: 'until', hint: 'thời gian', kind: 'khẳng định' },
            { id: 18, sentence: '___ he tried his best, he didn\'t win. (mặc dù)', answer: 'Even though', hint: 'nhượng bộ', kind: 'khẳng định' },
            { id: 19, sentence: 'Please be quiet ___ the baby is sleeping. (vì)', answer: 'because', hint: 'nguyên nhân', kind: 'khẳng định' },
            { id: 20, sentence: '___ you press this button, the door opens. (khi)', answer: 'When', hint: 'thời gian', kind: 'khẳng định' }
        ]
    },
    'transitions': {
        usage: {
            intro: 'Trạng từ liên kết nối ý giữa các câu/đoạn, thường đứng đầu câu và theo sau bởi <b>dấu phẩy</b>. Rất quan trọng trong IELTS Writing.',
            items: [
                { title: 'Bổ sung: moreover, furthermore, in addition', icon: 'add_circle', examples: ['He is smart. <b>Moreover</b>, he is kind.'] },
                { title: 'Tương phản: however, nevertheless, on the other hand', icon: 'compare', examples: ['It\'s expensive. <b>However</b>, it\'s worth it.'] },
                { title: 'Kết quả: therefore, thus, as a result', icon: 'east', examples: ['It rained. <b>Therefore</b>, we stayed in.'] }
            ],
            signalWords: { label: 'Trạng từ liên kết', words: ['Moreover, Furthermore, In addition', 'However, Nevertheless', 'Therefore, Thus, Consequently', 'For example, In conclusion'] }
        },
        formula: {
            note: 'Trạng từ liên kết KHÁC liên từ: chúng nối hai câu riêng biệt (dùng dấu chấm hoặc chấm phẩy), không nối trong cùng một câu như FANBOYS.',
            groups: [
                {
                    label: 'Trạng từ liên kết',
                    sub: 'linking adverbials',
                    sentences: [
                        { kind: 'Đầu câu', sign: '+', formula: 'Câu 1. Adverbial, câu 2.', examples: ['I was tired. <b>Therefore</b>, I rested.'] },
                        { kind: 'Với chấm phẩy', sign: '+', formula: 'Câu 1; adverbial, câu 2.', examples: ['It\'s late<b>; however</b>, I\'ll stay.'] }
                    ],
                    subject: {
                        headers: ['Chức năng', 'Trạng từ liên kết'],
                        rows: [['Bổ sung', 'moreover, furthermore, in addition'], ['Tương phản', 'however, nevertheless, on the contrary'], ['Kết quả', 'therefore, thus, consequently'], ['Ví dụ', 'for example, for instance'], ['Tổng kết', 'in conclusion, to sum up']]
                    },
                    note: 'Dùng đa dạng trạng từ liên kết giúp bài viết mạch lạc (Coherence & Cohesion) — tiêu chí IELTS Writing.'
                }
            ],
            contractions: []
        },
        exercises: [
            { id: 1, sentence: 'It was raining. ___, we went out anyway. (tuy nhiên)', answer: 'However', hint: 'tương phản', kind: 'khẳng định' },
            { id: 2, sentence: 'He studied hard. ___, he passed easily. (vì vậy)', answer: 'Therefore', hint: 'kết quả', kind: 'khẳng định' },
            { id: 3, sentence: 'She is talented. ___, she works hard. (hơn nữa)', answer: 'Moreover', hint: 'bổ sung', kind: 'khẳng định' },
            { id: 4, sentence: 'Many fruits are healthy. ___, apples and oranges. (ví dụ)', answer: 'For example', hint: 'ví dụ', kind: 'khẳng định' },
            { id: 5, sentence: 'The plan failed. ___, we lost money. (kết quả)', answer: 'Consequently', hint: 'kết quả', kind: 'khẳng định' },
            { id: 6, sentence: 'In ___, technology has changed our lives. (tổng kết)', answer: 'conclusion', hint: 'in conclusion', kind: 'khẳng định' },
            { id: 7, sentence: 'The product is cheap. ___, the quality is poor. (tuy nhiên)', answer: 'However', hint: 'tương phản', kind: 'khẳng định' },
            { id: 8, sentence: 'He missed the train. ___, he was late for work. (kết quả)', answer: 'Therefore', hint: 'kết quả', kind: 'khẳng định' },
            { id: 9, sentence: 'The hotel was lovely. ___, the staff were friendly. (hơn nữa)', answer: 'Furthermore', hint: 'bổ sung', kind: 'khẳng định' },
            { id: 10, sentence: 'Some animals migrate. ___, birds fly south in winter. (ví dụ)', answer: 'For instance', hint: 'ví dụ', kind: 'khẳng định' },
            { id: 11, sentence: 'Sales dropped sharply. ___, the company closed. (kết quả)', answer: 'Consequently', hint: 'kết quả', kind: 'khẳng định' },
            { id: 12, sentence: 'The film was long. ___, it was very enjoyable. (tuy nhiên)', answer: 'Nevertheless', hint: 'tương phản', kind: 'khẳng định' },
            { id: 13, sentence: 'She loves the city. ___, her husband prefers the countryside. (mặt khác)', answer: 'On the other hand', hint: 'tương phản', kind: 'khẳng định' },
            { id: 14, sentence: 'The course is useful. ___, it is affordable. (thêm vào)', answer: 'In addition', hint: 'bổ sung', kind: 'khẳng định' },
            { id: 15, sentence: 'It was raining heavily. ___, the match was postponed. (vì vậy)', answer: 'Thus', hint: 'kết quả', kind: 'khẳng định' },
            { id: 16, sentence: 'He is a great leader. ___, he is a kind person. (hơn nữa)', answer: 'Moreover', hint: 'bổ sung', kind: 'khẳng định' },
            { id: 17, sentence: 'Prices are rising. ___, people are spending less. (kết quả)', answer: 'Therefore', hint: 'kết quả', kind: 'khẳng định' },
            { id: 18, sentence: 'The plan has risks. ___, it could bring great rewards. (tuy nhiên)', answer: 'However', hint: 'tương phản', kind: 'khẳng định' },
            { id: 19, sentence: 'Exercise improves health. ___, it reduces stress. (hơn nữa)', answer: 'Furthermore', hint: 'bổ sung', kind: 'khẳng định' },
            { id: 20, sentence: 'To ___ up, recycling benefits the environment. (tổng kết)', answer: 'sum', hint: 'to sum up', kind: 'khẳng định' }
        ]
    }
};

export default { group, content };
