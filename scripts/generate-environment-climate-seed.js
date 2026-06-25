// ============================================
// Generate Seed: Môi trường & Biến đổi khí hậu
// ============================================
// Tạo file seed vocabulary cho topic environment-climate.
// - Tránh trùng lặp với toàn bộ từ vựng hiện có ở các topic khác.
// - Tránh trùng lặp nội bộ trong chính topic này.
// - Nhóm các từ cùng family (chia sẻ gốc từ) vào một familyId chung.
// - Nếu phát hiện family chéo với từ ở topic khác (theo gốc từ),
//   ghi chú trong meta.crossTopicFamilies để tham chiếu.

const fs = require('fs');
const path = require('path');

const SEED_DIR = path.join(__dirname, '..', 'packages', 'shell', 'public', 'seed-vocabulary');
const OUTPUT_FILE = path.join(SEED_DIR, 'environment-climate.json');

// ---------- 1. Load tất cả từ vựng hiện có ----------
function loadExistingWords() {
    const map = new Map(); // word -> { topicId, familyId }
    const files = fs.readdirSync(SEED_DIR).filter((f) => f.endsWith('.json'));
    for (const f of files) {
        if (f === 'environment-climate.json') continue;
        try {
            const data = JSON.parse(
                fs.readFileSync(path.join(SEED_DIR, f), 'utf8')
            );
            const topicId = data?._meta?.topicId || f.replace('.json', '');
            if (Array.isArray(data?.cards)) {
                for (const c of data.cards) {
                    const fv = c?.fieldValues;
                    if (!fv?.word) continue;
                    map.set(fv.word.toLowerCase(), {
                        topicId,
                        familyId: fv.familyId || null,
                        word: fv.word,
                    });
                }
            }
        } catch (e) {
            console.warn('Skip', f, e.message);
        }
    }
    return map;
}

// ---------- 2. Danh sách từ vựng đề xuất cho topic ----------
// Tổ chức theo nhóm family (mỗi nhóm có cùng gốc từ → cùng familyId).
// Mỗi entry: { word, ipa, partOfSpeech, meaning, example }
// familyId được sinh tự động theo nhóm.

