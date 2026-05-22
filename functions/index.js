const admin = require('firebase-admin');
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const logger = require('firebase-functions/logger');

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const TARGET_FOLDER = 'space';
const TARGET_WORDS = new Set(['microgravity', 'void', 'habitable']);
const DEFAULT_ALLOWED_UIDS = new Set();
const DEFAULT_ALLOWED_EMAILS = new Set();

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

function parseAllowList(raw) {
  return new Set(
    String(raw || '')
      .split(',')
      .map(item => normalize(item))
      .filter(Boolean)
  );
}

function isAuthorized(request) {
  const auth = request.auth || {};
  const token = auth.token || {};
  const uid = auth.uid || '';
  const email = normalize(token.email);
  const allowedUids = parseAllowList(process.env.SPACE_DUPLICATE_CLEANUP_ALLOWED_UIDS);
  const allowedEmails = parseAllowList(process.env.SPACE_DUPLICATE_CLEANUP_ALLOWED_EMAILS);

  if (token.admin === true) return true;
  if (allowedUids.size > 0 && allowedUids.has(uid)) return true;
  if (allowedEmails.size > 0 && allowedEmails.has(email)) return true;

  return false;
}

function buildIdentityKey(card) {
  const fv = card.fieldValues || {};
  const word = normalize(fv.word || card.word || card.front);
  const folderId = normalize(card.folderId || fv.folderId || fv.topicId);
  const partOfSpeech = normalize(fv.partOfSpeech);

  if (folderId !== TARGET_FOLDER) return '';
  if (!TARGET_WORDS.has(word)) return '';

  return ['vocabulary', word, folderId, partOfSpeech].join('::');
}

function getCreatedAtMillis(card) {
  const createdAt = card.createdAt;

  if (!createdAt) return 0;
  if (typeof createdAt.toMillis === 'function') return createdAt.toMillis();
  if (typeof createdAt.seconds === 'number') {
    return createdAt.seconds * 1000 + Math.floor((createdAt.nanoseconds || 0) / 1000000);
  }
  if (typeof createdAt === 'number') return createdAt;

  const parsed = Date.parse(createdAt);
  return Number.isNaN(parsed) ? 0 : parsed;
}

async function collectTargetCardsForUser(uid) {
  const snapshot = await db.collectionGroup('cards').where('folderId', '==', TARGET_FOLDER).get();
  const targets = [];

  snapshot.forEach((doc) => {
    if (!doc.ref.path.startsWith(`users/${uid}/cards/`)) return;
    const data = doc.data() || {};
    const fv = data.fieldValues || {};
    const word = normalize(fv.word || data.word || data.front);

    if (!TARGET_WORDS.has(word)) return;
    targets.push({ id: doc.id, ref: doc.ref, path: doc.ref.path, data });
  });

  return targets;
}

function groupDuplicates(cards) {
  const map = new Map();

  for (const card of cards) {
    const key = buildIdentityKey(card.data || {});
    if (!key) continue;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(card);
  }

  return [...map.entries()]
    .filter(([, group]) => group.length > 1)
    .map(([key, group]) => {
      const sorted = [...group].sort((a, b) => {
        const timeA = getCreatedAtMillis(a.data || {});
        const timeB = getCreatedAtMillis(b.data || {});
        if (timeA !== timeB) return timeA - timeB;
        return String(a.id).localeCompare(String(b.id));
      });

      return {
        key,
        keep: sorted[0],
        remove: sorted.slice(1)
      };
    });
}

