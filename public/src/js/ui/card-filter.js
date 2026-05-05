// ============================================
// CardFilter - Component bộ lọc dùng chung cho danh sách thẻ từ vựng
// ============================================
// Các chiều lọc (đa lựa chọn trong mỗi chiều, OR trong-nhóm / AND giữa-nhóm):
//   1. partOfSpeech : Loại từ (noun, verb, adjective, adverb, ...)
//   2. level        : Cấp độ ghi nhớ
//                      - 'new'        : state = new
//                      - 'learning'   : state = learning
//                      - 'lv1'..'lv5' : review/relearning + stepIndex 0..4 (UI = stepIndex+1)
//                      - 'lv-unknown' : review/relearning nhưng chưa có stepIndex hợp lệ
//   3. special      : 'family'            - thẻ có familyId
//                     'irregular-verb'      - tag irregular-verb
//                     'irregular-comparative' - tag irregular-comparative
//                     'irregular-superlative' - tag irregular-superlative
//
// Dùng:
//   const state = CardFilter.createState();
//   CardFilter.mount('filter-root', { onChange: (s) => rerender() , state });
//   const filtered = CardFilter.apply(cards, state);

const CardFilter = {
    // Khai báo các option cho UI
    POS_OPTIONS: [
        { key: 'noun',          label: 'Danh từ',      icon: 'label' },
        { key: 'verb',          label: 'Động từ',      icon: 'directions_run' },
        { key: 'adjective',     label: 'Tính từ',      icon: 'palette' },
        { key: 'adverb',        label: 'Trạng từ',     icon: 'speed' },
        { key: 'preposition',   label: 'Giới từ',      icon: 'link' },
        { key: 'conjunction',   label: 'Liên từ',      icon: 'link' },
        { key: 'interjection',  label: 'Thán từ',      icon: 'campaign' },
        { key: 'pronoun',       label: 'Đại từ',       icon: 'person' },
        { key: 'determiner',    label: 'Từ hạn định',  icon: 'rule' },
        { key: 'idiom',         label: 'Thành ngữ',    icon: 'format_quote' },
        { key: 'phrasal verb',  label: 'Cụm động từ',  icon: 'merge_type' }
    ],

    LEVEL_OPTIONS: [
        { key: 'new',        label: 'Mới (chưa học)',    color: '#10b981', icon: 'fiber_new' },
        { key: 'learning',   label: 'Đang học',          color: '#f59e0b', icon: 'menu_book' },
        { key: 'lv1',        label: 'Cấp độ 1',          color: '#f59e0b', icon: 'looks_one' },
        { key: 'lv2',        label: 'Cấp độ 2',          color: '#10b981', icon: 'looks_two' },
        { key: 'lv3',        label: 'Cấp độ 3',          color: '#3b82f6', icon: 'looks_3' },
        { key: 'lv4',        label: 'Cấp độ 4',          color: '#8b5cf6', icon: 'looks_4' },
        { key: 'lv5',        label: 'Cấp độ 5',          color: '#ec4899', icon: 'looks_5' }
        // Ghi chú: không expose 'lv-unknown' — các thẻ chưa học đã có key 'new'.
        // Quy ước: mọi card review/relearning hợp lệ đều phải có stepIndex 0..4.
    ],

    SPECIAL_OPTIONS: [
        { key: 'family',               label: 'Family word',   icon: 'account_tree', color: '#6366f1' },
        { key: 'irregular-verb',          label: 'Động từ BQT',             icon: 'shuffle', color: '#8B5CF6' },
        { key: 'irregular-comparative',   label: 'Irregular Comparative',   icon: 'trending_up', color: '#F59E0B' },
        { key: 'irregular-superlative',   label: 'Irregular Superlative',   icon: 'emoji_events', color: '#EC4899' }
    ],

    /** Tạo state rỗng */
    createState() {
        return {
            partOfSpeech: new Set(),
            level: new Set(),
            special: new Set()
        };
    },

    /** State rỗng = không có filter nào đang bật */
    isEmpty(state) {
        return !state
            || (state.partOfSpeech.size === 0 && state.level.size === 0 && state.special.size === 0);
    },

    /**
     * Tính cấp độ của 1 card theo quy ước LEVEL_OPTIONS
     * Trả về 'new' | 'learning' | 'lv1'..'lv5' | 'lv-unknown' (review nhưng chưa có stepIndex)
     */
    getCardLevel(card) {
        const st = card.state;
        const isNew = (st === 'new' || (typeof FSRS !== 'undefined' && st === FSRS.State.NEW) || st === undefined);
        const isLearning = (st === 'learning' || (typeof FSRS !== 'undefined' && st === FSRS.State.LEARNING));
        const isReview = (st === 'review' || st === 'relearning'
            || (typeof FSRS !== 'undefined' && (st === FSRS.State.REVIEW || st === FSRS.State.RELEARNING)));

        if (isNew) return 'new';
        if (isLearning) return 'learning';
        if (isReview) {
            const idx = Number.isInteger(card.stepIndex) ? card.stepIndex : -1;
            if (idx >= 0 && idx <= 4) return `lv${idx + 1}`;
            return 'lv-unknown';
        }
        return 'lv-unknown';
    },

    /** Check card có khớp 1 special key */
    _matchSpecial(card, specialKey) {
        const fv = card.fieldValues || {};
        if (specialKey === 'family') {
            return !!fv.familyId;
        }
        // Các key irregular-* → dựa trên tags
        const tags = Array.isArray(fv.tags) ? fv.tags : [];
        return tags.includes(specialKey);
    },

    /**
     * Lọc danh sách thẻ theo state
     * OR trong-nhóm, AND giữa-nhóm
     */
    apply(cards, state) {
        if (!Array.isArray(cards)) return [];
        if (this.isEmpty(state)) return cards.slice();

        const posSet = state.partOfSpeech;
        const lvlSet = state.level;
        const spSet  = state.special;

        return cards.filter(c => {
            const fv = c.fieldValues || {};

            // partOfSpeech
            if (posSet.size > 0) {
                const pos = (fv.partOfSpeech || '').toLowerCase().trim();
                if (!pos || !posSet.has(pos)) return false;
            }

            // level
            if (lvlSet.size > 0) {
                const lv = this.getCardLevel(c);
                if (!lvlSet.has(lv)) return false;
            }

            // special (AND giữa các special → phải khớp mọi special được chọn)
            // Lưu ý: 1 card thường chỉ có 1 irregular-* tag + có/không familyId → AND hợp lý.
            // Nếu user chọn 2 tag irregular khác nhau sẽ không khớp → coi là không có kết quả.
            if (spSet.size > 0) {
                for (const sp of spSet) {
                    if (!this._matchSpecial(c, sp)) return false;
                }
            }

            return true;
        });
    },

    // ============================================
    // UI
    // ============================================
    _instances: {},

    /**
     * Gắn filter panel vào container
     * @param {string} containerId
     * @param {{ state?: Object, onChange: (state)=>void, collapsed?: boolean }} opts
     */
    mount(containerId, opts) {
        const container = document.getElementById(containerId);
        if (!container) return null;

        const state = opts?.state || this.createState();
        const instance = {
            containerId,
            state,
            onChange: opts?.onChange || (() => {}),
            collapsed: opts?.collapsed !== false   // mặc định đóng
        };
        this._instances[containerId] = instance;
        this._render(instance);
        this._bindEvents(instance);   // Bind 1 lần duy nhất lên container
        return instance;
    },

    /** Re-render UI cho instance */
    _render(instance) {
        const container = document.getElementById(instance.containerId);
        if (!container) return;

        const totalActive = instance.state.partOfSpeech.size
            + instance.state.level.size
            + instance.state.special.size;

        const chipRow = (options, group, colorFn) => options.map(opt => {
            const active = instance.state[group].has(opt.key);
            const color = colorFn ? colorFn(opt) : (opt.color || '#6366f1');
            const style = active
                ? `background:${color};color:#fff;border-color:${color};`
                : `color:${color};border-color:${color}55;`;
            return `
                <button type="button"
                        class="card-filter__chip ${active ? 'is-active' : ''}"
                        style="${style}"
                        data-group="${group}"
                        data-key="${this._esc(opt.key)}">
                    <span class="material-icons-round" style="font-size:15px;">${opt.icon}</span>
                    <span>${this._esc(opt.label)}</span>
                </button>
            `;
        }).join('');

        container.innerHTML = `
            <div class="card-filter ${instance.collapsed ? 'is-collapsed' : ''}">
                <div class="card-filter__head" data-action="toggle">
                    <span class="material-icons-round">filter_alt</span>
                    <span class="card-filter__title">Bộ lọc</span>
                    ${totalActive > 0
                        ? `<span class="card-filter__badge">${totalActive}</span>`
                        : ''}
                    <span class="card-filter__spacer"></span>
                    ${totalActive > 0
                        ? `<button type="button" class="card-filter__reset" data-action="reset">
                              <span class="material-icons-round" style="font-size:16px;">close</span> Xoá lọc
                           </button>`
                        : ''}
                    <span class="material-icons-round card-filter__caret">
                        ${instance.collapsed ? 'expand_more' : 'expand_less'}
                    </span>
                </div>
                <div class="card-filter__body">
                    <div class="card-filter__group">
                        <div class="card-filter__group-label">
                            <span class="material-icons-round" style="font-size:16px;">category</span>
                            Loại từ
                        </div>
                        <div class="card-filter__chips">${chipRow(this.POS_OPTIONS, 'partOfSpeech', () => '#3b82f6')}</div>
                    </div>
                    <div class="card-filter__group">
                        <div class="card-filter__group-label">
                            <span class="material-icons-round" style="font-size:16px;">timeline</span>
                            Cấp độ ghi nhớ
                        </div>
                        <div class="card-filter__chips">${chipRow(this.LEVEL_OPTIONS, 'level')}</div>
                    </div>
                    <div class="card-filter__group">
                        <div class="card-filter__group-label">
                            <span class="material-icons-round" style="font-size:16px;">auto_awesome</span>
                            Thuộc tính đặc biệt
                        </div>
                        <div class="card-filter__chips">${chipRow(this.SPECIAL_OPTIONS, 'special')}</div>
                    </div>
                </div>
            </div>
        `;

    },

    _bindEvents(instance) {
        const container = document.getElementById(instance.containerId);
        if (!container) return;

        container.addEventListener('click', (e) => {
            // toggle collapse
            const head = e.target.closest('[data-action="toggle"]');
            if (head && !e.target.closest('[data-action="reset"]')) {
                instance.collapsed = !instance.collapsed;
                this._render(instance);
                return;
            }
            // reset
            if (e.target.closest('[data-action="reset"]')) {
                e.stopPropagation();
                instance.state = this.createState();
                this._render(instance);
                instance.onChange(instance.state);
                return;
            }
            // toggle chip
            const chip = e.target.closest('.card-filter__chip');
            if (chip) {
                const group = chip.dataset.group;
                const key = chip.dataset.key;
                if (!instance.state[group]) return;
                if (instance.state[group].has(key)) instance.state[group].delete(key);
                else instance.state[group].add(key);
                this._render(instance);
                instance.onChange(instance.state);
            }
        }, { once: false });
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
