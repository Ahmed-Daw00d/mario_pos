// src/contexts/SessionContext.jsx — Table session management
import { createContext, useContext, useState, useEffect } from 'react';
import {
  doc, getDoc, setDoc, updateDoc, onSnapshot, serverTimestamp, collection
} from 'firebase/firestore';
import { db } from '../firebase';

const SessionContext = createContext(null);

export function SessionProvider({ tableId, children }) {
  const [session, setSession]       = useState(null);
  const [tableData, setTableData]   = useState(null);
  const [loading, setLoading]       = useState(true);

  // Listen to table document in real-time
  useEffect(() => {
    if (!tableId) return;
    const unsub = onSnapshot(doc(db, 'tables', tableId), async (snap) => {
      if (!snap.exists()) { setLoading(false); return; }
      const table = { id: snap.id, ...snap.data() };
      setTableData(table);

      if (table.active_session_id) {
        // Listen to active session
        const sessionSnap = await getDoc(doc(db, 'sessions', table.active_session_id));
        if (sessionSnap.exists()) {
          setSession({ id: sessionSnap.id, ...sessionSnap.data() });
        }
      } else {
        // No session — create one
        await createNewSession(tableId, table.table_number);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [tableId]);

  // Also keep session in real-time
  useEffect(() => {
    if (!session?.id) return;
    const unsub = onSnapshot(doc(db, 'sessions', session.id), (snap) => {
      if (snap.exists()) setSession({ id: snap.id, ...snap.data() });
    });
    return () => unsub();
  }, [session?.id]);

  async function createNewSession(tblId, tblNumber) {
    const sessionRef = doc(collection(db, 'sessions'));
    const sessionData = {
      id: sessionRef.id,
      table_id: tblId,
      table_number: tblNumber,
      started_at: serverTimestamp(),
      closed_at: null,
      status: 'open',
      total_amount: 0,
      order_ids: [],
    };
    await setDoc(sessionRef, sessionData);
    await updateDoc(doc(db, 'tables', tblId), {
      status: 'occupied',
      active_session_id: sessionRef.id,
    });
    setSession(sessionData);
  }

  async function requestBill() {
    if (!session?.id) return;
    await updateDoc(doc(db, 'sessions', session.id), { status: 'requesting_bill' });
  }

  return (
    <SessionContext.Provider value={{ session, tableData, loading, requestBill }}>
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within SessionProvider');
  return ctx;
};
