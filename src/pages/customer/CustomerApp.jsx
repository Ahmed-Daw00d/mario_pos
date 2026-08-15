// src/pages/customer/CustomerApp.jsx — Italian as primary language
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ShoppingCart, UtensilsCrossed, Receipt, ListOrdered, ChevronRight } from 'lucide-react';
import { SessionProvider, useSession } from '../../contexts/SessionContext';
import { CartProvider, useCart } from '../../contexts/CartContext';
import { useMenu } from '../../hooks/useMenu';
import { useSessionOrders } from '../../hooks/useOrders';
import { LoadingScreen } from '../../components/ui/SharedUI';
import { PizzaCustomizer } from '../../components/customer/PizzaCustomizer';
import { KebabBuilder } from '../../components/customer/KebabBuilder';
import { FrittiCustomizer } from '../../components/customer/FrittiCustomizer';
import { OrderTracker } from '../../components/customer/OrderTracker';

// ─────────────────────────────────────────────
// MENU TAB
// ─────────────────────────────────────────────
function MenuTab() {
  const { pizzas, kebab, fritti, bevande, ingredients, loading } = useMenu();
  const { addItem } = useCart();
  const [activeCat, setActiveCat] = useState('pizza');
  const [selectedPizza, setSelectedPizza] = useState(null);
  const [selectedFritti, setSelectedFritti] = useState(null);
  const [showKebab, setShowKebab] = useState(false);

  if (loading) return <LoadingScreen message="Caricamento menu in corso..." />;

  const categories = [
    { id: 'pizza',   label: 'Pizza',   emoji: '🍕' },
    { id: 'kebab',   label: 'Kebab',   emoji: '🥙' },
    { id: 'fritti',  label: 'Fritti',  emoji: '🍟' },
    { id: 'bevande', label: 'Bevande', emoji: '🥤' },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Category tabs — always visible, never scrolls */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-none border-b border-white/10 bg-brand-dark flex-shrink-0">
        {categories.map(cat => (
          <button key={cat.id} onClick={() => setActiveCat(cat.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0
              ${activeCat === cat.id
                ? 'bg-brand-red text-white shadow-lg shadow-red-900/30'
                : 'text-white/50 hover:text-white hover:bg-white/10'}`}>
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Menu items — scrolls independently */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">

        {/* PIZZAS */}
        {activeCat === 'pizza' && pizzas.map(pizza => (
          <button key={pizza.id} onClick={() => pizza.is_available && setSelectedPizza(pizza)}
            className={`card-hover w-full text-left p-4 flex items-start gap-3 transition-all
              ${!pizza.is_available ? 'opacity-40 cursor-not-allowed' : ''}`}>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h3 className="font-bold text-white text-base leading-tight">{pizza.name_it}</h3>
                  {pizza.description_it && (
                    <p className="text-xs text-white/50 mt-1.5 leading-relaxed italic">{pizza.description_it}</p>
                  )}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {pizza.ingredients?.slice(0, 5).map(ingId => {
                      const ing = ingredients[ingId];
                      return ing ? (
                        <span key={ingId} className={`text-xs px-2 py-0.5 rounded-full border
                          ${!ing.is_available ? 'border-red-500/40 text-red-400 line-through' : 'border-white/15 text-white/50'}`}>
                          {ing.name_it}
                        </span>
                      ) : null;
                    })}
                    {pizza.ingredients?.length > 5 && (
                      <span className="text-xs px-2 py-0.5 rounded-full border border-white/10 text-white/30">+{pizza.ingredients.length - 5}</span>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-brand-gold font-bold text-base">€{pizza.base_price_tonda?.toFixed(2)}</p>
                  <p className="text-xs text-white/40">Tonda</p>
                  <p className="text-brand-gold font-semibold text-sm mt-1">€{pizza.base_price_teglia?.toFixed(2)}</p>
                  <p className="text-xs text-white/40">Teglia</p>
                </div>
              </div>
              {!pizza.is_available && (
                <div className="mt-2 text-xs text-red-400 font-semibold">⛔ Esaurito</div>
              )}
            </div>
            <ChevronRight size={16} className="text-white/30 mt-1 flex-shrink-0" />
          </button>
        ))}

        {/* KEBAB */}
        {activeCat === 'kebab' && (
          <button onClick={() => setShowKebab(true)}
            className="card-hover w-full text-left p-5 flex items-center gap-4">
            <span className="text-5xl">🥙</span>
            <div className="flex-1">
              <h3 className="font-bold text-white text-lg">Kebab di Pollo</h3>
              <p className="text-sm text-white/50 italic mt-0.5">Pollo fresco alla griglia</p>
              <p className="text-xs text-white/40 mt-1">Scegli il pane, le verdure e le salse</p>
            </div>
            <div className="text-right">
              <p className="text-brand-gold font-bold text-xl">€9.00</p>
              <ChevronRight size={18} className="text-white/40 ml-auto mt-1" />
            </div>
          </button>
        )}

        {/* FRITTI */}
        {activeCat === 'fritti' && fritti.map(item => (
          <button key={item.id}
            onClick={() => {
              if (!item.is_available) return;
              if (item.id === 'patatine_fritte' || item.id === 'hotdog') {
                setSelectedFritti(item);
              } else {
                addItem({
                  item_id: item.id, item_name: item.name_it, category: 'fritti',
                  quantity: 1, size: null, split_type: null, splits: null,
                  removed_ingredients: [], added_ingredients: [],
                  unit_price: item.price, total_price: item.price, kebab_config: null, notes: '',
                });
              }
            }}
            className={`card-hover w-full text-left p-4 flex items-center gap-4 ${!item.is_available ? 'opacity-40 cursor-not-allowed' : ''}`}>
            <span className="text-3xl">🍟</span>
            <div className="flex-1">
              <h3 className="font-bold text-white">{item.name_it}</h3>
              {item.description_it && <p className="text-xs text-white/40 italic mt-0.5">{item.description_it}</p>}
              {!item.is_available && <p className="text-xs text-red-400 mt-0.5 font-semibold">⛔ Esaurito</p>}
            </div>
            <div className="text-right">
              <p className="text-brand-gold font-bold text-lg">€{item.price.toFixed(2)}</p>
              <p className="text-xs text-white/40">Aggiungi +</p>
            </div>
          </button>
        ))}

        {/* BEVANDE */}
        {activeCat === 'bevande' && (
          <div className="mb-2">
            <h4 className="text-sm font-semibold text-white/40 px-1 mb-2">🥤 Bevande</h4>
            {bevande.map(item => (
              <button key={item.id}
                onClick={() => item.is_available && addItem({
                  item_id: item.id, item_name: item.name_it, category: 'bevande',
                  quantity: 1, size: null, split_type: null, splits: null,
                  removed_ingredients: [], added_ingredients: [],
                  unit_price: item.price, total_price: item.price, kebab_config: null, notes: '',
                })}
                className={`card-hover w-full text-left p-3.5 flex items-center gap-3 mb-2 ${!item.is_available ? 'opacity-40 cursor-not-allowed' : ''}`}>
                <div className="flex-1">
                  <p className="font-semibold text-white text-sm">{item.name_it}</p>
                </div>
                <p className="text-brand-gold font-bold">€{item.price.toFixed(2)}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedPizza && (
        <PizzaCustomizer pizza={selectedPizza} ingredients={ingredients} onClose={() => setSelectedPizza(null)} />
      )}
      {selectedFritti && (
        <FrittiCustomizer item={selectedFritti} onClose={() => setSelectedFritti(null)} />
      )}
      {showKebab && <KebabBuilder onClose={() => setShowKebab(false)} />}
    </div>
  );
}

// ─────────────────────────────────────────────
// ORDERS TAB
// ─────────────────────────────────────────────
function OrdersTab() {
  const { session } = useSession();
  const { orders, loading } = useSessionOrders(session?.id);

  if (loading) return (
    <div className="flex-1 flex items-center justify-center text-white/40">Caricamento...</div>
  );

  if (!orders.length) return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-8 py-16">
      <span className="text-6xl">🍕</span>
      <p className="text-white/60 font-semibold text-lg">Nessun ordine ancora</p>
      <p className="text-white/30 text-sm">Inizia sfogliando il menu!</p>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4">
      <OrderTracker orders={orders} />
    </div>
  );
}

// ─────────────────────────────────────────────
// CART TAB
// ─────────────────────────────────────────────
function CartTab({ onOrderPlaced }) {
  const { cart, removeItem, updateQty, cartTotal, submitOrder } = useCart();
  const { session, tableData } = useSession();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);

  async function handleSubmit() {
    if (!session?.id || cart.items.length === 0) return;
    setSubmitting(true);
    try {
      await submitOrder(session.id, tableData.id, tableData.table_number);
      setSubmitted(true);
      onOrderPlaced?.();
      setTimeout(() => setSubmitted(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  }

  if (cart.items.length === 0) return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-8 py-16">
      <span className="text-6xl opacity-50">🛒</span>
      <p className="text-white/60 font-semibold text-lg">Il carrello è vuoto</p>
      <p className="text-white/30 text-sm">Aggiungi qualcosa dal menu</p>
    </div>
  );

  if (submitted) return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8 text-center">
      <div className="w-20 h-20 rounded-full bg-brand-green/20 flex items-center justify-center text-4xl animate-bounce-once">✅</div>
      <h3 className="text-xl font-bold text-white">Ordine inviato!</h3>
      <p className="text-white/50 text-sm">La cucina ha ricevuto il tuo ordine</p>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {cart.items.map(item => (
          <div key={item.cartId} className="card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="font-semibold text-white">{item.item_name}</p>
                {item.size && (
                  <p className="text-xs text-white/40 capitalize mt-0.5">
                    {item.size === 'tonda' ? '🍕 Tonda' : '🍫 Teglia'}
                    {item.split_type && item.split_type !== 'whole' && (
                      <span className="text-brand-gold ml-2">
                        — {item.split_type === 'half' ? 'Mezza e Mezza' : 'Tre Gusti'}
                      </span>
                    )}
                  </p>
                )}
                {item.removed_ingredients?.length > 0 && (
                  <p className="text-xs text-red-400 mt-1">❌ Senza: {item.removed_ingredients.join(', ')}</p>
                )}
                {item.added_ingredients?.length > 0 && (
                  <p className="text-xs text-green-400">➕ Extra: {item.added_ingredients.join(', ')}</p>
                )}
                {item.kebab_config && (
                  <div className="text-xs text-white/40 space-y-0.5 mt-1">
                    <p>🥙 {item.kebab_config.serving_style}</p>
                    {item.kebab_config.vegetables?.length > 0 && (
                      <p>🥗 Verdure: {item.kebab_config.vegetables.join(', ')}</p>
                    )}
                    {item.kebab_config.sauces?.length > 0 && (
                      <p>🥣 Salse: {item.kebab_config.sauces.join(', ')}</p>
                    )}
                  </div>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-brand-gold font-bold">€{(item.total_price * item.quantity).toFixed(2)}</p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-3">
              <button onClick={() => removeItem(item.cartId)}
                className="text-xs text-red-400 hover:text-red-300 transition-colors">
                Rimuovi
              </button>
              <div className="flex items-center gap-2">
                <button onClick={() => updateQty(item.cartId, item.quantity - 1)}
                  className="w-7 h-7 rounded-lg border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors text-sm">−</button>
                <span className="text-sm font-bold w-5 text-center">{item.quantity}</span>
                <button onClick={() => updateQty(item.cartId, item.quantity + 1)}
                  className="w-7 h-7 rounded-lg bg-brand-red flex items-center justify-center hover:bg-red-700 transition-colors text-sm">+</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10 p-4 bg-brand-card/95 backdrop-blur-sm">
        <div className="flex justify-between items-center mb-4">
          <span className="text-white/60 font-medium">Totale</span>
          <span className="text-2xl font-bold text-brand-gold">€{cartTotal.toFixed(2)}</span>
        </div>
        <button onClick={handleSubmit} disabled={submitting}
          className="btn-primary w-full text-base flex items-center justify-center gap-2">
          {submitting ? <span className="animate-spin">⏳</span> : '🍕'}
          {submitting ? 'Invio in corso...' : 'Invia Ordine'}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// BILL TAB — Il Conto
// ─────────────────────────────────────────────
function BillTab() {
  const { session } = useSession();
  const { orders } = useSessionOrders(session?.id);
  const total = orders.reduce((sum, o) => sum + (o.subtotal || 0), 0);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-display font-bold italic text-brand-gold">Il Conto</h2>
        <p className="text-white/50 text-sm mt-1">Tavolo {session?.table_number}</p>
      </div>

      {orders.length === 0 && (
        <p className="text-center text-white/30 italic py-8">Nessun ordine ancora</p>
      )}

      {orders.map(order => (
        <div key={order.id} className="card p-4 space-y-2">
          <p className="text-xs text-white/40 uppercase tracking-wide">Ordine #{order.id.slice(-4).toUpperCase()}</p>
          {order.items?.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-white/80">{item.quantity}× {item.item_name}
                {item.size && <span className="text-white/40 ml-1 capitalize">({item.size})</span>}
              </span>
              <span className="text-white font-medium">€{(item.total_price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t border-white/10 pt-2 flex justify-between text-sm font-semibold">
            <span className="text-white/50">Subtotale</span>
            <span className="text-white">€{order.subtotal?.toFixed(2)}</span>
          </div>
        </div>
      ))}

      {orders.length > 0 && (
        <div className="card p-4 border border-brand-gold/30 bg-brand-gold/5">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-white">TOTALE</span>
            <span className="text-3xl font-bold text-brand-gold">€{total.toFixed(2)}</span>
          </div>
        </div>
      )}

      <div className="glass p-5 text-center space-y-2 mt-4">
        <p className="text-3xl">💳</p>
        <p className="text-white font-semibold text-lg">
          Si prega di recarsi alla cassa per il pagamento
        </p>
        <p className="text-white/40 text-sm mt-1">
          Please proceed to the cashier to pay
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN CUSTOMER APP
// ─────────────────────────────────────────────
function CustomerAppInner() {
  const { session, tableData, loading } = useSession();
  const { cartCount } = useCart();
  const [activeTab, setActiveTab] = useState('menu');

  if (loading) return <LoadingScreen message="Preparazione del tavolo..." />;

  const tabs = [
    { id: 'menu',   label: 'Menu',    icon: UtensilsCrossed },
    { id: 'cart',   label: 'Ordine',  icon: ShoppingCart,   badge: cartCount },
    { id: 'orders', label: 'I Miei',  icon: ListOrdered },
    { id: 'bill',   label: 'Il Conto',icon: Receipt },
  ];

  return (
    <div className="h-screen bg-brand-dark flex flex-col max-w-md mx-auto relative overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-brand-dark/95 backdrop-blur-md border-b border-white/10">
        <div className="px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-display italic font-bold text-xl text-white">
              🍕 <span className="text-brand-gold">Pizzaria da</span> Mario
            </h1>
            <p className="text-xs text-white/40">& Kebab — Gallicano nel Lazio</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/30">Tavolo</p>
            <p className="text-3xl font-black text-white leading-none">{tableData?.table_number || '—'}</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 min-h-0 flex flex-col">
        {activeTab === 'menu'   && <MenuTab />}
        {activeTab === 'cart'   && <CartTab onOrderPlaced={() => setActiveTab('orders')} />}
        {activeTab === 'orders' && <OrdersTab />}
        {activeTab === 'bill'   && <BillTab />}
      </main>

      {/* Bottom Nav */}
      <nav className="sticky bottom-0 bg-brand-dark/95 backdrop-blur-md border-t border-white/10 grid grid-cols-4 z-30">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center gap-1 py-3 transition-all
                ${isActive ? 'text-brand-red' : 'text-white/40 hover:text-white/70'}`}>
              <div className="relative">
                <Icon size={20} />
                {tab.badge > 0 && (
                  <span className="absolute -top-2 -right-2 w-4 h-4 bg-brand-red rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium leading-tight">{tab.label}</span>
              {isActive && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-brand-red rounded-full" />}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export function CustomerApp() {
  const { tableId } = useParams();
  return (
    <SessionProvider tableId={tableId}>
      <CartProvider>
        <CustomerAppInner />
      </CartProvider>
    </SessionProvider>
  );
}
