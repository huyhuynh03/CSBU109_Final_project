// ============================================
// TTS - Text to Speech wrapper
// --------------------------------------------
// Accent-aware (US / UK). Chiến lược phát:
//   1) Ưu tiên file MP3 tĩnh pre-generate ở /audio/en/<accent>/<slug>.mp3
//      (biết file có tồn tại hay không nhờ audio-manifest.json mỗi accent).
//   2) Không có MP3 (từ user tự thêm, câu ví dụ, hoặc chưa generate) →
//      fallback Web Speech API, chọn giọng en-US / en-GB theo accent.
//
// slugify() PHẢI khớp 1:1 với scripts/tts/lib/slug.js để suy đúng tên file.
// ============================================

const TTS = {
    _voices: [],
    _voiceByAccent: { us: null, gb: null },
    _ready: false,
    _defaultAccent: 'gb',

    // Map accent -> cấu hình đường dẫn + ngôn ngữ Web Speech
    _accents: {
        us: { subDir: 'us', lang: 'en-US', label: 'US' },
        gb: { subDir: 'gb', lang: 'en-GB', label: 'UK' }
    },

    // Thứ tự ưu tiên nguồn audio trong mỗi accent. '' = root accent (mặc định:
    // OpenAI/Google). 'elevenlabs' = subfolder render bằng ElevenLabs. Có file
    // ElevenLabs cho từ nào thì ưu tiên dùng, không thì rơi về bản mặc định.
    _sources: ['edge', 'elevenlabs', ''],

    // Đường dẫn gốc tới audio tĩnh (đặt trong public/ của shell)
    _audioBase: '/audio/en',

    // Cache manifest đã nạp theo khoá "accent/source":
    //   "accent/source" -> { files: {slug: fileName} } | false (không có)
    _manifests: {},
    // Cache phần tử <audio> đang phát để stop được
    _currentAudio: null,

    init() {
        if (!('speechSynthesis' in window)) {
            console.warn('[TTS] Web Speech API không khả dụng');
            return;
        }

        const loadVoices = () => {
            this._voices = speechSynthesis.getVoices();

            // Chọn giọng tốt nhất cho từng accent
            this._voiceByAccent.us =
                this._voices.find(v => v.lang === 'en-US' && /Google/i.test(v.name)) ||
                this._voices.find(v => v.lang === 'en-US') ||
                this._voices.find(v => v.lang && v.lang.startsWith('en')) ||
                null;

            this._voiceByAccent.gb =
                this._voices.find(v => v.lang === 'en-GB' && /Google/i.test(v.name)) ||
                this._voices.find(v => v.lang === 'en-GB') ||
                this._voices.find(v => v.lang && v.lang.startsWith('en-GB')) ||
                this._voiceByAccent.us ||
                null;

            this._ready = true;
        };

        loadVoices();
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = loadVoices;
        }
    },

    /**
     * Chuẩn hoá từ -> slug. PHẢI khớp scripts/tts/lib/slug.js.
     * "naïve café" -> "naive-cafe", "season ticket" -> "season-ticket"
     */
    slugify(word) {
        return String(word)
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    },

    /**
     * Thư mục con cho một nguồn trong accent. '' = root accent (mặc định).
     */
    _sourceDir(cfg, source) {
        // Folder tĩnh dùng underscore: us_edge, gb_elevenlabs, v.v.
        // (KHÔNG dùng slash — slash là URL path, underscore là tên folder vật lý)
        return source ? `${cfg.subDir}_${source}` : cfg.subDir;
    },

    /**
     * Nạp manifest cho một (accent, source) — chỉ nạp 1 lần, cache kết quả.
     * Không có manifest (chưa generate / nguồn không tồn tại) -> trả false.
     * @param {string} accent  'us' | 'gb'
     * @param {string} source  '' (mặc định) | 'elevenlabs'
     * @returns {Promise<object|false>}
     */
    async _loadManifest(accent, source = '') {
        const key = `${accent}/${source}`;
        if (key in this._manifests) return this._manifests[key];

        const cfg = this._accents[accent];
        if (!cfg) { this._manifests[key] = false; return false; }

        // Manifest có thể được bổ sung slug mới theo từng lần generate → KHÔNG
        // được force-cache / immutable. Query `?v=` + cache:'reload' phá cache HTTP
        // immutable cũ (max-age=1 năm) đã từng kẹt bản thiếu slug (vd "bad").
        // File .mp3 từng slug vẫn immutable OK vì URL cố định theo slug.
        const url = `${this._audioBase}/${this._sourceDir(cfg, source)}/audio-manifest.json?v=20260720-full`;
        try {
            const res = await fetch(url, { cache: 'reload' });
            if (!res.ok) {
                console.warn('[TTS_DIAG] manifest_http_error', { accent, source, url, status: res.status });
                this._manifests[key] = false;
                return false;
            }
            const json = await res.json();
            this._manifests[key] = (json && json.files) ? json : false;
            console.info('[TTS_DIAG] manifest_loaded', {
                accent,
                source,
                url,
                entries: this._manifests[key] ? Object.keys(this._manifests[key].files).length : 0
            });
        } catch (err) {
            console.warn('[TTS_DIAG] manifest_fetch_failed', { accent, source, url, error: err?.message });
            this._manifests[key] = false;
        }
        return this._manifests[key];
    },

    /**
     * Suy đường dẫn MP3 cho từ, duyệt các nguồn theo thứ tự ưu tiên
     * (ElevenLabs trước, rồi bản mặc định). Không nguồn nào có -> null.
     * @returns {Promise<string|null>}
     */
    async _resolveAudioUrl(text, accent) {
        const cfg = this._accents[accent];
        if (!cfg) return null;

        const slug = this.slugify(text);
        if (!slug) return null;

        for (const source of this._sources) {
            const manifest = await this._loadManifest(accent, source);
            if (manifest && manifest.files && manifest.files[slug]) {
                return `${this._audioBase}/${this._sourceDir(cfg, source)}/${manifest.files[slug]}`;
            }
        }
        console.warn('[TTS_DIAG] slug_not_found_in_manifests', {
            text,
            slug,
            accent,
            sources: this._sources
        });
        return null;
    },

    /**
     * Phát phát âm cho một từ/cụm.
     * @param {string} text
     * @param {Object} options - { accent: 'us'|'gb', rate, pitch, onEnd, onError }
     */
    async speak(text, options = {}) {
        if (!text) return;
        const accent = this._accents[options.accent] ? options.accent : this._defaultAccent;

        this.stop();

        // 1) Thử file MP3 tĩnh (qua manifest)
        const audioUrl = await this._resolveAudioUrl(text, accent);
        if (audioUrl) {
            try {
                const audio = new Audio(audioUrl);
                this._currentAudio = audio;
                if (options.rate) audio.playbackRate = options.rate;
                if (options.onEnd) audio.onended = options.onEnd;
                audio.onerror = () => {
                    // File lỗi bất ngờ -> fallback Web Speech
                    console.warn('[TTS_DIAG] mp3_playback_error', { text, accent, audioUrl });
                    this._currentAudio = null;
                    this._speakWebSpeech(text, accent, options);
                };
                await audio.play();
                return;
            } catch (err) {
                // play() bị chặn / lỗi -> fallback
                console.warn('[TTS_DIAG] mp3_play_rejected', {
                    text,
                    accent,
                    audioUrl,
                    error: err?.message
                });
                this._currentAudio = null;
            }
        }

        // 2) Fallback Web Speech API
        console.warn('[TTS_DIAG] fallback_web_speech', { text, accent, reason: audioUrl ? 'mp3_error' : 'manifest_miss' });
        this._speakWebSpeech(text, accent, options);
    },

    /**
     * Phát bằng Web Speech API với giọng theo accent.
     */
    _speakWebSpeech(text, accent, options = {}) {
        if (!('speechSynthesis' in window)) return;

        const cfg = this._accents[accent] || this._accents[this._defaultAccent];
        speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = cfg.lang;
        utterance.rate = options.rate || 0.9;
        utterance.pitch = options.pitch || 1;
        utterance.volume = 1;

        const voice = this._voiceByAccent[accent];
        if (voice) utterance.voice = voice;

        if (options.onEnd) utterance.onend = options.onEnd;
        if (options.onError) utterance.onerror = options.onError;

        speechSynthesis.speak(utterance);
    },

    /**
     * Dừng mọi phát âm đang chạy (cả MP3 lẫn Web Speech).
     */
    stop() {
        if (this._currentAudio) {
            try { this._currentAudio.pause(); } catch { /* noop */ }
            this._currentAudio = null;
        }
        if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
        }
    },

    /**
     * Danh sách accent khả dụng cho UI (render nút US / UK).
     * @returns {Array<{id, label}>}
     */
    getAccents() {
        return Object.keys(this._accents).map(id => ({ id, label: this._accents[id].label }));
    },

    /**
     * TTS có khả dụng không (luôn true nếu có Web Speech; MP3 là bonus).
     */
    isAvailable() {
        return 'speechSynthesis' in window;
    }
};

// Auto init khi load
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => TTS.init());
    } else {
        TTS.init();
    }
}

export default TTS;
