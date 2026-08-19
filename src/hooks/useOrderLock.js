import { useEffect, useState } from 'react';
import { ref, set, onValue, serverTimestamp, onDisconnect } from 'firebase/database';
import { rtdb } from '../firebase';

export function useOrderLock(orderId, cashierName) {
  const [lockedBy, setLockedBy] = useState(null);

  useEffect(() => {
    if (!orderId || !cashierName) return;

    const lockRef = ref(rtdb, `locks/orders/${orderId}`);

    // Listen to changes on the lock
    const unsub = onValue(lockRef, (snap) => {
      const data = snap.val();
      if (data) {
        if (data.cashierName !== cashierName) {
          setLockedBy(data.cashierName);
        } else {
          setLockedBy(null);
        }
      } else {
        setLockedBy(null);
      }
    });

    return () => unsub();
  }, [orderId, cashierName]);

  const acquireLock = async () => {
    if (!orderId || !cashierName || lockedBy) return false;
    const lockRef = ref(rtdb, `locks/orders/${orderId}`);
    try {
      await set(lockRef, {
        cashierName,
        timestamp: serverTimestamp()
      });
      // Clear lock on disconnect
      onDisconnect(lockRef).remove();
      return true;
    } catch (e) {
      return false;
    }
  };

  const releaseLock = async () => {
    if (!orderId || lockedBy) return;
    const lockRef = ref(rtdb, `locks/orders/${orderId}`);
    try {
      await set(lockRef, null);
      onDisconnect(lockRef).cancel();
    } catch (e) {}
  };

  return { lockedBy, acquireLock, releaseLock };
}