const FAMILIES = [
    // ==========================================
    // 1. Pollution (Ô nhiễm)
    // ==========================================
    {
        familyId: 'environment-climate-pollution',
        words: [
            {
                word: 'pollution',
                ipa: '/pəˈluː.ʃən/',
                partOfSpeech: 'noun',
                meaning: 'sự ô nhiễm',
                example: 'Air pollution affects millions of people every year.',
            },
            {
                word: 'pollute',
                ipa: '/pəˈluːt/',
                partOfSpeech: 'verb',
                meaning: 'làm ô nhiễm',
                example: 'Factories pollute rivers with toxic waste.',
            },
            {
                word: 'pollutant',
                ipa: '/pəˈluː.tənt/',
                partOfSpeech: 'noun',
                meaning: 'chất gây ô nhiễm',
                example: 'Cars release harmful pollutants into the air.',
            },
            {
                word: 'polluted',
                ipa: '/pəˈluː.tɪd/',
                partOfSpeech: 'adjective',
                meaning: 'bị ô nhiễm',
                example: 'The polluted river killed many fish.',
            },
        ],
    },

    // ==========================================
    // 2. Contamination (Sự nhiễm bẩn)
    // ==========================================
    {
        familyId: 'environment-climate-contamination',
        words: [
            {
                word: 'contamination',
                ipa: '/kənˌtæm.ɪˈneɪ.ʃən/',
                partOfSpeech: 'noun',
                meaning: 'sự nhiễm bẩn',
                example:
                    'Water contamination is a serious health threat in many regions.',
            },
            {
                word: 'contaminate',
                ipa: '/kənˈtæm.ɪ.neɪt/',
                partOfSpeech: 'verb',
                meaning: 'làm nhiễm bẩn',
                example: 'Pesticides can contaminate groundwater for decades.',
            },
            {
                word: 'contaminant',
                ipa: '/kənˈtæm.ɪ.nənt/',
                partOfSpeech: 'noun',
                meaning: 'chất gây ô nhiễm',
                example:
                    'Heavy metals are dangerous contaminants found in soil.',
            },
        ],
    },

    // ==========================================
    // 3. Emission (Khí thải)
    // ==========================================
    {
        familyId: 'environment-climate-emission',
        words: [
            {
                word: 'emission',
                ipa: '/ɪˈmɪʃ.ən/',
                partOfSpeech: 'noun',
                meaning: 'khí thải, sự phát thải',
                example:
                    'The government wants to cut carbon emissions by half.',
            },
            {
                word: 'emit',
                ipa: '/ɪˈmɪt/',
                partOfSpeech: 'verb',
                meaning: 'phát thải, thải ra',
                example: 'Coal-fired power plants emit large amounts of CO2.',
            },
            {
                word: 'greenhouse gas',
                ipa: '/ˈɡriːn.haʊs ˌɡæs/',
                partOfSpeech: 'noun',
                meaning: 'khí nhà kính',
                example:
                    'Methane is a powerful greenhouse gas that traps heat.',
            },
        ],
    },

    // ==========================================
    // 4. Climate change (Biến đổi khí hậu)
    // ==========================================
    {
        familyId: 'environment-climate-climate',
        words: [
            {
                word: 'climate',
                ipa: '/ˈklaɪ.mət/',
                partOfSpeech: 'noun',
                meaning: 'khí hậu',
                example: 'Vietnam has a tropical climate with two seasons.',
            },
            {
                word: 'climate change',
                ipa: '/ˈklaɪ.mət ˌtʃeɪndʒ/',
                partOfSpeech: 'noun',
                meaning: 'biến đổi khí hậu',
                example:
                    'Climate change is one of the greatest challenges of our time.',
            },
            {
                word: 'climatic',
                ipa: '/klaɪˈmæt.ɪk/',
                partOfSpeech: 'adjective',
                meaning: 'thuộc về khí hậu',
                example: 'Sudden climatic shifts can destroy entire ecosystems.',
            },
            {
                word: 'global warming',
                ipa: '/ˌɡloʊ.bəl ˈwɔːr.mɪŋ/',
                partOfSpeech: 'noun',
                meaning: 'sự nóng lên toàn cầu',
                example:
                    'Global warming is causing sea levels to rise worldwide.',
            },
            {
                word: 'greenhouse effect',
                ipa: '/ˈɡriːn.haʊs ɪˌfekt/',
                partOfSpeech: 'noun',
                meaning: 'hiệu ứng nhà kính',
                example:
                    'The greenhouse effect keeps the Earth warm enough for life.',
            },
        ],
    },

    // ==========================================
    // 5. Sustainability (Tính bền vững)
    // ==========================================
    {
        familyId: 'environment-climate-sustainability',
        words: [
            {
                word: 'sustainability',
                ipa: '/səˌsteɪ.nəˈbɪl.ə.ti/',
                partOfSpeech: 'noun',
                meaning: 'tính bền vững',
                example:
                    'Sustainability should guide every business decision today.',
            },
            {
                word: 'sustainable',
                ipa: '/səˈsteɪ.nə.bəl/',
                partOfSpeech: 'adjective',
                meaning: 'bền vững',
                example: 'We need a sustainable approach to using resources.',
            },
            {
                word: 'sustain',
                ipa: '/səˈsteɪn/',
                partOfSpeech: 'verb',
                meaning: 'duy trì, hỗ trợ lâu dài',
                example: 'Forests sustain countless species of plants and animals.',
            },
            {
                word: 'sustainably',
                ipa: '/səˈsteɪ.nə.bli/',
                partOfSpeech: 'adverb',
                meaning: 'một cách bền vững',
                example: 'This coffee is grown sustainably by local farmers.',
            },
        ],
    },

    // ==========================================
    // 6. Conservation (Bảo tồn)
    // ==========================================
    {
        familyId: 'environment-climate-conservation',
        words: [
            {
                word: 'conservation',
                ipa: '/ˌkɒn.səˈveɪ.ʃən/',
                partOfSpeech: 'noun',
                meaning: 'sự bảo tồn',
                example:
                    'Wildlife conservation requires international cooperation.',
            },
            {
                word: 'conserve',
                ipa: '/kənˈsɜːv/',
                partOfSpeech: 'verb',
                meaning: 'bảo tồn, giữ gìn',
                example: 'We must conserve water during the dry season.',
            },
            {
                word: 'conservationist',
                ipa: '/ˌkɒn.səˈveɪ.ʃən.ɪst/',
                partOfSpeech: 'noun',
                meaning: 'nhà bảo tồn',
                example:
                    'Conservationists work hard to protect endangered species.',
            },
        ],
    },

    // ==========================================
    // 7. Preservation (Sự gìn giữ)
    // ==========================================
    {
        familyId: 'environment-climate-preservation',
        words: [
            {
                word: 'preservation',
                ipa: '/ˌprez.əˈveɪ.ʃən/',
                partOfSpeech: 'noun',
                meaning: 'sự gìn giữ, bảo tồn',
                example:
                    'The preservation of rainforests is vital for the planet.',
            },
            {
                word: 'preserve',
                ipa: '/prɪˈzɜːv/',
                partOfSpeech: 'verb',
                meaning: 'gìn giữ, bảo tồn',
                example: 'National parks help preserve natural habitats.',
            },
        ],
    },

    // ==========================================
    // 8. Protection (Sự bảo vệ)
    // ==========================================
    {
        familyId: 'environment-climate-protection',
        words: [
            {
                word: 'protection',
                ipa: '/prəˈtek.ʃən/',
                partOfSpeech: 'noun',
                meaning: 'sự bảo vệ',
                example:
                    'Environmental protection is a shared global responsibility.',
            },
            {
                word: 'protect',
                ipa: '/prəˈtekt/',
                partOfSpeech: 'verb',
                meaning: 'bảo vệ',
                example:
                    'New laws aim to protect the rainforest from logging.',
            },
            {
                word: 'protective',
                ipa: '/prəˈtek.tɪv/',
                partOfSpeech: 'adjective',
                meaning: 'có tính bảo vệ',
                example:
                    'The ozone layer is a protective shield around the Earth.',
            },
        ],
    },

    // ==========================================
    // 9. Renewable resources (Tài nguyên tái tạo)
    // ==========================================
    {
        familyId: 'environment-climate-renewable',
        words: [
            {
                word: 'renewable',
                ipa: '/rɪˈnjuː.ə.bəl/',
                partOfSpeech: 'adjective',
                meaning: 'có thể tái tạo',
                example:
                    'Wind and water are clean renewable sources of power.',
            },
            {
                word: 'renew',
                ipa: '/rɪˈnjuː/',
                partOfSpeech: 'verb',
                meaning: 'tái tạo, làm mới',
                example: 'Forests slowly renew themselves after a fire.',
            },
            {
                word: 'non-renewable',
                ipa: '/ˌnɒn.rɪˈnjuː.ə.bəl/',
                partOfSpeech: 'adjective',
                meaning: 'không thể tái tạo',
                example: 'Coal and oil are non-renewable fossil fuels.',
            },
        ],
    },

    // ==========================================
    // 10. Recycling (Tái chế)
    // Nhóm cùng familyId "waste" với "recycle" ở topic home-living
    // ==========================================
    {
        familyId: 'waste',
        words: [
            {
                word: 'recycling',
                ipa: '/ˌriːˈsaɪ.klɪŋ/',
                partOfSpeech: 'noun',
                meaning: 'sự tái chế',
                example: 'Recycling helps reduce the amount of plastic waste.',
            },
            {
                word: 'recyclable',
                ipa: '/ˌriːˈsaɪ.klə.bəl/',
                partOfSpeech: 'adjective',
                meaning: 'có thể tái chế',
                example: 'Glass bottles are fully recyclable materials.',
            },
            {
                word: 'reuse',
                ipa: '/ˌriːˈjuːz/',
                partOfSpeech: 'verb',
                meaning: 'tái sử dụng',
                example: 'We can reuse plastic bags many times before throwing them away.',
            },
            {
                word: 'reduce',
                ipa: '/rɪˈdʒuːs/',
                partOfSpeech: 'verb',
                meaning: 'giảm thiểu',
                example: 'Riding a bike helps reduce traffic and pollution.',
            },
        ],
    },

    // ==========================================
    // 11. Deforestation (Nạn phá rừng)
    // ==========================================
    {
        familyId: 'environment-climate-deforestation',
        words: [
            {
                word: 'deforestation',
                ipa: '/diːˌfɒr.ɪˈsteɪ.ʃən/',
                partOfSpeech: 'noun',
                meaning: 'nạn phá rừng',
                example:
                    'Deforestation in the Amazon has reached alarming levels.',
            },
            {
                word: 'reforestation',
                ipa: '/ˌriː.fɒr.ɪˈsteɪ.ʃən/',
                partOfSpeech: 'noun',
                meaning: 'sự trồng lại rừng',
                example: 'Reforestation projects are helping bring back wildlife.',
            },
            {
                word: 'afforestation',
                ipa: '/əˌfɒr.ɪˈsteɪ.ʃən/',
                partOfSpeech: 'noun',
                meaning: 'sự trồng rừng mới',
                example:
                    'Afforestation creates new forests in areas that had none before.',
            },
            {
                word: 'logging',
                ipa: '/ˈlɒɡ.ɪŋ/',
                partOfSpeech: 'noun',
                meaning: 'việc khai thác gỗ',
                example: 'Illegal logging destroys habitats for many animals.',
            },
        ],
    },

    // ==========================================
    // 12. Habitat (Môi trường sống)
    // ==========================================
    {
        familyId: 'environment-climate-habitat',
        words: [
            {
                word: 'habitat',
                ipa: '/ˈhæb.ɪ.tæt/',
                partOfSpeech: 'noun',
                meaning: 'môi trường sống',
                example:
                    'The polar bear is losing its natural habitat to melting ice.',
            },
            {
                word: 'habitat loss',
                ipa: '/ˈhæb.ɪ.tæt ˌlɒs/',
                partOfSpeech: 'noun',
                meaning: 'mất môi trường sống',
                example:
                    'Habitat loss is the biggest threat to many wild animals.',
            },
        ],
    },

    // ==========================================
    // 13. Endangered species (Loài có nguy cơ tuyệt chủng)
    // ==========================================
    {
        familyId: 'environment-climate-endangered',
        words: [
            {
                word: 'endangered',
                ipa: '/ɪnˈdeɪn.dʒəd/',
                partOfSpeech: 'adjective',
                meaning: 'có nguy cơ tuyệt chủng',
                example:
                    'Tigers are an endangered species in many parts of Asia.',
            },
            {
                word: 'endanger',
                ipa: '/ɪnˈdeɪn.dʒər/',
                partOfSpeech: 'verb',
                meaning: 'gây nguy hiểm cho, đe dọa',
                example: 'Plastic pollution endangers marine life every day.',
            },
            {
                word: 'extinction',
                ipa: '/ɪkˈstɪŋk.ʃən/',
                partOfSpeech: 'noun',
                meaning: 'sự tuyệt chủng',
                example:
                    'Many animals face extinction because of human activity.',
            },
            {
                word: 'extinct',
                ipa: '/ɪkˈstɪŋkt/',
                partOfSpeech: 'adjective',
                meaning: 'tuyệt chủng',
                example:
                    'The dodo bird became extinct in the seventeenth century.',
            },
        ],
    },

    // ==========================================
    // 14. Global warming-related (Trái đất, khí quyển)
    // ==========================================
    {
        familyId: 'environment-climate-atmosphere',
        words: [
            {
                word: 'atmosphere',
                ipa: '/ˈæt.mə.sfɪər/',
                partOfSpeech: 'noun',
                meaning: 'bầu khí quyển',
                example: 'The Earth\'s atmosphere protects us from harmful rays.',
            },
            {
                word: 'atmospheric',
                ipa: '/ˌæt.məˈsfer.ɪk/',
                partOfSpeech: 'adjective',
                meaning: 'thuộc khí quyển',
                example:
                    'Atmospheric carbon dioxide levels keep rising every year.',
            },
            {
                word: 'ozone layer',
                ipa: '/ˈəʊ.zəʊn ˌleɪ.ər/',
                partOfSpeech: 'noun',
                meaning: 'tầng ozon',
                example: 'The ozone layer absorbs most of the sun\'s UV rays.',
            },
        ],
    },

    // ==========================================
    // 15. Waste management (Quản lý rác thải)
    // ==========================================
    {
        familyId: 'environment-climate-waste',
        words: [
            {
                word: 'landfill',
                ipa: '/ˈlænd.fɪl/',
                partOfSpeech: 'noun',
                meaning: 'bãi chôn rác',
                example: 'Most household waste still ends up in a landfill.',
            },
            {
                word: 'sewage',
                ipa: '/ˈsuː.ɪdʒ/',
                partOfSpeech: 'noun',
                meaning: 'nước thải sinh hoạt',
                example:
                    'Untreated sewage often flows directly into rivers and seas.',
            },
            {
                word: 'litter',
                ipa: '/ˈlɪt.ər/',
                partOfSpeech: 'noun',
                meaning: 'rác vứt bừa bãi',
                example: 'There was litter all over the beach after the festival.',
            },
            {
                word: 'biodegradable',
                ipa: '/ˌbaɪ.əʊ.dɪˈɡreɪ.də.bəl/',
                partOfSpeech: 'adjective',
                meaning: 'có thể phân hủy sinh học',
                example: 'These bags are made from biodegradable materials.',
            },
            {
                word: 'compost',
                ipa: '/ˈkɒm.pɒst/',
                partOfSpeech: 'noun',
                meaning: 'phân hữu cơ',
                example: 'Food scraps can be turned into compost for the garden.',
            },
        ],
    },

    // ==========================================
    // 16. Disaster (Thiên tai)
    // ==========================================
    {
        familyId: 'environment-climate-disaster',
        words: [
            {
                word: 'natural disaster',
                ipa: '/ˌnætʃ.ər.əl dɪˈzɑː.stər/',
                partOfSpeech: 'noun',
                meaning: 'thiên tai',
                example:
                    'Floods and droughts are natural disasters worsened by climate change.',
            },
            {
                word: 'drought',
                ipa: '/draʊt/',
                partOfSpeech: 'noun',
                meaning: 'hạn hán',
                example: 'A long drought destroyed most of the rice fields.',
            },
            {
                word: 'flood',
                ipa: '/flʌd/',
                partOfSpeech: 'noun',
                meaning: 'lũ lụt',
                example: 'Heavy rain caused a flood that damaged many homes.',
            },
            {
                word: 'wildfire',
                ipa: '/ˈwaɪld.faɪər/',
                partOfSpeech: 'noun',
                meaning: 'cháy rừng',
                example: 'Hotter summers are making wildfires more common.',
            },
            {
                word: 'heatwave',
                ipa: '/ˈhiːt.weɪv/',
                partOfSpeech: 'noun',
                meaning: 'đợt nóng kéo dài',
                example: 'The recent heatwave broke many temperature records.',
            },
            {
                word: 'hurricane',
                ipa: '/ˈhʌr.ɪ.kən/',
                partOfSpeech: 'noun',
                meaning: 'bão lớn',
                example: 'A powerful hurricane swept across the coast last week.',
            },
        ],
    },

    // ==========================================
    // 17. Sea & Ice (Biển và băng)
    // ==========================================
    {
        familyId: 'environment-climate-sea-ice',
        words: [
            {
                word: 'sea level',
                ipa: '/ˈsiː ˌlev.əl/',
                partOfSpeech: 'noun',
                meaning: 'mực nước biển',
                example: 'Rising sea levels threaten low-lying coastal cities.',
            },
            {
                word: 'glacier',
                ipa: '/ˈɡleɪ.si.ər/',
                partOfSpeech: 'noun',
                meaning: 'sông băng',
                example: 'Many glaciers are shrinking because of warmer weather.',
            },
            {
                word: 'iceberg',
                ipa: '/ˈaɪs.bɜːɡ/',
                partOfSpeech: 'noun',
                meaning: 'tảng băng trôi',
                example:
                    'The huge iceberg slowly drifted south into warmer waters.',
            },
            {
                word: 'polar ice cap',
                ipa: '/ˌpəʊ.lər ˈaɪs ˌkæp/',
                partOfSpeech: 'noun',
                meaning: 'mũ băng vùng cực',
                example: 'The polar ice caps are melting at a record speed.',
            },
            {
                word: 'coral reef',
                ipa: '/ˈkɒr.əl ˌriːf/',
                partOfSpeech: 'noun',
                meaning: 'rạn san hô',
                example:
                    'Warm seas have damaged coral reefs around the world.',
            },
        ],
    },

    // ==========================================
    // 18. Fossil fuels & Energy (Nhiên liệu hóa thạch & năng lượng)
    // ==========================================
    {
        familyId: 'environment-climate-fossil-fuel',
        words: [
            {
                word: 'fossil fuel',
                ipa: '/ˈfɒs.əl ˌfjuːəl/',
                partOfSpeech: 'noun',
                meaning: 'nhiên liệu hóa thạch',
                example:
                    'We must reduce our reliance on fossil fuels to fight climate change.',
            },
            {
                word: 'crude oil',
                ipa: '/ˌkruːd ˈɔɪl/',
                partOfSpeech: 'noun',
                meaning: 'dầu thô',
                example:
                    'Crude oil spills cause severe damage to ocean wildlife.',
            },
            {
                word: 'natural gas',
                ipa: '/ˌnætʃ.ər.əl ˈɡæs/',
                partOfSpeech: 'noun',
                meaning: 'khí tự nhiên',
                example:
                    'Natural gas burns more cleanly than coal but still adds emissions.',
            },
            {
                word: 'wind power',
                ipa: '/ˈwɪnd ˌpaʊ.ər/',
                partOfSpeech: 'noun',
                meaning: 'điện gió',
                example:
                    'Denmark generates much of its electricity from wind power.',
            },
            {
                word: 'hydropower',
                ipa: '/ˈhaɪ.drəʊˌpaʊ.ər/',
                partOfSpeech: 'noun',
                meaning: 'thủy điện',
                example:
                    'Hydropower provides clean energy from flowing rivers.',
            },
            {
                word: 'geothermal',
                ipa: '/ˌdʒiː.əʊˈθɜː.məl/',
                partOfSpeech: 'adjective',
                meaning: 'thuộc địa nhiệt',
                example:
                    'Iceland uses geothermal heat to warm most of its homes.',
            },
        ],
    },

    // ==========================================
    // 19. Awareness (Nhận thức)
    // ==========================================
    {
        familyId: 'environment-climate-awareness',
        words: [
            {
                word: 'eco-friendly',
                ipa: '/ˌiː.kəʊˈfrend.li/',
                partOfSpeech: 'adjective',
                meaning: 'thân thiện với môi trường',
                example: 'These eco-friendly products use very little plastic.',
            },
            {
                word: 'environmentalist',
                ipa: '/ɪnˌvaɪ.rənˈmen.təl.ɪst/',
                partOfSpeech: 'noun',
                meaning: 'nhà hoạt động môi trường',
                example:
                    'Environmentalists are urging governments to act faster.',
            },
            {
                word: 'environmentalism',
                ipa: '/ɪnˌvaɪ.rənˈmen.təl.ɪ.zəm/',
                partOfSpeech: 'noun',
                meaning: 'chủ nghĩa môi trường',
                example:
                    'Environmentalism has become a major political movement.',
            },
            {
                word: 'green',
                ipa: '/ɡriːn/',
                partOfSpeech: 'adjective',
                meaning: 'xanh, thân thiện môi trường',
                example: 'The company has adopted green policies in every office.',
            },
            {
                word: 'carbon neutral',
                ipa: '/ˌkɑː.bən ˈnjuː.trəl/',
                partOfSpeech: 'adjective',
                meaning: 'trung hòa carbon',
                example:
                    'The airline aims to become carbon neutral by 2040.',
            },
            {
                word: 'net zero',
                ipa: '/ˌnet ˈzɪə.rəʊ/',
                partOfSpeech: 'noun',
                meaning: 'phát thải ròng bằng không',
                example:
                    'Many countries have pledged to reach net zero by 2050.',
            },
        ],
    },

    // ==========================================
    // 20. Resources (Tài nguyên)
    // ==========================================
    {
        familyId: 'environment-climate-resources',
        words: [
            {
                word: 'natural resource',
                ipa: '/ˌnætʃ.ər.əl rɪˈsɔːs/',
                partOfSpeech: 'noun',
                meaning: 'tài nguyên thiên nhiên',
                example:
                    'Vietnam is rich in natural resources like coal and rice.',
            },
            {
                word: 'depletion',
                ipa: '/dɪˈpliː.ʃən/',
                partOfSpeech: 'noun',
                meaning: 'sự cạn kiệt',
                example:
                    'Resource depletion will affect future generations badly.',
            },
            {
                word: 'deplete',
                ipa: '/dɪˈpliːt/',
                partOfSpeech: 'verb',
                meaning: 'làm cạn kiệt',
                example: 'Overfishing has depleted fish stocks in many oceans.',
            },
            {
                word: 'overfishing',
                ipa: '/ˌəʊ.vəˈfɪʃ.ɪŋ/',
                partOfSpeech: 'noun',
                meaning: 'đánh bắt cá quá mức',
                example: 'Overfishing has damaged fish populations worldwide.',
            },
        ],
    },

    // ==========================================
    // 21. Air & Water (Không khí, nước)
    // ==========================================
    {
        familyId: 'environment-climate-air-water',
        words: [
            {
                word: 'air quality',
                ipa: '/ˈeər ˌkwɒl.ə.ti/',
                partOfSpeech: 'noun',
                meaning: 'chất lượng không khí',
                example: 'Air quality in many big cities has become very poor.',
            },
            {
                word: 'smog',
                ipa: '/smɒɡ/',
                partOfSpeech: 'noun',
                meaning: 'khói bụi mù',
                example: 'Thick smog covered the city for several days.',
            },
            {
                word: 'acid rain',
                ipa: '/ˈæs.ɪd ˌreɪn/',
                partOfSpeech: 'noun',
                meaning: 'mưa axit',
                example: 'Acid rain harms forests, lakes, and old buildings.',
            },
            {
                word: 'oil spill',
                ipa: '/ˈɔɪl ˌspɪl/',
                partOfSpeech: 'noun',
                meaning: 'sự tràn dầu',
                example: 'The oil spill killed thousands of seabirds and fish.',
            },
            {
                word: 'freshwater',
                ipa: '/ˈfreʃˌwɔː.tər/',
                partOfSpeech: 'noun',
                meaning: 'nước ngọt',
                example: 'Freshwater is becoming scarce in many parts of the world.',
            },
        ],
    },
];

