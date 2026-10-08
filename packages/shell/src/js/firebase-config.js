// ============================================
// Firebase Configuration
// ============================================

// Reference global firebase from CDN (loaded in index.html before this module)
const firebase = window.firebase;

// NOTE: Đây là giá trị PLACEHOLDER cho mục đích bài tập.
// Thay bằng cấu hình Firebase của bạn (Firebase Console → Project settings → Your apps).
// KHÔNG commit key/config thật của production lên repo công khai.
const firebaseConfig = {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.firebasestorage.app",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const auth = firebase.auth();
const db = firebase.firestore();

// Enable Firestore offline persistence (chạy nền — không chặn UI)
db.enablePersistence({ synchronizeTabs: true })
    .then(() => {
        console.log('[Firebase] Offline persistence enabled');
    })
    .catch((err) => {
        if (err.code === 'failed-precondition') {
            console.warn('[Firebase] Multiple tabs open, persistence can only be enabled in one tab at a time.');
        } else if (err.code === 'unimplemented') {
            console.warn('[Firebase] Browser does not support persistence.');
        }
    });

// Auth state persistence - LOCAL: lưu vào IndexedDB, persist sau khi đóng trình duyệt.
// Promise này resolve nhanh; ta lưu để App.init() có thể await trước khi đăng ký onAuthStateChanged.
const authPersistenceReady = auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .catch((err) => {
        console.warn('[Firebase] setPersistence error:', err);
    });

console.log('[Firebase] Initialized successfully');


export { db, auth, firebase, authPersistenceReady };
