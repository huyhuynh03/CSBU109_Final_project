// ============================================
// LinguaFlash Service Worker (Vite Build)
// ============================================
// Cache strategies:
//   - Navigation (HTML)        : Network-first with 3s timeout, fallback cache
//   - Hashed assets (/assets/*): Cache-first (immutable — filename = content hash)
//   - Google Fonts             : Cache-first
//   - Icons / images           : Cache-first
//   - Seed vocabulary JSON     : Stale-while-revalidate
//   - Firebase APIs            : Bypass (network-only)
//
// Update flow:
//   - install: precache critical shell (HTML + icons), skipWaiting
//   - activate: cleanup old caches, claim clients
//   - message {type:'SKIP_WAITING'}: do main thread gọi
//
// Với Vite hashed filenames (e.g. index-CN7Jhn0k.js), mỗi deploy tạo
// filename mới → browser tự invalidate. SW chỉ cần cache-first cho /assets/*.

const APP_VERSION = '6.4.46';
const CACHE_NAME = `linguaflash-v${APP_VERSION}`;

// Chỉ precache stable paths (không hash). Hashed assets sẽ được cache
// on-demand khi browser fetch lần đầu.
const PRECACHE_URLS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/icons/icon-192.png',
    '/icons/icon-512.png'
];

// ============================================
// Lifecycle: install
// ============================================
self.addEventListener('install', (event) => {
    console.log(`[SW] Installing v${APP_VERSION}...`);
    event.waitUntil(
        (async () => {
            const cache = await caches.open(CACHE_NAME);
            await Promise.all(
                PRECACHE_URLS.map((url) =>
                    cache.add(url).catch((err) => {
                        console.warn('[SW] Precache failed for', url, err);
                    })
                )
            );
            console.log('[SW] Precache complete');
            self.skipWaiting();
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
            // Bật navigation preload nếu có
            if (self.registration.navigationPreload) {
                try {
                    await self.registration.navigationPreload.enable();
                } catch (e) { /* ignore */ }
            }
            await self.clients.claim();
            console.log('[SW] Activation complete');
        })()
    );
});

