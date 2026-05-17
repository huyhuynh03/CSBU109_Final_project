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
            PWAInstall.init();

            // 3. Initialize Firebase modules
            Auth.init();
            FirestoreDB.init();
            Sync.init();
            FSRS.init();

            // 4. Initialize Auth UI (menu, avatar clicks)
            AuthUI.init();

            // 5. Initialize Sidebar
            Sidebar.init();

            // 6. Register routes
            this._registerRoutes();

            // 6.5. ĐỢI Firebase khôi phục auth state (IndexedDB) trước khi render route đầu tiên.
            // Tránh race condition: nếu Router chạy trước, các trang sẽ thấy chưa đăng nhập → redirect /auth
            // và Firestore sẽ bị spam call "No user signed in".
            await Auth.waitForInitialAuth();

            // 6.6. Initialize Push Notifications (sau khi auth ready)
            PushNotificationManager.init();

            // 7. Initialize router (will render first page)
            Router.init();

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
        // Dashboard (home)
        Router.register('/', {
            render: () => HomePage.render(),
            onEnter: () => HomePage.onEnter && HomePage.onEnter()
        });

        // Auth
        Router.register('/auth', {
            render: () => AuthPage.render(),
            onEnter: () => AuthPage.onEnter && AuthPage.onEnter()
        });

        // Vocabulary section
        Router.register('/vocabulary', {
            render: () => VocabularyPage.render(),
            onEnter: () => VocabularyPage.onEnter && VocabularyPage.onEnter()
        });

        // Topic detail (vocabulary topic)
        Router.register('/topic/:id', {
            render: () => TopicDetailPage.render(),
            onEnter: (params) => TopicDetailPage.onEnter && TopicDetailPage.onEnter(params)
        });

        // Grammar section
        Router.register('/grammar', {
            render: () => GrammarPage.render(),
            onEnter: () => GrammarPage.onEnter && GrammarPage.onEnter()
        });

        // Study & Review
        Router.register('/study', {
            render: () => StudyPage.render(),
            onEnter: () => StudyPage.onEnter && StudyPage.onEnter()
        });

        Router.register('/review', {
            render: () => ReviewPage.render(),
            onEnter: () => ReviewPage.onEnter && ReviewPage.onEnter()
        });

        // Settings & Account
        Router.register('/settings', {
            render: () => SettingsPage.render(),
            onEnter: () => SettingsPage.onEnter && SettingsPage.onEnter()
        });

        Router.register('/account', {
            render: () => AccountPage.render(),
            onEnter: () => AccountPage.onEnter && AccountPage.onEnter()
        });

        // Language selection
        Router.register('/languages', {
            render: () => LanguagesPage.render(),
            onEnter: () => LanguagesPage.onEnter && LanguagesPage.onEnter()
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
