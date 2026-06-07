// ============================================
// Grammar Group: Pronouns (Đại từ)
// ============================================

const group = {
    id: 'pronouns',
    nameVi: 'Đại từ',
    nameEn: 'Pronouns',
    icon: 'people',
    order: 9,
    lessons: [
        { id: 'personal-possessive', nameVi: 'Đại từ nhân xưng & sở hữu', nameEn: 'Personal & Possessive', icon: 'person', ielts: false },
        { id: 'reflexive-pronouns', nameVi: 'Đại từ phản thân', nameEn: 'Reflexive Pronouns', icon: 'autorenew', ielts: false },
        { id: 'relative-indefinite', nameVi: 'Đại từ bất định', nameEn: 'Indefinite Pronouns', icon: 'help_center', ielts: false }
    ]
};

const content = {
    'personal-possessive': {
        usage: {
            intro: 'Đại từ nhân xưng thay cho danh từ làm chủ ngữ/tân ngữ; đại từ và tính từ sở hữu chỉ quyền sở hữu.',
            items: [
                { title: 'Chủ ngữ / Tân ngữ', icon: 'swap_horiz', examples: ['<b>I</b> see <b>him</b>.', '<b>They</b> helped <b>us</b>.'] },
                { title: 'Tính từ sở hữu (+ danh từ)', icon: 'label', examples: ['This is <b>my</b> book.', '<b>Their</b> house is big.'] },
                { title: 'Đại từ sở hữu (đứng một mình)', icon: 'lock', examples: ['This book is <b>mine</b>.', 'The choice is <b>yours</b>.'] }
            ],
            signalWords: { label: 'Phân biệt', words: ['my (tính từ) + N', 'mine (đại từ) đứng một mình', 'its (sở hữu) vs it\'s (it is)'] }
        },
        formula: {
            note: 'Tính từ sở hữu luôn đi <b>kèm danh từ</b>; đại từ sở hữu đứng <b>một mình</b>.',
            groups: [
                {
                    label: 'Bảng đại từ',
                    sub: 'personal & possessive',
                    sentences: [
                        { kind: 'Chủ ngữ', sign: '+', formula: 'I/you/he/she/it/we/they', examples: ['<b>She</b> is here.'] },
                        { kind: 'Tân ngữ', sign: '+', formula: 'me/you/him/her/it/us/them', examples: ['Call <b>me</b>.'] },
                        { kind: 'Sở hữu', sign: '+', formula: 'mine/yours/his/hers/ours/theirs', examples: ['It\'s <b>hers</b>.'] }
                    ],
                    subject: {
                        headers: ['Chủ ngữ', 'Tân ngữ', 'TT sở hữu', 'ĐT sở hữu'],
                        rows: [['I', 'me', 'my', 'mine'], ['you', 'you', 'your', 'yours'], ['he', 'him', 'his', 'his'], ['she', 'her', 'her', 'hers'], ['they', 'them', 'their', 'theirs']]
                    },
                    note: 'Lưu ý: <b>its</b> = của nó (sở hữu); <b>it\'s</b> = it is. Đừng nhầm hai từ này.'
                }
            ],
            contractions: ["it's = it is", "they're = they are (KHÁC their)"]
        },
        exercises: [
            { id: 1, sentence: '___ are my friends. (chủ ngữ)', answer: 'They', hint: 'chủ ngữ', kind: 'khẳng định' },
            { id: 2, sentence: 'Please give the book to ___. (tân ngữ)', answer: 'me', hint: 'tân ngữ', kind: 'khẳng định' },
            { id: 3, sentence: 'This is ___ car. (tính từ sở hữu - của tôi)', answer: 'my', hint: 'tính từ sở hữu', kind: 'khẳng định' },
            { id: 4, sentence: 'That pen is ___. (đại từ sở hữu - của cô ấy)', answer: 'hers', hint: 'đại từ sở hữu', kind: 'khẳng định' },
            { id: 5, sentence: 'The dog wagged ___ tail. (sở hữu của nó)', answer: 'its', hint: 'its', kind: 'khẳng định' },
            { id: 6, sentence: 'We invited ___ to the party. (tân ngữ - họ)', answer: 'them', hint: 'tân ngữ', kind: 'khẳng định' }
        ]
    },
    'reflexive-pronouns': {
        usage: {
            intro: 'Đại từ phản thân (myself, yourself...) dùng khi <b>chủ ngữ và tân ngữ là cùng một người</b>.',
            items: [
                { title: 'Chủ ngữ = tân ngữ', icon: 'autorenew', examples: ['I hurt <b>myself</b>.', 'She introduced <b>herself</b>.'] },
                { title: 'Nhấn mạnh', icon: 'priority_high', examples: ['I did it <b>myself</b>.', 'The president <b>himself</b> came.'] },
                { title: 'by + reflexive = một mình', icon: 'person', examples: ['He lives <b>by himself</b>.', 'I did it <b>by myself</b>.'] }
            ],
            signalWords: { label: 'Danh sách', words: ['myself, yourself, himself, herself', 'itself, ourselves, yourselves, themselves'] }
        },
        formula: {
            note: 'Số ít kết thúc <b>-self</b>; số nhiều kết thúc <b>-selves</b>.',
            groups: [
                {
                    label: 'Đại từ phản thân',
                    sub: 'reflexive pronouns',
                    sentences: [
                        { kind: 'Phản thân', sign: '+', formula: 'S + V + ...self/...selves', examples: ['They enjoyed <b>themselves</b>.'] },
                        { kind: 'Nhấn mạnh', sign: '+', formula: 'S/N + ...self (nhấn mạnh)', examples: ['I <b>myself</b> saw it.'] }
                    ],
                    subject: {
                        headers: ['Đại từ', 'Phản thân'],
                        rows: [['I', 'myself'], ['you (số ít)', 'yourself'], ['he', 'himself'], ['she', 'herself'], ['we', 'ourselves'], ['they', 'themselves']]
                    },
                    note: 'Không dùng phản thân sau một số động từ chỉ hành động thường ngày: SAI <i>I feel myself tired</i> → ĐÚNG <b>I feel tired</b>.'
                }
            ],
            contractions: []
        },
        exercises: [
            { id: 1, sentence: 'She cut ___ while cooking. (cô ấy)', answer: 'herself', hint: 'phản thân', kind: 'khẳng định' },
            { id: 2, sentence: 'We organized the party ___. (chúng tôi)', answer: 'ourselves', hint: 'phản thân', kind: 'khẳng định' },
            { id: 3, sentence: 'He lives by ___. (một mình)', answer: 'himself', hint: 'by + self', kind: 'khẳng định' },
            { id: 4, sentence: 'Please help ___ to some cake. (các bạn)', answer: 'yourselves', hint: 'số nhiều', kind: 'khẳng định' },
            { id: 5, sentence: 'The cat cleaned ___. (nó)', answer: 'itself', hint: 'phản thân', kind: 'khẳng định' },
            { id: 6, sentence: 'I taught ___ to play guitar. (tôi)', answer: 'myself', hint: 'phản thân', kind: 'khẳng định' }
        ]
    },
    'relative-indefinite': {
        usage: {
            intro: 'Đại từ bất định chỉ người/vật không xác định: <b>some-, any-, no-, every-</b> + thing/one/where.',
            items: [
                { title: 'something / anything / nothing', icon: 'category', examples: ['I need <b>something</b> to eat.', 'There is <b>nothing</b> here.'] },
                { title: 'someone / anyone / everyone', icon: 'person', examples: ['<b>Someone</b> called you.', 'Is <b>anyone</b> home?'] },
                { title: 'somewhere / anywhere / nowhere', icon: 'place', examples: ['Let\'s go <b>somewhere</b> nice.', 'I can\'t find it <b>anywhere</b>.'] }
            ],
            signalWords: { label: 'Quy tắc', words: ['some- (khẳng định)', 'any- (phủ định/nghi vấn)', 'every- (tất cả)', 'no- (không có)'] }
        },
        formula: {
            note: 'Đại từ bất định luôn đi với động từ <b>số ít</b>: Everyone <b>is</b> here.',
            groups: [
                {
                    label: 'Đại từ bất định',
                    sub: 'indefinite pronouns',
                    sentences: [
                        { kind: 'Khẳng định', sign: '+', formula: 'some- + thing/one/where', examples: ['<b>Somebody</b> is knocking.'] },
                        { kind: 'Phủ định/Nghi vấn', sign: '?', formula: 'any- + thing/one/where', examples: ['Did you see <b>anyone</b>?'] }
                    ],
                    subject: {
                        headers: ['', 'thing', 'one/body', 'where'],
                        rows: [['some', 'something', 'someone', 'somewhere'], ['any', 'anything', 'anyone', 'anywhere'], ['no', 'nothing', 'no one', 'nowhere'], ['every', 'everything', 'everyone', 'everywhere']]
                    },
                    note: 'no- đã mang nghĩa phủ định nên KHÔNG dùng thêm "not": SAI <i>I don\'t see nothing</i> → ĐÚNG <b>I see nothing</b> / <b>I don\'t see anything</b>.'
                }
            ],
            contractions: []
        },
        exercises: [
            { id: 1, sentence: 'There is ___ in the box. It\'s empty. (không có gì)', answer: 'nothing', hint: 'no-', kind: 'khẳng định' },
            { id: 2, sentence: 'Would you like ___ to drink? (nghi vấn mời)', answer: 'something', hint: 'some- khi mời', kind: 'nghi vấn' },
            { id: 3, sentence: '___ knows the answer. (tất cả mọi người)', answer: 'Everyone', hint: 'every-', kind: 'khẳng định' },
            { id: 4, sentence: 'I didn\'t meet ___ at the party. (phủ định)', answer: 'anyone', hint: 'any- phủ định', kind: 'phủ định' },
            { id: 5, sentence: 'Let\'s find ___ quiet to talk. (một nơi nào đó)', answer: 'somewhere', hint: 'some-', kind: 'khẳng định' },
            { id: 6, sentence: 'Everything ___ (be) ready for the trip. (số ít)', answer: 'is', hint: 'động từ số ít', kind: 'khẳng định' }
        ]
    }
};

export default { group, content };
