// ============================================
// Firebase Configuration
// ============================================

// Reference global firebase from CDN (loaded in index.html before this module)
const firebase = window.firebase;

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const missingConfig = Object.entries(firebaseConfig)
    .filter(([, value]) => !value)
    .map(([key]) => key);

if (missingConfig.length > 0) {
    throw new Error(`[Firebase] Missing configuration: ${missingConfig.join(', ')}`);
}

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
