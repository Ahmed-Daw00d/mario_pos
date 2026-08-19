// src/firebase.js — Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// Reads from .env.local in dev / Vercel env vars in production
// Falls back to hardcoded values so the app never breaks
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            || "AIzaSyCml_af3wFrhJH-pygfYLWyIVt5mhPWx8c",
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN        || "casher-1fb4a.firebaseapp.com",
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID         || "casher-1fb4a",
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     || "casher-1fb4a.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID|| "575674491188",
  appId:             import.meta.env.VITE_FIREBASE_APP_ID             || "1:575674491188:web:34be71f443d8363d924561",
  databaseURL:       import.meta.env.VITE_FIREBASE_DATABASE_URL       || "https://casher-1fb4a-default-rtdb.firebaseio.com/",
};

const app = initializeApp(firebaseConfig);
export const db   = getFirestore(app);
export const auth = getAuth(app);
export const rtdb = getDatabase(app);
export default app;
