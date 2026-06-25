const fs = require('fs');
const path = require('path');

const topicId = 'daily-life';
const topicName = 'Daily Life';

const entries = [
  ['routine', '/ruːˈtiːn/', 'noun', 'thói quen, lịch trình hằng ngày', 'A healthy routine can make your day more productive.', 'Collocations: daily routine, morning routine', 'routine', 1],
  ['daily', '/ˈdeɪ.li/', 'adjective', 'hằng ngày, thường ngày', 'Exercise should be part of your daily life.', '', 'routine', 2],
  ['habit', '/ˈhæb.ɪt/', 'noun', 'thói quen', 'Reading before bed is a good habit.', 'Collocations: develop a habit, break a habit', 'habit', 1],
  ['habitual', '/həˈbɪtʃ.u.əl/', 'adjective', 'theo thói quen, thường lệ', 'Habitual late-night snacking can affect your sleep.', '', 'habit', 2],
  ['wake up', '/weɪk ʌp/', 'phrasal verb', 'thức dậy', 'I usually wake up at six thirty on weekdays.', '', 'morning-routine', 1, ['phrasal-verb']],
  ['get up', '/ɡet ʌp/', 'phrasal verb', 'rời giường, thức dậy', 'She gets up early to prepare breakfast.', '', 'morning-routine', 2, ['phrasal-verb']],
  ['alarm', '/əˈlɑːm/', 'noun', 'báo thức, chuông báo', 'I set an alarm so I would not be late for work.', 'Collocation: set an alarm', 'morning-routine', 3],
  ['sleep in', '/sliːp ɪn/', 'phrasal verb', 'ngủ nướng', 'Many people like to sleep in on Sunday mornings.', '', 'morning-routine', 4, ['phrasal-verb']],
  ['oversleep', '/ˌəʊ.vəˈsliːp/', 'verb', 'ngủ quên, ngủ quá giờ', 'He overslept and missed the first bus.', '', 'morning-routine', 5],
  ['brush', '/brʌʃ/', 'verb', 'đánh, chải', 'You should brush your teeth twice a day.', 'Collocation: brush your teeth/hair', 'personal-care', 1],
  ['toothbrush', '/ˈtuːθ.brʌʃ/', 'noun', 'bàn chải đánh răng', 'Remember to replace your toothbrush regularly.', '', 'personal-care', 2],
  ['toothpaste', '/ˈtuːθ.peɪst/', 'noun', 'kem đánh răng', 'This toothpaste has a mint flavour.', '', 'personal-care', 3],
  ['wash', '/wɒʃ/', 'verb', 'rửa, giặt', 'Wash your hands before meals.', '', 'personal-care', 4],
  ['shower', '/ˈʃaʊ.ər/', 'noun', 'vòi sen, việc tắm vòi sen', 'I usually take a shower after exercising.', 'Collocation: take a shower', 'personal-care', 5],
  ['bathe', '/beɪð/', 'verb', 'tắm', 'Parents often bathe young children before bedtime.', '', 'personal-care', 6],
  ['comb', '/kəʊm/', 'verb', 'chải tóc', 'He combed his hair before leaving the house.', '', 'personal-care', 7],
  ['dress', '/dres/', 'verb', 'mặc quần áo', 'It takes me ten minutes to dress in the morning.', '', 'getting-ready', 1],
  ['get dressed', '/ɡet drest/', 'phrase', 'mặc quần áo xong', 'The children got dressed quickly for school.', '', 'getting-ready', 2],
  ['outfit', '/ˈaʊt.fɪt/', 'noun', 'bộ trang phục', 'She chose a comfortable outfit for the long journey.', '', 'getting-ready', 3],
  ['prepare', '/prɪˈpeər/', 'verb', 'chuẩn bị', 'I prepare my bag the night before work.', 'Collocations: prepare breakfast, prepare for work', 'prepare', 1],
  ['preparation', '/ˌprep.ərˈeɪ.ʃən/', 'noun', 'sự chuẩn bị', 'Good preparation helps reduce stress in the morning.', '', 'prepare', 2],
  ['breakfast', '/ˈbrek.fəst/', 'noun', 'bữa sáng', 'Breakfast is often called the most important meal of the day.', '', 'meals', 1],
  ['lunch', '/lʌntʃ/', 'noun', 'bữa trưa', 'We usually have lunch at a small restaurant near the office.', '', 'meals', 2],
  ['dinner', '/ˈdɪn.ər/', 'noun', 'bữa tối', 'My family has dinner together every evening.', '', 'meals', 3],
  ['snack', '/snæk/', 'noun', 'đồ ăn nhẹ, bữa ăn nhẹ', 'Fruit is a healthy snack between meals.', '', 'meals', 4],
  ['meal', '/miːl/', 'noun', 'bữa ăn', 'Home-cooked meals are usually cheaper than eating out.', '', 'meals', 5],
  ['cook', '/kʊk/', 'verb', 'nấu ăn', 'He learned to cook simple dishes at university.', '', 'cooking', 1],
  ['cooking', '/ˈkʊk.ɪŋ/', 'noun', 'việc nấu ăn', 'Cooking at home can save money.', '', 'cooking', 2],
  ['recipe', '/ˈres.ɪ.pi/', 'noun', 'công thức nấu ăn', 'I followed a recipe for vegetable soup.', '', 'cooking', 3],
  ['ingredient', '/ɪnˈɡriː.di.ənt/', 'noun', 'nguyên liệu', 'Fresh ingredients make the dish taste better.', '', 'cooking', 4],
  ['grocery', '/ˈɡrəʊ.sər.i/', 'noun', 'thực phẩm, hàng tạp hóa', 'We buy groceries every Saturday morning.', 'Often plural: groceries', 'shopping', 1],
  ['supermarket', '/ˈsuː.pəˌmɑː.kɪt/', 'noun', 'siêu thị', 'The supermarket is crowded after work.', '', 'shopping', 2],
  ['checkout', '/ˈtʃek.aʊt/', 'noun', 'quầy thanh toán', 'There was a long queue at the checkout.', '', 'shopping', 3],
  ['receipt', '/rɪˈsiːt/', 'noun', 'hóa đơn, biên lai', 'Keep the receipt in case you need to return the item.', '', 'shopping', 4],
  ['budget', '/ˈbʌdʒ.ɪt/', 'noun', 'ngân sách, khoản tiền dự trù', 'A weekly budget helps control daily spending.', '', 'money-daily', 1],
  ['expense', '/ɪkˈspens/', 'noun', 'chi phí, khoản tiêu', 'Rent is usually the biggest monthly expense.', '', 'money-daily', 2],
  ['afford', '/əˈfɔːd/', 'verb', 'có đủ khả năng chi trả', 'Many students cannot afford to eat out every day.', 'Pattern: afford to do something', 'money-daily', 3],
  ['commute', '/kəˈmjuːt/', 'verb', 'đi lại hằng ngày giữa nhà và nơi làm/học', 'She commutes by bus to the city centre.', '', 'commuting', 1],
  ['commute', '/kəˈmjuːt/', 'noun', 'quãng đường đi làm/học hằng ngày', 'My morning commute takes about forty minutes.', '', 'commuting', 2],
  ['transport', '/ˈtræn.spɔːt/', 'noun', 'phương tiện giao thông, sự vận chuyển', 'Public transport is convenient in big cities.', 'Collocation: public transport', 'commuting', 3],
  ['bus stop', '/ˈbʌs stɒp/', 'noun', 'trạm xe buýt', 'The bus stop is only five minutes from my house.', '', 'commuting', 4],
  ['traffic', '/ˈtræf.ɪk/', 'noun', 'giao thông, xe cộ', 'Heavy traffic makes people tired before work.', 'Collocations: traffic jam, heavy traffic', 'commuting', 5],
  ['errand', '/ˈer.ənd/', 'noun', 'việc vặt cần làm', 'I have to run some errands after work.', 'Collocation: run errands', 'errands', 1],
  ['appointment', '/əˈpɔɪnt.mənt/', 'noun', 'cuộc hẹn', 'I have a dentist appointment at three o’clock.', 'Collocations: make, book, cancel an appointment', 'errands', 2],
  ['schedule', '/ˈʃed.juːl/', 'noun', 'lịch trình, thời khóa biểu', 'My schedule is full today.', '', 'schedule', 1],
  ['schedule', '/ˈʃed.juːl/', 'verb', 'lên lịch, sắp xếp lịch', 'We scheduled a meeting for Monday morning.', '', 'schedule', 2],
  ['plan', '/plæn/', 'verb', 'lên kế hoạch', 'I plan my day before checking my messages.', '', 'planning', 1],
  ['planner', '/ˈplæn.ər/', 'noun', 'sổ/ứng dụng lập kế hoạch', 'She uses a digital planner to organise her tasks.', '', 'planning', 2],
  ['organise', '/ˈɔː.ɡən.aɪz/', 'verb', 'sắp xếp, tổ chức', 'Organise your desk before starting work.', 'US spelling: organize', 'organise', 1],
  ['organisation', '/ˌɔː.ɡən.aɪˈzeɪ.ʃən/', 'noun', 'sự sắp xếp, tổ chức', 'Good organisation saves time during a busy day.', '', 'organise', 2],
  ['tidy', '/ˈtaɪ.di/', 'verb', 'dọn dẹp cho gọn gàng', 'I tidy my room every weekend.', '', 'chores', 1],
  ['tidy', '/ˈtaɪ.di/', 'adjective', 'gọn gàng, ngăn nắp', 'A tidy room can help you concentrate better.', '', 'chores', 2],
  ['clean', '/kliːn/', 'verb', 'lau dọn, làm sạch', 'We clean the kitchen after dinner.', '', 'chores', 3],
  ['cleaning', '/ˈkliː.nɪŋ/', 'noun', 'việc dọn dẹp, lau chùi', 'Saturday morning is usually for cleaning.', '', 'chores', 4],
  ['chore', '/tʃɔːr/', 'noun', 'việc nhà, việc vặt', 'Children should help with household chores.', 'Collocation: household chores', 'chores', 5],
  ['laundry', '/ˈlɔːn.dri/', 'noun', 'việc giặt giũ, đồ cần giặt', 'I do the laundry twice a week.', 'Collocation: do the laundry', 'chores', 6],
  ['dishwasher', '/ˈdɪʃˌwɒʃ.ər/', 'noun', 'máy rửa bát', 'The dishwasher saves us a lot of time.', '', 'chores', 7],
  ['vacuum', '/ˈvæk.juːm/', 'verb', 'hút bụi', 'He vacuums the living room every Friday.', '', 'chores', 8],
  ['dust', '/dʌst/', 'verb', 'phủi bụi, lau bụi', 'You should dust the shelves regularly.', '', 'chores', 9],
  ['relax', '/rɪˈlæks/', 'verb', 'thư giãn', 'I relax by listening to music after work.', '', 'relax', 1],
  ['relaxation', '/ˌriː.lækˈseɪ.ʃən/', 'noun', 'sự thư giãn', 'Relaxation is important for mental health.', '', 'relax', 2],
  ['leisure', '/ˈleʒ.ər/', 'noun', 'thời gian rảnh, giải trí', 'People need leisure time to recharge.', 'Collocation: leisure activities', 'free-time', 1],
  ['hobby', '/ˈhɒb.i/', 'noun', 'sở thích', 'Gardening is a relaxing hobby for many people.', '', 'free-time', 2],
  ['entertainment', '/ˌen.təˈteɪn.mənt/', 'noun', 'sự giải trí, chương trình giải trí', 'Streaming services are a common form of entertainment.', '', 'free-time', 3],
  ['screen time', '/ˈskriːn taɪm/', 'noun', 'thời gian dùng thiết bị màn hình', 'Too much screen time can affect sleep quality.', '', 'digital-life', 1],
  ['notification', '/ˌnəʊ.tɪ.fɪˈkeɪ.ʃən/', 'noun', 'thông báo', 'I turned off notifications during dinner.', '', 'digital-life', 2],
  ['message', '/ˈmes.ɪdʒ/', 'noun', 'tin nhắn, thông điệp', 'She sent me a message to confirm the time.', '', 'digital-life', 3],
  ['charge', '/tʃɑːdʒ/', 'verb', 'sạc pin', 'I need to charge my phone before going out.', '', 'digital-life', 4],
  ['battery', '/ˈbæt.ər.i/', 'noun', 'pin', 'My phone battery runs out quickly.', '', 'digital-life', 5],
  ['deadline', '/ˈded.laɪn/', 'noun', 'hạn chót', 'Daily tasks feel stressful when deadlines are too close.', '', 'tasks', 1],
  ['task', '/tɑːsk/', 'noun', 'nhiệm vụ, việc cần làm', 'I write down every task on my to-do list.', '', 'tasks', 2],
  ['priority', '/praɪˈɒr.ə.ti/', 'noun', 'việc ưu tiên, mức ưu tiên', 'Health should be a priority in everyday life.', '', 'tasks', 3],
  ['procrastinate', '/prəʊˈkræs.tɪ.neɪt/', 'verb', 'trì hoãn, chần chừ', 'Many people procrastinate when a task feels difficult.', '', 'tasks', 4],
  ['efficient', '/ɪˈfɪʃ.ənt/', 'adjective', 'hiệu quả, năng suất', 'An efficient routine leaves more time for hobbies.', '', 'efficiency', 1],
  ['efficiency', '/ɪˈfɪʃ.ən.si/', 'noun', 'sự hiệu quả, hiệu suất', 'Technology can improve efficiency in daily tasks.', '', 'efficiency', 2],
  ['convenient', '/kənˈviː.ni.ənt/', 'adjective', 'tiện lợi, thuận tiện', 'Online shopping is convenient for busy people.', '', 'convenience', 1],
  ['convenience', '/kənˈviː.ni.əns/', 'noun', 'sự tiện lợi', 'Many people choose convenience over price.', '', 'convenience', 2],
  ['comfortable', '/ˈkʌm.fə.tə.bəl/', 'adjective', 'thoải mái, dễ chịu', 'Comfortable shoes are important for a long commute.', '', 'comfort', 1],
  ['comfort', '/ˈkʌm.fət/', 'noun', 'sự thoải mái, tiện nghi', 'A clean home gives people a sense of comfort.', '', 'comfort', 2],
  ['stress', '/stres/', 'noun', 'sự căng thẳng, áp lực', 'Daily stress can build up if you do not rest properly.', '', 'stress', 1],
  ['stressful', '/ˈstres.fəl/', 'adjective', 'căng thẳng, gây áp lực', 'A long commute can be stressful.', '', 'stress', 2],
  ['tired', '/taɪəd/', 'adjective', 'mệt mỏi', 'I feel tired after a busy day at work.', '', 'energy', 1],
  ['exhausted', '/ɪɡˈzɔː.stɪd/', 'adjective', 'kiệt sức, rất mệt', 'She was exhausted after cleaning the whole house.', '', 'energy', 2],
  ['energetic', '/ˌen.əˈdʒet.ɪk/', 'adjective', 'tràn đầy năng lượng', 'A good breakfast can make you feel energetic.', '', 'energy', 3],
  ['nap', '/næp/', 'noun', 'giấc ngủ ngắn', 'A short nap can improve your mood.', 'Collocation: take a nap', 'rest', 1],
  ['rest', '/rest/', 'verb', 'nghỉ ngơi', 'You should rest after a long day.', '', 'rest', 2],
  ['bedtime', '/ˈbed.taɪm/', 'noun', 'giờ đi ngủ', 'Children need a regular bedtime.', '', 'evening-routine', 1],
  ['fall asleep', '/fɔːl əˈsliːp/', 'phrase', 'ngủ thiếp đi, chìm vào giấc ngủ', 'I fell asleep while watching television.', '', 'evening-routine', 2],
  ['stay up', '/steɪ ʌp/', 'phrasal verb', 'thức khuya', 'Students often stay up late before exams.', '', 'evening-routine', 3, ['phrasal-verb']],
  ['household', '/ˈhaʊs.həʊld/', 'noun', 'hộ gia đình, việc trong nhà', 'Household routines differ from family to family.', '', 'household-life', 1],
  ['neighbour', '/ˈneɪ.bər/', 'noun', 'hàng xóm', 'A friendly neighbour can make daily life more pleasant.', 'US spelling: neighbor', 'community-daily', 1],
  ['neighbourhood', '/ˈneɪ.bə.hʊd/', 'noun', 'khu phố, vùng lân cận', 'There is a small park in my neighbourhood.', 'US spelling: neighborhood', 'community-daily', 2],
  ['local', '/ˈləʊ.kəl/', 'adjective', 'địa phương, gần nơi ở', 'We often buy vegetables from the local market.', '', 'community-daily', 3],
  ['queue', '/kjuː/', 'noun', 'hàng chờ, hàng xếp', 'There was a long queue at the bakery.', 'British English; US: line', 'public-life', 1],
  ['crowded', '/ˈkraʊ.dɪd/', 'adjective', 'đông đúc', 'The train is crowded during rush hour.', '', 'public-life', 2],
  ['rush hour', '/ˈrʌʃ aʊər/', 'noun', 'giờ cao điểm', 'Avoid travelling during rush hour if possible.', '', 'public-life', 3],
  ['available', '/əˈveɪ.lə.bəl/', 'adjective', 'có sẵn, rảnh, khả dụng', 'Are you available for lunch tomorrow?', '', 'availability', 1],
  ['availability', '/əˌveɪ.ləˈbɪl.ə.ti/', 'noun', 'sự sẵn có, khả năng rảnh', 'The availability of public transport affects daily life.', '', 'availability', 2],
  ['punctual', '/ˈpʌŋk.tʃu.əl/', 'adjective', 'đúng giờ', 'Being punctual shows respect for other people’s time.', '', 'time-management', 1],
  ['punctuality', '/ˌpʌŋk.tʃuˈæl.ə.ti/', 'noun', 'tính đúng giờ', 'Punctuality is important at school and work.', '', 'time-management', 2]
];

