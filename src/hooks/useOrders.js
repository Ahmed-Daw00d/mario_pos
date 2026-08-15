// src/hooks/useOrders.js — Real-time orders listener (used by KDS and Customer)
import { useState, useEffect } from 'react';
import {
  collection, onSnapshot, query, where, orderBy,
  doc, updateDoc, serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';

// Kitchen: listen to all active orders (not served)
export function useKitchenOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'orders'),
      where('status', 'in', ['pending','in_preparation','in_oven','ready'])
    );
    const unsub = onSnapshot(q, (snap) => {
      let docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      docs.sort((a, b) => (a.created_at?.toMillis?.() || 0) - (b.created_at?.toMillis?.() || 0));
      setOrders(docs);
      setLoading(false);
    }, err => { console.error(err); setLoading(false); });
    return () => unsub();
  }, []);

  return { orders, loading };
}

// Customer: listen to orders for a specific session
export function useSessionOrders(sessionId) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) { setLoading(false); return; }
    const q = query(
      collection(db, 'orders'),
      where('session_id', '==', sessionId)
    );
    const unsub = onSnapshot(q, (snap) => {
      let docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      docs.sort((a, b) => (a.created_at?.toMillis?.() || 0) - (b.created_at?.toMillis?.() || 0));
      setOrders(docs);
      setLoading(false);
    }, err => { console.error(err); setLoading(false); });
    return () => unsub();
  }, [sessionId]);

  return { orders, loading };
}

// Cashier: listen to all orders for a session (including served)
export function useCashierSessionOrders(sessionId) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) { setLoading(false); return; }
    const q = query(
      collection(db, 'orders'),
      where('session_id', '==', sessionId)
    );
    const unsub = onSnapshot(q, (snap) => {
      let docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      docs.sort((a, b) => (a.created_at?.toMillis?.() || 0) - (b.created_at?.toMillis?.() || 0));
      setOrders(docs);
      setLoading(false);
    }, err => { console.error(err); setLoading(false); });
    return () => unsub();
  }, [sessionId]);

  return { orders, loading };
}

// Update order status (used by KDS)
export async function updateOrderStatus(orderId, newStatus) {
  const ref = doc(db, 'orders', orderId);
  await updateDoc(ref, {
    status: newStatus,
    updated_at: serverTimestamp()
  });
}
