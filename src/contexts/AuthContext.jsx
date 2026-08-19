// src/contexts/AuthContext.jsx — Firebase Auth + Role-Based Access Control
import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [role, setRole]       = useState(null); // 'admin' | 'cashier' | null
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Fetch role from Firestore users collection
        try {
          const snap = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (snap.exists()) {
            setRole(snap.data().role || 'cashier');
          } else {
            // No doc → default to cashier role
            setRole('cashier');
          }
        } catch {
          setRole('cashier');
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  async function login(email, password) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function logout() {
    await signOut(auth);
  }

  const isAdmin   = role === 'admin';
  const isCashier = role === 'cashier' || role === 'admin'; // admin can do everything

  return (
    <AuthContext.Provider value={{ user, role, loading, login, logout, isAdmin, isCashier }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
