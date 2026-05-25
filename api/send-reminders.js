// ============================================
// Vercel Serverless Function: Send Review Reminders
// ============================================
// Được gọi bởi cron-job.org mỗi 15 phút.
// Check user nào có cards due → gửi FCM push notification.
// Bảo vệ bằng CRON_SECRET env var.

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
    // Chỉ cho phép GET/POST
    if (req.method !== 'GET' && req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Verify CRON_SECRET
    const secret = req.headers['x-cron-secret'] || req.query.secret;
    if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const now = new Date();
    console.log('[sendReviewReminders] Starting...', now.toISOString());

    try {
        // Query tất cả users có bật notification
        const usersSnapshot = await db.collection('users')
            .where('notificationSettings.enabled', '==', true)
            .get();

        if (usersSnapshot.empty) {
            return res.json({ ok: true, message: 'No users with notifications enabled', sent: 0, skipped: 0 });
        }

        let sentCount = 0;
        let skipCount = 0;

        for (const userDoc of usersSnapshot.docs) {
            try {
                const userData = userDoc.data();
                const settings = userData.notificationSettings || {};
                const timezone = settings.timezone || 'Asia/Saigon';

                // Dedup theo ngày — 1 lần/ngày
                const todayKey = getTodayKey(timezone);
                if (settings.lastNotifiedDate === todayKey) {
                    skipCount++;
                    continue;
                }

                // Check có cards due không
                const hasDue = await hasDueCards(userDoc.id);
                if (!hasDue) {
                    skipCount++;
                    continue;
                }

                // Lấy device tokens
                const devicesSnapshot = await db.collection('users').doc(userDoc.id)
                    .collection('devices').get();

                if (devicesSnapshot.empty) {
                    skipCount++;
                    continue;
                }

                const tokens = devicesSnapshot.docs.map(d => d.data().token).filter(Boolean);
                if (tokens.length === 0) {
                    skipCount++;
                    continue;
                }

                // Gửi notification
                const message = {
                    notification: {
                        title: 'LinguaFlash',
                        body: 'Có từ cần ôn tập 📚'
                    },
                    data: {
                        type: 'review_reminder',
                        url: '/#/review',
                        timestamp: String(Date.now())
                    },
                    webpush: {
                        fcmOptions: { link: '/#/review' },
                        notification: {
                            icon: '/icons/icon-192.png',
                            badge: '/icons/icon-96.png',
                            tag: 'review-reminder',
                            renotify: true,
                            requireInteraction: false
                        }
                    }
                };

                const response = await admin.messaging().sendEachForMulticast({ tokens, ...message });

                // Cleanup expired tokens
                if (response.failureCount > 0) {
                    response.responses.forEach((resp, idx) => {
                        if (!resp.success) {
                            const errorCode = resp.error?.code;
                            if (errorCode === 'messaging/invalid-registration-token' ||
                                errorCode === 'messaging/registration-token-not-registered') {
                                const tokenDoc = devicesSnapshot.docs.find(d => d.data().token === tokens[idx]);
                                if (tokenDoc) tokenDoc.ref.delete();
                            }
                        }
                    });
                }

                // Cập nhật lastNotifiedDate
                await db.collection('users').doc(userDoc.id).update({
                    'notificationSettings.lastNotifiedDate': todayKey
                });

                sentCount++;
                console.log(`[sendReviewReminders] Sent to ${userDoc.id}: ${response.successCount}/${tokens.length}`);

            } catch (userErr) {
                console.error(`[sendReviewReminders] Error for ${userDoc.id}:`, userErr.message);
            }
        }

        return res.json({ ok: true, sent: sentCount, skipped: skipCount });
    } catch (err) {
        console.error('[sendReviewReminders] Fatal error:', err.message);
        return res.status(500).json({ error: err.message });
    }
};

function getTodayKey(timezone) {
    try {
        const formatter = new Intl.DateTimeFormat('en-CA', {
            timeZone: timezone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
        return formatter.format(new Date());
    } catch {
        return new Date().toISOString().split('T')[0];
    }
}

async function hasDueCards(uid) {
    try {
        const now = new Date();
        const cardsSnapshot = await db.collection('users').doc(uid)
            .collection('cards')
            .where('dueDate', '<=', now)
            .limit(20)
            .get();

        if (cardsSnapshot.empty) return false;

        for (const doc of cardsSnapshot.docs) {
            const data = doc.data();
            const state = typeof data.state === 'number' ? data.state : 0;
            if (state >= 1) return true;
        }
        return false;
    } catch (err) {
        console.warn('[hasDueCards] Error:', uid, err.message);
        return false;
    }
}
