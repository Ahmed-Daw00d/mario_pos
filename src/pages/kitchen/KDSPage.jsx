// src/pages/kitchen/KDSPage.jsx
// Kitchen Display System — Real-time order management for kitchen staff
import { useState, useEffect, useRef } from 'react';
import { useKitchenOrders, updateOrderStatus } from '../../hooks/useOrders';
import { StatusBadge } from '../../components/ui/SharedUI';
import { ORDER_STATUS } from '../../data/menuData';
import { ChevronRight, Clock, Bell, Printer, Settings } from 'lucide-react';
import html2canvas from 'html2canvas';

const STATUS_COLORS = {
  pending:        'border-amber-500/50   bg-amber-500/8',
  in_preparation: 'border-blue-500/50    bg-blue-500/8',
  in_oven:        'border-orange-500/50  bg-orange-500/8',
  ready:          'border-green-500/50   bg-green-500/8',
};

const STATUS_HEADER = {
  pending:        'bg-amber-500/20 border-b border-amber-500/30',
  in_preparation: 'bg-blue-500/20  border-b border-blue-500/30',
  in_oven:        'bg-orange-500/20 border-b border-orange-500/30',
  ready:          'bg-green-500/20  border-b border-green-500/30',
};

function useElapsedTime(createdAt) {
  const [elapsed, setElapsed] = useState('');
  useEffect(() => {
    function calc() {
      if (!createdAt) return;
      const ts = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
      const diff = Math.floor((Date.now() - ts.getTime()) / 1000);
      if (diff < 60) setElapsed(`${diff}s`);
      else if (diff < 3600) setElapsed(`${Math.floor(diff / 60)}m`);
      else setElapsed(`${Math.floor(diff / 3600)}h`);
    }
    calc();
    const id = setInterval(calc, 10000);
    return () => clearInterval(id);
  }, [createdAt]);
  return elapsed;
}

