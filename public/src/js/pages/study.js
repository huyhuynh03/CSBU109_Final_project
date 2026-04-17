// ============================================
// Study Page - Học từ mới (3-step flow)
// ============================================
// Bước 1: Giới thiệu từ (flashcard xem)
// Bước 2: Tập viết (VN → EN)
// Bước 3: Tập nghe (Listen → EN)

const StudyPage = {
    _session: null,
    _startedAt: null,
    _currentAttempts: 1,
    _currentRevealed: false,
    _pendingFamilyPopup: null,

    render() {
        return `<div class="study-page page-enter" id="study-page-root">
            <div class="review-loading">
                <span class="material-icons-round" style="font-size:40px;color:var(--color-text-muted);animation:spin 1s linear infinite;">hourglass_empty</span>
                <p style="color:var(--color-text-muted);margin-top:var(--spacing-sm);">Đang tải phiên học...</p>
            </div>
        </div>`;
    },

    async onEnter() {
        console.log('[StudyPage] Entered');
        if (!Auth.isSignedIn()) {
            Router.navigate('/auth');
            return;
        }
        await this._init();
    },

    async _init() {
        try {
            const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
            const type = params.get('type') || 'vocabulary';
            const topicId = params.get('topicId');
            const familyId = params.get('familyId');

            // Lấy tất cả cards mới
            let cards = await FirestoreDB.getCards({ cardType: type });
            cards = cards.filter(c => c.state === 'new' || c.state === FSRS.State.NEW);

            // Filter theo topic / family nếu có
            if (topicId) {
                cards = cards.filter(c => c.folderId === topicId);
            }
            if (familyId) {
                cards = cards.filter(c => c.fieldValues?.familyId === familyId);
            }

            if (cards.length === 0) {
                this._renderEmpty();
                return;
            }

            // Sort theo familyOrder (từ gốc trước), sau đó createdAt
            cards.sort((a, b) => {
                const oa = a.fieldValues?.familyOrder ?? 99;
                const ob = b.fieldValues?.familyOrder ?? 99;
                if (oa !== ob) return oa - ob;
                return 0;
            });

            // Limit 20 từ/phiên
            cards = cards.slice(0, 20);

            this._session = {
                cards,
                type,
                currentIndex: 0,
                currentStep: 1, // 1=intro, 2=VN→EN, 3=Listen→EN
                results: {},    // cardId → { step2, step3 }
                startedAt: new Date()
            };
            this._startedAt = Date.now();

            // Check pending families → hiện banner nếu có
            const pending = FamilyWordManager.getIncompleteFamilies();
            if (pending.length > 0 && !familyId) {
                this._renderPendingBanner(pending);
            } else {
                this._renderIntro();
            }
        } catch (error) {
            console.error('[StudyPage] Init error:', error);
            this._renderError(error.message);
        }
    },

    // ============================================
    // PENDING FAMILIES BANNER
    // ============================================
    _renderPendingBanner(pending) {
        const root = document.getElementById('study-page-root');
        if (!root) return;

        const list = pending.slice(0, 3).map(f =>
            `${f.familyId} (${f.learnedWords.length}/${f.totalWords})`
        ).join(' · ');
        const more = pending.length > 3 ? ` +${pending.length - 3} nữa` : '';

        root.innerHTML = `
            <div class="review-intro">
                <div class="family-banner" style="max-width:500px;width:100%;">
                    <span class="material-icons-round family-banner__icon">info</span>
                    <div class="family-banner__content">
                        <div class="family-banner__title">Bạn có ${pending.length} nhóm từ chưa hoàn thành</div>
                        <div class="family-banner__desc">${this._escapeHtml(list)}${more}</div>
                    </div>
                </div>
                <div style="display:flex;gap:var(--spacing-sm);flex-wrap:wrap;justify-content:center;margin-top:var(--spacing-md);">
                    <button class="review-btn-primary" onclick="StudyPage._learnPendingFirst()" style="margin-top:0;">
                        Học tiếp nhóm từ
                    </button>
                    <button class="review-btn-secondary" onclick="Router.navigate('/vocabulary')" style="margin-top:0;">
                        Xem chi tiết
                    </button>
                    <button class="review-btn-secondary" onclick="StudyPage._renderIntro()" style="margin-top:0;">
                        Học từ mới
                    </button>
                </div>
            </div>
        `;
    },

    async _learnPendingFirst() {
        const pending = FamilyWordManager.getIncompleteFamilies();
        if (pending.length === 0) {
            this._renderIntro();
            return;
        }
        // Lấy cards chưa học của các family pending
        const allCards = await FirestoreDB.getCards({ cardType: 'vocabulary' });
        const familyIds = new Set(pending.map(f => f.familyId));
        const learnedSets = {};
        pending.forEach(f => { learnedSets[f.familyId] = new Set(f.learnedWords || []); });

        const pendingCards = allCards.filter(c => {
            const fid = c.fieldValues?.familyId;
            if (!fid || !familyIds.has(fid)) return false;
            const word = c.fieldValues?.word;
            return !learnedSets[fid].has(word) && (c.state === 'new' || c.state === FSRS.State.NEW);
        });

        if (pendingCards.length === 0) {
            Toast.show('Không tìm thấy từ chưa học nào trong các nhóm pending', 'info');
            this._renderIntro();
            return;
        }

        this._session.cards = pendingCards.slice(0, 20);
        this._session.currentIndex = 0;
        this._session.currentStep = 1;
        this._renderIntro();
    },

    // ============================================
    // INTRO
    // ============================================
    _renderIntro() {
        const root = document.getElementById('study-page-root');
        if (!root) return;
        const count = this._session.cards.length;

        root.innerHTML = `
            <div class="review-intro">
                <div class="review-intro__icon">
                    <span class="material-icons-round">auto_stories</span>
                </div>
                <h1 class="review-intro__title">Học ${count} từ mới</h1>
                <p class="review-intro__desc">Mỗi từ sẽ qua 3 bước:</p>
                <div class="review-intro__steps">
                    <div class="review-step-card">
                        <div class="review-step-card__number">1</div>
                        <div class="review-step-card__content">
                            <div class="review-step-card__title">Giới thiệu từ</div>
                            <div class="review-step-card__desc">Xem nghĩa, phát âm, ví dụ</div>
                        </div>
                    </div>
                    <div class="review-step-card">
                        <div class="review-step-card__number">2</div>
                        <div class="review-step-card__content">
                            <div class="review-step-card__title">Tập viết</div>
                            <div class="review-step-card__desc">Nhìn nghĩa tiếng Việt, gõ từ tiếng Anh</div>
                        </div>
                    </div>
                    <div class="review-step-card">
                        <div class="review-step-card__number">3</div>
                        <div class="review-step-card__content">
                            <div class="review-step-card__title">Tập nghe</div>
                            <div class="review-step-card__desc">Nghe phát âm, gõ từ tiếng Anh</div>
                        </div>
                    </div>
                </div>
                <button class="review-btn-primary" onclick="StudyPage._renderStep()">
                    Bắt đầu học
                    <span class="material-icons-round">arrow_forward</span>
                </button>
                <button class="review-btn-link" onclick="Router.navigate('/vocabulary')">
                    Hủy, quay lại
                </button>
            </div>
        `;
    },

    // ============================================
    // RENDER A STEP
    // ============================================
    _renderStep() {
        const s = this._session;
        const card = s.cards[s.currentIndex];
        if (!card) {
            this._finalizeSession();
            return;
        }

        if (s.currentStep === 1) {
            this._renderIntroStep(card);
        } else if (s.currentStep === 2) {
            this._renderTypeStep(card, 'vn-to-en');
        } else if (s.currentStep === 3) {
            this._renderTypeStep(card, 'listen-to-en');
        }
    },

    // ============================================
    // STEP 1: INTRODUCTION (flashcard xem)
    // ============================================
    _renderIntroStep(card) {
        const root = document.getElementById('study-page-root');
        if (!root) return;

        const s = this._session;
        const fv = card.fieldValues || {};
        const word = fv.word || '';
        const ipa = fv.ipa || '';
        const meaning = fv.meaning || '';
        const example = fv.example || '';
        const partOfSpeech = fv.partOfSpeech || '';
        const total = s.cards.length;
        const progress = (s.currentIndex / total) * 100;

        const difficulty = fv.difficulty || 'intermediate';
        const diffMeta = (typeof CardSchemas !== 'undefined' && CardSchemas.getDifficultyMeta)
            ? CardSchemas.getDifficultyMeta(difficulty)
            : { short: difficulty === 'advanced' ? 'ADV' : 'INT', label: difficulty };

        root.innerHTML = `
            <div class="review-card-screen" data-difficulty="${difficulty}">
                <div class="review-header">
                    <div class="review-header__info">
                        <span class="review-round-badge" style="background:linear-gradient(135deg,#10B981,#059669);">Bước 1/3 · Giới thiệu</span>
                        <span class="review-counter">Từ ${s.currentIndex + 1}/${total}</span>
                        <span class="difficulty-badge difficulty-badge--${difficulty}" title="${diffMeta.label}">${diffMeta.short}</span>
                    </div>
                    <div class="review-progress">
                        <div class="review-progress__fill" style="width:${progress}%"></div>
                    </div>
                </div>

                <div class="study-intro-card">
                    <div class="study-intro-card__word">${this._escapeHtml(word)}</div>
                    ${ipa ? `<div class="study-intro-card__ipa">${this._escapeHtml(ipa)}</div>` : ''}
                    ${partOfSpeech ? `<div class="study-intro-card__pos">${this._escapeHtml(partOfSpeech)}</div>` : ''}
                    <button class="review-audio-btn" onclick="StudyPage._playWord()" style="margin:var(--spacing-md) 0;">
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
                </div>

                <div class="review-actions">
                    <button class="review-action-btn--primary review-action-btn" onclick="StudyPage._nextStep()">
                        Tôi đã hiểu
                        <span class="material-icons-round">check</span>
                    </button>
                </div>
            </div>
        `;

        // Auto phát audio khi vào bước 1
        setTimeout(() => this._playWord(), 400);
    },

    // ============================================
    // STEP 2 & 3: TYPING
    // ============================================
    _renderTypeStep(card, variant) {
        const root = document.getElementById('study-page-root');
        if (!root) return;

        const s = this._session;
        const fv = card.fieldValues || {};
        const word = fv.word || '';
        const meaning = fv.meaning || '';
        const ipa = fv.ipa || '';
        const partOfSpeech = fv.partOfSpeech || '';
        const total = s.cards.length;
        const progress = (s.currentIndex / total) * 100;

        const stepLabel = s.currentStep === 2 ? 'Bước 2/3 · Tập viết' : 'Bước 3/3 · Tập nghe';
        const instruction = variant === 'vn-to-en' ? 'Gõ từ tiếng Anh tương ứng:' : 'Gõ từ bạn nghe được:';

        let questionHtml;
        if (variant === 'vn-to-en') {
            questionHtml = `
                <div class="review-question review-question--vn">
                    <div class="review-question__label">NGHĨA</div>
                    <div class="review-question__main">${this._escapeHtml(meaning)}</div>
                    ${partOfSpeech ? `<div class="review-question__pos">(${partOfSpeech})</div>` : ''}
                </div>
            `;
        } else {
            const fallback = !TTS.isAvailable();
            questionHtml = `
                <div class="review-question review-question--listen">
                    <button class="review-audio-btn" onclick="StudyPage._playWord()">
                        <span class="material-icons-round">volume_up</span>
                        Phát lại âm thanh
                    </button>
                    ${fallback && ipa ? `<div class="review-question__ipa">${this._escapeHtml(ipa)}</div>` : ''}
                    ${partOfSpeech ? `<div class="review-question__pos">(${partOfSpeech})</div>` : ''}
                </div>
            `;
        }

        const difficulty = fv.difficulty || 'intermediate';
        const diffMeta = (typeof CardSchemas !== 'undefined' && CardSchemas.getDifficultyMeta)
            ? CardSchemas.getDifficultyMeta(difficulty)
            : { short: difficulty === 'advanced' ? 'ADV' : 'INT', label: difficulty };

        root.innerHTML = `
            <div class="review-card-screen" data-difficulty="${difficulty}">
                <div class="review-header">
                    <div class="review-header__info">
                        <span class="review-round-badge" style="background:linear-gradient(135deg,#10B981,#059669);">${stepLabel}</span>
                        <span class="review-counter">Từ ${s.currentIndex + 1}/${total}</span>
                        <span class="difficulty-badge difficulty-badge--${difficulty}" title="${diffMeta.label}">${diffMeta.short}</span>
                    </div>
                    <div class="review-progress">
                        <div class="review-progress__fill" style="width:${progress}%"></div>
                    </div>
                </div>

                ${questionHtml}

                <div class="review-input-wrap">
                    <label class="review-input-label">${instruction}</label>
                    <input type="text"
                           class="review-input"
                           id="study-answer-input"
                           autocomplete="off" autocapitalize="off" spellcheck="false"
                           placeholder="Nhập từ..."
                           data-expected="${this._escapeHtml(word)}">
                    <div class="review-feedback" id="study-feedback"></div>
                </div>

                <div class="review-actions">
                    ${variant === 'listen-to-en' ? `
                        <button class="review-action-btn" onclick="StudyPage._playWord()">
                            <span class="material-icons-round">replay</span> Nghe lại
                        </button>
                    ` : ''}
                    <button class="review-action-btn review-action-btn--hint" onclick="StudyPage._showHint()">
                        <span class="material-icons-round">lightbulb</span> Gợi ý
                    </button>
                    <button class="review-action-btn review-action-btn--reveal" onclick="StudyPage._revealAnswer()">
                        <span class="material-icons-round">visibility</span> Hiện đáp án
                    </button>
                    <button class="review-action-btn review-action-btn--primary" onclick="StudyPage._submitAnswer()">
                        <span class="material-icons-round">check</span> Kiểm tra
                    </button>
                </div>
            </div>
        `;

        const input = document.getElementById('study-answer-input');
        if (input) {
            input.focus();
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this._submitAnswer();
                }
            });
        }

        if (variant === 'listen-to-en') {
            setTimeout(() => this._playWord(), 300);
        }

        this._currentAttempts = 1;
        this._currentRevealed = false;
    },

    _playWord() {
        const card = this._session.cards[this._session.currentIndex];
        const word = card?.fieldValues?.word || '';
        if (word && TTS.isAvailable()) {
            TTS.speak(word);
        }
    },

    // ============================================
    // ANSWER HANDLING (same as review but for study)
    // ============================================
    _submitAnswer() {
        const input = document.getElementById('study-answer-input');
        const feedback = document.getElementById('study-feedback');
        if (!input) return;

        const userInput = input.value.trim();
        const expected = input.dataset.expected || '';
        if (!userInput) { input.focus(); return; }

        const correct = this._normalize(userInput) === this._normalize(expected);
        if (correct) {
            feedback.innerHTML = `<div class="review-feedback__correct">
                <span class="material-icons-round">check_circle</span> Chính xác!
            </div>`;
            input.classList.add('review-input--correct');
            input.disabled = true;
            this._recordStepResult(true);
            setTimeout(() => this._nextStep(), 800);
        } else {
            feedback.innerHTML = `<div class="review-feedback__wrong">
                <span class="material-icons-round">cancel</span> Chưa đúng, thử lại!
            </div>`;
            input.classList.add('review-input--wrong');
            this._currentAttempts++;
            if (this._currentAttempts > 3) {
                this._revealAnswer();
                return;
            }
            setTimeout(() => {
                input.classList.remove('review-input--wrong');
                input.select();
            }, 300);
        }
    },

    _showHint() {
        const input = document.getElementById('study-answer-input');
        const feedback = document.getElementById('study-feedback');
        if (!input) return;
        const expected = input.dataset.expected || '';
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
        const input = document.getElementById('study-answer-input');
        const feedback = document.getElementById('study-feedback');
        if (!input) return;
        const expected = input.dataset.expected || '';
        feedback.innerHTML = `<div class="review-feedback__reveal">
            <span class="material-icons-round">visibility</span>
            Đáp án: <strong>${this._escapeHtml(expected)}</strong>
        </div>`;
        input.value = expected;
        input.disabled = true;
        this._currentRevealed = true;
        this._recordStepResult(false);
        setTimeout(() => this._nextStep(), 1500);
    },

    _recordStepResult(correct) {
        const s = this._session;
        const card = s.cards[s.currentIndex];
        if (!s.results[card.id]) s.results[card.id] = {};
        s.results[card.id][`step${s.currentStep}`] = {
            correct: correct && !this._currentRevealed,
            attempts: this._currentAttempts,
            revealed: this._currentRevealed
        };
    },

    // ============================================
    // NEXT STEP / NEXT CARD
    // ============================================
    async _nextStep() {
        const s = this._session;
        if (s.currentStep === 1) {
            // Step 1 → 2
            s.currentStep = 2;
            this._renderStep();
        } else if (s.currentStep === 2) {
            // Step 2 → 3
            s.currentStep = 3;
            this._renderStep();
        } else {
            // Step 3 done → finalize this card
            await this._finalizeCard();
            // Check family popup
            const popupShown = await this._maybeShowFamilyPopup();
            if (popupShown) return; // sẽ gọi _nextCard() sau khi user chọn
            this._nextCard();
        }
    },

    async _finalizeCard() {
        const s = this._session;
        const card = s.cards[s.currentIndex];
        const stepResults = s.results[card.id] || {};
        const r2 = stepResults.step2 || { correct: false, revealed: true, attempts: 3 };
        const r3 = stepResults.step3 || { correct: false, revealed: true, attempts: 3 };

        // Rating cho từ mới: dựa trên 2 bước gõ
        let rating;
        if (r2.revealed || r3.revealed) rating = FSRS.Rating.HARD; // từ mới nên nhẹ tay hơn
        else if (r2.attempts === 1 && r3.attempts === 1) rating = FSRS.Rating.EASY;
        else if (r2.attempts > 1 && r3.attempts > 1) rating = FSRS.Rating.HARD;
        else rating = FSRS.Rating.GOOD;

        const updatedCard = FSRS.review(card, rating);
        updatedCard.lastReviewSession = {
            date: new Date().toISOString(),
            type: 'study-new',
            step2: r2,
            step3: r3,
            finalRating: ['', 'again', 'hard', 'good', 'easy'][rating]
        };

        try {
            await FirestoreDB.updateCard(card.id, {
                state: updatedCard.state,
                difficulty: updatedCard.difficulty,
                stability: updatedCard.stability,
                dueDate: updatedCard.dueDate,
                reps: updatedCard.reps,
                lapses: updatedCard.lapses,
                lastReview: updatedCard.lastReview,
                lastReviewSession: updatedCard.lastReviewSession
            });
        } catch (e) {
            console.error('[StudyPage] Save card error:', e);
        }
    },

    // ============================================
    // FAMILY WORD POPUP (sau khi học xong 1 từ có familyId)
    // ============================================
    async _maybeShowFamilyPopup() {
        const s = this._session;
        const card = s.cards[s.currentIndex];
        const familyId = card.fieldValues?.familyId;
        if (!familyId) return false;

        try {
            const allInFamily = await FamilyWordManager.getFamilyCards(familyId);
            const result = await FamilyWordManager.onWordLearned(card, allInFamily);
            if (!result || result.unlearnedCards.length === 0) return false;
            if (result.dismissed) return false;

            // Lọc ra những từ chưa có trong session hiện tại
            const sessionIds = new Set(s.cards.map(c => c.id));
            const newCandidates = result.unlearnedCards.filter(c => !sessionIds.has(c.id));
            if (newCandidates.length === 0) return false;

            this._showFamilyPopup(familyId, newCandidates);
            return true;
        } catch (e) {
            console.error('[StudyPage] Family popup error:', e);
            return false;
        }
    },

    _showFamilyPopup(familyId, candidates) {
        const existing = document.querySelector('.family-popup-overlay');
        if (existing) existing.remove();

        const wordsHtml = candidates.slice(0, 5).map(c => {
            const fv = c.fieldValues || {};
            const pos = fv.partOfSpeech ? `(${fv.partOfSpeech.charAt(0)}) ` : '';
            return `<div class="family-popup__word-item">
                <span class="material-icons-round">bookmark</span>
                <strong>${pos}${this._escapeHtml(fv.word || '?')}</strong>
                <span style="margin-left:auto;color:var(--color-text-muted);font-size:var(--font-size-sm);">${this._escapeHtml((fv.meaning || '').substring(0, 30))}</span>
            </div>`;
        }).join('');

        const overlay = document.createElement('div');
        overlay.className = 'family-popup-overlay';
        overlay.innerHTML = `
            <div class="family-popup">
                <div class="family-popup__title">
                    <span class="material-icons-round">family_restroom</span>
                    Nhóm từ cùng họ
                </div>
                <div class="family-popup__desc">
                    Từ <strong>"${this._escapeHtml(familyId)}"</strong> có ${candidates.length} từ liên quan:
                </div>
                <div class="family-popup__words">${wordsHtml}</div>
                <div class="family-popup__actions">
                    <button class="family-popup__btn family-popup__btn--secondary" onclick="StudyPage._familyPopupDismiss('${this._escapeHtml(familyId)}')">
                        Để sau
                    </button>
                    <button class="family-popup__btn family-popup__btn--primary" onclick="StudyPage._familyPopupLearn()">
                        Học ngay
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        // Lưu candidates để _familyPopupLearn dùng
        this._pendingFamilyPopup = { familyId, candidates };
    },

    _familyPopupLearn() {
        const p = this._pendingFamilyPopup;
        if (!p) return;
        const s = this._session;
        // Chèn các từ family vào ngay sau vị trí hiện tại
        s.cards.splice(s.currentIndex + 1, 0, ...p.candidates);
        document.querySelector('.family-popup-overlay')?.remove();
        this._pendingFamilyPopup = null;
        this._nextCard();
    },

    _familyPopupDismiss(familyId) {
        FamilyWordManager.dismissFamily(familyId);
        document.querySelector('.family-popup-overlay')?.remove();
        this._pendingFamilyPopup = null;
        this._nextCard();
    },

    _nextCard() {
        const s = this._session;
        s.currentIndex++;
        if (s.currentIndex >= s.cards.length) {
            this._finalizeSession();
        } else {
            s.currentStep = 1;
            this._renderStep();
        }
    },

    // ============================================
    // FINALIZE SESSION
    // ============================================
    async _finalizeSession() {
        const root = document.getElementById('study-page-root');
        if (!root) return;

        const s = this._session;
        const count = s.cards.length;

        // Log study time
        const durationMs = Date.now() - this._startedAt;
        const minutes = Math.max(1, Math.round(durationMs / 60000));
        try {
            await FirestoreDB.logStudyTime(minutes);
        } catch (e) {
            console.error('[StudyPage] Log study time error:', e);
        }

        const mins = Math.floor(durationMs / 60000);
        const secs = Math.floor((durationMs % 60000) / 1000);
        const timeStr = `${mins} phút ${secs} giây`;

        root.innerHTML = `
            <div class="review-intro">
                <div class="review-intro__icon review-intro__icon--success">
                    <span class="material-icons-round">celebration</span>
                </div>
                <h1 class="review-intro__title">Đã học xong ${count} từ mới!</h1>
                <p class="review-intro__desc">Tổng thời gian: ${timeStr}</p>
                <p class="review-intro__desc" style="font-size:var(--font-size-sm);">
                    Các từ này sẽ xuất hiện trong chế độ Ôn tập theo lịch FSRS.
                </p>
                <div style="display:flex;gap:var(--spacing-sm);width:100%;max-width:400px;">
                    <button class="review-btn-secondary" onclick="Router.navigate('/vocabulary')" style="flex:1;">
                        Về từ vựng
                    </button>
                    <button class="review-btn-primary" onclick="StudyPage.onEnter()" style="flex:1;">
                        Học tiếp
                    </button>
                </div>
            </div>
        `;
    },

    _renderEmpty() {
        const root = document.getElementById('study-page-root');
        if (!root) return;
        root.innerHTML = `
            <div class="review-intro">
                <div class="review-intro__icon">
                    <span class="material-icons-round">check_circle_outline</span>
                </div>
                <h1 class="review-intro__title">Không có từ mới</h1>
                <p class="review-intro__desc">Bạn đã học hết các từ mới hiện có. Hãy ôn tập hoặc thêm từ mới!</p>
                <button class="review-btn-primary" onclick="Router.navigate('/review?type=vocabulary')">
                    <span class="material-icons-round">replay</span>
                    Đi ôn tập
                </button>
                <button class="review-btn-link" onclick="Router.navigate('/vocabulary')">
                    Về trang từ vựng
                </button>
            </div>
        `;
    },

    _renderError(msg) {
        const root = document.getElementById('study-page-root');
        if (!root) return;
        root.innerHTML = `
            <div class="review-intro">
                <div class="review-intro__icon" style="color:#EF4444;">
                    <span class="material-icons-round">error_outline</span>
                </div>
                <h1 class="review-intro__title">Có lỗi xảy ra</h1>
                <p class="review-intro__desc">${this._escapeHtml(msg || 'Không thể tải phiên học.')}</p>
                <button class="review-btn-primary" onclick="Router.navigate('/vocabulary')">
                    Quay lại
                </button>
            </div>
        `;
    },

    // Helpers
    _normalize(str) { return (str || '').trim().toLowerCase().replace(/\s+/g, ' '); },
    _escapeHtml(str) {
        return String(str || '')
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    }
};
