// ============================================
// Grammar Group: Nouns, Articles & Quantifiers
// (Danh từ, Mạo từ & Lượng từ)
// ============================================

const group = {
    id: 'nouns-articles-quantifiers',
    nameVi: 'Danh từ, Mạo từ & Lượng từ',
    nameEn: 'Nouns, Articles & Quantifiers',
    icon: 'category',
    order: 8,
    lessons: [
        { id: 'countable-uncountable', nameVi: 'Danh từ đếm được & không đếm được', nameEn: 'Countable & Uncountable', icon: 'tag', ielts: true },
        { id: 'articles', nameVi: 'Mạo từ a / an / the', nameEn: 'Articles', icon: 'text_fields', ielts: true },
        { id: 'quantifiers', nameVi: 'Lượng từ', nameEn: 'Quantifiers', icon: 'exposure', ielts: true }
    ]
};

const content = {
    'countable-uncountable': {
        usage: {
            intro: 'Danh từ <b>đếm được</b> có dạng số ít/số nhiều; danh từ <b>không đếm được</b> chỉ có một dạng và không thêm -s.',
            items: [
                { title: 'Đếm được (countable)', icon: 'looks_one', examples: ['a book → two <b>books</b>', 'an apple → three <b>apples</b>'] },
                { title: 'Không đếm được (uncountable)', icon: 'water_drop', examples: ['water, rice, information, advice', 'KHÔNG nói: <i>two waters, advices</i>'] },
                { title: 'Đo lượng không đếm được bằng đơn vị', icon: 'straighten', examples: ['a glass <b>of</b> water', 'a piece <b>of</b> advice'] }
            ],
            signalWords: { label: 'Không đếm được phổ biến', words: ['water, money, time, music', 'information, advice, news, furniture', 'work, knowledge, luggage'] }
        },
        formula: {
            note: 'Danh từ không đếm được luôn đi với động từ <b>số ít</b>.',
            groups: [
                {
                    label: 'Đếm được vs Không đếm được',
                    sub: 'countable / uncountable',
                    sentences: [
                        { kind: 'Đếm được', sign: '+', formula: 'a/an + N (số ít); N + s (số nhiều)', examples: ['I have <b>a cat</b> / two <b>cats</b>.'] },
                        { kind: 'Không đếm', sign: '+', formula: 'some/much + N (không -s)', examples: ['I need <b>some water</b>.'] }
                    ],
                    subject: { headers: ['Loại', 'Mạo từ a/an?', 'Số nhiều?'], rows: [['Đếm được', 'Có', 'Có (+s)'], ['Không đếm được', 'Không', 'Không']] },
                    note: 'Một số từ luôn không đếm được trong tiếng Anh dù tiếng Việt đếm được: <b>advice, information, furniture, news</b>.'
                }
            ],
            contractions: []
        },
        exercises: [
            { id: 1, sentence: 'I bought three ___ (book) yesterday.', answer: 'books', hint: 'đếm được', kind: 'khẳng định' },
            { id: 2, sentence: 'She gave me some good ___ (advice).', answer: 'advice', hint: 'không đếm được', kind: 'khẳng định' },
            { id: 3, sentence: 'Can I have a glass ___ water?', answer: 'of', hint: 'đơn vị đo', kind: 'khẳng định' },
            { id: 4, sentence: 'There ___ (be) a lot of information online. (số ít)', answer: 'is', hint: 'động từ số ít', kind: 'khẳng định' },
            { id: 5, sentence: 'We need two ___ (chair) for the table.', answer: 'chairs', hint: 'đếm được', kind: 'khẳng định' },
            { id: 6, sentence: 'The ___ (news) was shocking. (số ít)', answer: 'news', hint: 'không đếm được', kind: 'khẳng định' },
            { id: 7, sentence: 'She put four ___ (box) in the car.', answer: 'boxes', hint: 'đếm được', kind: 'khẳng định' },
            { id: 8, sentence: 'I need to buy some ___ (furniture) for the office.', answer: 'furniture', hint: 'không đếm được', kind: 'khẳng định' },
            { id: 9, sentence: 'Can you give me a piece ___ paper?', answer: 'of', hint: 'đơn vị đo', kind: 'khẳng định' },
            { id: 10, sentence: 'There are many ___ (child) in the playground.', answer: 'children', hint: 'số nhiều bất quy tắc', kind: 'khẳng định' },
            { id: 11, sentence: 'How much ___ (luggage) do you have? (không đếm)', answer: 'luggage', hint: 'không đếm được', kind: 'nghi vấn' },
            { id: 12, sentence: 'We saw two ___ (woman) at the door.', answer: 'women', hint: 'số nhiều bất quy tắc', kind: 'khẳng định' },
            { id: 13, sentence: 'Your ___ (knowledge) of history is impressive. (số ít)', answer: 'knowledge', hint: 'không đếm được', kind: 'khẳng định' },
            { id: 14, sentence: 'He ate three ___ (loaf) of bread.', answer: 'loaves', hint: 'số nhiều bất quy tắc', kind: 'khẳng định' },
            { id: 15, sentence: 'I would like a cup ___ tea, please.', answer: 'of', hint: 'đơn vị đo', kind: 'khẳng định' },
            { id: 16, sentence: 'All the ___ (money) was spent on books. (số ít)', answer: 'money', hint: 'không đếm được', kind: 'khẳng định' },
            { id: 17, sentence: 'There are five ___ (foot) in this measurement.', answer: 'feet', hint: 'số nhiều bất quy tắc', kind: 'khẳng định' },
            { id: 18, sentence: 'The ___ (weather) is lovely today. (số ít)', answer: 'weather', hint: 'không đếm được', kind: 'khẳng định' },
            { id: 19, sentence: 'She bought several ___ (tomato) at the market.', answer: 'tomatoes', hint: 'đếm được', kind: 'khẳng định' },
            { id: 20, sentence: 'Could I have a bar ___ chocolate?', answer: 'of', hint: 'đơn vị đo', kind: 'nghi vấn' }
        ]
    },
    'articles': {
        usage: {
            intro: 'Mạo từ <b>a/an</b> (không xác định) dùng cho danh từ đếm được số ít lần đầu nhắc; <b>the</b> (xác định) dùng khi đã rõ đối tượng.',
            items: [
                { title: 'a / an — lần đầu, chung chung', icon: 'fiber_new', examples: ['I saw <b>a</b> dog.', 'She is <b>an</b> engineer.'] },
                { title: 'the — đã xác định / duy nhất', icon: 'gps_fixed', examples: ['<b>The</b> dog I saw was big.', '<b>The</b> sun is bright.'] },
                { title: 'Không mạo từ (zero article)', icon: 'block', examples: ['I like <b>music</b>. (chung chung)', '<b>Cats</b> are cute.'] }
            ],
            signalWords: { label: 'Quy tắc a/an', words: ['a + phụ âm: a book, a university (yu)', 'an + nguyên âm: an apple, an hour (h câm)'] }
        },
        formula: {
            note: 'Dùng <b>an</b> trước âm nguyên âm (không phải chữ cái): an hour (h câm), a university (âm "yu").',
            groups: [
                {
                    label: 'Mạo từ',
                    sub: 'a / an / the',
                    sentences: [
                        { kind: 'a/an', sign: '+', formula: 'a/an + N đếm được số ít', examples: ['I need <b>a</b> pen.'] },
                        { kind: 'the', sign: '+', formula: 'the + N (đã xác định)', examples: ['Close <b>the</b> door.'] },
                        { kind: 'Zero', sign: '∅', formula: 'N số nhiều/không đếm chung chung', examples: ['I love <b>dogs</b>.'] }
                    ],
                    subject: { headers: ['Trường hợp', 'Mạo từ'], rows: [['Lần đầu nhắc, số ít', 'a/an'], ['Đã xác định / duy nhất', 'the'], ['Danh từ chung số nhiều', '∅ (không mạo từ)']] },
                    note: 'Dùng <b>the</b> với vật duy nhất (the sun, the moon), số thứ tự (the first), so sánh nhất (the best).'
                }
            ],
            contractions: []
        },
        exercises: [
            { id: 1, sentence: 'She is ___ honest person. (h câm)', answer: 'an', hint: 'an + nguyên âm', kind: 'khẳng định' },
            { id: 2, sentence: 'I saw ___ movie last night. It was great.', answer: 'a', hint: 'lần đầu', kind: 'khẳng định' },
            { id: 3, sentence: '___ Earth revolves around the Sun. (duy nhất)', answer: 'The', hint: 'duy nhất', kind: 'khẳng định' },
            { id: 4, sentence: 'He is ___ university student. (âm yu)', answer: 'a', hint: 'a + âm phụ âm', kind: 'khẳng định' },
            { id: 5, sentence: 'I usually drink ___ coffee in the morning. (chung chung)', answer: '', hint: 'zero article', kind: 'khẳng định' },
            { id: 6, sentence: 'This is ___ best day of my life. (so sánh nhất)', answer: 'the', hint: 'the + nhất', kind: 'khẳng định' },
            { id: 7, sentence: 'I waited for ___ hour at the station. (h câm)', answer: 'an', hint: 'an + nguyên âm', kind: 'khẳng định' },
            { id: 8, sentence: 'She wants to be ___ doctor when she grows up.', answer: 'a', hint: 'lần đầu, số ít', kind: 'khẳng định' },
            { id: 9, sentence: 'Look at ___ moon tonight; it\'s beautiful. (duy nhất)', answer: 'the', hint: 'duy nhất', kind: 'khẳng định' },
            { id: 10, sentence: 'He played ___ guitar all evening. (nhạc cụ)', answer: 'the', hint: 'the + nhạc cụ', kind: 'khẳng định' },
            { id: 11, sentence: 'I love ___ animals, especially dogs. (chung chung)', answer: '', hint: 'zero article', kind: 'khẳng định' },
            { id: 12, sentence: 'There is ___ egg in the basket.', answer: 'an', hint: 'an + nguyên âm', kind: 'khẳng định' },
            { id: 13, sentence: 'She is ___ first student to finish. (số thứ tự)', answer: 'the', hint: 'the + số thứ tự', kind: 'khẳng định' },
            { id: 14, sentence: 'We had ___ dinner at eight. (bữa ăn)', answer: '', hint: 'zero article', kind: 'khẳng định' },
            { id: 15, sentence: 'He bought ___ umbrella because it was raining.', answer: 'an', hint: 'an + nguyên âm', kind: 'khẳng định' },
            { id: 16, sentence: '___ Alps are a famous mountain range. (tên dãy núi)', answer: 'The', hint: 'the + dãy núi', kind: 'khẳng định' },
            { id: 17, sentence: 'My brother works as ___ nurse.', answer: 'a', hint: 'nghề nghiệp, số ít', kind: 'khẳng định' },
            { id: 18, sentence: 'Can you turn on ___ light, please? (đã xác định)', answer: 'the', hint: 'đã xác định', kind: 'nghi vấn' },
            { id: 19, sentence: 'She speaks ___ English fluently. (ngôn ngữ)', answer: '', hint: 'zero article', kind: 'khẳng định' },
            { id: 20, sentence: 'It takes ___ hour and a half to get there. (h câm)', answer: 'an', hint: 'an + nguyên âm', kind: 'khẳng định' }
        ]
    },
    'quantifiers': {
        usage: {
            intro: 'Lượng từ chỉ số lượng, phải phù hợp với danh từ <b>đếm được</b> hay <b>không đếm được</b>.',
            items: [
                { title: 'many / few — đếm được', icon: 'format_list_numbered', examples: ['<b>many</b> books, <b>few</b> people', 'How <b>many</b> apples?'] },
                { title: 'much / little — không đếm được', icon: 'water_drop', examples: ['<b>much</b> water, <b>little</b> time', 'How <b>much</b> money?'] },
                { title: 'some / any / a lot of — cả hai', icon: 'all_inclusive', examples: ['<b>some</b> water, <b>some</b> books', '<b>a lot of</b> friends/money'] }
            ],
            signalWords: { label: 'Ghi nhớ', words: ['many/few/a few → đếm được', 'much/little/a little → không đếm', 'some (khẳng định)', 'any (phủ định/nghi vấn)'] }
        },
        formula: {
            note: '<b>some</b> dùng trong câu khẳng định; <b>any</b> dùng trong câu phủ định và nghi vấn.',
            groups: [
                {
                    label: 'Lượng từ',
                    sub: 'quantifiers',
                    sentences: [
                        { kind: 'Đếm được', sign: '+', formula: 'many / a few / few + N(s)', examples: ['I have <b>a few</b> questions.'] },
                        { kind: 'Không đếm', sign: '+', formula: 'much / a little / little + N', examples: ['There is <b>a little</b> milk.'] },
                        { kind: 'Cả hai', sign: '+', formula: 'some / any / a lot of + N', examples: ['We have <b>a lot of</b> time.'] }
                    ],
                    subject: {
                        headers: ['Lượng từ', 'Đếm được', 'Không đếm'],
                        rows: [['many / much', 'many', 'much'], ['few / little', 'few', 'little'], ['a few / a little', 'a few', 'a little'], ['some / any / a lot of', '✓', '✓']]
                    },
                    note: 'Phân biệt: <b>a few</b>/<b>a little</b> (một chút — nghĩa tích cực) vs <b>few</b>/<b>little</b> (rất ít — nghĩa tiêu cực).'
                }
            ],
            contractions: []
        },
        exercises: [
            { id: 1, sentence: 'How ___ books do you have? (đếm được)', answer: 'many', hint: 'đếm được', kind: 'nghi vấn' },
            { id: 2, sentence: 'There isn\'t ___ water left. (không đếm)', answer: 'much', hint: 'không đếm', kind: 'phủ định' },
            { id: 3, sentence: 'I have ___ friends here. (một vài, tích cực)', answer: 'a few', hint: 'a few', kind: 'khẳng định' },
            { id: 4, sentence: 'Would you like ___ tea? (mời, nghi vấn)', answer: 'some', hint: 'some khi mời', kind: 'nghi vấn' },
            { id: 5, sentence: 'There is ___ milk in the fridge, just enough. (một chút)', answer: 'a little', hint: 'a little', kind: 'khẳng định' },
            { id: 6, sentence: 'We don\'t have ___ money. (phủ định)', answer: 'any', hint: 'any phủ định', kind: 'phủ định' },
            { id: 7, sentence: 'How ___ time do we have left? (không đếm)', answer: 'much', hint: 'không đếm', kind: 'nghi vấn' },
            { id: 8, sentence: 'Very ___ people came to the meeting. (rất ít, tiêu cực)', answer: 'few', hint: 'few', kind: 'khẳng định' },
            { id: 9, sentence: 'There is ___ sugar left; we need to buy more. (rất ít, tiêu cực)', answer: 'little', hint: 'little', kind: 'khẳng định' },
            { id: 10, sentence: 'I have ___ questions to ask you. (một vài, tích cực)', answer: 'a few', hint: 'a few', kind: 'khẳng định' },
            { id: 11, sentence: 'She put ___ salt in the soup. (một chút)', answer: 'a little', hint: 'a little', kind: 'khẳng định' },
            { id: 12, sentence: 'There are ___ apples in the basket. (nhiều, đếm được)', answer: 'many', hint: 'đếm được', kind: 'khẳng định' },
            { id: 13, sentence: 'Is there ___ juice in the bottle? (nghi vấn)', answer: 'any', hint: 'any nghi vấn', kind: 'nghi vấn' },
            { id: 14, sentence: 'We have ___ of work to do today. (rất nhiều)', answer: 'a lot', hint: 'a lot of', kind: 'khẳng định' },
            { id: 15, sentence: 'He doesn\'t have ___ friends in this city. (phủ định)', answer: 'any', hint: 'any phủ định', kind: 'phủ định' },
            { id: 16, sentence: 'There isn\'t ___ bread for breakfast. (không đếm, phủ định)', answer: 'any', hint: 'any phủ định', kind: 'phủ định' },
            { id: 17, sentence: 'How ___ students are in your class? (đếm được)', answer: 'many', hint: 'đếm được', kind: 'nghi vấn' },
            { id: 18, sentence: 'I drank ___ water after the run, so I\'m fine. (một chút)', answer: 'a little', hint: 'a little', kind: 'khẳng định' },
            { id: 19, sentence: 'There were ___ cars on the road, so traffic was light. (rất ít)', answer: 'few', hint: 'few', kind: 'khẳng định' },
            { id: 20, sentence: 'Would you like ___ more coffee? (mời, nghi vấn)', answer: 'some', hint: 'some khi mời', kind: 'nghi vấn' }
        ]
    }
};

export default { group, content };