function OrderCard({ order, onStatusChange, onPrint }) {
  const elapsed = useElapsedTime(order.created_at);
  const cfg      = ORDER_STATUS[order.status];
  const isUrgent = order.status === 'pending' && elapsed.includes('m') && parseInt(elapsed) > 10;

  return (
    <div className={`rounded-2xl border-2 overflow-hidden transition-all duration-300 ${STATUS_COLORS[order.status]} ${isUrgent ? 'animate-pulse-slow' : ''}`}>
      {/* Card header */}
      <div className={`px-4 py-3 flex items-center justify-between ${STATUS_HEADER[order.status]}`}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{cfg.emoji}</span>
          <div>
            <p className="font-bold text-white text-lg">Tavolo {order.table_number}</p>
            <p className="text-xs text-white/50">#{order.id.slice(-4).toUpperCase()}</p>
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
                        <p className="text-xs text-red-400">❌ {split.removed_ingredients.join(', ')}</p>
                      )}
                      {split.added_ingredients?.length > 0 && (
                        <p className="text-xs text-green-400">➕ {split.added_ingredients.join(', ')}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Modifications */}
            {item.split_type === 'whole' && (
              <div className="ml-8 space-y-0.5">
                {item.removed_ingredients?.length > 0 && (
                  <p className="text-sm text-red-400 font-medium">❌ بدون: {item.removed_ingredients.join(' · ')}</p>
                )}
                {item.added_ingredients?.length > 0 && (
                  <p className="text-sm text-green-400 font-medium">➕ إضافة: {item.added_ingredients.join(' · ')}</p>
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

      <div className="px-4 pb-4 grid grid-cols-2 gap-2">
        <button onClick={() => onPrint(order)} className="col-span-2 btn-ghost py-2 flex items-center justify-center gap-2 mb-1">
          <Printer size={16} /> Stampa Ordine
        </button>
        {cfg.next && (
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

export function KDSPage() {
  const { orders, loading } = useKitchenOrders();
  const [filter, setFilter]   = useState('all');
  const [printingOrder, setPrintingOrder] = useState(null);
  const [autoPrint, setAutoPrint] = useState(true);
  const seenOrderIds = useRef(new Set());

  const sendToPrinter = async (order) => {
    setPrintingOrder(order);
    // Give React a tick to render the receipt
    setTimeout(async () => {
      const receiptEl = document.getElementById('print-receipt');
      if (!receiptEl) return;
      try {
        const canvas = await html2canvas(receiptEl, {
          scale: 2, // High resolution for clear thermal printing
          backgroundColor: '#ffffff'
        });
        const base64Image = canvas.toDataURL('image/png');
        
        await fetch('/api/print', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64Image, ip: '192.168.1.6' })
        });
        console.log('Printed successfully');
      } catch (err) {
        console.error('Print failed', err);
      }
    }, 100);
  };

  // Play notification sound on new orders and handle Auto-Print
  useEffect(() => {
    if (orders.length === 0) return;

    // First load: just record existing orders, don't beep or print
    if (seenOrderIds.current.size === 0) {
      orders.forEach(o => seenOrderIds.current.add(o.id));
      return;
    }

    // Find orders we haven't seen yet
    const newOrders = orders.filter(o => !seenOrderIds.current.has(o.id));
    
    if (newOrders.length > 0) {
      newOrders.forEach(o => seenOrderIds.current.add(o.id));
      
      // Play beep
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

      // Handle Auto-Print
      if (autoPrint) {
        // Print the most recent new order
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
                ${autoPrint ? 'bg-brand-green/20 text-brand-green border border-brand-green/30' : 'bg-white/10 text-white/40 border border-white/10'}`}>
              <Printer size={14} />
              Auto-Stampa: {autoPrint ? 'ON' : 'OFF'}
            </button>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold
              ${orders.length > 0 ? 'bg-brand-red/20 text-brand-red animate-pulse-slow' : 'bg-white/10 text-white/40'}`}>
              <Bell size={14} />
              {orders.length} ordini attivi
            </div>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="px-6 pb-4 flex gap-2 overflow-x-auto scrollbar-none">
          {[
            { id: 'all',            label: 'Tutti',          emoji: '📋' },
            { id: 'pending',        label: 'In Attesa',      emoji: '⏳' },
            { id: 'in_preparation', label: 'In Prep.',       emoji: '👨‍🍳' },
            { id: 'in_oven',        label: 'In Forno',       emoji: '🔥' },
            { id: 'ready',          label: 'Pronti',         emoji: '✅' },
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

      {/* Printable KDS Receipt (Off-screen) */}
      {printingOrder && (
        <div id="print-receipt">
          <div className="text-center border-b border-black pb-4 mb-4">
            <h2 className="font-bold text-xl">CUCINA</h2>
            <h1 className="font-bold text-3xl my-2">Tavolo {printingOrder.table_number}</h1>
            <p>Ordine #{printingOrder.id.slice(-4).toUpperCase()}</p>
            <p>{new Date().toLocaleString('it-IT')}</p>
          </div>
          {printingOrder.items?.map((item, idx) => (
            <div key={idx} className="mb-4">
              <div className="font-bold text-lg">
                {item.quantity}× {item.item_name} {item.size ? `(${item.size})` : ''}
              </div>
              
              {/* Teglia Splits */}
              {item.split_type && item.split_type !== 'whole' && item.splits && (
                <div className="ml-4 mt-1 border-l-2 border-black pl-2">
                  <p className="font-bold uppercase">{item.split_type === 'half' ? '½ + ½' : '⅓ + ⅓ + ⅓'}</p>
                  {item.splits.map((split, si) => (
                    <div key={si} className="mb-1">
                      <span className="font-bold">Q{si + 1}: {split.pizza_name}</span>
                      {split.removed_ingredients?.length > 0 && <p>Senza: {split.removed_ingredients.join(', ')}</p>}
                      {split.added_ingredients?.length > 0 && <p>Extra: {split.added_ingredients.join(', ')}</p>}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Whole Modifications */}
              {item.split_type === 'whole' && (
                <div className="ml-4 text-sm mt-1">
                  {item.removed_ingredients?.length > 0 && <p>Senza: {item.removed_ingredients.join(', ')}</p>}
                  {item.added_ingredients?.length > 0 && <p>Extra: {item.added_ingredients.join(', ')}</p>}
                </div>
              )}
              
              {/* Kebab Config */}
              {item.kebab_config && (
                <div className="ml-4 text-sm mt-1">
                  <p>{item.kebab_config.serving_style}</p>
                  {item.kebab_config.vegetables?.length > 0 && <p>Verdure: {item.kebab_config.vegetables.join(', ')}</p>}
                  {item.kebab_config.sauces?.length > 0 && <p>Salse: {item.kebab_config.sauces.join(', ')}</p>}
                </div>
              )}
              {item.notes && <p className="ml-4 mt-1 font-bold">NOTE: {item.notes}</p>}
            </div>
          ))}
          <div className="text-center border-t border-black pt-4 mt-4">
            <p>*** FINE ORDINE ***</p>
          </div>
        </div>
      )}
    </div>
  );
}
