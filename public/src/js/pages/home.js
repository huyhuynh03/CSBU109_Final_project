// ============================================
// Home Page - Language Domain Selection
// ============================================

const HomePage = {
    /**
     * Danh sách các miền ngôn ngữ
     * Sau này sẽ mở rộng thêm các ngôn ngữ khác
     */
    languageDomains: [
        {
            id: 'english',
            name: 'Tiếng Anh',
            nameNative: 'English',
            flag: '🇬🇧',
            icon: 'translate',
            color: '#3B82F6',
            colorGradient: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
            description: 'Học từ vựng, ngữ pháp và giao tiếp tiếng Anh',
            route: '/english',
            available: true,
            cardCount: 0,
            streakDays: 0
        },
        // Các ngôn ngữ sẽ thêm trong tương lai
        // {
        //     id: 'japanese',
        //     name: 'Tiếng Nhật',
        //     nameNative: '日本語',
        //     flag: '🇯🇵',
        //     icon: 'translate',
        //     color: '#EF4444',
        //     colorGradient: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
        //     description: 'Học Hiragana, Katakana, Kanji và hội thoại',
        //     route: '/japanese',
        //     available: false,
        //     cardCount: 0,
        //     streakDays: 0
        // },
        // {
        //     id: 'korean',
        //     name: 'Tiếng Hàn',
        //     nameNative: '한국어',
        //     flag: '🇰🇷',
        //     icon: 'translate',
        //     color: '#8B5CF6',
        //     colorGradient: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
        //     description: 'Học Hangul, từ vựng và giao tiếp tiếng Hàn',
        //     route: '/korean',
        //     available: false,
        //     cardCount: 0,
        //     streakDays: 0
        // },
        // {
        //     id: 'chinese',
        //     name: 'Tiếng Trung',
        //     nameNative: '中文',
        //     flag: '🇨🇳',
        //     icon: 'translate',
        //     color: '#F59E0B',
        //     colorGradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
        //     description: 'Học Pinyin, chữ Hán và giao tiếp tiếng Trung',
        //     route: '/chinese',
        //     available: false,
        //     cardCount: 0,
        //     streakDays: 0
        // }
    ],

    async render() {
        const isSignedIn = Auth.isSignedIn();

        if (!isSignedIn) {
            return `
                <div class="home-page page-enter">
                    <div class="home-welcome">
                        <h2>Chào mừng đến với LinguaFlash! 👋</h2>
                        <p>Ứng dụng học và ôn tập thông minh với Spaced Repetition</p>
                    </div>
                    <div class="home-actions" style="margin-top:var(--spacing-xl);">
                        <div class="empty-state" style="width:100%;">
                            <span class="material-icons-round empty-state-icon">login</span>
                            <h3 class="empty-state-title">Đăng nhập để bắt đầu học</h3>
                            <p class="empty-state-desc">Đăng nhập hoặc tạo tài khoản để lưu tiến độ học tập và đồng bộ giữa các thiết bị.</p>
                            <button class="btn btn-primary btn-lg" onclick="Router.navigate('/auth')">
                                <span class="material-icons-round">person_add</span>
                                Đăng nhập / Đăng ký
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }

        return `
            <div class="home-page page-enter">
                <!-- Welcome -->
                <div class="home-welcome">
                    <h2>Chào mừng trở lại! 👋</h2>
                    <p>Chọn ngôn ngữ bạn muốn học</p>
                </div>

                <!-- Language Domains Grid -->
                <div class="lang-domains-grid">
                    ${this._renderDomainCards()}
                </div>
            </div>
        `;
    },

    /**
     * Render các thẻ ngôn ngữ
     * @private
     */
    _renderDomainCards() {
        return this.languageDomains.map(domain => {
            const isAvailable = domain.available;
            const cardClass = isAvailable ? 'lang-domain-card' : 'lang-domain-card lang-domain-card--locked';
            const clickHandler = isAvailable
                ? `onclick="Router.navigate('${domain.route}')"`
                : '';

            return `
                <div class="${cardClass}" ${clickHandler} style="--domain-color: ${domain.color}; --domain-gradient: ${domain.colorGradient};">
                    <div class="lang-domain-card__flag">${domain.flag}</div>
                    <div class="lang-domain-card__content">
                        <h3 class="lang-domain-card__name">${domain.name}</h3>
                        <span class="lang-domain-card__native">${domain.nameNative}</span>
                        <p class="lang-domain-card__desc">${domain.description}</p>
                    </div>
                    <div class="lang-domain-card__footer">
                        ${isAvailable ? `
                            <div class="lang-domain-card__stats">
                                <span class="lang-domain-card__stat">
                                    <span class="material-icons-round">style</span>
                                    ${domain.cardCount} thẻ
                                </span>
                                <span class="lang-domain-card__stat">
                                    <span class="material-icons-round">local_fire_department</span>
                                    ${domain.streakDays} ngày
                                </span>
                            </div>
                            <span class="lang-domain-card__arrow material-icons-round">arrow_forward</span>
                        ` : `
                            <div class="lang-domain-card__coming-soon">
                                <span class="material-icons-round">lock</span>
                                <span>Sắp ra mắt</span>
                            </div>
                        `}
                    </div>
                </div>
            `;
        }).join('');
    },

    async onEnter() {
        console.log('[HomePage] Entered');
    }
};
