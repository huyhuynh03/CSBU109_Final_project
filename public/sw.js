// LinguaFlash Service Worker v5.50
const CACHE_NAME = 'linguaflash-v5.52';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/src/css/variables.css?v=5',
    '/src/css/base.css?v=3',
    '/src/css/themes.css?v=2',
    '/src/css/glassmorphism.css?v=2',
    '/src/css/components.css?v=22',
    '/src/css/animations.css?v=2',
    '/src/css/responsive.css?v=4',
    '/src/js/app.js?v=14',
    '/src/js/router.js?v=3',
    '/src/js/utils/helpers.js?v=2',
    '/src/js/utils/family-word-manager.js?v=3',
    '/src/js/utils/tts.js?v=1',
    '/src/js/utils/seed-importer.js?v=5',
    '/src/js/ui/toast.js?v=2',
    '/src/js/ui/theme.js?v=2',
    '/src/js/ui/background.js?v=3',
    '/src/js/ui/components.js?v=2',
    '/src/js/ui/sidebar.js?v=6',
    '/src/js/ui/card-filter.js?v=2',
    '/src/js/config/card-schemas.js?v=8',
    '/src/js/config/vocabulary-topics.js?v=2',
    '/src/js/auth/auth.js?v=10',
    '/src/js/auth/auth-ui.js?v=3',
    '/src/js/db/firestore.js?v=7',
    '/src/js/db/sync.js?v=2',
    '/src/js/fsrs/fsrs.js?v=8',
    '/src/js/fsrs/migration.js?v=1',
    '/src/js/fsrs/bqt-v2-cleanup.js?v=1',
    '/src/js/fsrs/card-mode-manager.js?v=3',
    '/src/js/pages/home.js?v=13',
    '/src/js/pages/vocabulary.js?v=27',
    '/src/js/pages/topic-detail.js?v=5',
    '/src/js/pages/grammar.js?v=1',
    '/src/js/pages/study.js?v=17',
    '/src/js/pages/review.js?v=13',
    '/src/js/pages/settings.js?v=2',
    '/src/js/pages/auth-page.js?v=8',
    '/src/js/pages/account.js?v=4'
];

// Files that should always use network-first (contain sensitive config)
const NETWORK_FIRST_FILES = [
    '/src/js/firebase-config.js'
];

// Install - Cache static assets
self.addEventListener('install', (event) => {
    console.log('[SW] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate - Clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating...');
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((name) => name !== CACHE_NAME)
                        .map((name) => {
                            console.log('[SW] Deleting old cache:', name);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => self.clients.claim())
    );
});

// Fetch - Network first, fallback to cache (for API calls)
// Cache first, fallback to network (for static assets)
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Skip non-http(s) schemes (chrome-extension, etc.)
    if (!url.protocol.startsWith('http')) return;

    // Skip Firebase/Google API calls - let them go to network
    if (url.hostname.includes('googleapis.com') ||
        url.hostname.includes('gstatic.com') ||
        url.hostname.includes('firebaseio.com') ||
        url.hostname.includes('firestore.googleapis.com') ||
        url.hostname.includes('generativelanguage.googleapis.com')) {
        return;
    }

    // Network-first for config files (should not be cached long-term)
    if (NETWORK_FIRST_FILES.some(f => url.pathname.endsWith(f))) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                    return response;
                })
                .catch(() => caches.match(request))
        );
        return;
    }

    // For Google Fonts - cache first strategy
    if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
        event.respondWith(
            caches.match(request)
                .then((cached) => {
                    if (cached) return cached;
                    return fetch(request).then((response) => {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                        return response;
                    });
                })
        );
        return;
    }

    // For app static assets - cache first, fallback to network
    event.respondWith(
        caches.match(request)
            .then((cached) => {
                if (cached) return cached;
                return fetch(request)
                    .then((response) => {
                        // Only cache successful responses
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                        return response;
                    })
                    .catch(() => {
                        // If both cache and network fail, return offline page
                        if (request.headers.get('accept').includes('text/html')) {
                            return caches.match('/index.html');
                        }
                    });
            })
    );
});
