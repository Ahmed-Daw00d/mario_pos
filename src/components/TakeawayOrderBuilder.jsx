// src/components/TakeawayOrderBuilder.jsx
// Full-screen takeaway order builder with full PizzaCustomizer + KebabBuilder integration.
// Wrapped in its own CartProvider so it uses CartContext without polluting the customer cart.
import { useState } from 'react';
import { X, ShoppingBag, Send, Loader, Trash2, Minus, Plus } from 'lucide-react';
import { CartProvider, useCart } from '../contexts/CartContext';
import { useMenu } from '../hooks/useMenu';
import { PizzaCustomizer } from './customer/PizzaCustomizer';
import { KebabBuilder } from './customer/KebabBuilder';

// ─── Inner component (uses CartContext) ───────────────────────────────────────
function TakeawayOrderBuilderInner({ session, onClose, onOrderPlaced }) {
  const { cart, cartTotal, submitTakeawayOrder, removeItem, updateQty } = useCart();
  const { pizzas, kebab, fritti, bevande, ingredients, loading } = useMenu();

  const [activeCat, setActiveCat] = useState('pizza');
  const [selectedPizza, setSelectedPizza] = useState(null); // opens PizzaCustomizer
  const [showKebab, setShowKebab]         = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);

  const categories = [
    { id: 'pizza',   label: 'Pizza',   emoji: '🍕' },
    { id: 'kebab',   label: 'Kebab',   emoji: '🥙' },
    { id: 'fritti',  label: 'Fritti',  emoji: '🍟' },
    { id: 'bevande', label: 'Bevande', emoji: '🥤' },
  ];

  function itemsForCat() {
    if (activeCat === 'pizza')   return pizzas;
    if (activeCat === 'fritti')  return fritti;
    if (activeCat === 'bevande') return bevande;
    return [];
  }

  // For fritti/bevande: add directly without customizer
  function addSimpleItem(item) {
    const { addItem } = require; // will be replaced below
    void addItem; // suppress lint — we use useCart
  }

  async function handleSubmit() {
    if (!cart.items.length || !session?.id) return;
    setSubmitting(true);
    try {
      await submitTakeawayOrder(session.id, session.customer_name, session.phone);
      setSubmitted(true);
      onOrderPlaced?.();
      setTimeout(onClose, 2000);
    } catch (e) {
      console.error('Takeaway submit error:', e);
      alert('Errore nell\'invio. Riprova.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(8px)' }}
    >
      {/* Header */}
      <div className="bg-brand-card border-b border-white/10 px-5 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <ShoppingBag size={20} className="text-orange-400" />
          <div>
            <p className="font-bold text-white">🛍️ {session.customer_name}</p>
            {session.phone && <p className="text-xs text-white/40">{session.phone}</p>}
          </div>
        </div>
        <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10">
          <X size={18} className="text-white/60" />
        </button>
      </div>

      {/* Success State */}
      {submitted ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="text-7xl animate-bounce">✅</div>
          <h3 className="text-xl font-bold text-white">Ordine Inviato in Cucina!</h3>
          <p className="text-white/50">🛍️ {session.customer_name}</p>
        </div>
      ) : (
        <div className="flex flex-1 min-h-0">

          {/* ── LEFT: Menu ─────────────────────────────── */}
          <div className="flex-1 flex flex-col min-h-0 border-r border-white/10">
            {/* Category tabs */}
            <div className="flex gap-2 px-3 py-3 overflow-x-auto scrollbar-none border-b border-white/10 flex-shrink-0">
              {categories.map(c => (
                <button key={c.id} onClick={() => setActiveCat(c.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 transition-all
                    ${activeCat === c.id ? 'bg-orange-500 text-white' : 'bg-white/10 text-white/50 hover:bg-white/20'}`}>
                  {c.emoji} {c.label}
                </button>
              ))}
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
              {/* Pizza tab */}
              {activeCat === 'pizza' && pizzas.filter(p => p.is_available !== false).map(pizza => (
                <button key={pizza.id}
                  onClick={() => setSelectedPizza(pizza)}
                  className="w-full text-left card-hover p-3 flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-semibold text-white text-sm">{pizza.name_it}</p>
                    <p className="text-xs text-brand-gold">
                      Tonda €{pizza.base_price_tonda?.toFixed(2)}
                      {pizza.base_price_teglia && ` · Teglia €${pizza.base_price_teglia?.toFixed(2)}`}
                    </p>
                    <p className="text-xs text-white/30 italic mt-0.5">
                      Tocca per personalizzare →
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">🍕</span>
                  </div>
                </button>
              ))}

              {/* Kebab tab */}
              {activeCat === 'kebab' && (
                <button
                  onClick={() => setShowKebab(true)}
                  className="w-full text-left card-hover p-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">Kebab di Pollo</p>
                    <p className="text-xs text-brand-gold">Sandwich / Piatto — da €5.00</p>
                    <p className="text-xs text-white/30 italic mt-0.5">
                      Tocca per configurare →
                    </p>
                  </div>
                  <span className="text-3xl">🥙</span>
                </button>
              )}

              {/* Fritti & Bevande: simple add */}
              {(activeCat === 'fritti' || activeCat === 'bevande') && (
                <AddSimpleItems items={itemsForCat()} />
              )}
            </div>
          </div>

          {/* ── RIGHT: Cart ────────────────────────────── */}
          <CartSidebar
            cart={cart}
            cartTotal={cartTotal}
            submitting={submitting}
            onSubmit={handleSubmit}
            onRemove={removeItem}
            onUpdateQty={updateQty}
            ingredients={ingredients}
          />
        </div>
      )}

      {/* Pizza Customizer overlay */}
      {selectedPizza && (
        <PizzaCustomizer
          pizza={selectedPizza}
          ingredients={ingredients}
          onClose={() => setSelectedPizza(null)}
        />
      )}

      {/* Kebab Builder overlay */}
      {showKebab && (
        <KebabBuilder onClose={() => setShowKebab(false)} />
      )}
    </div>
  );
}

// ─── Simple items adder (fritti/bevande) — needs useCart ─────────────────────
function AddSimpleItems({ items }) {
  const { addItem } = useCart();
  return (
    <div className="space-y-2">
      {items.filter(i => i.is_available !== false).map(item => {
        const price = item.price || 0;
        return (
          <button key={item.id}
            onClick={() => addItem({
              item_id:             item.id,
              item_name:           item.name_it,
              category:            item.category || 'other',
              quantity:            1,
              size:                null,
              split_type:          null,
              splits:              null,
              removed_ingredients: [],
              added_ingredients:   [],
              unit_price:          price,
              total_price:         price,
              kebab_config:        null,
              notes:               '',
            })}
            className="w-full text-left card-hover p-3 flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-white text-sm">{item.name_it}</p>
              <p className="text-xs text-brand-gold">€{price.toFixed(2)}</p>
            </div>
            <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Plus size={14} className="text-white" />
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ─── Cart sidebar ─────────────────────────────────────────────────────────────
function CartSidebar({ cart, cartTotal, submitting, onSubmit, onRemove, onUpdateQty, ingredients }) {
  return (
    <div className="w-72 flex flex-col min-h-0">
      <div className="px-4 py-3 border-b border-white/10 flex-shrink-0">
        <p className="text-sm font-semibold text-white/60">
          Carrello ({cart.items.length} prodotti)
        </p>
      </div>

      {cart.items.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-white/30 text-sm text-center italic px-4">
            Aggiungi prodotti dal menu ←
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
          {cart.items.map(item => (
            <div key={item.cartId} className="bg-white/5 rounded-xl p-3">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white leading-tight">{item.item_name}</p>
                  {item.size && <p className="text-xs text-white/40 capitalize">{item.size}</p>}
                  {item.split_type && item.split_type !== 'whole' && item.splits && (
                    <div className="mt-1 space-y-0.5">
                      {item.splits.slice(0, item.split_type === 'half' ? 2 : 3).map((s, si) => (
                        <p key={si} className="text-xs text-white/40">Q{si+1}: {s.pizza_name}</p>
                      ))}
                    </div>
                  )}
                  {item.removed_ingredients?.length > 0 && (
                    <p className="text-xs text-red-400 mt-0.5">❌ {item.removed_ingredients.map(id => ingredients[id]?.name_it || id).join(', ')}</p>
                  )}
                  {item.added_ingredients?.length > 0 && (
                    <p className="text-xs text-green-400 mt-0.5">➕ {item.added_ingredients.map(id => ingredients[id]?.name_it || id).join(', ')}</p>
                  )}
                  {item.kebab_config && (
                    <p className="text-xs text-white/40 mt-0.5">🥙 {item.kebab_config.serving_style}</p>
                  )}
                </div>
                <button onClick={() => onRemove(item.cartId)}>
                  <Trash2 size={14} className="text-red-400 flex-shrink-0" />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-xs text-brand-gold font-bold">
                  €{(item.total_price * item.quantity).toFixed(2)}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onUpdateQty(item.cartId, item.quantity - 1)}
                    className="w-6 h-6 rounded-lg border border-white/20 flex items-center justify-center hover:bg-white/10">
                    <Minus size={10} />
                  </button>
                  <span className="text-sm font-bold w-4 text-center text-white">{item.quantity}</span>
                  <button
                    onClick={() => onUpdateQty(item.cartId, item.quantity + 1)}
                    className="w-6 h-6 rounded-lg bg-orange-500 flex items-center justify-center hover:bg-orange-600">
                    <Plus size={10} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Total + Submit */}
      <div className="border-t border-white/10 p-4 space-y-3 flex-shrink-0">
        <div className="flex justify-between items-center">
          <span className="text-white/60 text-sm">Totale</span>
          <span className="text-xl font-black text-brand-gold">€{cartTotal.toFixed(2)}</span>
        </div>
        <button
          onClick={onSubmit}
          disabled={submitting || cart.items.length === 0}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white
            bg-orange-500 hover:bg-orange-600 disabled:opacity-40 transition-all active:scale-95">
          {submitting ? <Loader size={16} className="animate-spin" /> : <Send size={16} />}
          {submitting ? 'Invio...' : 'Invia in Cucina'}
        </button>
      </div>
    </div>
  );
}

// ─── Exported component (wraps in isolated CartProvider) ─────────────────────
/**
 * @param {object} session — takeaway session from Firestore
 * @param {function} onClose
 * @param {function} onOrderPlaced — called when order is submitted
 */
export function TakeawayOrderBuilder({ session, onClose, onOrderPlaced }) {
  return (
    <CartProvider>
      <TakeawayOrderBuilderInner
        session={session}
        onClose={onClose}
        onOrderPlaced={onOrderPlaced}
      />
    </CartProvider>
  );
}
