// ============================================
// Firebase Cloud Messaging Service Worker
// ============================================
// File này PHẢI nằm ở root (/) để FCM hoạt động đúng.
// Nó handle push messages khi app không ở foreground.

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyB0owP69y_XqcUwqHx2kD2xJRSeGEqSC6A",
    authDomain: "linguaflash-f5591.firebaseapp.com",
    projectId: "linguaflash-f5591",
    storageBucket: "linguaflash-f5591.firebasestorage.app",
    messagingSenderId: "273192376743",
    appId: "1:273192376743:web:b037c9abaaf9f270923e82"
});

const messaging = firebase.messaging();

// Handle background messages (khi app không ở foreground)
messaging.onBackgroundMessage((payload) => {
    console.log('[FCM-SW] Background message received:', payload);

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
        requireInteraction: false,
        data: {
            url: '/#/review',
            timestamp: Date.now()
        },
        actions: [
            { action: 'review', title: 'Ôn ngay' },
            { action: 'dismiss', title: 'Để sau' }
        ]
    };

    return self.registration.showNotification(title, options);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    console.log('[FCM-SW] Notification clicked:', event.action);
    event.notification.close();

    if (event.action === 'dismiss') return;

    // Mở app tại trang Review
    const targetUrl = event.notification.data?.url || '/#/review';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Nếu app đã mở, focus vào tab đó
                for (const client of clientList) {
                    if (client.url.includes(self.location.origin)) {
                        client.navigate(targetUrl);
                        return client.focus();
                    }
                }
                // Nếu chưa mở, mở tab mới
                return clients.openWindow(targetUrl);
            })
    );
});
