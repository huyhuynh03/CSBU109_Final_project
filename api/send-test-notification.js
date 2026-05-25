// ============================================
// Vercel Serverless Function: Send Test Notification
// ============================================
// Gọi từ Settings page để test FCM hoạt động.
// Yêu cầu Firebase Auth ID token trong header Authorization.

const admin = require('firebase-admin');

// Initialize Firebase Admin (singleton)
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n')
        })
    });
}

const db = admin.firestore();

module.exports = async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Verify Firebase Auth token
    const authHeader = req.headers.authorization || '';
    const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

    if (!idToken) {
        return res.status(401).json({ error: 'Missing Authorization header' });
    }

    let uid;
    try {
        const decoded = await admin.auth().verifyIdToken(idToken);
        uid = decoded.uid;
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token: ' + err.message });
    }

    console.log('[sendTestNotification] start', uid);

    // Lấy device tokens
    const devicesSnapshot = await db.collection('users').doc(uid)
        .collection('devices').get();

    if (devicesSnapshot.empty) {
        return res.status(400).json({
            error: 'Chưa có thiết bị nào đăng ký nhận thông báo. Hãy tắt rồi bật lại notification toggle.'
        });
    }

    const tokens = devicesSnapshot.docs.map(d => d.data().token).filter(Boolean);
    if (tokens.length === 0) {
        return res.status(400).json({ error: 'Không tìm thấy FCM token hợp lệ.' });
    }

    const message = {
        notification: {
            title: 'LinguaFlash - Thông báo thử',
            body: 'Hệ thống thông báo đang hoạt động bình thường 🎉'
        },
        data: {
            type: 'test_notification',
            url: '/#/',
            timestamp: String(Date.now())
        },
        webpush: {
            fcmOptions: { link: '/#/' },
            notification: {
                icon: '/icons/icon-192.png',
                badge: '/icons/icon-96.png',
                tag: 'test-notification',
                renotify: true,
                requireInteraction: false
            }
        }
    };

    try {
        const response = await admin.messaging().sendEachForMulticast({ tokens, ...message });

        // Cleanup expired tokens
        if (response.failureCount > 0) {
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    const errorCode = resp.error?.code;
                    console.warn('[sendTestNotification] token failed:', errorCode, resp.error?.message);
                    if (errorCode === 'messaging/invalid-registration-token' ||
                        errorCode === 'messaging/registration-token-not-registered') {
                        const tokenDoc = devicesSnapshot.docs.find(d => d.data().token === tokens[idx]);
                        if (tokenDoc) tokenDoc.ref.delete();
                    }
                }
            });
        }

        console.log('[sendTestNotification] done:', response.successCount, '/', tokens.length);

        return res.json({
            ok: true,
            devices: tokens.length,
            success: response.successCount,
            failure: response.failureCount
        });
    } catch (err) {
        console.error('[sendTestNotification] error:', err.message);
        return res.status(500).json({ error: 'Lỗi gửi thông báo: ' + err.message });
    }
};
