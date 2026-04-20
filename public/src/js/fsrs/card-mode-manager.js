// ============================================
// Card Mode Manager
// ============================================
// Cho phép user chuyển trạng thái SRS của thẻ:
//   - Về "học mới" (NEW): xoá tiến trình SRS, học lại từ đầu
//   - Sang "ôn tập" ở bậc cụ thể (0..4): bỏ giai đoạn học, xếp ngay vào lịch ôn
//
// Tất cả đều có modal xác nhận rõ ràng. Thao tác bulk yêu cầu user gõ "XAC NHAN".

const CardModeManager = {

    // ======================================================
    // APIs gọi trực tiếp (không có modal)
    // ======================================================

    /**
     * Đặt các thẻ về trạng thái NEW (học mới).
     * @param {Array<Object>} cards  - đầy đủ object card (cần có id)
     * @param {Object} [opts]
     * @param {boolean} [opts.resetStats=false] - có reset reps/lapses/difficulty không
     */
    async resetToNew(cards, opts = {}) {
        const resetStats = !!opts.resetStats;
        const now = new Date();

        const ids = [];
        const updates = cards.map(card => {
            const u = {
                state: FSRS.State.NEW,
                stepIndex: -1,
                stability: 0,
                dueDate: now
            };
            if (resetStats) {
                u.reps = 0;
                u.lapses = 0;
                u.difficulty = 0;
                u.lastReview = null;
                u.lastReviewSession = null;
            }
            ids.push(card.id);
            return { id: card.id, data: u };
        });

        await this._bulkUpdate(updates);

        // Xoá family progress liên quan (nếu có) để flow family word hoạt động lại
        try {
            if (typeof FamilyWordManager !== 'undefined' && FamilyWordManager.removeWords) {
                const words = cards.map(c => c.fieldValues?.word).filter(Boolean);
                if (words.length) FamilyWordManager.removeWords(words);
            }
        } catch (e) {
            console.warn('[CardModeManager] FamilyWordManager cleanup skipped:', e);
        }

        return ids.length;
    },

    /**
     * Đặt các thẻ sang REVIEW ở bậc stepIndex cụ thể.
     * @param {Array<Object>} cards
     * @param {number} stepIndex - 0..4 (tương ứng Steps: 30ph/24h/7d/30d/90d)
     */
    async setReviewAtStep(cards, stepIndex) {
        const lastIdx = FSRS.Steps.length - 1;
        const idx = Math.max(0, Math.min(lastIdx, Number(stepIndex) || 0));
        const minutes = FSRS.Steps[idx];
        const now = new Date();
        const due = new Date(now.getTime() + minutes * 60 * 1000);

        const updates = cards.map(card => ({
            id: card.id,
            data: {
                state: FSRS.State.REVIEW,
                stepIndex: idx,
                stability: minutes,
                dueDate: due,
                lastReview: now
            }
        }));

        await this._bulkUpdate(updates);
        return updates.length;
    },

    /** Batch update helper (dùng Firestore batch) */
    async _bulkUpdate(updates) {
        if (!updates.length) return;
        const userId = Auth.getUserId();
        if (!userId) throw new Error('Chưa đăng nhập');

        const BATCH = 400;
        for (let i = 0; i < updates.length; i += BATCH) {
            const slice = updates.slice(i, i + BATCH);
            const batch = db.batch();
            slice.forEach(u => {
                const ref = db.collection('users').doc(userId)
                    .collection('cards').doc(u.id);
                batch.update(ref, u.data);
            });
            await batch.commit();
        }
    },

    // ======================================================
    // UI: Modal chọn chế độ + xác nhận
    // ======================================================

    /**
     * Mở modal cho user chọn đổi mode.
     * @param {Array<Object>} cards - các thẻ muốn đổi (1 hoặc nhiều)
     * @param {Object} [opts]
     * @param {string} [opts.scopeLabel] - mô tả phạm vi (vd "3 từ đã chọn", "toàn bộ chủ đề")
     * @param {Function} [opts.onDone] - callback sau khi apply thành công
     */
    openModal(cards, opts = {}) {
        if (!cards || !cards.length) {
            if (typeof Toast !== 'undefined' && Toast.show) {
                Toast.show({ type: 'warning', title: 'Không có thẻ', message: 'Chưa chọn thẻ nào để đổi chế độ.' });
            }
            return;
        }
        const scopeLabel = opts.scopeLabel || `${cards.length} thẻ`;
        const isBulk = cards.length > 1;

        // Thống kê trạng thái hiện tại
        let newCount = 0, reviewCount = 0;
        cards.forEach(c => {
            if (c.state === FSRS.State.NEW || c.state === 'new' || c.state === undefined) newCount++;
            else reviewCount++;
        });

        const modal = document.createElement('div');
        modal.className = 'lf-mode-modal-overlay';
        modal.innerHTML = `
          <div class="lf-mode-modal glass-panel">
            <div class="lf-mode-modal__header">
              <span class="material-icons-round" style="color:var(--color-primary);">swap_horiz</span>
              <h3>Đổi chế độ học / ôn tập</h3>
              <button class="lf-mode-modal__close" data-act="close" aria-label="Đóng">
                <span class="material-icons-round">close</span>
              </button>
            </div>
            <div class="lf-mode-modal__body">
              <p class="lf-mode-modal__scope">
                Phạm vi: <strong>${this._esc(scopeLabel)}</strong>
                <span class="lf-mode-modal__stats">
                  (Đang học mới: <strong>${newCount}</strong> · Đang ôn tập: <strong>${reviewCount}</strong>)
                </span>
              </p>

              <div class="lf-mode-modal__options">
                <!-- Option 1: Reset về học mới -->
                <button class="lf-mode-option" data-act="reset-new">
                  <span class="lf-mode-option__icon" style="background:rgba(139,92,246,0.15);color:#a78bfa;">
                    <span class="material-icons-round">school</span>
                  </span>
                  <div class="lf-mode-option__info">
                    <div class="lf-mode-option__title">Chuyển về "Học mới"</div>
                    <div class="lf-mode-option__desc">
                      Xoá tiến trình ôn tập, thẻ sẽ xuất hiện trong danh sách học mới.
                    </div>
                  </div>
                  <span class="material-icons-round lf-mode-option__arrow">chevron_right</span>
                </button>

                <!-- Option 2: Chuyển sang ôn tập với step cụ thể -->
                <div class="lf-mode-option-group">
                  <div class="lf-mode-option-group__title">
                    <span class="material-icons-round" style="color:#10b981;">replay</span>
                    Chuyển sang "Ôn tập" ở bậc
                  </div>
                  <div class="lf-mode-option-group__steps">
                    ${FSRS.Steps.map((m, i) => `
                      <button class="lf-mode-step-btn" data-act="to-review" data-step="${i}">
                        <div class="lf-mode-step-btn__idx">Cấp độ ${i + 1}</div>
                        <div class="lf-mode-step-btn__lbl">${FSRS.getStepLabel(i)}</div>
                      </button>
                    `).join('')}
                  </div>
                  <div class="lf-mode-option-group__note">
                    Cấp độ 1 = ôn ngay sau 30 phút · Cấp độ 5 = cần ôn lại sau 90 ngày
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;

        document.body.appendChild(modal);
        requestAnimationFrame(() => modal.classList.add('is-open'));

        const close = () => {
            modal.classList.remove('is-open');
            setTimeout(() => modal.remove(), 200);
        };

        modal.addEventListener('click', async (e) => {
            const btn = e.target.closest('[data-act]');
            if (!btn) {
                if (e.target === modal) close();
                return;
            }
            const act = btn.dataset.act;

            if (act === 'close') return close();

            if (act === 'reset-new') {
                const ok = await this._confirm({
                    title: 'Chuyển về "Học mới"?',
                    icon: 'school',
                    iconColor: '#a78bfa',
                    message: `Sẽ xoá tiến trình ôn tập của <strong>${scopeLabel}</strong>.
                              Các thẻ sẽ xuất hiện lại trong danh sách "Học mới" và bạn phải học lại từ đầu.`,
                    requireText: isBulk ? 'XAC NHAN' : null,
                    danger: true
                });
                if (!ok) return;
                try {
                    const n = await this.resetToNew(cards);
                    Toast.success && Toast.success('Đã đổi chế độ', `${n} thẻ đã chuyển về "Học mới".`);
                    close();
                    opts.onDone && opts.onDone();
                } catch (err) {
                    console.error('[CardModeManager] resetToNew error:', err);
                    Toast.error && Toast.error('Lỗi', 'Không thể cập nhật thẻ.');
                }
                return;
            }

            if (act === 'to-review') {
                const stepIdx = Number(btn.dataset.step);
                const stepLabel = FSRS.getStepLabel(stepIdx);
                const ok = await this._confirm({
                    title: `Chuyển sang ôn tập ở Cấp độ ${stepIdx + 1}?`,
                    icon: 'replay',
                    iconColor: '#10b981',
                    message: `<strong>${scopeLabel}</strong> sẽ được đặt vào chế độ ôn tập.
                              Lần ôn kế tiếp: <strong>sau ${stepLabel}</strong> kể từ bây giờ.
                              <br><br>Lưu ý: các thẻ đang ở "Học mới" sẽ <em>bỏ qua</em> giai đoạn học.`,
                    requireText: isBulk ? 'XAC NHAN' : null,
                    danger: false
                });
                if (!ok) return;
                try {
                    const n = await this.setReviewAtStep(cards, stepIdx);
                    Toast.success && Toast.success('Đã đổi chế độ',
                        `${n} thẻ đã chuyển sang ôn tập (Cấp độ ${stepIdx + 1} · ${stepLabel}).`);
                    close();
                    opts.onDone && opts.onDone();
                } catch (err) {
                    console.error('[CardModeManager] setReviewAtStep error:', err);
                    Toast.error && Toast.error('Lỗi', 'Không thể cập nhật thẻ.');
                }
                return;
            }
        });
    },

    /**
     * Modal xác nhận cuối. Nếu `requireText` được cung cấp, user phải gõ đúng chuỗi đó.
     * @returns {Promise<boolean>}
     */
    _confirm({ title, message, icon = 'warning', iconColor = '#f59e0b', requireText = null, danger = false }) {
        return new Promise(resolve => {
            const el = document.createElement('div');
            el.className = 'lf-confirm-overlay';
            el.innerHTML = `
              <div class="lf-confirm glass-panel ${danger ? 'is-danger' : ''}">
                <div class="lf-confirm__head">
                  <span class="material-icons-round" style="color:${iconColor};font-size:32px;">${icon}</span>
                  <h4>${this._esc(title)}</h4>
                </div>
                <div class="lf-confirm__body">
                  <p>${message}</p>
                  ${requireText ? `
                    <label class="lf-confirm__require">
                      Gõ <code>${this._esc(requireText)}</code> để xác nhận:
                      <input type="text" class="lf-confirm__input" autocomplete="off" spellcheck="false" />
                    </label>
                  ` : ''}
                </div>
                <div class="lf-confirm__actions">
                  <button class="lf-confirm__btn lf-confirm__btn--cancel" data-act="cancel">Huỷ</button>
                  <button class="lf-confirm__btn lf-confirm__btn--ok ${danger ? 'is-danger' : ''}"
                          data-act="ok" ${requireText ? 'disabled' : ''}>
                    Xác nhận
                  </button>
                </div>
              </div>
            `;
            document.body.appendChild(el);
            requestAnimationFrame(() => el.classList.add('is-open'));

            const okBtn = el.querySelector('[data-act="ok"]');
            const input = el.querySelector('.lf-confirm__input');
            if (input && requireText) {
                input.addEventListener('input', () => {
                    okBtn.disabled = input.value.trim() !== requireText;
                });
                setTimeout(() => input.focus(), 50);
            }

            const finish = (val) => {
                el.classList.remove('is-open');
                setTimeout(() => el.remove(), 180);
                resolve(val);
            };

            el.addEventListener('click', (e) => {
                const b = e.target.closest('[data-act]');
                if (!b) { if (e.target === el) finish(false); return; }
                if (b.dataset.act === 'cancel') return finish(false);
                if (b.dataset.act === 'ok') {
                    if (requireText && input.value.trim() !== requireText) return;
                    finish(true);
                }
            });
        });
    },

    _esc(str) {
        if (str == null) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
};
