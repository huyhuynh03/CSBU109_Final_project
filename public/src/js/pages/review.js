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

            // Lấy cards due
            let cards = await FirestoreDB.getDueCards(type);

            // Filter theo familyId nếu có
            if (familyId) {
                cards = cards.filter(c => c.fieldValues?.familyId === familyId);
            }

            // Chỉ ôn tập những card state = review/relearning (đã học rồi)
            cards = cards.filter(c => {
                const st = c.state;
                return st === FSRS.State.REVIEW || st === FSRS.State.RELEARNING ||
                       st === 'review' || st === 'relearning';
            });

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
                startedAt: new Date()
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

        root.innerHTML = `
            <div class="review-intro">
                <div class="review-intro__icon">
                    <span class="material-icons-round">replay</span>
                </div>
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
        const card = s.cards[s.currentIndex];
        const total = s.cards.length;
        const progress = ((s.currentIndex) / total) * 100;

        const meaning = card.fieldValues?.meaning || '(chưa có nghĩa)';
        const partOfSpeech = card.fieldValues?.partOfSpeech || '';
        const ipa = card.fieldValues?.ipa || '';
        const word = card.fieldValues?.word || '';

        // Nội dung câu hỏi khác nhau giữa 2 vòng
        let questionHtml;
        if (s.currentRound === 1) {
            // Vòng 1: Hiển thị nghĩa tiếng Việt
            questionHtml = `
                <div class="review-question review-question--vn">
                    <div class="review-question__label">NGHĨA</div>
                    <div class="review-question__main">${this._escapeHtml(meaning)}</div>
                    ${partOfSpeech ? `<div class="review-question__pos">(${partOfSpeech})</div>` : ''}
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
                </div>
            `;
        }

        root.innerHTML = `
            <div class="review-card-screen">
                <!-- Progress Header -->
                <div class="review-header">
                    <div class="review-header__info">
                        <span class="review-round-badge">Vòng ${s.currentRound}/2</span>
                        <span class="review-counter">Câu ${s.currentIndex + 1}/${total}</span>
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
                           data-expected="${this._escapeHtml(word)}">
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
        const card = this._session.cards[this._session.currentIndex];
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

            // Chuyển câu tiếp sau 0.8s
            setTimeout(() => this._nextCard(), 800);
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
        setTimeout(() => this._nextCard(), 1500);
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
                this._renderRoundSummary();
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
                    dueDate: updatedCard.dueDate,
                    reps: updatedCard.reps,
                    lapses: updatedCard.lapses,
                    lastReview: updatedCard.lastReview,
                    lastReviewSession: updatedCard.lastReviewSession
                }).catch(e => console.error('[ReviewPage] Save card error:', e))
            );
        }

        await Promise.all(updatePromises);

        // Cập nhật FamilyWordManager cho từ có familyId (khi không phải Again)
        try {
            const familyCards = s.cards.filter(c => c.fieldValues?.familyId);
            const familyGroups = {};
            familyCards.forEach(c => {
                const fid = c.fieldValues.familyId;
                if (!familyGroups[fid]) familyGroups[fid] = [];
                familyGroups[fid].push(c);
            });
            for (const fid of Object.keys(familyGroups)) {
                const allInFamily = await FamilyWordManager.getFamilyCards(fid);
                for (const card of familyGroups[fid]) {
                    const r1 = s.round1Results[card.id];
                    const r2 = s.round2Results[card.id];
                    const rating = this._computeFinalRating(r1, r2);
                    if (rating !== FSRS.Rating.AGAIN) {
                        await FamilyWordManager.onWordLearned(card, allInFamily);
                    }
                }
            }
        } catch (e) {
            console.error('[ReviewPage] Family update error:', e);
        }

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
        // Nếu bất kỳ vòng nào phải xem đáp án → Again
        if (r1.revealed || r2.revealed) return FSRS.Rating.AGAIN;
        if (!r1.correct || !r2.correct) return FSRS.Rating.AGAIN;

        // Cả 2 vòng đúng ngay lần đầu
        if (r1.attempts === 1 && r2.attempts === 1) return FSRS.Rating.EASY;

        // Cả 2 vòng cần gợi ý
        if (r1.attempts > 1 && r2.attempts > 1) return FSRS.Rating.HARD;

        // 1 trong 2 cần gợi ý
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
                <h1 class="review-intro__title">Không có từ cần ôn</h1>
                <p class="review-intro__desc">Hiện không có từ nào đến hạn ôn tập. Quay lại sau hoặc học thêm từ mới!</p>
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
