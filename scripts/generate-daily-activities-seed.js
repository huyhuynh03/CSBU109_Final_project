const fs = require('fs');
const path = require('path');

const topicId = 'daily-activities';
const topicName = 'Daily Activities';

const entries = [
  ['activity', '/ækˈtɪv.ə.ti/', 'noun', 'hoạt động', 'Outdoor activities can improve your health and mood.', '', 'activities-general', 1],
  ['action', '/ˈæk.ʃən/', 'noun', 'hành động', 'Small actions can make your daily routine better.', '', 'activities-general', 2],
  ['routine', '/ruːˈtiːn/', 'noun', 'lịch trình, thói quen', 'A clear routine helps me manage my day.', '', 'activities-general', 3],
  ['schedule', '/ˈʃed.juːl/', 'noun', 'lịch trình', 'My schedule is full of meetings today.', '', 'activities-general', 4],
  ['wake up', '/weɪk ʌp/', 'phrasal verb', 'thức dậy', 'I wake up at six every morning.', '', 'morning-actions', 1, ['phrasal-verb']],
  ['get up', '/ɡet ʌp/', 'phrasal verb', 'rời giường, thức dậy', 'She gets up early to exercise.', '', 'morning-actions', 2, ['phrasal-verb']],
  ['stretch', '/stretʃ/', 'verb', 'duỗi người, giãn cơ', 'Stretch your body before starting the day.', '', 'morning-actions', 3],
  ['yawn', '/jɔːn/', 'verb', 'ngáp', 'He yawned because he stayed up late.', '', 'morning-actions', 4],
  ['make the bed', '/meɪk ðə bed/', 'phrase', 'dọn giường', 'I make the bed right after getting up.', '', 'morning-actions', 5],
  ['open the curtains', '/ˈəʊ.pən ðə ˈkɜː.tənz/', 'phrase', 'mở rèm cửa', 'Open the curtains to let in sunlight.', '', 'morning-actions', 6],
  ['wash your face', '/wɒʃ jɔː feɪs/', 'phrase', 'rửa mặt', 'Wash your face with cold water to feel awake.', '', 'personal-care-actions', 1],
  ['brush your teeth', '/brʌʃ jɔː tiːθ/', 'phrase', 'đánh răng', 'Brush your teeth twice a day.', '', 'personal-care-actions', 2],
  ['floss', '/flɒs/', 'verb', 'dùng chỉ nha khoa', 'Dentists recommend flossing every night.', '', 'personal-care-actions', 3],
  ['take a shower', '/teɪk ə ˈʃaʊ.ər/', 'phrase', 'tắm vòi sen', 'I take a shower after jogging.', '', 'personal-care-actions', 4],
  ['dry your hair', '/draɪ jɔː heər/', 'phrase', 'sấy/lau khô tóc', 'Dry your hair before going outside in cold weather.', '', 'personal-care-actions', 5],
  ['comb your hair', '/kəʊm jɔː heər/', 'phrase', 'chải tóc', 'He combs his hair before leaving home.', '', 'personal-care-actions', 6],
  ['shave', '/ʃeɪv/', 'verb', 'cạo râu', 'He shaves every morning before work.', '', 'personal-care-actions', 7],
  ['put on makeup', '/pʊt ɒn ˈmeɪk.ʌp/', 'phrase', 'trang điểm', 'She put on makeup for the interview.', '', 'personal-care-actions', 8],
  ['get dressed', '/ɡet drest/', 'phrase', 'mặc quần áo xong', 'The children got dressed quickly for school.', '', 'getting-ready-actions', 1],
  ['choose an outfit', '/tʃuːz ən ˈaʊt.fɪt/', 'phrase', 'chọn trang phục', 'I choose an outfit the night before work.', '', 'getting-ready-actions', 2],
  ['pack a bag', '/pæk ə bæɡ/', 'phrase', 'chuẩn bị/cất đồ vào túi', 'Pack your bag before you go to bed.', '', 'getting-ready-actions', 3],
  ['check the weather', '/tʃek ðə ˈweð.ər/', 'phrase', 'kiểm tra thời tiết', 'Check the weather before leaving the house.', '', 'getting-ready-actions', 4],
  ['lock the door', '/lɒk ðə dɔːr/', 'phrase', 'khóa cửa', 'Remember to lock the door when you leave.', '', 'getting-ready-actions', 5],
  ['leave home', '/liːv həʊm/', 'phrase', 'rời khỏi nhà', 'I usually leave home at seven thirty.', '', 'getting-ready-actions', 6],
  ['prepare breakfast', '/prɪˈpeər ˈbrek.fəst/', 'phrase', 'chuẩn bị bữa sáng', 'My father prepares breakfast for the family.', '', 'meal-actions', 1],
  ['make coffee', '/meɪk ˈkɒf.i/', 'phrase', 'pha cà phê', 'She makes coffee before checking emails.', '', 'meal-actions', 2],
  ['pour milk', '/pɔːr mɪlk/', 'phrase', 'rót sữa', 'Pour milk over the cereal.', '', 'meal-actions', 3],
  ['set the table', '/set ðə ˈteɪ.bəl/', 'phrase', 'dọn bàn ăn', 'The children set the table before dinner.', '', 'meal-actions', 4],
  ['clear the table', '/klɪər ðə ˈteɪ.bəl/', 'phrase', 'dọn bàn sau bữa ăn', 'Please clear the table after lunch.', '', 'meal-actions', 5],
  ['wash the dishes', '/wɒʃ ðə ˈdɪʃ.ɪz/', 'phrase', 'rửa bát đĩa', 'I wash the dishes while my brother dries them.', '', 'meal-actions', 6],
  ['do the dishes', '/duː ðə ˈdɪʃ.ɪz/', 'phrase', 'rửa bát đĩa', 'Who is going to do the dishes tonight?', '', 'meal-actions', 7],
  ['pack lunch', '/pæk lʌntʃ/', 'phrase', 'chuẩn bị cơm trưa mang theo', 'She packs lunch to save money.', '', 'meal-actions', 8],
  ['commute', '/kəˈmjuːt/', 'verb', 'đi lại hằng ngày giữa nhà và nơi làm/học', 'He commutes by train to the city.', '', 'travel-actions', 1],
  ['walk', '/wɔːk/', 'verb', 'đi bộ', 'I walk to the bus stop every morning.', '', 'travel-actions', 2],
  ['cycle', '/ˈsaɪ.kəl/', 'verb', 'đạp xe', 'Many students cycle to school.', '', 'travel-actions', 3],
  ['drive', '/draɪv/', 'verb', 'lái xe', 'She drives to work when it rains.', '', 'travel-actions', 4],
  ['take the bus', '/teɪk ðə bʌs/', 'phrase', 'đi xe buýt', 'We take the bus to the market.', '', 'travel-actions', 5],
  ['catch the train', '/kætʃ ðə treɪn/', 'phrase', 'bắt tàu', 'I need to catch the train at eight.', '', 'travel-actions', 6],
  ['cross the street', '/krɒs ðə striːt/', 'phrase', 'băng qua đường', 'Look both ways before you cross the street.', '', 'travel-actions', 7],
  ['wait in line', '/weɪt ɪn laɪn/', 'phrase', 'xếp hàng chờ', 'We had to wait in line for tickets.', 'British English: queue', 'public-actions', 1],
  ['queue', '/kjuː/', 'verb', 'xếp hàng', 'People queued outside the bakery.', 'British English', 'public-actions', 2],
  ['buy groceries', '/baɪ ˈɡrəʊ.sər.iz/', 'phrase', 'mua thực phẩm/hàng tạp hóa', 'I buy groceries every Saturday morning.', '', 'public-actions', 3],
  ['pay the bill', '/peɪ ðə bɪl/', 'phrase', 'thanh toán hóa đơn', 'She paid the bill with her phone.', '', 'public-actions', 4],
  ['withdraw cash', '/wɪðˈdrɔː kæʃ/', 'phrase', 'rút tiền mặt', 'He withdrew cash from the ATM.', '', 'public-actions', 5],
  ['run errands', '/rʌn ˈer.əndz/', 'phrase', 'làm việc vặt bên ngoài', 'I have to run errands after work.', '', 'public-actions', 6],
  ['book an appointment', '/bʊk ən əˈpɔɪnt.mənt/', 'phrase', 'đặt lịch hẹn', 'Book an appointment before visiting the clinic.', '', 'public-actions', 7],
  ['cancel an appointment', '/ˈkæn.səl ən əˈpɔɪnt.mənt/', 'phrase', 'hủy lịch hẹn', 'I had to cancel my appointment because I was sick.', '', 'public-actions', 8],
  ['study', '/ˈstʌd.i/', 'verb', 'học, học tập', 'She studies English for one hour every evening.', '', 'work-study-actions', 1],
  ['attend class', '/əˈtend klɑːs/', 'phrase', 'tham gia buổi học', 'Students must attend class regularly.', '', 'work-study-actions', 2],
  ['take notes', '/teɪk nəʊts/', 'phrase', 'ghi chú', 'Take notes while the teacher is explaining.', '', 'work-study-actions', 3],
  ['review lessons', '/rɪˈvjuː ˈles.ənz/', 'phrase', 'ôn bài', 'Review your lessons before the exam.', '', 'work-study-actions', 4],
  ['do homework', '/duː ˈhəʊm.wɜːk/', 'phrase', 'làm bài tập về nhà', 'He does homework after dinner.', '', 'work-study-actions', 5],
  ['submit homework', '/səbˈmɪt ˈhəʊm.wɜːk/', 'phrase', 'nộp bài tập', 'Submit your homework before Friday.', '', 'work-study-actions', 6],
  ['work', '/wɜːk/', 'verb', 'làm việc', 'Most people work from Monday to Friday.', '', 'work-study-actions', 7],
  ['check emails', '/tʃek ˈiː.meɪlz/', 'phrase', 'kiểm tra email', 'I check emails after breakfast.', '', 'work-study-actions', 8],
  ['reply to messages', '/rɪˈplaɪ tə ˈmes.ɪdʒɪz/', 'phrase', 'trả lời tin nhắn', 'She replies to messages during her break.', '', 'digital-actions', 1],
  ['make a phone call', '/meɪk ə ˈfəʊn kɔːl/', 'phrase', 'gọi điện thoại', 'I need to make a phone call to confirm the booking.', '', 'digital-actions', 2],
  ['send a text', '/send ə tekst/', 'phrase', 'gửi tin nhắn', 'Send me a text when you arrive.', '', 'digital-actions', 3],
  ['browse the internet', '/braʊz ði ˈɪn.tə.net/', 'phrase', 'lướt internet', 'He browses the internet for news in the morning.', '', 'digital-actions', 4],
  ['scroll', '/skrəʊl/', 'verb', 'cuộn/lướt màn hình', 'She scrolled through social media for an hour.', '', 'digital-actions', 5],
  ['charge your phone', '/tʃɑːdʒ jɔː fəʊn/', 'phrase', 'sạc điện thoại', 'Charge your phone before going out.', '', 'digital-actions', 6],
  ['download', '/ˌdaʊnˈləʊd/', 'verb', 'tải xuống', 'Download the file before the meeting.', '', 'digital-actions', 7],
  ['upload', '/ˌʌpˈləʊd/', 'verb', 'tải lên', 'Upload your assignment to the website.', '', 'digital-actions', 8],
  ['exercise', '/ˈek.sə.saɪz/', 'verb', 'tập thể dục', 'I exercise three times a week.', '', 'health-actions', 1],
  ['jog', '/dʒɒɡ/', 'verb', 'chạy bộ chậm', 'He jogs around the park every morning.', '', 'health-actions', 2],
  ['work out', '/wɜːk aʊt/', 'phrasal verb', 'tập luyện', 'She works out at the gym after work.', '', 'health-actions', 3, ['phrasal-verb']],
  ['meditate', '/ˈmed.ɪ.teɪt/', 'verb', 'thiền', 'Many people meditate to reduce stress.', '', 'health-actions', 4],
  ['breathe deeply', '/briːð ˈdiːp.li/', 'phrase', 'hít thở sâu', 'Breathe deeply when you feel nervous.', '', 'health-actions', 5],
  ['take medicine', '/teɪk ˈmed.ɪ.sən/', 'phrase', 'uống thuốc', 'Take medicine after meals if your doctor advises it.', '', 'health-actions', 6],
  ['rest', '/rest/', 'verb', 'nghỉ ngơi', 'You should rest after a long day.', '', 'health-actions', 7],
  ['take a nap', '/teɪk ə næp/', 'phrase', 'ngủ trưa, chợp mắt', 'A short nap can improve your concentration.', '', 'health-actions', 8],
  ['clean the house', '/kliːn ðə haʊs/', 'phrase', 'dọn dẹp nhà cửa', 'We clean the house every weekend.', '', 'household-actions', 1],
  ['tidy the room', '/ˈtaɪ.di ðə ruːm/', 'phrase', 'dọn phòng gọn gàng', 'Tidy the room before your guests arrive.', '', 'household-actions', 2],
  ['sweep the floor', '/swiːp ðə flɔːr/', 'phrase', 'quét sàn', 'Sweep the floor before mopping it.', '', 'household-actions', 3],
  ['mop the floor', '/mɒp ðə flɔːr/', 'phrase', 'lau sàn', 'Mop the floor when it gets dirty.', '', 'household-actions', 4],
  ['vacuum the carpet', '/ˈvæk.juːm ðə ˈkɑː.pɪt/', 'phrase', 'hút bụi thảm', 'I vacuum the carpet every Friday.', '', 'household-actions', 5],
  ['dust the shelves', '/dʌst ðə ʃelvz/', 'phrase', 'lau bụi kệ', 'Dust the shelves with a soft cloth.', '', 'household-actions', 6],
  ['do the laundry', '/duː ðə ˈlɔːn.dri/', 'phrase', 'giặt giũ', 'We do the laundry twice a week.', '', 'household-actions', 7],
  ['hang clothes', '/hæŋ kləʊðz/', 'phrase', 'phơi/treo quần áo', 'Hang clothes outside when the weather is sunny.', '', 'household-actions', 8],
  ['fold clothes', '/fəʊld kləʊðz/', 'phrase', 'gấp quần áo', 'Fold clothes and put them in the wardrobe.', '', 'household-actions', 9],
  ['take out the trash', '/teɪk aʊt ðə træʃ/', 'phrase', 'đổ rác', 'Take out the trash before it smells bad.', '', 'household-actions', 10],
  ['feed the pet', '/fiːd ðə pet/', 'phrase', 'cho thú cưng ăn', 'Remember to feed the pet before leaving.', '', 'family-home-actions', 1],
  ['walk the dog', '/wɔːk ðə dɒɡ/', 'phrase', 'dắt chó đi dạo', 'He walks the dog every evening.', '', 'family-home-actions', 2],
  ['water the plants', '/ˈwɔː.tər ðə plɑːnts/', 'phrase', 'tưới cây', 'Water the plants when the soil is dry.', '', 'family-home-actions', 3],
  ['help with chores', '/help wɪð tʃɔːrz/', 'phrase', 'giúp làm việc nhà', 'Children should help with chores at home.', '', 'family-home-actions', 4],
  ['take care of someone', '/teɪk keər əv ˈsʌm.wʌn/', 'phrase', 'chăm sóc ai đó', 'She takes care of her younger brother after school.', '', 'family-home-actions', 5],
  ['spend time with family', '/spend taɪm wɪð ˈfæm.əl.i/', 'phrase', 'dành thời gian cho gia đình', 'We spend time with family on Sundays.', '', 'family-home-actions', 6],
  ['meet friends', '/miːt frendz/', 'phrase', 'gặp bạn bè', 'I meet friends for coffee after work.', '', 'social-actions', 1],
  ['chat', '/tʃæt/', 'verb', 'trò chuyện', 'They chatted for hours at the cafe.', '', 'social-actions', 2],
  ['hang out', '/hæŋ aʊt/', 'phrasal verb', 'đi chơi, tụ tập', 'Teenagers often hang out at the mall.', '', 'social-actions', 3, ['phrasal-verb']],
  ['invite', '/ɪnˈvaɪt/', 'verb', 'mời', 'We invited our neighbours to dinner.', '', 'social-actions', 4],
  ['visit', '/ˈvɪz.ɪt/', 'verb', 'thăm, ghé thăm', 'They visit their grandparents every month.', '', 'social-actions', 5],
  ['celebrate', '/ˈsel.ə.breɪt/', 'verb', 'ăn mừng, kỷ niệm', 'We celebrate birthdays with a family dinner.', '', 'social-actions', 6],
  ['relax', '/rɪˈlæks/', 'verb', 'thư giãn', 'I relax by listening to quiet music.', '', 'leisure-actions', 1],
  ['watch TV', '/wɒtʃ ˌtiːˈviː/', 'phrase', 'xem TV', 'They watch TV together after dinner.', '', 'leisure-actions', 2],
  ['listen to music', '/ˈlɪs.ən tə ˈmjuː.zɪk/', 'phrase', 'nghe nhạc', 'She listens to music while cooking.', '', 'leisure-actions', 3],
  ['read a book', '/riːd ə bʊk/', 'phrase', 'đọc sách', 'I read a book before going to sleep.', '', 'leisure-actions', 4],
  ['play games', '/pleɪ ɡeɪmz/', 'phrase', 'chơi trò chơi', 'The children play games in the living room.', '', 'leisure-actions', 5],
  ['go for a walk', '/ɡəʊ fər ə wɔːk/', 'phrase', 'đi dạo', 'We go for a walk after dinner.', '', 'leisure-actions', 6],
  ['cook dinner', '/kʊk ˈdɪn.ər/', 'phrase', 'nấu bữa tối', 'My mother cooks dinner at six.', '', 'evening-actions', 1],
  ['prepare for tomorrow', '/prɪˈpeər fə təˈmɒr.əʊ/', 'phrase', 'chuẩn bị cho ngày mai', 'Prepare for tomorrow before you relax.', '', 'evening-actions', 2],
  ['set an alarm', '/set ən əˈlɑːm/', 'phrase', 'đặt báo thức', 'Set an alarm so you do not oversleep.', '', 'evening-actions', 3],
  ['turn off the lights', '/tɜːn ɒf ðə laɪts/', 'phrase', 'tắt đèn', 'Turn off the lights before you leave the room.', '', 'evening-actions', 4],
  ['go to bed', '/ɡəʊ tə bed/', 'phrase', 'đi ngủ', 'I usually go to bed before eleven.', '', 'evening-actions', 5],
  ['fall asleep', '/fɔːl əˈsliːp/', 'phrase', 'ngủ thiếp đi', 'She fell asleep while reading.', '', 'evening-actions', 6],
  ['oversleep', '/ˌəʊ.vəˈsliːp/', 'verb', 'ngủ quên, ngủ quá giờ', 'He overslept and missed the bus.', '', 'sleep-actions', 1],
  ['stay up', '/steɪ ʌp/', 'phrasal verb', 'thức khuya', 'Students often stay up late before exams.', '', 'sleep-actions', 2, ['phrasal-verb']]
];

