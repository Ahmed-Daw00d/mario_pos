// src/firebase.js — Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyCml_af3wFrhJH-pygfYLWyIVt5mhPWx8c",
  authDomain: "casher-1fb4a.firebaseapp.com",
  projectId: "casher-1fb4a",
  storageBucket: "casher-1fb4a.firebasestorage.app",
  messagingSenderId: "575674491188",
  appId: "1:575674491188:web:34be71f443d8363d924561",
  databaseURL: "https://casher-1fb4a-default-rtdb.firebaseio.com/"
};

const app = initializeApp(firebaseConfig);
export const db  = getFirestore(app);
export const auth = getAuth(app);
export const rtdb = getDatabase(app);
export default app;
