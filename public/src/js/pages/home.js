// ============================================
// Home Page - Dashboard with Study/Review + Stats
// ============================================

const HomePage = {
    _cachedHtml: null,

    render() {
        if (this._cachedHtml && this._cachedStreak
            && (Date.now() - this._lastLoadTime) < this._CACHE_TTL_MS) {
            return this._cachedHtml;
        }
        return this._renderFresh();
    },

    _renderFresh() {
        const isSignedIn = Auth.isSignedIn();

        if (!isSignedIn) {
            // Chưa đăng nhập → redirect thẳng tới trang auth, không hiển thị home
            Router.navigate('/auth');
            return '<div class="page-enter"></div>';
        }

        return `
            <div class="home-page page-enter">
                <!-- Welcome -->
                <div class="home-welcome">
                    <h2>Chào mừng trở lại! 👋</h2>
                </div>

                <!-- Streak & Practice Time -->
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--spacing-lg);margin-bottom:var(--spacing-lg);">
                    <!-- Streak -->
                    <div class="glass-card" style="display:flex;align-items:center;gap:var(--spacing-md);padding:var(--spacing-lg);">
                        <div style="width:48px;height:48px;border-radius:var(--radius-lg);background:rgba(239,68,68,0.15);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                            <span class="material-icons-round" style="font-size:28px;color:#EF4444;">local_fire_department</span>
                        </div>
                        <div>
                            <div style="display:flex;align-items:baseline;gap:var(--spacing-xs);">
                                <span id="dashboard-streak" style="font-size:var(--font-size-2xl);font-weight:700;color:var(--color-text);">0</span>
                                <span style="font-size:var(--font-size-sm);color:var(--color-text-secondary);">ngày</span>
                            </div>
                            <p style="margin:0;font-size:var(--font-size-xs);color:var(--color-text-muted);">Chuỗi hiện tại</p>
                        </div>
                    </div>

                    <!-- Practice Time -->
                    <div class="glass-card" style="display:flex;align-items:center;gap:var(--spacing-md);padding:var(--spacing-lg);">
                        <div style="width:48px;height:48px;border-radius:var(--radius-lg);background:rgba(59,130,246,0.15);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                            <span class="material-icons-round" style="font-size:28px;color:#3B82F6;">schedule</span>
                        </div>
                        <div>
                            <div id="dashboard-practice-time" style="display:flex;align-items:baseline;gap:var(--spacing-xs);">
                                <span style="font-size:var(--font-size-2xl);font-weight:700;color:var(--color-text);">0h 0m</span>
                            </div>
                            <p style="margin:0;font-size:var(--font-size-xs);color:var(--color-text-muted);">Thời gian luyện tập</p>
                        </div>
                    </div>
                </div>

                <!-- GitHub-style Heatmap with Year Selector -->
                <div class="glass-card" style="padding:var(--spacing-lg);">
                    <div id="heatmap-header" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--spacing-md);">
                        <span id="heatmap-summary" style="font-size:var(--font-size-sm);font-weight:600;color:var(--color-text);"></span>
                    </div>
                    <div style="display:flex;gap:var(--spacing-md);">
                        <div id="dashboard-chart" style="position:relative;overflow-x:auto;flex:1;"></div>
                        <div id="heatmap-years" style="display:flex;flex-direction:column;gap:4px;flex-shrink:0;"></div>
                    </div>
                </div>
            </div>
        `;
    },

    // Cache TTL: 60 giây cho dashboard data
    _CACHE_TTL_MS: 60000,
    _lastLoadTime: 0,
    _cachedStreak: null,
    _selectedYear: new Date().getFullYear(),

    async onEnter() {
        console.log('[HomePage] Entered - Dashboard');
        if (!Auth.isSignedIn()) return;

        const now = Date.now();
        if (this._cachedStreak && (now - this._lastLoadTime) < this._CACHE_TTL_MS) {
            // DOM đã restore từ cache → background refresh
            this._loadStudyChart().then(() => this._saveHtmlCache()).catch(() => {});
            return;
        }

        await this._loadStudyChart();
        this._saveHtmlCache();
    },

    _saveHtmlCache() {
        const container = document.getElementById('main-content');
        if (container) {
            this._cachedHtml = container.innerHTML;
        }
    },

    /**
     * Load study chart, streak, practice time
     * @private
     */
    /**
     * Render streak/practice data từ cache (không cần await Firestore).
     */
    _renderStreakData(streakInfo) {
        const streakEl = document.getElementById('dashboard-streak');
        if (streakEl) streakEl.textContent = streakInfo.streak;

        const practiceEl = document.getElementById('dashboard-practice-time');
        if (practiceEl) {
            const hours = Math.floor(streakInfo.totalMinutesToday / 60);
            const mins = streakInfo.totalMinutesToday % 60;
            practiceEl.innerHTML = `<span style="font-size:var(--font-size-2xl);font-weight:700;color:var(--color-text);">${hours}h ${mins}m</span>`;
        }
    },

    async _loadStudyChart() {
        try {
            // Get streak info
            const streakInfo = await FirestoreDB.getStreakInfo();
            this._cachedStreak = streakInfo;
            this._lastLoadTime = Date.now();
            this._renderStreakData(streakInfo);

            // Load heatmap for selected year
            await this._loadHeatmapForYear(this._selectedYear);

        } catch (error) {
            console.error('[HomePage] Error loading study chart:', error);
        }
    },

    async _loadHeatmapForYear(year) {
        const sessions = await FirestoreDB.getStudySessionsByYear(year);
        const sessionMap = {};
        sessions.forEach(s => { sessionMap[s.date] = s.minutes || 0; });

        this._renderHeatmap(sessionMap, year);
        this._renderYearSelector(year);
    },

    /**
     * Render GitHub-style contribution heatmap
     * Uses pink/magenta palette with varying intensity
     * @private
     */
    _renderHeatmap(sessionMap, year) {
        const container = document.getElementById('dashboard-chart');
        if (!container) return;

        const today = new Date();
        const currentYear = today.getFullYear();
        const cellSize = 11;
        const cellGap = 2;
        const totalSize = cellSize + cellGap;

        // For selected year: always Jan 1 to Dec 31 (full year)
        const startDate = new Date(year, 0, 1);
        // Align start to previous Sunday
        const startDayOfWeek = startDate.getDay();
        if (startDayOfWeek !== 0) {
            startDate.setDate(startDate.getDate() - startDayOfWeek);
        }

        const endDate = new Date(year, 11, 31);

        // Build weeks grid
        const weeks = [];
        let current = new Date(startDate);
        let week = [];

        while (current <= endDate) {
            const dayOfWeek = current.getDay();
            if (dayOfWeek === 0 && week.length > 0) {
                weeks.push(week);
                week = [];
            }
            const key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
            week.push({
                date: new Date(current),
                key,
                minutes: sessionMap[key] || 0,
                dayOfWeek,
                isOutOfRange: current.getFullYear() !== year
            });
            current.setDate(current.getDate() + 1);
        }
        if (week.length > 0) weeks.push(week);

        // Count active days and total minutes
        const activeDays = Object.values(sessionMap).filter(m => m > 0).length;
        const totalMinutes = Object.values(sessionMap).reduce((sum, m) => sum + m, 0);

        // Update summary
        const summaryEl = document.getElementById('heatmap-summary');
        if (summaryEl) {
            const totalHours = Math.floor(totalMinutes / 60);
            const remainMins = totalMinutes % 60;
            summaryEl.textContent = `${activeDays} ngày luyện tập trong năm ${year} (${totalHours}h ${remainMins}m)`;
        }

        // Find max for color scaling
        const allMinutes = Object.values(sessionMap).filter(m => m > 0);
        const maxMinutes = allMinutes.length > 0 ? Math.max(...allMinutes) : 60;

        // Color levels (pink/magenta palette)
        const getColor = (minutes, isOutOfRange) => {
            if (isOutOfRange) return 'transparent';
            if (minutes === 0) return 'rgba(255, 255, 255, 0.05)';
            const ratio = minutes / maxMinutes;
            if (ratio <= 0.25) return 'rgba(233, 30, 144, 0.3)';
            if (ratio <= 0.5) return 'rgba(233, 30, 144, 0.55)';
            if (ratio <= 0.75) return 'rgba(233, 30, 144, 0.8)';
            return 'rgba(233, 30, 144, 1)';
        };

        // Month labels (English abbreviations for compact display)
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        let monthLabelsHtml = '';
        let lastMonth = -1;
        weeks.forEach((week, wi) => {
            // Find first day that belongs to the target year
            const dayInYear = week.find(d => d.date.getFullYear() === year);
            if (!dayInYear) return;
            const month = dayInYear.date.getMonth();
            if (month !== lastMonth) {
                lastMonth = month;
                const left = wi * totalSize;
                monthLabelsHtml += `<span style="position:absolute;left:${left}px;font-size:10px;color:var(--color-text-muted);white-space:nowrap;">${months[month]}</span>`;
            }
        });

        // Day labels (left side - English abbreviations)
        const dayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
        const dayLabelsHtml = dayLabels.map((label, i) => {
            const top = i * totalSize;
            return `<div style="position:absolute;top:${top}px;height:${cellSize}px;display:flex;align-items:center;font-size:10px;color:var(--color-text-muted);white-space:nowrap;">${label}</div>`;
        }).join('');

        // Grid cells
        let cellsHtml = '';
        weeks.forEach((week, wi) => {
            week.forEach(day => {
                const col = wi;
                const row = day.dayOfWeek;
                const x = col * totalSize;
                const y = row * totalSize;
                const color = getColor(day.minutes, day.isOutOfRange);
                if (day.isOutOfRange) return; // skip cells outside the year
                const title = `${day.key}: ${day.minutes} phút`;
                cellsHtml += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" rx="2" ry="2" fill="${color}" style="outline:1px solid rgba(255,255,255,0.03);"><title>${title}</title></rect>`;
            });
        });

        const gridWidth = weeks.length * totalSize;
        const gridHeight = 7 * totalSize;
        const dayLabelWidth = 30;

        // Legend
        const legendColors = [
            'rgba(255, 255, 255, 0.05)',
            'rgba(233, 30, 144, 0.3)',
            'rgba(233, 30, 144, 0.55)',
            'rgba(233, 30, 144, 0.8)',
            'rgba(233, 30, 144, 1)'
        ];
        const legendHtml = legendColors.map(c =>
            `<span style="width:${cellSize}px;height:${cellSize}px;border-radius:2px;background:${c};display:inline-block;"></span>`
        ).join('');

        container.innerHTML = `
            <div style="position:relative;">
                <!-- Day labels (fixed left) + scrollable grid -->
                <div style="display:flex;">
                    <div style="flex-shrink:0;width:${dayLabelWidth}px;padding-top:20px;">
                        <div style="position:relative;height:${gridHeight}px;">
                            ${dayLabelsHtml}
                        </div>
                    </div>
                    <div style="overflow-x:auto;flex:1;min-width:0;">
                        <!-- Month labels -->
                        <div style="position:relative;height:20px;min-width:${gridWidth}px;">
                            ${monthLabelsHtml}
                        </div>
                        <!-- Grid -->
                        <svg width="${gridWidth}" height="${gridHeight}" style="display:block;">
                            ${cellsHtml}
                        </svg>
                    </div>
                </div>
                <!-- Legend -->
                <div style="display:flex;align-items:center;justify-content:flex-end;gap:4px;margin-top:12px;font-size:10px;color:var(--color-text-muted);">
                    <span>Less</span>
                    ${legendHtml}
                    <span>More</span>
                </div>
            </div>
        `;
    },

    /**
     * Render year selector buttons (right side, like GitHub)
     * @private
     */
    _renderYearSelector(selectedYear) {
        const container = document.getElementById('heatmap-years');
        if (!container) return;

        const currentYear = new Date().getFullYear();
        // Show current year and up to 3 previous years
        const years = [];
        for (let y = currentYear; y >= currentYear - 3; y--) {
            years.push(y);
        }

        container.innerHTML = years.map(y => {
            const isActive = y === selectedYear;
            const activeStyle = isActive
                ? 'background:rgba(233, 30, 144, 0.2);color:#E91E90;border:1px solid rgba(233, 30, 144, 0.5);font-weight:700;'
                : 'background:rgba(255,255,255,0.05);color:var(--color-text-muted);border:1px solid transparent;';
            return `<button data-year="${y}" style="padding:4px 10px;border-radius:var(--radius-sm);font-size:12px;cursor:pointer;transition:all 0.2s;${activeStyle}" class="heatmap-year-btn">${y}</button>`;
        }).join('');

        // Attach event listeners
        container.querySelectorAll('.heatmap-year-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const year = parseInt(e.target.dataset.year);
                if (year !== this._selectedYear) {
                    this._selectedYear = year;
                    this._loadHeatmapForYear(year);
                }
            });
        });
    }
};
