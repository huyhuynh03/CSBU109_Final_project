// ============================================
// Home Page - Dashboard with Study/Review + Stats
// ============================================

const HomePage = {
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
                    <p>Hôm nay bạn muốn làm gì?</p>
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

                <!-- Unified Chart: bars + date labels + day abbreviations -->
                <div class="glass-card" style="padding:var(--spacing-lg);">
                    <div id="dashboard-chart" style="position:relative;"></div>
                </div>
            </div>
        `;
    },

    async onEnter() {
        console.log('[HomePage] Entered - Dashboard');
        if (!Auth.isSignedIn()) return;

        this._loadStudyChart();
    },

    /**
     * Load study chart, streak, practice time
     * @private
     */
    async _loadStudyChart() {
        try {
            // Get streak info
            const streakInfo = await FirestoreDB.getStreakInfo();
            const streakEl = document.getElementById('dashboard-streak');
            if (streakEl) streakEl.textContent = streakInfo.streak;

            // Practice time today
            const practiceEl = document.getElementById('dashboard-practice-time');
            if (practiceEl) {
                const hours = Math.floor(streakInfo.totalMinutesToday / 60);
                const mins = streakInfo.totalMinutesToday % 60;
                practiceEl.innerHTML = `<span style="font-size:var(--font-size-2xl);font-weight:700;color:var(--color-text);">${hours}h ${mins}m</span>`;
            }

            // Get 7 days of sessions for chart
            const sessions = await FirestoreDB.getStudySessions(7);
            const sessionMap = {};
            sessions.forEach(s => { sessionMap[s.date] = s.minutes || 0; });

            // Build 7-day data
            const today = new Date();
            const chartData = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date(today);
                d.setDate(d.getDate() - i);
                const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                const dayNum = d.getDate();
                const monthNum = d.getMonth() + 1;
                const dayOfWeek = d.getDay(); // 0=Sun, 1=Mon...
                const dayAbbrs = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
                chartData.push({
                    date: d,
                    dateKey: key,
                    dateLabel: `${dayNum} thg ${monthNum}`,
                    dayAbbr: dayAbbrs[dayOfWeek],
                    minutes: sessionMap[key] || 0,
                    isToday: i === 0
                });
            }

            this._renderUnifiedChart(chartData);

        } catch (error) {
            console.error('[HomePage] Error loading study chart:', error);
        }
    },

    /**
     * Render unified chart: Y-axis + bars on top, date labels in middle, day abbreviations at bottom
     * All vertically aligned per column
     * @private
     */
    _renderUnifiedChart(chartData) {
        const container = document.getElementById('dashboard-chart');
        if (!container) return;

        const maxMinutes = Math.max(...chartData.map(d => d.minutes), 1);
        const maxHours = Math.ceil(maxMinutes / 60) || 1;
        const ySteps = this._getYSteps(maxHours);
        const chartHeight = 160;
        const barColor = '#E91E90';

        // Y axis labels (positioned absolute)
        const yLabelsHtml = ySteps.map(step => {
            const bottom = (step / maxHours) * chartHeight;
            return `
                <div style="position:absolute;left:0;bottom:${bottom}px;transform:translateY(50%);font-size:11px;color:var(--color-text-muted);width:24px;text-align:right;">${step}</div>
                <div style="position:absolute;left:32px;right:0;bottom:${bottom}px;border-bottom:1px dashed rgba(255,255,255,0.1);"></div>
            `;
        }).join('');

        // Columns: each column contains bar area + date label + day abbreviation
        const columnsHtml = chartData.map((d) => {
            const heightPct = maxHours > 0 ? (d.minutes / 60 / maxHours) * 100 : 0;
            const barH = Math.max(heightPct, 1);

            // Day circle style
            let circleStyle;
            const hasActivity = d.minutes > 0;
            if (hasActivity) {
                circleStyle = 'background:linear-gradient(135deg, #6C63FF 0%, #4F46E5 100%);color:#fff;';
            } else if (d.isToday) {
                circleStyle = 'background:rgba(108,99,255,0.2);color:var(--color-primary);border:2px solid var(--color-primary);';
            } else {
                circleStyle = 'background:rgba(255,255,255,0.08);color:var(--color-text-muted);';
            }

            return `
                <div style="flex:1;display:flex;flex-direction:column;align-items:center;min-width:0;" title="${d.dateLabel} - ${d.minutes} phút">
                    <!-- Bar area -->
                    <div style="width:100%;height:${chartHeight}px;display:flex;align-items:flex-end;justify-content:center;">
                        <div style="width:60%;max-width:24px;height:${barH}%;background:${barColor};border-radius:4px 4px 0 0;min-height:2px;transition:height 0.5s ease;"></div>
                    </div>
                    <!-- Date label -->
                    <div style="font-size:10px;color:var(--color-text-muted);margin-top:8px;white-space:nowrap;text-align:center;">${d.dateLabel}</div>
                    <!-- Day circle -->
                    <div style="width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:600;font-size:var(--font-size-xs);margin-top:6px;${circleStyle}">
                        ${d.dayAbbr}
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = `
            <!-- Chart area with Y axis -->
            <div style="position:relative;padding-left:32px;">
                ${yLabelsHtml}
                <!-- Baseline -->
                <div style="position:absolute;left:32px;right:0;bottom:0;height:2px;background:${barColor};opacity:0.6;"></div>
                <!-- Columns -->
                <div style="display:flex;gap:0;">
                    ${columnsHtml}
                </div>
            </div>
        `;
    },

    /**
     * Get nice Y axis steps
     * @private
     */
    _getYSteps(maxHours) {
        if (maxHours <= 1) return [0, 1];
        if (maxHours <= 2) return [0, 1, 2];
        if (maxHours <= 4) return [0, 1, 2, 3, 4];
        if (maxHours <= 8) return [0, 2, 4, 6, 8];
        const step = Math.ceil(maxHours / 4);
        const steps = [];
        for (let i = 0; i <= maxHours; i += step) {
            steps.push(i);
        }
        return steps;
    }
};