const cards = entries.map(([word, ipa, partOfSpeech, meaning, example, note, familyId, familyOrder, tags]) => ({
  fieldValues: {
    word,
    ipa,
    partOfSpeech,
    difficulty: ['organisation', 'procrastinate', 'efficiency', 'availability', 'punctuality'].includes(word) ? 'advanced' : 'intermediate',
    meaning,
    example,
    ...(note ? { note } : {}),
    familyId,
    familyOrder,
    tags: tags || []
  }
}));

const seed = {
  _meta: {
    topicId,
    topicName,
    level: 'intermediate',
    source: 'Curated IELTS Vocabulary - Daily Life (B1-B2)',
    totalCards: cards.length,
    totalFamilies: new Set(cards.map(c => c.fieldValues.familyId)).size,
    generatedAt: '2026-05-06',
    note: 'Tu vung chu de Doi song hang ngay, gom theo family de hoc theo cum tu lien quan. Bao gom routine, sinh hoat ca nhan, bua an, di lai, viec nha, mua sam, giai tri, quan ly thoi gian va suc khoe tinh than.'
  },
  cards
};

for (const dir of ['packages/shell/public/seed-vocabulary']) {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'daily-life.json'), JSON.stringify(seed, null, 2) + '\n', 'utf8');
}

console.log(`Generated ${cards.length} cards, ${seed._meta.totalFamilies} families for ${topicId}`);
