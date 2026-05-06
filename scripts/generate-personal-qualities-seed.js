const fs = require('fs');
const path = require('path');

const topicId = 'personal-qualities';
const topicName = 'Personal Qualities';

const entries = [
  ['good', '/ɡʊd/', 'adjective', 'tốt, hay, giỏi', 'A good person tries to help others when possible.', 'Included here as a normal personal quality; the irregular-comparison seed may also contain good as a comparison base.', 'general-positive', 1],
  ['well', '/wel/', 'adverb', 'tốt, giỏi, ổn', 'She works well with different kinds of people.', 'Included with good because good/well share the irregular comparison forms better and best.', 'general-positive', 2],
  ['nice', '/naɪs/', 'adjective', 'tốt bụng, dễ chịu', 'He is a nice person who always smiles.', '', 'general-positive', 3],
  ['kind', '/kaɪnd/', 'adjective', 'tử tế, tốt bụng', 'A kind neighbor helped the old man carry his bags.', '', 'general-positive', 4],
  ['friendly', '/ˈfrend.li/', 'adjective', 'thân thiện', 'The receptionist was friendly and helpful.', '', 'general-positive', 5],
  ['pleasant', '/ˈplez.ənt/', 'adjective', 'dễ chịu, vui vẻ', 'She has a pleasant personality.', '', 'general-positive', 6],
  ['likable', '/ˈlaɪ.kə.bəl/', 'adjective', 'dễ mến', 'His honest smile makes him very likable.', '', 'general-positive', 7],
  ['admirable', '/ˈæd.mər.ə.bəl/', 'adjective', 'đáng ngưỡng mộ', 'Her dedication to charity work is admirable.', '', 'general-positive', 8],

  ['honest', '/ˈɒn.ɪst/', 'adjective', 'trung thực', 'An honest employee admits mistakes quickly.', '', 'integrity-values', 1],
  ['truthful', '/ˈtruːθ.fəl/', 'adjective', 'thành thật, nói thật', 'Children should learn to be truthful.', '', 'integrity-values', 2],
  ['sincere', '/sɪnˈsɪər/', 'adjective', 'chân thành', 'Her apology sounded sincere.', '', 'integrity-values', 3],
  ['genuine', '/ˈdʒen.ju.ɪn/', 'adjective', 'thật lòng, chân thật', 'He showed genuine concern for his friend.', '', 'integrity-values', 4],
  ['trustworthy', '/ˈtrʌstˌwɜː.ði/', 'adjective', 'đáng tin cậy', 'A trustworthy leader keeps promises.', '', 'integrity-values', 5],
  ['reliable', '/rɪˈlaɪ.ə.bəl/', 'adjective', 'đáng tin cậy', 'She is reliable and always finishes tasks on time.', '', 'integrity-values', 6],
  ['loyal', '/ˈlɔɪ.əl/', 'adjective', 'trung thành', 'A loyal friend supports you in difficult times.', '', 'integrity-values', 7],
  ['fair', '/feər/', 'adjective', 'công bằng', 'A fair teacher treats all students equally.', '', 'integrity-values', 8],
  ['principled', '/ˈprɪn.sə.pəld/', 'adjective', 'có nguyên tắc', 'A principled person refuses to cheat.', '', 'integrity-values', 9],

  ['responsible', '/rɪˈspɒn.sə.bəl/', 'adjective', 'có trách nhiệm', 'A responsible student prepares carefully for exams.', '', 'responsibility-discipline', 1],
  ['dependable', '/dɪˈpen.də.bəl/', 'adjective', 'đáng tin, có thể dựa vào', 'He is dependable in emergencies.', '', 'responsibility-discipline', 2],
  ['disciplined', '/ˈdɪs.ə.plɪnd/', 'adjective', 'kỷ luật', 'Disciplined athletes train every day.', '', 'responsibility-discipline', 3],
  ['punctual', '/ˈpʌŋk.tʃu.əl/', 'adjective', 'đúng giờ', 'Punctual workers arrive before meetings begin.', '', 'responsibility-discipline', 4],
  ['organized', '/ˈɔː.ɡən.aɪzd/', 'adjective', 'ngăn nắp, có tổ chức', 'An organized manager keeps clear records.', '', 'responsibility-discipline', 5],
  ['careful', '/ˈkeə.fəl/', 'adjective', 'cẩn thận', 'A careful driver checks the mirrors often.', '', 'responsibility-discipline', 6],
  ['thorough', '/ˈθʌr.ə/', 'adjective', 'kỹ lưỡng', 'Her report was thorough and accurate.', '', 'responsibility-discipline', 7],
  ['conscientious', '/ˌkɒn.ʃiˈen.ʃəs/', 'adjective', 'tận tâm, chu đáo', 'Conscientious employees pay attention to detail.', '', 'responsibility-discipline', 8],
  ['hard-working', '/ˌhɑːdˈwɜː.kɪŋ/', 'adjective', 'chăm chỉ', 'Hard-working people often improve steadily.', '', 'responsibility-discipline', 9],

  ['confident', '/ˈkɒn.fɪ.dənt/', 'adjective', 'tự tin', 'A confident speaker makes eye contact.', '', 'confidence-courage', 1],
  ['brave', '/breɪv/', 'adjective', 'dũng cảm', 'The brave firefighter entered the burning building.', '', 'confidence-courage', 2],
  ['courageous', '/kəˈreɪ.dʒəs/', 'adjective', 'can đảm', 'It was courageous of her to speak the truth.', '', 'confidence-courage', 3],
  ['bold', '/bəʊld/', 'adjective', 'táo bạo, mạnh dạn', 'He made a bold decision to start a new career.', '', 'confidence-courage', 4],
  ['assertive', '/əˈsɜː.tɪv/', 'adjective', 'quyết đoán, dám nói rõ ý kiến', 'Assertive people can say no politely.', '', 'confidence-courage', 5],
  ['decisive', '/dɪˈsaɪ.sɪv/', 'adjective', 'quyết đoán', 'A decisive leader acts quickly when needed.', '', 'confidence-courage', 6],
  ['independent', '/ˌɪn.dɪˈpen.dənt/', 'adjective', 'độc lập', 'Independent learners can study without constant help.', '', 'confidence-courage', 7],
  ['self-assured', '/ˌself əˈʃɔːd/', 'adjective', 'tự tin, vững tin', 'She sounded calm and self-assured during the interview.', '', 'confidence-courage', 8],

  ['patient', '/ˈpeɪ.ʃənt/', 'adjective', 'kiên nhẫn', 'A patient teacher explains things many times.', '', 'patience-emotional-control', 1],
  ['calm', '/kɑːm/', 'adjective', 'bình tĩnh', 'Stay calm when plans change unexpectedly.', '', 'patience-emotional-control', 2],
  ['composed', '/kəmˈpəʊzd/', 'adjective', 'điềm tĩnh', 'She remained composed during the crisis.', '', 'patience-emotional-control', 3],
  ['tolerant', '/ˈtɒl.ər.ənt/', 'adjective', 'khoan dung', 'Tolerant people accept different opinions.', '', 'patience-emotional-control', 4],
  ['forgiving', '/fəˈɡɪv.ɪŋ/', 'adjective', 'biết tha thứ', 'A forgiving person does not hold anger for long.', '', 'patience-emotional-control', 5],
  ['understanding', '/ˌʌn.dəˈstæn.dɪŋ/', 'adjective', 'thấu hiểu, cảm thông', 'An understanding parent listens before judging.', '', 'patience-emotional-control', 6],
  ['gentle', '/ˈdʒen.təl/', 'adjective', 'dịu dàng, nhẹ nhàng', 'He has a gentle voice and a calm manner.', '', 'patience-emotional-control', 7],
  ['easy-going', '/ˌiː.ziˈɡəʊ.ɪŋ/', 'adjective', 'dễ tính, thoải mái', 'Easy-going people rarely get angry about small problems.', '', 'patience-emotional-control', 8],

  ['creative', '/kriˈeɪ.tɪv/', 'adjective', 'sáng tạo', 'Creative people find new ways to solve problems.', '', 'creativity-intelligence', 1],
  ['imaginative', '/ɪˈmædʒ.ɪ.nə.tɪv/', 'adjective', 'giàu trí tưởng tượng', 'An imaginative child can invent wonderful stories.', '', 'creativity-intelligence', 2],
  ['innovative', '/ˈɪn.ə.veɪ.tɪv/', 'adjective', 'đổi mới, sáng tạo', 'Innovative teams develop better products.', '', 'creativity-intelligence', 3],
  ['curious', '/ˈkjʊə.ri.əs/', 'adjective', 'tò mò, ham hiểu biết', 'Curious students ask many questions.', '', 'creativity-intelligence', 4],
  ['intelligent', '/ɪnˈtel.ɪ.dʒənt/', 'adjective', 'thông minh', 'An intelligent solution can save time and money.', '', 'creativity-intelligence', 5],
  ['clever', '/ˈklev.ər/', 'adjective', 'thông minh, lanh lợi', 'She found a clever way to remember new words.', '', 'creativity-intelligence', 6],
  ['wise', '/waɪz/', 'adjective', 'khôn ngoan, sáng suốt', 'A wise person learns from past mistakes.', '', 'creativity-intelligence', 7],
  ['resourceful', '/rɪˈsɔːs.fəl/', 'adjective', 'tháo vát, xoay xở giỏi', 'Resourceful travelers can handle unexpected problems.', '', 'creativity-intelligence', 8],
  ['open-minded', '/ˌəʊ.pənˈmaɪn.dɪd/', 'adjective', 'cởi mở, sẵn sàng tiếp thu', 'Open-minded people are willing to learn from others.', '', 'creativity-intelligence', 9],

  ['ambitious', '/æmˈbɪʃ.əs/', 'adjective', 'tham vọng, có hoài bão', 'Ambitious students set challenging goals.', '', 'ambition-motivation', 1],
  ['motivated', '/ˈməʊ.tɪ.veɪ.tɪd/', 'adjective', 'có động lực', 'Motivated learners practice even when lessons are difficult.', '', 'ambition-motivation', 2],
  ['determined', '/dɪˈtɜː.mɪnd/', 'adjective', 'quyết tâm', 'She was determined to pass the exam.', '', 'ambition-motivation', 3],
  ['persistent', '/pəˈsɪs.tənt/', 'adjective', 'kiên trì', 'Persistent people keep trying after failure.', '', 'ambition-motivation', 4],
  ['persevering', '/ˌpɜː.sɪˈvɪə.rɪŋ/', 'adjective', 'bền bỉ, kiên trì', 'A persevering athlete trains through setbacks.', '', 'ambition-motivation', 5],
  ['driven', '/ˈdrɪv.ən/', 'adjective', 'đầy quyết tâm, có động lực mạnh', 'Driven entrepreneurs work hard to reach their goals.', '', 'ambition-motivation', 6],
  ['goal-oriented', '/ˈɡəʊl ˌɔː.ri.en.tɪd/', 'adjective', 'hướng tới mục tiêu', 'Goal-oriented employees focus on clear results.', '', 'ambition-motivation', 7],
  ['proactive', '/ˌprəʊˈæk.tɪv/', 'adjective', 'chủ động', 'A proactive person solves problems before they grow.', '', 'ambition-motivation', 8],

  ['helpful', '/ˈhelp.fəl/', 'adjective', 'hay giúp đỡ, hữu ích', 'Helpful classmates share notes with absent students.', '', 'kindness-empathy', 1],
  ['generous', '/ˈdʒen.ər.əs/', 'adjective', 'hào phóng, rộng lượng', 'A generous person shares time and resources.', '', 'kindness-empathy', 2],
  ['caring', '/ˈkeə.rɪŋ/', 'adjective', 'biết quan tâm', 'Caring nurses comfort their patients.', '', 'kindness-empathy', 3],
  ['compassionate', '/kəmˈpæʃ.ən.ət/', 'adjective', 'giàu lòng trắc ẩn', 'Compassionate leaders care about vulnerable people.', '', 'kindness-empathy', 4],
  ['empathetic', '/ˌem.pəˈθet.ɪk/', 'adjective', 'biết đồng cảm', 'Empathetic friends understand how you feel.', '', 'kindness-empathy', 5],
  ['thoughtful', '/ˈθɔːt.fəl/', 'adjective', 'chu đáo, sâu sắc', 'It was thoughtful of him to bring her medicine.', '', 'kindness-empathy', 6],
  ['considerate', '/kənˈsɪd.ər.ət/', 'adjective', 'ân cần, chu đáo', 'Considerate neighbors keep noise low at night.', '', 'kindness-empathy', 7],
  ['sympathetic', '/ˌsɪm.pəˈθet.ɪk/', 'adjective', 'thông cảm', 'She was sympathetic when I explained my problem.', '', 'kindness-empathy', 8],

  ['sociable', '/ˈsəʊ.ʃə.bəl/', 'adjective', 'hòa đồng, thích giao tiếp', 'Sociable people enjoy meeting new friends.', '', 'social-personality', 1],
  ['outgoing', '/ˌaʊtˈɡəʊ.ɪŋ/', 'adjective', 'hòa đồng, cởi mở', 'An outgoing student joins many school activities.', '', 'social-personality', 2],
  ['talkative', '/ˈtɔː.kə.tɪv/', 'adjective', 'nói nhiều', 'He is talkative in small groups.', '', 'social-personality', 3],
  ['charming', '/ˈtʃɑː.mɪŋ/', 'adjective', 'duyên dáng, quyến rũ', 'The charming host made everyone feel comfortable.', '', 'social-personality', 4],
  ['charismatic', '/ˌkær.ɪzˈmæt.ɪk/', 'adjective', 'có sức hút, lôi cuốn', 'A charismatic speaker can inspire a crowd.', '', 'social-personality', 5],
  ['cooperative', '/kəʊˈɒp.ər.ə.tɪv/', 'adjective', 'hợp tác', 'Cooperative team members listen to each other.', '', 'social-personality', 6],
  ['supportive', '/səˈpɔː.tɪv/', 'adjective', 'ủng hộ, hỗ trợ', 'Supportive parents encourage their children.', '', 'social-personality', 7],
  ['respectful', '/rɪˈspekt.fəl/', 'adjective', 'tôn trọng, lễ phép', 'Respectful students listen when others speak.', '', 'social-personality', 8],

  ['modest', '/ˈmɒd.ɪst/', 'adjective', 'khiêm tốn', 'A modest winner thanks the whole team.', '', 'humility-maturity', 1],
  ['humble', '/ˈhʌm.bəl/', 'adjective', 'khiêm nhường', 'Humble people do not boast about success.', '', 'humility-maturity', 2],
  ['mature', '/məˈtʃʊər/', 'adjective', 'trưởng thành, chín chắn', 'Mature teenagers can make responsible decisions.', '', 'humility-maturity', 3],
  ['sensible', '/ˈsen.sə.bəl/', 'adjective', 'biết điều, hợp lý', 'A sensible person thinks before acting.', '', 'humility-maturity', 4],
  ['balanced', '/ˈbæl.ənst/', 'adjective', 'cân bằng, điềm đạm', 'A balanced leader considers both risks and benefits.', '', 'humility-maturity', 5],
  ['realistic', '/ˌrɪəˈlɪs.tɪk/', 'adjective', 'thực tế', 'Realistic people set achievable goals.', '', 'humility-maturity', 6],
  ['self-aware', '/ˌself əˈweər/', 'adjective', 'tự nhận thức', 'Self-aware people understand their strengths and weaknesses.', '', 'humility-maturity', 7],

  ['lazy', '/ˈleɪ.zi/', 'adjective', 'lười biếng', 'Lazy habits can stop you from improving.', '', 'negative-qualities', 1],
  ['selfish', '/ˈsel.fɪʃ/', 'adjective', 'ích kỷ', 'Selfish behavior can damage friendships.', '', 'negative-qualities', 2],
  ['greedy', '/ˈɡriː.di/', 'adjective', 'tham lam', 'A greedy person always wants more than necessary.', '', 'negative-qualities', 3],
  ['arrogant', '/ˈær.ə.ɡənt/', 'adjective', 'kiêu ngạo', 'Arrogant people often refuse advice.', '', 'negative-qualities', 4],
  ['boastful', '/ˈbəʊst.fəl/', 'adjective', 'hay khoe khoang', 'A boastful student talks too much about his grades.', '', 'negative-qualities', 5],
  ['stubborn', '/ˈstʌb.ən/', 'adjective', 'bướng bỉnh, cố chấp', 'Stubborn people may ignore good advice.', '', 'negative-qualities', 6],
  ['impatient', '/ɪmˈpeɪ.ʃənt/', 'adjective', 'thiếu kiên nhẫn', 'Impatient drivers often make dangerous decisions.', '', 'negative-qualities', 7],
  ['careless', '/ˈkeə.ləs/', 'adjective', 'bất cẩn', 'Careless mistakes can reduce your score.', '', 'negative-qualities', 8],
  ['irresponsible', '/ˌɪr.ɪˈspɒn.sə.bəl/', 'adjective', 'vô trách nhiệm', 'It is irresponsible to leave work unfinished.', '', 'negative-qualities', 9],
  ['dishonest', '/dɪsˈɒn.ɪst/', 'adjective', 'không trung thực', 'Dishonest actions destroy trust.', '', 'negative-qualities', 10],
  ['rude', '/ruːd/', 'adjective', 'thô lỗ, bất lịch sự', 'Rude comments can hurt other people.', '', 'negative-qualities', 11],
  ['aggressive', '/əˈɡres.ɪv/', 'adjective', 'hung hăng, gây hấn', 'Aggressive behavior makes teamwork difficult.', '', 'negative-qualities', 12],
  ['jealous', '/ˈdʒel.əs/', 'adjective', 'ghen tị', 'Jealous people may feel unhappy about others’ success.', '', 'negative-qualities', 13],

  ['optimistic', '/ˌɒp.tɪˈmɪs.tɪk/', 'adjective', 'lạc quan', 'Optimistic people expect good results.', '', 'attitude-mindset', 1],
  ['positive', '/ˈpɒz.ə.tɪv/', 'adjective', 'tích cực', 'A positive attitude helps during hard times.', '', 'attitude-mindset', 2],
  ['enthusiastic', '/ɪnˌθjuː.ziˈæs.tɪk/', 'adjective', 'nhiệt tình, hào hứng', 'Enthusiastic volunteers worked all day.', '', 'attitude-mindset', 3],
  ['cheerful', '/ˈtʃɪə.fəl/', 'adjective', 'vui vẻ', 'Her cheerful personality brightens the office.', '', 'attitude-mindset', 4],
  ['hopeful', '/ˈhəʊp.fəl/', 'adjective', 'đầy hy vọng', 'The team felt hopeful after the first success.', '', 'attitude-mindset', 5],
  ['pessimistic', '/ˌpes.ɪˈmɪs.tɪk/', 'adjective', 'bi quan', 'Pessimistic thinking can reduce motivation.', '', 'attitude-mindset', 6],
  ['negative', '/ˈneɡ.ə.tɪv/', 'adjective', 'tiêu cực', 'A negative attitude can affect the whole group.', '', 'attitude-mindset', 7],
  ['resilient', '/rɪˈzɪl.i.ənt/', 'adjective', 'kiên cường, có khả năng phục hồi', 'Resilient people recover after failure.', '', 'attitude-mindset', 8],
  ['adaptable', '/əˈdæp.tə.bəl/', 'adjective', 'dễ thích nghi', 'Adaptable workers learn new tools quickly.', '', 'attitude-mindset', 9],

  ['introverted', '/ˈɪn.trə.vɜː.tɪd/', 'adjective', 'hướng nội', 'Introverted people may prefer quiet conversations.', '', 'personality-types', 1],
  ['extroverted', '/ˈek.strə.vɜː.tɪd/', 'adjective', 'hướng ngoại', 'Extroverted students often enjoy group activities.', '', 'personality-types', 2],
  ['reserved', '/rɪˈzɜːvd/', 'adjective', 'kín đáo, dè dặt', 'Reserved people may need time to open up.', '', 'personality-types', 3],
  ['shy', '/ʃaɪ/', 'adjective', 'nhút nhát', 'A shy child may avoid speaking in front of strangers.', '', 'personality-types', 4],
  ['quiet', '/ˈkwaɪ.ət/', 'adjective', 'ít nói, trầm lặng', 'He is quiet but very thoughtful.', '', 'personality-types', 5],
  ['sensitive', '/ˈsen.sə.tɪv/', 'adjective', 'nhạy cảm', 'Sensitive people notice small changes in mood.', '', 'personality-types', 6],
  ['emotional', '/ɪˈməʊ.ʃən.əl/', 'adjective', 'dễ xúc động, thuộc cảm xúc', 'Emotional people may react strongly to criticism.', '', 'personality-types', 7]
];

