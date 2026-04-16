// ============================================
// TTS - Text to Speech wrapper (Web Speech API)
// ============================================

const TTS = {
    _voices: [],
    _preferredVoice: null,
    _ready: false,

    init() {
        if (!('speechSynthesis' in window)) {
            console.warn('[TTS] Web Speech API not supported');
            return;
        }

        const loadVoices = () => {
            this._voices = speechSynthesis.getVoices();
            // Ưu tiên giọng Mỹ / Anh
            this._preferredVoice =
                this._voices.find(v => v.lang === 'en-US' && v.name.includes('Google')) ||
                this._voices.find(v => v.lang === 'en-US') ||
                this._voices.find(v => v.lang.startsWith('en')) ||
                null;
            this._ready = true;
        };

        loadVoices();
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = loadVoices;
        }
    },

    /**
     * Phát audio cho từ tiếng Anh
     * @param {string} text
     * @param {Object} options - { rate, pitch, onEnd }
     */
    speak(text, options = {}) {
        if (!this.isAvailable() || !text) return;

        // Cancel các phát âm đang chạy
        speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = options.rate || 0.9;
        utterance.pitch = options.pitch || 1;
        utterance.volume = 1;

        if (this._preferredVoice) {
            utterance.voice = this._preferredVoice;
        }

        if (options.onEnd) utterance.onend = options.onEnd;
        if (options.onError) utterance.onerror = options.onError;

        speechSynthesis.speak(utterance);
    },

    /**
     * Dừng phát âm đang chạy
     */
    stop() {
        if (this.isAvailable()) {
            speechSynthesis.cancel();
        }
    },

    /**
     * Kiểm tra TTS có khả dụng không
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
