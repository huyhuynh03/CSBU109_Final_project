const fs = require('fs');
const path = require('path');

const topicId = 'communication-social';
const topicName = 'Communication & Society';

const entries = [
  ['communication', '/kəˌmjuː.nɪˈkeɪ.ʃən/', 'noun', 'sự giao tiếp, truyền đạt', 'Good communication helps people understand each other clearly.', '', 'communication-basics', 1],
  ['conversation', '/ˌkɒn.vəˈseɪ.ʃən/', 'noun', 'cuộc trò chuyện', 'We had a friendly conversation after class.', '', 'communication-basics', 2],
  ['discussion', '/dɪˈskʌʃ.ən/', 'noun', 'cuộc thảo luận', 'The discussion focused on community problems.', '', 'communication-basics', 3],
  ['dialogue', '/ˈdaɪ.ə.lɒɡ/', 'noun', 'đối thoại', 'Open dialogue can reduce misunderstanding.', '', 'communication-basics', 4],
  ['interaction', '/ˌɪn.təˈræk.ʃən/', 'noun', 'sự tương tác', 'Social interaction is important for mental health.', '', 'communication-basics', 5],
  ['message', '/ˈmes.ɪdʒ/', 'noun', 'tin nhắn, thông điệp', 'She sent me a short message this morning.', '', 'communication-basics', 6],
  ['feedback', '/ˈfiːd.bæk/', 'noun', 'phản hồi, nhận xét', 'The teacher gave helpful feedback on my presentation.', '', 'communication-basics', 7],

  ['greet', '/ɡriːt/', 'verb', 'chào hỏi', 'People usually greet their neighbors politely.', '', 'greetings-introductions', 1],
  ['greeting', '/ˈɡriː.tɪŋ/', 'noun', 'lời chào', 'A warm greeting can make a visitor feel welcome.', '', 'greetings-introductions', 2],
  ['introduce', '/ˌɪn.trəˈdjuːs/', 'verb', 'giới thiệu', 'Let me introduce you to my colleague.', '', 'greetings-introductions', 3],
  ['introduction', '/ˌɪn.trəˈdʌk.ʃən/', 'noun', 'sự giới thiệu, phần giới thiệu', 'His introduction was clear and confident.', '', 'greetings-introductions', 4],
  ['meet', '/miːt/', 'verb', 'gặp gỡ', 'I often meet my friends at the weekend.', '', 'greetings-introductions', 5],
  ['shake hands', '/ʃeɪk hændz/', 'verb phrase', 'bắt tay', 'In many cultures, people shake hands when they meet.', '', 'greetings-introductions', 6],
  ['welcome', '/ˈwel.kəm/', 'verb', 'chào đón', 'The host welcomed everyone with a smile.', '', 'greetings-introductions', 7],
  ['farewell', '/ˌfeəˈwel/', 'noun', 'lời tạm biệt', 'They said farewell before leaving the city.', '', 'greetings-introductions', 8],

  ['ask', '/ɑːsk/', 'verb', 'hỏi, yêu cầu', 'You should ask questions if you do not understand.', '', 'speaking-asking', 1],
  ['answer', '/ˈɑːn.sər/', 'verb', 'trả lời', 'He answered the question honestly.', '', 'speaking-asking', 2],
  ['explain', '/ɪkˈspleɪn/', 'verb', 'giải thích', 'Could you explain the rule again?', '', 'speaking-asking', 3],
  ['clarify', '/ˈklær.ə.faɪ/', 'verb', 'làm rõ', 'The speaker clarified his main point.', '', 'speaking-asking', 4],
  ['mention', '/ˈmen.ʃən/', 'verb', 'đề cập', 'She mentioned a useful website during the meeting.', '', 'speaking-asking', 5],
  ['suggest', '/səˈdʒest/', 'verb', 'gợi ý, đề xuất', 'I suggest meeting earlier to avoid traffic.', '', 'speaking-asking', 6],
  ['request', '/rɪˈkwest/', 'verb', 'yêu cầu, đề nghị', 'Visitors can request more information at the desk.', '', 'speaking-asking', 7],
  ['respond', '/rɪˈspɒnd/', 'verb', 'phản hồi, đáp lại', 'Please respond to the invitation by Friday.', '', 'speaking-asking', 8],

  ['opinion', '/əˈpɪn.jən/', 'noun', 'ý kiến, quan điểm', 'Everyone has the right to express an opinion.', '', 'opinions-agreement', 1],
  ['viewpoint', '/ˈvjuː.pɔɪnt/', 'noun', 'góc nhìn, quan điểm', 'Try to understand the issue from another viewpoint.', '', 'opinions-agreement', 2],
  ['agree', '/əˈɡriː/', 'verb', 'đồng ý', 'I agree with your idea about public transport.', '', 'opinions-agreement', 3],
  ['disagree', '/ˌdɪs.əˈɡriː/', 'verb', 'không đồng ý', 'They disagree about how to solve the problem.', '', 'opinions-agreement', 4],
  ['persuade', '/pəˈsweɪd/', 'verb', 'thuyết phục', 'He tried to persuade his parents to let him volunteer.', '', 'opinions-agreement', 5],
  ['argue', '/ˈɑːɡ.juː/', 'verb', 'tranh luận, cãi nhau', 'People sometimes argue about politics online.', '', 'opinions-agreement', 6],
  ['debate', '/dɪˈbeɪt/', 'noun', 'cuộc tranh luận', 'The debate encouraged students to think critically.', '', 'opinions-agreement', 7],
  ['compromise', '/ˈkɒm.prə.maɪz/', 'noun', 'sự thỏa hiệp', 'A fair compromise satisfied both sides.', '', 'opinions-agreement', 8],

  ['polite', '/pəˈlaɪt/', 'adjective', 'lịch sự', 'It is polite to say thank you after receiving help.', '', 'manners-etiquette', 1],
  ['rude', '/ruːd/', 'adjective', 'thô lỗ, bất lịch sự', 'It is rude to interrupt someone while they are speaking.', '', 'manners-etiquette', 2],
  ['respectful', '/rɪˈspekt.fəl/', 'adjective', 'tôn trọng, lễ phép', 'A respectful attitude makes communication easier.', '', 'manners-etiquette', 3],
  ['manners', '/ˈmæn.əz/', 'noun', 'cách cư xử, phép lịch sự', 'Good manners are valued in every society.', '', 'manners-etiquette', 4],
  ['etiquette', '/ˈet.ɪ.ket/', 'noun', 'nghi thức, phép xã giao', 'Business etiquette differs from country to country.', '', 'manners-etiquette', 5],
  ['apologize', '/əˈpɒl.ə.dʒaɪz/', 'verb', 'xin lỗi', 'You should apologize when you make a mistake.', '', 'manners-etiquette', 6],
  ['thank', '/θæŋk/', 'verb', 'cảm ơn', 'Remember to thank people for their support.', '', 'manners-etiquette', 7],
  ['interrupt', '/ˌɪn.təˈrʌpt/', 'verb', 'ngắt lời, làm gián đoạn', 'Please do not interrupt the speaker.', '', 'manners-etiquette', 8],

  ['relationship', '/rɪˈleɪ.ʃən.ʃɪp/', 'noun', 'mối quan hệ', 'Trust is important in every relationship.', '', 'relationships-network', 1],
  ['friendship', '/ˈfrend.ʃɪp/', 'noun', 'tình bạn', 'Their friendship has lasted for many years.', '', 'relationships-network', 2],
  ['acquaintance', '/əˈkweɪn.təns/', 'noun', 'người quen', 'He is an acquaintance from my language class.', '', 'relationships-network', 3],
  ['colleague', '/ˈkɒl.iːɡ/', 'noun', 'đồng nghiệp', 'My colleague helped me prepare for the meeting.', '', 'relationships-network', 4],
  ['neighbor', '/ˈneɪ.bər/', 'noun', 'hàng xóm', 'Our neighbor often looks after our plants.', '', 'relationships-network', 5],
  ['stranger', '/ˈstreɪn.dʒər/', 'noun', 'người lạ', 'Children should be careful when talking to strangers.', '', 'relationships-network', 6],
  ['network', '/ˈnet.wɜːk/', 'noun', 'mạng lưới quan hệ', 'A strong network can create more opportunities.', '', 'relationships-network', 7],
  ['contact', '/ˈkɒn.tækt/', 'noun', 'liên hệ, mối liên hệ', 'I saved his contact details on my phone.', '', 'relationships-network', 8],

  ['community', '/kəˈmjuː.nə.ti/', 'noun', 'cộng đồng', 'The local community organized a clean-up day.', '', 'community-society', 1],
  ['society', '/səˈsaɪ.ə.ti/', 'noun', 'xã hội', 'Education plays an important role in society.', '', 'community-society', 2],
  ['citizen', '/ˈsɪt.ɪ.zən/', 'noun', 'công dân', 'Every citizen should obey the law.', '', 'community-society', 3],
  ['resident', '/ˈrez.ɪ.dənt/', 'noun', 'cư dân', 'Residents complained about the noise at night.', '', 'community-society', 4],
  ['neighborhood', '/ˈneɪ.bə.hʊd/', 'noun', 'khu phố, vùng lân cận', 'This neighborhood is quiet and safe.', '', 'community-society', 5],
  ['public', '/ˈpʌb.lɪk/', 'adjective', 'công cộng, thuộc công chúng', 'Public spaces should be clean and accessible.', '', 'community-society', 6],
  ['social', '/ˈsəʊ.ʃəl/', 'adjective', 'thuộc xã hội, mang tính xã hội', 'Social problems require cooperation from many groups.', '', 'community-society', 7],
  ['volunteer', '/ˌvɒl.ənˈtɪər/', 'noun', 'tình nguyện viên', 'Many volunteers helped at the charity event.', '', 'community-society', 8],
  ['charity', '/ˈtʃær.ə.ti/', 'noun', 'tổ chức từ thiện, lòng từ thiện', 'The charity supports homeless children.', '', 'community-society', 9],

  ['culture', '/ˈkʌl.tʃər/', 'noun', 'văn hóa', 'Learning a language also means learning its culture.', '', 'culture-diversity', 1],
  ['custom', '/ˈkʌs.təm/', 'noun', 'phong tục', 'It is a local custom to bring a small gift.', '', 'culture-diversity', 2],
  ['tradition', '/trəˈdɪʃ.ən/', 'noun', 'truyền thống', 'Family meals are an important tradition in many countries.', '', 'culture-diversity', 3],
  ['belief', '/bɪˈliːf/', 'noun', 'niềm tin, tín ngưỡng', 'People should respect different beliefs.', '', 'culture-diversity', 4],
  ['value', '/ˈvæl.juː/', 'noun', 'giá trị', 'Honesty is a value that many societies share.', '', 'culture-diversity', 5],
  ['diversity', '/daɪˈvɜː.sə.ti/', 'noun', 'sự đa dạng', 'Cultural diversity makes a city more interesting.', '', 'culture-diversity', 6],
  ['identity', '/aɪˈden.tə.ti/', 'noun', 'bản sắc, danh tính', 'Language is part of a person’s identity.', '', 'culture-diversity', 7],
  ['minority', '/maɪˈnɒr.ə.ti/', 'noun', 'nhóm thiểu số', 'Minority groups should have equal rights.', '', 'culture-diversity', 8],

  ['cooperate', '/kəʊˈɒp.ər.eɪt/', 'verb', 'hợp tác', 'The two teams cooperated to finish the project.', '', 'cooperation-conflict', 1],
  ['cooperation', '/kəʊˌɒp.ərˈeɪ.ʃən/', 'noun', 'sự hợp tác', 'International cooperation is needed to solve climate change.', '', 'cooperation-conflict', 2],
  ['support', '/səˈpɔːt/', 'verb', 'ủng hộ, hỗ trợ', 'Friends should support each other in difficult times.', '', 'cooperation-conflict', 3],
  ['teamwork', '/ˈtiːm.wɜːk/', 'noun', 'làm việc nhóm, tinh thần đồng đội', 'Teamwork helped us complete the task quickly.', '', 'cooperation-conflict', 4],
  ['conflict', '/ˈkɒn.flɪkt/', 'noun', 'xung đột, mâu thuẫn', 'Poor communication can lead to conflict.', '', 'cooperation-conflict', 5],
  ['tension', '/ˈten.ʃən/', 'noun', 'sự căng thẳng', 'There was tension between the two communities.', '', 'cooperation-conflict', 6],
  ['solve', '/sɒlv/', 'verb', 'giải quyết', 'They worked together to solve the problem.', '', 'cooperation-conflict', 7],
  ['reconcile', '/ˈrek.ən.saɪl/', 'verb', 'hòa giải, làm hòa', 'The leader tried to reconcile the two sides.', '', 'cooperation-conflict', 8],

  ['invite', '/ɪnˈvaɪt/', 'verb', 'mời', 'They invited us to a community dinner.', '', 'events-meetings', 1],
  ['invitation', '/ˌɪn.vɪˈteɪ.ʃən/', 'noun', 'lời mời', 'I received an invitation to the workshop.', '', 'events-meetings', 2],
  ['attend', '/əˈtend/', 'verb', 'tham dự', 'More than a hundred people attended the meeting.', '', 'events-meetings', 3],
  ['gather', '/ˈɡæð.ər/', 'verb', 'tụ họp, tập hợp', 'People gathered in the park for the festival.', '', 'events-meetings', 4],
  ['meeting', '/ˈmiː.tɪŋ/', 'noun', 'cuộc họp, buổi gặp mặt', 'The meeting lasted for two hours.', '', 'events-meetings', 5],
  ['event', '/ɪˈvent/', 'noun', 'sự kiện', 'The event attracted many young people.', '', 'events-meetings', 6],
  ['ceremony', '/ˈser.ə.mə.ni/', 'noun', 'buổi lễ, nghi lễ', 'The ceremony began with a short speech.', '', 'events-meetings', 7],
  ['celebration', '/ˌsel.əˈbreɪ.ʃən/', 'noun', 'lễ kỷ niệm, sự ăn mừng', 'The celebration brought the whole community together.', '', 'events-meetings', 8],

  ['media', '/ˈmiː.di.ə/', 'noun', 'truyền thông, phương tiện truyền thông', 'The media reported the story widely.', '', 'media-digital-social', 1],
  ['social media', '/ˌsəʊ.ʃəl ˈmiː.di.ə/', 'noun', 'mạng xã hội', 'Social media changes how people communicate.', '', 'media-digital-social', 2],
  ['post', '/pəʊst/', 'verb', 'đăng bài', 'She posted a photo from the volunteer trip.', '', 'media-digital-social', 3],
  ['comment', '/ˈkɒm.ent/', 'noun', 'bình luận', 'His comment started a long discussion online.', '', 'media-digital-social', 4],
  ['share', '/ʃeər/', 'verb', 'chia sẻ', 'People share news quickly on social media.', '', 'media-digital-social', 5],
  ['privacy', '/ˈprɪv.ə.si/', 'noun', 'sự riêng tư, quyền riêng tư', 'Online privacy is a serious concern today.', '', 'media-digital-social', 6],
  ['rumor', '/ˈruː.mər/', 'noun', 'tin đồn', 'A rumor can spread very fast online.', '', 'media-digital-social', 7],
  ['misinformation', '/ˌmɪs.ɪn.fəˈmeɪ.ʃən/', 'noun', 'thông tin sai lệch', 'Misinformation can damage public trust.', '', 'media-digital-social', 8],

  ['law', '/lɔː/', 'noun', 'luật pháp', 'The law protects citizens from discrimination.', '', 'rights-responsibilities', 1],
  ['rule', '/ruːl/', 'noun', 'quy tắc, luật lệ', 'Every club has rules that members must follow.', '', 'rights-responsibilities', 2],
  ['right', '/raɪt/', 'noun', 'quyền lợi, quyền', 'Freedom of speech is an important right.', '', 'rights-responsibilities', 3],
  ['responsibility', '/rɪˌspɒn.səˈbɪl.ə.ti/', 'noun', 'trách nhiệm', 'It is our responsibility to keep public places clean.', '', 'rights-responsibilities', 4],
  ['duty', '/ˈdjuː.ti/', 'noun', 'bổn phận, nhiệm vụ', 'Jury service is a civic duty in some countries.', '', 'rights-responsibilities', 5],
  ['freedom', '/ˈfriː.dəm/', 'noun', 'sự tự do', 'People value freedom of expression.', '', 'rights-responsibilities', 6],
  ['equality', '/iˈkwɒl.ə.ti/', 'noun', 'sự bình đẳng', 'The campaign promotes equality in education.', '', 'rights-responsibilities', 7],
  ['fairness', '/ˈfeə.nəs/', 'noun', 'sự công bằng', 'Fairness is essential in a healthy society.', '', 'rights-responsibilities', 8],

  ['trust', '/trʌst/', 'noun', 'sự tin tưởng', 'Trust is built through honesty and respect.', '', 'social-values', 1],
  ['honesty', '/ˈɒn.ə.sti/', 'noun', 'sự trung thực', 'Honesty is important in public life.', '', 'social-values', 2],
  ['loyalty', '/ˈlɔɪ.əl.ti/', 'noun', 'lòng trung thành', 'Loyalty is valued in close friendships.', '', 'social-values', 3],
  ['empathy', '/ˈem.pə.θi/', 'noun', 'sự đồng cảm', 'Empathy helps us understand other people’s feelings.', '', 'social-values', 4],
  ['tolerance', '/ˈtɒl.ər.əns/', 'noun', 'sự khoan dung', 'Tolerance allows people with different views to live together.', '', 'social-values', 5],
  ['kindness', '/ˈkaɪnd.nəs/', 'noun', 'lòng tốt, sự tử tế', 'Small acts of kindness can improve society.', '', 'social-values', 6],
  ['solidarity', '/ˌsɒl.ɪˈdær.ə.ti/', 'noun', 'sự đoàn kết', 'The crisis created a strong sense of solidarity.', '', 'social-values', 7],

  ['poverty', '/ˈpɒv.ə.ti/', 'noun', 'sự nghèo đói', 'Poverty remains a serious social issue.', '', 'social-issues', 1],
  ['homelessness', '/ˈhəʊm.ləs.nəs/', 'noun', 'tình trạng vô gia cư', 'Homelessness has increased in many large cities.', '', 'social-issues', 2],
  ['discrimination', '/dɪˌskrɪm.ɪˈneɪ.ʃən/', 'noun', 'sự phân biệt đối xử', 'Discrimination can harm people’s opportunities.', '', 'social-issues', 3],
  ['inequality', '/ˌɪn.ɪˈkwɒl.ə.ti/', 'noun', 'sự bất bình đẳng', 'Income inequality is a topic of public debate.', '', 'social-issues', 4],
  ['crime', '/kraɪm/', 'noun', 'tội phạm', 'The city has introduced measures to reduce crime.', '', 'social-issues', 5],
  ['violence', '/ˈvaɪə.ləns/', 'noun', 'bạo lực', 'Schools should teach students to reject violence.', '', 'social-issues', 6],
  ['isolation', '/ˌaɪ.səlˈeɪ.ʃən/', 'noun', 'sự cô lập', 'Social isolation can affect older people deeply.', '', 'social-issues', 7],
  ['pressure', '/ˈpreʃ.ər/', 'noun', 'áp lực', 'Young people often face pressure from social media.', '', 'social-issues', 8]
];

