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
    _currentUsedHint: false,
    _pendingFamilyPopup: null,
    _allTypeCards: [],

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
            const groupType = params.get('groupType');
            const groupKey = params.get('groupKey');
            const cardId = params.get('cardId');

            // Lấy TOÀN BỘ cards (một query) rồi filter client-side.
            // Lưu lại để tính pending families mà không phải query lại.
            const allTypeCards = await FirestoreDB.getCards({ cardType: type });
            this._allTypeCards = allTypeCards;
            const isNewOrLearning = (c) => {
                const st = c.state;
                return st === 'new' || st === 'learning'
                    || st === FSRS.State.NEW || st === FSRS.State.LEARNING;
            };
            let cards = allTypeCards.filter(isNewOrLearning);

            // Filter theo topic / family / group / cardId nếu có
            if (topicId) {
                cards = cards.filter(c => c.folderId === topicId);
            }
            if (familyId) {
                // Chỉ còn từ mới/learning của family là đủ — state Firestore là nguồn truth,
                // không cần đối chiếu localStorage.
                // rawKey family schema mới có dạng "familyId|stem" để chỉ gom đúng
                // cụm họ từ phái sinh; belongsToGroup hiểu cả 2 định dạng (có/không stem).
                cards = cards.filter(c => FamilyWordManager.belongsToGroup(c, 'family', familyId));
            }
            if (groupType && groupKey) {
                cards = cards.filter(c => FamilyWordManager.belongsToGroup(c, groupType, groupKey));
            }
            if (cardId) {
                cards = cards.filter(c => c.id === cardId);
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

            // Với phiên vào từ MỘT thẻ (cardId, vd từ trang topic-detail), URL
            // không có topicId. Suy ra topic từ chính thẻ đó để nút "Học tiếp"
            // tiếp tục đúng topic của từ vừa học. Nếu vào từ "Học từ mới" chung
            // (không filter) thì topicId vẫn null → học tiếp trên toàn bộ từ mới.
            const resolvedTopicId = topicId || (cardId ? (cards[0]?.folderId || null) : null);

            this._session = {
                cards,
                type,
                currentIndex: 0,
                currentStep: 1, // 1=intro, 2=VN→EN, 3=Listen→EN
                results: {},    // cardId → { step2, step3 }
                startedAt: new Date(),
                // Lưu lại phạm vi (filter) gốc của phiên để nút "Học tiếp"
                // tiếp tục đúng phạm vi này, KHÔNG đọc lại từ URL hash (vốn còn
                // giữ cardId cũ → khiến học lại chính từ vừa học).
                filter: { type, topicId: resolvedTopicId, familyId, groupType, groupKey }
            };
            this._startedAt = Date.now();

            // Tính pending families TRỰC TIẾP từ Firestore (source of truth).
            // Không cần cleanup localStorage vì schema mới không lưu learnedWords.
            const pending = (type === 'vocabulary')
                ? await FamilyWordManager.getIncompleteGroups(allTypeCards)
                : [];

            // Chỉ hiện banner khi:
            // - KHÔNG vào với familyId/group/cardId cụ thể
            // - Có group dang dở và user chưa dismiss toàn bộ
            const activePending = pending.filter(f => !f.dismissed);
            if (activePending.length > 0 && !familyId && !groupType && !groupKey && !cardId) {
                this._renderPendingBanner(activePending);
            } else {
                // Vào thẳng bước học, bỏ qua màn hình intro trung gian
                this._renderStep();
            }
        } catch (error) {
            console.error('[StudyPage] Init error:', error);
            this._renderError(error.message);
        }
    },

    // ============================================
    // PENDING GROUPS BANNER
    // ============================================
    _renderPendingBanner(pending) {
        const root = document.getElementById('study-page-root');
        if (!root) return;

        const list = pending.slice(0, 3).map(f =>
            `${f.title} (${f.learnedCount}/${f.totalCount})`
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
                    <button class="review-btn-secondary" onclick="Router.navigate('/english/vocabulary')" style="margin-top:0;">
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
        const allCards = await FirestoreDB.getCards({ cardType: 'vocabulary' });
        this._allTypeCards = allCards;
        const pending = await FamilyWordManager.getIncompleteGroups(allCards);
        if (pending.length === 0) {
            this._renderIntro();
            return;
        }

        const isNew = (c) => c.state === 'new' || c.state === FSRS.State.NEW;
        const pendingCards = pending
            .filter(group => !group.dismissed)
            .flatMap(group => allCards.filter(c =>
                FamilyWordManager.belongsToGroup(c, group.groupType, group.rawKey) && isNew(c)
            ));

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
                <button class="review-btn-link" onclick="Router.navigate('/english/vocabulary')">
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
    // [CLEANUP] Variant flow (schema v1) đã bị loại bỏ hoàn toàn từ schema v2.
    // Mỗi thẻ BQT giờ = 1 dạng độc lập, học qua luồng 3 bước chung
    // (intro → VN→EN → Listen→EN). baseForm hiển thị như chú thích ở intro.
    // Code cũ _renderVariantIntroStep_DEPRECATED / _renderVariantTypeStep /
    // _afterAllVariantsDone / _playVariantWord đã được xoá.
    // ============================================

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

        // BQT v2: badge vai trò (V2/V3/So sánh hơn/So sánh nhất) + chú thích nguyên mẫu (baseForm)
        const irrMeta = (typeof CardSchemas !== 'undefined') ? CardSchemas.getIrregularMeta(card) : null;
        const baseForm = fv.baseForm || '';
        const baseMeaning = fv.baseMeaning || '';
        const roleBadgeHtml = irrMeta ? `
            <span class="review-round-badge" style="background:linear-gradient(135deg,${irrMeta.color},${irrMeta.color}cc);">${this._escapeHtml(irrMeta.label)} · ${this._escapeHtml(irrMeta.roleShort)}</span>
        ` : '';
        const irregularNoteHtml = (irrMeta && irrMeta.note) ? `
            <div class="study-intro-card__base-note" style="margin-top:var(--spacing-sm);padding:var(--spacing-sm) var(--spacing-md);background:${irrMeta.bg};border-radius:10px;font-size:0.9rem;color:${irrMeta.color};font-weight:700;">
                <span class="material-icons-round" style="font-size:14px;vertical-align:middle;color:${irrMeta.color};">rule</span>
                ${this._escapeHtml(irrMeta.note)}
            </div>
        ` : '';
        // V1 (baseForm) chính là nguyên mẫu → không lặp lại từ; chỉ V2/V3/so sánh mới hiển thị tham chiếu nguyên mẫu.
        const baseFormHtml = (irrMeta && baseForm && irrMeta.role !== 'baseForm') ? `
            <div class="study-intro-card__base-note" style="margin-top:var(--spacing-sm);padding:var(--spacing-sm) var(--spacing-md);background:${irrMeta.bg};border-radius:10px;font-size:0.9rem;color:var(--color-text-secondary);">
                <span class="material-icons-round" style="font-size:14px;vertical-align:middle;color:${irrMeta.color};">info</span>
                Nguyên mẫu: <strong style="color:${irrMeta.color};">${this._escapeHtml(baseForm)}</strong>${baseMeaning ? ` — ${this._escapeHtml(baseMeaning)}` : ''}
            </div>
        ` : '';

        root.innerHTML = `
            <div class="review-card-screen" data-difficulty="${difficulty}">
                <div class="review-header">
                    <div class="review-header__info">
                        <span class="review-round-badge" style="background:linear-gradient(135deg,#10B981,#059669);">Bước 1/3 · Giới thiệu</span>
                        <span class="review-counter">Từ ${s.currentIndex + 1}/${total}</span>
                        <span class="difficulty-badge difficulty-badge--${difficulty}" title="${diffMeta.label}">${diffMeta.short}</span>
                        ${roleBadgeHtml}
                    </div>
                    <div class="review-progress">
                        <div class="review-progress__fill" style="width:${progress}%"></div>
                    </div>
                </div>

                <div class="study-intro-card">
                    <div class="study-intro-card__word">${this._escapeHtml(word)}</div>
                    ${ipa ? `<div class="study-intro-card__ipa">${this._escapeHtml(ipa)}</div>` : ''}
                    ${partOfSpeech ? `<div class="study-intro-card__pos">${this._escapeHtml(partOfSpeech)}</div>` : ''}
                    <div style="margin:var(--spacing-md) 0;">${this._audioButtonsHtml('_playWord')}</div>
                    <div class="study-intro-card__divider"></div>
                    <div class="study-intro-card__meaning-label">NGHĨA</div>
                    <div class="study-intro-card__meaning">${this._escapeHtml(meaning).replace(/\n/g, '<br>')}</div>
                    ${example ? `
                        <div class="study-intro-card__example-label">VÍ DỤ</div>
                        <div class="study-intro-card__example">${this._escapeHtml(example).replace(/\n/g, '<br>')}</div>
                    ` : ''}
                    ${irregularNoteHtml}
                    ${baseFormHtml}
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
                    ${this._audioButtonsHtml('_playWord')}
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

                <div class="review-actions review-actions--stacked">
                    <button class="review-action-btn review-action-btn--reveal" id="study-reveal-btn" onclick="StudyPage._revealAnswer()">
                        <span class="material-icons-round">visibility</span> Hiện đáp án
                    </button>
                    <div class="review-actions-row">
                        <button class="review-action-btn review-action-btn--hint" onclick="StudyPage._showHint()">
                            <span class="material-icons-round">lightbulb</span> Gợi ý
                        </button>
                        <button class="review-action-btn review-action-btn--primary" id="study-submit-btn" onclick="StudyPage._submitAnswer()">
                            <span class="material-icons-round">check</span> Kiểm tra
                        </button>
                    </div>
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
        this._currentUsedHint = false;
    },

    /**
     * Render cụm 2 nút phát âm US / UK.
     * @param {string} handler - tên hàm sẽ gọi, vd '_playWord'
     */
    _audioButtonsHtml(handler) {
        return `
            <div class="audio-accent-group" role="group" aria-label="Phát âm">
                <button class="audio-accent-btn" onclick="StudyPage.${handler}('us')" title="Phát âm giọng Anh-Mỹ">
                    <span class="material-icons-round">volume_up</span>
                    <span class="audio-accent-btn__label">US</span>
                </button>
                <button class="audio-accent-btn" onclick="StudyPage.${handler}('gb')" title="Phát âm giọng Anh-Anh">
                    <span class="material-icons-round">volume_up</span>
                    <span class="audio-accent-btn__label">UK</span>
                </button>
            </div>
        `;
    },

    _playWord(accent = 'gb') {
        const card = this._session.cards[this._session.currentIndex];
        const word = card?.fieldValues?.word || '';
        if (word && TTS.isAvailable()) {
            TTS.speak(word, { accent });
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
        // Dùng gợi ý KHÔNG được tính như gõ sai. Đánh dấu riêng usedHint để
        // rating xử lý bằng HARD (giữ nguyên bậc) thay vì AGAIN (lùi bậc)
        // khi vẫn trả lời đúng.
        this._currentUsedHint = true;
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

        // Giữ nguyên cảnh để người học có thời gian ghi nhớ mặt chữ.
        // Không tự động chuyển cảnh — vô hiệu hoá nút "Kiểm tra" và biến nút
        // "Hiện đáp án" thành nút "Tiếp tục" để người học tự chủ động chuyển.
        const submitBtn = document.getElementById('study-submit-btn');
        if (submitBtn) submitBtn.disabled = true;

        const revealBtn = document.getElementById('study-reveal-btn');
        if (revealBtn) {
            revealBtn.innerHTML = `<span class="material-icons-round">arrow_forward</span> Tiếp tục`;
            revealBtn.onclick = () => this._nextStep();
        }
    },

    _recordStepResult(correct) {
        const s = this._session;
        const card = s.cards[s.currentIndex];
        if (!s.results[card.id]) s.results[card.id] = {};
        s.results[card.id][`step${s.currentStep}`] = {
            correct: correct && !this._currentRevealed,
            attempts: this._currentAttempts,
            revealed: this._currentRevealed,
            usedHint: this._currentUsedHint
        };
    },

    // ============================================
    // NEXT STEP / NEXT CARD
    // ============================================
    async _nextStep() {
        const s = this._session;
        if (s.currentStep === 1) {
            s.currentStep = 2;
            this._renderStep();
        } else if (s.currentStep === 2) {
            s.currentStep = 3;
            this._renderStep();
        } else if (s.currentStep === 3) {
            // Step 3 xong → finalize card ngay (schema v2: không còn variant flow)
            await this._finalizeCard();
            const popupShown = await this._maybeShowFamilyPopup();
            if (popupShown) return;
            this._nextCard();
        }
    },

    async _finalizeCard() {
        const s = this._session;
        const card = s.cards[s.currentIndex];
        const stepResults = s.results[card.id] || {};
        const r2 = stepResults.step2 || { correct: false, revealed: true, attempts: 3 };
        const r3 = stepResults.step3 || { correct: false, revealed: true, attempts: 3 };

        // Rating cho từ mới: chính sách nghiêm ngặt - sai/reveal 1 lần => AGAIN.
        // Đúng cả 2 bước, không reveal, không sai phát nào => GOOD
        //   (NEW + GOOD -> stepIndex 0 = Cấp độ 1 (30 phút), state REVIEW.
        //    KHÔNG dùng EASY vì EASY nhảy +2 bậc -> Cấp độ 2 ngay, bỏ qua Cấp độ 1.)
        // Lưu ý: nút "Gợi ý" (usedHint) KHÔNG ảnh hưởng đến rating — chỉ là
        // công cụ hỗ trợ UI, không tính như gõ sai.
        let rating;
        if (r2.revealed || r3.revealed) rating = FSRS.Rating.AGAIN;
        else if (!r2.correct || !r3.correct) rating = FSRS.Rating.AGAIN;
        else if (r2.attempts > 1 || r3.attempts > 1) rating = FSRS.Rating.AGAIN;
        else rating = FSRS.Rating.GOOD;

        const updatedCard = FSRS.review(card, rating);

        // Fix bug study-new: khi gõ sai (AGAIN) trong phiên học mới, card phải
        // được reset về stepIndex = -1 (chưa graduate) thay vì stepIndex = 0.
        // Lý do: _computeNextStep(-1, AGAIN) = 0, nhưng lần học lại đúng
        // _computeNextStep(0, GOOD) = 1 → nhảy thẳng Cấp độ 2 bỏ qua Cấp độ 1.
        // Giữ nguyên state = LEARNING để card vẫn xuất hiện trong phiên học mới
        // (filter isNewOrLearning), nhưng stepIndex = -1 để lần GOOD tiếp theo
        // cho ra stepIndex = 0 (Cấp độ 1) đúng như kỳ vọng.
        if (rating === FSRS.Rating.AGAIN) {
            updatedCard.stepIndex = -1;
        }
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
                stepIndex: updatedCard.stepIndex,
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
    // GROUP POPUP (family + irregular verb)
    // ============================================
    async _maybeShowFamilyPopup() {
        const s = this._session;
        const card = s.cards[s.currentIndex];
        // Truyền allTypeCards làm context để xác định đúng cụm họ từ (family cần
        // toàn bộ card cùng familyId để cluster theo gốc chung).
        const groupInfo = FamilyWordManager._getGroupInfo(card, this._allTypeCards);
        if (!groupInfo) return false;

        try {
            const allInGroup = await FamilyWordManager.getGroupCards(groupInfo.groupType, groupInfo.rawKey, this._allTypeCards);
            const result = await FamilyWordManager.onWordLearned(card, allInGroup);
            if (!result || result.unlearnedCards.length === 0) return false;
            if (result.dismissed) return false;

            const sessionIds = new Set(s.cards.map(c => c.id));
            const isNew = (c) => c.state === 'new' || c.state === FSRS.State.NEW;
            const newCandidates = result.unlearnedCards
                .filter(c => !sessionIds.has(c.id))
                .filter(isNew);

            if (newCandidates.length === 0) {
                FamilyWordManager.undismissGroup(result.groupKey);
                return false;
            }

            this._showFamilyPopup(result, newCandidates);
            return true;
        } catch (e) {
            console.error('[StudyPage] Family popup error:', e);
            return false;
        }
    },

    _showFamilyPopup(group, candidates) {
        const existing = document.querySelector('.family-popup-overlay');
        if (existing) existing.remove();

        const wordsHtml = candidates.slice(0, 5).map(c => {
            const fv = c.fieldValues || {};
            const pos = fv.partOfSpeech ? `(${fv.partOfSpeech.charAt(0)}) ` : '';
            const irrMeta = (typeof CardSchemas !== 'undefined' && CardSchemas.getIrregularMeta)
                ? CardSchemas.getIrregularMeta(c)
                : null;
            const role = irrMeta ? ` · ${irrMeta.roleShort}` : '';
            return `<div class="family-popup__word-item">
                <span class="material-icons-round">bookmark</span>
                <strong>${pos}${this._escapeHtml(fv.word || '?')}${this._escapeHtml(role)}</strong>
                <span style="margin-left:auto;color:var(--color-text-muted);font-size:var(--font-size-sm);">${this._escapeHtml((fv.meaning || '').substring(0, 30))}</span>
            </div>`;
        }).join('');

        const title = group.groupType === 'irregular-verb' ? 'Các dạng động từ liên quan' : 'Nhóm từ cùng họ';
        const desc = group.groupType === 'irregular-verb'
            ? `Bạn vừa học <strong>"${this._escapeHtml(group.title)}"</strong>. Còn ${candidates.length} dạng V1/V2/V3 nên học tiếp:`
            : `Từ <strong>"${this._escapeHtml(group.title)}"</strong> có ${candidates.length} từ liên quan:`;

        const overlay = document.createElement('div');
        overlay.className = 'family-popup-overlay';
        overlay.innerHTML = `
            <div class="family-popup">
                <div class="family-popup__title">
                    <span class="material-icons-round">${this._escapeHtml(group.icon || 'family_restroom')}</span>
                    ${this._escapeHtml(title)}
                </div>
                <div class="family-popup__desc">${desc}</div>
                <div class="family-popup__words">${wordsHtml}</div>
                <div class="family-popup__actions">
                    <button class="family-popup__btn family-popup__btn--secondary" onclick="StudyPage._familyPopupDismiss('${this._escapeHtml(group.groupKey)}')">
                        Để sau
                    </button>
                    <button class="family-popup__btn family-popup__btn--primary" onclick="StudyPage._familyPopupLearn()">
                        Học ngay
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        this._pendingFamilyPopup = { groupKey: group.groupKey, candidates };
    },

    _familyPopupLearn() {
        const p = this._pendingFamilyPopup;
        if (!p) return;
        const s = this._session;
        s.cards.splice(s.currentIndex + 1, 0, ...p.candidates);
        document.querySelector('.family-popup-overlay')?.remove();
        this._pendingFamilyPopup = null;
        this._nextCard();
    },

    _familyPopupDismiss(groupKey) {
        FamilyWordManager.dismissGroup(groupKey);
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
                    <button class="review-btn-secondary" onclick="Router.navigate('/english/vocabulary')" style="flex:1;">
                        Về từ vựng
                    </button>
                    <button class="review-btn-primary" onclick="StudyPage._viewTopic()" style="flex:1;">
                        Học tiếp
                    </button>
                </div>
            </div>
        `;
    },

    /**
     * "Học tiếp": chuyển tới trang chi tiết topic của từ vừa học để hiển thị
     * TOÀN BỘ từ vựng của topic đó (cho user tự chọn từ tiếp theo), thay vì
     * nhảy thẳng vào từ kế tiếp trong topic.
     * Nếu phiên không gắn với topic cụ thể (vd "Học từ mới" chung), fallback
     * về trang danh sách từ vựng.
     */
    _viewTopic() {
        const filter = this._session?.filter || {};
        if (filter.topicId) {
            Router.navigate(`/english/topic/${encodeURIComponent(filter.topicId)}`);
        } else {
            Router.navigate('/english/vocabulary');
        }
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
                <button class="review-btn-primary" onclick="Router.navigate('/english/review?type=vocabulary')">
                    <span class="material-icons-round">replay</span>
                    Đi ôn tập
                </button>
                <button class="review-btn-link" onclick="Router.navigate('/english/vocabulary')">
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
                <button class="review-btn-primary" onclick="Router.navigate('/english/vocabulary')">
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


export default StudyPage;
