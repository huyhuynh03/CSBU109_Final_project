// ============================================
// Grammar Group: Modal Verbs (Động từ khuyết thiếu)
// ============================================
// Mỗi group export { group, content } — song song với GrammarTenses/GrammarTenseContent.
// group: metadata + danh sách lessons (folders con).
// content: nội dung chi tiết theo lesson id (usage / formula / exercises).

const group = {
    id: 'modal-verbs',
    nameVi: 'Động từ khuyết thiếu',
    nameEn: 'Modal Verbs',
    icon: 'bolt',
    order: 2,
    lessons: [
        { id: 'modal-ability', nameVi: 'Khả năng', nameEn: 'Ability', icon: 'fitness_center', ielts: false },
        { id: 'modal-obligation', nameVi: 'Sự bắt buộc & lời khuyên', nameEn: 'Obligation & Advice', icon: 'gavel', ielts: true },
        { id: 'modal-deduction', nameVi: 'Suy đoán & khả năng xảy ra', nameEn: 'Deduction & Possibility', icon: 'psychology', ielts: true }
    ]
};

const content = {
    'modal-ability': {
        usage: {
            intro: 'Dùng để diễn tả <b>khả năng</b> làm một việc gì đó ở hiện tại, quá khứ hoặc tương lai.',
            items: [
                { title: 'Khả năng ở hiện tại (can)', icon: 'check_circle', examples: ['She <b>can</b> speak three languages.', 'I <b>can</b> swim very well.'] },
                { title: 'Khả năng trong quá khứ (could)', icon: 'history', examples: ['When I was young, I <b>could</b> run very fast.', 'He <b>could</b> read at the age of four.'] },
                { title: 'Khả năng ở tương lai / hoàn cảnh cụ thể (be able to)', icon: 'trending_up', examples: ['I <b>will be able to</b> drive next month.', 'After the course, she <b>was able to</b> pass the exam.'] }
            ],
            signalWords: { label: 'Lưu ý', words: ['can = hiện tại', 'could = quá khứ', 'be able to = mọi thì', "can't / cannot = không thể"] }
        },
        formula: {
            note: 'Modal verb luôn đi với <b>động từ nguyên thể không "to"</b> (bare infinitive). Không chia theo ngôi.',
            groups: [
                {
                    label: 'Can / Could',
                    sub: 'bare infinitive',
                    sentences: [
                        { kind: 'Khẳng định', sign: '+', formula: 'S + can/could + V', examples: ['She <b>can drive</b>.', 'He <b>could swim</b>.'] },
                        { kind: 'Phủ định', sign: '−', formula: 'S + cannot/could not + V', examples: ['I <b>cannot cook</b>.', 'They <b>couldn\'t come</b>.'] },
                        { kind: 'Nghi vấn', sign: '?', formula: 'Can/Could + S + V?', examples: ['<b>Can</b> you <b>help</b> me?', '<b>Could</b> she <b>read</b>?'] }
                    ],
                    subject: { headers: ['Chủ ngữ', 'Modal'], rows: [['Tất cả ngôi', 'can / could (không chia)']] },
                    note: 'Sau modal KHÔNG thêm "to" và KHÔNG chia -s: viết <b>She can swim</b> — không phải <i>can swims / can to swim</i>.'
                }
            ],
            contractions: ["can't = cannot", "couldn't = could not"]
        },
        exercises: [
            { id: 1, sentence: 'Birds ___ (fly) in the sky.', answer: 'can fly', hint: 'can + V', kind: 'khẳng định' },
            { id: 2, sentence: 'Two years ago, I ___ not speak English at all.', answer: 'could', hint: 'quá khứ', kind: 'phủ định' },
            { id: 3, sentence: 'She ___ (play) the piano when she was five.', answer: 'could play', hint: 'quá khứ', kind: 'khẳng định' },
            { id: 4, sentence: '___ you help me with this box?', answer: 'Can', hint: 'nghi vấn', kind: 'nghi vấn' },
            { id: 5, sentence: 'After the training, he was ___ to lift 100 kg.', answer: 'able', hint: 'be able to', kind: 'khẳng định' },
            { id: 6, sentence: 'Sorry, I ___ (not/come) to the meeting yesterday.', answer: 'could not come', hint: 'quá khứ phủ định', kind: 'phủ định' },
            { id: 7, sentence: 'My grandmother ___ (read) without glasses now.', answer: 'can read', hint: 'can + V', kind: 'khẳng định' },
            { id: 8, sentence: 'When the fog cleared, we ___ (see) the mountains.', answer: 'could see', hint: 'quá khứ', kind: 'khẳng định' },
            { id: 9, sentence: 'I ___ (not/swim) when I was a child.', answer: 'could not swim', hint: 'quá khứ phủ định', kind: 'phủ định' },
            { id: 10, sentence: '___ your brother drive a truck?', answer: 'Can', hint: 'nghi vấn hiện tại', kind: 'nghi vấn' },
            { id: 11, sentence: 'Next year I will ___ (be able) to speak Japanese fluently.', answer: 'be able', hint: 'be able to (tương lai)', kind: 'khẳng định' },
            { id: 12, sentence: 'Even as a baby, he ___ (recognize) his mother\'s voice.', answer: 'could recognize', hint: 'quá khứ', kind: 'khẳng định' },
            { id: 13, sentence: 'Cats ___ (see) well in the dark.', answer: 'can see', hint: 'can + V', kind: 'khẳng định' },
            { id: 14, sentence: 'Despite the noise, she was ___ to concentrate.', answer: 'able', hint: 'be able to (quá khứ)', kind: 'khẳng định' },
            { id: 15, sentence: 'I\'m afraid I ___ (not/help) you tomorrow.', answer: 'cannot help', hint: 'phủ định hiện tại', kind: 'phủ định' },
            { id: 16, sentence: '___ they finish the project on time? (quá khứ)', answer: 'Could', hint: 'nghi vấn quá khứ', kind: 'nghi vấn' },
            { id: 17, sentence: 'With practice, you ___ (master) this skill.', answer: 'can master', hint: 'can + V', kind: 'khẳng định' },
            { id: 18, sentence: 'He has ___ (been able) to walk again since the surgery.', answer: 'been able', hint: 'be able to (hoàn thành)', kind: 'khẳng định' },
            { id: 19, sentence: 'We ___ (not/find) the keys anywhere last night.', answer: 'could not find', hint: 'quá khứ phủ định', kind: 'phủ định' },
            { id: 20, sentence: 'A computer ___ (process) millions of operations per second.', answer: 'can process', hint: 'can + V', kind: 'khẳng định' }
        ]
    },
    'modal-obligation': {
        usage: {
            intro: 'Dùng để diễn tả <b>sự bắt buộc, nghĩa vụ, sự cấm đoán</b> và <b>lời khuyên</b>.',
            items: [
                { title: 'Bắt buộc mạnh (must / have to)', icon: 'priority_high', examples: ['You <b>must</b> wear a helmet.', 'I <b>have to</b> work tomorrow.'] },
                { title: 'Cấm đoán (mustn\'t) vs Không cần (don\'t have to)', icon: 'block', examples: ['You <b>mustn\'t</b> smoke here. (cấm)', 'You <b>don\'t have to</b> pay. (không cần)'] },
                { title: 'Lời khuyên (should / ought to)', icon: 'lightbulb', examples: ['You <b>should</b> see a doctor.', 'He <b>ought to</b> apologize.'] }
            ],
            signalWords: { label: 'Phân biệt quan trọng', words: ["mustn't = cấm (đừng làm)", "don't have to = không bắt buộc (làm cũng được)", 'should/ought to = nên'] }
        },
        formula: {
            note: 'Phân biệt sắc thái: <b>must</b> (bắt buộc từ người nói) vs <b>have to</b> (bắt buộc do hoàn cảnh/quy định).',
            groups: [
                {
                    label: 'Must / Should / Ought to',
                    sub: 'bare infinitive',
                    sentences: [
                        { kind: 'Khẳng định', sign: '+', formula: 'S + must/should + V', examples: ['You <b>must stop</b>.', 'You <b>should rest</b>.'] },
                        { kind: 'Phủ định', sign: '−', formula: 'S + mustn\'t/shouldn\'t + V', examples: ['You <b>mustn\'t lie</b>.', 'You <b>shouldn\'t worry</b>.'] },
                        { kind: 'Nghi vấn', sign: '?', formula: 'Should + S + V?', examples: ['<b>Should</b> I <b>go</b>?'] }
                    ],
                    subject: { headers: ['Cấu trúc', 'Sắc thái'], rows: [['must / have to', 'bắt buộc'], ['should / ought to', 'lời khuyên']] },
                    note: '<b>have to</b> chia theo ngôi và thì: has to (he/she/it), had to (quá khứ), will have to (tương lai).'
                }
            ],
            contractions: ["mustn't = must not", "shouldn't = should not", "don't have to = do not have to"]
        },
        exercises: [
            { id: 1, sentence: 'Students ___ (wear) a uniform at this school. (bắt buộc)', answer: 'must wear', hint: 'must + V', kind: 'khẳng định' },
            { id: 2, sentence: 'You ___ smoke in the hospital. (cấm)', answer: 'mustn\'t', hint: 'cấm đoán', kind: 'phủ định' },
            { id: 3, sentence: 'You look tired. You ___ (take) a rest.', answer: 'should take', hint: 'lời khuyên', kind: 'khẳng định' },
            { id: 4, sentence: 'It\'s a holiday, so we ___ have to go to work.', answer: 'don\'t', hint: 'không cần', kind: 'phủ định' },
            { id: 5, sentence: 'She ___ to finish the report yesterday. (bắt buộc quá khứ)', answer: 'had', hint: 'have to quá khứ', kind: 'khẳng định' },
            { id: 6, sentence: '___ I bring my passport? (xin lời khuyên)', answer: 'Should', hint: 'nghi vấn', kind: 'nghi vấn' },
            { id: 7, sentence: 'Drivers ___ (stop) at a red light. (bắt buộc theo luật)', answer: 'must stop', hint: 'must + V', kind: 'khẳng định' },
            { id: 8, sentence: 'You ___ touch that wire — it\'s dangerous. (cấm)', answer: 'mustn\'t', hint: 'cấm đoán', kind: 'phủ định' },
            { id: 9, sentence: 'If you have a headache, you ___ (drink) more water.', answer: 'should drink', hint: 'lời khuyên', kind: 'khẳng định' },
            { id: 10, sentence: 'The entry is free, so you ___ have to buy a ticket.', answer: 'don\'t', hint: 'không cần', kind: 'phủ định' },
            { id: 11, sentence: 'He ___ (work) twelve hours a day in his old job. (bắt buộc quá khứ)', answer: 'had to work', hint: 'have to quá khứ', kind: 'khẳng định' },
            { id: 12, sentence: 'You spend too much. You ___ (not/waste) money.', answer: 'shouldn\'t waste', hint: 'lời khuyên phủ định', kind: 'phủ định' },
            { id: 13, sentence: 'Passengers ___ (fasten) their seatbelts during take-off.', answer: 'must fasten', hint: 'must + V', kind: 'khẳng định' },
            { id: 14, sentence: 'Tomorrow is Sunday, so I won\'t ___ to get up early.', answer: 'have', hint: 'have to (tương lai phủ định)', kind: 'phủ định' },
            { id: 15, sentence: '___ we book the table in advance? (xin lời khuyên)', answer: 'Should', hint: 'nghi vấn', kind: 'nghi vấn' },
            { id: 16, sentence: 'Visitors ___ (not/feed) the animals. (cấm)', answer: 'mustn\'t feed', hint: 'cấm đoán', kind: 'phủ định' },
            { id: 17, sentence: 'To stay healthy, you ___ (exercise) regularly.', answer: 'should exercise', hint: 'lời khuyên', kind: 'khẳng định' },
            { id: 18, sentence: 'In my country, children ___ (go) to school until they are sixteen.', answer: 'have to go', hint: 'have to (quy định)', kind: 'khẳng định' },
            { id: 19, sentence: 'You ___ (apologize) to her; it would be the right thing.', answer: 'ought to apologize', hint: 'ought to + V', kind: 'khẳng định' },
            { id: 20, sentence: 'We have plenty of time, so we ___ have to rush.', answer: 'don\'t', hint: 'không cần', kind: 'phủ định' }
        ]
    },
    'modal-deduction': {
        usage: {
            intro: 'Dùng modal để <b>suy đoán</b> mức độ chắc chắn của một sự việc dựa trên bằng chứng.',
            items: [
                { title: 'Chắc chắn đúng (must)', icon: 'verified', examples: ['The lights are on. They <b>must be</b> home.', 'You <b>must be</b> tired after the trip.'] },
                { title: 'Chắc chắn sai (can\'t)', icon: 'cancel', examples: ['He <b>can\'t be</b> hungry; he just ate.', 'That <b>can\'t be</b> true.'] },
                { title: 'Có thể (may / might / could)', icon: 'help', examples: ['She <b>might be</b> at work.', 'It <b>could rain</b> later.'] }
            ],
            signalWords: { label: 'Thang chắc chắn', words: ['must = gần như chắc chắn', 'may/might/could = có thể', "can't = gần như không thể"] }
        },
        formula: {
            note: 'Suy đoán hiện tại: <b>modal + V</b>. Suy đoán quá khứ: <b>modal + have + V3</b>.',
            groups: [
                {
                    label: 'Suy đoán hiện tại / quá khứ',
                    sub: 'must / might / can\'t',
                    sentences: [
                        { kind: 'Hiện tại', sign: '+', formula: 'S + must/might/can\'t + V', examples: ['He <b>must know</b> the answer.', 'She <b>might come</b>.'] },
                        { kind: 'Quá khứ', sign: '+', formula: 'S + must/might/can\'t + have + V3', examples: ['He <b>must have left</b>.', 'They <b>might have forgotten</b>.'] },
                        { kind: 'Phủ định', sign: '−', formula: 'S + can\'t + (have) + V', examples: ['She <b>can\'t be</b> serious.', 'He <b>can\'t have done</b> it.'] }
                    ],
                    subject: { headers: ['Mức độ', 'Modal'], rows: [['Chắc chắn có', 'must'], ['Có thể', 'may / might / could'], ['Chắc chắn không', "can't"]] },
                    note: 'Để suy đoán "chắc chắn không", dùng <b>can\'t</b> (KHÔNG dùng mustn\'t — mustn\'t mang nghĩa cấm).'
                }
            ],
            contractions: ["can't = cannot", "mustn't = must not (nghĩa cấm, KHÔNG dùng để suy đoán)"]
        },
        exercises: [
            { id: 1, sentence: 'The phone is ringing. It ___ (be) my mother. (chắc chắn)', answer: 'must be', hint: 'must + V', kind: 'khẳng định' },
            { id: 2, sentence: 'He just ate a huge meal. He ___ be hungry. (chắc chắn không)', answer: 'can\'t', hint: 'phủ định suy đoán', kind: 'phủ định' },
            { id: 3, sentence: 'I\'m not sure where she is. She ___ (be) at the gym. (có thể)', answer: 'might be', hint: 'might + V', kind: 'khẳng định' },
            { id: 4, sentence: 'The ground is wet. It ___ have rained last night.', answer: 'must', hint: 'suy đoán quá khứ', kind: 'khẳng định' },
            { id: 5, sentence: 'They aren\'t answering. They ___ (have/leave) already.', answer: 'must have left', hint: 'must + have + V3', kind: 'khẳng định' },
            { id: 6, sentence: 'That ___ be John — he\'s in London right now.', answer: 'can\'t', hint: 'chắc chắn không', kind: 'phủ định' },
            { id: 7, sentence: 'She\'s wearing a coat. It ___ (be) cold outside. (chắc chắn)', answer: 'must be', hint: 'must + V', kind: 'khẳng định' },
            { id: 8, sentence: 'I\'m not certain, but they ___ (arrive) by noon. (có thể)', answer: 'might arrive', hint: 'might + V', kind: 'khẳng định' },
            { id: 9, sentence: 'He speaks perfect French. He ___ (live) in Paris for years.', answer: 'must have lived', hint: 'suy đoán quá khứ', kind: 'khẳng định' },
            { id: 10, sentence: 'You ___ be serious! That\'s impossible. (chắc chắn không)', answer: 'can\'t', hint: 'phủ định suy đoán', kind: 'phủ định' },
            { id: 11, sentence: 'The door is open. Someone ___ (be) inside. (chắc chắn)', answer: 'must be', hint: 'must + V', kind: 'khẳng định' },
            { id: 12, sentence: 'I\'m not sure who called. It ___ (be) the office. (có thể)', answer: 'could be', hint: 'could + V', kind: 'khẳng định' },
            { id: 13, sentence: 'Her car is gone. She ___ (have/go) to work.', answer: 'must have gone', hint: 'must + have + V3', kind: 'khẳng định' },
            { id: 14, sentence: 'He ___ have stolen it; he was with me all day.', answer: 'can\'t', hint: 'suy đoán quá khứ phủ định', kind: 'phủ định' },
            { id: 15, sentence: 'The lights are off. They ___ (be) asleep. (có thể)', answer: 'might be', hint: 'might + V', kind: 'khẳng định' },
            { id: 16, sentence: 'You\'ve worked all night. You ___ (be) exhausted. (chắc chắn)', answer: 'must be', hint: 'must + V', kind: 'khẳng định' },
            { id: 17, sentence: 'I can\'t find my wallet. I ___ (have/leave) it at home.', answer: 'might have left', hint: 'might + have + V3', kind: 'khẳng định' },
            { id: 18, sentence: 'This ___ be the right address; the numbers don\'t match.', answer: 'can\'t', hint: 'chắc chắn không', kind: 'phủ định' },
            { id: 19, sentence: 'She knows every detail. She ___ (have/read) the report.', answer: 'must have read', hint: 'must + have + V3', kind: 'khẳng định' },
            { id: 20, sentence: 'Nobody answered the bell. They ___ (be) out. (có thể)', answer: 'could be', hint: 'could + V', kind: 'khẳng định' }
        ]
    }
};

export default { group, content };