const advancedWords = new Set([
  'dialogue', 'interaction', 'clarify', 'viewpoint', 'persuade', 'compromise',
  'etiquette', 'acquaintance', 'diversity', 'identity', 'minority', 'cooperation',
  'reconcile', 'misinformation', 'responsibility', 'equality', 'fairness',
  'empathy', 'tolerance', 'solidarity', 'homelessness', 'discrimination',
  'inequality', 'isolation'
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
    source: 'Curated IELTS Vocabulary - Communication & Society (B1-B2)',
    totalCards: cards.length,
    totalFamilies: new Set(cards.map(c => c.fieldValues.familyId)).size,
    generatedAt: '2026-05-06',
    note: 'Tu vung chu de Giao tiep va Xa hoi, gom theo family ve giao tiep co ban, chao hoi, hoi dap, y kien, phep lich su, quan he, cong dong, van hoa, hop tac, su kien, truyen thong, quyen trach nhiem, gia tri xa hoi va van de xa hoi.'
  },
  cards
};

for (const dir of ['data/seed-vocabulary', 'public/seed-vocabulary']) {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'communication-social.json'), JSON.stringify(seed, null, 2) + '\n', 'utf8');
}

console.log(`Generated ${cards.length} cards, ${seed._meta.totalFamilies} families for ${topicId}`);