const advancedWords = new Set([
  'admirable', 'truthful', 'sincere', 'genuine', 'trustworthy', 'principled',
  'dependable', 'thorough', 'conscientious', 'courageous', 'assertive',
  'decisive', 'self-assured', 'composed', 'tolerant', 'forgiving',
  'innovative', 'resourceful', 'open-minded', 'persistent', 'persevering',
  'driven', 'goal-oriented', 'proactive', 'compassionate', 'empathetic',
  'considerate', 'sympathetic', 'charismatic', 'cooperative', 'supportive',
  'mature', 'sensible', 'balanced', 'self-aware', 'arrogant', 'boastful',
  'irresponsible', 'dishonest', 'aggressive', 'pessimistic', 'resilient',
  'adaptable', 'introverted', 'extroverted', 'reserved'
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
    source: 'Curated IELTS Vocabulary - Personal Qualities (B1-B2)',
    totalCards: cards.length,
    totalFamilies: new Set(cards.map(c => c.fieldValues.familyId)).size,
    generatedAt: '2026-05-06',
    note: 'Tu vung chu de Pham chat ca nhan, gom cac tinh tu/trang tu mo ta pham chat, tinh cach, thai do, ky luat, long tot, kha nang xa hoi va cac pham chat tieu cuc. Bao gom good va well de nguoi hoc thay chung trong cung topic pham chat, dong thoi van giu duoc nhom bat quy tac good/well - better - best.'
  },
  cards
};

for (const dir of ['data/seed-vocabulary', 'public/seed-vocabulary']) {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'personal-qualities.json'), JSON.stringify(seed, null, 2) + '\n', 'utf8');
}

console.log(`Generated ${cards.length} cards, ${seed._meta.totalFamilies} families for ${topicId}`);
