const fs = require('fs');
const path = require('path');

const topicId = 'emotion-feelings';
const topicName = 'Emotion & Feelings';

const entries = [
  ['happy', '/ˈhæpi/', 'adjective', 'vui, hạnh phúc', 'She felt happy when she heard the good news.', '', 'basic-emotions', 1, ['positive', 'basic']],
  ['sad', '/sæd/', 'adjective', 'buồn', 'He looked sad after saying goodbye to his friend.', '', 'basic-emotions', 2, ['negative', 'basic']],
  ['angry', '/ˈæŋɡri/', 'adjective', 'tức giận', 'My teacher was angry because the class was too noisy.', '', 'basic-emotions', 3, ['negative', 'basic']],
  ['afraid', '/əˈfreɪd/', 'adjective', 'sợ hãi', 'The child was afraid of the dark room.', '', 'basic-emotions', 4, ['negative', 'basic']],
  ['surprised', '/sərˈpraɪzd/', 'adjective', 'ngạc nhiên', 'I was surprised to see my old classmate at the airport.', '', 'basic-emotions', 5, ['basic']],
  ['excited', '/ɪkˈsaɪtɪd/', 'adjective', 'hào hứng, phấn khích', 'We were excited about the school trip.', '', 'basic-emotions', 6, ['positive', 'basic']],
  ['nervous', '/ˈnɜːrvəs/', 'adjective', 'lo lắng, hồi hộp', 'She felt nervous before the speaking test.', '', 'basic-emotions', 7, ['negative', 'basic']],
  ['tired', '/ˈtaɪərd/', 'adjective', 'mệt mỏi', 'I was too tired to cook dinner after work.', '', 'basic-emotions', 8, ['state', 'basic']],
  ['bored', '/bɔːrd/', 'adjective', 'chán nản, buồn chán', 'The students got bored during the long lecture.', '', 'basic-emotions', 9, ['negative', 'basic']],
  ['confused', '/kənˈfjuːzd/', 'adjective', 'bối rối, lúng túng', 'He was confused by the complicated instructions.', '', 'basic-emotions', 10, ['negative', 'basic']],

  ['joy', '/dʒɔɪ/', 'noun', 'niềm vui', 'Her face was full of joy when she saw her family.', '', 'happiness-positive', 1, ['positive']],
  ['delight', '/dɪˈlaɪt/', 'noun', 'niềm vui sướng, sự thích thú', 'The children laughed with delight at the magic show.', '', 'happiness-positive', 2, ['positive']],
  ['pleased', '/pliːzd/', 'adjective', 'hài lòng, vui lòng', 'I am pleased with your progress this month.', '', 'happiness-positive', 3, ['positive']],
  ['cheerful', '/ˈtʃɪrfl/', 'adjective', 'vui vẻ, phấn khởi', 'She has a cheerful voice that makes people feel welcome.', '', 'happiness-positive', 4, ['positive']],
  ['glad', '/ɡlæd/', 'adjective', 'vui mừng', 'I am glad you arrived safely.', '', 'happiness-positive', 5, ['positive']],
  ['thrilled', '/θrɪld/', 'adjective', 'vô cùng vui sướng, phấn khích', 'They were thrilled to win the competition.', '', 'happiness-positive', 6, ['positive', 'strong']],
  ['overjoyed', '/ˌoʊvərˈdʒɔɪd/', 'adjective', 'vui mừng khôn xiết', 'She was overjoyed when her application was accepted.', '', 'happiness-positive', 7, ['positive', 'strong']],
  ['content', '/kənˈtent/', 'adjective', 'mãn nguyện, hài lòng', 'He felt content with his simple life.', '', 'happiness-positive', 8, ['positive', 'calm']],
  ['satisfied', '/ˈsætɪsfaɪd/', 'adjective', 'hài lòng, thỏa mãn', 'The customer was satisfied with the service.', '', 'happiness-positive', 9, ['positive']],
  ['optimistic', '/ˌɑːptɪˈmɪstɪk/', 'adjective', 'lạc quan', 'She remains optimistic about the future.', '', 'happiness-positive', 10, ['positive']],

  ['sadness', '/ˈsædnəs/', 'noun', 'nỗi buồn', 'A deep sadness filled the room after the news.', '', 'sadness-negative', 1, ['negative']],
  ['unhappy', '/ʌnˈhæpi/', 'adjective', 'không vui, bất hạnh', 'He was unhappy with the result of the exam.', '', 'sadness-negative', 2, ['negative']],
  ['upset', '/ʌpˈset/', 'adjective', 'buồn bực, khó chịu', 'She was upset because her friend forgot her birthday.', '', 'sadness-negative', 3, ['negative']],
  ['disappointed', '/ˌdɪsəˈpɔɪntɪd/', 'adjective', 'thất vọng', 'We were disappointed by the cancelled concert.', '', 'sadness-negative', 4, ['negative']],
  ['depressed', '/dɪˈprest/', 'adjective', 'chán nản, trầm cảm', 'He felt depressed after losing his job.', '', 'sadness-negative', 5, ['negative', 'strong']],
  ['miserable', '/ˈmɪzərəbl/', 'adjective', 'khổ sở, rất buồn', 'I felt miserable when I had to stay home alone.', '', 'sadness-negative', 6, ['negative', 'strong']],
  ['lonely', '/ˈloʊnli/', 'adjective', 'cô đơn', 'She felt lonely in the new city.', '', 'sadness-negative', 7, ['negative']],
  ['homesick', '/ˈhoʊmsɪk/', 'adjective', 'nhớ nhà', 'Many students feel homesick during their first week abroad.', '', 'sadness-negative', 8, ['negative']],
  ['heartbroken', '/ˈhɑːrtbroʊkən/', 'adjective', 'đau lòng, tan nát cõi lòng', 'He was heartbroken after the relationship ended.', '', 'sadness-negative', 9, ['negative', 'strong']],
  ['gloomy', '/ˈɡluːmi/', 'adjective', 'u ám, buồn rầu', 'The rainy weather made everyone feel gloomy.', '', 'sadness-negative', 10, ['negative']],

  ['anger', '/ˈæŋɡər/', 'noun', 'sự tức giận', 'He tried to control his anger during the argument.', '', 'anger-frustration', 1, ['negative']],
  ['annoyed', '/əˈnɔɪd/', 'adjective', 'bực mình, khó chịu', 'She was annoyed by the loud music next door.', '', 'anger-frustration', 2, ['negative']],
  ['irritated', '/ˈɪrɪteɪtɪd/', 'adjective', 'phát cáu, khó chịu', 'His rude comments made me irritated.', '', 'anger-frustration', 3, ['negative']],
  ['frustrated', '/ˈfrʌstreɪtɪd/', 'adjective', 'bực bội, nản lòng', 'I felt frustrated when the computer crashed again.', '', 'anger-frustration', 4, ['negative']],
  ['furious', '/ˈfjʊriəs/', 'adjective', 'giận dữ, điên tiết', 'Dad was furious when he saw the broken window.', '', 'anger-frustration', 5, ['negative', 'strong']],
  ['outraged', '/ˈaʊtreɪdʒd/', 'adjective', 'phẫn nộ', 'People were outraged by the unfair decision.', '', 'anger-frustration', 6, ['negative', 'strong']],
  ['resentful', '/rɪˈzentfl/', 'adjective', 'oán giận, phẫn uất', 'She felt resentful after being treated unfairly.', '', 'anger-frustration', 7, ['negative', 'advanced']],
  ['impatient', '/ɪmˈpeɪʃnt/', 'adjective', 'thiếu kiên nhẫn, sốt ruột', 'The passengers became impatient after the delay.', '', 'anger-frustration', 8, ['negative']],
  ['offended', '/əˈfendɪd/', 'adjective', 'bị xúc phạm, phật ý', 'He felt offended by the careless joke.', '', 'anger-frustration', 9, ['negative']],
  ['jealous', '/ˈdʒeləs/', 'adjective', 'ghen tị, ghen tuông', 'She felt jealous when her friend got more attention.', '', 'anger-frustration', 10, ['negative']],

  ['fear', '/fɪr/', 'noun', 'nỗi sợ', 'Fear kept him from trying something new.', '', 'fear-anxiety', 1, ['negative']],
  ['scared', '/skerd/', 'adjective', 'sợ hãi', 'The little boy was scared of the thunder.', '', 'fear-anxiety', 2, ['negative', 'basic']],
  ['frightened', '/ˈfraɪtnd/', 'adjective', 'hoảng sợ', 'She was frightened by the sudden noise.', '', 'fear-anxiety', 3, ['negative']],
  ['terrified', '/ˈterɪfaɪd/', 'adjective', 'khiếp sợ', 'They were terrified when the car lost control.', '', 'fear-anxiety', 4, ['negative', 'strong']],
  ['anxious', '/ˈæŋkʃəs/', 'adjective', 'lo âu, bồn chồn', 'He felt anxious about the interview.', '', 'fear-anxiety', 5, ['negative']],
  ['worried', '/ˈwɜːrid/', 'adjective', 'lo lắng', 'My parents were worried when I came home late.', '', 'fear-anxiety', 6, ['negative']],
  ['panicked', '/ˈpænɪkt/', 'adjective', 'hoảng loạn', 'The crowd panicked when the alarm went off.', '', 'fear-anxiety', 7, ['negative', 'strong']],
  ['insecure', '/ˌɪnsɪˈkjʊr/', 'adjective', 'bất an, thiếu tự tin', 'He felt insecure about speaking English in public.', '', 'fear-anxiety', 8, ['negative']],
  ['uneasy', '/ʌnˈiːzi/', 'adjective', 'bất an, không yên tâm', 'I felt uneasy walking alone at night.', '', 'fear-anxiety', 9, ['negative']],
  ['reluctant', '/rɪˈlʌktənt/', 'adjective', 'miễn cưỡng, không sẵn lòng', 'She was reluctant to share her personal feelings.', '', 'fear-anxiety', 10, ['negative']],

  ['shock', '/ʃɑːk/', 'noun', 'cú sốc, sự bàng hoàng', 'The news came as a shock to everyone.', '', 'surprise-confusion', 1, ['reaction']],
  ['amazed', '/əˈmeɪzd/', 'adjective', 'kinh ngạc, sửng sốt', 'I was amazed by how quickly she learned the song.', '', 'surprise-confusion', 2, ['positive', 'reaction']],
  ['astonished', '/əˈstɑːnɪʃt/', 'adjective', 'kinh ngạc', 'They were astonished by the final result.', '', 'surprise-confusion', 3, ['reaction', 'advanced']],
  ['stunned', '/stʌnd/', 'adjective', 'sững sờ', 'She was stunned when she heard the announcement.', '', 'surprise-confusion', 4, ['reaction', 'strong']],
  ['puzzled', '/ˈpʌzld/', 'adjective', 'bối rối, khó hiểu', 'He looked puzzled by the strange question.', '', 'surprise-confusion', 5, ['reaction']],
  ['doubtful', '/ˈdaʊtfl/', 'adjective', 'nghi ngờ, không chắc', 'I was doubtful that the plan would work.', '', 'surprise-confusion', 6, ['thinking']],
  ['uncertain', '/ʌnˈsɜːrtn/', 'adjective', 'không chắc chắn', 'She felt uncertain about which course to choose.', '', 'surprise-confusion', 7, ['thinking']],
  ['curious', '/ˈkjʊriəs/', 'adjective', 'tò mò', 'The children were curious about the old house.', '', 'surprise-confusion', 8, ['thinking', 'positive']],
  ['embarrassed', '/ɪmˈbærəst/', 'adjective', 'xấu hổ, ngượng', 'He felt embarrassed after making a mistake.', '', 'surprise-confusion', 9, ['negative']],
  ['ashamed', '/əˈʃeɪmd/', 'adjective', 'hổ thẹn, xấu hổ', 'She was ashamed of telling a lie.', '', 'surprise-confusion', 10, ['negative']],

  ['love', '/lʌv/', 'noun', 'tình yêu, sự yêu thương', 'Love and respect are important in every family.', '', 'love-affection', 1, ['positive']],
  ['affection', '/əˈfekʃn/', 'noun', 'tình cảm, sự trìu mến', 'He showed affection by helping his grandmother every day.', '', 'love-affection', 2, ['positive']],
  ['fond', '/fɑːnd/', 'adjective', 'yêu mến, thích', 'She is fond of her little brother.', '', 'love-affection', 3, ['positive']],
  ['attached', '/əˈtætʃt/', 'adjective', 'gắn bó, quyến luyến', 'The child is deeply attached to his mother.', '', 'love-affection', 4, ['positive']],
  ['caring', '/ˈkerɪŋ/', 'adjective', 'quan tâm, chu đáo', 'A caring friend listens when you need help.', '', 'love-affection', 5, ['positive']],
  ['grateful', '/ˈɡreɪtfl/', 'adjective', 'biết ơn', 'I am grateful for your kindness.', '', 'love-affection', 6, ['positive']],
  ['thankful', '/ˈθæŋkfl/', 'adjective', 'cảm kích, biết ơn', 'We are thankful for all the support we received.', '', 'love-affection', 7, ['positive']],
  ['admiration', '/ˌædməˈreɪʃn/', 'noun', 'sự ngưỡng mộ', 'She has great admiration for her hardworking parents.', '', 'love-affection', 8, ['positive']],
  ['respect', '/rɪˈspekt/', 'noun', 'sự tôn trọng', 'Mutual respect makes communication easier.', '', 'love-affection', 9, ['positive']],
  ['trust', '/trʌst/', 'noun', 'sự tin tưởng', 'Trust is built through honest actions.', '', 'love-affection', 10, ['positive']],

  ['sympathy', '/ˈsɪmpəθi/', 'noun', 'sự cảm thông', 'She expressed sympathy for her friend\'s loss.', '', 'empathy-compassion', 1, ['positive']],
  ['empathy', '/ˈempəθi/', 'noun', 'sự đồng cảm', 'Empathy helps us understand other people\'s feelings.', '', 'empathy-compassion', 2, ['positive']],
  ['compassion', '/kəmˈpæʃn/', 'noun', 'lòng trắc ẩn', 'The nurse treated every patient with compassion.', '', 'empathy-compassion', 3, ['positive']],
  ['pity', '/ˈpɪti/', 'noun', 'sự thương hại', 'He felt pity for the injured bird.', '', 'empathy-compassion', 4, ['feeling']],
  ['concerned', '/kənˈsɜːrnd/', 'adjective', 'lo lắng, quan tâm', 'Her family was concerned about her health.', '', 'empathy-compassion', 5, ['care']],
  ['supportive', '/səˈpɔːrtɪv/', 'adjective', 'ủng hộ, hỗ trợ', 'My classmates were supportive when I felt nervous.', '', 'empathy-compassion', 6, ['positive']],
  ['understanding', '/ˌʌndərˈstændɪŋ/', 'adjective', 'thấu hiểu, cảm thông', 'He is an understanding manager who listens to his team.', '', 'empathy-compassion', 7, ['positive']],
  ['forgiving', '/fərˈɡɪvɪŋ/', 'adjective', 'bao dung, dễ tha thứ', 'A forgiving person does not hold anger for long.', '', 'empathy-compassion', 8, ['positive']],
  ['regret', '/rɪˈɡret/', 'noun', 'sự hối tiếc', 'He felt regret after speaking too harshly.', '', 'empathy-compassion', 9, ['negative']],
  ['guilt', '/ɡɪlt/', 'noun', 'cảm giác tội lỗi', 'She felt guilt about breaking her promise.', '', 'empathy-compassion', 10, ['negative']],

  ['stress', '/stres/', 'noun', 'sự căng thẳng, áp lực', 'Too much stress can affect your sleep.', '', 'stress-pressure', 1, ['negative']],
  ['stressed', '/strest/', 'adjective', 'căng thẳng', 'I feel stressed when I have too many deadlines.', '', 'stress-pressure', 2, ['negative']],
  ['overwhelmed', '/ˌoʊvərˈwelmd/', 'adjective', 'choáng ngợp, quá tải', 'She felt overwhelmed by all the responsibilities.', '', 'stress-pressure', 3, ['negative', 'strong']],
  ['exhausted', '/ɪɡˈzɔːstɪd/', 'adjective', 'kiệt sức', 'After the long journey, everyone was exhausted.', '', 'stress-pressure', 4, ['state', 'strong']],
  ['drained', '/dreɪnd/', 'adjective', 'kiệt quệ, cạn năng lượng', 'He felt emotionally drained after the meeting.', '', 'stress-pressure', 5, ['state']],
  ['burned out', '/ˌbɜːrnd ˈaʊt/', 'adjective', 'kiệt sức vì làm việc quá mức', 'Many workers feel burned out after months of pressure.', '', 'stress-pressure', 6, ['state', 'advanced']],
  ['restless', '/ˈrestləs/', 'adjective', 'bồn chồn, không yên', 'I felt restless and could not sit still.', '', 'stress-pressure', 7, ['negative']],
  ['tense', '/tens/', 'adjective', 'căng thẳng', 'The atmosphere became tense during the discussion.', '', 'stress-pressure', 8, ['negative']],
  ['pressured', '/ˈpreʃərd/', 'adjective', 'bị áp lực', 'He felt pressured to make a quick decision.', '', 'stress-pressure', 9, ['negative']],
  ['discouraged', '/dɪsˈkɜːrɪdʒd/', 'adjective', 'nản lòng', 'Do not feel discouraged after one failure.', '', 'stress-pressure', 10, ['negative']],

  ['calm', '/kɑːm/', 'adjective', 'bình tĩnh, yên bình', 'She stayed calm during the emergency.', '', 'calm-relief', 1, ['positive', 'calm']],
  ['peaceful', '/ˈpiːsfl/', 'adjective', 'yên bình, thanh thản', 'The quiet garden made me feel peaceful.', '', 'calm-relief', 2, ['positive', 'calm']],
  ['relaxed', '/rɪˈlækst/', 'adjective', 'thư giãn, thoải mái', 'He felt relaxed after taking a warm bath.', '', 'calm-relief', 3, ['positive', 'calm']],
  ['comfortable', '/ˈkʌmftəbl/', 'adjective', 'thoải mái, dễ chịu', 'I feel comfortable talking to her.', '', 'calm-relief', 4, ['positive', 'calm']],
  ['relieved', '/rɪˈliːvd/', 'adjective', 'nhẹ nhõm', 'We were relieved when the doctor said everything was fine.', '', 'calm-relief', 5, ['positive']],
  ['secure', '/sɪˈkjʊr/', 'adjective', 'an tâm, an toàn', 'Children feel secure when they are loved and protected.', '', 'calm-relief', 6, ['positive']],
  ['confident', '/ˈkɑːnfɪdənt/', 'adjective', 'tự tin', 'She felt confident after practicing many times.', '', 'calm-relief', 7, ['positive']],
  ['hopeful', '/ˈhoʊpfl/', 'adjective', 'đầy hy vọng', 'He is hopeful that things will improve soon.', '', 'calm-relief', 8, ['positive']],
  ['patient', '/ˈpeɪʃnt/', 'adjective', 'kiên nhẫn', 'Please be patient while we solve the problem.', '', 'calm-relief', 9, ['positive']],
  ['balanced', '/ˈbælənst/', 'adjective', 'cân bằng, ổn định', 'A balanced lifestyle can improve your mood.', '', 'calm-relief', 10, ['positive']],

  ['mood', '/muːd/', 'noun', 'tâm trạng', 'Music can change your mood quickly.', '', 'emotional-states', 1, ['general']],
  ['feeling', '/ˈfiːlɪŋ/', 'noun', 'cảm giác, cảm xúc', 'It is important to talk about your feelings.', '', 'emotional-states', 2, ['general']],
  ['emotion', '/ɪˈmoʊʃn/', 'noun', 'cảm xúc', 'Anger is a natural emotion, but we must control it.', '', 'emotional-states', 3, ['general']],
  ['attitude', '/ˈætɪtuːd/', 'noun', 'thái độ', 'A positive attitude can help you overcome difficulties.', '', 'emotional-states', 4, ['general']],
  ['temper', '/ˈtempər/', 'noun', 'tính khí, cơn nóng giận', 'He has a bad temper when he is under stress.', '', 'emotional-states', 5, ['general']],
  ['sensitive', '/ˈsensətɪv/', 'adjective', 'nhạy cảm', 'She is sensitive to criticism.', '', 'emotional-states', 6, ['general']],
  ['emotional', '/ɪˈmoʊʃənl/', 'adjective', 'dễ xúc động, thuộc cảm xúc', 'The movie was very emotional.', '', 'emotional-states', 7, ['general']],
  ['calm down', '/kɑːm daʊn/', 'verb phrase', 'bình tĩnh lại', 'Take a deep breath and calm down.', '', 'emotional-states', 8, ['phrase']],
  ['cheer up', '/tʃɪr ʌp/', 'verb phrase', 'vui lên, làm ai vui lên', 'I tried to cheer up my friend after the exam.', '', 'emotional-states', 9, ['phrase', 'positive']],
  ['break down', '/breɪk daʊn/', 'verb phrase', 'suy sụp, bật khóc', 'She broke down when she heard the tragic news.', '', 'emotional-states', 10, ['phrase', 'negative']],

  ['proud', '/praʊd/', 'adjective', 'tự hào', 'His parents were proud of his hard work.', '', 'self-social-feelings', 1, ['positive']],
  ['humble', '/ˈhʌmbl/', 'adjective', 'khiêm tốn', 'Even after winning, she remained humble.', '', 'self-social-feelings', 2, ['positive']],
  ['awkward', '/ˈɔːkwərd/', 'adjective', 'ngượng ngùng, khó xử', 'There was an awkward silence after the joke.', '', 'self-social-feelings', 3, ['social']],
  ['shy', '/ʃaɪ/', 'adjective', 'nhút nhát, e thẹn', 'He was too shy to introduce himself.', '', 'self-social-feelings', 4, ['social']],
  ['guilty', '/ˈɡɪlti/', 'adjective', 'cảm thấy có lỗi', 'I felt guilty for forgetting her birthday.', '', 'self-social-feelings', 5, ['negative']],
  ['envious', '/ˈenviəs/', 'adjective', 'đố kỵ, ghen tị', 'He was envious of his friend\'s success.', '', 'self-social-feelings', 6, ['negative']],
  ['grumpy', '/ˈɡrʌmpi/', 'adjective', 'cáu kỉnh', 'My brother is grumpy when he wakes up early.', '', 'self-social-feelings', 7, ['negative']],
  ['hurt', '/hɜːrt/', 'adjective', 'bị tổn thương', 'She felt hurt by his careless words.', '', 'self-social-feelings', 8, ['negative']],
  ['rejected', '/rɪˈdʒektɪd/', 'adjective', 'bị từ chối, bị ruồng bỏ', 'He felt rejected when nobody invited him.', '', 'self-social-feelings', 9, ['negative']],
  ['accepted', '/əkˈseptɪd/', 'adjective', 'được chấp nhận', 'She finally felt accepted by her new classmates.', '', 'self-social-feelings', 10, ['positive']],

  ['hurtful', '/ˈhɜːrtfl/', 'adjective', 'gây tổn thương', 'Hurtful comments can damage a friendship.', '', 'emotional-reactions', 1, ['negative']],
  ['touching', '/ˈtʌtʃɪŋ/', 'adjective', 'cảm động', 'It was a touching story about friendship.', '', 'emotional-reactions', 2, ['positive']],
  ['moving', '/ˈmuːvɪŋ/', 'adjective', 'xúc động, cảm động', 'Her speech was deeply moving.', '', 'emotional-reactions', 3, ['positive']],
  ['disgusted', '/dɪsˈɡʌstɪd/', 'adjective', 'ghê tởm, kinh tởm', 'She felt disgusted by the dirty kitchen.', '', 'emotional-reactions', 4, ['negative', 'strong']],
  ['disgust', '/dɪsˈɡʌst/', 'noun', 'sự ghê tởm', 'He could not hide his disgust at the smell.', '', 'emotional-reactions', 5, ['negative']],
  ['amused', '/əˈmjuːzd/', 'adjective', 'thích thú, buồn cười', 'The audience was amused by his funny story.', '', 'emotional-reactions', 6, ['positive']],
  ['impressed', '/ɪmˈprest/', 'adjective', 'ấn tượng', 'I was impressed by her confidence.', '', 'emotional-reactions', 7, ['positive']],
  ['inspired', '/ɪnˈspaɪərd/', 'adjective', 'được truyền cảm hứng', 'The speech made everyone feel inspired.', '', 'emotional-reactions', 8, ['positive']],
  ['motivated', '/ˈmoʊtɪveɪtɪd/', 'adjective', 'có động lực', 'She felt motivated after receiving helpful feedback.', '', 'emotional-reactions', 9, ['positive']],
  ['desperate', '/ˈdespərət/', 'adjective', 'tuyệt vọng, liều lĩnh', 'He felt desperate after trying every possible solution.', '', 'emotional-reactions', 10, ['negative', 'strong']],

  ['delighted', '/dɪˈlaɪtɪd/', 'adjective', 'rất vui, hài lòng', 'We were delighted to receive your invitation.', '', 'intensity-nuance', 1, ['positive']],
  ['ecstatic', '/ɪkˈstætɪk/', 'adjective', 'ngây ngất, cực kỳ vui sướng', 'She was ecstatic when she passed the final exam.', '', 'intensity-nuance', 2, ['positive', 'advanced', 'strong']],
  ['devastated', '/ˈdevəsteɪtɪd/', 'adjective', 'suy sụp, đau đớn', 'The family was devastated by the accident.', '', 'intensity-nuance', 3, ['negative', 'strong']],
  ['horrified', '/ˈhɔːrɪfaɪd/', 'adjective', 'kinh hoàng', 'They were horrified by the violent scene.', '', 'intensity-nuance', 4, ['negative', 'strong']],
  ['furious with', '/ˈfjʊriəs wɪð/', 'phrase', 'giận dữ với ai/cái gì', 'She was furious with herself for making the same mistake.', '', 'intensity-nuance', 5, ['phrase', 'negative']],
  ['fed up', '/ˌfed ˈʌp/', 'adjective phrase', 'chán ngấy, chịu hết nổi', 'I am fed up with all these delays.', '', 'intensity-nuance', 6, ['phrase', 'negative']],
  ['downhearted', '/ˌdaʊnˈhɑːrtɪd/', 'adjective', 'nản lòng, buồn bã', 'The team felt downhearted after losing the match.', '', 'intensity-nuance', 7, ['negative', 'advanced']],
  ['lighthearted', '/ˌlaɪtˈhɑːrtɪd/', 'adjective', 'vui vẻ, vô tư', 'The conversation was lighthearted and friendly.', '', 'intensity-nuance', 8, ['positive', 'advanced']],
  ['mixed feelings', '/mɪkst ˈfiːlɪŋz/', 'noun phrase', 'cảm xúc lẫn lộn', 'I had mixed feelings about leaving my hometown.', '', 'intensity-nuance', 9, ['phrase']],
  ['emotionally stable', '/ɪˈmoʊʃənəli ˈsteɪbl/', 'adjective phrase', 'ổn định về mặt cảm xúc', 'He tries to stay emotionally stable under pressure.', '', 'intensity-nuance', 10, ['phrase', 'advanced']]
];

const advancedWords = new Set([
  'resentful', 'astonished', 'burned out', 'ecstatic', 'downhearted', 'lighthearted', 'emotionally stable'
]);

const cards = entries.map(([word, ipa, partOfSpeech, meaning, example, note, familyId, familyOrder, tags]) => ({
  fieldValues: {
    word,
    ipa,
    partOfSpeech,
    difficulty: advancedWords.has(word) || (tags || []).includes('advanced') ? 'advanced' : 'intermediate',
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
    source: 'curated emotion and feelings vocabulary seed',
    totalCards: cards.length,
    totalFamilies: new Set(entries.map(entry => entry[6])).size,
    generatedAt: '2026-05-08',
    note: 'Comprehensive seed for the Cảm xúc & Cảm giác topic. Covers basic emotions, positive and negative feelings, anxiety, empathy, stress, calm states, social feelings, and common emotional phrases.'
  },
  cards
};

for (const dir of ['packages/shell/public/seed-vocabulary']) {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'emotion-feelings.json'), JSON.stringify(seed, null, 2) + '\n', 'utf8');
}

console.log(`Generated ${cards.length} cards for ${topicId}.`);
