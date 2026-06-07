// ============================================
// Grammar Group: Reported Speech (Câu tường thuật)
// ============================================

const group = {
    id: 'reported-speech',
    nameVi: 'Câu tường thuật',
    nameEn: 'Reported Speech',
    icon: 'record_voice_over',
    order: 5,
    lessons: [
        { id: 'reported-statements', nameVi: 'Tường thuật câu kể', nameEn: 'Statements', icon: 'chat', ielts: false },
        { id: 'reported-questions', nameVi: 'Tường thuật câu hỏi', nameEn: 'Questions', icon: 'help', ielts: false },
        { id: 'reported-commands', nameVi: 'Tường thuật mệnh lệnh', nameEn: 'Commands & Requests', icon: 'campaign', ielts: false }
    ]
};

const content = {
    'reported-statements': {
        usage: {
            intro: 'Câu tường thuật (gián tiếp) dùng để <b>thuật lại lời nói của người khác</b> mà không dùng dấu ngoặc kép. Thường phải <b>lùi thì</b>.',
            items: [
                { title: 'Lùi thì khi động từ tường thuật ở quá khứ', icon: 'undo', examples: ['"I am tired" → He said he <b>was</b> tired.', '"I will go" → She said she <b>would</b> go.'] },
                { title: 'Đổi đại từ & trạng từ chỉ thời gian/nơi chốn', icon: 'swap_horiz', examples: ['"I live here" → He said he lived <b>there</b>.', 'now → then, today → that day'] }
            ],
            signalWords: { label: 'Động từ tường thuật', words: ['say / said', 'tell / told + O', 'admit', 'explain', 'mention'] }
        },
        formula: {
            note: 'Quy tắc <b>lùi thì</b>: hiện tại → quá khứ, quá khứ → quá khứ hoàn thành, will → would.',
            groups: [
                {
                    label: 'Lùi thì câu kể',
                    sub: 'backshift',
                    sentences: [
                        { kind: 'Trực tiếp', sign: '→', formula: 'S said, "S + V(hiện tại)"', examples: ['She said, "I <b>work</b> here."'] },
                        { kind: 'Gián tiếp', sign: '+', formula: 'S said (that) S + V(quá khứ)', examples: ['She said (that) she <b>worked</b> there.'] }
                    ],
                    subject: {
                        headers: ['Trực tiếp', 'Gián tiếp (lùi thì)'],
                        rows: [['hiện tại đơn', 'quá khứ đơn'], ['hiện tại tiếp diễn', 'quá khứ tiếp diễn'], ['quá khứ đơn', 'quá khứ hoàn thành'], ['will', 'would'], ['can', 'could']]
                    },
                    note: 'KHÔNG lùi thì nếu nội dung là <b>chân lý</b> luôn đúng: He said the sun <b>rises</b> in the east.'
                }
            ],
            contractions: []
        },
        exercises: [
            { id: 1, sentence: '"I am happy." → She said she ___ happy.', answer: 'was', hint: 'lùi thì', kind: 'khẳng định' },
            { id: 2, sentence: '"I work hard." → He said he ___ hard.', answer: 'worked', hint: 'lùi thì', kind: 'khẳng định' },
            { id: 3, sentence: '"I will call you." → She said she ___ call me.', answer: 'would', hint: 'will → would', kind: 'khẳng định' },
            { id: 4, sentence: '"I can swim." → He said he ___ swim.', answer: 'could', hint: 'can → could', kind: 'khẳng định' },
            { id: 5, sentence: '"I saw him." → She said she ___ (see) him.', answer: 'had seen', hint: 'quá khứ → QKHT', kind: 'khẳng định' },
            { id: 6, sentence: '"We are studying." → They said they ___ studying.', answer: 'were', hint: 'lùi thì', kind: 'khẳng định' }
        ]
    },
    'reported-questions': {
        usage: {
            intro: 'Khi tường thuật câu hỏi, ta đổi về dạng <b>câu trần thuật</b> (S + V), bỏ trợ động từ do/does/did và dấu hỏi.',
            items: [
                { title: 'Câu hỏi Yes/No → dùng if / whether', icon: 'rule', examples: ['"Do you like it?" → He asked <b>if</b> I liked it.'] },
                { title: 'Câu hỏi Wh- → giữ từ hỏi, đổi trật tự', icon: 'help_outline', examples: ['"Where do you live?" → She asked <b>where I lived</b>.'] }
            ],
            signalWords: { label: 'Động từ tường thuật', words: ['ask', 'wonder', 'want to know', 'inquire'] }
        },
        formula: {
            note: 'Trật tự trong câu hỏi gián tiếp là <b>S + V</b> (giống câu kể), KHÔNG đảo trợ động từ.',
            groups: [
                {
                    label: 'Tường thuật câu hỏi',
                    sub: 'reported questions',
                    sentences: [
                        { kind: 'Yes/No', sign: '+', formula: 'S asked if/whether + S + V', examples: ['He asked <b>if I was</b> ready.'] },
                        { kind: 'Wh-', sign: '+', formula: 'S asked + wh- + S + V', examples: ['She asked <b>where I lived</b>.'] }
                    ],
                    subject: { headers: ['Trực tiếp', 'Gián tiếp'], rows: [['"Are you ok?"', 'asked if I was ok'], ['"What time is it?"', 'asked what time it was']] },
                    note: 'Lỗi thường gặp: giữ trật tự đảo. SAI: <i>asked where did I live</i> → ĐÚNG: <b>asked where I lived</b>.'
                }
            ],
            contractions: []
        },
        exercises: [
            { id: 1, sentence: '"Do you like tea?" → He asked ___ I liked tea.', answer: 'if', hint: 'if/whether', kind: 'nghi vấn' },
            { id: 2, sentence: '"Where are you?" → She asked where I ___.', answer: 'was', hint: 'S + V', kind: 'nghi vấn' },
            { id: 3, sentence: '"What is your name?" → He asked what my name ___.', answer: 'was', hint: 'S + V', kind: 'nghi vấn' },
            { id: 4, sentence: '"Did you call?" → She asked if I ___ (call).', answer: 'had called', hint: 'lùi thì', kind: 'nghi vấn' },
            { id: 5, sentence: '"Why are you late?" → He asked why I ___ late.', answer: 'was', hint: 'S + V', kind: 'nghi vấn' },
            { id: 6, sentence: '"Can you help?" → She asked ___ I could help.', answer: 'if', hint: 'if/whether', kind: 'nghi vấn' }
        ]
    },
    'reported-commands': {
        usage: {
            intro: 'Tường thuật mệnh lệnh và yêu cầu dùng cấu trúc <b>tell/ask + O + (not) to + V</b>.',
            items: [
                { title: 'Mệnh lệnh khẳng định', icon: 'check', examples: ['"Sit down!" → He told me <b>to sit</b> down.'] },
                { title: 'Mệnh lệnh phủ định', icon: 'block', examples: ['"Don\'t move!" → He told me <b>not to move</b>.'] },
                { title: 'Lời yêu cầu lịch sự', icon: 'volunteer_activism', examples: ['"Please help me." → She asked me <b>to help</b> her.'] }
            ],
            signalWords: { label: 'Động từ', words: ['tell + O + to V', 'ask + O + to V', 'order', 'warn', 'advise', 'remind'] }
        },
        formula: {
            note: 'Không lùi thì với mệnh lệnh — chỉ chuyển sang dạng <b>to-infinitive</b>.',
            groups: [
                {
                    label: 'Tường thuật mệnh lệnh',
                    sub: 'to-infinitive',
                    sentences: [
                        { kind: 'Khẳng định', sign: '+', formula: 'S + told/asked + O + to + V', examples: ['He told me <b>to wait</b>.'] },
                        { kind: 'Phủ định', sign: '−', formula: 'S + told/asked + O + not to + V', examples: ['She asked me <b>not to smoke</b>.'] }
                    ],
                    subject: { headers: ['Trực tiếp', 'Gián tiếp'], rows: [['"Close the door."', 'told me to close the door'], ['"Don\'t be late."', 'told me not to be late']] },
                    note: 'Dùng <b>tell</b> cho mệnh lệnh, <b>ask</b> cho yêu cầu lịch sự.'
                }
            ],
            contractions: []
        },
        exercises: [
            { id: 1, sentence: '"Open the window." → He told me ___ (open) the window.', answer: 'to open', hint: 'to + V', kind: 'khẳng định' },
            { id: 2, sentence: '"Don\'t shout!" → She told us ___ (not/shout).', answer: 'not to shout', hint: 'not to + V', kind: 'phủ định' },
            { id: 3, sentence: '"Please wait." → He asked me ___ (wait).', answer: 'to wait', hint: 'to + V', kind: 'khẳng định' },
            { id: 4, sentence: '"Be quiet." → The teacher told them ___ (be) quiet.', answer: 'to be', hint: 'to + V', kind: 'khẳng định' },
            { id: 5, sentence: '"Don\'t touch it." → She warned me ___ (not/touch) it.', answer: 'not to touch', hint: 'not to + V', kind: 'phủ định' },
            { id: 6, sentence: '"Help me, please." → He asked me ___ (help) him.', answer: 'to help', hint: 'to + V', kind: 'khẳng định' }
        ]
    }
};

export default { group, content };
