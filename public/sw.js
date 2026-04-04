// LinguaFlash Service Worker v1.0
const CACHE_NAME = 'linguaflash-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/src/css/variables.css',
    '/src/css/base.css',
    '/src/css/themes.css',
    '/src/css/glassmorphism.css',
    '/src/css/components.css',
    '/src/css/animations.css',
    '/src/css/responsive.css',
    '/src/js/app.js',
    '/src/js/router.js',
    '/src/js/firebase-config.js',
    '/src/js/utils/helpers.js',
    '/src/js/ui/toast.js',
    '/src/js/ui/theme.js',
    '/src/js/ui/background.js',
    '/src/js/ui/components.js',
    '/src/js/auth/auth.js',
    '/src/js/auth/auth-ui.js',
    '/src/js/db/firestore.js',
    '/src/js/db/sync.js',
    '/src/js/fsrs/fsrs.js',
    '/src/js/pages/home.js',
    '/src/js/pages/study.js',
    '/src/js/pages/review.js',
    '/src/js/pages/settings.js',
    '/src/js/pages/auth-page.js'
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

    // Skip Firebase/Google API calls - let them go to network
    if (url.hostname.includes('googleapis.com') ||
        url.hostname.includes('gstatic.com') ||
        url.hostname.includes('firebaseio.com') ||
        url.hostname.includes('firestore.googleapis.com') ||
        url.hostname.includes('generativelanguage.googleapis.com')) {
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