const advancedWords = new Set([
  'withdraw cash', 'book an appointment', 'cancel an appointment', 'submit homework',
  'browse the internet', 'meditate', 'breathe deeply', 'take care of someone',
  'celebrate', 'prepare for tomorrow'
]);

const cards = entries.map(([word, ipa, partOfSpeech, meaning, example, note, familyId, familyOrder, tags]) => ({
  fieldValues: {
    word,
    ipa,
    partOfSpeech,
    difficulty: advancedWords.has(word) ? 'advanced' : 'intermediate',
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
    source: 'Curated IELTS Vocabulary - Daily Activities (B1-B2)',
    totalCards: cards.length,
    totalFamilies: new Set(cards.map(c => c.fieldValues.familyId)).size,
    generatedAt: '2026-05-06',
    note: 'Tu vung chu de Hoat dong hang ngay, gom theo family/nhom hanh dong de hoc theo cum lien quan. Bao gom buoi sang, cham soc ca nhan, chuan bi ra ngoai, bua an, di lai, viec cong cong, hoc tap lam viec, digital, suc khoe, viec nha, gia dinh, xa hoi, giai tri va buoi toi.'
  },
  cards
};

for (const dir of ['data/seed-vocabulary', 'public/seed-vocabulary']) {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'daily-activities.json'), JSON.stringify(seed, null, 2) + '\n', 'utf8');
}

console.log(`Generated ${cards.length} cards, ${seed._meta.totalFamilies} families for ${topicId}`);
