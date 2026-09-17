import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCGWe9GweTIR54yJUMyxN9bElo82-Hq_qc",
  authDomain: "devclass-ensino-profissiona.firebaseapp.com",
  projectId: "devclass-ensino-profissiona",
  storageBucket: "devclass-ensino-profissiona.firebasestorage.app",
  messagingSenderId: "849450041863",
  appId: "1:849450041863:web:2e760c5f7b741c720320a2"
};

// Check if credentials are set and are not placeholder values
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.apiKey !== 'your-api-key' &&
  firebaseConfig.apiKey.trim() !== ''
);

const app = isFirebaseConfigured
  ? (getApps().length === 0 ? initializeApp(firebaseConfig) : getApp())
  : null;

// Emails that must always hold the admin role, regardless of what role was
// picked at sign-up (e.g. the project owner signing in with Google).
export const ADMIN_EMAILS = ['antonioappleton@gmail.com'];

export const auth = app ? getAuth(app) : (null as any);
// The Firestore database for this project was created with the explicit id
// "default" rather than the SDK's implicit "(default)" database, so it must
// be addressed by name or the client fails with "Database '(default)' not found".
export const db = app ? getFirestore(app, 'default') : (null as any);
export default app;
