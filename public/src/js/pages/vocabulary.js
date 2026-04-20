// ============================================
// Vocabulary Page - Trang Từ vựng (Redesigned)
// ============================================

const VocabularyPage = {
    _searchTimeout: null,
    _allCards: [],
    _topics: [],
    _filterState: null,
    // Map topicId → seed filename cho các topic có dữ liệu mẫu
    _seedTopics: {
        'education': 'test-samples.json'
    },

    async render() {
        const isSignedIn = Auth.isSignedIn();

        if (!isSignedIn) {
            Router.navigate('/auth');
            return '<div class="page-enter"></div>';
        }

        return `
            <div class="vocab-page page-enter">

                <!-- Hero Section -->
                <div class="vocab-hero">
                    <div class="vocab-hero__bg">
                        <div class="vocab-hero__orb vocab-hero__orb--1"></div>
                        <div class="vocab-hero__orb vocab-hero__orb--2"></div>
                        <div class="vocab-hero__orb vocab-hero__orb--3"></div>
                    </div>
                    <div class="vocab-hero__content">
                        <div class="vocab-hero__title-row">
                            <div class="vocab-hero__icon">
                                <span class="material-icons-round">menu_book</span>
                            </div>
                            <div>
                                <h1 class="vocab-hero__title">Từ vựng</h1>
                                <p class="vocab-hero__subtitle">Vocabulary</p>
                            </div>
                        </div>
                        
                        <!-- Stats Pills -->
                        <div class="vocab-hero__stats">
                            <div class="vocab-stat-pill">
                                <span class="material-icons-round vocab-stat-pill__icon" style="color:#6C63FF;">style</span>
                                <div class="vocab-stat-pill__info">
                                    <span class="vocab-stat-pill__value" id="vocab-total-count">—</span>
                                    <span class="vocab-stat-pill__label">Tổng</span>
                                </div>
                            </div>
                            <div class="vocab-stat-pill">
                                <span class="material-icons-round vocab-stat-pill__icon" style="color:#10B981;">fiber_new</span>
                                <div class="vocab-stat-pill__info">
                                    <span class="vocab-stat-pill__value" id="vocab-new-count">—</span>
                                    <span class="vocab-stat-pill__label">Chưa học</span>
                                </div>
                            </div>
                            <div class="vocab-stat-pill">
                                <span class="material-icons-round vocab-stat-pill__icon" style="color:#F59E0B;">schedule</span>
                                <div class="vocab-stat-pill__info">
                                    <span class="vocab-stat-pill__value" id="vocab-due-count">—</span>
                                    <span class="vocab-stat-pill__label">Cần ôn</span>
                                </div>
                            </div>
                            <div class="vocab-stat-pill">
                                <span class="material-icons-round vocab-stat-pill__icon" style="color:#8B5CF6;">school</span>
                                <div class="vocab-stat-pill__info">
                                    <span class="vocab-stat-pill__value" id="vocab-learned-count">—</span>
                                    <span class="vocab-stat-pill__label">Đã học</span>
                                </div>
                            </div>
                            <div class="vocab-stat-pill">
                                <span class="material-icons-round vocab-stat-pill__icon" style="color:#3B82F6;">verified</span>
                                <div class="vocab-stat-pill__info">
                                    <span class="vocab-stat-pill__value" id="vocab-mastered-count">—</span>
                                    <span class="vocab-stat-pill__label">Đã thuộc</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="vocab-actions">
                    <button class="vocab-action-btn vocab-action-btn--study" onclick="Router.navigate('/study?type=vocabulary')">
                        <div class="vocab-action-btn__icon-wrap">
                            <span class="material-icons-round">auto_stories</span>
                        </div>
                        <div class="vocab-action-btn__text">
                            <span class="vocab-action-btn__title">Học mới</span>
                            <span class="vocab-action-btn__desc" id="vocab-study-desc">Đang tải...</span>
                        </div>
                        <span class="material-icons-round vocab-action-btn__arrow">arrow_forward</span>
                    </button>
                    <button class="vocab-action-btn vocab-action-btn--review" onclick="Router.navigate('/review?type=vocabulary')">
                        <div class="vocab-action-btn__icon-wrap">
                            <span class="material-icons-round">replay</span>
                        </div>
                        <div class="vocab-action-btn__text">
                            <span class="vocab-action-btn__title">Ôn tập</span>
                            <span class="vocab-action-btn__desc" id="vocab-review-desc">Đang tải...</span>
                        </div>
                        <span class="material-icons-round vocab-action-btn__arrow">arrow_forward</span>
                    </button>
                </div>

                <!-- Bulk mode change -->
                <div style="display:flex;justify-content:flex-end;margin:8px 0 4px;">
                    <button class="topic-detail-toolbar__btn"
                            onclick="VocabularyPage._openModeForAll()">
                        <span class="material-icons-round" style="font-size:18px;">swap_horiz</span>
                        <span id="vocab-bulk-mode-label">Đổi mode toàn bộ từ vựng</span>
                    </button>
                </div>

                <!-- Filter panel -->
                <div id="vocab-filter-root"></div>

                <!-- Filter results (hiển thị khi có filter active) -->
                <div id="vocab-filter-results" class="vocab-filter-results" style="display:none;"></div>

                <!-- Review level distribution -->
                <div class="vocab-level-section" id="vocab-level-section">
                    <div class="vocab-level-section__header">
                        <span class="material-icons-round" style="color:#10b981;">timeline</span>
                        <h2>Phân bố cấp độ ôn tập</h2>
                        <span class="vocab-level-section__hint">Số thẻ ở từng bậc thời gian</span>
                    </div>
                    <div class="vocab-level-grid" id="vocab-level-grid">
                        <div class="vocab-level-grid__loading">Đang tính...</div>
                    </div>
                </div>


                <!-- Incomplete Tracking Section -->
                <div id="vocab-incomplete-section" class="vocab-incomplete-section" style="display:none;">
                    <div class="vocab-incomplete-header">
                        <span class="material-icons-round">hourglass_bottom</span>
                        <h2>Nhóm từ chưa hoàn thành</h2>
                        <span class="vocab-incomplete-count" id="vocab-incomplete-count">0</span>
                    </div>
                    <div class="vocab-incomplete-grid" id="vocab-incomplete-grid"></div>
                </div>

                <!-- Dictionary / Search Section -->
                <div class="vocab-search-section">
                    <div class="vocab-search-bar">
                        <span class="material-icons-round vocab-search-bar__icon">search</span>
                        <input type="text" 
                               class="vocab-search-bar__input" 
                               placeholder="Tra từ điển — Tìm từ vựng trong tất cả topic..."
                               id="vocab-search-input"
                               autocomplete="off">
                        <button class="vocab-search-bar__clear" id="vocab-search-clear" style="display:none;" onclick="VocabularyPage._clearSearch()">
                            <span class="material-icons-round">close</span>
                        </button>
                    </div>
                    <!-- Search Results -->
                    <div id="vocab-search-results" class="vocab-search-results" style="display:none;"></div>
                </div>

                <!-- Topic Header -->
                <div class="vocab-topic-header">
                    <h2 class="vocab-topic-header__title">
                        <span class="material-icons-round" style="font-size:22px;margin-right:6px;">topic</span>
                        Chủ đề từ vựng
                    </h2>
                </div>

                <!-- Topic Grid -->
                <div class="vocab-topic-grid" id="vocab-topic-grid">
                    <div class="vocab-topic-grid__loading">
                        <span class="material-icons-round" style="font-size:40px;color:var(--color-text-muted);animation:spin 1s linear infinite;">hourglass_empty</span>
                        <p style="color:var(--color-text-muted);margin-top:var(--spacing-sm);">Đang tải chủ đề...</p>
                    </div>
                </div>
            </div>
        `;
    },

    async onEnter() {
        console.log('[VocabularyPage] Entered');
        // Tự động nạp seed data vào các topic chưa có từ
        await this._autoSeedTopics();
        await this._loadStats();   // Phải await để this._allCards có dữ liệu
        this._loadTopics();        // Dùng this._allCards → phải chạy sau _loadStats
        this._loadIncompleteTracking();
        this._initSearch();
        this._initFilter();
    },

    // ---- FILTER ----
    _initFilter() {
        if (!this._filterState) this._filterState = CardFilter.createState();
        CardFilter.mount('vocab-filter-root', {
            state: this._filterState,
            onChange: (s) => {
                this._filterState = s;
                this._renderFilterResults();
            }
        });
        this._renderFilterResults();
    },

    _renderFilterResults() {
        const container = document.getElementById('vocab-filter-results');
        const bulkLabel = document.getElementById('vocab-bulk-mode-label');
        if (!container) return;

        const isFiltering = !CardFilter.isEmpty(this._filterState);
        if (!isFiltering) {
            container.style.display = 'none';
            container.innerHTML = '';
            if (bulkLabel) bulkLabel.textContent = 'Đổi mode toàn bộ từ vựng';
            return;
        }

        const filtered = CardFilter.apply(this._allCards, this._filterState);
        if (bulkLabel) bulkLabel.textContent = `Đổi mode ${filtered.length} thẻ đã lọc`;
        container.style.display = 'block';

        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="vocab-filter-results__header">
                    <span class="material-icons-round" style="color:#ef4444;">filter_alt_off</span>
                    <span>Không có thẻ nào khớp bộ lọc</span>
                </div>
            `;
            return;
        }

        // Sort: theo word alphabet
        const sorted = [...filtered].sort((a, b) => {
            const wa = (a.fieldValues?.word || '').toLowerCase();
            const wb = (b.fieldValues?.word || '').toLowerCase();
            return wa.localeCompare(wb);
        });
        // Giới hạn hiển thị 50 thẻ để tránh DOM quá nặng
        const LIMIT = 50;
        const displayed = sorted.slice(0, LIMIT);

        const rows = displayed.map(card => {
            const fv = card.fieldValues || {};
            const word = fv.word || '—';
            const pos = fv.partOfSpeech || '';
            const meaning = fv.meaning || '';
            const lv = CardFilter.getCardLevel(card);
            const levelOpt = CardFilter.LEVEL_OPTIONS.find(o => o.key === lv) || null;
            const irrMeta = (typeof CardSchemas !== 'undefined' && CardSchemas.getIrregularMeta)
                ? CardSchemas.getIrregularMeta(card) : null;
            const hasFamily = !!fv.familyId;

            const levelBadge = levelOpt
                ? `<span class="vocab-filter-result__badge" style="background:${levelOpt.color}22;color:${levelOpt.color};border:1px solid ${levelOpt.color}55;">
                     <span class="material-icons-round" style="font-size:14px;">${levelOpt.icon}</span>
                     ${levelOpt.label}
                   </span>`
                : '';
            const irrBadge = irrMeta
                ? `<span class="vocab-filter-result__badge" style="background:${irrMeta.bg};color:${irrMeta.color};border:1px solid ${irrMeta.color};">
                     <span class="material-icons-round" style="font-size:14px;">shuffle</span>
                     ${this._esc(irrMeta.label)}
                   </span>`
                : '';
            const familyBadge = hasFamily
                ? `<span class="vocab-filter-result__badge" style="background:#6366f122;color:#6366f1;border:1px solid #6366f155;">
                     <span class="material-icons-round" style="font-size:14px;">account_tree</span>
                     Family: ${this._esc(fv.familyId)}
                   </span>`
                : '';

            return `
                <div class="vocab-filter-result" onclick="Router.navigate('/topic/${this._esc(card.folderId || '')}')">
                    <div class="vocab-filter-result__top">
                        <span class="vocab-filter-result__word">${this._esc(word)}</span>
                        ${pos ? `<span class="vocab-filter-result__pos">${this._esc(pos)}</span>` : ''}
                    </div>
                    <div class="vocab-filter-result__meaning">${this._esc(meaning)}</div>
                    <div class="vocab-filter-result__badges">
                        ${levelBadge}
                        ${irrBadge}
                        ${familyBadge}
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = `
            <div class="vocab-filter-results__header">
                <span class="material-icons-round" style="color:#6366f1;">filter_alt</span>
                <span>Kết quả lọc: <strong>${filtered.length}</strong> thẻ${filtered.length > LIMIT ? ` (hiển thị ${LIMIT} đầu)` : ''}</span>
            </div>
            <div class="vocab-filter-results__list">${rows}</div>
        `;
    },

    _esc(str) {
        if (str == null) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    },

    // ---- STATS ----
    async _loadStats() {
        try {
            const cards = await FirestoreDB.getCards({ cardType: 'vocabulary' });
            this._allCards = cards;

            const total = cards.length;
            const newCount = cards.filter(c => c.state === 'new' || c.state === FSRS.State.NEW).length;
            const now = new Date();
            const dueCount = cards.filter(c => {
                // Chỉ đếm due cho card đã học (review/relearning), không đếm card mới
                const st = c.state;
                if (st === 'new' || st === FSRS.State.NEW) return false;
                if (!c.dueDate) return false;
                const dueDate = c.dueDate.toDate ? c.dueDate.toDate() : new Date(c.dueDate);
                return dueDate <= now;
            }).length;
            const learnedCount = cards.filter(c => c.state === 'review' || c.state === FSRS.State.REVIEW).length;
            const masteredCount = cards.filter(c => (c.state === 'review' || c.state === FSRS.State.REVIEW) && c.stability > 20).length;

            const totalEl = document.getElementById('vocab-total-count');
            const newEl = document.getElementById('vocab-new-count');
            const dueEl = document.getElementById('vocab-due-count');
            const learnedEl = document.getElementById('vocab-learned-count');
            const masteredEl = document.getElementById('vocab-mastered-count');
            if (totalEl) totalEl.textContent = total;
            if (newEl) newEl.textContent = newCount;
            if (dueEl) dueEl.textContent = dueCount;
            if (learnedEl) learnedEl.textContent = learnedCount;
            if (masteredEl) masteredEl.textContent = masteredCount;

            // Update action button descriptions
            const studyDesc = document.getElementById('vocab-study-desc');
            const reviewDesc = document.getElementById('vocab-review-desc');
            if (studyDesc) {
                studyDesc.textContent = newCount > 0
                    ? `${newCount} từ chưa học`
                    : 'Không có từ mới';
            }
            if (reviewDesc) {
                reviewDesc.textContent = dueCount > 0
                    ? `${dueCount} từ đến hạn`
                    : 'Không có từ cần ôn';
            }

            // Phân bố theo cấp độ ôn tập
            this._renderLevelDistribution(cards);
        } catch (error) {
            console.error('[VocabularyPage] Error loading stats:', error);
        }
    },

    _renderLevelDistribution(cards) {
        const grid = document.getElementById('vocab-level-grid');
        if (!grid) return;

        const totalSteps = (typeof FSRS !== 'undefined' && FSRS.Steps) ? FSRS.Steps.length : 5;
        const buckets = new Array(totalSteps).fill(0);
        let unknownReview = 0;
        let newCount = 0;
        let learningCount = 0;

        cards.forEach(c => {
            const st = c.state;
            const isNew = (st === 'new' || st === FSRS.State.NEW || st === undefined);
            const isLearning = (st === 'learning' || st === FSRS.State.LEARNING);
            const isReview = (st === 'review' || st === FSRS.State.REVIEW
                || st === 'relearning' || st === FSRS.State.RELEARNING);

            if (isNew) { newCount++; return; }
            if (isLearning) { learningCount++; return; }

            if (isReview) {
                const idx = Number.isInteger(c.stepIndex) ? c.stepIndex : -1;
                if (idx >= 0 && idx < totalSteps) buckets[idx]++;
                else unknownReview++;
            }
        });

        const totalReview = buckets.reduce((s, n) => s + n, 0) + unknownReview;
        const colors = ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];

        const cells = buckets.map((count, i) => {
            const label = (FSRS.getStepLabel ? FSRS.getStepLabel(i) : `Cấp độ ${i + 1}`);
            const pct = totalReview > 0 ? Math.round((count / totalReview) * 100) : 0;
            const color = colors[i % colors.length];
            return `
                <div class="vocab-level-cell" style="--lvl-color:${color};">
                    <div class="vocab-level-cell__head">
                        <span class="vocab-level-cell__idx">Cấp độ ${i + 1}</span>
                        <span class="vocab-level-cell__lbl">${label}</span>
                    </div>
                    <div class="vocab-level-cell__count">${count}</div>
                    <div class="vocab-level-cell__bar">
                        <div class="vocab-level-cell__bar-fill" style="width:${pct}%;background:${color};"></div>
                    </div>
                    <div class="vocab-level-cell__pct">${pct}% trên ${totalReview} thẻ ôn tập</div>
                </div>
            `;
        }).join('');

        const summary = `
            <div class="vocab-level-summary">
                <div class="vocab-level-summary__item">
                    <span class="material-icons-round" style="color:#10b981;">fiber_new</span>
                    Học mới: <strong>${newCount}</strong>
                </div>
                ${learningCount > 0 ? `
                    <div class="vocab-level-summary__item">
                        <span class="material-icons-round" style="color:#f59e0b;">menu_book</span>
                        Đang học: <strong>${learningCount}</strong>
                    </div>` : ''}
                <div class="vocab-level-summary__item">
                    <span class="material-icons-round" style="color:#6366f1;">replay</span>
                    Đang ôn tập: <strong>${totalReview}</strong>
                </div>
                ${unknownReview > 0 ? `
                    <div class="vocab-level-summary__item" title="Thẻ ôn tập chưa có stepIndex (cần migration)">
                        <span class="material-icons-round" style="color:#ef4444;">help_outline</span>
                        Chưa phân bậc: <strong>${unknownReview}</strong>
                    </div>` : ''}
            </div>
        `;

        grid.innerHTML = summary + `<div class="vocab-level-cells">${cells}</div>`;
    },

    // ---- TOPICS ----
    async _loadTopics() {
        try {
            // Dùng VocabularyTopics từ config (static data)
            this._topics = VocabularyTopics;
            this._renderTopicGrid(VocabularyTopics);
        } catch (error) {
            console.error('[VocabularyPage] Error loading topics:', error);
            this._renderTopicGrid([]);
        }
    },

    _renderTopicGrid(topics) {
        const grid = document.getElementById('vocab-topic-grid');
        if (!grid) return;

        if (!topics || topics.length === 0) {
            grid.innerHTML = `
                <div class="vocab-empty-topics">
                    <div class="vocab-empty-topics__icon">
                        <span class="material-icons-round">library_books</span>
                    </div>
                    <h3>Chưa có chủ đề nào</h3>
                    <p>Các chủ đề từ vựng sẽ được admin tạo sẵn và hiển thị tại đây.</p>
                </div>
            `;
            return;
        }

        // Group by category
        const categories = {};
        topics.forEach(t => {
            const cat = t.category || 'other';
            if (!categories[cat]) categories[cat] = [];
            categories[cat].push(t);
        });

        // Calculate stats per topic
        const topicCards = {};
        this._allCards.forEach(card => {
            const fId = card.folderId;
            if (!fId) return;
            if (!topicCards[fId]) topicCards[fId] = { total: 0, new: 0, due: 0, learned: 0, mastered: 0 };
            topicCards[fId].total++;
            const st = card.state;
            const isNew = (st === 'new' || st === FSRS.State.NEW);
            if (isNew) topicCards[fId].new++;
            else topicCards[fId].learned++;
            if (!isNew && card.dueDate) {
                const now = new Date();
                const dueDate = card.dueDate.toDate ? card.dueDate.toDate() : new Date(card.dueDate);
                if (dueDate <= now) topicCards[fId].due++;
            }
            if ((card.state === 'review' || card.state === FSRS.State.REVIEW) && card.stability > 20) topicCards[fId].mastered++;
        });

        // Predefined cover gradients for topics
        const gradients = [
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
            'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
            'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
            'linear-gradient(135deg, #f5576c 0%, #ff6f3c 100%)',
            'linear-gradient(135deg, #13547a 0%, #80d0c7 100%)',
        ];

        // Sort categories by TopicCategories order
        const sortedCats = Object.keys(categories).sort((a, b) => {
            const oa = (TopicCategories[a] || {}).order || 99;
            const ob = (TopicCategories[b] || {}).order || 99;
            return oa - ob;
        });

        let globalIdx = 0;
        const html = sortedCats.map(catKey => {
            const catInfo = TopicCategories[catKey] || { label: catKey, icon: 'folder' };
            const catTopics = categories[catKey];

            const cardsHtml = catTopics.map(topic => {
                const stats = topicCards[topic.id] || { total: 0, new: 0, due: 0, learned: 0, mastered: 0 };
                // % "đã học" = số thẻ đã rời trạng thái 'new' / tổng (gồm cả learning/review/relearning)
                const progress = stats.total > 0 ? Math.round((stats.learned / stats.total) * 100) : 0;
                const gradient = gradients[globalIdx % gradients.length];
                const icon = topic.icon || 'menu_book';
                const isCompleted = progress === 100 && stats.total > 0;
                globalIdx++;

                return `
                    <div class="vocab-topic-card ${isCompleted ? 'vocab-topic-card--completed' : ''}"
                         data-topic-id="${topic.id}"
                         onclick="Router.navigate('/topic/${topic.id}')">
                        <div class="vocab-topic-card__cover" style="background:${gradient}">
                            <span class="material-icons-round vocab-topic-card__cover-icon">${icon}</span>
                            ${isCompleted ? '<div class="vocab-topic-card__badge"><span class="material-icons-round">verified</span></div>' : ''}
                            ${stats.due > 0 ? `<div class="vocab-topic-card__due-badge">${stats.due}</div>` : ''}
                        </div>
                        <div class="vocab-topic-card__body">
                            <h3 class="vocab-topic-card__name">${topic.name}</h3>
                            <div class="vocab-topic-card__meta">
                                <span>${stats.total} từ</span>
                            </div>
                            <div class="vocab-topic-card__progress">
                                <div class="vocab-topic-card__progress-bar">
                                    <div class="vocab-topic-card__progress-fill" style="width:${progress}%"></div>
                                </div>
                                <span class="vocab-topic-card__progress-text">${progress}%</span>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            return `
                <div class="vocab-category-section">
                    <div class="vocab-category-header">
                        <span class="material-icons-round">${catInfo.icon}</span>
                        <h3>${catInfo.label}</h3>
                    </div>
                    <div class="vocab-category-grid">
                        ${cardsHtml}
                    </div>
                </div>
            `;
        }).join('');

        grid.innerHTML = html;
    },

    // ---- SEARCH / DICTIONARY ----
    _initSearch() {
        const input = document.getElementById('vocab-search-input');
        if (!input) return;

        // Đánh dấu trạng thái IME composition (Tiếng Việt Telex/VNI/...)
        this._isComposing = false;

        const triggerSearch = () => {
            const query = input.value.trim();
            const clearBtn = document.getElementById('vocab-search-clear');
            if (clearBtn) clearBtn.style.display = query ? 'flex' : 'none';

            clearTimeout(this._searchTimeout);
            if (!query) {
                this._hideSearchResults();
                return;
            }
            this._searchTimeout = setTimeout(() => {
                this._performSearch(query);
            }, 300);
        };

        input.addEventListener('compositionstart', () => {
            this._isComposing = true;
        });

        input.addEventListener('compositionend', () => {
            this._isComposing = false;
            // Sau khi IME flush xong → search ngay (không bị hide bởi input event trống)
            triggerSearch();
        });

        input.addEventListener('input', (e) => {
            // Bỏ qua các input event xảy ra TRONG khi IME đang compose
            if (this._isComposing) return;
            triggerSearch();
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this._clearSearch();
            }
        });
    },

    /**
     * Bỏ dấu tiếng Việt + lowercase để tìm kiếm "viet" ra "việt".
     */
    _normalize(str) {
        return (str || '')
            .toString()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/[^a-z0-9\s]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    },

    /**
     * Tách text thành các token (split theo dấu câu/khoảng trắng).
     */
    _tokenize(text) {
        if (!text) return [];
        return text.split(/[\s,;./()\[\]{}|]+/).filter(Boolean);
    },

    /**
     * Cho 1 token, trả về điểm match với query (càng nhỏ càng tốt).
     *  0  = bằng nhau
     *  5  = token bắt đầu bằng query (prefix)
     *  20 + idx = chứa query làm substring
     *  500 + spread + firstIdx = subsequence (chỉ cho query >= 3 kí tự)
     *  -1 = không match
     */
    _tokenScore(token, query) {
        if (!token || !query) return -1;
        if (token === query) return 0;
        if (token.startsWith(query)) return 5;
        const idx = token.indexOf(query);
        if (idx !== -1) return 20 + idx;
        if (query.length < 3) return -1; // tránh fuzzy với query quá ngắn
        // Subsequence trong token đơn lẻ
        let ti = 0, qi = 0, firstIdx = -1, lastIdx = -1;
        while (ti < token.length && qi < query.length) {
            if (token[ti] === query[qi]) {
                if (firstIdx === -1) firstIdx = ti;
                lastIdx = ti;
                qi++;
            }
            ti++;
        }
        if (qi < query.length) return -1;
        return 500 + (lastIdx - firstIdx) + firstIdx;
    },

    /**
     * Điểm tốt nhất khi match query vào BẤT KỲ token nào trong text.
     * Trả về -1 nếu không token nào match.
     */
    _bestTokenScore(text, query) {
        const tokens = this._tokenize(text);
        let best = -1;
        for (const t of tokens) {
            const s = this._tokenScore(t, query);
            if (s !== -1 && (best === -1 || s < best)) best = s;
        }
        return best;
    },

    _performSearch(query) {
        const qNorm = this._normalize(query);
        if (!qNorm) {
            // qNorm rỗng nhưng query có thể còn dấu/ký tự đặc biệt
            // → giữ nguyên kết quả cũ, KHÔNG ẩn (tránh nhấp nháy khi gõ IME)
            return;
        }

        const scored = [];
        for (const card of this._allCards) {
            const fv = card.fieldValues || {};
            const word = this._normalize(fv.word || card.word || card.front || '');
            const meaning = this._normalize(fv.meaning || card.meaning || card.back || '');
            const ipa = this._normalize(fv.ipa || card.ipa || '');
            const pos = this._normalize(fv.partOfSpeech || card.partOfSpeech || '');
            const variantsTxt = this._normalize(
                [fv.pastSimple, fv.pastParticiple, fv.comparative, fv.superlative]
                    .filter(Boolean).join(' ')
            );

            // Tính điểm từng nguồn — chỉ cộng penalty SAU khi xác nhận match
            const candidates = [];
            const sWord = this._bestTokenScore(word, qNorm);
            if (sWord !== -1) candidates.push(sWord);                // EN ưu tiên cao nhất

            const sMeaning = this._bestTokenScore(meaning, qNorm);
            if (sMeaning !== -1) candidates.push(sMeaning + 10);     // VI: penalty nhỏ

            const sVar = this._bestTokenScore(variantsTxt, qNorm);
            if (sVar !== -1) candidates.push(sVar + 30);

            const sIpa = this._bestTokenScore(ipa, qNorm);
            if (sIpa !== -1) candidates.push(sIpa + 100);

            const sPos = this._bestTokenScore(pos, qNorm);
            if (sPos !== -1) candidates.push(sPos + 200);

            if (candidates.length > 0) {
                scored.push({ card, score: Math.min(...candidates) });
            }
        }

        scored.sort((a, b) => a.score - b.score);
        const results = scored.slice(0, 20).map(s => s.card);
        this._renderSearchResults(results, query);
    },

    _renderSearchResults(results, query) {
        const container = document.getElementById('vocab-search-results');
        if (!container) return;

        container.style.display = 'block';

        if (results.length === 0) {
            container.innerHTML = `
                <div class="vocab-search-empty">
                    <span class="material-icons-round" style="font-size:36px;color:var(--color-text-muted);">search_off</span>
                    <p>Không tìm thấy từ "<strong>${query}</strong>"</p>
                </div>
            `;
            return;
        }

        const stateLabels = {
            'new': { text: 'Chưa học', color: 'var(--color-text-muted)', bg: 'var(--color-surface)' },
            'learning': { text: 'Đang học', color: '#F59E0B', bg: 'rgba(245,158,11,0.15)' },
            'review': { text: 'Ôn tập', color: '#3B82F6', bg: 'rgba(59,130,246,0.15)' },
        };

        const html = results.map(card => {
            const fv = card.fieldValues || {};
            const word = fv.word || card.word || card.front || '—';
            const ipa = fv.ipa || card.ipa || '';
            const meaning = fv.meaning || card.meaning || card.back || '';
            const partOfSpeech = fv.partOfSpeech || card.partOfSpeech || '';
            const difficulty = fv.difficulty || card.difficulty || 'intermediate';
            const diffMeta = CardSchemas.getDifficultyMeta(difficulty);
            const state = stateLabels[card.state] || stateLabels['new'];

            // Highlight match
            const highlightWord = this._highlightMatch(word, query);
            const highlightMeaning = this._highlightMatch(meaning, query);

            return `
                <div class="vocab-word-card card-difficulty-${difficulty}" onclick="Router.navigate('/topic/${card.folderId}')">
                    <div class="vocab-word-card__main">
                        <div class="vocab-word-card__word">${highlightWord}</div>
                        ${ipa ? `<span class="vocab-word-card__ipa">${ipa}</span>` : ''}
                        ${partOfSpeech ? `<span class="vocab-word-card__pos">${partOfSpeech}</span>` : ''}
                        <span class="difficulty-badge difficulty-badge--${difficulty}" title="${diffMeta.label} (${diffMeta.band})">${diffMeta.short}</span>
                    </div>
                    <div class="vocab-word-card__meaning">${highlightMeaning}</div>
                    <div class="vocab-word-card__state" style="color:${state.color};background:${state.bg}">${state.text}</div>
                </div>
            `;
        }).join('');

        container.innerHTML = `
            <div class="vocab-search-results__header">
                <span>Tìm thấy <strong>${results.length}</strong> kết quả</span>
            </div>
            ${html}
        `;
    },

    _highlightMatch(text, query) {
        if (!query || !text) return text;
        // Highlight substring match (không-dấu) bằng cách so sánh trên chuỗi normalized
        const qNorm = this._normalize(query);
        const tNorm = this._normalize(text);
        const idx = tNorm.indexOf(qNorm);
        if (idx === -1) {
            // Fallback: highlight theo regex thường (case-insensitive)
            try {
                const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
                return text.replace(regex, '<mark>$1</mark>');
            } catch {
                return text;
            }
        }
        // Map vị trí từ tNorm sang text gốc (xấp xỉ - chỉ dùng nếu lengths khớp)
        if (tNorm.length === text.toLowerCase().length) {
            return text.slice(0, idx) + '<mark>' + text.slice(idx, idx + qNorm.length) + '</mark>' + text.slice(idx + qNorm.length);
        }
        return text;
    },

    _hideSearchResults() {
        const container = document.getElementById('vocab-search-results');
        if (container) container.style.display = 'none';
    },

    _clearSearch() {
        const input = document.getElementById('vocab-search-input');
        const clearBtn = document.getElementById('vocab-search-clear');
        if (input) { input.value = ''; input.focus(); }
        if (clearBtn) clearBtn.style.display = 'none';
        this._hideSearchResults();
    },

    // ---- INCOMPLETE TRACKING ----
    async _loadIncompleteTracking() {
        try {
            const families = FamilyWordManager.getIncompleteFamilies();
            const section = document.getElementById('vocab-incomplete-section');
            const grid = document.getElementById('vocab-incomplete-grid');
            const countEl = document.getElementById('vocab-incomplete-count');

            if (!section || !grid) return;

            if (families.length === 0) {
                section.style.display = 'none';
                return;
            }

            section.style.display = 'block';
            if (countEl) countEl.textContent = families.length;

            // Fetch all vocab cards to get family details
            const allCards = this._allCards.length > 0
                ? this._allCards
                : await FirestoreDB.getCards({ cardType: 'vocabulary' });

            const html = families.map(family => {
                const familyCards = allCards.filter(c => c.fieldValues?.familyId === family.familyId);
                const learnedSet = new Set(family.learnedWords || []);
                const learnedCount = learnedSet.size;
                const totalCount = Math.max(family.totalWords, familyCards.length);
                const progress = totalCount > 0 ? Math.round((learnedCount / totalCount) * 100) : 0;

                // Xác định difficulty của family = difficulty của từ đầu tiên
                const firstCard = familyCards[0];
                const familyDifficulty = firstCard?.fieldValues?.difficulty || 'intermediate';
                const diffMeta = CardSchemas.getDifficultyMeta(familyDifficulty);

                const wordsHtml = familyCards
                    .sort((a, b) => (a.fieldValues?.familyOrder || 99) - (b.fieldValues?.familyOrder || 99))
                    .map(c => {
                        const word = c.fieldValues?.word || '?';
                        const isLearned = learnedSet.has(word);
                        return `<span class="vocab-incomplete-word ${isLearned ? 'vocab-incomplete-word--learned' : ''}">
                            ${isLearned ? '✅' : '🆕'} ${word}
                        </span>`;
                    }).join('');

                return `
                    <div class="vocab-incomplete-card glass-panel card-difficulty-${familyDifficulty}">
                        <div class="vocab-incomplete-card__header">
                            <span class="difficulty-dot difficulty-dot--${familyDifficulty}" title="${diffMeta.label}"></span>
                            <span class="vocab-incomplete-card__family-id">${family.familyId}</span>
                            <span class="difficulty-badge difficulty-badge--${familyDifficulty}">${diffMeta.short}</span>
                        </div>
                        <div class="vocab-incomplete-card__progress">
                            <div class="vocab-incomplete-card__progress-bar">
                                <div class="vocab-incomplete-card__progress-fill" style="width:${progress}%"></div>
                            </div>
                            <span class="vocab-incomplete-card__progress-text">${learnedCount}/${totalCount}</span>
                        </div>
                        <div class="vocab-incomplete-card__words">${wordsHtml}</div>
                        <button class="vocab-incomplete-card__btn" onclick="VocabularyPage._learnFamily('${family.familyId}')">
                            <span class="material-icons-round">play_arrow</span> Học tiếp
                        </button>
                    </div>
                `;
            }).join('');

            grid.innerHTML = html;
        } catch (error) {
            console.error('[VocabularyPage] Error loading incomplete tracking:', error);
        }
    },

    // ---- AUTO SEED: tự động nạp từ vựng mẫu vào topic tương ứng ----
    async _autoSeedTopics() {
        if (!window.SeedImporter) return;
        try {
            // Lấy cards hiện có để check topic nào đã có từ
            const cards = await FirestoreDB.getCards({ cardType: 'vocabulary' });
            const topicsWithCards = new Set(cards.map(c => c.folderId).filter(Boolean));

            for (const [topicId, filename] of Object.entries(this._seedTopics)) {
                if (topicsWithCards.has(topicId)) continue; // Đã có từ → skip
                console.log(`[VocabularyPage] Auto-seeding topic "${topicId}" from ${filename}`);
                const result = await SeedImporter.importFile(filename);
                console.log(`[VocabularyPage] Seeded: +${result.created} created, ${result.skipped} skipped`);
            }
        } catch (e) {
            console.error('[VocabularyPage] Auto-seed error:', e);
        }
    },

    _openModeForAll() {
        let cards = (this._allCards || []).filter(c => c.cardType === 'vocabulary' || !c.cardType);
        if (!cards.length) {
            Toast.warning && Toast.warning('Không có từ vựng', 'Bạn chưa có thẻ từ vựng nào.');
            return;
        }
        // Nếu có bộ lọc đang active → chỉ đổi mode cho các thẻ khớp filter
        const isFiltering = !CardFilter.isEmpty(this._filterState);
        let scopeLabel = `toàn bộ từ vựng (${cards.length} thẻ)`;
        if (isFiltering) {
            cards = CardFilter.apply(cards, this._filterState);
            if (!cards.length) {
                Toast.warning && Toast.warning('Không có thẻ nào', 'Không có thẻ nào khớp bộ lọc hiện tại.');
                return;
            }
            scopeLabel = `${cards.length} thẻ đã lọc`;
        }
        CardModeManager.openModal(cards, {
            scopeLabel,
            onDone: async () => {
                await this._loadStats();        // refresh _allCards trước
                this._loadTopics();             // sau đó render lại grid topic %
                this._renderFilterResults();    // cập nhật lại list kết quả lọc
            }
        });
    },

    _learnFamily(familyId) {
        // Navigate to study page with family filter
        Router.navigate(`/study?type=vocabulary&familyId=${encodeURIComponent(familyId)}`);
    }
};
