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
            { id: 6, sentence: '"We are studying." → They said they ___ studying.', answer: 'were', hint: 'lùi thì', kind: 'khẳng định' },
            { id: 7, sentence: '"I have finished." → He said he ___ (finish).', answer: 'had finished', hint: 'HTHT → QKHT', kind: 'khẳng định' },
            { id: 8, sentence: '"I don\'t like coffee." → She said she ___ like coffee.', answer: 'did not', hint: 'lùi thì phủ định', kind: 'phủ định' },
            { id: 9, sentence: '"We may come." → They said they ___ come.', answer: 'might', hint: 'may → might', kind: 'khẳng định' },
            { id: 10, sentence: '"I must leave." → He said he ___ leave.', answer: 'had to', hint: 'must → had to', kind: 'khẳng định' },
            { id: 11, sentence: '"I am reading now." → She said she was reading ___.', answer: 'then', hint: 'now → then', kind: 'khẳng định' },
            { id: 12, sentence: '"I bought it yesterday." → He said he ___ (buy) it the day before.', answer: 'had bought', hint: 'quá khứ → QKHT', kind: 'khẳng định' },
            { id: 13, sentence: '"We live here." → They said they lived ___.', answer: 'there', hint: 'here → there', kind: 'khẳng định' },
            { id: 14, sentence: '"I will help you." → She said she ___ help me.', answer: 'would', hint: 'will → would', kind: 'khẳng định' },
            { id: 15, sentence: '"I can\'t swim." → He said he ___ swim.', answer: 'could not', hint: 'can → could', kind: 'phủ định' },
            { id: 16, sentence: '"The Earth orbits the Sun." → She said the Earth ___ the Sun. (chân lý)', answer: 'orbits', hint: 'không lùi thì', kind: 'khẳng định' },
            { id: 17, sentence: '"I have been waiting." → He said he ___ (wait).', answer: 'had been waiting', hint: 'HTHTTD → QKHTTD', kind: 'khẳng định' },
            { id: 18, sentence: '"I am going today." → She said she was going ___ day.', answer: 'that', hint: 'today → that day', kind: 'khẳng định' },
            { id: 19, sentence: '"We don\'t agree." → They said they ___ agree.', answer: 'did not', hint: 'lùi thì phủ định', kind: 'phủ định' },
            { id: 20, sentence: '"I saw her last week." → He said he ___ (see) her the week before.', answer: 'had seen', hint: 'quá khứ → QKHT', kind: 'khẳng định' }
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
            { id: 6, sentence: '"Can you help?" → She asked ___ I could help.', answer: 'if', hint: 'if/whether', kind: 'nghi vấn' },
            { id: 7, sentence: '"What time does it start?" → He asked what time it ___.', answer: 'started', hint: 'S + V', kind: 'nghi vấn' },
            { id: 8, sentence: '"Are you coming?" → She asked ___ I was coming.', answer: 'if', hint: 'if/whether', kind: 'nghi vấn' },
            { id: 9, sentence: '"Where did you go?" → He asked where I ___ (go).', answer: 'had gone', hint: 'lùi thì', kind: 'nghi vấn' },
            { id: 10, sentence: '"How old are you?" → She asked how old I ___.', answer: 'was', hint: 'S + V', kind: 'nghi vấn' },
            { id: 11, sentence: '"Do you work here?" → He asked ___ I worked there.', answer: 'if', hint: 'if/whether', kind: 'nghi vấn' },
            { id: 12, sentence: '"When will you finish?" → She asked when I ___ finish.', answer: 'would', hint: 'will → would', kind: 'nghi vấn' },
            { id: 13, sentence: '"Who is that man?" → He asked who that man ___.', answer: 'was', hint: 'S + V', kind: 'nghi vấn' },
            { id: 14, sentence: '"Have you eaten?" → She asked if I ___ (eat).', answer: 'had eaten', hint: 'lùi thì', kind: 'nghi vấn' },
            { id: 15, sentence: '"Why did she leave?" → He asked why she ___ (leave).', answer: 'had left', hint: 'lùi thì', kind: 'nghi vấn' },
            { id: 16, sentence: '"Can you drive?" → She asked ___ I could drive.', answer: 'if', hint: 'if/whether', kind: 'nghi vấn' },
            { id: 17, sentence: '"What are you doing?" → He asked what I ___ doing.', answer: 'was', hint: 'S + V', kind: 'nghi vấn' },
            { id: 18, sentence: '"How does it work?" → She asked how it ___.', answer: 'worked', hint: 'S + V', kind: 'nghi vấn' },
            { id: 19, sentence: '"Did they win?" → He asked ___ they had won.', answer: 'if', hint: 'if/whether', kind: 'nghi vấn' },
            { id: 20, sentence: '"Where is the station?" → She asked where the station ___.', answer: 'was', hint: 'S + V', kind: 'nghi vấn' }
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
            { id: 6, sentence: '"Help me, please." → He asked me ___ (help) him.', answer: 'to help', hint: 'to + V', kind: 'khẳng định' },
            { id: 7, sentence: '"Sit down." → The teacher told us ___ (sit) down.', answer: 'to sit', hint: 'to + V', kind: 'khẳng định' },
            { id: 8, sentence: '"Don\'t run!" → She told the children ___ (not/run).', answer: 'not to run', hint: 'not to + V', kind: 'phủ định' },
            { id: 9, sentence: '"Please call me." → He asked me ___ (call) him.', answer: 'to call', hint: 'to + V', kind: 'khẳng định' },
            { id: 10, sentence: '"Don\'t forget your keys." → She reminded me ___ (not/forget) my keys.', answer: 'not to forget', hint: 'not to + V', kind: 'phủ định' },
            { id: 11, sentence: '"Stand up." → The officer ordered them ___ (stand) up.', answer: 'to stand', hint: 'to + V', kind: 'khẳng định' },
            { id: 12, sentence: '"Don\'t be late." → He warned us ___ (not/be) late.', answer: 'not to be', hint: 'not to + V', kind: 'phủ định' },
            { id: 13, sentence: '"Take an umbrella." → She advised me ___ (take) an umbrella.', answer: 'to take', hint: 'to + V', kind: 'khẳng định' },
            { id: 14, sentence: '"Please sign here." → The clerk asked me ___ (sign) there.', answer: 'to sign', hint: 'to + V', kind: 'khẳng định' },
            { id: 15, sentence: '"Don\'t worry." → He told her ___ (not/worry).', answer: 'not to worry', hint: 'not to + V', kind: 'phủ định' },
            { id: 16, sentence: '"Finish the report." → The boss told me ___ (finish) the report.', answer: 'to finish', hint: 'to + V', kind: 'khẳng định' },
            { id: 17, sentence: '"Don\'t make noise." → She asked us ___ (not/make) noise.', answer: 'not to make', hint: 'not to + V', kind: 'phủ định' },
            { id: 18, sentence: '"Close the door, please." → He asked me ___ (close) the door.', answer: 'to close', hint: 'to + V', kind: 'khẳng định' },
            { id: 19, sentence: '"Don\'t touch the wires." → The engineer warned them ___ (not/touch) the wires.', answer: 'not to touch', hint: 'not to + V', kind: 'phủ định' },
            { id: 20, sentence: '"Bring your passport." → She reminded him ___ (bring) his passport.', answer: 'to bring', hint: 'to + V', kind: 'khẳng định' }
        ]
    }
};

export default { group, content };
