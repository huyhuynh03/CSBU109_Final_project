// ============================================
// Grammar Page - Trang Ngữ pháp
// ============================================
// Hiển thị nhãn nhóm "Thì động từ (Tense)" + grid 12 thì (mỗi thì = 1 folder).
// Tái dùng class UI của vocabulary (vocab-topic-*) để đồng bộ giao diện.

const GrammarPage = {
    render() {
        if (!Auth.isSignedIn()) {
            Router.navigate('/auth');
            return '<div class="page-enter"></div>';
        }

        // Nhóm #1: Thì động từ (giữ nguyên cấu trúc 12 thì).
        const tenses = (typeof GrammarTenses !== 'undefined') ? GrammarTenses.slice() : [];
        tenses.sort((a, b) => a.order - b.order);
        const tenseCards = tenses.map(t => this._tenseCard(t)).join('');

        // Nhóm #2 → #15: các nhóm cấu trúc ngữ pháp còn lại (mỗi nhóm có lessons[]).
        const groups = (typeof GrammarGroups !== 'undefined') ? GrammarGroups.slice() : [];
        groups.sort((a, b) => a.order - b.order);
        const groupSections = groups.map(g => this._groupSection(g)).join('');

        return `
            <div class="grammar-page page-enter">
                <!-- Domain Header -->
                <div class="domain-header">
                    <div class="domain-header__info">
                        <div class="domain-header__icon-wrapper" style="background: linear-gradient(135deg, #10B981 0%, #059669 100%);">
                            <span class="material-icons-round" style="color:#fff;font-size:24px;">school</span>
                        </div>
                        <div>
                            <h2 class="domain-header__title">Ngữ pháp</h2>
                            <p class="domain-header__subtitle">Grammar</p>
                        </div>
                    </div>
                </div>

                <!-- Nhãn nhóm: Thì động từ (Tense) -->
                <div class="vocab-topic-header">
                    <h2 class="vocab-topic-header__title">
                        <span class="material-icons-round" style="font-size:22px;margin-right:6px;">schedule</span>
                        Thì động từ (Tense)
                    </h2>
                </div>

                <!-- Grid 12 thì -->
                <div class="vocab-category-grid">
                    ${tenseCards || '<p style="color:var(--color-text-muted);">Chưa có thì nào.</p>'}
                </div>

                <!-- Các nhóm cấu trúc ngữ pháp còn lại -->
                ${groupSections}
            </div>
        `;
    },

    _tenseCard(t) {
        const grad = 'linear-gradient(135deg,#10B981 0%,#059669 100%)';
        const ieltsBadge = t.ielts
            ? `<span style="position:absolute;top:8px;left:8px;background:#3B82F6;color:#fff;font-size:10px;font-weight:700;padding:2px 7px;border-radius:10px;letter-spacing:0.5px;box-shadow:0 2px 8px rgba(59,130,246,0.4);">IELTS</span>`
            : '';
        return `
            <div class="vocab-topic-card" onclick="Router.navigate('/english/grammar/tense/${t.id}')">
                <div class="vocab-topic-card__cover" style="background:${grad};">
                    <span class="material-icons-round vocab-topic-card__cover-icon">${t.icon}</span>
                    ${ieltsBadge}
                </div>
                <div class="vocab-topic-card__body">
                    <div class="vocab-topic-card__name">${t.nameVi}</div>
                    <div class="vocab-topic-card__meta">${t.nameEn}</div>
                </div>
            </div>
        `;
    },

    // Render 1 nhóm cấu trúc: nhãn nhóm + grid các lesson card.
    _groupSection(g) {
        const lessons = (g.lessons || []);
        const cards = lessons.map(l => this._lessonCard(l)).join('');
        return `
            <div class="vocab-topic-header" style="margin-top:var(--spacing-lg);">
                <h2 class="vocab-topic-header__title">
                    <span class="material-icons-round" style="font-size:22px;margin-right:6px;">${g.icon}</span>
                    ${g.nameVi} (${g.nameEn})
                </h2>
            </div>
            <div class="vocab-category-grid">
                ${cards || '<p style="color:var(--color-text-muted);">Chưa có bài học nào.</p>'}
            </div>
        `;
    },

    _lessonCard(l) {
        const grad = 'linear-gradient(135deg,#10B981 0%,#059669 100%)';
        const ieltsBadge = l.ielts
            ? `<span style="position:absolute;top:8px;left:8px;background:#3B82F6;color:#fff;font-size:10px;font-weight:700;padding:2px 7px;border-radius:10px;letter-spacing:0.5px;box-shadow:0 2px 8px rgba(59,130,246,0.4);">IELTS</span>`
            : '';
        return `
            <div class="vocab-topic-card" onclick="Router.navigate('/english/grammar/lesson/${l.id}')">
                <div class="vocab-topic-card__cover" style="background:${grad};">
                    <span class="material-icons-round vocab-topic-card__cover-icon">${l.icon}</span>
                    ${ieltsBadge}
                </div>
                <div class="vocab-topic-card__body">
                    <div class="vocab-topic-card__name">${l.nameVi}</div>
                    <div class="vocab-topic-card__meta">${l.nameEn}</div>
                </div>
            </div>
        `;
    },

    async onEnter() {
        console.log('[GrammarPage] Entered');
        if (!Auth.isSignedIn()) {
            Router.navigate('/auth');
            return;
        }
    }
};


export default GrammarPage;
