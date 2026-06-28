// ============================================
// Topic Detail Page - Hiển thị danh sách thẻ từ vựng trong 1 topic
// ============================================

const TopicDetailPage = {
    _topicId: null,
    _topic: null,
    _cards: [],
    _selectMode: false,
    _selected: new Set(),
    _filterState: null,
    _highlightId: null,

    render() {
        return `<div class="topic-detail-page page-enter" id="topic-detail-root">
            <div class="topic-detail-loading">
                <span class="material-icons-round" style="font-size:40px;color:var(--color-text-muted);animation:spin 1s linear infinite;">hourglass_empty</span>
                <p style="color:var(--color-text-muted);margin-top:var(--spacing-sm);">Đang tải chủ đề...</p>
            </div>
        </div>`;
    },

    async onEnter(params) {
        console.log('[TopicDetailPage] Entered with params:', params);
        if (!Auth.isSignedIn()) {
            Router.navigate('/auth');
            return;
        }
        this._topicId = params && params.id;
        if (!this._topicId) {
            this._renderError('Thiếu ID chủ đề');
            return;
        }
        // Parse query string (?highlight=cardId) — dùng để cuộn + nháy thẻ sau khi render
        const qs = new URLSearchParams((window.location.hash || '').split('?')[1] || '');
        this._highlightId = qs.get('highlight') || null;
        // Tìm topic trong config
        this._topic = (typeof VocabularyTopics !== 'undefined')
            ? VocabularyTopics.find(t => t.id === this._topicId)
            : null;

        await this._loadCards();
    },

    async _loadCards() {
        try {
            let allCards = await FirestoreDB.getCards({ cardType: 'vocabulary' });
            let topicCards = allCards.filter(c => c.folderId === this._topicId);

            if (topicCards.length === 0) {
                const seeded = await this._tryAutoSeedEmptyTopic();
                if (seeded) {
                    allCards = await FirestoreDB.getCards({ cardType: 'vocabulary' });
                    topicCards = allCards.filter(c => c.folderId === this._topicId);
                }
            }

            // Cleanup mạnh tay ngay tại trang topic: dữ liệu cũ sai taxonomy
            // phải biến mất khỏi UI lập tức và bị xóa khỏi Firestore của user hiện tại.
            topicCards = await this._purgeInvalidTopicVocabularyCards(topicCards);

            // Cleanup thẻ vi phạm luật nội dung (cụm word-by-word, danh từ riêng ít phổ biến).
            topicCards = await this._purgeContentRuleViolationCards(topicCards);

            this._cards = topicCards;
            this._renderPage();
        } catch (error) {
            console.error('[TopicDetailPage] Load cards error:', error);
            this._renderError('Không tải được dữ liệu thẻ');
        }
    },

    async _tryAutoSeedEmptyTopic() {
        if (!window.SeedImporter) return false;
        // Ưu tiên lấy filename từ _seedTopics map, fallback thử {topicId}.json trực tiếp
        const seedTopics = (typeof VocabularyPage !== 'undefined' && VocabularyPage._seedTopics) || {};
        const filename = seedTopics[this._topicId] || (this._topicId + '.json');

        try {
            const result = await SeedImporter.importFile(filename);
            console.log('[TopicDetailPage] Auto-seeded empty topic "' + this._topicId + '": +' + result.created + ' created, ' + (result.updated || 0) + ' updated, ' + result.skipped + ' skipped');
            return (result.created || result.updated || result.skipped) > 0;
        } catch (error) {
            console.warn('[TopicDetailPage] Auto-seed empty topic failed:', this._topicId, error);
            return false;
        }
    },

    _getInvalidTopicVocabularyRule(card) {
        const fv = card && card.fieldValues || {};
        const word = String(fv.word || card.word || card.front || '').trim().toLowerCase();
        const folderId = card && card.folderId;
        const invalidRules = [
            { folderId: 'chemistry', words: new Set(['atom', 'laboratory']) },
            { folderId: 'mathematics', words: new Set(['convergence', 'divergence']) },
            { folderId: 'education', words: new Set(['laboratory', 'research']) }
        ];

        return invalidRules.find(rule => rule.folderId === folderId && rule.words.has(word)) || null;
    },

    async _purgeInvalidTopicVocabularyCards(topicCards) {
        const removedCards = topicCards.filter(card => this._getInvalidTopicVocabularyRule(card));
        if (!removedCards.length) return topicCards;

        console.warn('[TopicDetailPage] Purging invalid topic vocabulary cards:', removedCards.map(card => ({
            id: card.id,
            folderId: card.folderId,
            word: card.fieldValues && card.fieldValues.word
        })));
        for (const card of removedCards) {
            try {
                const deleted = await FirestoreDB.deleteCard(card.id);
                console.warn('[TopicDetailPage] Deleted invalid topic vocabulary card:', {
                    id: card.id,
                    folderId: card.folderId,
                    word: card.fieldValues && card.fieldValues.word,
                    deleted
                });
            } catch (error) {
                console.error('[TopicDetailPage] Failed deleting invalid topic vocabulary card:', card.id, error);
            }
        }

        // Không cho hiển thị lại dù delete tạm thời lỗi/network pending.
        return topicCards.filter(card => !this._getInvalidTopicVocabularyRule(card));
    },

    /**
     * Xoá + ẩn thẻ vi phạm luật nội dung từ vựng (xem plans/vocabulary-content-rules.md).
     * Dùng danh sách dùng chung từ ContentRulesCleanup để luôn đồng bộ.
     */
    async _purgeContentRuleViolationCards(topicCards) {
        if (typeof ContentRulesCleanup === 'undefined') return topicCards;

        const removedCards = topicCards.filter(card => ContentRulesCleanup.isRemovedWord(card));
        if (!removedCards.length) return topicCards;

        for (const card of removedCards) {
            try {
                const deleted = await FirestoreDB.deleteCard(card.id);
                console.warn('[TopicDetailPage] Deleted content-rule violation card:', {
                    id: card.id,
                    folderId: card.folderId,
                    word: card.fieldValues && card.fieldValues.word,
                    deleted
                });
            } catch (error) {
                console.error('[TopicDetailPage] Failed deleting content-rule violation card:', card.id, error);
            }
        }

        // Luôn ẩn khỏi UI kể cả khi delete tạm thời lỗi/network pending.
        return topicCards.filter(card => !ContentRulesCleanup.isRemovedWord(card));
    },

    // -------------------------------------------
    // RENDER
    // -------------------------------------------
    _renderPage() {
        const root = document.getElementById('topic-detail-root');
        if (!root) return;

        const topicName = this._topic ? this._topic.name : 'Chủ đề';
        const topicIcon = this._topic ? this._topic.icon : 'folder';

        // Stats
        const total = this._cards.length;
        const newCount = this._cards.filter(c => this._isNewLike(c)).length;
        const reviewCount = this._cards.filter(c => this._isReviewLike(c)).length;
        const masteredCount = this._cards.filter(c => this._isReviewLike(c) && (c.stability || 0) > 20).length;

        // Khởi tạo filter state nếu chưa có
        if (!this._filterState) this._filterState = CardFilter.createState();
        const filteredCards = CardFilter.apply(this._cards, this._filterState);
        const filteredCount = filteredCards.length;
        const isFiltering = !CardFilter.isEmpty(this._filterState);

        let bodyHtml = '';
        if (total === 0) {
            bodyHtml = this._renderEmpty();
        } else {
            // Sort: new trước, review sau; trong từng nhóm theo familyOrder rồi alphabet
            const sorted = [...filteredCards].sort((a, b) => {
                const aNew = this._isNewLike(a) ? 0 : 1;
                const bNew = this._isNewLike(b) ? 0 : 1;
                if (aNew !== bNew) return aNew - bNew;
                const oa = a.fieldValues?.familyOrder ?? 99;
                const ob = b.fieldValues?.familyOrder ?? 99;
                if (oa !== ob) return oa - ob;
                const wa = (a.fieldValues?.word || '').toLowerCase();
                const wb = (b.fieldValues?.word || '').toLowerCase();
                return wa.localeCompare(wb);
            });
            const selCount = this._selected.size;
            bodyHtml = `
                <div id="topic-detail-filter-root"></div>
                <div class="topic-detail-toolbar">
                    <div class="topic-detail-toolbar__info">
                        ${this._selectMode
                            ? `Đã chọn <strong>${selCount}</strong> / ${total} thẻ`
                            : (isFiltering
                                ? `Hiển thị <strong>${filteredCount}</strong> / ${total} thẻ (đang lọc)`
                                : 'Quản lý chế độ học/ôn tập của thẻ trong chủ đề')}
                    </div>
                    ${this._selectMode ? `
                        <button class="topic-detail-toolbar__btn"
                                ${selCount === 0 ? 'disabled' : ''}
                                onclick="TopicDetailPage._openModeForSelected()">
                            <span class="material-icons-round" style="font-size:18px;">swap_horiz</span>
                            Đổi mode (${selCount})
                        </button>
                        <button class="topic-detail-toolbar__btn topic-detail-toolbar__btn--ghost"
                                onclick="TopicDetailPage._toggleSelectMode()">
                            <span class="material-icons-round" style="font-size:18px;">close</span>
                            Huỷ chọn
                        </button>
                    ` : `
                        <button class="topic-detail-toolbar__btn topic-detail-toolbar__btn--ghost"
                                onclick="TopicDetailPage._toggleSelectMode()">
                            <span class="material-icons-round" style="font-size:18px;">checklist</span>
                            Chọn nhiều
                        </button>
                        <button class="topic-detail-toolbar__btn"
                                onclick="TopicDetailPage._openModeForAll()">
                            <span class="material-icons-round" style="font-size:18px;">swap_horiz</span>
                            Đổi mode toàn bộ chủ đề
                        </button>
                    `}
                </div>
                <div class="topic-detail-list">
                    ${sorted.length === 0
                        ? `<div class="topic-detail-empty" style="padding:32px 16px;">
                              <div class="topic-detail-empty__icon">
                                  <span class="material-icons-round">filter_alt_off</span>
                              </div>
                              <h3>Không có thẻ nào khớp bộ lọc</h3>
                              <p>Thử bỏ bớt điều kiện lọc hoặc xoá bộ lọc.</p>
                           </div>`
                        : sorted.map(c => this._renderRow(c)).join('')}
                </div>
            `;
        }

        root.innerHTML = `
            <div class="topic-detail-header">
                <button class="topic-detail-header__back" onclick="Router.navigate('/english/vocabulary')" aria-label="Quay lại">
                    <span class="material-icons-round">arrow_back</span>
                </button>
                <div class="topic-detail-header__icon">
                    <span class="material-icons-round">${this._escapeHtml(topicIcon)}</span>
                </div>
                <div class="topic-detail-header__info">
                    <h1 class="topic-detail-header__title">${this._escapeHtml(topicName)}</h1>
                    <div class="topic-detail-header__stats">
                        <span><strong>${total}</strong> thẻ</span>
                        <span class="topic-detail-stat-dot">•</span>
                        <span>Mới <strong>${newCount}</strong></span>
                        <span class="topic-detail-stat-dot">•</span>
                        <span>Ôn tập <strong>${reviewCount}</strong></span>
                        <span class="topic-detail-stat-dot">•</span>
                        <span>Đã thuộc <strong>${masteredCount}</strong></span>
                    </div>
                </div>
            </div>
            ${bodyHtml}
        `;

        // Mount filter sau khi DOM đã render
        if (total > 0 && document.getElementById('topic-detail-filter-root')) {
            CardFilter.mount('topic-detail-filter-root', {
                state: this._filterState,
                onChange: (s) => {
                    this._filterState = s;
                    this._renderPage();
                }
            });
        }

        // Highlight + scroll tới thẻ nếu có ?highlight=cardId
        if (this._highlightId) {
            const targetId = this._highlightId;
            this._highlightId = null; // chỉ trigger 1 lần
            requestAnimationFrame(() => {
                const el = document.getElementById('card-' + targetId);
                if (!el) return;
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el.classList.add('highlight-flash');
                setTimeout(() => el.classList.remove('highlight-flash'), 2200);
            });
        }
    },

    _renderRow(card) {
        const fv = card.fieldValues || {};
        const word = fv.word || '(chưa có từ)';
        const pos = fv.partOfSpeech || '';
        const meaning = fv.meaning || '';
        const difficulty = fv.difficulty || 'intermediate';
        const diffMeta = (typeof CardSchemas !== 'undefined' && CardSchemas.getDifficultyMeta)
            ? CardSchemas.getDifficultyMeta(difficulty)
            : { short: difficulty === 'advanced' ? 'Khó' : 'Dễ', label: difficulty };

        // Irregular word meta + variants short text (wrote / written)
        const irrMeta = (typeof CardSchemas !== 'undefined' && CardSchemas.getIrregularMeta)
            ? CardSchemas.getIrregularMeta(card) : null;
        const variantsShort = (typeof CardSchemas !== 'undefined' && CardSchemas.getIrregularVariantsShort)
            ? CardSchemas.getIrregularVariantsShort(card) : '';

        const isNew = this._isNewLike(card);
        const btnClass = isNew ? 'topic-vocab-btn--study' : 'topic-vocab-btn--review';
        const btnLabel = isNew ? 'Học' : 'Ôn tập';
        const btnIcon = isNew ? 'school' : 'replay';
        const route = isNew
            ? `/english/study?type=vocabulary&cardId=${encodeURIComponent(card.id)}`
            : `/english/review?type=vocabulary&cardId=${encodeURIComponent(card.id)}`;

        const irregularBadge = irrMeta ? `
            <span class="topic-vocab-row__irr-badge"
                  style="background:${irrMeta.bg};color:${irrMeta.color};border:1px solid ${irrMeta.color};"
                  title="Từ bất quy tắc (${irrMeta.type})">
                <span class="material-icons-round" style="font-size:14px;">shuffle</span>
                ${this._escapeHtml(irrMeta.label)}
            </span>
            ${irrMeta.note ? `<span class="topic-vocab-row__irr-note" style="color:${irrMeta.color};">${this._escapeHtml(irrMeta.note)}</span>` : ''}
        ` : '';

        const meaningText = variantsShort
            ? `${this._escapeHtml(meaning).replace(/\n/g, '<br>')} <span class="topic-vocab-row__variants">(${this._escapeHtml(variantsShort)})</span>`
            : this._escapeHtml(meaning).replace(/\n/g, '<br>');

        const checkbox = this._selectMode
            ? `<input type="checkbox" class="topic-vocab-row__select"
                      ${this._selected.has(card.id) ? 'checked' : ''}
                      onchange="TopicDetailPage._toggleSelected('${card.id}', this.checked)">`
            : '';

        return `
            <div class="topic-vocab-row" id="card-${card.id}">
                ${checkbox}
                <div class="topic-vocab-row__main">
                    <div class="topic-vocab-row__top">
                        <span class="topic-vocab-row__word">${this._escapeHtml(word)}</span>
                        ${pos ? `<span class="topic-vocab-row__pos">${this._escapeHtml(pos)}</span>` : ''}
                        ${irregularBadge}
                        <span class="topic-vocab-row__diff-badge topic-vocab-row__diff-badge--${difficulty}">
                            ${this._escapeHtml(diffMeta.short)}
                        </span>
                    </div>
                    <div class="topic-vocab-row__meaning">${meaningText}</div>
                </div>
                <div class="topic-vocab-row__action">
                    <button class="topic-vocab-btn ${btnClass}" onclick="Router.navigate('${route}')">
                        <span class="material-icons-round">${btnIcon}</span>
                        <span>${btnLabel}</span>
                    </button>
                    <button class="topic-vocab-row__mode-btn"
                            title="Đổi chế độ học/ôn tập"
                            onclick="TopicDetailPage._openModeForCard('${card.id}')">
                        <span class="material-icons-round" style="font-size:20px;">swap_horiz</span>
                    </button>
                </div>
            </div>
        `;
    },

    _renderEmpty() {
        return `
            <div class="topic-detail-empty">
                <div class="topic-detail-empty__icon">
                    <span class="material-icons-round">inbox</span>
                </div>
                <h3>Chưa có từ vựng nào</h3>
                <p>Chủ đề này chưa được nạp dữ liệu từ vựng.</p>
            </div>
        `;
    },

    _renderError(msg) {
        const root = document.getElementById('topic-detail-root');
        if (!root) return;
        root.innerHTML = `
            <div class="topic-detail-empty">
                <div class="topic-detail-empty__icon">
                    <span class="material-icons-round">error_outline</span>
                </div>
                <h3>Lỗi</h3>
                <p>${this._escapeHtml(msg)}</p>
                <button class="topic-detail-empty__btn" onclick="Router.navigate('/english/vocabulary')">
                    <span class="material-icons-round">arrow_back</span> Quay lại
                </button>
            </div>
        `;
    },

    // -------------------------------------------
    // HELPERS
    // -------------------------------------------
    _isNewLike(card) {
        // new (0) hoặc learning (1) → coi là "chưa hoàn thành học" → nút "Học"
        const st = card.state;
        return st === 'new' || st === 'learning'
            || st === FSRS.State.NEW || st === FSRS.State.LEARNING;
    },

    // -------------------------------------------
    // MODE CHANGER
    // -------------------------------------------
    _toggleSelectMode() {
        this._selectMode = !this._selectMode;
        if (!this._selectMode) this._selected.clear();
        this._renderPage();
    },

    _toggleSelected(cardId, checked) {
        if (checked) this._selected.add(cardId);
        else this._selected.delete(cardId);
        this._renderPage();
    },

    _openModeForCard(cardId) {
        const card = this._cards.find(c => c.id === cardId);
        if (!card) return;
        const word = card.fieldValues?.word || cardId;
        CardModeManager.openModal([card], {
            scopeLabel: `từ "${word}"`,
            onDone: () => this._loadCards()
        });
    },

    _openModeForSelected() {
        const cards = this._cards.filter(c => this._selected.has(c.id));
        if (!cards.length) return;
        CardModeManager.openModal(cards, {
            scopeLabel: `${cards.length} thẻ đã chọn`,
            onDone: () => { this._selected.clear(); this._selectMode = false; this._loadCards(); }
        });
    },

    _openModeForAll() {
        if (!this._cards.length) return;
        const topicName = this._topic ? this._topic.name : 'chủ đề';
        const isFiltering = this._filterState && !CardFilter.isEmpty(this._filterState);
        const targetCards = isFiltering
            ? CardFilter.apply(this._cards, this._filterState)
            : this._cards;
        if (!targetCards.length) {
            Toast.warning && Toast.warning('Không có thẻ', 'Không có thẻ nào khớp bộ lọc hiện tại.');
            return;
        }
        const scopeLabel = isFiltering
            ? `${targetCards.length} thẻ đã lọc trong "${topicName}"`
            : `toàn bộ chủ đề "${topicName}" (${targetCards.length} thẻ)`;
        CardModeManager.openModal(targetCards, {
            scopeLabel,
            onDone: () => this._loadCards()
        });
    },

    _isReviewLike(card) {
        // review (2) hoặc relearning (3) → đã hoàn thành học → nút "Ôn tập"
        const st = card.state;
        return st === 'review' || st === 'relearning'
            || st === FSRS.State.REVIEW || st === FSRS.State.RELEARNING;
    },

    _escapeHtml(str) {
        if (str == null) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
};


export default TopicDetailPage;