exports.cleanupSpaceDuplicateWords = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Cần đăng nhập để chạy cleanup.');
  }

  const targetUid = normalize(request.data && request.data.targetUid) || request.auth.uid;
  const dryRun = !!(request.data && request.data.dryRun);

  if (targetUid !== request.auth.uid && !isAuthorized(request)) {
    throw new HttpsError('permission-denied', 'Không có quyền cleanup cho user khác.');
  }

  if (targetUid === request.auth.uid) {
    const email = normalize(request.auth.token && request.auth.token.email);
    const allowedUids = parseAllowList(process.env.SPACE_DUPLICATE_CLEANUP_ALLOWED_UIDS);
    const allowedEmails = parseAllowList(process.env.SPACE_DUPLICATE_CLEANUP_ALLOWED_EMAILS);
    const adminClaim = request.auth.token && request.auth.token.admin === true;

    if (!adminClaim && allowedUids.size > 0 && !allowedUids.has(targetUid) && !(allowedEmails.size > 0 && allowedEmails.has(email))) {
      logger.warn('[cleanupSpaceDuplicateWords] blocked request', {
        uid: request.auth.uid,
        email,
        targetUid
      });
      throw new HttpsError('permission-denied', 'Tài khoản hiện tại chưa được phép chạy cleanup này.');
    }
  }

  logger.info('[cleanupSpaceDuplicateWords] start', {
    uid: request.auth.uid,
    targetUid,
    dryRun
  });

  const targets = await collectTargetCardsForUser(targetUid);
  const duplicateGroups = groupDuplicates(targets);
  const removeCards = duplicateGroups.flatMap(group => group.remove);

  const preview = duplicateGroups.map(group => ({
    key: group.key,
    keep: {
      id: group.keep.id,
      path: group.keep.path,
      word: group.keep.data.fieldValues && group.keep.data.fieldValues.word,
      createdAt: getCreatedAtMillis(group.keep.data || {})
    },
    remove: group.remove.map(card => ({
      id: card.id,
      path: card.path,
      word: card.data.fieldValues && card.data.fieldValues.word,
      createdAt: getCreatedAtMillis(card.data || {})
    }))
  }));

  if (dryRun) {
    return {
      ok: true,
      dryRun: true,
      targetUid,
      scanned: targets.length,
      duplicateGroups: duplicateGroups.length,
      deleteCount: removeCards.length,
      preview
    };
  }

  let deleted = 0;
  for (const card of removeCards) {
    await card.ref.delete();
    deleted += 1;
  }

  logger.info('[cleanupSpaceDuplicateWords] done', {
    uid: request.auth.uid,
    targetUid,
    scanned: targets.length,
    duplicateGroups: duplicateGroups.length,
    deleted
  });

  return {
    ok: true,
    dryRun: false,
    targetUid,
    scanned: targets.length,
    duplicateGroups: duplicateGroups.length,
    deleted,
    preview
  };
});

// ============================================
// Push Notification - Review Reminder
// ============================================
// Chạy mỗi 15 phút, check user nào có cards due (state>=1, dueDate<=now),
// gửi FCM push notification (tối đa 1 lần/ngày/user, theo timezone của user).
//
// Notification body cố định "Có từ cần ôn tập" — không tiết lộ số lượng / từ nào.

exports.sendReviewReminders = onSchedule({
  schedule: 'every 15 minutes',
  timeZone: 'Asia/Ho_Chi_Minh',
  retryCount: 1,
  memory: '256MiB'
}, async (event) => {
  const now = new Date();
  const messaging = admin.messaging();

  logger.info('[sendReviewReminders] Starting...', { time: now.toISOString() });

  try {
    // Query tất cả users có bật notification
    const usersSnapshot = await db.collection('users')
      .where('notificationSettings.enabled', '==', true)
      .get();

    if (usersSnapshot.empty) {
      logger.info('[sendReviewReminders] No users with notifications enabled');
      return;
    }

    let sentCount = 0;
    let skipCount = 0;

    for (const userDoc of usersSnapshot.docs) {
      try {
        const userData = userDoc.data();
        const settings = userData.notificationSettings || {};
        const timezone = settings.timezone || 'Asia/Saigon';

        // Dedup theo ngày (theo timezone user) — 1 lần/ngày là đủ,
        // tránh spam khi cron chạy mỗi 15 phút.
        const todayKey = getTodayKey(timezone);
        if (settings.lastNotifiedDate === todayKey) {
          skipCount++;
          continue;
        }

        // Check có cards due không (chỉ cần biết có/không, không cần đếm chính xác)
        const hasDue = await hasDueCards(userDoc.id);
        if (!hasDue) {
          skipCount++;
          continue;
        }

        // Lấy tất cả device tokens của user
        const devicesSnapshot = await db.collection('users').doc(userDoc.id)
          .collection('devices').get();

        if (devicesSnapshot.empty) {
          skipCount++;
          continue;
        }

        // Gửi notification tới tất cả devices
        const tokens = devicesSnapshot.docs.map(d => d.data().token).filter(Boolean);
        if (tokens.length === 0) {
          skipCount++;
          continue;
        }

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
            fcmOptions: {
              link: '/#/review'
            },
            notification: {
              icon: '/icons/icon-192.png',
              badge: '/icons/icon-96.png',
              tag: 'review-reminder',
              renotify: true,
              requireInteraction: false
            }
          }
        };

        // Gửi multicast
        const response = await messaging.sendEachForMulticast({
          tokens: tokens,
          ...message
        });

        // Xử lý tokens hết hạn
        if (response.failureCount > 0) {
          const failedTokens = [];
          response.responses.forEach((resp, idx) => {
            if (!resp.success) {
              const errorCode = resp.error?.code;
              if (errorCode === 'messaging/invalid-registration-token' ||
                  errorCode === 'messaging/registration-token-not-registered') {
                failedTokens.push(tokens[idx]);
              }
            }
          });

          // Xóa tokens hết hạn
          for (const failedToken of failedTokens) {
            const tokenDoc = devicesSnapshot.docs.find(d => d.data().token === failedToken);
            if (tokenDoc) {
              await tokenDoc.ref.delete();
              logger.info('[sendReviewReminders] Removed expired token', { uid: userDoc.id });
            }
          }
        }

        // Cập nhật lastNotifiedDate
        await db.collection('users').doc(userDoc.id).update({
          'notificationSettings.lastNotifiedDate': todayKey
        });

        sentCount++;
        logger.info('[sendReviewReminders] Sent to user', {
          uid: userDoc.id,
          devices: tokens.length,
          success: response.successCount
        });

      } catch (userErr) {
        logger.error('[sendReviewReminders] Error for user', {
          uid: userDoc.id,
          error: userErr.message
        });
      }
    }

    logger.info('[sendReviewReminders] Done', { sentCount, skipCount });
  } catch (err) {
    logger.error('[sendReviewReminders] Fatal error', { error: err.message });
  }
});

