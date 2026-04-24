// ============================================
// Languages Page - Language Domain Selection
// (Khôi phục lại trang chọn ngôn ngữ; hiện tại chỉ có Tiếng Anh.)
// ============================================

const LanguagesPage = {
    languageDomains: [
        {
            id: 'english',
            name: 'Tiếng Anh',
            nameNative: 'English',
            flagLabel: 'EN',
            icon: 'translate',
            color: '#3B82F6',
            colorGradient: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
            description: 'Học từ vựng, ngữ pháp và giao tiếp tiếng Anh',
            route: '/vocabulary',
            available: true
        }
        // Các ngôn ngữ khác sẽ thêm vào đây khi ra mắt.
    ],

    async render() {
        const isSignedIn = Auth.isSignedIn();
        if (!isSignedIn) {
            Router.navigate('/auth');
            return '<div class="page-enter"></div>';
        }

        return `
            <div class="home-page page-enter">
                <div class="home-welcome">
                    <h2>Chọn ngôn ngữ 🌐</h2>
                    <p>Chọn ngôn ngữ bạn muốn học.</p>
                </div>

                <div class="lang-domains-grid">
                    ${this._renderDomainCards()}
                </div>
            </div>
        `;
    },

    _renderDomainCards() {
        return this.languageDomains.map(domain => {
            const isAvailable = domain.available;
            const cardClass = isAvailable ? 'lang-domain-card' : 'lang-domain-card lang-domain-card--locked';
            const clickHandler = isAvailable
                ? `onclick="Router.navigate('${domain.route}')"`
                : `onclick="Toast.info('Sắp ra mắt', '${domain.name} đang được phát triển!')"`;

            return `
                <div class="${cardClass}" ${clickHandler} style="--domain-color: ${domain.color}; --domain-gradient: ${domain.colorGradient};">
                    <div class="lang-domain-card__flag">${domain.flagLabel}</div>
                    <div class="lang-domain-card__content">
                        <h3 class="lang-domain-card__name">${domain.name}</h3>
                        <span class="lang-domain-card__native">${domain.nameNative}</span>
                        <p class="lang-domain-card__desc">${domain.description}</p>
                    </div>
                    <div class="lang-domain-card__footer">
                        ${isAvailable ? `
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
        console.log('[LanguagesPage] Entered');
    }
};
