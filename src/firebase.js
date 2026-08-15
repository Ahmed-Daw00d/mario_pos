// src/firebase.js — Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCml_af3wFrhJH-pygfYLWyIVt5mhPWx8c",
  authDomain: "casher-1fb4a.firebaseapp.com",
  projectId: "casher-1fb4a",
  storageBucket: "casher-1fb4a.firebasestorage.app",
  messagingSenderId: "575674491188",
  appId: "1:575674491188:web:34be71f443d8363d924561"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app;
