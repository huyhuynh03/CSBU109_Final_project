// ============================================================================
// new-words-batch2-b.js — Phần B: dữ liệu batch 2 (am)  [B]
// Các topic: space, biology, environment-climate, psychology, crime,
//            education, politics, economy, personal-qualities,
//            urbanization, science
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
  // ── SPACE ──────────────────────────────────────────────
  { topic: 'space', word: 'planet', patch: true, familyId: 'planet', familyOrder: 1 },
  { topic: 'space', word: 'planetary', ipa: '/ˈplæn.ə.ter.i/', pos: 'adjective', difficulty: 'advanced', meaning: 'thuộc hành tinh, thiên thể', example: 'The search for planetary systems beyond our own continues.', familyId: 'planet', familyOrder: 2 },

  // ── BIOLOGY ────────────────────────────────────────────
  { topic: 'biology', word: 'rodent', ipa: '/ˈroʊ.dənt/', pos: 'noun', difficulty: 'intermediate', meaning: 'gặm nhấm', example: 'Mice and squirrels are both types of rodents.', familyId: '', familyOrder: null },
  { topic: 'biology', word: 'predator', patch: true, familyId: 'predator', familyOrder: 1 },
  { topic: 'biology', word: 'predatory', ipa: '/ˈpred.ə.tɔːr.i/', pos: 'adjective', difficulty: 'advanced', meaning: 'săn mồi, có tính săn mồi; bóc lột', example: 'Lions and tigers are large predatory animals.', familyId: 'predator', familyOrder: 2 },
  { topic: 'biology', word: 'predation', ipa: '/prɪˈdeɪ.ʃən/', pos: 'noun', difficulty: 'advanced', meaning: 'sự săn bắt, hành vi săn mồi', example: 'Predation is a key factor in controlling prey populations.', familyId: 'predator', familyOrder: 3 },
  { topic: 'biology', word: 'breeding', ipa: '/ˈbriː.dɪŋ/', pos: 'noun', difficulty: 'intermediate', meaning: 'sự sinh sản, chăn nuôi', example: 'The zoo runs a breeding program for endangered species.', familyId: '', familyOrder: null, note: 'Dạng V-ing của breed (động từ bất quy tắc) — không tạo family riêng' },
  { topic: 'biology', word: 'invade', ipa: '/ɪnˈveɪd/', pos: 'verb', difficulty: 'intermediate', meaning: 'xâm lược, xâm nhập', example: 'Invasive species can invade new territories rapidly.', familyId: 'invade', familyOrder: 1 },
  { topic: 'biology', word: 'invasive', ipa: '/ɪnˈveɪ.sɪv/', pos: 'adjective', difficulty: 'advanced', meaning: 'xâm lấn, xâm nhập; xâm lấn (y khoa)', example: 'The removal of invasive species protects native habitats.', familyId: 'invade', familyOrder: 2 },
  { topic: 'biology', word: 'invasion', ipa: '/ɪnˈveɪ.ʒən/', pos: 'noun', difficulty: 'intermediate', meaning: 'cuộc xâm lược, sự xâm nhập', example: 'The insect invasion destroyed the local crops.', familyId: 'invade', familyOrder: 3 },
  { topic: 'biology', word: 'dominate', ipa: '/ˈdɑː.mɪ.neɪt/', pos: 'verb', difficulty: 'intermediate', meaning: 'chi phối, thống trị', example: 'One species tends to dominate in this environment.', familyId: 'dominate', familyOrder: 1 },
  { topic: 'biology', word: 'dominant', ipa: '/ˈdɑː.mɪ.nənt/', pos: 'adjective', difficulty: 'intermediate', meaning: 'chiếm ưu thế, trội', example: 'The dominant species in the forest is the oak tree.', familyId: 'dominate', familyOrder: 2 },
  { topic: 'biology', word: 'domination', ipa: '/ˌdɑː.mɪˈneɪ.ʃən/', pos: 'noun', difficulty: 'advanced', meaning: 'sự thống trị, chi phối', example: 'The company\'s domination of the market lasted for decades.', familyId: 'dominate', familyOrder: 3 },
  { topic: 'biology', word: 'poison', ipa: '/ˈpɔɪ.zən/', pos: 'noun', difficulty: 'intermediate', meaning: 'chất độc', example: 'Some mushrooms contain a deadly poison.', familyId: 'poison', familyOrder: 1 },
  { topic: 'biology', word: 'poisonous', ipa: '/ˈpɔɪ.zə.nəs/', pos: 'adjective', difficulty: 'intermediate', meaning: 'có độc, gây độc', example: 'The snake\'s venom is extremely poisonous.', familyId: 'poison', familyOrder: 2 },

  // ── ENVIRONMENT-CLIMATE ────────────────────────────────
  { topic: 'environment-climate', word: 'fog', ipa: '/fɑːɡ/', pos: 'noun', difficulty: 'intermediate', meaning: 'sương mù', example: 'Heavy fog made it difficult to see the road.', familyId: 'fog', familyOrder: 1 },
  { topic: 'environment-climate', word: 'foggy', ipa: '/ˈfɑː.ɡi/', pos: 'adjective', difficulty: 'intermediate', meaning: 'có sương mù, mù mờ', example: 'It was a cold and foggy winter morning.', familyId: 'fog', familyOrder: 2 },
  { topic: 'environment-climate', word: 'vegetation', ipa: '/ˌvedʒ.əˈteɪ.ʃən/', pos: 'noun', difficulty: 'intermediate', meaning: 'thảm thực vật, thực vật', example: 'The hillside was covered with thick vegetation.', familyId: '', familyOrder: null },
  { topic: 'environment-climate', word: 'vulnerable', ipa: '/ˈvʌl.nər.ə.bəl/', pos: 'adjective', difficulty: 'intermediate', meaning: 'dễ bị tổn thương, yếu thế', example: 'Children are particularly vulnerable to air pollution.', familyId: 'vulnerable', familyOrder: 1 },
  { topic: 'environment-climate', word: 'vulnerability', ipa: '/ˌvʌl.nər.əˈbɪl.ə.ti/', pos: 'noun', difficulty: 'advanced', meaning: 'sự dễ bị tổn thương', example: 'Scientists are studying the vulnerability of coral reefs.', familyId: 'vulnerable', familyOrder: 2 },
  { topic: 'environment-climate', word: 'destroy', ipa: '/dɪˈstrɔɪ/', pos: 'verb', difficulty: 'intermediate', meaning: 'phá hủy, tàn phá', example: 'The earthquake destroyed many buildings in the city.', familyId: 'destroy', familyOrder: 1 },
  { topic: 'environment-climate', word: 'destructive', ipa: '/dɪˈstrʌk.tɪv/', pos: 'adjective', difficulty: 'advanced', meaning: 'gây phá hủy, tàn phá', example: 'The hurricane had a destructive effect on the coastline.', familyId: 'destroy', familyOrder: 2 },
  { topic: 'environment-climate', word: 'destruction', ipa: '/dɪˈstrʌk.ʃən/', pos: 'noun', difficulty: 'intermediate', meaning: 'sự phá hủy, sự tàn phá', example: 'The destruction of the rainforest affects global weather.', familyId: 'destroy', familyOrder: 3 },

  // ── PSYCHOLOGY ─────────────────────────────────────────
  { topic: 'psychology', word: 'consciousness', patch: true, familyId: 'conscious', familyOrder: 2 },
  { topic: 'psychology', word: 'conscious', ipa: '/ˈkɑːn.ʃəs/', pos: 'adjective', difficulty: 'intermediate', meaning: 'có ý thức, tỉnh táo', example: 'She was conscious of someone watching her.', familyId: 'conscious', familyOrder: 1 },
  { topic: 'psychology', word: 'resilience', ipa: '/rɪˈzɪl.i.əns/', pos: 'noun', difficulty: 'advanced', meaning: 'sự kiên cường, khả năng phục hồi', example: 'Children often show remarkable resilience after difficult experiences.', familyId: '', familyOrder: null },

  // ── CRIME ──────────────────────────────────────────────
  { topic: 'crime', word: 'seize', ipa: '/siːz/', pos: 'verb', difficulty: 'intermediate', meaning: 'tịch thu, chiếm giữ', example: 'Police seized a large amount of illegal drugs.', familyId: 'seize', familyOrder: 1 },
  { topic: 'crime', word: 'seizure', ipa: '/ˈsiː.ʒər/', pos: 'noun', difficulty: 'advanced', meaning: 'sự tịch thu, sự bắt giữ; cơn co giật', example: 'The seizure of the weapons prevented a major attack.', familyId: 'seize', familyOrder: 2 },

  // ── EDUCATION ──────────────────────────────────────────
  { topic: 'education', word: 'include', ipa: '/ɪnˈkluːd/', pos: 'verb', difficulty: 'intermediate', meaning: 'bao gồm', example: 'The course will include practical exercises.', familyId: 'include', familyOrder: 1 },
  { topic: 'education', word: 'inclusive', ipa: '/ɪnˈkluː.sɪv/', pos: 'adjective', difficulty: 'advanced', meaning: 'bao gồm tất cả, hòa nhập', example: 'The school promotes an inclusive learning environment.', familyId: 'include', familyOrder: 2 },
  { topic: 'education', word: 'inclusion', ipa: '/ɪnˈkluː.ʒən/', pos: 'noun', difficulty: 'advanced', meaning: 'sự bao gồm, tính hòa nhập', example: 'The inclusion of all students is important in modern education.', familyId: 'include', familyOrder: 3 },
  { topic: 'education', word: 'essential', ipa: '/ɪˈsen.ʃəl/', pos: 'adjective', difficulty: 'intermediate', meaning: 'cần thiết, thiết yếu', example: 'Reading is an essential skill for every student.', familyId: '', familyOrder: null },

  // ── POLITICS ───────────────────────────────────────────
  { topic: 'politics', word: 'scheme', ipa: '/skiːm/', pos: 'noun', difficulty: 'intermediate', meaning: 'kế hoạch, âm mưu, dự án', example: 'The government announced a new housing scheme.', familyId: '', familyOrder: null },
  { topic: 'politics', word: 'intervene', ipa: '/ˌɪn.tərˈviːn/', pos: 'verb', difficulty: 'advanced', meaning: 'can thiệp', example: 'The president had to intervene to end the dispute.', familyId: 'intervene', familyOrder: 1 },
  { topic: 'politics', word: 'intervention', ipa: '/ˌɪn.tərˈven.ʃən/', pos: 'noun', difficulty: 'advanced', meaning: 'sự can thiệp', example: 'Foreign intervention can escalate the conflict further.', familyId: 'intervene', familyOrder: 2 },

  // ── ECONOMY ────────────────────────────────────────────
  { topic: 'economy', word: 'produce', patch: true, familyId: 'produce', familyOrder: 1 },
  { topic: 'economy', word: 'production', patch: true, familyId: 'produce', familyOrder: 2 },
  { topic: 'economy', word: 'productive', ipa: '/prəˈdʌk.tɪv/', pos: 'adjective', difficulty: 'intermediate', meaning: 'hiệu quả, năng suất cao', example: 'The meeting was short but very productive.', familyId: 'produce', familyOrder: 3 },
  { topic: 'economy', word: 'productivity', ipa: '/ˌproʊ.dʌkˈtɪv.ə.ti/', pos: 'noun', difficulty: 'advanced', meaning: 'năng suất', example: 'Investing in training improves workplace productivity.', familyId: 'produce', familyOrder: 4 },

  // ── PERSONAL-QUALITIES ─────────────────────────────────
  { topic: 'personal-qualities', word: 'caution', ipa: '/ˈkɔː.ʃən/', pos: 'noun', difficulty: 'intermediate', meaning: 'sự thận trọng, sự cẩn thận', example: 'The driver approached the icy road with caution.', familyId: 'caution', familyOrder: 1 },
  { topic: 'personal-qualities', word: 'cautious', patch: true, familyId: 'caution', familyOrder: 2 },
  { topic: 'personal-qualities', word: 'virtue', ipa: '/ˈvɝː.tʃuː/', pos: 'noun', difficulty: 'advanced', meaning: 'đức hạnh, đức tính', example: 'Patience is considered a great virtue.', familyId: '', familyOrder: null },
  { topic: 'personal-qualities', word: 'effort', ipa: '/ˈef.ərt/', pos: 'noun', difficulty: 'intermediate', meaning: 'nỗ lực, cố gắng', example: 'She made a great effort to finish the project on time.', familyId: '', familyOrder: null },
  { topic: 'personal-qualities', word: 'unshakable', ipa: '/ʌnˈʃeɪ.kə.bəl/', pos: 'adjective', difficulty: 'advanced', meaning: 'không thể lay chuyển', example: 'He has an unshakable belief in his dream.', familyId: '', familyOrder: null, note: 'Không patch vào irregular verb shake — prefix un- quá dài để LCP đủ' },

  // ── URBANIZATION ───────────────────────────────────────
  { topic: 'urbanization', word: 'dense', ipa: '/dens/', pos: 'adjective', difficulty: 'intermediate', meaning: 'đậm đặc, đông đúc', example: 'The city has a dense population in the downtown area.', familyId: 'dense', familyOrder: 1 },
  { topic: 'urbanization', word: 'access', ipa: '/ˈæk.ses/', pos: 'noun', difficulty: 'intermediate', meaning: 'quyền truy cập, sự tiếp cận', example: 'Access to clean water is a basic human right.', familyId: 'access', familyOrder: 1 },
  { topic: 'urbanization', word: 'accessible', ipa: '/əkˈses.ə.bəl/', pos: 'adjective', difficulty: 'intermediate', meaning: 'dễ tiếp cận, dễ truy cập', example: 'The new building is fully accessible for wheelchair users.', familyId: 'access', familyOrder: 2 },
  { topic: 'urbanization', word: 'accessibility', ipa: '/əkˌses.əˈbɪl.ə.ti/', pos: 'noun', difficulty: 'advanced', meaning: 'tính dễ tiếp cận', example: 'Accessibility for disabled passengers is a priority at the airport.', familyId: 'access', familyOrder: 3 },

  // ── SCIENCE ────────────────────────────────────────────
  { topic: 'science', word: 'mechanism', ipa: '/ˈmek.ə.nɪ.zəm/', pos: 'noun', difficulty: 'intermediate', meaning: 'cơ chế, cơ cấu', example: 'Scientists studied the mechanism behind the chemical reaction.', familyId: 'mechanism', familyOrder: 1 },
  { topic: 'science', word: 'mechanical', ipa: '/məˈkæn.ɪ.kəl/', pos: 'adjective', difficulty: 'intermediate', meaning: 'thuộc cơ khí, cơ học', example: 'The clock uses a mechanical system with gears and springs.', familyId: 'mechanism', familyOrder: 2 },
  { topic: 'science', word: 'mechanically', ipa: '/məˈkæn.ɪ.kli/', pos: 'adverb', difficulty: 'advanced', meaning: 'một cách cơ học', example: 'He responded almost mechanically to the routine question.', familyId: 'mechanism', familyOrder: 3 },
  { topic: 'science', word: 'calibrate', ipa: '/ˈkæl.ɪ.breɪt/', pos: 'verb', difficulty: 'advanced', meaning: 'hiệu chuẩn, căn chỉnh', example: 'The technician will calibrate the instrument before use.', familyId: 'calibrate', familyOrder: 1 },
  { topic: 'science', word: 'calibration', ipa: '/ˌkæl.ɪˈbreɪ.ʃən/', pos: 'noun', difficulty: 'advanced', meaning: 'sự hiệu chuẩn', example: 'Regular calibration ensures the equipment remains accurate.', familyId: 'calibrate', familyOrder: 2 },
  { topic: 'science', word: 'occur', ipa: '/əˈkɝː/', pos: 'verb', difficulty: 'intermediate', meaning: 'xảy ra, có mặt', example: 'Natural disasters can occur without warning.', familyId: 'occur', familyOrder: 1 },
  { topic: 'science', word: 'occurrence', ipa: '/əˈkɝː.əns/', pos: 'noun', difficulty: 'advanced', meaning: 'sự việc xảy ra, hiện tượng', example: 'The occurrence of earthquakes is common in this region.', familyId: 'occur', familyOrder: 2 },
  { topic: 'science', word: 'drift', ipa: '/drɪft/', pos: 'noun', difficulty: 'intermediate', meaning: 'sự trôi dạt, sự sai lệch', example: 'The boat began to drift with the current.', familyId: '', familyOrder: null },
  { topic: 'science', word: 'external', ipa: '/ɪkˈstɝː.nəl/', pos: 'adjective', difficulty: 'intermediate', meaning: 'bên ngoài', example: 'The temperature sensor detects external heat sources.', familyId: 'external', familyOrder: 1 },
  { topic: 'science', word: 'externally', ipa: '/ɪkˈstɝː.nəl.i/', pos: 'adverb', difficulty: 'advanced', meaning: 'ở bên ngoài', example: 'The device is powered by an externally mounted solar panel.', familyId: 'external', familyOrder: 2 },
  { topic: 'science', word: 'combine', ipa: '/kəmˈbaɪn/', pos: 'verb', difficulty: 'intermediate', meaning: 'kết hợp, hòa trộn', example: 'The experiment combines two chemicals at high temperature.', familyId: 'combine', familyOrder: 1 },
  { topic: 'science', word: 'combination', ipa: '/ˌkɑːm.bɪˈneɪ.ʃən/', pos: 'noun', difficulty: 'intermediate', meaning: 'sự kết hợp, tổ hợp', example: 'A combination of heat and pressure transforms the rock.', familyId: 'combine', familyOrder: 2 },
  { topic: 'science', word: 'settling', ipa: '/ˈset.əl.ɪŋ/', pos: 'noun', difficulty: 'advanced', meaning: 'sự lắng đọng, sự lắng xuống', example: 'The settling of dust particles affected the lab results.', familyId: '', familyOrder: null, note: 'Dạng V-ing của settle — từ đơn lẻ, không tạo family' },
];