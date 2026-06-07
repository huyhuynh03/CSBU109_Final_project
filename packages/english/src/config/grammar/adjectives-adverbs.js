// ============================================
// Grammar Group: Adjectives & Adverbs (Tính từ & Trạng từ)
// ============================================

const group = {
    id: 'adjectives-adverbs',
    nameVi: 'Tính từ & Trạng từ',
    nameEn: 'Adjectives & Adverbs',
    icon: 'tune',
    order: 10,
    lessons: [
        { id: 'adj-adv-basics', nameVi: 'Cách dùng tính từ & trạng từ', nameEn: 'Adjectives vs Adverbs', icon: 'compare', ielts: false },
        { id: 'comparatives-superlatives', nameVi: 'So sánh hơn & so sánh nhất', nameEn: 'Comparatives & Superlatives', icon: 'leaderboard', ielts: true },
        { id: 'adj-order', nameVi: 'Trật tự tính từ', nameEn: 'Order of Adjectives', icon: 'sort', ielts: false }
    ]
};

const content = {
    'adj-adv-basics': {
        usage: {
            intro: 'Tính từ <b>bổ nghĩa cho danh từ</b>; trạng từ <b>bổ nghĩa cho động từ, tính từ, hoặc cả câu</b>.',
            items: [
                { title: 'Tính từ + danh từ', icon: 'label', examples: ['a <b>beautiful</b> garden', 'She is <b>happy</b>.'] },
                { title: 'Trạng từ bổ nghĩa động từ', icon: 'directions_run', examples: ['He runs <b>quickly</b>.', 'She speaks <b>fluently</b>.'] },
                { title: 'Trạng từ bổ nghĩa tính từ/trạng từ khác', icon: 'add', examples: ['It\'s <b>very</b> cold.', 'He drives <b>too</b> fast.'] }
            ],
            signalWords: { label: 'Cách tạo trạng từ', words: ['adj + ly: quick → quickly', 'y → ily: happy → happily', 'bất quy tắc: good → well, fast → fast'] }
        },
        formula: {
            note: 'Sau <b>linking verbs</b> (be, seem, look, feel, taste) dùng <b>tính từ</b>, không dùng trạng từ.',
            groups: [
                {
                    label: 'Tính từ vs Trạng từ',
                    sub: 'adjective / adverb',
                    sentences: [
                        { kind: 'Tính từ', sign: '+', formula: 'adj + N / linking V + adj', examples: ['a <b>fast</b> car', 'It looks <b>good</b>.'] },
                        { kind: 'Trạng từ', sign: '+', formula: 'V + adv', examples: ['He drives <b>fast</b>.', 'It works <b>well</b>.'] }
                    ],
                    subject: { headers: ['Bổ nghĩa cho', 'Dùng'], rows: [['Danh từ', 'tính từ'], ['Động từ', 'trạng từ'], ['Sau be/seem/look', 'tính từ']] },
                    note: 'Lỗi thường gặp: SAI <i>She sings beautiful</i> → ĐÚNG <b>She sings beautifully</b> (bổ nghĩa động từ sing).'
                }
            ],
            contractions: []
        },
        exercises: [
            { id: 1, sentence: 'She is a ___ (careful) driver.', answer: 'careful', hint: 'tính từ + N', kind: 'khẳng định' },
            { id: 2, sentence: 'She drives ___ (careful).', answer: 'carefully', hint: 'trạng từ', kind: 'khẳng định' },
            { id: 3, sentence: 'He speaks English ___ (fluent).', answer: 'fluently', hint: 'trạng từ', kind: 'khẳng định' },
            { id: 4, sentence: 'The soup tastes ___ (good). (sau linking verb)', answer: 'good', hint: 'tính từ', kind: 'khẳng định' },
            { id: 5, sentence: 'They worked very ___ (hard) yesterday.', answer: 'hard', hint: 'trạng từ bất quy tắc', kind: 'khẳng định' },
            { id: 6, sentence: 'This is a ___ (quick) test.', answer: 'quick', hint: 'tính từ + N', kind: 'khẳng định' }
        ]
    },
    'comparatives-superlatives': {
        usage: {
            intro: 'So sánh hơn (comparative) so sánh giữa hai đối tượng; so sánh nhất (superlative) so sánh trong nhóm từ ba trở lên.',
            items: [
                { title: 'So sánh hơn (-er / more)', icon: 'trending_up', examples: ['She is <b>taller</b> than me.', 'It\'s <b>more expensive</b>.'] },
                { title: 'So sánh nhất (-est / most)', icon: 'emoji_events', examples: ['He is <b>the tallest</b>.', 'It\'s <b>the most beautiful</b>.'] },
                { title: 'So sánh bằng (as...as)', icon: 'drag_handle', examples: ['She is <b>as tall as</b> her brother.'] }
            ],
            signalWords: { label: 'Quy tắc', words: ['tính từ ngắn (1 âm tiết): + er/est', 'tính từ dài (2+ âm tiết): more/most', 'bất quy tắc: good→better→best'] }
        },
        formula: {
            note: 'Tính từ ngắn thêm <b>-er/-est</b>; tính từ dài dùng <b>more/most</b>.',
            groups: [
                {
                    label: 'So sánh',
                    sub: 'comparison',
                    sentences: [
                        { kind: 'Hơn', sign: '+', formula: 'adj-er / more adj + than', examples: ['faster <b>than</b>, more useful <b>than</b>'] },
                        { kind: 'Nhất', sign: '+', formula: 'the + adj-est / most adj', examples: ['<b>the</b> fastest, <b>the most</b> useful'] },
                        { kind: 'Bằng', sign: '=', formula: 'as + adj + as', examples: ['<b>as</b> big <b>as</b>'] }
                    ],
                    subject: {
                        headers: ['Tính từ', 'So sánh hơn', 'So sánh nhất'],
                        rows: [['tall', 'taller', 'tallest'], ['big', 'bigger', 'biggest'], ['happy', 'happier', 'happiest'], ['expensive', 'more expensive', 'most expensive'], ['good', 'better', 'best'], ['bad', 'worse', 'worst']]
                    },
                    note: 'Bất quy tắc cần học thuộc: good→better→best, bad→worse→worst, far→further→furthest.'
                }
            ],
            contractions: []
        },
        exercises: [
            { id: 1, sentence: 'My house is ___ (big) than yours.', answer: 'bigger', hint: 'so sánh hơn ngắn', kind: 'khẳng định' },
            { id: 2, sentence: 'This is the ___ (expensive) car in the shop.', answer: 'most expensive', hint: 'so sánh nhất dài', kind: 'khẳng định' },
            { id: 3, sentence: 'She is ___ (good) at math than me.', answer: 'better', hint: 'bất quy tắc', kind: 'khẳng định' },
            { id: 4, sentence: 'Today is the ___ (hot) day of the year.', answer: 'hottest', hint: 'so sánh nhất ngắn', kind: 'khẳng định' },
            { id: 5, sentence: 'He is as ___ (tall) as his father. (bằng)', answer: 'tall', hint: 'as...as', kind: 'khẳng định' },
            { id: 6, sentence: 'This is the ___ (bad) movie I\'ve ever seen.', answer: 'worst', hint: 'bất quy tắc nhất', kind: 'khẳng định' }
        ]
    },
    'adj-order': {
        usage: {
            intro: 'Khi nhiều tính từ cùng bổ nghĩa một danh từ, chúng tuân theo một <b>trật tự cố định</b> (OSASCOMP).',
            items: [
                { title: 'Trật tự OSASCOMP', icon: 'sort', examples: ['a <b>beautiful old Italian</b> car', 'a <b>small round wooden</b> table'] },
                { title: 'Opinion đứng trước Fact', icon: 'psychology', examples: ['a <b>lovely</b> (opinion) <b>red</b> (color) dress'] }
            ],
            signalWords: { label: 'Thứ tự OSASCOMP', words: ['Opinion → Size → Age → Shape', 'Color → Origin → Material → Purpose'] }
        },
        formula: {
            note: 'Quy tắc <b>OSASCOMP</b>: Opinion - Size - Age - Shape - Color - Origin - Material - Purpose.',
            groups: [
                {
                    label: 'Trật tự tính từ',
                    sub: 'order of adjectives',
                    sentences: [
                        { kind: 'Trật tự', sign: '+', formula: 'Opinion + Size + Age + Color + Origin + Material + N', examples: ['a <b>nice big new red Italian leather</b> bag'] }
                    ],
                    subject: {
                        headers: ['Thứ tự', 'Loại', 'Ví dụ'],
                        rows: [['1', 'Opinion (ý kiến)', 'nice, beautiful'], ['2', 'Size (kích thước)', 'big, small'], ['3', 'Age (tuổi)', 'old, new'], ['4', 'Shape (hình dạng)', 'round, square'], ['5', 'Color (màu)', 'red, blue'], ['6', 'Origin (nguồn gốc)', 'Italian, French'], ['7', 'Material (chất liệu)', 'wooden, leather']]
                    },
                    note: 'Trong thực tế hiếm khi dùng quá 3 tính từ liên tiếp. Nắm thứ tự để xếp đúng khi cần.'
                }
            ],
            contractions: []
        },
        exercises: [
            { id: 1, sentence: 'Sắp xếp: (Italian / a / beautiful) painting → ___', answer: 'a beautiful Italian', hint: 'Opinion → Origin', kind: 'khẳng định' },
            { id: 2, sentence: 'Sắp xếp: (round / small / a) table → ___', answer: 'a small round', hint: 'Size → Shape', kind: 'khẳng định' },
            { id: 3, sentence: 'Sắp xếp: (red / a / big) car → ___', answer: 'a big red', hint: 'Size → Color', kind: 'khẳng định' },
            { id: 4, sentence: 'Sắp xếp: (old / an / interesting) book → ___', answer: 'an interesting old', hint: 'Opinion → Age', kind: 'khẳng định' },
            { id: 5, sentence: 'Sắp xếp: (wooden / a / brown) chair → ___', answer: 'a brown wooden', hint: 'Color → Material', kind: 'khẳng định' },
            { id: 6, sentence: 'Sắp xếp: (new / a / lovely) dress → ___', answer: 'a lovely new', hint: 'Opinion → Age', kind: 'khẳng định' }
        ]
    }
};

export default { group, content };
