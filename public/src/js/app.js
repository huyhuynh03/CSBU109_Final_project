// ============================================
// LinguaFlash - Main App Entry Point
// ============================================

const App = {
    /**
     * Initialize the application
     */
    async init() {
        console.log('[App] Initializing LinguaFlash...');

        try {
            // 1. Initialize theme (first to prevent flash)
            ThemeManager.init();

            // 2. Initialize UI components
            Toast.init();
            FloatingBackground.init();

            // 3. Initialize Firebase modules
            Auth.init();
            FirestoreDB.init();
            Sync.init();
            FSRS.init();

            // 4. Initialize Auth UI (menu, avatar clicks)
            AuthUI.init();

            // 5. Register routes
            this._registerRoutes();

            // 6. Initialize router (will render first page)
            Router.init();

            // 7. Setup review badge click
            const reviewBadge = document.getElementById('btn-review-badge');
            if (reviewBadge) {
                reviewBadge.addEventListener('click', () => {
                    Router.navigate('/review');
                });
            }

            // 8. Hide loading screen
            await Helpers.sleep(500); // Minimum loading time for smooth UX
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                loadingScreen.classList.add('hidden');
                setTimeout(() => loadingScreen.remove(), 500);
            }

            console.log('[App] ✅ Initialized successfully');

        } catch (error) {
            console.error('[App] ❌ Initialization error:', error);
            Toast.error('Lỗi khởi tạo', 'Vui lòng tải lại trang.');
        }
    },

    /**
     * Register all routes
     * @private
     */
    _registerRoutes() {
        Router.register('/', {
            render: () => HomePage.render(),
            onEnter: () => HomePage.onEnter && HomePage.onEnter()
        });

        Router.register('/auth', {
            render: () => AuthPage.render(),
            onEnter: () => AuthPage.onEnter && AuthPage.onEnter()
        });

        Router.register('/study', {
            render: () => StudyPage.render(),
            onEnter: () => StudyPage.onEnter && StudyPage.onEnter()
        });

        Router.register('/review', {
            render: () => ReviewPage.render(),
            onEnter: () => ReviewPage.onEnter && ReviewPage.onEnter()
        });

        Router.register('/settings', {
            render: () => SettingsPage.render(),
            onEnter: () => SettingsPage.onEnter && SettingsPage.onEnter()
        });

        console.log('[App] Routes registered');
    }
};

// ============================================
// Start the app when DOM is ready
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
