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

    // Đường dẫn gốc tới audio tĩnh (đặt trong public/ của shell)
    _audioBase: '/audio/en',

    // Cache manifest đã nạp theo accent: accent -> { files: {slug: fileName} } | false (không có)
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
     * Nạp manifest cho một accent (chỉ nạp 1 lần, cache kết quả).
     * Không có manifest (chưa generate) -> trả false, app sẽ dùng Web Speech.
     * @returns {Promise<object|false>}
     */
    async _loadManifest(accent) {
        if (accent in this._manifests) return this._manifests[accent];

        const cfg = this._accents[accent];
        if (!cfg) { this._manifests[accent] = false; return false; }

        const url = `${this._audioBase}/${cfg.subDir}/audio-manifest.json`;
        try {
            const res = await fetch(url, { cache: 'force-cache' });
            if (!res.ok) { this._manifests[accent] = false; return false; }
            const json = await res.json();
            this._manifests[accent] = (json && json.files) ? json : false;
        } catch {
            this._manifests[accent] = false;
        }
        return this._manifests[accent];
    },

    /**
     * Suy đường dẫn MP3 nếu manifest xác nhận file tồn tại, ngược lại null.
     * @returns {Promise<string|null>}
     */
    async _resolveAudioUrl(text, accent) {
        const cfg = this._accents[accent];
        if (!cfg) return null;

        const slug = this.slugify(text);
        if (!slug) return null;

        const manifest = await this._loadManifest(accent);
        // Có manifest và chứa slug -> chắc chắn có file
        if (manifest && manifest.files && manifest.files[slug]) {
            return `${this._audioBase}/${cfg.subDir}/${manifest.files[slug]}`;
        }
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
                    this._currentAudio = null;
                    this._speakWebSpeech(text, accent, options);
                };
                await audio.play();
                return;
            } catch {
                // play() bị chặn / lỗi -> fallback
                this._currentAudio = null;
            }
        }

        // 2) Fallback Web Speech API
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
