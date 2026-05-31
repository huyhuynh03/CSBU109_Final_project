// ============================================================================
// TTS Audio Generation — Central Config
// ----------------------------------------------------------------------------
// Đây là nơi DUY NHẤT cần sửa khi:
//   - Thêm một ngôn ngữ mới (thêm 1 entry vào LANGUAGES)
//   - Thêm/đổi accent (variant) của một ngôn ngữ
//   - Đổi giọng đọc của một provider
//   - Đổi nguồn seed / thư mục output
//
// Mô hình dữ liệu:
//   LANGUAGES[langId]
//     .variants[variantId]        ← mỗi accent là một "variant" (us, gb, ...)
//        .voices[provider]        ← giọng cho từng provider, theo từng accent
//
// Cùng một danh sách từ vựng được đọc lại cho mỗi variant → ra nhiều file:
//   audio/en/us/<slug>.mp3   (giọng Mỹ)
//   audio/en/gb/<slug>.mp3   (giọng Anh)
//
// LƯU Ý GIỚI HẠN PROVIDER cho accent:
//   - google     : tách US/GB rõ ràng qua tên giọng (en-US-* vs en-GB-*). ✅ tốt nhất
//   - openai     : giọng cố định kiểu Mỹ, KHÔNG có công tắc đổi giọng Anh →
//                  variant 'gb' của openai thực chất vẫn nghe như US.
//   - elevenlabs : accent phụ thuộc voiceId; cần đặt voiceId khác cho từng accent.
// ============================================================================

const path = require('path');

// Thư mục gốc của repo (scripts/tts -> ../../)
const ROOT = path.resolve(__dirname, '..', '..');

// ----------------------------------------------------------------------------
// Định nghĩa ngôn ngữ
// ----------------------------------------------------------------------------
const LANGUAGES = {
    english: {
        id: 'english',
        label: 'English',
        // Nguồn seed gốc của repo. Có thể khai báo nhiều thư mục.
        seedDirs: [path.join(ROOT, 'data', 'seed-vocabulary')],
        // Trích từ: card.fieldValues.word
        seedField: ['fieldValues', 'word'],
        // Thư mục gốc cho audio của ngôn ngữ này. Mỗi variant tạo subfolder bên dưới.
        outputBaseDir: path.join(ROOT, 'packages', 'shell', 'public', 'audio', 'en'),
        // Variant dùng khi CLI không truyền --variant
        defaultVariant: 'us',
        variants: {
            us: {
                id: 'us',
                label: 'American English',
                subDir: 'us',
                voices: {
                    shopaikey: {
                        // Shopaikey gateway → Gemini TTS (endpoint /tts/google/generations)
                        model: 'gemini-2.5-flash-preview-tts',
                        voice: 'Puck'
                    },
                    google: {
                        languageCode: 'en-US',
                        name: 'en-US-Neural2-C',
                        ssmlGender: 'FEMALE'
                    },
                    gemini: {
                        // Gemini TTS native (gọi trực tiếp generativelanguage.googleapis.com)
                        model: 'gemini-2.5-flash-preview-tts',
                        voice: 'Puck'
                    },
                    openai: {
                        model: 'gpt-4o-mini-tts',
                        voice: 'ash',
                        baseUrl: 'https://api.shopaikey.com/v1',
                        instructions: 'Native American English speaker. Male. Say the word once, naturally, as in casual speech.'
                    },
                    elevenlabs: {
                        voiceId: '21m00Tcm4TlvDq8ikWAM', // Rachel (giọng Mỹ)
                        modelId: 'eleven_multilingual_v2'
                    }
                }
            },
            gb: {
                id: 'gb',
                label: 'British English',
                subDir: 'gb',
                voices: {
                    shopaikey: {
                        // Shopaikey gateway → Gemini TTS — Zephyr cho giọng UK-ish
                        model: 'gemini-2.5-flash-preview-tts',
                        voice: 'Zephyr'
                    },
                    google: {
                        languageCode: 'en-GB',
                        name: 'en-GB-Neural2-A',
                        ssmlGender: 'FEMALE'
                    },
                    gemini: {
                        // Gemini TTS native — Zephyr cho giọng UK-ish
                        model: 'gemini-2.5-flash-preview-tts',
                        voice: 'Zephyr'
                    },
                    openai: {
                        model: 'gpt-4o-mini-tts',
                        voice: 'nova',
                        baseUrl: 'https://api.shopaikey.com/v1',
                        instructions: 'Native British English speaker. Female. Say the word once, naturally, as in casual speech.'
                    },
                    elevenlabs: {
                        // ⚠ Đổi sang voiceId giọng Anh-Anh để có accent đúng
                        voiceId: '21m00Tcm4TlvDq8ikWAM',
                        modelId: 'eleven_multilingual_v2'
                    }
                }
            }
        }
    }

    // ----- Ví dụ mở rộng ngôn ngữ (bỏ comment + điền khi có module mới) -----
    // japanese: {
    //     id: 'japanese',
    //     label: 'Tiếng Nhật',
    //     seedDirs: [path.join(ROOT, 'data', 'seed-vocabulary-ja')],
    //     seedField: ['fieldValues', 'word'],
    //     outputBaseDir: path.join(ROOT, 'packages', 'shell', 'public', 'audio', 'ja'),
    //     defaultVariant: 'std',
    //     variants: {
    //         std: {
    //             id: 'std', label: 'Standard Japanese', subDir: 'std',
    //             voices: {
    //                 google:     { languageCode: 'ja-JP', name: 'ja-JP-Neural2-B', ssmlGender: 'FEMALE' },
    //                 openai:     { voice: 'nova', model: 'tts-1' },
    //                 elevenlabs: { voiceId: '21m00Tcm4TlvDq8ikWAM', modelId: 'eleven_multilingual_v2' }
    //             }
    //         }
    //     }
    // }
};

