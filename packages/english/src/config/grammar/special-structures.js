// ============================================
// Grammar Group: Special Structures (Cấu trúc đặc biệt)
// ============================================

const group = {
    id: 'special-structures',
    nameVi: 'Cấu trúc đặc biệt',
    nameEn: 'Special Structures',
    icon: 'star',
    order: 15,
    lessons: [
        { id: 'wish-clauses', nameVi: 'Câu ước với Wish', nameEn: 'Wish Clauses', icon: 'auto_awesome', ielts: false },
        { id: 'used-to', nameVi: 'Used to / Be used to', nameEn: 'Used to', icon: 'history_edu', ielts: false },
        { id: 'so-such', nameVi: 'So... that & Such... that', nameEn: 'So / Such', icon: 'priority_high', ielts: false }
    ]
};

const content = {
    'wish-clauses': {
        usage: {
            intro: 'Câu ước với <b>wish</b> diễn tả mong muốn điều gì đó khác với thực tế ở hiện tại, quá khứ hoặc tương lai.',
            items: [
                { title: 'Ước ở hiện tại (wish + quá khứ)', icon: 'today', examples: ['I <b>wish I were</b> taller.', 'I <b>wish I had</b> more money.'] },
                { title: 'Ước ở quá khứ (wish + QK hoàn thành)', icon: 'history', examples: ['I <b>wish I had studied</b> harder.'] },
                { title: 'Ước ở tương lai (wish + would)', icon: 'update', examples: ['I <b>wish</b> it <b>would stop</b> raining.'] }
            ],
            signalWords: { label: 'Cấu trúc', words: ['wish + quá khứ đơn (hiện tại)', 'wish + had + V3 (quá khứ)', 'wish + would + V (tương lai)'] }
        },
        formula: {
            note: 'Cấu trúc wish lùi thì giống câu điều kiện: dùng <b>were</b> cho mọi ngôi ở hiện tại.',
            groups: [
                {
                    label: 'Câu ước',
                    sub: 'wish clauses',
                    sentences: [
                        { kind: 'Hiện tại', sign: '+', formula: 'wish + S + V(quá khứ)', examples: ['I wish I <b>knew</b> the answer.'] },
                        { kind: 'Quá khứ', sign: '+', formula: 'wish + S + had + V3', examples: ['I wish I <b>had come</b>.'] },
                        { kind: 'Tương lai', sign: '+', formula: 'wish + S + would + V', examples: ['I wish he <b>would call</b>.'] }
                    ],
                    subject: { headers: ['Ước về', 'Cấu trúc'], rows: [['Hiện tại', 'wish + V2/were'], ['Quá khứ', 'wish + had + V3'], ['Tương lai', 'wish + would + V']] },
                    note: 'Cấu trúc <b>If only</b> mang nghĩa tương tự wish nhưng nhấn mạnh hơn: If only I <b>were</b> rich!'
                }
            ],
            contractions: []
        },
        exercises: [
            { id: 1, sentence: 'I wish I ___ (be) taller. (hiện tại)', answer: 'were', hint: 'were mọi ngôi', kind: 'khẳng định' },
            { id: 2, sentence: 'She wishes she ___ (have) a car. (hiện tại)', answer: 'had', hint: 'V2', kind: 'khẳng định' },
            { id: 3, sentence: 'I wish I ___ (study) harder last year. (quá khứ)', answer: 'had studied', hint: 'had + V3', kind: 'khẳng định' },
            { id: 4, sentence: 'I wish it ___ (stop) raining. (tương lai)', answer: 'would stop', hint: 'would + V', kind: 'khẳng định' },
            { id: 5, sentence: 'He wishes he ___ (not/sell) his house. (quá khứ)', answer: 'had not sold', hint: 'had + V3 phủ định', kind: 'phủ định' },
            { id: 6, sentence: 'I wish I ___ (know) how to swim. (hiện tại)', answer: 'knew', hint: 'V2', kind: 'khẳng định' },
            { id: 7, sentence: 'I wish you ___ (be) here with me now. (hiện tại)', answer: 'were', hint: 'were mọi ngôi', kind: 'khẳng định' },
            { id: 8, sentence: 'She wishes she ___ (speak) French fluently. (hiện tại)', answer: 'spoke', hint: 'V2', kind: 'khẳng định' },
            { id: 9, sentence: 'I wish I ___ (not/miss) the train yesterday. (quá khứ)', answer: 'had not missed', hint: 'had + V3 phủ định', kind: 'phủ định' },
            { id: 10, sentence: 'They wish they ___ (book) the tickets earlier. (quá khứ)', answer: 'had booked', hint: 'had + V3', kind: 'khẳng định' },
            { id: 11, sentence: 'I wish my neighbour ___ (stop) making noise. (tương lai)', answer: 'would stop', hint: 'would + V', kind: 'khẳng định' },
            { id: 12, sentence: 'He wishes he ___ (have) a bigger house. (hiện tại)', answer: 'had', hint: 'V2', kind: 'khẳng định' },
            { id: 13, sentence: 'I wish I ___ (listen) to your advice. (quá khứ)', answer: 'had listened', hint: 'had + V3', kind: 'khẳng định' },
            { id: 14, sentence: 'We wish it ___ (be) warmer today. (hiện tại)', answer: 'were', hint: 'were mọi ngôi', kind: 'khẳng định' },
            { id: 15, sentence: 'I wish you ___ (drive) more carefully. (tương lai)', answer: 'would drive', hint: 'would + V', kind: 'khẳng định' },
            { id: 16, sentence: 'She wishes she ___ (not/say) those words. (quá khứ)', answer: 'had not said', hint: 'had + V3 phủ định', kind: 'phủ định' },
            { id: 17, sentence: 'I wish I ___ (live) closer to the office. (hiện tại)', answer: 'lived', hint: 'V2', kind: 'khẳng định' },
            { id: 18, sentence: 'They wish the rain ___ (stop) soon. (tương lai)', answer: 'would stop', hint: 'would + V', kind: 'khẳng định' },
            { id: 19, sentence: 'He wishes he ___ (study) medicine at university. (quá khứ)', answer: 'had studied', hint: 'had + V3', kind: 'khẳng định' },
            { id: 20, sentence: 'I wish I ___ (can) play the piano. (hiện tại)', answer: 'could', hint: 'can → could', kind: 'khẳng định' }
        ]
    },
    'used-to': {
        usage: {
            intro: 'Phân biệt ba cấu trúc dễ nhầm: <b>used to + V</b>, <b>be used to + V-ing</b>, <b>get used to + V-ing</b>.',
            items: [
                { title: 'used to + V — thói quen quá khứ (không còn)', icon: 'history', examples: ['I <b>used to smoke</b>. (giờ đã bỏ)'] },
                { title: 'be used to + V-ing — đã quen với', icon: 'check_circle', examples: ['I <b>am used to working</b> late.'] },
                { title: 'get used to + V-ing — đang dần quen', icon: 'trending_up', examples: ['I\'m <b>getting used to</b> the weather.'] }
            ],
            signalWords: { label: 'Phân biệt', words: ['used to + V (nguyên thể)', 'be/get used to + V-ing/N', 'used to ≠ be used to'] }
        },
        formula: {
            note: 'Lưu ý sự khác biệt giữa <b>used to + V</b> (quá khứ) và <b>be used to + V-ing</b> (sự quen thuộc).',
            groups: [
                {
                    label: 'Used to và biến thể',
                    sub: 'used to',
                    sentences: [
                        { kind: 'Thói quen QK', sign: '+', formula: 'S + used to + V', examples: ['I <b>used to live</b> here.'] },
                        { kind: 'Đã quen', sign: '+', formula: 'S + be used to + V-ing', examples: ['She <b>is used to driving</b>.'] },
                        { kind: 'Dần quen', sign: '+', formula: 'S + get used to + V-ing', examples: ['He <b>got used to</b> it.'] }
                    ],
                    subject: {
                        headers: ['Cấu trúc', 'Nghĩa', 'Theo sau'],
                        rows: [['used to', 'thói quen quá khứ', 'V nguyên thể'], ['be used to', 'đã quen', 'V-ing / danh từ'], ['get used to', 'dần quen', 'V-ing / danh từ']]
                    },
                    note: 'Phủ định/nghi vấn của used to: <b>didn\'t use to</b> / <b>Did you use to...?</b> (bỏ -d).'
                }
            ],
            contractions: []
        },
        exercises: [
            { id: 1, sentence: 'I ___ (use to) play football when I was young.', answer: 'used to', hint: 'thói quen QK', kind: 'khẳng định' },
            { id: 2, sentence: 'She is used to ___ (get) up early.', answer: 'getting', hint: 'be used to + V-ing', kind: 'khẳng định' },
            { id: 3, sentence: 'They used to ___ (live) in Paris.', answer: 'live', hint: 'used to + V', kind: 'khẳng định' },
            { id: 4, sentence: 'He is getting used to ___ (work) night shifts.', answer: 'working', hint: 'get used to + V-ing', kind: 'khẳng định' },
            { id: 5, sentence: 'I am used to ___ (the) noise now.', answer: 'the', hint: 'be used to + N', kind: 'khẳng định' },
            { id: 6, sentence: 'We didn\'t ___ (use) to have a car.', answer: 'use', hint: 'phủ định bỏ -d', kind: 'phủ định' },
            { id: 7, sentence: 'He ___ (use to) smoke, but he quit last year.', answer: 'used to', hint: 'thói quen QK', kind: 'khẳng định' },
            { id: 8, sentence: 'I am used to ___ (drive) on the left now.', answer: 'driving', hint: 'be used to + V-ing', kind: 'khẳng định' },
            { id: 9, sentence: 'She used to ___ (have) long hair.', answer: 'have', hint: 'used to + V', kind: 'khẳng định' },
            { id: 10, sentence: 'They are getting used to ___ (live) in a big city.', answer: 'living', hint: 'get used to + V-ing', kind: 'khẳng định' },
            { id: 11, sentence: 'Did you ___ (use) to play any sport?', answer: 'use', hint: 'nghi vấn bỏ -d', kind: 'nghi vấn' },
            { id: 12, sentence: 'I can\'t get used to ___ (wake) up so early.', answer: 'waking', hint: 'get used to + V-ing', kind: 'khẳng định' },
            { id: 13, sentence: 'There ___ (use to) be a cinema here.', answer: 'used to', hint: 'thói quen QK', kind: 'khẳng định' },
            { id: 14, sentence: 'He is used to ___ (work) under pressure.', answer: 'working', hint: 'be used to + V-ing', kind: 'khẳng định' },
            { id: 15, sentence: 'We used to ___ (go) camping every summer.', answer: 'go', hint: 'used to + V', kind: 'khẳng định' },
            { id: 16, sentence: 'She didn\'t ___ (use) to like coffee.', answer: 'use', hint: 'phủ định bỏ -d', kind: 'phủ định' },
            { id: 17, sentence: 'I\'m gradually getting used to ___ (the) cold weather.', answer: 'the', hint: 'get used to + N', kind: 'khẳng định' },
            { id: 18, sentence: 'My father used to ___ (tell) us stories at night.', answer: 'tell', hint: 'used to + V', kind: 'khẳng định' },
            { id: 19, sentence: 'Are you used to ___ (eat) spicy food?', answer: 'eating', hint: 'be used to + V-ing', kind: 'nghi vấn' },
            { id: 20, sentence: 'It took time, but he got used to ___ (the) new system.', answer: 'the', hint: 'get used to + N', kind: 'khẳng định' }
        ]
    },
    'so-such': {
        usage: {
            intro: 'Cấu trúc <b>so... that</b> và <b>such... that</b> diễn tả mức độ dẫn đến kết quả. Khác nhau ở từ theo sau.',
            items: [
                { title: 'so + tính từ/trạng từ + that', icon: 'straighten', examples: ['It was <b>so hot that</b> we stayed in.'] },
                { title: 'such + (a/an) + tính từ + danh từ + that', icon: 'category', examples: ['It was <b>such a hot day that</b> we stayed in.'] }
            ],
            signalWords: { label: 'Phân biệt', words: ['so + adj/adv', 'such + (a) + adj + N', 'so much/many + N'] }
        },
        formula: {
            note: '<b>so</b> đi với tính từ/trạng từ đứng một mình; <b>such</b> đi với cụm danh từ.',
            groups: [
                {
                    label: 'So... that & Such... that',
                    sub: 'so / such',
                    sentences: [
                        { kind: 'so', sign: '+', formula: 'so + adj/adv + that + clause', examples: ['She is <b>so kind that</b> everyone loves her.'] },
                        { kind: 'such', sign: '+', formula: 'such + (a) + adj + N + that', examples: ['It\'s <b>such a good book that</b> I read it twice.'] }
                    ],
                    subject: {
                        headers: ['Cấu trúc', 'Theo sau', 'Ví dụ'],
                        rows: [['so', 'adj/adv', 'so tall, so quickly'], ['such', '(a/an) + adj + N', 'such a nice car'], ['so much/many', 'danh từ', 'so much money']]
                    },
                    note: 'Với danh từ đếm được số ít, dùng <b>such a/an</b>: such <b>a</b> beautiful flower.'
                }
            ],
            contractions: []
        },
        exercises: [
            { id: 1, sentence: 'It was ___ cold that the lake froze. (so/such)', answer: 'so', hint: 'so + adj', kind: 'khẳng định' },
            { id: 2, sentence: 'He is ___ a good teacher that students love him. (so/such)', answer: 'such', hint: 'such + a + adj + N', kind: 'khẳng định' },
            { id: 3, sentence: 'She ran ___ fast that no one could catch her. (so/such)', answer: 'so', hint: 'so + adv', kind: 'khẳng định' },
            { id: 4, sentence: 'It was ___ an interesting movie that I watched it again. (so/such)', answer: 'such', hint: 'such + an + adj + N', kind: 'khẳng định' },
            { id: 5, sentence: 'There was ___ much noise that I couldn\'t sleep. (so much)', answer: 'so', hint: 'so much + N', kind: 'khẳng định' },
            { id: 6, sentence: 'They were ___ tired that they slept all day. (so/such)', answer: 'so', hint: 'so + adj', kind: 'khẳng định' },
            { id: 7, sentence: 'It was ___ a beautiful day that we went to the beach. (so/such)', answer: 'such', hint: 'such + a + adj + N', kind: 'khẳng định' },
            { id: 8, sentence: 'The box was ___ heavy that I couldn\'t lift it. (so/such)', answer: 'so', hint: 'so + adj', kind: 'khẳng định' },
            { id: 9, sentence: 'They are ___ kind people that everyone likes them. (so/such)', answer: 'such', hint: 'such + adj + N (số nhiều)', kind: 'khẳng định' },
            { id: 10, sentence: 'He spoke ___ quietly that no one heard him. (so/such)', answer: 'so', hint: 'so + adv', kind: 'khẳng định' },
            { id: 11, sentence: 'It was ___ an easy test that everyone passed. (so/such)', answer: 'such', hint: 'such + an + adj + N', kind: 'khẳng định' },
            { id: 12, sentence: 'She had ___ many books that she needed a new shelf. (so many)', answer: 'so', hint: 'so many + N', kind: 'khẳng định' },
            { id: 13, sentence: 'The coffee was ___ hot that I burned my tongue. (so/such)', answer: 'so', hint: 'so + adj', kind: 'khẳng định' },
            { id: 14, sentence: 'It was ___ delicious food that we ordered more. (so/such)', answer: 'such', hint: 'such + adj + N (không đếm)', kind: 'khẳng định' },
            { id: 15, sentence: 'He drove ___ carelessly that he caused an accident. (so/such)', answer: 'so', hint: 'so + adv', kind: 'khẳng định' },
            { id: 16, sentence: 'There was ___ little time that we had to rush. (so little)', answer: 'so', hint: 'so little + N', kind: 'khẳng định' },
            { id: 17, sentence: 'It was ___ a long film that I fell asleep. (so/such)', answer: 'such', hint: 'such + a + adj + N', kind: 'khẳng định' },
            { id: 18, sentence: 'The music was ___ loud that we couldn\'t talk. (so/such)', answer: 'so', hint: 'so + adj', kind: 'khẳng định' },
            { id: 19, sentence: 'They were ___ exciting games that everyone cheered. (so/such)', answer: 'such', hint: 'such + adj + N (số nhiều)', kind: 'khẳng định' },
            { id: 20, sentence: 'She was ___ happy that she cried. (so/such)', answer: 'so', hint: 'so + adj', kind: 'khẳng định' }
        ]
    }
};

export default { group, content };
