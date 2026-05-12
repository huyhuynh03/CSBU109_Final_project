const fs = require('fs');
const path = require('path');

const cards = [
  // --- Family: planning-booking ---
  ['itinerary','/aɪˈtɪn.ə.rer.i/','noun','advanced','lịch trình chuyến đi','We planned a detailed itinerary before the trip.','planning-booking'],
  ['destination','/ˌdes.tɪˈneɪ.ʃən/','noun','intermediate','điểm đến','Paris is a popular tourist destination.','planning-booking'],
  ['travel agency','/ˈtræv.əl ˌeɪ.dʒən.si/','noun','intermediate','công ty du lịch','The travel agency arranged our flights and hotels.','planning-booking'],
  ['tour operator','/ˈtʊr ˌɑː.pə.reɪ.t̬ɚ/','noun','advanced','nhà điều hành tour','The tour operator offered a discount for groups.','planning-booking'],
  ['package tour','/ˈpæk.ɪdʒ ˌtʊr/','noun','intermediate','tour trọn gói','A package tour includes flights, hotels, and meals.','planning-booking'],
  ['guided tour','/ˌɡaɪ.dɪd ˈtʊr/','noun','intermediate','tour có hướng dẫn viên','The guided tour lasted three hours.','planning-booking'],
  ['self-guided tour','/ˌself.ɡaɪ.dɪd ˈtʊr/','noun','advanced','tour tự khám phá','A self-guided tour lets you explore at your own pace.','planning-booking'],
  ['travel insurance','/ˈtræv.əl ɪnˌʃʊr.əns/','noun','intermediate','bảo hiểm du lịch','Travel insurance covers medical emergencies abroad.','planning-booking'],
  ['round trip','/ˌraʊnd ˈtrɪp/','noun','intermediate','chuyến đi khứ hồi','A round trip ticket is cheaper than two one-way tickets.','planning-booking'],
  ['one-way ticket','/ˌwʌn.weɪ ˈtɪk.ɪt/','noun','intermediate','vé một chiều','She bought a one-way ticket to London.','planning-booking'],
  ['bucket list','/ˈbʌk.ɪt ˌlɪst/','noun','intermediate','danh sách điều muốn làm trước khi chết','Visiting Japan is on my bucket list.','planning-booking'],
  ['wanderlust','/ˈwɑːn.dɚ.lʌst/','noun','advanced','niềm đam mê du lịch','Wanderlust drives many people to explore new places.','planning-booking'],

  // --- Family: air-travel ---
  ['departure','/dɪˈpɑːr.tʃɚ/','noun','intermediate','sự khởi hành','The departure time is 7 AM.','air-travel'],
  ['arrival','/əˈraɪ.vəl/','noun','intermediate','sự đến nơi','Our arrival was delayed by two hours.','air-travel'],
  ['boarding pass','/ˈbɔːr.dɪŋ ˌpæs/','noun','intermediate','thẻ lên máy bay','Show your boarding pass at the gate.','air-travel'],
  ['check-in','/ˈtʃek.ɪn/','noun','intermediate','thủ tục đăng ký (tại sân bay/khách sạn)','Online check-in saves time at the airport.','air-travel'],
  ['layover','/ˈleɪ.oʊ.vɚ/','noun','advanced','thời gian chờ nối chuyến','We had a six-hour layover in Dubai.','air-travel'],
  ['stopover','/ˈstɑːp.oʊ.vɚ/','noun','advanced','điểm dừng chân giữa hành trình','The stopover gave us time to explore Singapore.','air-travel'],
  ['transit','/ˈtræn.zɪt/','noun','intermediate','quá cảnh','Passengers in transit do not need a visa.','air-travel'],
  ['connecting flight','/kəˈnek.tɪŋ ˌflaɪt/','noun','intermediate','chuyến bay nối chuyến','We missed our connecting flight due to the delay.','air-travel'],
  ['direct flight','/dəˈrekt ˌflaɪt/','noun','intermediate','chuyến bay thẳng','A direct flight saves several hours.','air-travel'],
  ['long-haul flight','/ˌlɑːŋ.hɑːl ˈflaɪt/','noun','advanced','chuyến bay đường dài','A long-haul flight can last over 12 hours.','air-travel'],
  ['jet lag','/ˈdʒet ˌlæɡ/','noun','intermediate','mệt mỏi do lệch múi giờ','Jet lag made it hard to sleep the first night.','air-travel'],
  ['turbulence','/ˈtɝː.bjə.ləns/','noun','advanced','nhiễu động (khi bay)','The plane experienced turbulence over the ocean.','air-travel'],
  ['cabin crew','/ˈkæb.ɪn ˌkruː/','noun','intermediate','phi hành đoàn','The cabin crew served drinks during the flight.','air-travel'],
  ['terminal','/ˈtɝː.mɪ.nəl/','noun','intermediate','nhà ga sân bay','The international terminal is on the left.','air-travel'],
  ['baggage claim','/ˈbæɡ.ɪdʒ ˌkleɪm/','noun','intermediate','khu nhận hành lý','We waited at baggage claim for 30 minutes.','air-travel'],
  ['carry-on luggage','/ˌker.i.ɑːn ˈlʌɡ.ɪdʒ/','noun','intermediate','hành lý xách tay','Carry-on luggage must fit in the overhead bin.','air-travel'],
  ['aisle seat','/ˈaɪl ˌsiːt/','noun','intermediate','ghế cạnh lối đi','I prefer an aisle seat for extra legroom.','air-travel'],
  ['window seat','/ˈwɪn.doʊ ˌsiːt/','noun','intermediate','ghế cạnh cửa sổ','A window seat offers a great view during landing.','air-travel'],
  ['economy class','/ɪˈkɑː.nə.mi ˌklæs/','noun','intermediate','hạng phổ thông','Economy class tickets are the most affordable.','air-travel'],
  ['business class','/ˈbɪz.nɪs ˌklæs/','noun','intermediate','hạng thương gia','Business class offers wider seats and better meals.','air-travel'],

  // --- Family: documents-border ---
  ['passport','/ˈpæs.pɔːrt/','noun','intermediate','hộ chiếu','Make sure your passport is valid for six months.','documents-border'],
  ['visa','/ˈviː.zə/','noun','intermediate','thị thực','You need a visa to enter some countries.','documents-border'],
  ['customs','/ˈkʌs.təmz/','noun','intermediate','hải quan','Customs officers checked our bags at the border.','documents-border'],
  ['border control','/ˈbɔːr.dɚ kənˌtroʊl/','noun','intermediate','kiểm soát biên giới','Border control was strict during the holiday season.','documents-border'],
  ['duty-free','/ˌduː.t̬i ˈfriː/','adjective','intermediate','miễn thuế','She bought perfume at the duty-free shop.','documents-border'],
  ['currency exchange','/ˈkɝː.ən.si ɪksˌtʃeɪndʒ/','noun','intermediate','đổi tiền','The currency exchange booth is near the exit.','documents-border'],
  ['exchange rate','/ɪksˈtʃeɪndʒ ˌreɪt/','noun','intermediate','tỷ giá hối đoái','The exchange rate changes daily.','documents-border'],
  ['local currency','/ˈloʊ.kəl ˌkɝː.ən.si/','noun','intermediate','tiền tệ địa phương','Always carry some local currency for small purchases.','documents-border'],
  ['travel adapter','/ˈtræv.əl əˌdæp.tɚ/','noun','intermediate','ổ cắm chuyển đổi du lịch','A travel adapter is essential for international trips.','documents-border'],

  // --- Family: accommodation ---
  ['accommodation','/əˌkɑː.məˈdeɪ.ʃən/','noun','intermediate','chỗ ở','Finding affordable accommodation can be challenging.','accommodation'],
  ['reservation','/ˌrez.ɚˈveɪ.ʃən/','noun','intermediate','đặt chỗ trước','I made a reservation for two nights.','accommodation'],
  ['vacancy','/ˈveɪ.kən.si/','noun','intermediate','phòng trống','The sign said no vacancy.','accommodation'],
  ['fully booked','/ˌfʊl.i ˈbʊkt/','adjective','intermediate','hết phòng','The hotel was fully booked during the festival.','accommodation'],
  ['hostel','/ˈhɑː.stəl/','noun','intermediate','nhà trọ bình dân','Hostels are popular with budget travelers.','accommodation'],
  ['guesthouse','/ˈɡest.haʊs/','noun','intermediate','nhà khách','The guesthouse had a lovely garden.','accommodation'],
  ['bed and breakfast','/ˌbed ən ˈbrek.fəst/','noun','intermediate','nhà nghỉ có bữa sáng','We stayed at a cozy bed and breakfast.','accommodation'],
  ['resort','/rɪˈzɔːrt/','noun','intermediate','khu nghỉ dưỡng','The beach resort had a swimming pool.','accommodation'],
  ['all-inclusive','/ˌɑːl.ɪnˈkluː.sɪv/','adjective','advanced','trọn gói (bao gồm mọi thứ)','An all-inclusive resort covers food and activities.','accommodation'],
  ['boutique hotel','/buːˈtiːk hoʊˌtel/','noun','advanced','khách sạn boutique (nhỏ, sang trọng)','The boutique hotel had only 20 rooms.','accommodation'],
  ['front desk','/ˌfrʌnt ˈdesk/','noun','intermediate','quầy lễ tân','Ask at the front desk for a city map.','accommodation'],
  ['concierge','/ˌkɑːn.siˈerʒ/','noun','advanced','nhân viên hỗ trợ khách','The concierge recommended a local restaurant.','accommodation'],
  ['room service','/ˈruːm ˌsɝː.vɪs/','noun','intermediate','dịch vụ phòng','We ordered breakfast through room service.','accommodation'],
  ['check-out','/ˈtʃek.aʊt/','noun','intermediate','trả phòng','Check-out time is 11 AM.','accommodation'],

  // --- Family: sightseeing ---
  ['sightseeing','/ˈsaɪtˌsiː.ɪŋ/','noun','intermediate','tham quan','We spent the day sightseeing in Rome.','sightseeing'],
  ['tourist attraction','/ˈtʊr.ɪst əˌtræk.ʃən/','noun','intermediate','điểm thu hút du khách','The tower is the city\'s main tourist attraction.','sightseeing'],
  ['heritage site','/ˈher.ɪ.t̬ɪdʒ ˌsaɪt/','noun','advanced','di sản','The temple is a UNESCO heritage site.','sightseeing'],
  ['landmark','/ˈlænd.mɑːrk/','noun','intermediate','địa danh nổi bật','The bridge is a famous landmark.','sightseeing'],
  ['ruins','/ˈruː.ɪnz/','noun','intermediate','phế tích','The ancient ruins attract thousands of visitors.','sightseeing'],
  ['archaeological site','/ˌɑːr.ki.əˈlɑː.dʒɪ.kəl ˌsaɪt/','noun','advanced','di chỉ khảo cổ','The archaeological site dates back 2,000 years.','sightseeing'],
  ['national park','/ˌnæʃ.ən.əl ˈpɑːrk/','noun','intermediate','vườn quốc gia','The national park protects rare wildlife.','sightseeing'],
  ['nature reserve','/ˈneɪ.tʃɚ rɪˌzɝːv/','noun','advanced','khu bảo tồn thiên nhiên','The nature reserve is home to many bird species.','sightseeing'],
  ['scenic route','/ˈsiː.nɪk ˌruːt/','noun','intermediate','tuyến đường phong cảnh đẹp','We took the scenic route along the coast.','sightseeing'],
  ['observation deck','/ˌɑːb.zɚˈveɪ.ʃən ˌdek/','noun','advanced','đài quan sát','The observation deck offers a 360-degree view.','sightseeing'],
  ['souvenir','/ˌsuː.vəˈnɪr/','noun','intermediate','quà lưu niệm','She bought a souvenir magnet for her fridge.','sightseeing'],

  // --- Family: sea-travel ---
  ['cruise','/kruːz/','noun','intermediate','chuyến du thuyền','The cruise stopped at three islands.','sea-travel'],
  ['cruise ship','/ˈkruːz ˌʃɪp/','noun','intermediate','tàu du lịch','The cruise ship carried over 3,000 passengers.','sea-travel'],
  ['ferry','/ˈfer.i/','noun','intermediate','phà','We took a ferry to the island.','sea-travel'],
  ['harbor','/ˈhɑːr.bɚ/','noun','intermediate','bến cảng','The harbor was full of fishing boats.','sea-travel'],
  ['port','/pɔːrt/','noun','intermediate','cảng','The ship docked at the port early morning.','sea-travel'],
  ['dock','/dɑːk/','noun','intermediate','bến tàu','Passengers waited at the dock.','sea-travel'],
  ['pier','/pɪr/','noun','intermediate','cầu cảng','We walked along the pier at sunset.','sea-travel'],
  ['embark','/ɪmˈbɑːrk/','verb','advanced','lên tàu','Passengers embark at 4 PM.','sea-travel'],
  ['disembark','/ˌdɪs.ɪmˈbɑːrk/','verb','advanced','xuống tàu','We disembarked at the first port of call.','sea-travel'],
  ['shore excursion','/ˈʃɔːr ɪkˌskɝː.ʒən/','noun','advanced','chuyến tham quan trên bờ','The shore excursion included a visit to a temple.','sea-travel'],
  ['seasickness','/ˈsiːˌsɪk.nəs/','noun','intermediate','say sóng','Seasickness is common on rough waters.','sea-travel'],
  ['voyage','/ˈvɔɪ.ɪdʒ/','noun','advanced','chuyến hải trình dài','The voyage across the Atlantic took seven days.','sea-travel'],

  // --- Family: adventure-travel ---
  ['backpacking','/ˈbæk.pæk.ɪŋ/','noun','intermediate','du lịch bụi','Backpacking through Southeast Asia is very popular.','adventure-travel'],
  ['backpacker','/ˈbæk.pæk.ɚ/','noun','intermediate','người du lịch bụi','The backpacker stayed in cheap hostels.','adventure-travel'],
  ['trekking','/ˈtrek.ɪŋ/','noun','intermediate','đi bộ đường dài','Trekking in the mountains requires good fitness.','adventure-travel'],
  ['hiking trail','/ˈhaɪ.kɪŋ ˌtreɪl/','noun','intermediate','đường mòn đi bộ','The hiking trail leads to a waterfall.','adventure-travel'],
  ['campsite','/ˈkæmp.saɪt/','noun','intermediate','khu cắm trại','The campsite had showers and a cooking area.','adventure-travel'],
  ['camping gear','/ˈkæmp.ɪŋ ˌɡɪr/','noun','intermediate','dụng cụ cắm trại','We packed all the camping gear in the car.','adventure-travel'],
  ['expedition','/ˌek.spəˈdɪʃ.ən/','noun','advanced','cuộc thám hiểm','The expedition reached the summit after five days.','adventure-travel'],
  ['summit','/ˈsʌm.ɪt/','noun','intermediate','đỉnh núi','They reached the summit at dawn.','adventure-travel'],
  ['base camp','/ˈbeɪs ˌkæmp/','noun','advanced','trại căn cứ','The team rested at base camp before the final climb.','adventure-travel'],
  ['wildlife','/ˈwaɪld.laɪf/','noun','intermediate','động vật hoang dã','The region is famous for its wildlife.','adventure-travel'],
  ['safari','/səˈfɑːr.i/','noun','intermediate','chuyến đi xem thú hoang dã','We went on a safari in Kenya.','adventure-travel'],
  ['off the beaten track','/ˌɑːf ðə ˌbiː.tən ˈtræk/','idiom','advanced','nơi ít người biết đến','The village is off the beaten track.','adventure-travel'],
  ['hidden gem','/ˌhɪd.ən ˈdʒem/','noun','intermediate','viên ngọc ẩn (nơi đẹp ít người biết)','The café is a hidden gem in the old town.','adventure-travel'],

  // --- Family: sustainable-travel ---
  ['ecotourism','/ˈiː.koʊˌtʊr.ɪ.zəm/','noun','advanced','du lịch sinh thái','Ecotourism supports local communities.','sustainable-travel'],
  ['sustainable tourism','/səˌsteɪ.nə.bəl ˈtʊr.ɪ.zəm/','noun','advanced','du lịch bền vững','Sustainable tourism minimizes environmental damage.','sustainable-travel'],
  ['overtourism','/ˌoʊ.vɚˈtʊr.ɪ.zəm/','noun','advanced','du lịch quá tải','Overtourism harms popular destinations.','sustainable-travel'],
  ['carbon footprint','/ˈkɑːr.bən ˌfʊt.prɪnt/','noun','advanced','dấu chân carbon','Flying increases your carbon footprint.','sustainable-travel'],
  ['culture shock','/ˈkʌl.tʃɚ ˌʃɑːk/','noun','intermediate','sốc văn hóa','Culture shock is normal when living abroad.','sustainable-travel'],
  ['homesickness','/ˈhoʊmˌsɪk.nəs/','noun','intermediate','nỗi nhớ nhà','Homesickness faded after the first week.','sustainable-travel'],

  // --- Family: transport ---
  ['public transport','/ˌpʌb.lɪk ˈtræns.pɔːrt/','noun','intermediate','phương tiện giao thông công cộng','Public transport is efficient in most European cities.','transport'],
  ['metro','/ˈmet.roʊ/','noun','intermediate','tàu điện ngầm','The metro runs every five minutes.','transport'],
  ['tram','/træm/','noun','intermediate','xe điện','The tram connects the old town to the station.','transport'],
  ['cable car','/ˈkeɪ.bəl ˌkɑːr/','noun','intermediate','cáp treo','The cable car goes up to the mountain top.','transport'],
  ['rental car','/ˈren.t̬əl ˌkɑːr/','noun','intermediate','xe thuê','We picked up a rental car at the airport.','transport'],
  ['campervan','/ˈkæm.pɚ.væn/','noun','advanced','xe cắm trại','Traveling by campervan gives you freedom.','transport'],
  ['road trip','/ˈroʊd ˌtrɪp/','noun','intermediate','chuyến đi bằng đường bộ','A road trip along the coast is unforgettable.','transport'],
  ['hitchhiking','/ˈhɪtʃˌhaɪ.kɪŋ/','noun','advanced','đi nhờ xe','Hitchhiking is less common today than in the past.','transport'],
  ['rickshaw','/ˈrɪk.ʃɑː/','noun','advanced','xe kéo, xích lô','We took a rickshaw through the old quarter.','transport'],
  ['tuk-tuk','/ˈtʊk.tʊk/','noun','intermediate','xe tuk-tuk','A tuk-tuk ride is a fun way to see the city.','transport'],
  ['funicular','/fjuːˈnɪk.jə.lɚ/','noun','advanced','tàu leo dốc','The funicular takes you up the steep hill.','transport'],

  // --- Family: travel-lifestyle ---
  ['digital nomad','/ˌdɪdʒ.ɪ.t̬əl ˈnoʊ.mæd/','noun','advanced','người làm việc từ xa và du lịch','A digital nomad works online while traveling.','travel-lifestyle'],
  ['gap year','/ˈɡæp ˌjɪr/','noun','intermediate','năm nghỉ (trước đại học/giữa công việc)','She took a gap year to travel Asia.','travel-lifestyle'],
  ['sabbatical','/səˈbæt̬.ɪ.kəl/','noun','advanced','kỳ nghỉ dài hạn','He spent his sabbatical exploring South America.','travel-lifestyle'],
  ['travel blog','/ˈtræv.əl ˌblɑːɡ/','noun','intermediate','blog du lịch','Her travel blog has thousands of readers.','travel-lifestyle'],
  ['travel vlog','/ˈtræv.əl ˌvlɑːɡ/','noun','intermediate','vlog du lịch','His travel vlog shows daily adventures.','travel-lifestyle'],
  ['phrase book','/ˈfreɪz ˌbʊk/','noun','intermediate','sách cụm từ giao tiếp','A phrase book helps in countries where you don\'t speak the language.','travel-lifestyle']
];

const seed = {
  _meta: {
    topicId: 'travel',
    topicName: 'Du lịch',
    level: 'intermediate',
    source: 'Curated IELTS/Academic Vocabulary - Travel (B1-B2)',
    totalCards: cards.length,
    totalFamilies: new Set(cards.map(c => c[6])).size,
    generatedAt: '2026-05-12',
    note: 'Tu vung bo sung cho chu de Du lich, da loc tranh trung word voi cac topic seed hien co.'
  },
  cards: cards.map((c, idx, arr) => ({
    fieldValues: {
      word: c[0],
      ipa: c[1],
      partOfSpeech: c[2],
      difficulty: c[3],
      meaning: c[4],
      example: c[5],
      familyId: c[6],
      familyOrder: arr.slice(0, idx + 1).filter(x => x[6] === c[6]).length,
      tags: []
    }
  }))
};

for (const dir of ['public/seed-vocabulary', 'data/seed-vocabulary']) {
  fs.writeFileSync(path.join(dir, 'travel.json'), JSON.stringify(seed, null, 2) + '\n', 'utf8');
}

console.log(`Wrote travel.json with ${seed._meta.totalCards} cards and ${seed._meta.totalFamilies} families.`);
