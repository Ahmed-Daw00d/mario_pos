// src/hooks/useTables.js — Real-time tables listener
import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

export function useTables() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'tables'), orderBy('table_number')),
      (snap) => {
        setTables(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => { console.error('Tables listener error:', err); setLoading(false); }
    );
    return () => unsub();
  }, []);

  const availableTables = tables.filter(t => t.status === 'available');
  const occupiedTables  = tables.filter(t => t.status === 'occupied');
  const waitingTables   = tables.filter(t => t.status === 'waiting_payment');

  return { tables, availableTables, occupiedTables, waitingTables, loading };
}
