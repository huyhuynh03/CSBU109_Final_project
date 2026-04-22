// ============================================
// Firebase Configuration
// ============================================

const firebaseConfig = {
    apiKey: "AIzaSyB0owP69y_XqcUwqHx2kD2xJRSeGEqSC6A",
    authDomain: "linguaflash-f5591.firebaseapp.com",
    projectId: "linguaflash-f5591",
    storageBucket: "linguaflash-f5591.firebasestorage.app",
    messagingSenderId: "273192376743",
    appId: "1:273192376743:web:b037c9abaaf9f270923e82",
    measurementId: "G-ZFEY0QC9L1"
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
