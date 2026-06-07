// ============================================
// Grammar Lesson Detail Page - Chi tiết 1 bài học ngữ pháp
// ============================================
// Route: /english/grammar/lesson/:id
// Song song với grammar-tense.js (dành cho nhóm "Thì động từ").
// Render đồng bộ từ config tĩnh (GrammarGroups + GrammarLessonContent) — không cần fetch.
// Tái dùng y hệt cấu trúc khối: Cách dùng (usage) → Công thức (formula) → Bài tập (exercises).

const GrammarLessonPage = {
    render(params) {
        if (!Auth.isSignedIn()) {
            Router.navigate('/auth');
            return '<div class="page-enter"></div>';
        }

        const id = params && params.id;
        this._currentLessonId = id; // lưu để exercise logic dùng

        const lookup = (typeof getGrammarLesson === 'function') ? getGrammarLesson(id) : null;
        if (!lookup) {
            return this._errorHtml();
        }

        const content = (typeof GrammarLessonContent !== 'undefined') ? GrammarLessonContent[id] : null;
        return this._pageHtml(lookup.group, lookup.lesson, content);
    },

    async onEnter(params) {
        console.log('[GrammarLessonPage] Entered:', params && params.id);
        if (!Auth.isSignedIn()) {
            Router.navigate('/auth');
        }
    },

    _pageHtml(group, lesson, content) {
        const ieltsChip = lesson.ielts
            ? `<span style="background:#3B82F6;color:#fff;font-size:11px;font-weight:700;padding:3px 9px;border-radius:10px;letter-spacing:0.5px;margin-left:8px;vertical-align:middle;">IELTS</span>`
            : '';

        const body = content
            ? `
                ${content.usage ? this._usageBlock(content.usage) : ''}
                ${content.formula ? this._formulaBlock(content.formula) : ''}
                ${content.spelling ? this._spellingBlock(content.spelling) : ''}
                ${content.exercises && content.exercises.length ? this._exerciseBlock(content.exercises) : this._placeholderBlock('Bài tập', 'quiz', 'Nội dung sẽ được cập nhật.')}
              `
            : `<div class="glass-card" style="padding:var(--spacing-xl);text-align:center;">
                    <span class="material-icons-round" style="font-size:48px;color:var(--color-text-muted);">construction</span>
                    <p style="color:var(--color-text-muted);margin-top:var(--spacing-sm);">Nội dung cho bài học này sẽ sớm được cập nhật.</p>
               </div>`;

        return `
            <div class="grammar-tense-page page-enter">
                <!-- Back -->
                <button onclick="Router.navigate('/english/grammar')"
                        style="display:inline-flex;align-items:center;gap:6px;background:none;border:none;color:var(--color-text-muted);cursor:pointer;font-size:var(--font-size-sm);padding:4px 0;margin-bottom:var(--spacing-sm);">
                    <span class="material-icons-round" style="font-size:20px;">arrow_back</span>
                    ${group.nameVi}
                </button>

                <!-- Header -->
                <div class="domain-header">
                    <div class="domain-header__info">
                        <div class="domain-header__icon-wrapper" style="background: linear-gradient(135deg, #10B981 0%, #059669 100%);">
                            <span class="material-icons-round" style="color:#fff;font-size:24px;">${lesson.icon || group.icon}</span>
                        </div>
                        <div>
                            <h2 class="domain-header__title">${lesson.nameVi}${ieltsChip}</h2>
                            <p class="domain-header__subtitle">${lesson.nameEn} · ${group.nameVi}</p>
                        </div>
                    </div>
                </div>

                ${body}
            </div>
        `;
    },

    // ---- Khối: Cách dùng ----
    _usageBlock(usage) {
        const items = (usage.items || []).map(item => `
            <div style="display:flex;gap:10px;align-items:flex-start;margin-bottom:var(--spacing-md);">
                <span class="material-icons-round" style="font-size:20px;color:#10B981;margin-top:2px;">${item.icon}</span>
                <div>
                    <b style="font-size:var(--font-size-sm);">${item.title}</b>
                    <div style="margin-top:4px;font-size:var(--font-size-sm);color:var(--color-text-muted);">
                        ${(item.examples || []).map(ex => `<div style="margin-top:2px;">• ${ex}</div>`).join('')}
                    </div>
                </div>
            </div>
        `).join('');

        const signalWords = usage.signalWords
            ? `<div style="margin-top:var(--spacing-md);padding:var(--spacing-sm) var(--spacing-md);background:rgba(59,130,246,0.06);border-radius:10px;border-left:3px solid #3B82F6;">
                    <b style="font-size:var(--font-size-sm);color:#3B82F6;">${usage.signalWords.label}</b>
                    <div style="margin-top:6px;display:flex;flex-wrap:wrap;gap:6px;">
                        ${(usage.signalWords.words || []).map(w => `<code style="background:rgba(127,127,127,0.12);padding:2px 8px;border-radius:6px;font-size:var(--font-size-xs);">${w}</code>`).join('')}
                    </div>
               </div>`
            : '';

        return `
            <div class="glass-card" style="padding:var(--spacing-lg);margin-bottom:var(--spacing-lg);">
                ${this._blockTitle('lightbulb', 'Cách dùng')}
                ${usage.intro ? `<p style="color:var(--color-text-muted);font-size:var(--font-size-sm);margin:var(--spacing-xs) 0 var(--spacing-md);">${usage.intro}</p>` : ''}
                ${items}
                ${signalWords}
            </div>
        `;
    },

    // ---- Khối: Công thức ----
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
                ${this._blockTitle('functions', 'Công thức')}
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

    // ---- Khối: Mẹo chính tả (optional) ----
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
                ${this._blockTitle('spellcheck', 'Mẹo chính tả')}
                ${sp.intro ? `<p style="color:var(--color-text-muted);font-size:var(--font-size-sm);margin:0 0 var(--spacing-md);">${sp.intro}</p>` : ''}
                <div style="overflow-x:auto;">
                    <table style="${this._table()}">
                        <thead><tr>
                            <th style="${this._th()};width:36px;">#</th>
                            <th style="${this._th()}">Trường hợp</th>
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

    // ---- Khối: Bài tập (fill-in-the-blank) ----
    _exerciseBlock(exercises) {
        const items = exercises.map((ex, i) => `
            <div class="grammar-exercise-item" id="ex-item-${ex.id}" style="padding:var(--spacing-md);border-bottom:1px solid var(--color-border);">
                <div style="display:flex;align-items:flex-start;gap:10px;">
                    <span style="min-width:24px;height:24px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:var(--color-primary);color:#fff;font-size:12px;font-weight:700;">${i + 1}</span>
                    <div style="flex:1;">
                        <div style="display:flex;align-items:center;flex-wrap:wrap;gap:6px;font-size:var(--font-size-sm);">
                            ${this._renderSentenceWithBlank(ex)}
                        </div>
                        <div style="margin-top:6px;display:flex;align-items:center;gap:8px;">
                            <span style="font-size:var(--font-size-xs);color:var(--color-text-muted);background:rgba(127,127,127,0.1);padding:2px 8px;border-radius:6px;">${ex.hint} · ${ex.kind}</span>
                            <button onclick="GrammarLessonPage.checkSingle(${ex.id})"
                                    style="font-size:var(--font-size-xs);padding:4px 12px;border:none;border-radius:6px;background:var(--color-primary);color:#fff;cursor:pointer;font-weight:600;">
                                Kiểm tra
                            </button>
                            <span id="ex-feedback-${ex.id}" style="font-size:var(--font-size-xs);font-weight:600;"></span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        return `
            <div class="glass-card" style="padding:0;margin-bottom:var(--spacing-lg);overflow:hidden;">
                <div style="padding:var(--spacing-lg);border-bottom:1px solid var(--color-border);">
                    ${this._blockTitle('quiz', 'Bài tập')}
                    <p style="color:var(--color-text-muted);font-size:var(--font-size-sm);margin:var(--spacing-xs) 0 0;">Điền từ thích hợp vào chỗ trống. Nhấn "Kiểm tra" để xem kết quả từng câu, hoặc "Nộp tất cả" ở cuối.</p>
                </div>
                ${items}
                <div style="padding:var(--spacing-lg);display:flex;align-items:center;gap:var(--spacing-md);flex-wrap:wrap;">
                    <button onclick="GrammarLessonPage.checkAll()"
                            style="padding:10px 24px;border:none;border-radius:10px;background:linear-gradient(135deg,#10B981 0%,#059669 100%);color:#fff;font-size:var(--font-size-sm);font-weight:700;cursor:pointer;box-shadow:0 4px 12px rgba(16,185,129,0.3);">
                        <span class="material-icons-round" style="font-size:16px;vertical-align:middle;margin-right:4px;">done_all</span>Nộp tất cả
                    </button>
                    <span id="ex-summary" style="font-size:var(--font-size-sm);font-weight:600;"></span>
                </div>
            </div>
        `;
    },

    _renderSentenceWithBlank(ex) {
        // Hỗ trợ nhiều ô trống trong cùng một câu. Mỗi ô trống = 1 input riêng;
        // khi kiểm tra sẽ nối các input lại theo thứ tự.
        const parts = ex.sentence.split('___');
        if (parts.length < 2) return `<span>${ex.sentence}</span>`;

        const inputStyle = 'min-width:90px;width:120px;padding:4px 8px;border:2px solid var(--color-border);border-radius:8px;font-size:var(--font-size-sm);text-align:center;background:var(--color-surface);color:var(--color-text);outline:none;transition:border-color 0.2s;';

        return parts.map((part, index) => {
            const text = part ? `<span>${part}</span>` : '';
            if (index === parts.length - 1) return text;

            return `${text}<input id="ex-input-${ex.id}-${index}" data-exercise-id="${ex.id}" type="text" autocomplete="off" spellcheck="false"
                        style="${inputStyle}"
                        onfocus="this.style.borderColor='var(--color-primary)'" onblur="this.style.borderColor='var(--color-border)'"
                    />`;
        }).join('');
    },

    // --- Exercise logic ---
    _getExercises() {
        const id = this._currentLessonId;
        const content = (typeof GrammarLessonContent !== 'undefined') ? GrammarLessonContent[id] : null;
        return content && content.exercises ? content.exercises : [];
    },

    _getExerciseInputs(id) {
        return Array.from(document.querySelectorAll(`[data-exercise-id="${id}"]`));
    },

    _getExerciseUserAnswer(id) {
        return this._getExerciseInputs(id)
            .map(input => input.value.trim())
            .filter(Boolean)
            .join(' ');
    },

    _hasCompletedExerciseInputs(id) {
        const inputs = this._getExerciseInputs(id);
        return inputs.length > 0 && inputs.every(input => input.value.trim());
    },

    _normalizeAnswer(value) {
        return String(value || '').trim().replace(/\s+/g, ' ').toLowerCase();
    },

    _setExerciseResult(id, correct, answer) {
        const inputs = this._getExerciseInputs(id);
        const feedback = document.getElementById(`ex-feedback-${id}`);
        if (!inputs.length || !feedback) return;

        inputs.forEach(input => {
            input.style.borderColor = correct ? '#10B981' : '#EF4444';
            input.style.background = correct ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)';
        });
        feedback.textContent = correct ? '✓ Đúng' : `✗ Sai — đáp án: ${answer}`;
        feedback.style.color = correct ? '#10B981' : '#EF4444';
    },

    checkSingle(id) {
        const exercises = this._getExercises();
        const ex = exercises.find(e => e.id === id);
        if (!ex) return;

        const userAnswer = this._getExerciseUserAnswer(id);
        const correct = this._hasCompletedExerciseInputs(id)
            && this._normalizeAnswer(userAnswer) === this._normalizeAnswer(ex.answer);

        this._setExerciseResult(id, correct, ex.answer);
    },

    checkAll() {
        const exercises = this._getExercises();
        let correctCount = 0;
        exercises.forEach(ex => {
            const userAnswer = this._getExerciseUserAnswer(ex.id);
            const correct = this._hasCompletedExerciseInputs(ex.id)
                && this._normalizeAnswer(userAnswer) === this._normalizeAnswer(ex.answer);

            this._setExerciseResult(ex.id, correct, ex.answer);
            if (correct) correctCount++;
        });

        const summary = document.getElementById('ex-summary');
        if (summary) {
            summary.textContent = `Kết quả: ${correctCount}/${exercises.length} câu đúng`;
            summary.style.color = correctCount === exercises.length ? '#10B981' : (correctCount >= exercises.length / 2 ? '#F59E0B' : '#EF4444');
        }
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
                    Ngữ pháp
                </button>
                <div class="glass-card" style="padding:var(--spacing-xl);text-align:center;">
                    <span class="material-icons-round" style="font-size:48px;color:var(--color-warning);">error_outline</span>
                    <p style="color:var(--color-text-muted);margin-top:var(--spacing-sm);">Không tìm thấy bài học này.</p>
                </div>
            </div>
        `;
    }
};


export default GrammarLessonPage;
