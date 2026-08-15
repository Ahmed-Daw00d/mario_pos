// src/hooks/useMenu.js — Real-time menu and ingredients listener
import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

export function useMenu() {
  const [menuItems, setMenuItems] = useState([]);
  const [ingredients, setIngredients] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubMenu = onSnapshot(
      query(collection(db, 'menu_items'), orderBy('sort_order')),
      (snap) => {
        setMenuItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => console.error('Menu listener error:', err)
    );

    const unsubIngredients = onSnapshot(
      collection(db, 'ingredients'),
      (snap) => {
        const map = {};
        snap.docs.forEach(d => { map[d.id] = { id: d.id, ...d.data() }; });
        setIngredients(map);
      },
      (err) => console.error('Ingredients listener error:', err)
    );

    return () => { unsubMenu(); unsubIngredients(); };
  }, []);

  const pizzas    = menuItems.filter(i => i.category === 'pizza');
  const kebab     = menuItems.find(i => i.category === 'kebab');
  const fritti    = menuItems.filter(i => i.category === 'fritti');
  const bevande   = menuItems.filter(i => i.category === 'bevande');

  return { pizzas, kebab, fritti, bevande, ingredients, menuItems, loading };
}
