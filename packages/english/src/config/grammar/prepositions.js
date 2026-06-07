// ============================================
// Grammar Group: Prepositions (Giới từ)
// ============================================

const group = {
    id: 'prepositions',
    nameVi: 'Giới từ',
    nameEn: 'Prepositions',
    icon: 'place',
    order: 11,
    lessons: [
        { id: 'prep-time', nameVi: 'Giới từ chỉ thời gian', nameEn: 'Prepositions of Time', icon: 'schedule', ielts: false },
        { id: 'prep-place', nameVi: 'Giới từ chỉ nơi chốn', nameEn: 'Prepositions of Place', icon: 'pin_drop', ielts: false },
        { id: 'prep-movement', nameVi: 'Giới từ chỉ chuyển động', nameEn: 'Prepositions of Movement', icon: 'directions_walk', ielts: false }
    ]
};

const content = {
    'prep-time': {
        usage: {
            intro: 'Ba giới từ thời gian chính: <b>at</b> (thời điểm), <b>on</b> (ngày), <b>in</b> (khoảng thời gian dài).',
            items: [
                { title: 'at — giờ, thời điểm cụ thể', icon: 'access_time', examples: ['<b>at</b> 7 o\'clock', '<b>at</b> noon, <b>at</b> night'] },
                { title: 'on — ngày, thứ, ngày tháng', icon: 'today', examples: ['<b>on</b> Monday', '<b>on</b> May 5th', '<b>on</b> my birthday'] },
                { title: 'in — tháng, năm, mùa, buổi', icon: 'calendar_month', examples: ['<b>in</b> 2024', '<b>in</b> summer', '<b>in</b> the morning'] }
            ],
            signalWords: { label: 'Ghi nhớ nhanh', words: ['at: giờ + thời điểm', 'on: ngày cụ thể', 'in: tháng/năm/mùa/buổi'] }
        },
        formula: {
            note: 'Quy tắc đi từ nhỏ đến lớn: <b>at</b> (nhỏ nhất - giờ) → <b>on</b> (ngày) → <b>in</b> (lớn nhất - năm).',
            groups: [
                {
                    label: 'Giới từ thời gian',
                    sub: 'at / on / in',
                    sentences: [
                        { kind: 'at', sign: '+', formula: 'at + giờ/thời điểm', examples: ['<b>at</b> 6 PM'] },
                        { kind: 'on', sign: '+', formula: 'on + ngày/thứ', examples: ['<b>on</b> Friday'] },
                        { kind: 'in', sign: '+', formula: 'in + tháng/năm/mùa', examples: ['<b>in</b> July'] }
                    ],
                    subject: {
                        headers: ['Giới từ', 'Dùng cho', 'Ví dụ'],
                        rows: [['at', 'giờ, thời điểm', 'at 5:30, at midnight'], ['on', 'ngày, thứ, dịp', 'on Sunday, on Christmas Day'], ['in', 'tháng, năm, mùa, buổi', 'in 2023, in winter, in the evening']]
                    },
                    note: 'Ngoại lệ: <b>at night</b> (không dùng in), <b>at the weekend</b> (Anh-Anh) / <b>on the weekend</b> (Anh-Mỹ).'
                }
            ],
            contractions: []
        },
        exercises: [
            { id: 1, sentence: 'The meeting starts ___ 9 AM.', answer: 'at', hint: 'giờ', kind: 'khẳng định' },
            { id: 2, sentence: 'My birthday is ___ June.', answer: 'in', hint: 'tháng', kind: 'khẳng định' },
            { id: 3, sentence: 'We have a test ___ Monday.', answer: 'on', hint: 'thứ', kind: 'khẳng định' },
            { id: 4, sentence: 'She was born ___ 1995.', answer: 'in', hint: 'năm', kind: 'khẳng định' },
            { id: 5, sentence: 'I usually read ___ night.', answer: 'at', hint: 'ngoại lệ', kind: 'khẳng định' },
            { id: 6, sentence: 'The party is ___ New Year\'s Eve.', answer: 'on', hint: 'dịp cụ thể', kind: 'khẳng định' }
        ]
    },
    'prep-place': {
        usage: {
            intro: 'Giới từ nơi chốn chính: <b>at</b> (điểm), <b>on</b> (bề mặt), <b>in</b> (không gian bao quanh).',
            items: [
                { title: 'at — một điểm/địa điểm', icon: 'place', examples: ['<b>at</b> the bus stop', '<b>at</b> home, <b>at</b> school'] },
                { title: 'on — trên bề mặt', icon: 'layers', examples: ['<b>on</b> the table', '<b>on</b> the wall'] },
                { title: 'in — bên trong không gian', icon: 'inbox', examples: ['<b>in</b> the box', '<b>in</b> the room, <b>in</b> London'] }
            ],
            signalWords: { label: 'Khác', words: ['under (dưới)', 'between (giữa hai)', 'next to / beside (cạnh)', 'behind (sau)', 'in front of (trước)'] }
        },
        formula: {
            note: 'Ghi nhớ: <b>at</b> = điểm; <b>on</b> = bề mặt tiếp xúc; <b>in</b> = không gian bao quanh.',
            groups: [
                {
                    label: 'Giới từ nơi chốn',
                    sub: 'at / on / in',
                    sentences: [
                        { kind: 'at', sign: '+', formula: 'at + điểm/địa điểm', examples: ['<b>at</b> the door'] },
                        { kind: 'on', sign: '+', formula: 'on + bề mặt', examples: ['<b>on</b> the floor'] },
                        { kind: 'in', sign: '+', formula: 'in + không gian', examples: ['<b>in</b> the kitchen'] }
                    ],
                    subject: {
                        headers: ['Giới từ', 'Ý nghĩa', 'Ví dụ'],
                        rows: [['at', 'một điểm', 'at the corner'], ['on', 'trên bề mặt', 'on the desk'], ['in', 'bên trong', 'in the car'], ['under', 'bên dưới', 'under the bed'], ['between', 'giữa hai vật', 'between A and B']]
                    },
                    note: 'Phương tiện: <b>in</b> a car/taxi (nhỏ) nhưng <b>on</b> a bus/train/plane (lớn, đi vào trong).'
                }
            ],
            contractions: []
        },
        exercises: [
            { id: 1, sentence: 'The keys are ___ the table.', answer: 'on', hint: 'bề mặt', kind: 'khẳng định' },
            { id: 2, sentence: 'She is ___ the kitchen.', answer: 'in', hint: 'không gian', kind: 'khẳng định' },
            { id: 3, sentence: 'I\'ll meet you ___ the station.', answer: 'at', hint: 'điểm', kind: 'khẳng định' },
            { id: 4, sentence: 'The cat is ___ the chair. (bên dưới)', answer: 'under', hint: 'bên dưới', kind: 'khẳng định' },
            { id: 5, sentence: 'The bank is ___ the shop and the cafe. (giữa)', answer: 'between', hint: 'giữa hai', kind: 'khẳng định' },
            { id: 6, sentence: 'We were ___ a plane to Tokyo.', answer: 'on', hint: 'phương tiện lớn', kind: 'khẳng định' }
        ]
    },
    'prep-movement': {
        usage: {
            intro: 'Giới từ chuyển động diễn tả hướng di chuyển: <b>to, into, out of, through, across, towards</b>.',
            items: [
                { title: 'to — hướng đến đích', icon: 'east', examples: ['I go <b>to</b> school.', 'She walked <b>to</b> the door.'] },
                { title: 'into / out of — vào trong / ra ngoài', icon: 'login', examples: ['He came <b>into</b> the room.', 'She went <b>out of</b> the house.'] },
                { title: 'through / across — xuyên qua / băng qua', icon: 'sync_alt', examples: ['walk <b>through</b> the forest', 'swim <b>across</b> the river'] }
            ],
            signalWords: { label: 'Giới từ chuyển động', words: ['to, into, out of', 'through, across, along', 'towards, away from, up, down'] }
        },
        formula: {
            note: 'Phân biệt <b>to</b> (đích đến) và <b>at/in</b> (vị trí tĩnh): go <b>to</b> school vs be <b>at</b> school.',
            groups: [
                {
                    label: 'Giới từ chuyển động',
                    sub: 'movement',
                    sentences: [
                        { kind: 'Hướng đích', sign: '+', formula: 'V + to + nơi', examples: ['drive <b>to</b> work'] },
                        { kind: 'Vào/ra', sign: '+', formula: 'V + into / out of', examples: ['jump <b>into</b> the pool'] },
                        { kind: 'Qua', sign: '+', formula: 'V + through / across', examples: ['run <b>across</b> the street'] }
                    ],
                    subject: {
                        headers: ['Giới từ', 'Ý nghĩa'],
                        rows: [['to', 'đến (đích)'], ['into', 'vào trong'], ['out of', 'ra khỏi'], ['through', 'xuyên qua (không gian 3 chiều)'], ['across', 'băng qua (bề mặt)'], ['towards', 'về phía']]
                    },
                    note: 'Phân biệt: <b>through</b> (xuyên qua bên trong: through a tunnel) vs <b>across</b> (băng qua bề mặt: across a bridge).'
                }
            ],
            contractions: []
        },
        exercises: [
            { id: 1, sentence: 'He walked ___ the room and sat down. (vào trong)', answer: 'into', hint: 'vào trong', kind: 'khẳng định' },
            { id: 2, sentence: 'We drove ___ the city center.', answer: 'to', hint: 'hướng đích', kind: 'khẳng định' },
            { id: 3, sentence: 'The train went ___ the tunnel. (xuyên qua)', answer: 'through', hint: 'xuyên qua', kind: 'khẳng định' },
            { id: 4, sentence: 'She swam ___ the lake. (băng qua)', answer: 'across', hint: 'băng qua', kind: 'khẳng định' },
            { id: 5, sentence: 'The cat jumped ___ the box. (ra khỏi)', answer: 'out of', hint: 'ra khỏi', kind: 'khẳng định' },
            { id: 6, sentence: 'He is walking ___ the station. (về phía)', answer: 'towards', hint: 'về phía', kind: 'khẳng định' }
        ]
    }
};

export default { group, content };