// ----------------------------------------------------------------------------
// Cấu hình chung cho quá trình generate
// ----------------------------------------------------------------------------
const DEFAULTS = {
    provider: 'openai',          // provider mặc định — gpt-4o-mini-tts qua shopaikey gateway
    audioExt: 'mp3',             // tất cả provider đều xuất MP3 → đồng nhất
    concurrency: 4,              // số request song song
    retries: 3,                  // số lần thử lại khi lỗi mạng / 429
    retryBaseDelayMs: 800,       // backoff cơ bản (nhân đôi mỗi lần)
    requestDelayMs: 120          // nghỉ nhẹ giữa các batch để tránh rate-limit
};

// Danh sách provider hợp lệ (khớp tên file trong providers/)
const PROVIDERS = ['shopaikey', 'gemini', 'google', 'openai', 'elevenlabs'];

function getLanguage(langId) {
    const lang = LANGUAGES[langId];
    if (!lang) {
        const available = Object.keys(LANGUAGES).join(', ');
        throw new Error(`Ngôn ngữ "${langId}" chưa được cấu hình. Hiện có: ${available}`);
    }
    return lang;
}

/**
 * Giải nghĩa tham số --variant thành danh sách variant config.
 * @param {object} langConfig
 * @param {string|null} variantArg  vd "us" | "us,gb" | "all" | null
 * @returns {Array<object>} danh sách variant config
 */
function resolveVariants(langConfig, variantArg) {
    const all = langConfig.variants || {};
    const ids = Object.keys(all);
    if (!ids.length) {
        throw new Error(`Ngôn ngữ "${langConfig.id}" chưa khai báo variants.`);
    }

    if (!variantArg) {
        const def = langConfig.defaultVariant || ids[0];
        return [all[def]];
    }

    if (variantArg === 'all') {
        return ids.map((id) => all[id]);
    }

    const requested = variantArg.split(',').map((s) => s.trim()).filter(Boolean);
    const result = [];
    for (const id of requested) {
        if (!all[id]) {
            throw new Error(`Variant "${id}" không tồn tại cho ngôn ngữ "${langConfig.id}". Có: ${ids.join(', ')}`);
        }
        result.push(all[id]);
    }
    return result;
}

module.exports = {
    ROOT,
    LANGUAGES,
    DEFAULTS,
    PROVIDERS,
    getLanguage,
    resolveVariants
};
