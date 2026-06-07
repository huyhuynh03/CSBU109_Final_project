// ============================================
// Grammar Group: Conditionals (Câu điều kiện)
// ============================================

const group = {
    id: 'conditionals',
    nameVi: 'Câu điều kiện',
    nameEn: 'Conditionals',
    icon: 'alt_route',
    order: 4,
    lessons: [
        { id: 'conditional-0-1', nameVi: 'Điều kiện loại 0 & 1', nameEn: 'Zero & First', icon: 'looks_one', ielts: true },
        { id: 'conditional-2', nameVi: 'Điều kiện loại 2', nameEn: 'Second Conditional', icon: 'looks_two', ielts: true },
        { id: 'conditional-3-mixed', nameVi: 'Điều kiện loại 3 & hỗn hợp', nameEn: 'Third & Mixed', icon: 'looks_3', ielts: false }
    ]
};

const content = {
    'conditional-0-1': {
        usage: {
            intro: 'Điều kiện loại 0 diễn tả <b>sự thật hiển nhiên</b>; loại 1 diễn tả <b>tình huống có thật, có khả năng xảy ra</b> trong tương lai.',
            items: [
                { title: 'Loại 0 — chân lý, thói quen luôn đúng', icon: 'public', examples: ['If you <b>heat</b> ice, it <b>melts</b>.', 'If it <b>rains</b>, the ground <b>gets</b> wet.'] },
                { title: 'Loại 1 — điều kiện có thật ở tương lai', icon: 'event_available', examples: ['If it <b>rains</b>, I <b>will stay</b> home.', 'If you <b>study</b>, you <b>will pass</b>.'] }
            ],
            signalWords: { label: 'Dấu hiệu', words: ['if', 'when (loại 0)', 'unless = if...not', 'as long as', 'provided that'] }
        },
        formula: {
            note: 'Mệnh đề <b>if</b> có thể đứng trước hoặc sau mệnh đề chính. Nếu đứng trước thì có dấu phẩy ngăn cách.',
            groups: [
                {
                    label: 'Loại 0 & Loại 1',
                    sub: 'real conditionals',
                    sentences: [
                        { kind: 'Loại 0', sign: '+', formula: 'If + S + V(hiện tại), S + V(hiện tại)', examples: ['If you <b>mix</b> red and blue, you <b>get</b> purple.'] },
                        { kind: 'Loại 1', sign: '+', formula: 'If + S + V(hiện tại), S + will + V', examples: ['If I <b>have</b> time, I <b>will call</b> you.'] }
                    ],
                    subject: { headers: ['Loại', 'Mệnh đề If', 'Mệnh đề chính'], rows: [['0', 'hiện tại đơn', 'hiện tại đơn'], ['1', 'hiện tại đơn', 'will + V']] },
                    note: 'KHÔNG dùng <b>will</b> trong mệnh đề if: viết <i>If it rains</i> — không phải <i>If it will rain</i>.'
                }
            ],
            contractions: ["won't = will not", "unless = if not"]
        },
        exercises: [
            { id: 1, sentence: 'If you ___ (heat) water to 100°C, it boils. (loại 0)', answer: 'heat', hint: 'hiện tại đơn', kind: 'khẳng định' },
            { id: 2, sentence: 'If it rains tomorrow, we ___ (stay) home. (loại 1)', answer: 'will stay', hint: 'will + V', kind: 'khẳng định' },
            { id: 3, sentence: 'If she ___ (study) hard, she will pass the exam.', answer: 'studies', hint: 'hiện tại đơn', kind: 'khẳng định' },
            { id: 4, sentence: 'Plants die if they ___ (not/get) water.', answer: 'do not get', hint: 'loại 0 phủ định', kind: 'phủ định' },
            { id: 5, sentence: 'I ___ (help) you if you ask me.', answer: 'will help', hint: 'will + V', kind: 'khẳng định' },
            { id: 6, sentence: 'Unless you hurry, you ___ (miss) the train.', answer: 'will miss', hint: 'will + V', kind: 'khẳng định' }
        ]
    },
    'conditional-2': {
        usage: {
            intro: 'Điều kiện loại 2 diễn tả tình huống <b>không có thật / trái với hiện tại</b>, mang tính giả định, tưởng tượng.',
            items: [
                { title: 'Giả định trái với hiện tại', icon: 'cloud', examples: ['If I <b>were</b> rich, I <b>would travel</b> the world.', 'If I <b>had</b> a car, I <b>would drive</b> there.'] },
                { title: 'Lời khuyên (If I were you...)', icon: 'lightbulb', examples: ['If I <b>were</b> you, I <b>would apologize</b>.'] }
            ],
            signalWords: { label: 'Ghi nhớ', words: ['if + quá khứ đơn', 'would + V', 'were dùng cho mọi ngôi (If I were...)', 'không có thật ở hiện tại'] }
        },
        formula: {
            note: 'Dù nói về hiện tại, mệnh đề if dùng <b>thì quá khứ</b> (past subjunctive). Với "to be" dùng <b>were</b> cho mọi ngôi.',
            groups: [
                {
                    label: 'Loại 2',
                    sub: 'unreal present',
                    sentences: [
                        { kind: 'Khẳng định', sign: '+', formula: 'If + S + V2/were, S + would + V', examples: ['If I <b>knew</b>, I <b>would tell</b> you.'] },
                        { kind: 'Phủ định', sign: '−', formula: 'If + S + didn\'t + V, S + wouldn\'t + V', examples: ['If I <b>didn\'t work</b>, I <b>wouldn\'t earn</b> money.'] }
                    ],
                    subject: { headers: ['Mệnh đề If', 'Mệnh đề chính'], rows: [['quá khứ đơn (V2)', 'would + V'], ['were (mọi ngôi)', 'would + V']] },
                    note: 'Có thể thay <b>would</b> bằng <b>could / might</b> để diễn tả khả năng: If I had time, I <b>could help</b>.'
                }
            ],
            contractions: ["wouldn't = would not", "I'd = I would"]
        },
        exercises: [
            { id: 1, sentence: 'If I ___ (be) you, I would take the job.', answer: 'were', hint: 'were mọi ngôi', kind: 'khẳng định' },
            { id: 2, sentence: 'If she had more money, she ___ (buy) a house.', answer: 'would buy', hint: 'would + V', kind: 'khẳng định' },
            { id: 3, sentence: 'If I ___ (know) his number, I would call him.', answer: 'knew', hint: 'V2', kind: 'khẳng định' },
            { id: 4, sentence: 'We would travel more if we ___ (have) time.', answer: 'had', hint: 'V2', kind: 'khẳng định' },
            { id: 5, sentence: 'If he ___ (not/be) so lazy, he would succeed.', answer: 'were not', hint: 'were phủ định', kind: 'phủ định' },
            { id: 6, sentence: 'If they spoke English, they ___ (understand) us.', answer: 'would understand', hint: 'would + V', kind: 'khẳng định' }
        ]
    },
    'conditional-3-mixed': {
        usage: {
            intro: 'Điều kiện loại 3 diễn tả tình huống <b>trái với quá khứ</b> (điều đã không xảy ra). Loại hỗn hợp kết hợp quá khứ và hiện tại.',
            items: [
                { title: 'Loại 3 — tiếc nuối về quá khứ', icon: 'history', examples: ['If I <b>had studied</b>, I <b>would have passed</b>.', 'If she <b>had left</b> earlier, she <b>wouldn\'t have missed</b> the bus.'] },
                { title: 'Hỗn hợp — quá khứ ảnh hưởng hiện tại', icon: 'merge', examples: ['If I <b>had saved</b> money, I <b>would be</b> rich now.'] }
            ],
            signalWords: { label: 'Ghi nhớ', words: ['if + had + V3', 'would have + V3', 'trái với quá khứ', 'hỗn hợp: had V3 → would + V'] }
        },
        formula: {
            note: 'Loại 3 dùng <b>quá khứ hoàn thành</b> ở mệnh đề if và <b>would have + V3</b> ở mệnh đề chính.',
            groups: [
                {
                    label: 'Loại 3 & Hỗn hợp',
                    sub: 'unreal past',
                    sentences: [
                        { kind: 'Loại 3', sign: '+', formula: 'If + S + had + V3, S + would have + V3', examples: ['If I <b>had known</b>, I <b>would have helped</b>.'] },
                        { kind: 'Hỗn hợp', sign: '+', formula: 'If + S + had + V3, S + would + V', examples: ['If I <b>had taken</b> the job, I <b>would be</b> happier now.'] }
                    ],
                    subject: {
                        headers: ['Loại', 'Mệnh đề If', 'Mệnh đề chính'],
                        rows: [['3', 'had + V3', 'would have + V3'], ['Hỗn hợp', 'had + V3', 'would + V (hiện tại)']]
                    },
                    note: 'Loại 3 thường diễn tả sự <b>tiếc nuối</b> hoặc <b>chỉ trích</b> về điều đã không xảy ra trong quá khứ.'
                }
            ],
            contractions: ["wouldn't have = would not have", "I'd have = I would have"]
        },
        exercises: [
            { id: 1, sentence: 'If I ___ (study) harder, I would have passed.', answer: 'had studied', hint: 'had + V3', kind: 'khẳng định' },
            { id: 2, sentence: 'If she had known, she ___ (come) to the party.', answer: 'would have come', hint: 'would have + V3', kind: 'khẳng định' },
            { id: 3, sentence: 'We ___ (win) if we had played better.', answer: 'would have won', hint: 'would have + V3', kind: 'khẳng định' },
            { id: 4, sentence: 'If they ___ (leave) earlier, they wouldn\'t have been late.', answer: 'had left', hint: 'had + V3', kind: 'khẳng định' },
            { id: 5, sentence: 'If I had saved money, I ___ (be) rich now. (hỗn hợp)', answer: 'would be', hint: 'would + V', kind: 'khẳng định' },
            { id: 6, sentence: 'He ___ (not/fail) if he had tried harder.', answer: 'would not have failed', hint: 'phủ định', kind: 'phủ định' }
        ]
    }
};

export default { group, content };
