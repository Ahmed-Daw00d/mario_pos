// src/contexts/SessionContext.jsx — Table session management
import { createContext, useContext, useState, useEffect } from 'react';
import {
  doc, getDoc, setDoc, updateDoc, onSnapshot, serverTimestamp, collection, runTransaction
} from 'firebase/firestore';
import { db } from '../firebase';
import { usePresence } from '../hooks/usePresence';

const SessionContext = createContext(null);

export function SessionProvider({ tableId, children }) {
  const [session, setSession]       = useState(null);
  const [tableData, setTableData]   = useState(null);
  const [loading, setLoading]       = useState(true);

  // Mark table as online if someone is viewing this page
  usePresence(tableId ? `presence/tables/${tableId}` : null);

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
    try {
      await runTransaction(db, async (transaction) => {
        const tableRef = doc(db, 'tables', tblId);
        const tableDoc = await transaction.get(tableRef);
        if (!tableDoc.exists()) throw new Error("Table doesn't exist");
        
        // Prevent race condition: if someone else created it fractions of a second ago
        if (tableDoc.data().active_session_id) {
          return; // Let the onSnapshot handle the newly assigned session
        }

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

        transaction.set(sessionRef, sessionData);
        transaction.update(tableRef, {
          status: 'occupied',
          active_session_id: sessionRef.id,
        });

        // Local state will be updated by the onSnapshot listener naturally
      });
    } catch (e) {
      console.error("Error creating session transactionally", e);
    }
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