// ---------- 3. Build cards ----------
function build() {
    const existing = loadExistingWords();
    const cards = [];
    const seenInTopic = new Set();
    const skipped = [];
    const crossTopicFamilies = []; // ghi chú family chéo

    // gốc từ thô để dò họ chéo (sau khi loại trừ trùng)
    const stems = new Map(); // stem -> { topicId, familyId, word }

    // build "stems" map từ từ vựng các topic khác (đã có familyId)
    for (const [w, info] of existing.entries()) {
        if (!info.familyId) continue;
        const stem = stemOf(w);
        if (!stem) continue;
        if (!stems.has(stem)) stems.set(stem, []);
        stems.get(stem).push(info);
    }

    let order = 1;
    for (const family of FAMILIES) {
        let famOrder = 1;
        for (const item of family.words) {
            const wLow = item.word.toLowerCase();

            if (seenInTopic.has(wLow)) {
                skipped.push({ word: item.word, reason: 'duplicate-in-topic' });
                continue;
            }
            if (existing.has(wLow)) {
                skipped.push({
                    word: item.word,
                    reason: 'duplicate-other-topic',
                    other: existing.get(wLow),
                });
                continue;
            }

            seenInTopic.add(wLow);

            // detect family chéo: nếu stem của từ trùng stem 1 từ ở topic khác
            const stem = stemOf(wLow);
            if (stem && stems.has(stem)) {
                for (const other of stems.get(stem)) {
                    crossTopicFamilies.push({
                        word: item.word,
                        myFamilyId: family.familyId,
                        otherWord: other.word,
                        otherTopicId: other.topicId,
                        otherFamilyId: other.familyId,
                    });
                }
            }

            cards.push({
                fieldValues: {
                    word: item.word,
                    ipa: item.ipa,
                    partOfSpeech: item.partOfSpeech,
                    difficulty: 'intermediate',
                    meaning: item.meaning,
                    example: item.example,
                    familyId: family.familyId,
                    familyOrder: famOrder,
                    tags: [],
                },
            });
            famOrder++;
            order++;
        }
    }

    return { cards, skipped, crossTopicFamilies };
}

