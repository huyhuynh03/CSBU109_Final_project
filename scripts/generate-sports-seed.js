const fs = require('fs');
const path = require('path');

const cards = [
  // --- Family: general-sports ---
  ['athlete','/ˈæθ.liːt/','noun','intermediate','vận động viên','Every athlete trains hard before a major competition.','general-sports'],
  ['athletics','/æθˈlet.ɪks/','noun','intermediate','môn điền kinh','Athletics includes running, jumping, and throwing events.','general-sports'],
  ['championship','/ˈtʃæm.pi.ən.ʃɪp/','noun','intermediate','giải vô địch','The national championship takes place every year.','general-sports'],
  ['competition','/ˌkɑːm.pəˈtɪʃ.ən/','noun','intermediate','cuộc thi đấu','The swimming competition attracted hundreds of participants.','general-sports'],
  ['competitor','/kəmˈpet.ɪ.t̬ɚ/','noun','intermediate','đối thủ, người thi đấu','Each competitor must register before the deadline.','general-sports'],
  ['sportsmanship','/ˈspɔːrts.mən.ʃɪp/','noun','intermediate','tinh thần thể thao','Good sportsmanship means respecting your opponent.','general-sports'],
  ['tournament','/ˈtʊr.nə.mənt/','noun','intermediate','giải đấu','The tennis tournament lasts two weeks.','general-sports'],
  ['league','/liːɡ/','noun','intermediate','giải liên đoàn, liên đoàn','The team was promoted to the top league.','general-sports'],
  ['fixture','/ˈfɪks.tʃɚ/','noun','advanced','lịch thi đấu, trận đấu theo lịch','The fixture list was released at the start of the season.','general-sports'],
  ['season ticket','/ˈsiː.zən ˌtɪk.ɪt/','noun','intermediate','vé mùa giải','A season ticket gives access to all home games.','general-sports'],
  ['fair play','/ˌfer ˈpleɪ/','noun','intermediate','chơi đẹp, tinh thần fair play','Fair play is valued more than winning at all costs.','general-sports'],
  ['team spirit','/ˈtiːm ˌspɪr.ɪt/','noun','intermediate','tinh thần đồng đội','Strong team spirit helped them win the final.','general-sports'],
  ['morale','/məˈræl/','noun','advanced','tinh thần, nhuệ khí','The coach worked hard to boost team morale.','general-sports'],

  // --- Family: venues-facilities ---
  ['stadium','/ˈsteɪ.di.əm/','noun','intermediate','sân vận động','The stadium holds over 60,000 spectators.','venues-facilities'],
  ['arena','/əˈriː.nə/','noun','intermediate','đấu trường, nhà thi đấu','The basketball arena was packed for the final.','venues-facilities'],
  ['pitch','/pɪtʃ/','noun','intermediate','sân cỏ (bóng đá)','The pitch was in perfect condition for the match.','venues-facilities'],
  ['court','/kɔːrt/','noun','intermediate','sân (tennis, bóng rổ)','Players warmed up on the court before the game.','venues-facilities'],
  ['track','/træk/','noun','intermediate','đường chạy','The 400-metre track surrounds the football field.','venues-facilities'],
  ['home ground','/ˈhoʊm ˌɡraʊnd/','noun','intermediate','sân nhà','Playing on home ground gives teams an advantage.','venues-facilities'],
  ['home advantage','/ˈhoʊm ədˌvæn.t̬ɪdʒ/','noun','intermediate','lợi thế sân nhà','Home advantage often leads to more wins.','venues-facilities'],
  ['away game','/əˈweɪ ˌɡeɪm/','noun','intermediate','trận đấu sân khách','The team struggled in the away game.','venues-facilities'],
  ['scoreboard','/ˈskɔːr.bɔːrd/','noun','intermediate','bảng tỉ số','The scoreboard showed a tied result at halftime.','venues-facilities'],

  // --- Family: track-field ---
  ['field event','/ˈfiːld ɪˌvent/','noun','advanced','môn thi trên sân (nhảy, ném)','The long jump is a popular field event.','track-field'],
  ['track event','/ˈtræk ɪˌvent/','noun','advanced','môn thi trên đường chạy','The 100-metre dash is the fastest track event.','track-field'],
  ['marathon','/ˈmær.ə.θɑːn/','noun','intermediate','cuộc chạy marathon','She completed her first marathon in under four hours.','track-field'],
  ['sprint','/sprɪnt/','noun','intermediate','chạy nước rút','The sprint requires explosive speed.','track-field'],
  ['relay race','/rɪˈleɪ ˌreɪs/','noun','intermediate','chạy tiếp sức','Each runner covers one leg of the relay race.','track-field'],
  ['hurdle','/ˈhɝː.dəl/','noun','intermediate','rào chắn, môn chạy vượt rào','She cleared every hurdle without slowing down.','track-field'],
  ['long jump','/ˈlɑːŋ ˌdʒʌmp/','noun','intermediate','nhảy xa','His long jump measured over eight metres.','track-field'],
  ['high jump','/ˈhaɪ ˌdʒʌmp/','noun','intermediate','nhảy cao','The high jump bar was raised to two metres.','track-field'],
  ['pole vault','/ˈpoʊl ˌvɑːlt/','noun','advanced','nhảy sào','Pole vault requires both speed and technique.','track-field'],
  ['javelin','/ˈdʒæv.lɪn/','noun','advanced','môn ném lao','The javelin flew over 80 metres.','track-field'],
  ['discus','/ˈdɪs.kəs/','noun','advanced','môn ném đĩa','She won gold in the discus throw.','track-field'],
  ['shot put','/ˈʃɑːt ˌpʊt/','noun','advanced','môn đẩy tạ','Shot put athletes need great upper-body strength.','track-field'],
  ['triathlon','/traɪˈæθ.lɑːn/','noun','advanced','ba môn phối hợp','A triathlon combines swimming, cycling, and running.','track-field'],
  ['decathlon','/dɪˈkæθ.lɑːn/','noun','advanced','mười môn phối hợp','The decathlon tests athletes across ten events.','track-field'],

  // --- Family: football-terms ---
  ['goalkeeper','/ˈɡoʊlˌkiː.pɚ/','noun','intermediate','thủ môn','The goalkeeper made a brilliant save.','football-terms'],
  ['striker','/ˈstraɪ.kɚ/','noun','intermediate','tiền đạo','The striker scored twice in the first half.','football-terms'],
  ['midfielder','/ˈmɪdˌfiːl.dɚ/','noun','intermediate','tiền vệ','The midfielder controlled the pace of the game.','football-terms'],
  ['defender','/dɪˈfen.dɚ/','noun','intermediate','hậu vệ','The defender blocked the shot on the goal line.','football-terms'],
  ['substitute','/ˈsʌb.stɪ.tuːt/','noun','intermediate','cầu thủ dự bị','The substitute came on in the second half.','football-terms'],
  ['referee','/ˌref.əˈriː/','noun','intermediate','trọng tài','The referee awarded a penalty kick.','football-terms'],
  ['foul','/faʊl/','noun','intermediate','lỗi phạm luật','The foul was committed near the penalty area.','football-terms'],
  ['penalty','/ˈpen.əl.ti/','noun','intermediate','quả phạt đền','He scored from the penalty spot.','football-terms'],
  ['free kick','/ˈfriː ˌkɪk/','noun','intermediate','quả đá phạt','The free kick curled over the wall.','football-terms'],
  ['corner kick','/ˈkɔːr.nɚ ˌkɪk/','noun','intermediate','quả phạt góc','A corner kick led to the winning goal.','football-terms'],
  ['offside','/ˌɑːfˈsaɪd/','noun','intermediate','việt vị','The goal was disallowed for offside.','football-terms'],
  ['yellow card','/ˈjel.oʊ ˌkɑːrd/','noun','intermediate','thẻ vàng','He received a yellow card for a late tackle.','football-terms'],
  ['red card','/ˈred ˌkɑːrd/','noun','intermediate','thẻ đỏ','A red card means the player must leave the field.','football-terms'],
  ['hat trick','/ˈhæt ˌtrɪk/','noun','intermediate','cú hat-trick (ghi 3 bàn)','The forward completed a hat trick before halftime.','football-terms'],
  ['own goal','/ˌoʊn ˈɡoʊl/','noun','intermediate','bàn phản lưới nhà','An own goal gave the visitors the lead.','football-terms'],
  ['clean sheet','/ˌkliːn ˈʃiːt/','noun','advanced','trận giữ sạch lưới','The team kept a clean sheet for the third game.','football-terms'],
  ['kickoff','/ˈkɪk.ɑːf/','noun','intermediate','giờ bắt đầu trận đấu','Kickoff is scheduled for 8 PM.','football-terms'],
  ['halftime','/ˈhæf.taɪm/','noun','intermediate','giờ nghỉ giữa hiệp','The score was 1-0 at halftime.','football-terms'],
  ['extra time','/ˈek.strə ˌtaɪm/','noun','intermediate','hiệp phụ','The match went to extra time after a draw.','football-terms'],
  ['stoppage time','/ˈstɑː.pɪdʒ ˌtaɪm/','noun','advanced','thời gian bù giờ','A goal in stoppage time decided the match.','football-terms'],
  ['formation','/fɔːrˈmeɪ.ʃən/','noun','intermediate','đội hình','The coach changed the formation at halftime.','football-terms'],
  ['counterattack','/ˈkaʊn.t̬ɚ.əˌtæk/','noun','advanced','phản công','A quick counterattack led to the second goal.','football-terms'],
  ['possession','/pəˈzeʃ.ən/','noun','intermediate','quyền kiểm soát bóng','The team had 60 percent possession.','football-terms'],
  ['assist','/əˈsɪst/','noun','intermediate','đường kiến tạo','The midfielder provided the assist for the goal.','football-terms'],
  ['relegation','/ˌrel.ɪˈɡeɪ.ʃən/','noun','advanced','xuống hạng','Relegation was confirmed after the final match.','football-terms'],
  ['promotion','/prəˈmoʊ.ʃən/','noun','intermediate','thăng hạng','The club celebrated promotion to the top division.','football-terms'],
  ['derby','/ˈdɝː.bi/','noun','advanced','trận derby (đội cùng thành phố)','The local derby attracted a full stadium.','football-terms'],
  ['rivalry','/ˈraɪ.vəl.ri/','noun','intermediate','sự kình địch','The rivalry between the two clubs is legendary.','football-terms'],

  // --- Family: tennis-terms ---
  ['ace','/eɪs/','noun','intermediate','cú giao bóng ăn điểm trực tiếp','She hit 12 aces during the match.','tennis-terms'],
  ['deuce','/duːs/','noun','advanced','điểm hòa 40-40','The game reached deuce three times.','tennis-terms'],
  ['match point','/ˈmætʃ ˌpɔɪnt/','noun','intermediate','điểm kết thúc trận','He saved two match points before winning.','tennis-terms'],
  ['break point','/ˈbreɪk ˌpɔɪnt/','noun','advanced','điểm phá giao bóng','She converted the break point to take the lead.','tennis-terms'],
  ['volley','/ˈvɑː.li/','noun','intermediate','cú đánh bóng chưa nảy','A sharp volley at the net won the point.','tennis-terms'],
  ['backhand','/ˈbæk.hænd/','noun','intermediate','cú đánh trái tay','Her backhand is one of the best on tour.','tennis-terms'],
  ['forehand','/ˈfɔːr.hænd/','noun','intermediate','cú đánh thuận tay','He hit a powerful forehand down the line.','tennis-terms'],
  ['rally','/ˈræl.i/','noun','intermediate','pha bóng qua lại','The rally lasted over 30 shots.','tennis-terms'],
  ['smash','/smæʃ/','noun','intermediate','cú đập bóng','The smash was too fast to return.','tennis-terms'],
  ['lob','/lɑːb/','noun','advanced','cú bóng bổng qua đầu','A perfect lob sailed over the opponent.','tennis-terms'],
  ['drop shot','/ˈdrɑːp ˌʃɑːt/','noun','advanced','cú thả nhẹ qua lưới','The drop shot caught the opponent off guard.','tennis-terms'],
  ['singles','/ˈsɪŋ.ɡəlz/','noun','intermediate','đánh đơn','She won the singles title for the third time.','tennis-terms'],
  ['doubles','/ˈdʌb.əlz/','noun','intermediate','đánh đôi','They partnered in doubles at the Olympics.','tennis-terms'],
  ['grand slam','/ˌɡrænd ˈslæm/','noun','intermediate','giải Grand Slam','Winning all four grand slams is extremely rare.','tennis-terms'],
  ['tiebreak','/ˈtaɪ.breɪk/','noun','advanced','loạt tie-break','The first set was decided by a tiebreak.','tennis-terms'],
  ['seeding','/ˈsiː.dɪŋ/','noun','advanced','xếp hạng hạt giống','Seeding determines the draw for the tournament.','tennis-terms'],
  ['wild card','/ˈwaɪld ˌkɑːrd/','noun','advanced','suất đặc cách','The young player received a wild card entry.','tennis-terms'],

  // --- Family: coaching-training ---
  ['head coach','/ˈhed ˌkoʊtʃ/','noun','intermediate','huấn luyện viên trưởng','The head coach announced the starting lineup.','coaching-training'],
  ['assistant coach','/əˈsɪs.tənt ˌkoʊtʃ/','noun','intermediate','trợ lý huấn luyện viên','The assistant coach led the training session.','coaching-training'],
  ['fitness trainer','/ˈfɪt.nəs ˌtreɪ.nɚ/','noun','intermediate','huấn luyện viên thể lực','The fitness trainer designed a new program.','coaching-training'],
  ['physiotherapist','/ˌfɪz.i.oʊˈθer.ə.pɪst/','noun','advanced','chuyên viên vật lý trị liệu','The physiotherapist treated the knee injury.','coaching-training'],
  ['cool-down','/ˈkuːl ˌdaʊn/','noun','intermediate','giai đoạn hạ nhiệt sau tập','A proper cool-down prevents muscle soreness.','coaching-training'],
  ['stretching','/ˈstretʃ.ɪŋ/','noun','intermediate','bài tập giãn cơ','Stretching before exercise reduces injury risk.','coaching-training'],
  ['stamina','/ˈstæm.ə.nə/','noun','intermediate','sức bền, thể lực','Long-distance runners need excellent stamina.','coaching-training'],
  ['agility','/əˈdʒɪl.ə.t̬i/','noun','advanced','sự nhanh nhẹn','Agility drills improve a player\'s reaction time.','coaching-training'],
  ['interval training','/ˈɪn.t̬ɚ.vəl ˌtreɪ.nɪŋ/','noun','advanced','tập luyện xen kẽ cường độ','Interval training alternates high and low effort.','coaching-training'],
  ['circuit training','/ˈsɝː.kɪt ˌtreɪ.nɪŋ/','noun','advanced','tập luyện theo vòng','Circuit training targets different muscle groups.','coaching-training'],
  ['tactics','/ˈtæk.tɪks/','noun','intermediate','chiến thuật','The coach explained the tactics before the game.','coaching-training'],
  ['strategy','/ˈstræt̬.ə.dʒi/','noun','intermediate','chiến lược','A defensive strategy helped protect the lead.','coaching-training'],
  ['lineup','/ˈlaɪn.ʌp/','noun','intermediate','đội hình ra sân','The lineup was announced one hour before kickoff.','coaching-training'],
  ['captain','/ˈkæp.tɪn/','noun','intermediate','đội trưởng','The captain led the team onto the pitch.','coaching-training'],

  // --- Family: results-records ---
  ['medal','/ˈmed.əl/','noun','intermediate','huy chương','She won a gold medal at the Olympics.','results-records'],
  ['gold medal','/ˈɡoʊld ˌmed.əl/','noun','intermediate','huy chương vàng','The swimmer earned a gold medal in the 200m.','results-records'],
  ['silver medal','/ˈsɪl.vɚ ˌmed.əl/','noun','intermediate','huy chương bạc','A silver medal is still a great achievement.','results-records'],
  ['bronze medal','/ˈbrɑːnz ˌmed.əl/','noun','intermediate','huy chương đồng','He took the bronze medal in the final event.','results-records'],
  ['podium','/ˈpoʊ.di.əm/','noun','intermediate','bục nhận giải','Three athletes stood on the podium.','results-records'],
  ['record-breaking','/ˈrek.ɚd ˌbreɪ.kɪŋ/','adjective','intermediate','phá kỷ lục','It was a record-breaking performance.','results-records'],
  ['personal best','/ˌpɝː.sən.əl ˈbest/','noun','intermediate','thành tích cá nhân tốt nhất','She achieved a personal best in the 100m.','results-records'],
  ['world record','/ˌwɝːld ˈrek.ɚd/','noun','intermediate','kỷ lục thế giới','The world record stood for over ten years.','results-records'],
  ['comeback','/ˈkʌm.bæk/','noun','intermediate','cuộc lội ngược dòng','The team made an incredible comeback.','results-records'],
  ['underdog','/ˈʌn.dɚ.dɑːɡ/','noun','intermediate','đội cửa dưới','The underdog surprised everyone by winning.','results-records'],
  ['dark horse','/ˌdɑːrk ˈhɔːrs/','noun','advanced','ngựa ô, ứng viên bất ngờ','The dark horse reached the semifinal.','results-records'],
  ['playoff','/ˈpleɪ.ɑːf/','noun','intermediate','trận play-off','The playoff decides who gets promoted.','results-records'],
  ['quarterfinal','/ˌkwɔːr.t̬ɚˈfaɪ.nəl/','noun','intermediate','tứ kết','They were eliminated in the quarterfinal.','results-records'],
  ['semifinal','/ˌsem.iˈfaɪ.nəl/','noun','intermediate','bán kết','The semifinal attracted a huge audience.','results-records'],
  ['scoreline','/ˈskɔːr.laɪn/','noun','advanced','tỉ số trận đấu','The scoreline did not reflect how close the game was.','results-records'],
  ['standings','/ˈstæn.dɪŋz/','noun','intermediate','bảng xếp hạng','The team moved to the top of the standings.','results-records'],

  // --- Family: fans-spectators ---
  ['spectator','/ˈspek.teɪ.t̬ɚ/','noun','intermediate','khán giả','Over 50,000 spectators attended the match.','fans-spectators'],
  ['supporter','/səˈpɔːr.t̬ɚ/','noun','intermediate','cổ động viên','Loyal supporters travel to every away game.','fans-spectators'],
  ['cheer','/tʃɪr/','verb','intermediate','cổ vũ, hò reo','Fans cheer loudly when their team scores.','fans-spectators'],
  ['chant','/tʃænt/','noun','intermediate','bài hát cổ động','The crowd sang a chant for the captain.','fans-spectators'],
  ['banner','/ˈbæn.ɚ/','noun','intermediate','băng-rôn','Supporters held up a giant banner.','fans-spectators'],
  ['mascot','/ˈmæs.kɑːt/','noun','intermediate','linh vật','The team mascot entertained the crowd.','fans-spectators'],

  // --- Family: rules-discipline ---
  ['doping','/ˈdoʊ.pɪŋ/','noun','advanced','sử dụng chất cấm','Doping can lead to a lifetime ban.','rules-discipline'],
  ['anti-doping','/ˌæn.t̬i ˈdoʊ.pɪŋ/','noun','advanced','chống doping','Anti-doping tests are conducted after every race.','rules-discipline'],
  ['disqualification','/dɪsˌkwɑː.lɪ.fɪˈkeɪ.ʃən/','noun','advanced','sự truất quyền thi đấu','Disqualification followed the failed drug test.','rules-discipline'],
  ['suspension','/səˈspen.ʃən/','noun','advanced','án treo giò','The player received a three-match suspension.','rules-discipline'],
  ['point deduction','/ˈpɔɪnt dɪˌdʌk.ʃən/','noun','advanced','trừ điểm','A point deduction dropped the team in the table.','rules-discipline'],
  ['unsportsmanlike conduct','/ʌnˈspɔːrts.mən.laɪk ˈkɑːn.dʌkt/','noun','advanced','hành vi phi thể thao','Unsportsmanlike conduct results in a penalty.','rules-discipline'],
  ['transfer window','/ˈtræns.fɝː ˌwɪn.doʊ/','noun','advanced','kỳ chuyển nhượng','The club signed two players during the transfer window.','rules-discipline'],
  ['transfer fee','/ˈtræns.fɝː ˌfiː/','noun','advanced','phí chuyển nhượng','The transfer fee broke the club record.','rules-discipline'],
  ['contract extension','/ˈkɑːn.trækt ɪkˌsten.ʃən/','noun','advanced','gia hạn hợp đồng','The star player signed a contract extension.','rules-discipline']
];

const seed = {
  _meta: {
    topicId: 'sports',
    topicName: 'Thể thao',
    level: 'intermediate',
    source: 'Curated IELTS/Academic Vocabulary - Sports (B1-B2)',
    totalCards: cards.length,
    totalFamilies: new Set(cards.map(c => c[6])).size,
    generatedAt: '2026-05-12',
    note: 'Tu vung bo sung cho chu de The thao, da loc tranh trung word voi cac topic seed hien co.'
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
  fs.writeFileSync(path.join(dir, 'sports.json'), JSON.stringify(seed, null, 2) + '\n', 'utf8');
}

console.log(`Wrote sports.json with ${seed._meta.totalCards} cards and ${seed._meta.totalFamilies} families.`);
