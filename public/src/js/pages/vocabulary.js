// ============================================
// Vocabulary Page - Trang Từ vựng (Redesigned)
// ============================================

const VocabularyPage = {
    _searchTimeout: null,
    _allCards: [],
    _topics: [],

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
        this._loadStats();
        this._loadTopics();
        this._initSearch();
    },

    // ---- STATS ----
    async _loadStats() {
        try {
            const cards = await FirestoreDB.getCards({ cardType: 'vocabulary' });
            this._allCards = cards;

            const total = cards.length;
            const newCount = cards.filter(c => c.state === 'new').length;
            const now = new Date();
            const dueCount = cards.filter(c => {
                if (!c.dueDate) return false;
                const dueDate = c.dueDate.toDate ? c.dueDate.toDate() : new Date(c.dueDate);
                return dueDate <= now;
            }).length;
            const masteredCount = cards.filter(c => c.state === 'review' && c.stability > 20).length;

            const totalEl = document.getElementById('vocab-total-count');
            const newEl = document.getElementById('vocab-new-count');
            const dueEl = document.getElementById('vocab-due-count');
            const masteredEl = document.getElementById('vocab-mastered-count');
            if (totalEl) totalEl.textContent = total;
            if (newEl) newEl.textContent = newCount;
            if (dueEl) dueEl.textContent = dueCount;
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
        } catch (error) {
            console.error('[VocabularyPage] Error loading stats:', error);
        }
    },

    // ---- TOPICS ----
    async _loadTopics() {
        try {
            const folders = await FirestoreDB.getFolders('vocabulary');
            this._topics = folders;
            this._renderTopicGrid(folders);
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

        // Group topics: root topics (no parent) 
        const rootTopics = topics.filter(t => !t.parentId);

        // Calculate stats per topic
        const topicCards = {};
        this._allCards.forEach(card => {
            const fId = card.folderId;
            if (!fId) return;
            if (!topicCards[fId]) topicCards[fId] = { total: 0, new: 0, due: 0, mastered: 0 };
            topicCards[fId].total++;
            if (card.state === 'new') topicCards[fId].new++;
            const now = new Date();
            if (card.dueDate) {
                const dueDate = card.dueDate.toDate ? card.dueDate.toDate() : new Date(card.dueDate);
                if (dueDate <= now) topicCards[fId].due++;
            }
            if (card.state === 'review' && card.stability > 20) topicCards[fId].mastered++;
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

        // Icons for topics
        const topicIcons = [
            'school', 'auto_stories', 'psychology', 'lightbulb', 'emoji_objects',
            'workspace_premium', 'star', 'diamond', 'eco', 'pets'
        ];

        const html = rootTopics.map((topic, idx) => {
            const stats = topicCards[topic.id] || { total: 0, new: 0, due: 0, mastered: 0 };
            const progress = stats.total > 0 ? Math.round((stats.mastered / stats.total) * 100) : 0;
            const gradient = gradients[idx % gradients.length];
            const icon = topicIcons[idx % topicIcons.length];
            const coverImage = topic.coverImage;
            const isCompleted = progress === 100 && stats.total > 0;

            // Count sub-topics
            const subTopics = topics.filter(t => t.parentId === topic.id);

            return `
                <div class="vocab-topic-card ${isCompleted ? 'vocab-topic-card--completed' : ''}"
                     data-topic-id="${topic.id}"
                     onclick="Router.navigate('/folder/${topic.id}')">
                    <div class="vocab-topic-card__cover" style="background:${coverImage ? `url(${coverImage}) center/cover` : gradient}">
                        ${!coverImage ? `<span class="material-icons-round vocab-topic-card__cover-icon">${icon}</span>` : ''}
                        ${isCompleted ? '<div class="vocab-topic-card__badge"><span class="material-icons-round">verified</span></div>' : ''}
                        ${stats.due > 0 ? `<div class="vocab-topic-card__due-badge">${stats.due}</div>` : ''}
                    </div>
                    <div class="vocab-topic-card__body">
                        <h3 class="vocab-topic-card__name">${topic.name}</h3>
                        <div class="vocab-topic-card__meta">
                            <span>${stats.total} từ</span>
                            ${subTopics.length > 0 ? `<span>• ${subTopics.length} nhóm con</span>` : ''}
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

        grid.innerHTML = html;
    },

    // ---- SEARCH / DICTIONARY ----
    _initSearch() {
        const input = document.getElementById('vocab-search-input');
        if (!input) return;

        input.addEventListener('input', (e) => {
            const query = e.target.value.trim();
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
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this._clearSearch();
            }
        });
    },

    _performSearch(query) {
        const q = query.toLowerCase();
        const results = this._allCards.filter(card => {
            const word = (card.word || card.front || '').toLowerCase();
            const meaning = (card.meaning || card.back || '').toLowerCase();
            const ipa = (card.ipa || '').toLowerCase();
            return word.includes(q) || meaning.includes(q) || ipa.includes(q);
        }).slice(0, 20); // Max 20 results

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
            const word = card.word || card.front || '—';
            const ipa = card.ipa || '';
            const meaning = card.meaning || card.back || '';
            const partOfSpeech = card.partOfSpeech || '';
            const state = stateLabels[card.state] || stateLabels['new'];

            // Highlight match
            const highlightWord = this._highlightMatch(word, query);
            const highlightMeaning = this._highlightMatch(meaning, query);

            return `
                <div class="vocab-word-card" onclick="Router.navigate('/folder/${card.folderId}')">
                    <div class="vocab-word-card__main">
                        <div class="vocab-word-card__word">${highlightWord}</div>
                        ${ipa ? `<span class="vocab-word-card__ipa">${ipa}</span>` : ''}
                        ${partOfSpeech ? `<span class="vocab-word-card__pos">${partOfSpeech}</span>` : ''}
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
        if (!query) return text;
        const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
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
    }
};
