// ============================================================================
// new-words-data.js — Dữ liệu từ vựng mới cần thêm (gốc + family phái sinh)
// ----------------------------------------------------------------------------
// Mỗi mục: { topic, word, ipa, pos, difficulty, meaning, example, familyId,
//            familyOrder, note?, patch? }
//   - patch: true  → chỉ cập nhật familyId/familyOrder cho card đã tồn tại
//            (không tạo mới), dùng cho từ gốc đã có trong seed.
//   - familyId rỗng → từ đơn lẻ, không thuộc family nào (theo quy tắc mục 0
//     trong plans/family-word-learning-flow.md).
//
// Quy tắc family (tóm tắt): chỉ gom các từ THỰC SỰ cùng gốc phái sinh — LCP
// >= 3 ký tự VÀ >= 50% độ dài từ ngắn hơn. Runtime tự cluster lại theo stem.
// ============================================================================

module.exports = [
  // ---- home-living: garden family + tweezer ----
  { topic: 'home-living', word: 'garden', patch: true, familyId: 'garden', familyOrder: 1 },
  { topic: 'home-living', word: 'gardener', ipa: '/ˈɡɑːr.dən.ər/', pos: 'noun', difficulty: 'intermediate', meaning: 'người làm vườn', example: 'The gardener trims the hedges every weekend.', familyId: 'garden', familyOrder: 2 },
  { topic: 'home-living', word: 'gardening', ipa: '/ˈɡɑːr.dən.ɪŋ/', pos: 'noun', difficulty: 'intermediate', meaning: 'việc làm vườn', example: 'Gardening is a relaxing hobby for many retired people.', familyId: 'garden', familyOrder: 3 },
  { topic: 'home-living', word: 'tweezer', ipa: '/ˈtwiː.zər/', pos: 'noun', difficulty: 'intermediate', meaning: 'cái nhíp', example: 'She used a tweezer to remove the tiny splinter.', familyId: '', familyOrder: null, note: 'Thường dùng số nhiều: tweezers' },

  // ---- communication-social: function words + probable/possible/define/current families ----
  { topic: 'communication-social', word: 'probable', ipa: '/ˈprɑː.bə.bəl/', pos: 'adjective', difficulty: 'intermediate', meaning: 'có khả năng xảy ra', example: 'It is probable that the meeting will be postponed.', familyId: 'probable', familyOrder: 1 },
  { topic: 'communication-social', word: 'probably', ipa: '/ˈprɑː.bə.bli/', pos: 'adverb', difficulty: 'intermediate', meaning: 'có lẽ, có khả năng', example: 'She is probably the best candidate for the job.', familyId: 'probable', familyOrder: 2 },
  { topic: 'communication-social', word: 'by', ipa: '/baɪ/', pos: 'preposition', difficulty: 'beginner', meaning: 'bởi, bằng, cạnh, trước (thời điểm)', example: 'The report must be finished by Friday.', familyId: '', familyOrder: null },
  { topic: 'communication-social', word: 'every', ipa: '/ˈev.ri/', pos: 'determiner', difficulty: 'beginner', meaning: 'mỗi, mọi', example: 'She checks her email every morning.', familyId: '', familyOrder: null },
  { topic: 'communication-social', word: 'anybody', ipa: '/ˈen.iˌbɑː.di/', pos: 'pronoun', difficulty: 'beginner', meaning: 'bất cứ ai, người nào', example: 'Is there anybody who can help me with this?', familyId: '', familyOrder: null },
  { topic: 'communication-social', word: 'during', ipa: '/ˈdʊr.ɪŋ/', pos: 'preposition', difficulty: 'beginner', meaning: 'trong suốt, trong lúc', example: 'Please keep quiet during the presentation.', familyId: '', familyOrder: null },
  { topic: 'communication-social', word: 'yourself', ipa: '/jɔːrˈself/', pos: 'pronoun', difficulty: 'beginner', meaning: 'chính bạn, bản thân bạn', example: 'You should be proud of yourself for finishing the course.', familyId: '', familyOrder: null },
  { topic: 'communication-social', word: 'possible', ipa: '/ˈpɑː.sə.bəl/', pos: 'adjective', difficulty: 'intermediate', meaning: 'có thể, khả thi', example: 'It is possible to learn a language at any age.', familyId: 'possible', familyOrder: 1 },
  { topic: 'communication-social', word: 'possibly', ipa: '/ˈpɑː.sə.bli/', pos: 'adverb', difficulty: 'intermediate', meaning: 'có lẽ, có thể', example: 'The delay was possibly caused by the heavy rain.', familyId: 'possible', familyOrder: 2 },
  { topic: 'communication-social', word: 'possibility', ipa: '/ˌpɑː.səˈbɪl.ə.ti/', pos: 'noun', difficulty: 'intermediate', meaning: 'khả năng, điều có thể xảy ra', example: 'There is a strong possibility of rain tomorrow.', familyId: 'possible', familyOrder: 3 },
  { topic: 'communication-social', word: 'define', ipa: '/dɪˈfaɪn/', pos: 'verb', difficulty: 'intermediate', meaning: 'định nghĩa, xác định', example: 'Can you define this word in your own words?', familyId: 'define', familyOrder: 1 },
  { topic: 'communication-social', word: 'definition', ipa: '/ˌdef.ɪˈnɪʃ.ən/', pos: 'noun', difficulty: 'intermediate', meaning: 'định nghĩa', example: 'The dictionary gives a clear definition of the term.', familyId: 'define', familyOrder: 2 },
  { topic: 'communication-social', word: 'definite', ipa: '/ˈdef.ɪ.nət/', pos: 'adjective', difficulty: 'intermediate', meaning: 'rõ ràng, chắc chắn', example: 'We need a definite answer by tomorrow.', familyId: 'define', familyOrder: 3 },
  { topic: 'communication-social', word: 'definitely', ipa: '/ˈdef.ɪ.nət.li/', pos: 'adverb', difficulty: 'intermediate', meaning: 'chắc chắn, nhất định', example: 'I will definitely come to your birthday party.', familyId: 'define', familyOrder: 4 },
  { topic: 'communication-social', word: 'current', ipa: '/ˈkɝː.ənt/', pos: 'adjective', difficulty: 'intermediate', meaning: 'hiện tại, hiện hành', example: 'The current situation requires immediate action.', familyId: 'current', familyOrder: 1 },
  { topic: 'communication-social', word: 'currently', ipa: '/ˈkɝː.ənt.li/', pos: 'adverb', difficulty: 'intermediate', meaning: 'hiện nay, hiện thời', example: 'She is currently working on a new project.', familyId: 'current', familyOrder: 2 },

  // ---- environment-climate: moss, valley, humid family, breeze family, field ----
  { topic: 'environment-climate', word: 'moss', ipa: '/mɔːs/', pos: 'noun', difficulty: 'intermediate', meaning: 'rêu', example: 'Green moss covered the old stone wall.', familyId: '', familyOrder: null },
  { topic: 'environment-climate', word: 'valley', ipa: '/ˈvæl.i/', pos: 'noun', difficulty: 'intermediate', meaning: 'thung lũng', example: 'The river flows gently through the green valley.', familyId: '', familyOrder: null },
  { topic: 'environment-climate', word: 'humid', ipa: '/ˈhjuː.mɪd/', pos: 'adjective', difficulty: 'intermediate', meaning: 'ẩm ướt (không khí)', example: 'The weather is hot and humid in summer.', familyId: 'humid', familyOrder: 1 },
  { topic: 'environment-climate', word: 'humidity', ipa: '/hjuːˈmɪd.ə.ti/', pos: 'noun', difficulty: 'intermediate', meaning: 'độ ẩm', example: 'High humidity makes the heat feel worse.', familyId: 'humid', familyOrder: 2 },
  { topic: 'environment-climate', word: 'breeze', ipa: '/briːz/', pos: 'noun', difficulty: 'intermediate', meaning: 'làn gió nhẹ', example: 'A cool breeze blew in from the sea.', familyId: 'breeze', familyOrder: 1 },
  { topic: 'environment-climate', word: 'breezy', ipa: '/ˈbriː.zi/', pos: 'adjective', difficulty: 'intermediate', meaning: 'lộng gió, có gió nhẹ', example: 'It was a bright and breezy spring morning.', familyId: 'breeze', familyOrder: 2 },
  { topic: 'environment-climate', word: 'field', ipa: '/fiːld/', pos: 'noun', difficulty: 'intermediate', meaning: 'cánh đồng, lĩnh vực', example: 'Farmers were working in the rice field.', familyId: '', familyOrder: null },

  // ---- emotion-feelings: incredible family, enjoy family ----
  { topic: 'emotion-feelings', word: 'incredible', ipa: '/ɪnˈkred.ə.bəl/', pos: 'adjective', difficulty: 'intermediate', meaning: 'không thể tin được, tuyệt vời', example: 'The view from the mountain top was incredible.', familyId: 'incredible', familyOrder: 1 },
  { topic: 'emotion-feelings', word: 'incredibly', ipa: '/ɪnˈkred.ə.bli/', pos: 'adverb', difficulty: 'intermediate', meaning: 'cực kỳ, đáng kinh ngạc', example: 'She was incredibly kind to the new students.', familyId: 'incredible', familyOrder: 2 },
  { topic: 'emotion-feelings', word: 'enjoy', ipa: '/ɪnˈdʒɔɪ/', pos: 'verb', difficulty: 'beginner', meaning: 'thưởng thức, tận hưởng', example: 'I really enjoy listening to music after work.', familyId: 'enjoy', familyOrder: 1 },
  { topic: 'emotion-feelings', word: 'enjoyable', ipa: '/ɪnˈdʒɔɪ.ə.bəl/', pos: 'adjective', difficulty: 'intermediate', meaning: 'thú vị, đáng tận hưởng', example: 'We had an enjoyable evening at the concert.', familyId: 'enjoy', familyOrder: 2 },
  { topic: 'emotion-feelings', word: 'enjoyment', ipa: '/ɪnˈdʒɔɪ.mənt/', pos: 'noun', difficulty: 'intermediate', meaning: 'sự thích thú, niềm vui', example: 'Reading gives her great enjoyment.', familyId: 'enjoy', familyOrder: 3 },

  // ---- personal-qualities: perfect family, goodness, dedicate family, aspire family ----
  { topic: 'personal-qualities', word: 'perfect', ipa: '/ˈpɝː.fɪkt/', pos: 'adjective', difficulty: 'intermediate', meaning: 'hoàn hảo', example: 'She speaks perfect English after years of practice.', familyId: 'perfect', familyOrder: 1 },
  { topic: 'personal-qualities', word: 'perfectly', ipa: '/ˈpɝː.fɪkt.li/', pos: 'adverb', difficulty: 'intermediate', meaning: 'một cách hoàn hảo', example: 'The two colors match perfectly.', familyId: 'perfect', familyOrder: 2 },
  { topic: 'personal-qualities', word: 'perfection', ipa: '/pɚˈfek.ʃən/', pos: 'noun', difficulty: 'advanced', meaning: 'sự hoàn hảo', example: 'He practices for hours in pursuit of perfection.', familyId: 'perfect', familyOrder: 3 },
  { topic: 'personal-qualities', word: 'goodness', ipa: '/ˈɡʊd.nəs/', pos: 'noun', difficulty: 'intermediate', meaning: 'lòng tốt, sự tốt lành', example: 'She believes in the goodness of ordinary people.', familyId: 'good', familyOrder: 2 },
  { topic: 'personal-qualities', word: 'dedicate', ipa: '/ˈded.ɪ.keɪt/', pos: 'verb', difficulty: 'advanced', meaning: 'cống hiến, dành trọn', example: 'He decided to dedicate his life to helping others.', familyId: 'dedicate', familyOrder: 1 },
  { topic: 'personal-qualities', word: 'dedication', ipa: '/ˌded.ɪˈkeɪ.ʃən/', pos: 'noun', difficulty: 'advanced', meaning: 'sự cống hiến, tận tụy', example: 'Her dedication to the team was admirable.', familyId: 'dedicate', familyOrder: 2 },
  { topic: 'personal-qualities', word: 'dedicated', ipa: '/ˈded.ɪ.keɪ.tɪd/', pos: 'adjective', difficulty: 'intermediate', meaning: 'tận tụy, hết lòng', example: 'She is a dedicated teacher who cares about every student.', familyId: 'dedicate', familyOrder: 3 },
  { topic: 'personal-qualities', word: 'aspire', ipa: '/əˈspaɪr/', pos: 'verb', difficulty: 'advanced', meaning: 'khao khát, hướng tới', example: 'Many young people aspire to start their own business.', familyId: 'aspire', familyOrder: 1 },
  { topic: 'personal-qualities', word: 'aspiration', ipa: '/ˌæs.pɚˈeɪ.ʃən/', pos: 'noun', difficulty: 'advanced', meaning: 'khát vọng, hoài bão', example: 'Her greatest aspiration is to become a doctor.', familyId: 'aspire', familyOrder: 2 },
  { topic: 'personal-qualities', word: 'aspiring', ipa: '/əˈspaɪr.ɪŋ/', pos: 'adjective', difficulty: 'advanced', meaning: 'có khát vọng, đầy tham vọng', example: 'The workshop is designed for aspiring writers.', familyId: 'aspire', familyOrder: 3 },

  // ---- psychology: insane family, notice family ----
  { topic: 'psychology', word: 'insane', ipa: '/ɪnˈseɪn/', pos: 'adjective', difficulty: 'advanced', meaning: 'điên rồ, mất trí', example: 'Driving in that storm would be insane.', familyId: 'insane', familyOrder: 1 },
  { topic: 'psychology', word: 'insanely', ipa: '/ɪnˈseɪn.li/', pos: 'adverb', difficulty: 'advanced', meaning: 'một cách điên rồ, cực kỳ', example: 'The tickets were insanely expensive.', familyId: 'insane', familyOrder: 2 },
  { topic: 'psychology', word: 'insanity', ipa: '/ɪnˈsæn.ə.ti/', pos: 'noun', difficulty: 'advanced', meaning: 'sự điên rồ, mất trí', example: 'Repeating the same mistake and expecting change is insanity.', familyId: 'insane', familyOrder: 3 },
  { topic: 'psychology', word: 'notice', ipa: '/ˈnoʊ.tɪs/', pos: 'verb', difficulty: 'intermediate', meaning: 'để ý, nhận thấy', example: 'Did you notice the change in his behavior?', familyId: 'notice', familyOrder: 1 },
  { topic: 'psychology', word: 'noticeable', ipa: '/ˈnoʊ.tɪ.sə.bəl/', pos: 'adjective', difficulty: 'intermediate', meaning: 'dễ nhận thấy', example: 'There was a noticeable improvement in her grades.', familyId: 'notice', familyOrder: 2 },
  { topic: 'psychology', word: 'noticeably', ipa: '/ˈnoʊ.tɪ.sə.bli/', pos: 'adverb', difficulty: 'advanced', meaning: 'một cách rõ rệt', example: 'The room grew noticeably colder at night.', familyId: 'notice', familyOrder: 3 },
  { topic: 'psychology', word: 'unnoticed', ipa: '/ʌnˈnoʊ.tɪst/', pos: 'adjective', difficulty: 'advanced', meaning: 'không bị chú ý, không ai để ý', example: 'His effort went completely unnoticed.', familyId: 'notice', familyOrder: 4 },

  // ---- daily-life: world, empty, whole, plenty, rare, large, near ----
  { topic: 'daily-life', word: 'world', ipa: '/wɝːld/', pos: 'noun', difficulty: 'beginner', meaning: 'thế giới', example: 'She dreams of traveling around the world.', familyId: 'world', familyOrder: 1 },
  { topic: 'daily-life', word: 'worldwide', ipa: '/ˌwɝːldˈwaɪd/', pos: 'adjective', difficulty: 'intermediate', meaning: 'toàn cầu, khắp thế giới', example: 'The company has a worldwide network of offices.', familyId: 'world', familyOrder: 2 },
  { topic: 'daily-life', word: 'empty', ipa: '/ˈemp.ti/', pos: 'adjective', difficulty: 'beginner', meaning: 'trống rỗng', example: 'The fridge was completely empty this morning.', familyId: 'empty', familyOrder: 1 },
  { topic: 'daily-life', word: 'emptiness', ipa: '/ˈemp.ti.nəs/', pos: 'noun', difficulty: 'advanced', meaning: 'sự trống rỗng', example: 'He felt a deep emptiness after the trip ended.', familyId: 'empty', familyOrder: 2 },
  { topic: 'daily-life', word: 'whole', ipa: '/hoʊl/', pos: 'adjective', difficulty: 'beginner', meaning: 'toàn bộ, nguyên vẹn', example: 'She ate the whole pizza by herself.', familyId: '', familyOrder: null },
  { topic: 'daily-life', word: 'plenty', ipa: '/ˈplen.ti/', pos: 'pronoun', difficulty: 'intermediate', meaning: 'nhiều, dư dả', example: 'There is plenty of food for everyone.', familyId: 'plenty', familyOrder: 1 },
  { topic: 'daily-life', word: 'plentiful', ipa: '/ˈplen.tɪ.fəl/', pos: 'adjective', difficulty: 'advanced', meaning: 'dồi dào, phong phú', example: 'Fresh vegetables are plentiful in summer.', familyId: 'plenty', familyOrder: 2 },
  { topic: 'daily-life', word: 'rare', ipa: '/rer/', pos: 'adjective', difficulty: 'intermediate', meaning: 'hiếm, hiếm có', example: 'It is rare to see snow in this region.', familyId: 'rare', familyOrder: 1 },
  { topic: 'daily-life', word: 'rarely', ipa: '/ˈrer.li/', pos: 'adverb', difficulty: 'intermediate', meaning: 'hiếm khi', example: 'He rarely watches television on weekdays.', familyId: 'rare', familyOrder: 2 },
  { topic: 'daily-life', word: 'rarity', ipa: '/ˈrer.ə.ti/', pos: 'noun', difficulty: 'advanced', meaning: 'sự hiếm có, vật hiếm', example: 'A snowfall here is a real rarity.', familyId: 'rare', familyOrder: 3 },
  { topic: 'daily-life', word: 'large', ipa: '/lɑːrdʒ/', pos: 'adjective', difficulty: 'beginner', meaning: 'lớn, rộng', example: 'They live in a large house near the park.', familyId: 'large', familyOrder: 1 },
  { topic: 'daily-life', word: 'largely', ipa: '/ˈlɑːrdʒ.li/', pos: 'adverb', difficulty: 'intermediate', meaning: 'phần lớn, chủ yếu', example: 'The project was largely successful.', familyId: 'large', familyOrder: 2 },
  { topic: 'daily-life', word: 'near', ipa: '/nɪr/', pos: 'preposition', difficulty: 'beginner', meaning: 'gần', example: 'The bus stop is near my house.', familyId: 'near', familyOrder: 1 },
  { topic: 'daily-life', word: 'nearly', ipa: '/ˈnɪr.li/', pos: 'adverb', difficulty: 'intermediate', meaning: 'gần như, suýt', example: 'We have nearly finished the report.', familyId: 'near', familyOrder: 2 },
  { topic: 'daily-life', word: 'nearby', ipa: '/ˌnɪrˈbaɪ/', pos: 'adjective', difficulty: 'intermediate', meaning: 'gần đó, lân cận', example: 'There is a nice cafe in a nearby street.', familyId: 'near', familyOrder: 3 },

  // ---- sports: squat, chase ----
  { topic: 'sports', word: 'squat', ipa: '/skwɑːt/', pos: 'noun', difficulty: 'intermediate', meaning: 'động tác ngồi xổm (squat)', example: 'Add squats to your workout to build leg strength.', familyId: '', familyOrder: null },
  { topic: 'sports', word: 'chase', ipa: '/tʃeɪs/', pos: 'verb', difficulty: 'intermediate', meaning: 'đuổi theo, rượt', example: 'The dog loves to chase the ball in the park.', familyId: '', familyOrder: null },

  // ---- employment: career ----
  { topic: 'employment', word: 'career', ipa: '/kəˈrɪr/', pos: 'noun', difficulty: 'intermediate', meaning: 'sự nghiệp', example: 'She has built a successful career in marketing.', familyId: '', familyOrder: null },

  // ---- economy: employ family (root đã có) + unemploy cluster ----
  { topic: 'economy', word: 'employ', patch: true, familyId: 'employ', familyOrder: 1 },
  { topic: 'economy', word: 'employment', patch: true, familyId: 'employ', familyOrder: 2 },
  { topic: 'economy', word: 'employable', ipa: '/ɪmˈplɔɪ.ə.bəl/', pos: 'adjective', difficulty: 'advanced', meaning: 'có thể tuyển dụng, đủ khả năng làm việc', example: 'New skills make graduates more employable.', familyId: 'employ', familyOrder: 3 },
  { topic: 'economy', word: 'unemployed', ipa: '/ˌʌn.ɪmˈplɔɪd/', pos: 'adjective', difficulty: 'intermediate', meaning: 'thất nghiệp', example: 'He has been unemployed since the factory closed.', familyId: 'employ', familyOrder: 4 },
  { topic: 'economy', word: 'unemployable', ipa: '/ˌʌn.ɪmˈplɔɪ.ə.bəl/', pos: 'adjective', difficulty: 'advanced', meaning: 'không thể tuyển dụng được', example: 'Without basic training, some applicants are considered unemployable.', familyId: 'employ', familyOrder: 5 },

  // ---- business: counter ----
  { topic: 'business', word: 'counter', ipa: '/ˈkaʊn.tər/', pos: 'noun', difficulty: 'intermediate', meaning: 'quầy (thu ngân, phục vụ)', example: 'Please pay for your items at the counter.', familyId: '', familyOrder: null }
];
