// ============================================
// LinguaFlash Service Worker
// ============================================
// Cache strategies:
//   - Navigation (HTML)        : Network-first with 3s timeout, fallback cache
//   - App JS/CSS (same origin) : Stale-while-revalidate
//   - firebase-config.js       : Network-first (sensitive config)
//   - Google Fonts             : Cache-first
//   - Icons / images           : Cache-first
//   - Seed vocabulary JSON     : Stale-while-revalidate
//   - Firebase APIs            : Bypass (network-only via browser)
//
// Update flow:
//   - install: precache critical shell, KHÔNG skipWaiting tự động
//   - activate: cleanup cache cũ, claim clients
//   - message {type:'SKIP_WAITING'}: do main thread (sw-update.js) gọi sau khi
//     user xác nhận trên Toast "Có bản cập nhật mới"

const APP_VERSION = '5.147.0';
const CACHE_NAME = `linguaflash-v${APP_VERSION}`;

// Critical app shell - được precache khi install để hỗ trợ offline ngay lần đầu.
// Các file khác sẽ được cache khi user truy cập (stale-while-revalidate).
const PRECACHE_URLS = [
    '/',
    '/index.html',
    '/manifest.json'
];

// Config files chứa thông tin nhạy cảm - luôn ưu tiên network
const NETWORK_FIRST_PATHS = [
    '/src/js/firebase-config.js'
];

// ============================================
// Lifecycle: install
// ============================================
self.addEventListener('install', (event) => {
    console.log(`[SW] Installing v${APP_VERSION}...`);
    event.waitUntil(
        (async () => {
            const cache = await caches.open(CACHE_NAME);
            // Dùng add từng file để 1 file lỗi không làm fail toàn bộ install
            await Promise.all(
                PRECACHE_URLS.map((url) =>
                    cache.add(url).catch((err) => {
                        console.warn('[SW] Precache failed for', url, err);
                    })
                )
            );
            console.log('[SW] Precache complete');
            // KHÔNG gọi self.skipWaiting() ở đây.
            // Main thread (sw-update.js) sẽ post message SKIP_WAITING sau khi user xác nhận.
        })()
    );
});

// ============================================
// Lifecycle: activate
// ============================================
self.addEventListener('activate', (event) => {
    console.log(`[SW] Activating v${APP_VERSION}...`);
    event.waitUntil(
        (async () => {
            // Xoá cache cũ (khác CACHE_NAME hiện tại)
            const cacheNames = await caches.keys();
            await Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => {
                        console.log('[SW] Deleting old cache:', name);
                        return caches.delete(name);
                    })
            );
            // Bật navigation preload nếu có (tăng tốc network-first navigation)
            if (self.registration.navigationPreload) {
                try {
                    await self.registration.navigationPreload.enable();
                } catch (e) {
                    // Bỏ qua nếu không hỗ trợ
                }
            }
            await self.clients.claim();
            console.log('[SW] Activation complete');
        })()
    );
});

// ============================================
// Message handler — nhận SKIP_WAITING từ main thread
// ============================================
self.addEventListener('message', (event) => {
    if (!event.data) return;

    if (event.data.type === 'SKIP_WAITING') {
        console.log('[SW] SKIP_WAITING received - activating new SW');
        self.skipWaiting();
    }

    if (event.data.type === 'GET_VERSION') {
        event.ports[0]?.postMessage({ version: APP_VERSION });
    }
});

// ============================================
// Fetch handler
// ============================================
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Chỉ xử lý GET
    if (request.method !== 'GET') return;

    // Bỏ qua schemes không phải http(s) (chrome-extension, etc.)
    if (!url.protocol.startsWith('http')) return;

    // Bỏ qua Firebase / Google APIs - để browser tự fetch
    if (
        url.hostname.includes('googleapis.com') ||
        url.hostname.includes('gstatic.com') ||
        url.hostname.includes('firebaseio.com') ||
        url.hostname.includes('firestore.googleapis.com') ||
        url.hostname.includes('generativelanguage.googleapis.com') ||
        url.hostname.includes('identitytoolkit.googleapis.com') ||
        url.hostname.includes('securetoken.googleapis.com')
    ) {
        return;
    }

    // 1. Navigation requests (HTML pages) → network-first
    if (request.mode === 'navigate') {
        event.respondWith(networkFirstNavigation(event));
        return;
    }

    // 2. Network-first cho config files
    if (NETWORK_FIRST_PATHS.some((p) => url.pathname.startsWith(p))) {
        event.respondWith(networkFirst(request));
        return;
    }

    // 3. Google Fonts → cache-first (ít khi đổi)
    if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
        event.respondWith(cacheFirst(request));
        return;
    }

    // 4. Icons / images → cache-first
    if (
        url.pathname.startsWith('/icons/') ||
        /\.(png|jpe?g|gif|webp|svg|ico)$/i.test(url.pathname)
    ) {
        event.respondWith(cacheFirst(request));
        return;
    }

    // 5. Seed vocabulary JSON → stale-while-revalidate
    if (url.pathname.startsWith('/seed-vocabulary/')) {
        event.respondWith(staleWhileRevalidate(request));
        return;
    }

    // 6. App JS/CSS cùng origin → stale-while-revalidate
    if (url.origin === self.location.origin && /\.(js|css)$/i.test(url.pathname)) {
        event.respondWith(staleWhileRevalidate(request));
        return;
    }

    // 7. Default: cache-first với network fallback (giữ behavior cũ cho asset khác)
    event.respondWith(cacheFirst(request));
});

