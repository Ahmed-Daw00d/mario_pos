// src/pages/kitchen/KDSPage.jsx
// Kitchen Display System — Real-time order management for kitchen staff
import { useState, useEffect, useRef } from 'react';
import { useKitchenOrders, updateOrderStatus } from '../../hooks/useOrders';
import { useMenu } from '../../hooks/useMenu';
import { StatusBadge } from '../../components/ui/SharedUI';
import { ORDER_STATUS } from '../../data/menuData';
import { ChevronRight, Clock, Bell, Printer, ShoppingBag, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { printCanvas } from '../../utils/printerHelper';
import html2canvas from 'html2canvas';

const STATUS_COLORS = {
  pending:        'border-amber-500/50   bg-amber-500/8',
  in_preparation: 'border-blue-500/50    bg-blue-500/8',
  in_oven:        'border-orange-500/50  bg-orange-500/8',
  ready:          'border-green-500/50   bg-green-500/8',
};

const STATUS_HEADER = {
  pending:        'bg-amber-500/20  border-b border-amber-500/30',
  in_preparation: 'bg-blue-500/20   border-b border-blue-500/30',
  in_oven:        'bg-orange-500/20 border-b border-orange-500/30',
  ready:          'bg-green-500/20  border-b border-green-500/30',
};

// ─── Elapsed time hook ────────────────────────────────────────────────────────
function useElapsedTime(createdAt) {
  const [elapsed, setElapsed] = useState('');
  useEffect(() => {
    function calc() {
      if (!createdAt) return;
      const ts   = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
      const diff = Math.floor((Date.now() - ts.getTime()) / 1000);
      if (diff < 60)   setElapsed(`${diff}s`);
      else if (diff < 3600) setElapsed(`${Math.floor(diff / 60)}m`);
      else             setElapsed(`${Math.floor(diff / 3600)}h`);
    }
    calc();
    const id = setInterval(calc, 10000);
    return () => clearInterval(id);
  }, [createdAt]);
  return elapsed;
}

// ─── Order Card ───────────────────────────────────────────────────────────────
function OrderCard({ order, onStatusChange, onPrint }) {
  const elapsed    = useElapsedTime(order.created_at);
  const cfg        = ORDER_STATUS[order.status];
  const isUrgent   = order.status === 'pending' && elapsed.includes('m') && parseInt(elapsed) > 10;
  const isTakeaway = order.type === 'takeaway';

  return (
    <div className={`rounded-2xl border-2 overflow-hidden transition-all duration-300
      ${STATUS_COLORS[order.status]} ${isUrgent ? 'animate-pulse-slow' : ''}`}>

      {/* Card header */}
      <div className={`px-4 py-3 flex items-center justify-between ${STATUS_HEADER[order.status]}`}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{cfg.emoji}</span>
          <div>
            {isTakeaway ? (
              <>
                <div className="flex items-center gap-1.5">
                  <ShoppingBag size={14} className="text-orange-400" />
                  <p className="font-bold text-orange-400 text-base">Asporto</p>
                </div>
                <p className="font-semibold text-white text-sm">{order.customer_name}</p>
                {order.phone && (
                  <p className="text-xs text-white/40">{order.phone}</p>
                )}
              </>
            ) : (
              <>
                <p className="font-bold text-white text-lg">Tavolo {order.table_number}</p>
                <p className="text-xs text-white/50">#{order.id.slice(-4).toUpperCase()}</p>
              </>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className={`flex items-center gap-1 text-sm font-semibold ${isUrgent ? 'text-red-400' : 'text-white/60'}`}>
            <Clock size={14} />
            <span>{elapsed}</span>
          </div>
          <StatusBadge status={order.status} />
        </div>
      </div>

      {/* Items */}
      <div className="p-4 space-y-3">
        {order.items?.map((item, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-baseline gap-2">
                <span className="text-white font-bold text-xl">{item.quantity}×</span>
                <div>
                  <span className="text-white font-semibold">{item.item_name}</span>
                  {item.size && (
                    <span className={`ml-2 text-xs px-2 py-0.5 rounded-full font-bold
                      ${item.size === 'tonda' ? 'bg-blue-500/20 text-blue-300' : 'bg-purple-500/20 text-purple-300'}`}>
                      {item.size.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Teglia splits */}
            {item.split_type && item.split_type !== 'whole' && item.splits && (
              <div className="ml-8 space-y-1">
                <p className="text-xs text-white/40 font-semibold uppercase tracking-wide">
                  {item.split_type === 'half' ? '½ + ½' : '⅓ + ⅓ + ⅓'}
                </p>
                {item.splits.map((split, si) => (
                  <div key={si} className="flex items-start gap-2 text-sm">
                    <span className="text-xs bg-white/10 rounded px-1.5 py-0.5 text-white/50 flex-shrink-0">Q{si + 1}</span>
                    <div>
                      <span className="text-white/80">{split.pizza_name}</span>
                      {split.removed_ingredients?.length > 0 && (
                        <p className="text-xs text-red-400 mt-1">❌ {split.removed_ingredients.map(id => ingredients[id]?.name_it || id).join(', ')}</p>
                      )}
                      {split.added_ingredients?.length > 0 && (
                        <p className="text-xs text-green-400">➕ {split.added_ingredients.map(id => ingredients[id]?.name_it || id).join(', ')}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Whole modifications */}
            {item.split_type === 'whole' && (
              <div className="ml-8 space-y-0.5">
                {item.removed_ingredients?.length > 0 && (
                  <p className="text-sm text-red-400 font-medium mt-1">❌ بدون: {item.removed_ingredients.map(id => ingredients[id]?.name_it || id).join(' · ')}</p>
                )}
                {item.added_ingredients?.length > 0 && (
                  <p className="text-sm text-green-400 font-medium">➕ إضافة: {item.added_ingredients.map(id => ingredients[id]?.name_it || id).join(' · ')}</p>
                )}
              </div>
            )}

            {/* Kebab config */}
            {item.kebab_config && (
              <div className="ml-8 text-sm space-y-0.5 text-white/60">
                <p>🥙 {item.kebab_config.serving_style}</p>
                {item.kebab_config.vegetables?.length > 0 && <p>🥗 {item.kebab_config.vegetables.join(' · ')}</p>}
                {item.kebab_config.sauces?.length > 0 && <p>🥣 {item.kebab_config.sauces.join(' · ')}</p>}
              </div>
            )}

            {item.notes && (
              <p className="ml-8 text-xs text-brand-gold italic">📝 {item.notes}</p>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 grid grid-cols-2 gap-2">
        <button onClick={() => onPrint(order)}
          className="col-span-2 btn-ghost py-2 flex items-center justify-center gap-2 mb-1">
          <Printer size={16} /> Stampa Ordine
        </button>
        {/* Only show the generic next-status button for statuses BEFORE 'ready'.
             'ready → served' is handled below with its own green button. */}
        {cfg.next && cfg.next !== 'served' && (
          <button
            onClick={() => onStatusChange(order.id, cfg.next)}
            className="col-span-2 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white transition-all
              bg-brand-red hover:bg-red-700 active:scale-95 shadow-lg">
            <span>{ORDER_STATUS[cfg.next]?.emoji}</span>
            <span>{ORDER_STATUS[cfg.next]?.label_it}</span>
            <ChevronRight size={16} />
          </button>
        )}
        {order.status === 'ready' && (
          <button
            onClick={() => onStatusChange(order.id, 'served')}
            className="col-span-2 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white
              bg-brand-green hover:bg-green-700 active:scale-95 shadow-lg">
            🍽️ Servito!
          </button>
        )}
      </div>
    </div>
  );
}

// ─── KDS Page ─────────────────────────────────────────────────────────────────
export function KDSPage() {
  const { orders, loading }   = useKitchenOrders();
  const { ingredients } = useMenu(); // Load ingredients to map IDs to localized names
  const { logout }            = useAuth();
  const [filter, setFilter]   = useState('all');
  const [autoPrint, setAutoPrint] = useState(true);
  const [printingOrder, setPrintingOrder] = useState(null);
  const seenOrderIds = useRef(new Set());

  // ── Print handler ──────────────────────────────────────────────────────────
  const sendToPrinter = async (order) => {
    setPrintingOrder(order);
    setTimeout(async () => {
      const receiptEl = document.getElementById('print-receipt');
      if (!receiptEl) return;
      try {
        const canvas = await html2canvas(receiptEl, {
          scale: 2, backgroundColor: '#ffffff'
        });
        await printCanvas(canvas);
        console.log('Printed successfully');
      } catch (err) {
        console.error('Print failed', err);
        setPrintingOrder(null); // clear on failure too
        alert('فشل الطباعة: ' + err.message);
      } finally {
        // Keep receipt visible briefly then clear
        setTimeout(() => setPrintingOrder(null), 500);
      }
    }, 100);
  };

  // ── New order sound + auto-print ──────────────────────────────────────────
  useEffect(() => {
    if (orders.length === 0) return;

    if (seenOrderIds.current.size === 0) {
      orders.forEach(o => seenOrderIds.current.add(o.id));
      return;
    }

    const newOrders = orders.filter(o => !seenOrderIds.current.has(o.id));
    if (newOrders.length > 0) {
      newOrders.forEach(o => seenOrderIds.current.add(o.id));

      // Beep
      try {
        const ctx  = new (window.AudioContext || window.webkitAudioContext)();
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.5);
      } catch {}

      if (autoPrint) {
        sendToPrinter(newOrders[newOrders.length - 1]);
      }
    }
  }, [orders, autoPrint]);

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  const counts = {
    all:            orders.length,
    pending:        orders.filter(o => o.status === 'pending').length,
    in_preparation: orders.filter(o => o.status === 'in_preparation').length,
    in_oven:        orders.filter(o => o.status === 'in_oven').length,
    ready:          orders.filter(o => o.status === 'ready').length,
  };

  if (loading) return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="text-6xl animate-bounce">🍕</div>
        <p className="text-white/50 italic">Caricamento ordini...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-brand-dark">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-brand-dark/95 backdrop-blur-md border-b border-white/10">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🔥</span>
            <div>
              <h1 className="text-xl font-bold text-white">Cucina</h1>
              <p className="text-xs text-white/40">Kitchen Display System</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setAutoPrint(!autoPrint)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors
                ${autoPrint
                  ? 'bg-brand-green/20 text-brand-green border border-brand-green/30'
                  : 'bg-white/10 text-white/40 border border-white/10'}`}>
              <Printer size={14} />
              Auto-Stampa: {autoPrint ? 'ON' : 'OFF'}
            </button>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold
              ${orders.length > 0 ? 'bg-brand-red/20 text-brand-red animate-pulse-slow' : 'bg-white/10 text-white/40'}`}>
              <Bell size={14} />
              {orders.length} ordini attivi
            </div>
            <button onClick={logout} className="p-2 rounded-xl hover:bg-white/10 transition-colors" title="Logout">
              <LogOut size={18} className="text-white/40" />
            </button>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="px-6 pb-4 flex gap-2 overflow-x-auto scrollbar-none">
          {[
            { id: 'all',            label: 'Tutti',     emoji: '📋' },
            { id: 'pending',        label: 'In Attesa', emoji: '⏳' },
            { id: 'in_preparation', label: 'In Prep.',  emoji: '👨‍🍳' },
            { id: 'in_oven',        label: 'In Forno',  emoji: '🔥' },
            { id: 'ready',          label: 'Pronti',    emoji: '✅' },
          ].map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 transition-all
                ${filter === f.id ? 'bg-brand-red text-white' : 'bg-white/10 text-white/50 hover:bg-white/20'}`}>
              <span>{f.emoji}</span>
              <span>{f.label}</span>
              {counts[f.id] > 0 && (
                <span className="bg-white/20 rounded-full px-1.5 text-xs">{counts[f.id]}</span>
              )}
            </button>
          ))}
        </div>
      </header>

      {/* Orders grid */}
      <main className="p-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <span className="text-8xl opacity-20">🍽️</span>
            <p className="text-white/40 text-lg font-medium">Nessun ordine al momento</p>
            <p className="text-white/20 text-sm">In attesa di nuovi ordini...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(order => (
              <OrderCard key={order.id} order={order}
                onStatusChange={(id, status) => updateOrderStatus(id, status)}
                onPrint={(o) => sendToPrinter(o)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Printable KDS receipt (off-screen) */}
      {printingOrder && (
        <div id="print-receipt" style={{
          position: 'fixed', left: '-9999px', top: 0,
          width: '380px', background: 'white', color: 'black', padding: '20px',
          fontFamily: 'monospace'
        }}>
          <div style={{ textAlign: 'center', borderBottom: '2px solid black', paddingBottom: '12px', marginBottom: '12px' }}>
            <h2 style={{ fontWeight: 'bold', fontSize: '18px' }}>CUCINA — ORDINE</h2>
            {printingOrder.type === 'takeaway' ? (
              <>
                <p style={{ fontSize: '14px', fontWeight: 'bold' }}>🛍️ ASPORTO</p>
                <h1 style={{ fontWeight: 'bold', fontSize: '26px', margin: '6px 0' }}>{printingOrder.customer_name}</h1>
                {printingOrder.phone && <p style={{ fontSize: '13px' }}>{printingOrder.phone}</p>}
              </>
            ) : (
              <h1 style={{ fontWeight: 'bold', fontSize: '32px', margin: '6px 0' }}>Tavolo {printingOrder.table_number}</h1>
            )}
            <p style={{ fontSize: '13px' }}>#{printingOrder.id.slice(-4).toUpperCase()}</p>
            <p style={{ fontSize: '12px', color: '#555' }}>{new Date().toLocaleString('it-IT')}</p>
          </div>

          {printingOrder.items?.map((item, idx) => (
            <div key={idx} style={{ marginBottom: '14px' }}>
              <div style={{ fontWeight: 'bold', fontSize: '17px' }}>
                {item.quantity}× {item.item_name} {item.size ? `(${item.size})` : ''}
              </div>
              {item.split_type && item.split_type !== 'whole' && item.splits && (
                <div style={{ marginLeft: '16px', marginTop: '4px', borderLeft: '2px solid black', paddingLeft: '8px' }}>
                  <p style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
                    {item.split_type === 'half' ? '½ + ½' : '⅓ + ⅓ + ⅓'}
                  </p>
                  {item.splits.map((split, si) => (
                    <div key={si} style={{ marginBottom: '4px' }}>
                      <span style={{ fontWeight: 'bold' }}>Q{si + 1}: {split.pizza_name}</span>
                      {split.removed_ingredients?.length > 0 && <p>Senza: {split.removed_ingredients.map(id => ingredients[id]?.name_it || id).join(', ')}</p>}
                      {split.added_ingredients?.length > 0 && <p>Extra: {split.added_ingredients.map(id => ingredients[id]?.name_it || id).join(', ')}</p>}
                    </div>
                  ))}
                </div>
              )}
              {item.split_type === 'whole' && (
                <div style={{ marginLeft: '16px', fontSize: '14px', marginTop: '4px' }}>
                  {item.removed_ingredients?.length > 0 && <p>Senza: {item.removed_ingredients.map(id => ingredients[id]?.name_it || id).join(', ')}</p>}
                  {item.added_ingredients?.length > 0 && <p>Extra: {item.added_ingredients.map(id => ingredients[id]?.name_it || id).join(', ')}</p>}
                </div>
              )}
              {item.kebab_config && (
                <div style={{ marginLeft: '16px', fontSize: '14px', marginTop: '4px' }}>
                  <p>{item.kebab_config.serving_style}</p>
                  {item.kebab_config.vegetables?.length > 0 && <p>Verdure: {item.kebab_config.vegetables.join(', ')}</p>}
                  {item.kebab_config.sauces?.length > 0 && <p>Salse: {item.kebab_config.sauces.join(', ')}</p>}
                </div>
              )}
              {item.notes && <p style={{ marginLeft: '16px', marginTop: '4px', fontWeight: 'bold' }}>NOTE: {item.notes}</p>}
            </div>
          ))}

          <div style={{ textAlign: 'center', borderTop: '2px solid black', paddingTop: '12px', marginTop: '12px' }}>
            <p>*** FINE ORDINE ***</p>
          </div>
        </div>
      )}
    </div>
  );
}
