// Rudrax Cinema - Firebase configuration
// 1) Open Firebase Console -> Project settings -> Your apps -> Web app
// 2) Copy your firebaseConfig object below.
// 3) Do NOT put service-account/private keys here.

const firebaseConfig = {
  apiKey: "PASTE_YOUR_API_KEY",
  authDomain: "PASTE_YOUR_PROJECT.firebaseapp.com",
  projectId: "PASTE_YOUR_PROJECT_ID",
  storageBucket: "PASTE_YOUR_PROJECT.firebasestorage.app",
  messagingSenderId: "PASTE_YOUR_MESSAGING_SENDER_ID",
  appId: "PASTE_YOUR_APP_ID"
};

window.RUDRAX_FIREBASE_CONFIG = firebaseConfig;
