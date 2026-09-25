// ============================================================================
// new-words-batch2-a.js — Phần A: dữ liệu batch 2 (am)  [A]
// Các topic: travel, daily-life, business, employment, home-living,
//            communication-social, emotion-feelings, health
// ----------------------------------------------------------------------------
// Mỗi mục: { topic, word, ipa, pos, difficulty, meaning, example, familyId,
//            familyOrder, note?, patch? }
//   - patch: true → chỉ cập nhật familyId/familyOrder cho card đã tồn tại.
//   - familyId rỗng → từ đơn lẻ (theo plans/family-word-learning-flow.md §0.4)
//   - Runtime tự cluster theo stem (LCP >= 3 VÀ >= 50% từ ngắn hơn).
//     Từ có prefix dài (im-, un-, counter-...) vẫn đặt chung familyId với base
//     để hiển thị; runtime sẽ tách thành cluster riêng nếu LCP không đủ.
// ============================================================================

module.exports = [
  // ── TRAVEL ─────────────────────────────────────────────
  { topic: 'travel', word: 'shuttle', ipa: '/ˈʃʌt.əl/', pos: 'noun', difficulty: 'intermediate', meaning: 'xe đưa đón (shuttle)', example: 'A free shuttle takes guests from the airport to the hotel.', familyId: '', familyOrder: null },
  { topic: 'travel', word: 'reserve', ipa: '/rɪˈzɝːv/', pos: 'verb', difficulty: 'intermediate', meaning: 'đặt trước, dành trước', example: 'You should reserve a table before going to that restaurant.', familyId: 'reserve', familyOrder: 1 },
  { topic: 'travel', word: 'reservation', patch: true, familyId: 'reserve', familyOrder: 2 },
  { topic: 'travel', word: 'depart', ipa: '/dɪˈpɑːrt/', pos: 'verb', difficulty: 'intermediate', meaning: 'khởi hành, rời đi', example: 'The train will depart from platform four at six.', familyId: 'depart', familyOrder: 1 },
  { topic: 'travel', word: 'departure', patch: true, familyId: 'depart', familyOrder: 2 },
  { topic: 'travel', word: 'alight', ipa: '/əˈlaɪt/', pos: 'verb', difficulty: 'advanced', meaning: 'xuống (tàu, xe, ngựa)', example: 'Passengers must alight from the bus at the front door.', familyId: '', familyOrder: null },

  // ── DAILY-LIFE ─────────────────────────────────────────
  { topic: 'daily-life', word: 'envelope', ipa: '/ˈen.və.loʊp/', pos: 'noun', difficulty: 'intermediate', meaning: 'phong bì', example: 'She sealed the letter and put it in an envelope.', familyId: '', familyOrder: null },
  { topic: 'daily-life', word: 'blink', ipa: '/blɪŋk/', pos: 'verb', difficulty: 'intermediate', meaning: 'chớp mắt, nhấp nháy', example: 'He tried not to blink during the staring contest.', familyId: 'blink', familyOrder: 1 },
  { topic: 'daily-life', word: 'blinking', ipa: '/ˈblɪŋ.kɪŋ/', pos: 'adjective', difficulty: 'advanced', meaning: 'nhấp nháy', example: 'The blinking light on the machine means it is charging.', familyId: 'blink', familyOrder: 2 },
  { topic: 'daily-life', word: 'count', ipa: '/kaʊnt/', pos: 'verb', difficulty: 'beginner', meaning: 'đếm', example: 'The teacher asked the children to count from one to ten.', familyId: 'count', familyOrder: 1 },
  { topic: 'daily-life', word: 'countless', ipa: '/ˈkaʊnt.ləs/', pos: 'adjective', difficulty: 'intermediate', meaning: 'vô số, không đếm xuể', example: 'She has given countless hours to charity work.', familyId: 'count', familyOrder: 2 },
  { topic: 'daily-life', word: 'move', patch: true, familyId: 'move', familyOrder: 1 },
  { topic: 'daily-life', word: 'movement', ipa: '/ˈmuːv.mənt/', pos: 'noun', difficulty: 'intermediate', meaning: 'sự chuyển động, phong trào', example: 'The dancer moved with great grace and fluid movement.', familyId: 'move', familyOrder: 2 },
  { topic: 'daily-life', word: 'separate', ipa: '/ˈsep.ə.reɪt/', pos: 'verb', difficulty: 'intermediate', meaning: 'tách, phân tách', example: 'We need to separate the recyclable waste from the rest.', familyId: 'separate', familyOrder: 1 },
  { topic: 'daily-life', word: 'separation', ipa: '/ˌsep.əˈreɪ.ʃən/', pos: 'noun', difficulty: 'advanced', meaning: 'sự tách rời, phân ly', example: 'The separation of church and state is an important principle.', familyId: 'separate', familyOrder: 2 },
  { topic: 'daily-life', word: 'quite', ipa: '/kwaɪt/', pos: 'adverb', difficulty: 'beginner', meaning: 'khá, khá là, hoàn toàn', example: 'The new sofa is quite comfortable to sit on.', familyId: '', familyOrder: null },
  { topic: 'daily-life', word: 'simple', ipa: '/ˈsɪm.pəl/', pos: 'adjective', difficulty: 'beginner', meaning: 'đơn giản, giản dị', example: 'The recipe is simple and takes only ten minutes.', familyId: 'simple', familyOrder: 1 },
  { topic: 'daily-life', word: 'simply', ipa: '/ˈsɪm.pli/', pos: 'adverb', difficulty: 'intermediate', meaning: 'một cách đơn giản, chỉ đơn giản là', example: 'He simply walked away without saying a word.', familyId: 'simple', familyOrder: 2 },
  { topic: 'daily-life', word: 'common', ipa: '/ˈkɑː.mən/', pos: 'adjective', difficulty: 'intermediate', meaning: 'phổ biến, chung, thông thường', example: 'This is a common mistake among language learners.', familyId: '', familyOrder: null },

  // ── BUSINESS ───────────────────────────────────────────
  { topic: 'business', word: 'adjust', ipa: '/əˈdʒʌst/', pos: 'verb', difficulty: 'intermediate', meaning: 'điều chỉnh, chỉnh sửa', example: 'We had to adjust our budget after the price increase.', familyId: 'adjust', familyOrder: 1 },
  { topic: 'business', word: 'adjusted', ipa: '/əˈdʒʌs.tɪd/', pos: 'adjective', difficulty: 'advanced', meaning: 'đã được điều chỉnh', example: 'The adjusted figures show a small profit this quarter.', familyId: 'adjust', familyOrder: 2 },
  { topic: 'business', word: 'compact', ipa: '/kəmˈpækt/', pos: 'adjective', difficulty: 'intermediate', meaning: 'gọn gàng, nhỏ gọn', example: 'This compact design saves a lot of space in the office.', familyId: 'compact', familyOrder: 1 },
  { topic: 'business', word: 'compactly', ipa: '/kəmˈpækt.li/', pos: 'adverb', difficulty: 'advanced', meaning: 'một cách gọn gàng', example: 'The tools are stored compactly in a small drawer.', familyId: 'compact', familyOrder: 2 },
  { topic: 'business', word: 'compaction', ipa: '/kəmˈpæk.ʃən/', pos: 'noun', difficulty: 'advanced', meaning: 'sự nén chặt', example: 'Soil compaction can affect how well plants grow.', familyId: 'compact', familyOrder: 3 },
  { topic: 'business', word: 'inspect', ipa: '/ɪnˈspekt/', pos: 'verb', difficulty: 'intermediate', meaning: 'kiểm tra, thanh tra', example: 'An inspector will inspect the building for safety issues.', familyId: 'inspect', familyOrder: 1 },
  { topic: 'business', word: 'inspection', ipa: '/ɪnˈspek.ʃən/', pos: 'noun', difficulty: 'intermediate', meaning: 'sự kiểm tra, thanh tra', example: 'The fire inspection revealed several problems in the wiring.', familyId: 'inspect', familyOrder: 2 },
  { topic: 'business', word: 'inspector', ipa: '/ɪnˈspek.tər/', pos: 'noun', difficulty: 'intermediate', meaning: 'thanh tra viên, người giám sát', example: 'The health inspector checked the cleanliness of the kitchen.', familyId: 'inspect', familyOrder: 3 },
  { topic: 'business', word: 'refurbish', ipa: '/ˌriːˈfɝː.bɪʃ/', pos: 'verb', difficulty: 'advanced', meaning: 'tân trang, sửa sang lại', example: 'The company plans to refurbish all its old computers.', familyId: 'refurbish', familyOrder: 1 },
  { topic: 'business', word: 'refurbishment', ipa: '/ˌriːˈfɝː.bɪʃ.mənt/', pos: 'noun', difficulty: 'advanced', meaning: 'sự tân trang, tu sửa', example: 'The refurbishment of the hotel took nearly a year.', familyId: 'refurbish', familyOrder: 2 },
  { topic: 'business', word: 'warranty', ipa: '/ˈwɔːr.ən.ti/', pos: 'noun', difficulty: 'intermediate', meaning: 'bảo hành, chế độ bảo hành', example: 'The laptop comes with a two-year warranty.', familyId: '', familyOrder: null },
  { topic: 'business', word: 'quantity', ipa: '/ˈkwɑːn.tə.ti/', pos: 'noun', difficulty: 'intermediate', meaning: 'số lượng', example: 'We ordered a large quantity of paper for the office.', familyId: 'quantity', familyOrder: 1 },
  { topic: 'business', word: 'quantify', ipa: '/ˈkwɑːn.tə.faɪ/', pos: 'verb', difficulty: 'advanced', meaning: 'định lượng, đo lường', example: 'It is hard to quantify the exact impact of the policy.', familyId: 'quantity', familyOrder: 2 },
  { topic: 'business', word: 'quantitative', ipa: '/ˈkwɑːn.tə.teɪ.tɪv/', pos: 'adjective', difficulty: 'advanced', meaning: 'định lượng (thuộc về số lượng)', example: 'The report includes both quantitative and qualitative data.', familyId: 'quantity', familyOrder: 3 },
  { topic: 'business', word: 'receive', ipa: '/rɪˈsiːv/', pos: 'verb', difficulty: 'intermediate', meaning: 'nhận', example: 'You will receive a confirmation email after booking.', familyId: 'receive', familyOrder: 1 },
  { topic: 'business', word: 'reception', ipa: '/rɪˈsep.ʃən/', pos: 'noun', difficulty: 'intermediate', meaning: 'lễ tân, sự đón tiếp, bộ phận tiếp tân', example: 'Please leave your keys at the reception desk.', familyId: 'receive', familyOrder: 2 },
  { topic: 'business', word: 'counterproductive', ipa: '/ˌkaʊn.tər.prəˈdʌk.tɪv/', pos: 'adjective', difficulty: 'advanced', meaning: 'phản tác dụng', example: 'Working too many hours can be counterproductive for your health.', familyId: '', familyOrder: null },

  // ── EMPLOYMENT ─────────────────────────────────────────
  { topic: 'employment', word: 'technician', ipa: '/tekˈnɪʃ.ən/', pos: 'noun', difficulty: 'intermediate', meaning: 'kỹ thuật viên', example: 'The technician repaired the air conditioner within an hour.', familyId: '', familyOrder: null },
  { topic: 'employment', word: 'badge', ipa: '/bædʒ/', pos: 'noun', difficulty: 'intermediate', meaning: 'thẻ đeo, phù hiệu', example: 'All employees must wear an ID badge at work.', familyId: '', familyOrder: null },

  // ── HOME-LIVING ────────────────────────────────────────
  { topic: 'home-living', word: 'rack', ipa: '/ræk/', pos: 'noun', difficulty: 'intermediate', meaning: 'giá đỡ, kệ', example: 'He hung the towels on the drying rack.', familyId: '', familyOrder: null, note: 'Thường dùng trong cụm như drying rack, luggage rack' },
  { topic: 'home-living', word: 'crack', ipa: '/kræk/', pos: 'verb', difficulty: 'intermediate', meaning: 'nứt, làm nứt; bẻ gãy', example: 'The heat caused the old window to crack.', familyId: 'crack', familyOrder: 1 },
  { topic: 'home-living', word: 'cracked', ipa: '/krækt/', pos: 'adjective', difficulty: 'intermediate', meaning: 'bị nứt', example: 'The cracked tile needs to be replaced.', familyId: 'crack', familyOrder: 2 },
  { topic: 'home-living', word: 'electrocute', ipa: '/ɪˈlek.trə.kjuːt/', pos: 'verb', difficulty: 'advanced', meaning: 'bị điện giật (gây tử vong/thương tích)', example: 'Never touch a power line or you could electrocute yourself.', familyId: 'electrocute', familyOrder: 1 },
  { topic: 'home-living', word: 'electrocution', ipa: '/ɪˌlek.trəˈkjuː.ʃən/', pos: 'noun', difficulty: 'advanced', meaning: 'sự điện giật, chết do điện giật', example: 'Workers are trained to prevent electrocution on site.', familyId: 'electrocute', familyOrder: 2 },
  { topic: 'home-living', word: 'electrocuted', ipa: '/ɪˈlek.trə.kjuː.tɪd/', pos: 'adjective', difficulty: 'advanced', meaning: 'bị điện giật', example: 'Luckily nobody was electrocuted during the storm.', familyId: 'electrocute', familyOrder: 3 },

  // ── COMMUNICATION-SOCIAL ───────────────────────────────
  { topic: 'communication-social', word: 'inconvenience', ipa: '/ˌɪn.kənˈviː.ni.əns/', pos: 'noun', difficulty: 'advanced', meaning: 'sự bất tiện, phiền phức', example: 'We apologize for any inconvenience caused by the delay.', familyId: 'inconvenience', familyOrder: 1 },
  { topic: 'communication-social', word: 'inconvenient', ipa: '/ˌɪn.kənˈviː.ni.ənt/', pos: 'adjective', difficulty: 'advanced', meaning: 'bất tiện, phiền toái', example: 'The meeting time is inconvenient for our team.', familyId: 'inconvenience', familyOrder: 2 },
  { topic: 'communication-social', word: 'regard', ipa: '/rɪˈɡɑːrd/', pos: 'verb', difficulty: 'intermediate', meaning: 'coi như, xem như', example: 'She is highly regarded for her honesty.', familyId: 'regard', familyOrder: 1 },
  { topic: 'communication-social', word: 'regarding', ipa: '/rɪˈɡɑːr.dɪŋ/', pos: 'preposition', difficulty: 'advanced', meaning: 'về việc, liên quan đến', example: 'Please contact us regarding the delivery date.', familyId: 'regard', familyOrder: 2 },
  { topic: 'communication-social', word: 'critic', ipa: '/ˈkrɪt.ɪk/', pos: 'noun', difficulty: 'intermediate', meaning: 'nhà phê bình, người chỉ trích', example: 'The film critic praised the actress\'s performance.', familyId: 'critic', familyOrder: 1 },
  { topic: 'communication-social', word: 'criticize', ipa: '/ˈkrɪt.ɪ.saɪz/', pos: 'verb', difficulty: 'intermediate', meaning: 'phê bình, chỉ trích', example: 'It is easy to criticize others but harder to help them.', familyId: 'critic', familyOrder: 2 },
  { topic: 'communication-social', word: 'criticism', ipa: '/ˈkrɪt.ɪ.sɪ.zəm/', pos: 'noun', difficulty: 'intermediate', meaning: 'lời phê bình, sự chỉ trích', example: 'He accepted the criticism with good grace.', familyId: 'critic', familyOrder: 3 },
  { topic: 'communication-social', word: 'critical', ipa: '/ˈkrɪt.ɪ.kəl/', pos: 'adjective', difficulty: 'intermediate', meaning: 'phê phán, gay gắt; quan trọng then chốt', example: 'The report was critical of the government\'s handling of the crisis.', familyId: 'critic', familyOrder: 4 },
  { topic: 'communication-social', word: 'straightforward', ipa: '/ˌstreɪtˈfɔːr.wəd/', pos: 'adjective', difficulty: 'intermediate', meaning: 'thẳng thắn, dễ hiểu, đơn giản', example: 'The instructions are straightforward and easy to follow.', familyId: '', familyOrder: null },
  { topic: 'communication-social', word: 'inexplicable', ipa: '/ˌɪn.ɪkˈsplɪk.ə.bəl/', pos: 'adjective', difficulty: 'advanced', meaning: 'không thể giải thích được', example: 'For some inexplicable reason, the alarm kept going off.', familyId: 'inexplicable', familyOrder: 1 },
  { topic: 'communication-social', word: 'inexplicably', ipa: '/ˌɪn.ɪkˈsplɪk.ə.bli/', pos: 'adverb', difficulty: 'advanced', meaning: 'một cách khó hiểu', example: 'He inexplicably left the meeting without a word.', familyId: 'inexplicable', familyOrder: 2 },
  { topic: 'communication-social', word: 'encourage', ipa: '/ɪnˈkɝː.ɪdʒ/', pos: 'verb', difficulty: 'intermediate', meaning: 'khuyến khích, động viên', example: 'Teachers should encourage students to ask questions.', familyId: 'encourage', familyOrder: 1 },
  { topic: 'communication-social', word: 'encouragement', ipa: '/ɪnˈkɝː.ɪdʒ.mənt/', pos: 'noun', difficulty: 'intermediate', meaning: 'sự khuyến khích, động viên', example: 'Her words of encouragement gave me confidence.', familyId: 'encourage', familyOrder: 2 },
  { topic: 'communication-social', word: 'particular', ipa: '/pərˈtɪk.jə.lər/', pos: 'adjective', difficulty: 'intermediate', meaning: 'riêng, cụ thể, đặc biệt', example: 'Is there any particular topic you want to discuss?', familyId: '', familyOrder: null },

  // ── EMOTION-FEELINGS ───────────────────────────────────
  { topic: 'emotion-feelings', word: 'patient', patch: true, familyId: 'patient', familyOrder: 1 },
  { topic: 'emotion-feelings', word: 'patience', ipa: '/ˈpeɪ.ʃəns/', pos: 'noun', difficulty: 'intermediate', meaning: 'sự kiên nhẫn', example: 'Learning a language requires a lot of patience.', familyId: 'patient', familyOrder: 2 },
  { topic: 'emotion-feelings', word: 'impatient', patch: true, familyId: 'impatient', familyOrder: 1 },
  { topic: 'emotion-feelings', word: 'impatiently', ipa: '/ɪmˈpeɪ.ʃənt.li/', pos: 'adverb', difficulty: 'advanced', meaning: 'một cách sốt ruột, mất kiên nhẫn', example: 'She tapped her foot impatiently while waiting in line.', familyId: 'impatient', familyOrder: 2 },
  { topic: 'emotion-feelings', word: 'frighten', ipa: '/ˈfraɪ.tən/', pos: 'verb', difficulty: 'intermediate', meaning: 'làm sợ hãi, dọa', example: 'Sudden loud noises frighten small children.', familyId: 'frighten', familyOrder: 1 },
  { topic: 'emotion-feelings', word: 'frightening', ipa: '/ˈfraɪ.tən.ɪŋ/', pos: 'adjective', difficulty: 'intermediate', meaning: 'đáng sợ, đáng kinh hãi', example: 'The movie was too frightening for young viewers.', familyId: 'frighten', familyOrder: 2 },
  { topic: 'emotion-feelings', word: 'frightened', patch: true, familyId: 'frighten', familyOrder: 3 },
  { topic: 'emotion-feelings', word: 'desire', ipa: '/dɪˈzaɪr/', pos: 'noun', difficulty: 'intermediate', meaning: 'khao khát, ham muốn', example: 'She has a strong desire to travel the world.', familyId: 'desire', familyOrder: 1 },
  { topic: 'emotion-feelings', word: 'desirable', ipa: '/dɪˈzaɪr.ə.bəl/', pos: 'adjective', difficulty: 'advanced', meaning: 'đáng mong muốn, đáng mơ ước', example: 'A quiet neighborhood is highly desirable for families.', familyId: 'desire', familyOrder: 2 },
  { topic: 'emotion-feelings', word: 'triumph', ipa: '/ˈtraɪ.əmf/', pos: 'noun', difficulty: 'advanced', meaning: 'sự chiến thắng, chiến thắng vẻ vang', example: 'Winning the championship was a great triumph for the team.', familyId: 'triumph', familyOrder: 1 },
  { topic: 'emotion-feelings', word: 'triumphant', ipa: '/traɪˈʌm.fənt/', pos: 'adjective', difficulty: 'advanced', meaning: 'hân hoan chiến thắng', example: 'The triumphant players lifted the trophy high.', familyId: 'triumph', familyOrder: 2 },

  // ── HEALTH ─────────────────────────────────────────────
  { topic: 'health', word: 'accident', patch: true, familyId: 'accident', familyOrder: 1 },
  { topic: 'health', word: 'accidental', ipa: '/ˌæk.sɪˈden.təl/', pos: 'adjective', difficulty: 'advanced', meaning: 'tình cờ, do tai nạn', example: 'The fire was caused by an accidental spark.', familyId: 'accident', familyOrder: 2 },
  { topic: 'health', word: 'accidentally', ipa: '/ˌæk.sɪˈden.təl.i/', pos: 'adverb', difficulty: 'advanced', meaning: 'một cách tình cờ, vô tình', example: 'I accidentally deleted the important file.', familyId: 'accident', familyOrder: 3 },
  { topic: 'health', word: 'fate', ipa: '/feɪt/', pos: 'noun', difficulty: 'intermediate', meaning: 'số phận, định mệnh', example: 'They believe it was fate that brought them together.', familyId: 'fate', familyOrder: 1 },
  { topic: 'health', word: 'fatal', ipa: '/ˈfeɪ.təl/', pos: 'adjective', difficulty: 'intermediate', meaning: 'gây tử vong, chết người', example: 'The driver suffered a fatal injury in the crash.', familyId: 'fate', familyOrder: 2 },
  { topic: 'health', word: 'fatally', ipa: '/ˈfeɪ.təl.i/', pos: 'adverb', difficulty: 'advanced', meaning: 'gây chết người, tử vong', example: 'The passenger was fatally wounded in the attack.', familyId: 'fate', familyOrder: 3 },
  { topic: 'health', word: 'fatality', ipa: '/feɪˈtæl.ə.ti/', pos: 'noun', difficulty: 'advanced', meaning: 'ca tử vong, sự chết chóc', example: 'The crash resulted in two fatalities.', familyId: 'fate', familyOrder: 4 },
  { topic: 'health', word: 'prevent', ipa: '/prɪˈvent/', pos: 'verb', difficulty: 'intermediate', meaning: 'ngăn chặn, phòng ngừa', example: 'Washing your hands helps prevent the spread of disease.', familyId: 'prevent', familyOrder: 1 },
  { topic: 'health', word: 'preventive', ipa: '/prɪˈven.tɪv/', pos: 'adjective', difficulty: 'advanced', meaning: 'phòng ngừa, dự phòng', example: 'Regular check-ups are part of preventive healthcare.', familyId: 'prevent', familyOrder: 2 },
  { topic: 'health', word: 'hygiene', patch: true, familyId: 'hygiene', familyOrder: 1 },
  { topic: 'health', word: 'hygienic', ipa: '/haɪˈdʒen.ɪk/', pos: 'adjective', difficulty: 'advanced', meaning: 'vệ sinh, hợp vệ sinh', example: 'The restaurant must maintain hygienic conditions in the kitchen.', familyId: 'hygiene', familyOrder: 2 },
  { topic: 'health', word: 'pregnant', ipa: '/ˈpreg.nənt/', pos: 'adjective', difficulty: 'intermediate', meaning: 'mang thai', example: 'She is pregnant and expecting her first child.', familyId: 'pregnant', familyOrder: 1 },
  { topic: 'health', word: 'pregnancy', ipa: '/ˈpreg.nən.si/', pos: 'noun', difficulty: 'intermediate', meaning: 'thời kỳ mang thai', example: 'A healthy diet is important during pregnancy.', familyId: 'pregnant', familyOrder: 2 },
  { topic: 'health', word: 'metabolism', ipa: '/məˈtæb.ə.lɪ.zəm/', pos: 'noun', difficulty: 'advanced', meaning: 'sự trao đổi chất', example: 'Exercise can speed up your metabolism.', familyId: 'metabolism', familyOrder: 1 },
  { topic: 'health', word: 'metabolic', ipa: '/ˌmet.əˈbɑː.lɪk/', pos: 'adjective', difficulty: 'advanced', meaning: 'thuộc về trao đổi chất', example: 'The doctor checked his metabolic rate at rest.', familyId: 'metabolism', familyOrder: 2 },
  { topic: 'health', word: 'dexterity', ipa: '/dekˈster.ə.ti/', pos: 'noun', difficulty: 'advanced', meaning: 'sự khéo léo, tài khéo tay', example: 'Playing the piano requires manual dexterity.', familyId: '', familyOrder: null },
  { topic: 'health', word: 'spreading', ipa: '/ˈspred.ɪŋ/', pos: 'noun', difficulty: 'advanced', meaning: 'sự lan truyền, lây lan', example: 'Hand washing helps slow the spreading of germs.', familyId: '', familyOrder: null, note: 'Dạng V-ing của spread (động từ bất quy tắc) — không tạo family riêng' },
];