// ============================================
// Topic Detail Page - Hiển thị danh sách thẻ từ vựng trong 1 topic
// ============================================

const TopicDetailPage = {
    _topicId: null,
    _topic: null,
    _cards: [],

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
        // Tìm topic trong config
        this._topic = (typeof VocabularyTopics !== 'undefined')
            ? VocabularyTopics.find(t => t.id === this._topicId)
            : null;
        await this._loadCards();
    },

    async _loadCards() {
        try {
            const allCards = await FirestoreDB.getCards({ cardType: 'vocabulary' });
            this._cards = allCards.filter(c => c.folderId === this._topicId);
            this._renderPage();
        } catch (error) {
            console.error('[TopicDetailPage] Load cards error:', error);
            this._renderError('Không tải được dữ liệu thẻ');
        }
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

        let bodyHtml = '';
        if (total === 0) {
            bodyHtml = this._renderEmpty();
        } else {
            // Sort: new trước, review sau; trong từng nhóm theo familyOrder rồi alphabet
            const sorted = [...this._cards].sort((a, b) => {
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
            bodyHtml = `
                <div class="topic-detail-list">
                    ${sorted.map(c => this._renderRow(c)).join('')}
                </div>
            `;
        }

        root.innerHTML = `
            <div class="topic-detail-header">
                <button class="topic-detail-header__back" onclick="Router.navigate('/vocabulary')" aria-label="Quay lại">
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
            ? `/study?type=vocabulary&cardId=${encodeURIComponent(card.id)}`
            : `/review?type=vocabulary&cardId=${encodeURIComponent(card.id)}`;

        const irregularBadge = irrMeta ? `
            <span class="topic-vocab-row__irr-badge"
                  style="background:${irrMeta.bg};color:${irrMeta.color};border:1px solid ${irrMeta.color};"
                  title="Từ bất quy tắc (${irrMeta.type})">
                <span class="material-icons-round" style="font-size:14px;">shuffle</span>
                ${this._escapeHtml(irrMeta.label)}
            </span>
        ` : '';

        const meaningText = variantsShort
            ? `${this._escapeHtml(meaning)} <span class="topic-vocab-row__variants">(${this._escapeHtml(variantsShort)})</span>`
            : this._escapeHtml(meaning);

        return `
            <div class="topic-vocab-row">
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
                <button class="topic-detail-empty__btn" onclick="Router.navigate('/vocabulary')">
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
