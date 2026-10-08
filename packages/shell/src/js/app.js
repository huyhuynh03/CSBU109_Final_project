// ============================================
// LinguaFlash - Main App Entry Point
// ============================================

import ThemeManager from './ui/theme.js';
import Toast from './ui/toast.js';
import FloatingBackground from './ui/background.js';
import PWAInstall from './ui/pwa-install.js';
import Sidebar from './ui/sidebar.js';
import Auth from './auth/auth.js';
import AuthUI from './auth/auth-ui.js';
import FirestoreDB from './db/firestore.js';
import Sync from './db/sync.js';
import FSRS from './fsrs/fsrs.js';
import Router from './router.js';
import ModuleLoader from './module-loader.js';
import Helpers from './utils/helpers.js';
import HomePage from './pages/home.js';
import AuthPage from './pages/auth-page.js';
import SettingsPage from './pages/settings.js';
import AccountPage from './pages/account.js';

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

            // 4.5. Load module registry (modules-registry.json) trước khi
            // Sidebar/Router init — sidebar đọc language items từ registry,
            // router dùng registry để biết module nào tồn tại. Lazy-load
            // bundle vẫn đảm bảo: registry chỉ là metadata, không tải module code.
            await ModuleLoader.loadRegistry();

            // 5. Initialize Sidebar
            Sidebar.init();

            // 6. Register routes
            this._registerRoutes();

            // 6.5. ĐỢI Firebase khôi phục auth state (IndexedDB) trước khi render route đầu tiên.
            // Tránh race condition: nếu Router chạy trước, các trang sẽ thấy chưa đăng nhập → redirect /auth
            // và Firestore sẽ bị spam call "No user signed in".
            await Auth.waitForInitialAuth();

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
        // ==========================================
        // Shell routes (global)
        // ==========================================

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

        // Legacy /languages → redirect to home (Phase 1: language selection moved to Dashboard)
        Router.register('/languages', {
            render: () => {
                Router.navigate('/');
                return '<div class="page-enter"></div>';
            }
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

        // ==========================================
        // English module routes — loaded dynamically via ModuleLoader
        // (routes registered on-demand when user navigates to /english/*)
        // ==========================================

        // ==========================================
        // Legacy redirects (Phase 1.4)
        // Old URLs → new /english/* URLs. Keep for 6 months.
        // ==========================================
        const legacyRedirects = {
            '/vocabulary': '/english/vocabulary',
            '/grammar': '/english/grammar',
            '/study': '/english/study',
            '/review': '/english/review'
        };

        Object.entries(legacyRedirects).forEach(([oldPath, newPath]) => {
            Router.register(oldPath, {
                render: () => {
                    // Preserve query string during redirect
                    const fullHash = window.location.hash.slice(1) || '';
                    const qIndex = fullHash.indexOf('?');
                    const queryString = qIndex >= 0 ? fullHash.substring(qIndex) : '';
                    Router.navigate(newPath + queryString);
                    return '<div class="page-enter"></div>';
                }
            });
        });

        // Legacy topic detail: /topic/:id → /english/topic/:id
        Router.register('/topic/:id', {
            render: (params) => {
                const fullHash = window.location.hash.slice(1) || '';
                const qIndex = fullHash.indexOf('?');
                const queryString = qIndex >= 0 ? fullHash.substring(qIndex) : '';
                Router.navigate('/english/topic/' + params.id + queryString);
                return '<div class="page-enter"></div>';
            }
        });

        console.log('[App] Routes registered');
    }
};

// ============================================
// App bootstrap entry
// ============================================
// LƯU Ý: KHÔNG tự động gọi App.init() ở đây.
// Trong bundle Vite, app.js được import qua main.js. Nếu chạy App.init()
// ngay trong app.js body, nó sẽ chạy TRƯỚC khi main.js body assign các
// `window.ThemeManager = ThemeManager`, `window.Toast = Toast`... → các
// reference bare global (ThemeManager, Toast,...) trong App.init() sẽ
// chưa có trên window và throw ReferenceError.
//
// main.js sẽ gọi App.init() ở CUỐI module body, sau khi đã expose tất
// cả services lên window.

export default App;
