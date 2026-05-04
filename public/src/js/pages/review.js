// ============================================
// Review Page - Chế độ Ôn tập (Grouped 2-Round)
// ============================================
// Vòng 1: VN → EN (gõ từ tiếng Anh từ nghĩa tiếng Việt)
// Vòng 2: Listen → EN (gõ từ tiếng Anh từ audio)

const ReviewPage = {
    // ---- Session state ----
    _session: null,
    _startedAt: null,

    // ============================================
    // RENDER + ENTRY POINT
    // ============================================
    render() {
        return `<div class="review-page page-enter" id="review-page-root">
            <div class="review-loading">
                <span class="material-icons-round" style="font-size:40px;color:var(--color-text-muted);animation:spin 1s linear infinite;">hourglass_empty</span>
                <p style="color:var(--color-text-muted);margin-top:var(--spacing-sm);">Đang tải phiên ôn tập...</p>
            </div>
        </div>`;
    },

    async onEnter() {
        console.log('[ReviewPage] Entered');
        if (!Auth.isSignedIn()) {
            Router.navigate('/auth');
            return;
        }
        await this._init();
    },

    async _init() {
        try {
            // Lấy type từ query string
            const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
            const type = params.get('type') || 'vocabulary';
            const familyId = params.get('familyId');
            const cardId = params.get('cardId');

            // Nếu có cardId → load trực tiếp 1 card (không cần due check)
            let cards;
            let isEarlyReview = false;
            if (cardId) {
                const all = await FirestoreDB.getCards({ cardType: type });
                cards = all.filter(c => c.id === cardId);
            } else {
                cards = await FirestoreDB.getDueCards(type);
            }

            // Filter theo familyId nếu có
            if (familyId) {
                cards = cards.filter(c => c.fieldValues?.familyId === familyId);
            }

            // Chỉ ôn tập những card thực sự ở trạng thái REVIEW / RELEARNING.
            // NEW và LEARNING đều thuộc pipeline "học mới" — không được đưa vào ôn tập.
            const isReviewable = (c) => {
                const st = c.state;
                return st === FSRS.State.REVIEW || st === 'review'
                    || st === FSRS.State.RELEARNING || st === 'relearning';
            };
            cards = cards.filter(isReviewable);

            // KHÔNG auto fallback "ôn sớm" — nếu không có thẻ tới hạn thì hiển thị Empty.
            // (Tránh bug: vừa ôn 1 thẻ xong bấm "Ôn tiếp" lại lặp lại chính thẻ đó
            //  vì sau khi FSRS cập nhật dueDate về tương lai, nó không còn due
            //  nhưng vẫn là "learned" → fallback đưa nó trở lại phiên mới.)

            if (cards.length === 0) {
                this._renderEmpty();
                return;
            }

            // Limit tối đa 30 từ/phiên
            cards = cards.slice(0, 30);

            this._session = {
                cards: cards,
                type: type,
                currentRound: 1,
                currentIndex: 0,
                round1Results: {},
                round2Results: {},
                startedAt: new Date(),
                isEarlyReview: isEarlyReview,
                // Handler keydown đang gắn trên document (back-side: Enter/Space → next).
                // Lưu reference để gỡ trước khi render thẻ mới — tránh handler "rò"
                // qua thẻ kế tiếp gây bug "ôn write nhưng backside hiện wrote":
                // Enter ở input thẻ N → submitAnswer (setTimeout backside)
                //   → bubble lên document → handler backside thẻ N-1 (chưa kịp gỡ)
                //   → _nextCard() → currentIndex++ → backside cuối cùng đọc nhầm thẻ.
                _backsideKeyHandler: null
            };
            this._startedAt = Date.now();

            this._renderIntro();
        } catch (error) {
            console.error('[ReviewPage] Init error:', error);
            this._renderError(error.message);
        }
    },

    // ============================================
    // SCREEN 1: INTRO
    // ============================================
    _renderIntro() {
        const root = document.getElementById('review-page-root');
        if (!root) return;

        const count = this._session.cards.length;
        const ttsAvailable = TTS.isAvailable();
        const earlyBadge = this._session.isEarlyReview
            ? `<div style="display:inline-flex;align-items:center;gap:6px;background:rgba(139,92,246,0.15);color:#8B5CF6;padding:6px 12px;border-radius:999px;font-size:var(--font-size-sm);font-weight:600;margin-bottom:var(--spacing-sm);">
                   <span class="material-icons-round" style="font-size:16px;">bolt</span>
                   Ôn sớm — chưa tới hạn FSRS
               </div>`
            : '';

        root.innerHTML = `
            <div class="review-intro">
                <div class="review-intro__icon">
                    <span class="material-icons-round">replay</span>
                </div>
                ${earlyBadge}
                <h1 class="review-intro__title">Ôn tập ${count} từ</h1>
                <p class="review-intro__desc">Bạn sẽ ôn qua 2 vòng:</p>
                <div class="review-intro__steps">
                    <div class="review-step-card">
                        <div class="review-step-card__number">1</div>
                        <div class="review-step-card__content">
                            <div class="review-step-card__title">Đọc nghĩa tiếng Việt</div>
                            <div class="review-step-card__desc">Gõ đúng từ tiếng Anh tương ứng</div>
                        </div>
                    </div>
                    <div class="review-step-card">
                        <div class="review-step-card__number">2</div>
                        <div class="review-step-card__content">
                            <div class="review-step-card__title">Nghe phát âm</div>
                            <div class="review-step-card__desc">${ttsAvailable ? 'Gõ lại từ tiếng Anh vừa nghe' : 'Thiết bị không hỗ trợ audio — sẽ hiển thị IPA thay thế'}</div>
                        </div>
                    </div>
                </div>
                <button class="review-btn-primary" onclick="ReviewPage._startRound(1)">
                    Bắt đầu ôn tập
                    <span class="material-icons-round">arrow_forward</span>
                </button>
                <button class="review-btn-link" onclick="Router.navigate('/vocabulary')">
                    Hủy, quay lại
                </button>
            </div>
        `;
    },

    // ============================================
    // START A ROUND
    // ============================================
    _startRound(roundNum) {
        this._session.currentRound = roundNum;
        this._session.currentIndex = 0;

        // Shuffle cards khi bắt đầu vòng 2
        if (roundNum === 2) {
            this._session.cards = this._shuffle([...this._session.cards]);
        }

        this._renderCard();
    },

    _shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    },

    // ============================================
    // RENDER A CARD (both rounds)
    // ============================================
    _renderCard() {
        const root = document.getElementById('review-page-root');
        if (!root) return;

        const s = this._session;
        // Gỡ handler backside còn sót lại trước khi vẽ thẻ mới.
        // (Trường hợp user click nút "Tiếp theo" thay vì Enter ở backside trước đó.)
        this._detachBacksideKey();
        const card = s.cards[s.currentIndex];
        const total = s.cards.length;
        const progress = ((s.currentIndex) / total) * 100;

        const meaning = card.fieldValues?.meaning || '(chưa có nghĩa)';
        const partOfSpeech = card.fieldValues?.partOfSpeech || '';
        const ipa = card.fieldValues?.ipa || '';
        const word = card.fieldValues?.word || '';

        // BQT schema v2: mỗi thẻ = 1 dạng độc lập → chỉ test `word`, hiển thị badge vai trò + nguyên mẫu.
        const isIrr = (typeof CardSchemas !== 'undefined') && CardSchemas.isIrregular(card);
        const irrMeta = isIrr ? CardSchemas.getIrregularMeta(card) : null;
        const baseForm = card.fieldValues?.baseForm || '';
        const expected = word;

        const irrHint = isIrr
            ? `<div class="review-question__pos" style="color:${irrMeta.color};font-weight:700;">
                  ${this._escapeHtml(irrMeta.label)} · <strong>${this._escapeHtml(irrMeta.roleShort)}</strong>${baseForm ? ` (nguyên mẫu: <em>${this._escapeHtml(baseForm)}</em>)` : ''}
               </div>`
            : '';

        // Nội dung câu hỏi khác nhau giữa 2 vòng
        let questionHtml;
        if (s.currentRound === 1) {
            // Vòng 1: Hiển thị nghĩa tiếng Việt
            questionHtml = `
                <div class="review-question review-question--vn">
                    <div class="review-question__label">NGHĨA</div>
                    <div class="review-question__main">${this._escapeHtml(meaning)}</div>
                    ${partOfSpeech ? `<div class="review-question__pos">(${partOfSpeech})</div>` : ''}
                    ${irrHint}
                </div>
            `;
        } else {
            // Vòng 2: Phát âm
            const fallback = !TTS.isAvailable();
            questionHtml = `
                <div class="review-question review-question--listen">
                    <button class="review-audio-btn" onclick="ReviewPage._playAudio()">
                        <span class="material-icons-round">volume_up</span>
                        Phát lại âm thanh
                    </button>
                    ${fallback && ipa ? `<div class="review-question__ipa">${this._escapeHtml(ipa)}</div>` : ''}
                    ${partOfSpeech ? `<div class="review-question__pos">(${partOfSpeech})</div>` : ''}
                    ${irrHint}
                </div>
            `;
        }

        const difficulty = card.fieldValues?.difficulty || 'intermediate';
        const diffMeta = (typeof CardSchemas !== 'undefined' && CardSchemas.getDifficultyMeta)
            ? CardSchemas.getDifficultyMeta(difficulty)
            : { short: difficulty === 'advanced' ? 'ADV' : 'INT', label: difficulty };

        root.innerHTML = `
            <div class="review-card-screen" data-difficulty="${difficulty}">
                <!-- Progress Header -->
                <div class="review-header">
                    <div class="review-header__info">
                        <span class="review-round-badge">Vòng ${s.currentRound}/2</span>
                        <span class="review-counter">Câu ${s.currentIndex + 1}/${total}</span>
                        <span class="difficulty-badge difficulty-badge--${difficulty}" title="${diffMeta.label}">${diffMeta.short}</span>
                    </div>
                    <div class="review-progress">
                        <div class="review-progress__fill" style="width:${progress}%"></div>
                    </div>
                </div>

                <!-- Question -->
                ${questionHtml}

                <!-- Input -->
                <div class="review-input-wrap">
                    <label class="review-input-label">Gõ từ tiếng Anh${s.currentRound === 2 ? ' bạn nghe được' : ''}:</label>
                    <input type="text"
                           class="review-input"
                           id="review-answer-input"
                           autocomplete="off"
                           autocapitalize="off"
                           spellcheck="false"
                           placeholder="Nhập từ..."
                           data-expected="${this._escapeHtml(expected)}">
                    <div class="review-feedback" id="review-feedback"></div>
                </div>

                <!-- Actions -->
                <div class="review-actions">
                    ${s.currentRound === 2 ? `
                        <button class="review-action-btn" onclick="ReviewPage._playAudio()">
                            <span class="material-icons-round">replay</span> Nghe lại
                        </button>
                    ` : ''}
                    <button class="review-action-btn review-action-btn--hint" onclick="ReviewPage._showHint()">
                        <span class="material-icons-round">lightbulb</span> Gợi ý
                    </button>
                    <button class="review-action-btn review-action-btn--reveal" onclick="ReviewPage._revealAnswer()">
                        <span class="material-icons-round">visibility</span> Hiện đáp án
                    </button>
                    <button class="review-action-btn review-action-btn--primary" onclick="ReviewPage._submitAnswer()">
                        <span class="material-icons-round">check</span> Kiểm tra
                    </button>
                </div>
            </div>
        `;

        // Focus input + Enter key submit
        const input = document.getElementById('review-answer-input');
        if (input) {
            input.focus();
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this._submitAnswer();
                }
            });
        }

        // Tự phát audio cho vòng 2
        if (s.currentRound === 2) {
            setTimeout(() => this._playAudio(), 300);
        }

        // Reset attempts tracking
        this._currentAttempts = 1;
        this._currentRevealed = false;
    },

    _playAudio() {
        const s = this._session;
        const card = s.cards[s.currentIndex];
        const word = card.fieldValues?.word || '';
        if (word && TTS.isAvailable()) {
            TTS.speak(word);
        }
    },

    // ============================================
    // ANSWER HANDLING
    // ============================================
    _submitAnswer() {
        const input = document.getElementById('review-answer-input');
        const feedback = document.getElementById('review-feedback');
        if (!input) return;

        const userInput = input.value.trim();
        const expected = input.dataset.expected || '';

        if (!userInput) {
            input.focus();
            return;
        }

        const correct = this._normalize(userInput) === this._normalize(expected);

        if (correct) {
            feedback.innerHTML = `<div class="review-feedback__correct">
                <span class="material-icons-round">check_circle</span>
                Chính xác!
            </div>`;
            input.classList.add('review-input--correct');
            input.disabled = true;

            // Lưu kết quả
            this._recordResult(true);

            // Hiện mặt sau đầy đủ thông tin rồi mới cho sang câu tiếp
            setTimeout(() => this._renderBackside('correct'), 500);
        } else {
            feedback.innerHTML = `<div class="review-feedback__wrong">
                <span class="material-icons-round">cancel</span>
                Chưa đúng, thử lại!
            </div>`;
            input.classList.add('review-input--wrong');
            this._currentAttempts++;

            // Sau 3 lần sai → auto reveal
            if (this._currentAttempts > 3) {
                this._revealAnswer();
                return;
            }

            // Reset style sau 0.3s để user gõ tiếp
            setTimeout(() => {
                input.classList.remove('review-input--wrong');
                input.select();
            }, 300);
        }
    },

    _showHint() {
        const input = document.getElementById('review-answer-input');
        const feedback = document.getElementById('review-feedback');
        if (!input) return;

        const expected = input.dataset.expected || '';
        // Hiện % ký tự đầu dựa trên số lần gợi ý
        const revealLen = Math.min(expected.length, Math.ceil(expected.length * 0.3));
        const hint = expected.substring(0, revealLen);

        feedback.innerHTML = `<div class="review-feedback__hint">
            <span class="material-icons-round">lightbulb</span>
            Gợi ý: <strong>${this._escapeHtml(hint)}...</strong>
        </div>`;

        this._currentAttempts = Math.max(this._currentAttempts, 2);
        input.value = hint;
        input.focus();
        input.setSelectionRange(hint.length, hint.length);
    },

    _revealAnswer() {
        const input = document.getElementById('review-answer-input');
        const feedback = document.getElementById('review-feedback');
        if (!input) return;

        const expected = input.dataset.expected || '';
        feedback.innerHTML = `<div class="review-feedback__reveal">
            <span class="material-icons-round">visibility</span>
            Đáp án: <strong>${this._escapeHtml(expected)}</strong>
        </div>`;

        input.value = expected;
        input.disabled = true;
        this._currentRevealed = true;

        this._recordResult(false);
        setTimeout(() => this._renderBackside('revealed'), 800);
    },

    // ============================================
    // BACKSIDE (sau khi trả lời) — hiện đầy đủ thông tin thẻ
    // ============================================
    _renderBackside(mode) {
        const root = document.getElementById('review-page-root');
        if (!root) return;

        const s = this._session;
        if (!s || !s.cards || !s.cards[s.currentIndex]) {
            // Session đã reset / index out-of-range → không render backside
            return;
        }
        const card = s.cards[s.currentIndex];
        const fv = card.fieldValues || {};
        const word = fv.word || '';
        const ipa = fv.ipa || '';
        const meaning = fv.meaning || '';
        const example = fv.example || '';
        const partOfSpeech = fv.partOfSpeech || '';
        const total = s.cards.length;
        const progress = ((s.currentIndex + 1) / total) * 100;

        const difficulty = fv.difficulty || 'intermediate';
        const diffMeta = (typeof CardSchemas !== 'undefined' && CardSchemas.getDifficultyMeta)
            ? CardSchemas.getDifficultyMeta(difficulty)
            : { short: difficulty === 'advanced' ? 'ADV' : 'INT', label: difficulty };

        // BQT v2: badge vai trò + chú thích nguyên mẫu (không kiểm tra)
        const isIrr = (typeof CardSchemas !== 'undefined') && CardSchemas.isIrregular(card);
        const irrMeta = isIrr ? CardSchemas.getIrregularMeta(card) : null;
        const baseForm = fv.baseForm || '';
        const baseMeaning = fv.baseMeaning || '';

        const irrFormBadge = isIrr ? `
            <div style="display:flex;justify-content:center;margin-top:6px;">
                <span style="padding:4px 10px;border-radius:999px;background:${irrMeta.bg};color:${irrMeta.color};font-size:var(--font-size-sm);font-weight:700;">
                    ${this._escapeHtml(irrMeta.label)} · ${this._escapeHtml(irrMeta.roleShort)}
                </span>
            </div>
        ` : '';
        const irregularNoteHtml = (isIrr && irrMeta.note) ? `
            <div style="margin-top:var(--spacing-sm);padding:var(--spacing-sm) var(--spacing-md);background:${irrMeta.bg};border-radius:10px;font-size:0.9rem;color:${irrMeta.color};text-align:center;font-weight:700;">
                <span class="material-icons-round" style="font-size:14px;vertical-align:middle;color:${irrMeta.color};">rule</span>
                ${this._escapeHtml(irrMeta.note)}
            </div>
        ` : '';
        const baseFormHtml = (isIrr && baseForm) ? `
            <div style="margin-top:var(--spacing-sm);padding:var(--spacing-sm) var(--spacing-md);background:${irrMeta.bg};border-radius:10px;font-size:0.9rem;color:var(--color-text-secondary);text-align:center;">
                <span class="material-icons-round" style="font-size:14px;vertical-align:middle;color:${irrMeta.color};">info</span>
                Nguyên mẫu: <strong style="color:${irrMeta.color};">${this._escapeHtml(baseForm)}</strong>${baseMeaning ? ` — ${this._escapeHtml(baseMeaning)}` : ''}
            </div>
        ` : '';

        const headerBadge = mode === 'correct'
            ? `<span class="review-round-badge" style="background:linear-gradient(135deg,#10B981,#059669);">✓ Chính xác</span>`
            : `<span class="review-round-badge" style="background:linear-gradient(135deg,#F59E0B,#D97706);">Xem đáp án</span>`;

        root.innerHTML = `
            <div class="review-card-screen" data-difficulty="${difficulty}">
                <div class="review-header">
                    <div class="review-header__info">
                        ${headerBadge}
                        <span class="review-counter">Vòng ${s.currentRound}/2 · Câu ${s.currentIndex + 1}/${total}</span>
                        <span class="difficulty-badge difficulty-badge--${difficulty}" title="${diffMeta.label}">${diffMeta.short}</span>
                    </div>
                    <div class="review-progress">
                        <div class="review-progress__fill" style="width:${progress}%"></div>
                    </div>
                </div>

                <div class="study-intro-card">
                    <div class="study-intro-card__word"${isIrr ? ` style="color:${irrMeta.color};"` : ''}>${this._escapeHtml(word)}</div>
                    ${ipa ? `<div class="study-intro-card__ipa">${this._escapeHtml(ipa)}</div>` : ''}
                    ${partOfSpeech ? `<div class="study-intro-card__pos">${this._escapeHtml(partOfSpeech)}</div>` : ''}
                    ${irrFormBadge}
                    <button class="review-audio-btn" onclick="ReviewPage._playAudio()" style="margin:var(--spacing-md) 0;">
                        <span class="material-icons-round">volume_up</span>
                        Nghe phát âm
                    </button>
                    <div class="study-intro-card__divider"></div>
                    <div class="study-intro-card__meaning-label">NGHĨA</div>
                    <div class="study-intro-card__meaning">${this._escapeHtml(meaning)}</div>
                    ${example ? `
                        <div class="study-intro-card__example-label">VÍ DỤ</div>
                        <div class="study-intro-card__example">${this._escapeHtml(example)}</div>
                    ` : ''}
                    ${irregularNoteHtml}
                    ${baseFormHtml}
                </div>

                <div class="review-actions">
                    <button class="review-action-btn--primary review-action-btn" onclick="ReviewPage._nextCard()">
                        Tiếp theo
                        <span class="material-icons-round">arrow_forward</span>
                    </button>
                </div>
            </div>
        `;

        // Cho phép Enter / Space để next.
        // Phải gỡ handler cũ TRƯỚC khi gắn mới — và bắt buộc đặt sau RAF
        // để event Enter đang bubble (từ input của thẻ trước, vừa gọi
        // _submitAnswer rồi setTimeout backside) không kích hoạt nhầm
        // _nextCard ngay tại lượt render này.
        this._detachBacksideKey();
        const expectedIndex = s.currentIndex; // chốt thẻ tại thời điểm vẽ backside
        const expectedRound = s.currentRound;
        requestAnimationFrame(() => {
            const handler = (e) => {
                if (e.key !== 'Enter' && e.key !== ' ') return;
                // Bảo vệ thêm: nếu session đã chuyển thẻ (race), bỏ qua.
                if (!this._session
                    || this._session.currentIndex !== expectedIndex
                    || this._session.currentRound !== expectedRound) {
                    this._detachBacksideKey();
                    return;
                }
                e.preventDefault();
                this._detachBacksideKey();
                this._nextCard();
            };
            this._session._backsideKeyHandler = handler;
            document.addEventListener('keydown', handler);
        });
    },

    _detachBacksideKey() {
        const h = this._session && this._session._backsideKeyHandler;
        if (h) {
            document.removeEventListener('keydown', h);
            this._session._backsideKeyHandler = null;
        }
    },

    _recordResult(correct) {
        const s = this._session;
        const card = s.cards[s.currentIndex];
        const result = {
            correct: correct && !this._currentRevealed,
            attempts: this._currentAttempts,
            revealed: this._currentRevealed
        };
        if (s.currentRound === 1) {
            s.round1Results[card.id] = result;
        } else {
            s.round2Results[card.id] = result;
        }
    },

    _nextCard() {
        const s = this._session;
        s.currentIndex++;

        if (s.currentIndex >= s.cards.length) {
            // Hết card trong vòng
            if (s.currentRound === 1) {
                // Chuyển thẳng sang vòng 2 không qua màn summary (liền mạch).
                // Nếu user thoát giữa chừng → FSRS chưa cập nhật → lần sau ôn lại đủ 2 vòng.
                this._startRound(2);
            } else {
                this._finalizeSession();
            }
        } else {
            this._renderCard();
        }
    },

    // ============================================
    // ROUND SUMMARY (giữa vòng 1 và 2)
    // ============================================
    _renderRoundSummary() {
        const root = document.getElementById('review-page-root');
        if (!root) return;

        const results = Object.values(this._session.round1Results);
        const total = results.length;
        const firstTry = results.filter(r => r.correct && r.attempts === 1 && !r.revealed).length;
        const needHint = results.filter(r => r.correct && r.attempts > 1 && !r.revealed).length;
        const revealed = results.filter(r => r.revealed).length;

        root.innerHTML = `
            <div class="review-intro">
                <div class="review-intro__icon review-intro__icon--success">
                    <span class="material-icons-round">check_circle</span>
                </div>
                <h1 class="review-intro__title">Hoàn thành Vòng 1</h1>
                <div class="review-round-stats">
                    <div class="review-round-stat">
                        <span class="review-round-stat__value">${firstTry}</span>
                        <span class="review-round-stat__label">Đúng lần đầu</span>
                    </div>
                    <div class="review-round-stat">
                        <span class="review-round-stat__value">${needHint}</span>
                        <span class="review-round-stat__label">Cần gợi ý</span>
                    </div>
                    <div class="review-round-stat">
                        <span class="review-round-stat__value">${revealed}</span>
                        <span class="review-round-stat__label">Xem đáp án</span>
                    </div>
                </div>
                <p class="review-intro__desc" style="margin-top:var(--spacing-lg);">
                    Tiếp theo: <strong>Vòng 2 — Nghe phát âm</strong>
                </p>
                <button class="review-btn-primary" onclick="ReviewPage._startRound(2)">
                    Bắt đầu Vòng 2
                    <span class="material-icons-round">arrow_forward</span>
                </button>
            </div>
        `;
    },

    // ============================================
    // FINALIZE SESSION - compute ratings, save to Firestore
    // ============================================
    async _finalizeSession() {
        const root = document.getElementById('review-page-root');
        if (!root) return;

        // Show saving
        root.innerHTML = `
            <div class="review-loading">
                <span class="material-icons-round" style="font-size:40px;color:var(--color-text-muted);animation:spin 1s linear infinite;">hourglass_empty</span>
                <p style="color:var(--color-text-muted);margin-top:var(--spacing-sm);">Đang lưu kết quả...</p>
            </div>
        `;

        const s = this._session;
        const ratingsCount = { 1: 0, 2: 0, 3: 0, 4: 0 };
        const updatePromises = [];

        for (const card of s.cards) {
            const r1 = s.round1Results[card.id] || { correct: false, attempts: 3, revealed: true };
            const r2 = s.round2Results[card.id] || { correct: false, attempts: 3, revealed: true };
            const rating = this._computeFinalRating(r1, r2);
            ratingsCount[rating]++;

            // Gọi FSRS
            const updatedCard = FSRS.review(card, rating);

            // Lưu lịch sử
            updatedCard.lastReviewSession = {
                date: new Date().toISOString(),
                round1: r1,
                round2: r2,
                finalRating: ['', 'again', 'hard', 'good', 'easy'][rating]
            };

            // Update Firestore
            updatePromises.push(
                FirestoreDB.updateCard(card.id, {
                    state: updatedCard.state,
                    difficulty: updatedCard.difficulty,
                    stability: updatedCard.stability,
                    stepIndex: updatedCard.stepIndex,
                    dueDate: updatedCard.dueDate,
                    reps: updatedCard.reps,
                    lapses: updatedCard.lapses,
                    lastReview: updatedCard.lastReview,
                    lastReviewSession: updatedCard.lastReviewSession
                }).catch(e => console.error('[ReviewPage] Save card error:', e))
            );
        }

        await Promise.all(updatePromises);

        // (FamilyWordManager schema mới: state từ vựng đã nằm trong Firestore card.state,
        //  không cần đồng bộ localStorage ở đây nữa.)

        // Log study time
        const durationMs = Date.now() - this._startedAt;
        const minutes = Math.max(1, Math.round(durationMs / 60000));
        try {
            await FirestoreDB.logStudyTime(minutes);
        } catch (e) {
            console.error('[ReviewPage] Log study time error:', e);
        }

        this._renderFinalSummary(ratingsCount, durationMs);
    },

    // ============================================
    // COMPUTE FINAL RATING (2 rounds → 1 FSRS rating)
    // ============================================
    _computeFinalRating(r1, r2) {
        // Chính sách nghiêm ngặt: sai 1 lần = reset ngay về bậc 30 phút.
        // - Revealed (xem đáp án)        -> AGAIN
        // - Không correct                -> AGAIN
        // - Có bất kỳ lần gõ sai nào     -> AGAIN  (attempts > 1)
        if (r1.revealed || r2.revealed) return FSRS.Rating.AGAIN;
        if (!r1.correct || !r2.correct) return FSRS.Rating.AGAIN;
        if (r1.attempts > 1 || r2.attempts > 1) return FSRS.Rating.AGAIN;

        // Cả 2 vòng đúng ngay lần đầu -> đẩy bậc nhanh
        return FSRS.Rating.GOOD;
    },

    // ============================================
    // FINAL SUMMARY
    // ============================================
    _renderFinalSummary(ratingsCount, durationMs) {
        const root = document.getElementById('review-page-root');
        if (!root) return;

        const mins = Math.floor(durationMs / 60000);
        const secs = Math.floor((durationMs % 60000) / 1000);
        const timeStr = `${mins} phút ${secs} giây`;

        root.innerHTML = `
            <div class="review-intro">
                <div class="review-intro__icon review-intro__icon--success">
                    <span class="material-icons-round">celebration</span>
                </div>
                <h1 class="review-intro__title">Hoàn thành ôn tập!</h1>
                <p class="review-intro__desc">Ôn xong ${this._session.cards.length} từ trong ${timeStr}</p>

                <div class="review-final-stats">
                    <div class="review-final-stat review-final-stat--easy">
                        <div class="review-final-stat__emoji">😎</div>
                        <div class="review-final-stat__value">${ratingsCount[4]}</div>
                        <div class="review-final-stat__label">Dễ</div>
                    </div>
                    <div class="review-final-stat review-final-stat--good">
                        <div class="review-final-stat__emoji">😊</div>
                        <div class="review-final-stat__value">${ratingsCount[3]}</div>
                        <div class="review-final-stat__label">Tốt</div>
                    </div>
                    <div class="review-final-stat review-final-stat--hard">
                        <div class="review-final-stat__emoji">😐</div>
                        <div class="review-final-stat__value">${ratingsCount[2]}</div>
                        <div class="review-final-stat__label">Khó</div>
                    </div>
                    <div class="review-final-stat review-final-stat--again">
                        <div class="review-final-stat__emoji">😓</div>
                        <div class="review-final-stat__value">${ratingsCount[1]}</div>
                        <div class="review-final-stat__label">Học lại</div>
                    </div>
                </div>

                <div style="display:flex;gap:var(--spacing-sm);width:100%;max-width:400px;">
                    <button class="review-btn-secondary" onclick="Router.navigate('/vocabulary')" style="flex:1;">
                        Về từ vựng
                    </button>
                    <button class="review-btn-primary" onclick="ReviewPage.onEnter()" style="flex:1;">
                        Ôn tiếp
                    </button>
                </div>
            </div>
        `;
    },

    // ============================================
    // EMPTY / ERROR STATES
    // ============================================
    _renderEmpty() {
        const root = document.getElementById('review-page-root');
        if (!root) return;
        root.innerHTML = `
            <div class="review-intro">
                <div class="review-intro__icon">
                    <span class="material-icons-round">check_circle_outline</span>
                </div>
                <h1 class="review-intro__title">Bạn hiện không có từ cần ôn</h1>
                <p class="review-intro__desc">Tất cả các thẻ đến hạn đã được ôn xong. Hãy quay lại sau hoặc học thêm từ mới!</p>
                <button class="review-btn-primary" onclick="Router.navigate('/study?type=vocabulary')">
                    <span class="material-icons-round">auto_stories</span>
                    Học từ mới
                </button>
                <button class="review-btn-link" onclick="Router.navigate('/vocabulary')">
                    Về trang từ vựng
                </button>
            </div>
        `;
    },

    _renderError(msg) {
        const root = document.getElementById('review-page-root');
        if (!root) return;
        root.innerHTML = `
            <div class="review-intro">
                <div class="review-intro__icon" style="color:#EF4444;">
                    <span class="material-icons-round">error_outline</span>
                </div>
                <h1 class="review-intro__title">Có lỗi xảy ra</h1>
                <p class="review-intro__desc">${this._escapeHtml(msg || 'Không thể tải phiên ôn tập.')}</p>
                <button class="review-btn-primary" onclick="Router.navigate('/vocabulary')">
                    Quay lại
                </button>
            </div>
        `;
    },

    // ============================================
    // HELPERS
    // ============================================
    _normalize(str) {
        return (str || '').trim().toLowerCase().replace(/\s+/g, ' ');
    },

    _escapeHtml(str) {
        return String(str || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
};
