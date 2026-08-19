// src/contexts/CartContext.jsx — Shopping cart state management
import { createContext, useContext, useReducer, useCallback } from 'react';
import {
  collection, doc, setDoc, updateDoc, serverTimestamp, increment, arrayUnion
} from 'firebase/firestore';
import { db } from '../firebase';


const CartContext = createContext(null);

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM':
      return { ...state, items: [...state.items, { ...action.payload, cartId: Date.now() + Math.random() }] };
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(i => i.cartId !== action.cartId) };
    case 'UPDATE_QUANTITY': {
      return {
        ...state,
        items: state.items.map(i =>
          i.cartId === action.cartId ? { ...i, quantity: action.quantity } : i
        ).filter(i => i.quantity > 0)
      };
    }
    case 'CLEAR':
      return { ...state, items: [] };
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, { items: [] });

  const addItem    = useCallback((item) => dispatch({ type: 'ADD_ITEM', payload: item }), []);
  const removeItem = useCallback((cartId) => dispatch({ type: 'REMOVE_ITEM', cartId }), []);
  const updateQty  = useCallback((cartId, quantity) => dispatch({ type: 'UPDATE_QUANTITY', cartId, quantity }), []);
  const clearCart  = useCallback(() => dispatch({ type: 'CLEAR' }), []);

  const cartTotal = cart.items.reduce((sum, item) => sum + item.total_price * item.quantity, 0);
  const cartCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  // Submit cart as a dine-in order to Firestore
  async function submitOrder(sessionId, tableId, tableNumber) {
    if (cart.items.length === 0) return null;

    const orderRef  = doc(collection(db, 'orders'));
    const subtotal  = cartTotal;
    const orderData = {
      id: orderRef.id,
      session_id: sessionId,
      table_id: tableId,
      table_number: tableNumber,
      type: 'dine_in',
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
      status: 'pending',
      items: cart.items,
      subtotal,
      notes: '',
    };

    await setDoc(orderRef, orderData);

    await updateDoc(doc(db, 'sessions', sessionId), {
      total_amount: increment(subtotal),
      order_ids: arrayUnion(orderRef.id),
    }).catch(() => {});

    clearCart();
    return orderRef.id;
  }

  // Submit cart as a takeaway order to Firestore
  async function submitTakeawayOrder(sessionId, customerName, phone) {
    if (cart.items.length === 0) return null;

    const orderRef = doc(collection(db, 'orders'));
    const subtotal = cartTotal;
    const orderData = {
      id:            orderRef.id,
      session_id:    sessionId,
      table_id:      null,
      table_number:  null,
      type:          'takeaway',
      customer_name: customerName,
      phone:         phone || null,
      created_at:    serverTimestamp(),
      updated_at:    serverTimestamp(),
      status:        'pending',
      items:         cart.items,
      subtotal,
      notes:         '',
    };

    await setDoc(orderRef, orderData);

    await updateDoc(doc(db, 'sessions', sessionId), {
      total_amount: increment(subtotal),
      order_ids:    arrayUnion(orderRef.id),
    }).catch(() => {});

    clearCart();
    return orderRef.id;
  }

  return (
    <CartContext.Provider value={{
      cart, addItem, removeItem, updateQty, clearCart,
      cartTotal, cartCount, submitOrder, submitTakeawayOrder
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
