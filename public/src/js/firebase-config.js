// ============================================
// Firebase Configuration
// ============================================
// TODO: Replace with your Firebase project config
// Go to Firebase Console > Project Settings > Your apps > Firebase SDK snippet

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const auth = firebase.auth();
const db = firebase.firestore();

// Enable Firestore offline persistence
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

// Auth state persistence - LOCAL means persists even after browser close
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

console.log('[Firebase] Initialized successfully');