// ============================================
// Strategies
// ============================================

/**
 * Network-first cho navigation (HTML).
 * Timeout 3s; fallback về cache (request hoặc /index.html).
 */
async function networkFirstNavigation(event) {
    const request = event.request;
    const cache = await caches.open(CACHE_NAME);

    try {
        // Tận dụng navigation preload nếu có
        const preloadResponse = await event.preloadResponse;
        if (preloadResponse) {
            cache.put(request, preloadResponse.clone()).catch(() => {});
            return preloadResponse;
        }

        const networkResponse = await fetchWithTimeout(request, 3000);
        if (networkResponse && networkResponse.status === 200) {
            cache.put(request, networkResponse.clone()).catch(() => {});
        }
        return networkResponse;
    } catch (err) {
        console.log('[SW] Navigation network failed, fallback to cache:', err.message);
        const cached = (await cache.match(request)) || (await cache.match('/index.html')) || (await cache.match('/'));
        if (cached) return cached;
        // Last resort: trả về error response
        return new Response('Offline - không tải được trang', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
    }
}

/**
 * Network-first thường (cho config / api-like resources).
 */
async function networkFirst(request) {
    const cache = await caches.open(CACHE_NAME);
    try {
        const response = await fetch(request);
        if (response && response.status === 200) {
            cache.put(request, response.clone()).catch(() => {});
        }
        return response;
    } catch (err) {
        const cached = await cache.match(request);
        if (cached) return cached;
        throw err;
    }
}

/**
 * Cache-first: dùng cache, nếu chưa có thì fetch network rồi cache lại.
 */
async function cacheFirst(request) {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    if (cached) return cached;

    try {
        const response = await fetch(request);
        if (response && response.status === 200 && response.type !== 'opaqueredirect') {
            cache.put(request, response.clone()).catch(() => {});
        }
        return response;
    } catch (err) {
        // Fallback offline cho HTML
        if (request.headers.get('accept')?.includes('text/html')) {
            const fallback = await cache.match('/index.html');
            if (fallback) return fallback;
        }
        throw err;
    }
}

/**
 * Stale-while-revalidate: trả cache ngay (load nhanh), đồng thời fetch network để update cache.
 * Nếu chưa có cache thì await network.
 */
async function staleWhileRevalidate(request) {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);

    const networkPromise = fetch(request)
        .then((response) => {
            if (response && response.status === 200 && response.type === 'basic') {
                cache.put(request, response.clone()).catch(() => {});
            }
            return response;
        })
        .catch((err) => {
            // Network fail - không sao nếu đã có cache
            if (!cached) throw err;
            return null;
        });

    return cached || networkPromise;
}

/**
 * Helper: fetch với timeout.
 */
function fetchWithTimeout(request, timeoutMs) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('Network timeout')), timeoutMs);
        fetch(request).then(
            (resp) => {
                clearTimeout(timer);
                resolve(resp);
            },
            (err) => {
                clearTimeout(timer);
                reject(err);
            }
        );
    });
}

// ============================================
// Push notification handler (backup; FCM SW handles foreground/background)
// ============================================
self.addEventListener('push', (event) => {
    if (!event.data) return;

    try {
        const payload = event.data.json();
        const data = payload.data || {};
        const notification = payload.notification || {};

        // Body cố định, không tiết lộ số lượng / từ cụ thể
        const title = notification.title || data.title || 'LinguaFlash';
        const body = notification.body || data.body || 'Có từ cần ôn tập 📚';

        const options = {
            body: body,
            icon: '/icons/icon-192.png',
            badge: '/icons/icon-96.png',
            tag: 'review-reminder',
            renotify: true,
            data: {
                url: data.url || '/#/review',
                timestamp: Date.now()
            },
            actions: [
                { action: 'review', title: 'Ôn ngay' },
                { action: 'dismiss', title: 'Để sau' }
            ]
        };

        event.waitUntil(self.registration.showNotification(title, options));
    } catch (err) {
        console.error('[SW] Push parse error:', err);
    }
});

// ============================================
// Notification click handler
// ============================================
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'dismiss') return;

    const targetUrl = event.notification.data?.url || '/#/review';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if (client.url.includes(self.location.origin)) {
                    client.navigate(targetUrl);
                    return client.focus();
                }
            }
            return clients.openWindow(targetUrl);
        })
    );
});