// ============================================
// Message handler
// ============================================
self.addEventListener('message', (event) => {
    if (!event.data) return;

    if (event.data.type === 'SKIP_WAITING') {
        console.log('[SW] SKIP_WAITING received');
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

    // Bỏ qua schemes không phải http(s)
    if (!url.protocol.startsWith('http')) return;

    // Bỏ qua Firebase / Google APIs
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

    // 1. Navigation requests (HTML) → network-first
    if (request.mode === 'navigate') {
        event.respondWith(networkFirstNavigation(event));
        return;
    }

    // 2. Hashed assets (/assets/*) → cache-first (immutable)
    // Vite output: /assets/index-CN7Jhn0k.js, /assets/index-DCZDjmYc.css
    // Content hash trong filename = nội dung không bao giờ đổi
    if (url.pathname.startsWith('/assets/')) {
        event.respondWith(cacheFirst(request));
        return;
    }

    // 3. Google Fonts → cache-first
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

    // 5a. Audio manifest → network-first (danh sách slug thay đổi theo từng lần
    //     generate). KHÔNG dùng SWR: SWR trả cache cũ trước → kẹt bản thiếu slug.
    //     Header immutable cũ + cache-first từng làm "bad" + 310 từ rơi Web Speech.
    if (url.pathname.startsWith('/audio/') && url.pathname.endsWith('/audio-manifest.json')) {
        event.respondWith(networkFirstAudioManifest(request));
        return;
    }

    // 5b. Audio MP3 → cache-first (file tĩnh theo slug, không đổi nội dung)
    if (url.pathname.startsWith('/audio/')) {
        event.respondWith(cacheFirst(request));
        return;
    }

    // 6. Seed vocabulary JSON → stale-while-revalidate
    if (url.pathname.startsWith('/seed-vocabulary/')) {
        event.respondWith(staleWhileRevalidate(request));
        return;
    }

    // 6. Default same-origin → stale-while-revalidate
    if (url.origin === self.location.origin) {
        event.respondWith(staleWhileRevalidate(request));
        return;
    }

    // 7. External → network with cache fallback
    event.respondWith(cacheFirst(request));
});

// ============================================
// Strategies
// ============================================

/**
 * Network-first cho navigation (HTML).
 * Timeout 3s; fallback về cache.
 */
async function networkFirstNavigation(event) {
    const request = event.request;
    const cache = await caches.open(CACHE_NAME);

    try {
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
        console.log('[SW] Navigation network failed, fallback to cache');
        const cached = (await cache.match(request)) || (await cache.match('/index.html')) || (await cache.match('/'));
        if (cached) return cached;
        return new Response('Offline - không tải được trang', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
    }
}

/**
 * Cache-first: dùng cache, nếu chưa có thì fetch network rồi cache lại.
 * Lý tưởng cho hashed assets (immutable) và fonts.
 */
async function cacheFirst(request) {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    if (cached) return cached;

    try {
        const response = await fetch(request);
        if (response && response.status === 200) {
            cache.put(request, response.clone()).catch(() => {});
        }
        return response;
    } catch (err) {
        return new Response('', { status: 408, statusText: 'Request Timeout' });
    }
}

/**
 * Network-first cho audio-manifest.json.
 * Danh sách slug phải luôn mới; cache chỉ là fallback offline.
 */
async function networkFirstAudioManifest(request) {
    const cache = await caches.open(CACHE_NAME);
    try {
        const response = await fetchWithTimeout(request, 4000);
        if (response && response.status === 200) {
            cache.put(request, response.clone()).catch(() => {});
        }
        return response;
    } catch (err) {
        const cached = await cache.match(request);
        if (cached) return cached;
        return new Response(JSON.stringify({ files: {} }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

/**
 * Stale-while-revalidate: trả cache ngay, đồng thời fetch mới để update cache.
 */
async function staleWhileRevalidate(request) {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);

    const fetchPromise = fetch(request)
        .then((response) => {
            if (response && response.status === 200) {
                cache.put(request, response.clone()).catch(() => {});
            }
            return response;
        })
        .catch(() => null);

    return cached || (await fetchPromise) || new Response('', { status: 408 });
}

/**
 * Fetch with timeout.
 */
function fetchWithTimeout(request, timeoutMs) {
    return new Promise((resolve, reject) => {
        const controller = new AbortController();
        const timer = setTimeout(() => {
            controller.abort();
            reject(new Error('Timeout'));
        }, timeoutMs);

        fetch(request, { signal: controller.signal })
            .then((response) => {
                clearTimeout(timer);
                resolve(response);
            })
            .catch((err) => {
                clearTimeout(timer);
                reject(err);
            });
    });
}

// ============================================
// Push Notification (giữ nguyên từ trước)
// ============================================
self.addEventListener('push', (event) => {
    if (!event.data) return;

    try {
        const data = event.data.json();
        const options = {
            body: data.body || 'Đã đến lúc ôn tập!',
            icon: '/icons/icon-192.png',
            badge: '/icons/icon-72.png',
            vibrate: [200, 100, 200],
            data: {
                url: data.url || '/#/english/review',
                dateOfArrival: Date.now()
            },
            actions: [
                { action: 'review', title: '📖 Ôn tập ngay' },
                { action: 'dismiss', title: '⏰ Để sau' }
            ]
        };

        event.waitUntil(
            self.registration.showNotification(data.title || 'LinguaFlash', options)
        );
    } catch (e) {
        console.error('[SW] Push parse error:', e);
    }
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'dismiss') return;

    const targetUrl = event.notification.data?.url || '/';

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
            for (const client of clients) {
                if (client.url.includes(self.location.origin)) {
                    client.focus();
                    client.navigate(targetUrl);
                    return;
                }
            }
            return self.clients.openWindow(targetUrl);
        })
    );
});
