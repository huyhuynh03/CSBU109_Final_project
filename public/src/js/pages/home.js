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
                <div class="home-stats-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:var(--spacing-md);margin-bottom:var(--spacing-lg);">
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
                <div class="glass-card" style="padding:var(--spacing-md) var(--spacing-sm);">
                    <div id="heatmap-header" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--spacing-sm);flex-wrap:wrap;gap:8px;padding:0 var(--spacing-xs);">
                        <span id="heatmap-summary" style="font-size:var(--font-size-xs);font-weight:600;color:var(--color-text);"></span>
                        <div id="heatmap-years" style="display:flex;gap:4px;flex-wrap:wrap;"></div>
                    </div>
                    <div id="dashboard-chart" style="width:100%;"></div>
                </div>
            </div>
        `;
    },

    // Cache TTL: 60 giây cho dashboard data
    _CACHE_TTL_MS: 60000,
    _lastLoadTime: 0,
    _cachedStreak: null,
    _selectedYear: new Date().getFullYear(),

    async onEnter(params, navToken) {
        console.log('[HomePage] Entered - Dashboard');
        this._navToken = navToken;
        if (!Auth.isSignedIn()) return;

        const now = Date.now();
        if (this._cachedStreak && (now - this._lastLoadTime) < this._CACHE_TTL_MS) {
            // DOM đã restore từ cache → background refresh
            this._loadStudyChart().then(() => {
                if (Router.isTokenValid(this._navToken)) this._saveHtmlCache();
            }).catch(() => {});
            return;
        }

        await this._loadStudyChart();
        if (Router.isTokenValid(this._navToken)) {
            this._saveHtmlCache();
        }
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
        const cellSize = 14;
        const cellGap = 3;
        const totalSize = cellSize + cellGap;

        // For selected year: always Jan 1 to Dec 31 (full year)
        const startDate = new Date(year, 0, 1);
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
            summaryEl.textContent = `${activeDays} ngày học trong ${year} (${totalHours}h ${remainMins}m)`;
        }

        // Find max for color scaling
        const allMinutes = Object.values(sessionMap).filter(m => m > 0);
        const maxMinutes = allMinutes.length > 0 ? Math.max(...allMinutes) : 60;

        // Color levels (pink/magenta palette)
        const getColor = (minutes, isOutOfRange) => {
            if (isOutOfRange) return 'none';
            if (minutes === 0) return 'rgba(255,255,255,0.06)';
            const ratio = minutes / maxMinutes;
            if (ratio <= 0.25) return 'rgba(233,30,144,0.3)';
            if (ratio <= 0.5) return 'rgba(233,30,144,0.55)';
            if (ratio <= 0.75) return 'rgba(233,30,144,0.8)';
            return 'rgba(233,30,144,1)';
        };

        // Layout constants for SVG
        const labelOffsetX = 28; // space for day labels
        const labelOffsetY = 14; // space for month labels
        const gridWidth = weeks.length * totalSize;
        const gridHeight = 7 * totalSize;
        const svgWidth = labelOffsetX + gridWidth;
        const svgHeight = labelOffsetY + gridHeight;

        // Build SVG month labels
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        let monthLabelsSvg = '';
        let lastMonth = -1;
        weeks.forEach((week, wi) => {
            const dayInYear = week.find(d => d.date.getFullYear() === year);
            if (!dayInYear) return;
            const month = dayInYear.date.getMonth();
            if (month !== lastMonth) {
                lastMonth = month;
                const x = labelOffsetX + wi * totalSize;
                monthLabelsSvg += `<text x="${x}" y="10" font-size="9" fill="var(--color-text-muted,#8b949e)" font-family="sans-serif">${months[month]}</text>`;
            }
        });

        // Build SVG day labels
        const dayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
        let dayLabelsSvg = '';
        dayLabels.forEach((label, i) => {
            if (!label) return;
            const y = labelOffsetY + i * totalSize + cellSize - 1;
            dayLabelsSvg += `<text x="0" y="${y}" font-size="9" fill="var(--color-text-muted,#8b949e)" font-family="sans-serif">${label}</text>`;
        });

        // Build SVG grid cells
        let cellsSvg = '';
        weeks.forEach((week, wi) => {
            week.forEach(day => {
                if (day.isOutOfRange) return;
                const x = labelOffsetX + wi * totalSize;
                const y = labelOffsetY + day.dayOfWeek * totalSize;
                const color = getColor(day.minutes, day.isOutOfRange);
                cellsSvg += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" rx="2" ry="2" fill="${color}"><title>${day.key}: ${day.minutes}m</title></rect>`;
            });
        });

        // Legend cells inside SVG
        const legendColors = ['rgba(255,255,255,0.06)', 'rgba(233,30,144,0.3)', 'rgba(233,30,144,0.55)', 'rgba(233,30,144,0.8)', 'rgba(233,30,144,1)'];
        const legendY = svgHeight + 8;
        const legendStartX = svgWidth - (legendColors.length * totalSize + 60);
        let legendSvg = `<text x="${legendStartX}" y="${legendY + 9}" font-size="9" fill="var(--color-text-muted,#8b949e)" font-family="sans-serif">Less</text>`;
        legendColors.forEach((c, i) => {
            const lx = legendStartX + 28 + i * (cellSize + 3);
            legendSvg += `<rect x="${lx}" y="${legendY}" width="${cellSize}" height="${cellSize}" rx="2" fill="${c}"/>`;
        });
        legendSvg += `<text x="${legendStartX + 28 + legendColors.length * (cellSize + 3) + 3}" y="${legendY + 9}" font-size="9" fill="var(--color-text-muted,#8b949e)" font-family="sans-serif">More</text>`;

        const totalSvgHeight = svgHeight + 24;

        // Render as single responsive SVG with viewBox
        container.innerHTML = `<svg viewBox="0 0 ${svgWidth} ${totalSvgHeight}" width="100%" style="display:block;max-width:100%;" preserveAspectRatio="xMidYMid meet">
            ${monthLabelsSvg}
            ${dayLabelsSvg}
            ${cellsSvg}
            ${legendSvg}
        </svg>`;
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
