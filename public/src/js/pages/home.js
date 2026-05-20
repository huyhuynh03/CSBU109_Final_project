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

                <!-- GitHub-style Heatmap -->
                <div class="glass-card" style="padding:var(--spacing-lg);">
                    <div id="dashboard-chart" style="position:relative;overflow-x:auto;"></div>
                </div>
            </div>
        `;
    },

    // Cache TTL: 60 giây cho dashboard data
    _CACHE_TTL_MS: 60000,
    _lastLoadTime: 0,
    _cachedStreak: null,

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

            // Get 140 days (20 weeks) of sessions for heatmap
            const sessions = await FirestoreDB.getStudySessions(140);
            const sessionMap = {};
            sessions.forEach(s => { sessionMap[s.date] = s.minutes || 0; });

            this._renderHeatmap(sessionMap);

        } catch (error) {
            console.error('[HomePage] Error loading study chart:', error);
        }
    },

    /**
     * Render GitHub-style contribution heatmap
     * Uses pink/magenta palette with varying intensity
     * @private
     */
    _renderHeatmap(sessionMap) {
        const container = document.getElementById('dashboard-chart');
        if (!container) return;

        const today = new Date();
        const cellSize = 13;
        const cellGap = 3;
        const totalSize = cellSize + cellGap;

        // Calculate start date: go back to fill 20 weeks, starting from a Sunday
        const endDate = new Date(today);
        const startOffset = 20 * 7 - 1 + today.getDay(); // align to start on Sunday
        const startDate = new Date(today);
        startDate.setDate(startDate.getDate() - startOffset);

        // Build weeks grid (columns = weeks, rows = days Mon-Sun)
        const weeks = [];
        let current = new Date(startDate);
        let week = [];

        while (current <= endDate) {
            const dayOfWeek = current.getDay(); // 0=Sun
            if (dayOfWeek === 0 && week.length > 0) {
                weeks.push(week);
                week = [];
            }
            const key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
            week.push({
                date: new Date(current),
                key,
                minutes: sessionMap[key] || 0,
                dayOfWeek
            });
            current.setDate(current.getDate() + 1);
        }
        if (week.length > 0) weeks.push(week);

        // Find max for color scaling
        const allMinutes = Object.values(sessionMap).filter(m => m > 0);
        const maxMinutes = allMinutes.length > 0 ? Math.max(...allMinutes) : 60;

        // Color levels (pink/magenta palette)
        const getColor = (minutes) => {
            if (minutes === 0) return 'rgba(255, 255, 255, 0.05)';
            const ratio = minutes / maxMinutes;
            if (ratio <= 0.25) return 'rgba(233, 30, 144, 0.3)';
            if (ratio <= 0.5) return 'rgba(233, 30, 144, 0.55)';
            if (ratio <= 0.75) return 'rgba(233, 30, 144, 0.8)';
            return 'rgba(233, 30, 144, 1)';
        };

        // Month labels
        const months = ['Thg 1', 'Thg 2', 'Thg 3', 'Thg 4', 'Thg 5', 'Thg 6', 'Thg 7', 'Thg 8', 'Thg 9', 'Thg 10', 'Thg 11', 'Thg 12'];
        let monthLabelsHtml = '';
        let lastMonth = -1;
        weeks.forEach((week, wi) => {
            const firstDay = week[0];
            const month = firstDay.date.getMonth();
            if (month !== lastMonth) {
                lastMonth = month;
                const left = wi * totalSize;
                monthLabelsHtml += `<span style="position:absolute;left:${left}px;font-size:11px;color:var(--color-text-muted);">${months[month]}</span>`;
            }
        });

        // Day labels (left side)
        const dayLabels = ['', 'T2', '', 'T4', '', 'T6', ''];
        const dayLabelsHtml = dayLabels.map((label, i) => {
            const top = i * totalSize;
            return `<div style="position:absolute;top:${top}px;height:${cellSize}px;display:flex;align-items:center;font-size:11px;color:var(--color-text-muted);white-space:nowrap;">${label}</div>`;
        }).join('');

        // Grid cells
        let cellsHtml = '';
        weeks.forEach((week, wi) => {
            week.forEach(day => {
                const col = wi;
                const row = day.dayOfWeek; // 0=Sun at top, 6=Sat at bottom
                const x = col * totalSize;
                const y = row * totalSize;
                const color = getColor(day.minutes);
                const title = `${day.key}: ${day.minutes} phút`;
                cellsHtml += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" rx="2" ry="2" fill="${color}" style="outline:1px solid rgba(255,255,255,0.03);"><title>${title}</title></rect>`;
            });
        });

        const gridWidth = weeks.length * totalSize;
        const gridHeight = 7 * totalSize;
        const dayLabelWidth = 28;

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
            <div style="position:relative;padding-left:${dayLabelWidth}px;">
                <!-- Month labels -->
                <div style="position:relative;height:20px;margin-bottom:4px;">
                    ${monthLabelsHtml}
                </div>
                <!-- Day labels + Grid -->
                <div style="position:relative;display:flex;">
                    <div style="position:relative;width:${dayLabelWidth}px;height:${gridHeight}px;flex-shrink:0;">
                        ${dayLabelsHtml}
                    </div>
                    <svg width="${gridWidth}" height="${gridHeight}" style="display:block;">
                        ${cellsHtml}
                    </svg>
                </div>
                <!-- Legend -->
                <div style="display:flex;align-items:center;justify-content:flex-end;gap:4px;margin-top:12px;font-size:11px;color:var(--color-text-muted);">
                    <span>Ít</span>
                    ${legendHtml}
                    <span>Nhiều</span>
                </div>
            </div>
        `;
    }
};
