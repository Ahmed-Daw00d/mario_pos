import { useEffect, useState, useRef } from 'react';
import { ref, onValue, onDisconnect, set, serverTimestamp, push } from 'firebase/database';
import { rtdb } from '../firebase';

export function usePresence(nodePath, data = {}) {
  const [isConnected, setIsConnected] = useState(false);
  // Use a ref to hold the latest data to avoid re-subscribing on every render
  const dataRef = useRef(data);
  useEffect(() => { dataRef.current = data; });

  useEffect(() => {
    if (!nodePath) return;

    const connectedRef = ref(rtdb, '.info/connected');
    const myRef = ref(rtdb, nodePath);

    const unsub = onValue(connectedRef, (snap) => {
      if (snap.val() === true) {
        setIsConnected(true);
        // When I disconnect, remove this node
        onDisconnect(myRef).remove().then(() => {
          // When connected, set presence to true and add data
          set(myRef, {
            isOnline: true,
            lastSeen: serverTimestamp(),
            ...dataRef.current
          });
        });
      } else {
        setIsConnected(false);
      }
    });

    return () => {
      unsub();
      // On unmount, manually clean up
      set(myRef, null);
    };
  }, [nodePath]); // Only re-subscribe when the path changes, not on every data update

  return isConnected;
}

export function usePresenceListener(nodePath) {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!nodePath) return;
    const nodeRef = ref(rtdb, nodePath);
    const unsub = onValue(nodeRef, (snap) => {
      setData(snap.val());
    });
    return () => unsub();
  }, [nodePath]);

  return data;
}

export function sendPing(target) {
  if (!target) return;
  const pingsRef = ref(rtdb, `pings/${target}`);
  push(pingsRef, {
    timestamp: serverTimestamp(),
  });
}

export function usePingListener(target, onPing) {
  useEffect(() => {
    if (!target) return;
    const pingsRef = ref(rtdb, `pings/${target}`);
    
    // We only want to listen to NEW pings, but RTDB onValue returns all.
    // Instead of complex queries, we can just track the latest timestamp.
    let isInitialLoad = true;
    const unsub = onValue(pingsRef, (snap) => {
      if (isInitialLoad) {
        isInitialLoad = false;
        return;
      }
      if (snap.exists()) {
        const pings = snap.val();
        const keys = Object.keys(pings);
        if (keys.length > 0) {
          onPing();
          // Clear pings after receiving to avoid buildup
          set(pingsRef, null);
        }
      }
    });

    return () => unsub();
  }, [target, onPing]);
}
