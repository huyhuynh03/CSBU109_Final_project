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
            { id: 6, sentence: 'We invited ___ to the party. (tân ngữ - họ)', answer: 'them', hint: 'tân ngữ', kind: 'khẳng định' },
            { id: 7, sentence: '___ is my best friend. (chủ ngữ - anh ấy)', answer: 'He', hint: 'chủ ngữ', kind: 'khẳng định' },
            { id: 8, sentence: 'Can you tell ___ the truth? (tân ngữ - cô ấy)', answer: 'her', hint: 'tân ngữ', kind: 'khẳng định' },
            { id: 9, sentence: 'Is this bag ___? (đại từ sở hữu - của bạn)', answer: 'yours', hint: 'đại từ sở hữu', kind: 'nghi vấn' },
            { id: 10, sentence: '___ teacher is very kind. (tính từ sở hữu - của chúng tôi)', answer: 'Our', hint: 'tính từ sở hữu', kind: 'khẳng định' },
            { id: 11, sentence: 'The keys are ___. (đại từ sở hữu - của họ)', answer: 'theirs', hint: 'đại từ sở hữu', kind: 'khẳng định' },
            { id: 12, sentence: 'I will help ___ with the homework. (tân ngữ - bạn)', answer: 'you', hint: 'tân ngữ', kind: 'khẳng định' },
            { id: 13, sentence: '___ live in a small town. (chủ ngữ - chúng tôi)', answer: 'We', hint: 'chủ ngữ', kind: 'khẳng định' },
            { id: 14, sentence: 'That jacket is ___, not mine. (đại từ sở hữu - của anh ấy)', answer: 'his', hint: 'đại từ sở hữu', kind: 'khẳng định' },
            { id: 15, sentence: 'She showed ___ the photos. (tân ngữ - chúng tôi)', answer: 'us', hint: 'tân ngữ', kind: 'khẳng định' },
            { id: 16, sentence: '___ name is John. (tính từ sở hữu - của anh ấy)', answer: 'His', hint: 'tính từ sở hữu', kind: 'khẳng định' },
            { id: 17, sentence: 'This idea is ___. (đại từ sở hữu - của tôi)', answer: 'mine', hint: 'đại từ sở hữu', kind: 'khẳng định' },
            { id: 18, sentence: 'I saw ___ at the cinema yesterday. (tân ngữ - anh ấy)', answer: 'him', hint: 'tân ngữ', kind: 'khẳng định' },
            { id: 19, sentence: '___ bikes are in the garage. (tính từ sở hữu - của họ)', answer: 'Their', hint: 'tính từ sở hữu', kind: 'khẳng định' },
            { id: 20, sentence: 'The dog hurt ___ paw. (tính từ sở hữu - của nó)', answer: 'its', hint: 'its', kind: 'khẳng định' }
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
            { id: 6, sentence: 'I taught ___ to play guitar. (tôi)', answer: 'myself', hint: 'phản thân', kind: 'khẳng định' },
            { id: 7, sentence: 'They built the house ___. (chính họ)', answer: 'themselves', hint: 'phản thân số nhiều', kind: 'khẳng định' },
            { id: 8, sentence: 'Be careful! Don\'t burn ___. (bạn - số ít)', answer: 'yourself', hint: 'phản thân', kind: 'khẳng định' },
            { id: 9, sentence: 'The CEO ___ answered my email. (nhấn mạnh - anh ấy)', answer: 'himself', hint: 'nhấn mạnh', kind: 'khẳng định' },
            { id: 10, sentence: 'She prepared dinner all by ___. (một mình - cô ấy)', answer: 'herself', hint: 'by + self', kind: 'khẳng định' },
            { id: 11, sentence: 'We enjoyed ___ at the festival. (chúng tôi)', answer: 'ourselves', hint: 'phản thân', kind: 'khẳng định' },
            { id: 12, sentence: 'The machine turns ___ off automatically. (nó)', answer: 'itself', hint: 'phản thân', kind: 'khẳng định' },
            { id: 13, sentence: 'Children, you should be proud of ___. (các bạn)', answer: 'yourselves', hint: 'số nhiều', kind: 'khẳng định' },
            { id: 14, sentence: 'He blamed ___ for the mistake. (anh ấy)', answer: 'himself', hint: 'phản thân', kind: 'khẳng định' },
            { id: 15, sentence: 'I made this cake ___. (chính tôi)', answer: 'myself', hint: 'phản thân', kind: 'khẳng định' },
            { id: 16, sentence: 'The queen ___ visited the village. (nhấn mạnh - cô ấy)', answer: 'herself', hint: 'nhấn mạnh', kind: 'khẳng định' },
            { id: 17, sentence: 'They have to look after ___ now. (họ)', answer: 'themselves', hint: 'phản thân số nhiều', kind: 'khẳng định' },
            { id: 18, sentence: 'Did you fix the car by ___? (bạn - số ít)', answer: 'yourself', hint: 'by + self', kind: 'nghi vấn' },
            { id: 19, sentence: 'We taught ___ how to swim. (chúng tôi)', answer: 'ourselves', hint: 'phản thân', kind: 'khẳng định' },
            { id: 20, sentence: 'He introduced ___ to the new team. (anh ấy)', answer: 'himself', hint: 'phản thân', kind: 'khẳng định' }
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
            { id: 6, sentence: 'Everything ___ (be) ready for the trip. (số ít)', answer: 'is', hint: 'động từ số ít', kind: 'khẳng định' },
            { id: 7, sentence: 'Is there ___ I can do to help? (nghi vấn)', answer: 'anything', hint: 'any- nghi vấn', kind: 'nghi vấn' },
            { id: 8, sentence: '___ left the lights on. (một ai đó)', answer: 'Someone', hint: 'some-', kind: 'khẳng định' },
            { id: 9, sentence: 'I have ___ to tell you; it can wait. (không có gì)', answer: 'nothing', hint: 'no-', kind: 'khẳng định' },
            { id: 10, sentence: 'We looked ___ but couldn\'t find the cat. (phủ định - khắp nơi)', answer: 'everywhere', hint: 'every-', kind: 'khẳng định' },
            { id: 11, sentence: 'Does ___ know the way to the station? (nghi vấn)', answer: 'anyone', hint: 'any- nghi vấn', kind: 'nghi vấn' },
            { id: 12, sentence: 'There\'s ___ at the door. (một ai đó)', answer: 'somebody', hint: 'some-', kind: 'khẳng định' },
            { id: 13, sentence: '___ is impossible if you try hard. (không gì)', answer: 'Nothing', hint: 'no-', kind: 'khẳng định' },
            { id: 14, sentence: 'I can\'t go ___ tonight; I\'m too tired. (phủ định)', answer: 'anywhere', hint: 'any- phủ định', kind: 'phủ định' },
            { id: 15, sentence: '___ in the class passed the test. (tất cả)', answer: 'Everyone', hint: 'every-', kind: 'khẳng định' },
            { id: 16, sentence: 'There is ___ wrong with the engine. (một điều gì đó)', answer: 'something', hint: 'some-', kind: 'khẳng định' },
            { id: 17, sentence: '___ was at home, so the house was empty. (không ai)', answer: 'No one', hint: 'no-', kind: 'khẳng định' },
            { id: 18, sentence: 'Have you been ___ interesting recently? (nghi vấn)', answer: 'anywhere', hint: 'any- nghi vấn', kind: 'nghi vấn' },
            { id: 19, sentence: '___ makes mistakes sometimes. (tất cả mọi người)', answer: 'Everybody', hint: 'every-', kind: 'khẳng định' },
            { id: 20, sentence: 'I didn\'t buy ___ at the shop. (phủ định)', answer: 'anything', hint: 'any- phủ định', kind: 'phủ định' }
        ]
    }
};

export default { group, content };