/**
 * Lấy key ngày hôm nay theo timezone (YYYY-MM-DD)
 */
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

/**
 * Check xem user có cards nào tới hạn ôn tập không (chỉ cần biết có/không).
 * Trả true ngay khi tìm thấy 1 card đầu tiên — không quan tâm số lượng.
 */
async function hasDueCards(uid) {
  try {
    const now = new Date();
    // Query chỉ dùng inequality trên 1 field (dueDate) để tránh cần composite index.
    // Filter state trong code — vì chỉ cần tìm 1 card due nên fetch batch nhỏ là đủ.
    const cardsSnapshot = await db.collection('users').doc(uid)
      .collection('cards')
      .where('dueDate', '<=', now)
      .limit(20)
      .get();

    if (cardsSnapshot.empty) return false;

    // Filter: chỉ đếm cards đã học (state >= 1, tức Learning/Review/Relearning)
    for (const doc of cardsSnapshot.docs) {
      const data = doc.data();
      const state = typeof data.state === 'number' ? data.state : 0;
      if (state >= 1) return true;
    }

    return false;
  } catch (err) {
    logger.warn('[hasDueCards] Error:', { uid, error: err.message });
    return false;
  }
}

// ============================================
// Test Notification - gửi thông báo ngay (không cần chờ cron)
// ============================================
exports.sendTestNotification = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Cần đăng nhập để gửi thông báo thử.');
  }

  const uid = request.auth.uid;
  logger.info('[sendTestNotification] start', { uid });

  // Lấy tất cả device tokens của user
  const devicesSnapshot = await db.collection('users').doc(uid)
    .collection('devices').get();

  if (devicesSnapshot.empty) {
    logger.warn('[sendTestNotification] no devices', { uid });
    throw new HttpsError('failed-precondition',
      'Chưa có thiết bị nào đăng ký nhận thông báo. Hãy bật notification toggle trong Cài đặt.');
  }

  const tokens = devicesSnapshot.docs.map(d => d.data().token).filter(Boolean);
  if (tokens.length === 0) {
    throw new HttpsError('failed-precondition', 'Không tìm thấy FCM token hợp lệ.');
  }

  const messaging = admin.messaging();
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
    const response = await messaging.sendEachForMulticast({ tokens, ...message });

    // Cleanup expired tokens
    if (response.failureCount > 0) {
      const failedTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const errorCode = resp.error?.code;
          logger.warn('[sendTestNotification] token failed', {
            uid, errorCode, message: resp.error?.message
          });
          if (errorCode === 'messaging/invalid-registration-token' ||
              errorCode === 'messaging/registration-token-not-registered') {
            failedTokens.push(tokens[idx]);
          }
        }
      });
      for (const failedToken of failedTokens) {
        const tokenDoc = devicesSnapshot.docs.find(d => d.data().token === failedToken);
        if (tokenDoc) await tokenDoc.ref.delete();
      }
    }

    logger.info('[sendTestNotification] done', {
      uid,
      devices: tokens.length,
      success: response.successCount,
      failure: response.failureCount
    });

    return {
      ok: true,
      devices: tokens.length,
      success: response.successCount,
      failure: response.failureCount
    };
  } catch (err) {
    logger.error('[sendTestNotification] error', { uid, error: err.message });
    throw new HttpsError('internal', `Lỗi gửi thông báo: ${err.message}`);
  }
});
