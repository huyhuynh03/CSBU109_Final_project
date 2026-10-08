/**
 * Shell Entry Point — main.js
 *
 * Import tất cả shell modules theo đúng thứ tự dependency.
 * Mỗi module được assign vào window.* để backward-compat
 * (các module vẫn reference nhau qua global scope).
 *
 * English module sẽ được lazy-load qua dynamic import()
 * khi user navigate vào /english/*.
 */

// ============================================
// CSS imports (Vite sẽ bundle thành 1 file CSS)
// ============================================
import '../css/variables.css';
import '../css/base.css';
import '../css/glassmorphism.css';
import '../css/components.css';
import '../css/animations.css';
import '../css/themes.css';
import '../css/pwa-install.css';
import '../css/responsive.css';

// ============================================
// Firebase SDK (loaded via CDN in index.html)
// firebase-config.js uses global `firebase` from CDN
// ============================================
import { db, auth, authPersistenceReady } from './firebase-config.js';
window.db = db;
window.auth = auth;
window.authPersistenceReady = authPersistenceReady;

// ============================================
// Utils (no dependencies)
// ============================================
import Helpers from './utils/helpers.js';
window.Helpers = Helpers;

import TTS from './utils/tts.js';
window.TTS = TTS;

// ============================================
// UI modules
// ============================================
import Toast from './ui/toast.js';
window.Toast = Toast;

import ThemeManager from './ui/theme.js';
window.ThemeManager = ThemeManager;

import FloatingBackground from './ui/background.js';
window.FloatingBackground = FloatingBackground;

import Components from './ui/components.js';
window.Components = Components;

import PWAInstall from './ui/pwa-install.js';
window.PWAInstall = PWAInstall;

import Sidebar from './ui/sidebar.js';
window.Sidebar = Sidebar;

// ============================================
// Auth
// ============================================
import Auth from './auth/auth.js';
window.Auth = Auth;

import AuthUI from './auth/auth-ui.js';
window.AuthUI = AuthUI;

// ============================================
// Database
// ============================================
import FirestoreDB from './db/firestore.js';
window.FirestoreDB = FirestoreDB;

import Sync from './db/sync.js';
window.Sync = Sync;

import LanguageIdMigration from './db/languageid-migration.js';
window.LanguageIdMigration = LanguageIdMigration;

// ============================================
// Host API (bridge between shell and modules)
// ============================================
import LinguaFlashHost from './host.js';
// Already assigned in host.js: window.LinguaFlashHost, window.host

// ============================================
// FSRS engine
// ============================================
import FSRS from './fsrs/fsrs.js';
window.FSRS = FSRS;

import FsrsMigration from './fsrs/migration.js';
window.FsrsMigration = FsrsMigration;

// ============================================
// Module Loader (lazy load language modules)
// ============================================
import ModuleLoader from './module-loader.js';
window.ModuleLoader = ModuleLoader;

// ============================================
// Router
// ============================================
import Router from './router.js';
window.Router = Router;

// ============================================
// Shell Pages
// ============================================
import HomePage from './pages/home.js';
window.HomePage = HomePage;

import SettingsPage from './pages/settings.js';
window.SettingsPage = SettingsPage;

import AccountPage from './pages/account.js';
window.AccountPage = AccountPage;

import AuthPage from './pages/auth-page.js';
window.AuthPage = AuthPage;

import LanguagesPage from './pages/languages.js';
window.LanguagesPage = LanguagesPage;

// ============================================
// SW Update
// ============================================
import SwUpdate from './sw-update.js';
window.SwUpdate = SwUpdate;

// ============================================
// App bootstrap
// ============================================
import App from './app.js';
window.App = App;

// ============================================
// Init on DOM ready
// ============================================
// Tất cả modules đã được import và assign lên window.* ở trên.
// Giờ mới an toàn gọi App.init() — nó tham chiếu ThemeManager, Toast,...
// qua bare globals (resolve từ window trong bundled code).
//
// Với <script type="module"> (defer), DOMContentLoaded có thể đã fire
// trước khi module này load. Phải check readyState.
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
} else {
    App.init();
}

// SwUpdate.init() needs to run after window load:
window.addEventListener('load', () => {
    if (window.SwUpdate) SwUpdate.init();
});
