// ============================================
// Grammar Tense Detail Page - Chi tiết 1 thì
// ============================================
// Route: /english/grammar/tense/:id
// Render đồng bộ từ config tĩnh (GrammarTenses + GrammarTenseContent) — không cần fetch.

const GrammarTensePage = {
    render(params) {
        if (!Auth.isSignedIn()) {
            Router.navigate('/auth');
            return '<div class="page-enter"></div>';
        }

        const id = params && params.id;
        const tenses = (typeof GrammarTenses !== 'undefined') ? GrammarTenses : [];
        const tense = tenses.find(t => t.id === id);
        if (!tense) {
            return this._errorHtml();
        }

        const content = (typeof GrammarTenseContent !== 'undefined') ? GrammarTenseContent[id] : null;
        return this._pageHtml(tense, content);
    },

    async onEnter(params) {
        console.log('[GrammarTensePage] Entered:', params && params.id);
        if (!Auth.isSignedIn()) {
            Router.navigate('/auth');
        }
    },

    _pageHtml(tense, content) {
        const ieltsChip = tense.ielts
            ? `<span style="background:#3B82F6;color:#fff;font-size:11px;font-weight:700;padding:3px 9px;border-radius:10px;letter-spacing:0.5px;margin-left:8px;vertical-align:middle;">IELTS</span>`
            : '';

        const body = content
            ? `
                ${content.formula ? this._formulaBlock(content.formula) : ''}
                ${content.spelling ? this._spellingBlock(content.spelling) : ''}
                ${this._placeholderBlock('Cách dùng', 'lightbulb', 'Nội dung sẽ được cập nhật.')}
                ${this._placeholderBlock('Bài tập', 'quiz', 'Nội dung sẽ được cập nhật.')}
              `
            : `<div class="glass-card" style="padding:var(--spacing-xl);text-align:center;">
                    <span class="material-icons-round" style="font-size:48px;color:var(--color-text-muted);">construction</span>
                    <p style="color:var(--color-text-muted);margin-top:var(--spacing-sm);">Nội dung cho thì này sẽ sớm được cập nhật.</p>
               </div>`;

        return `
            <div class="grammar-tense-page page-enter">
                <!-- Back -->
                <button onclick="Router.navigate('/english/grammar')"
                        style="display:inline-flex;align-items:center;gap:6px;background:none;border:none;color:var(--color-text-muted);cursor:pointer;font-size:var(--font-size-sm);padding:4px 0;margin-bottom:var(--spacing-sm);">
                    <span class="material-icons-round" style="font-size:20px;">arrow_back</span>
                    Thì động từ
                </button>

                <!-- Header -->
                <div class="domain-header">
                    <div class="domain-header__info">
                        <div class="domain-header__icon-wrapper" style="background: linear-gradient(135deg, #10B981 0%, #059669 100%);">
                            <span class="material-icons-round" style="color:#fff;font-size:24px;">${tense.icon}</span>
                        </div>
                        <div>
                            <h2 class="domain-header__title">${tense.nameVi}${ieltsChip}</h2>
                            <p class="domain-header__subtitle">${tense.nameEn}</p>
                        </div>
                    </div>
                </div>

                ${body}
            </div>
        `;
    },

    // ---- Khối: Công thức ráp câu ----
    _formulaBlock(formula) {
        const groups = (formula.groups || []).map(g => this._formulaGroup(g)).join('');
        const contractions = (formula.contractions && formula.contractions.length)
            ? `<div style="margin-top:var(--spacing-md);font-size:var(--font-size-sm);color:var(--color-text-muted);">
                    <b style="color:var(--color-text);">Dạng viết tắt thường gặp:</b>
                    ${formula.contractions.map(c => `<code style="background:rgba(127,127,127,0.12);padding:2px 6px;border-radius:6px;margin:2px;display:inline-block;">${c}</code>`).join(' ')}
               </div>`
            : '';
        return `
            <div class="glass-card" style="padding:var(--spacing-lg);margin-bottom:var(--spacing-lg);">
                ${this._blockTitle('functions', 'Công thức ráp câu')}
                ${formula.note ? `<p style="color:var(--color-text-muted);font-size:var(--font-size-sm);margin:0 0 var(--spacing-md);">${formula.note}</p>` : ''}
                ${groups}
                ${contractions}
            </div>
        `;
    },

    _formulaGroup(g) {
        const sentRows = (g.sentences || []).map(s => `
            <tr>
                <td style="${this._td()};white-space:nowrap;font-weight:600;">${s.kind} <span style="color:var(--color-text-muted);">(${s.sign})</span></td>
                <td style="${this._td()}">${s.formula}</td>
                <td style="${this._td()};color:var(--color-text-muted);">${(s.examples || []).join('<br>')}</td>
            </tr>
        `).join('');

        const subj = g.subject ? `
            <div style="overflow-x:auto;margin-top:var(--spacing-sm);">
                <table style="${this._table()}">
                    <thead><tr>${g.subject.headers.map(h => `<th style="${this._th()}">${h}</th>`).join('')}</tr></thead>
                    <tbody>${g.subject.rows.map(r => `<tr>${r.map(c => `<td style="${this._td()}">${c}</td>`).join('')}</tr>`).join('')}</tbody>
                </table>
            </div>` : '';

        const note = g.note ? `<p style="font-size:var(--font-size-xs);color:var(--color-warning);margin:var(--spacing-sm) 0 0;"><span class="material-icons-round" style="font-size:14px;vertical-align:middle;">info</span> ${g.note}</p>` : '';

        return `
            <div style="margin-top:var(--spacing-md);">
                <h4 style="margin:0 0 var(--spacing-sm);font-size:var(--font-size-base);color:#10B981;">${g.label}${g.sub ? ` <span style="color:var(--color-text-muted);font-weight:400;font-size:var(--font-size-xs);">(${g.sub})</span>` : ''}</h4>
                <div style="overflow-x:auto;">
                    <table style="${this._table()}">
                        <thead><tr>
                            <th style="${this._th()}">Dạng câu</th>
                            <th style="${this._th()}">Công thức</th>
                            <th style="${this._th()}">Ví dụ</th>
                        </tr></thead>
                        <tbody>${sentRows}</tbody>
                    </table>
                </div>
                ${subj}
                ${note}
            </div>
        `;
    },

    // ---- Khối: Mẹo thêm -s/-es ----
    _spellingBlock(sp) {
        const rows = (sp.rows || []).map((r, i) => `
            <tr>
                <td style="${this._td()};text-align:center;color:var(--color-text-muted);">${i + 1}</td>
                <td style="${this._td()}">${r.case}</td>
                <td style="${this._td()};font-weight:600;color:#10B981;white-space:nowrap;">${r.rule}</td>
                <td style="${this._td()};color:var(--color-text-muted);">${r.example}</td>
            </tr>
        `).join('');

        const mnemonics = (sp.mnemonics || []).map(m => `
            <div style="background:rgba(16,185,129,0.08);border-left:3px solid #10B981;border-radius:8px;padding:var(--spacing-sm) var(--spacing-md);margin-top:var(--spacing-sm);">
                <b style="font-size:var(--font-size-sm);">${m.title}</b>
                <p style="margin:4px 0 0;font-size:var(--font-size-sm);color:var(--color-text-muted);">${m.text}</p>
            </div>
        `).join('');

        return `
            <div class="glass-card" style="padding:var(--spacing-lg);margin-bottom:var(--spacing-lg);">
                ${this._blockTitle('spellcheck', 'Mẹo thêm -s / -es (ngôi thứ 3 số ít)')}
                ${sp.intro ? `<p style="color:var(--color-text-muted);font-size:var(--font-size-sm);margin:0 0 var(--spacing-md);">${sp.intro}</p>` : ''}
                <div style="overflow-x:auto;">
                    <table style="${this._table()}">
                        <thead><tr>
                            <th style="${this._th()};width:36px;">#</th>
                            <th style="${this._th()}">Trường hợp (đuôi động từ)</th>
                            <th style="${this._th()}">Quy tắc</th>
                            <th style="${this._th()}">Ví dụ</th>
                        </tr></thead>
                        <tbody>${rows}</tbody>
                    </table>
                </div>
                ${mnemonics}
            </div>
        `;
    },

    _placeholderBlock(title, icon, text) {
        return `
            <div class="glass-card" style="padding:var(--spacing-lg);margin-bottom:var(--spacing-lg);opacity:0.7;">
                ${this._blockTitle(icon, title)}
                <p style="color:var(--color-text-muted);font-size:var(--font-size-sm);margin:var(--spacing-sm) 0 0;">
                    <span class="material-icons-round" style="font-size:16px;vertical-align:middle;">schedule</span> ${text}
                </p>
            </div>
        `;
    },

    _blockTitle(icon, label) {
        return `<h3 style="display:flex;align-items:center;gap:8px;margin:0;font-size:var(--font-size-lg);">
                    <span class="material-icons-round" style="font-size:22px;color:#10B981;">${icon}</span>${label}
                </h3>`;
    },

    // Inline style helpers (table)
    _table() { return 'width:100%;border-collapse:collapse;font-size:var(--font-size-sm);'; },
    _th() { return 'text-align:left;padding:8px 10px;border-bottom:2px solid var(--color-border);color:var(--color-text-muted);font-weight:600;font-size:var(--font-size-xs);white-space:nowrap;'; },
    _td() { return 'padding:8px 10px;border-bottom:1px solid var(--color-border);vertical-align:top;'; },

    _errorHtml() {
        return `
            <div class="grammar-tense-page page-enter">
                <button onclick="Router.navigate('/english/grammar')"
                        style="display:inline-flex;align-items:center;gap:6px;background:none;border:none;color:var(--color-text-muted);cursor:pointer;font-size:var(--font-size-sm);padding:4px 0;margin-bottom:var(--spacing-sm);">
                    <span class="material-icons-round" style="font-size:20px;">arrow_back</span>
                    Thì động từ
                </button>
                <div class="glass-card" style="padding:var(--spacing-xl);text-align:center;">
                    <span class="material-icons-round" style="font-size:48px;color:var(--color-warning);">error_outline</span>
                    <p style="color:var(--color-text-muted);margin-top:var(--spacing-sm);">Không tìm thấy thì này.</p>
                </div>
            </div>
        `;
    }
};


export default GrammarTensePage;