// rất đơn giản: cắt hậu tố để lấy gốc từ chung cho 1 family
function stemOf(w) {
    if (!w || w.includes(' ')) return null;
    let s = w.toLowerCase();
    // bỏ các hậu tố phổ biến để gom họ
    const suffixes = [
        'ation',
        'ization',
        'isation',
        'ically',
        'fully',
        'ness',
        'ment',
        'tion',
        'sion',
        'ible',
        'able',
        'ical',
        'ible',
        'ous',
        'ive',
        'ity',
        'ist',
        'ism',
        'ial',
        'ize',
        'ise',
        'ify',
        'ing',
        'ed',
        'er',
        'or',
        'ar',
        'ly',
        'al',
        'es',
        's',
        'y',
    ];
    for (const sf of suffixes) {
        if (s.endsWith(sf) && s.length - sf.length >= 4) {
            s = s.slice(0, s.length - sf.length);
            break;
        }
    }
    return s;
}

// ---------- 4. Write file ----------
function main() {
    const { cards, skipped, crossTopicFamilies } = build();

    const totalFamilies = new Set(
        cards.map((c) => c.fieldValues.familyId)
    ).size;

    const out = {
        _meta: {
            topicId: 'environment-climate',
            topicName: 'Môi trường & Biến đổi khí hậu',
            level: 'intermediate',
            source:
                'Curated IELTS/Academic Vocabulary - Environment & Climate Change (B1-B2)',
            totalCards: cards.length,
            totalFamilies,
            generatedAt: new Date().toISOString().slice(0, 10),
            note: 'Tu vung nen tang ve Moi truong & Bien doi khi hau, gom o nhiem, khi thai, bao ton, tai tao, thien tai. Da loai bo cac tu da co o cac topic khac va tranh trung trong topic. Cac tu cung family duoc nhom theo familyId.',
            skipped,
            crossTopicFamilies,
        },
        cards,
    };

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(out, null, 2), 'utf8');

    console.log(`Generated ${cards.length} cards in ${totalFamilies} families.`);
    console.log(`Skipped ${skipped.length} duplicate words.`);
    if (skipped.length) {
        console.log('Skipped details:');
        for (const s of skipped) {
            console.log(`  - ${s.word}  (${s.reason})`);
        }
    }
    console.log(`Cross-topic family hints: ${crossTopicFamilies.length}`);
    if (crossTopicFamilies.length) {
        for (const c of crossTopicFamilies) {
            console.log(
                `  - ${c.word} [${c.myFamilyId}] shares stem with ${c.otherWord} (${c.otherTopicId} / ${c.otherFamilyId})`
            );
        }
    }
    console.log(`Wrote ${OUTPUT_FILE}`);
}

main();
