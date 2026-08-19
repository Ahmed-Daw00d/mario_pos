// src/pages/cashier/CashierDashboard.jsx
// Full cashier + admin dashboard: table map, bills, inventory, QR, takeaway, reports
import { useState, useRef } from 'react';
import { QrCode, X, Printer, Check, ShoppingBag, LogOut, Settings } from 'lucide-react';
import html2canvas from 'html2canvas';
import { useTables }              from '../../hooks/useTables';
import { useCashierSessionOrders } from '../../hooks/useOrders';
import { useMenu }                from '../../hooks/useMenu';
import { useAuth }                from '../../contexts/AuthContext';
import { MenuManager }            from './MenuManager';
import { Reports }                from './Reports';
import { LoadingScreen }          from '../../components/ui/SharedUI';
import { PrinterSettingsModal }   from '../../components/PrinterSettingsModal';
import { TakeawayModal }          from '../../components/TakeawayModal';
import { TakeawayOrderBuilder }   from '../../components/TakeawayOrderBuilder';
import { printCanvas }            from '../../utils/printerHelper';
import {
  doc, updateDoc, serverTimestamp
} from 'firebase/firestore';
import { db } from '../../firebase';

// ─────────────────────────────────────────────
// Table Map Card
// ─────────────────────────────────────────────
function TableCard({ table, onClick, isSelected }) {
  const statusConfig = {
    available:       { label: 'Libero',   cls: 'table-available', dot: 'bg-brand-green' },
    occupied:        { label: 'Occupato', cls: 'table-occupied',  dot: 'bg-brand-red animate-pulse' },
    waiting_payment: { label: 'Il Conto', cls: 'table-waiting',   dot: 'bg-brand-gold animate-pulse' },
  };
  const cfg = statusConfig[table.status] || statusConfig.available;

  return (
    <button onClick={onClick}
      className={`relative rounded-2xl border-2 p-4 transition-all duration-200 hover:scale-105 active:scale-95 text-center
        ${cfg.cls} ${isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-brand-dark' : ''}`}>
      <div className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
      <p className="text-3xl font-black text-white">{table.table_number}</p>
      <p className="text-xs text-white/60 mt-1">{table.seats} posti</p>
      <p className={`text-xs font-semibold mt-1
        ${table.status === 'available' ? 'text-brand-green'
          : table.status === 'waiting_payment' ? 'text-brand-gold'
          : 'text-white/70'}`}>
        {cfg.label}
      </p>
    </button>
  );
}

// ─────────────────────────────────────────────
// Payment Method Modal
// ─────────────────────────────────────────────
function PaymentMethodModal({ onSelect, onCancel, total }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)' }}>
      <div className="bg-brand-card w-full max-w-sm rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10 text-center">
          <p className="text-xs text-white/40 mb-1">طريقة الدفع — Metodo di pagamento</p>
          <p className="text-3xl font-black text-brand-gold">€{total?.toFixed(2)}</p>
        </div>

        {/* Payment options */}
        <div className="p-6 space-y-3">
          <button
            onClick={() => onSelect('cash')}
            className="w-full flex items-center gap-4 p-5 rounded-2xl border-2 border-green-500/30
              bg-green-500/10 hover:bg-green-500/20 hover:border-green-500/60 transition-all active:scale-95">
            <span className="text-4xl">💵</span>
            <div className="text-left">
              <p className="font-bold text-white text-lg">Contanti</p>
              <p className="text-sm text-white/50">نقداً — Cash payment</p>
            </div>
          </button>

          <button
            onClick={() => onSelect('card')}
            className="w-full flex items-center gap-4 p-5 rounded-2xl border-2 border-blue-500/30
              bg-blue-500/10 hover:bg-blue-500/20 hover:border-blue-500/60 transition-all active:scale-95">
            <span className="text-4xl">💳</span>
            <div className="text-left">
              <p className="font-bold text-white text-lg">Carta / POS</p>
              <p className="text-sm text-white/50">بطاقة — Card payment</p>
            </div>
          </button>
        </div>

        <div className="px-6 pb-6">
          <button onClick={onCancel} className="btn-ghost w-full">
            ← Annulla
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Bill Modal
// ─────────────────────────────────────────────
function BillModal({ table, onClose }) {
  const { orders, loading }       = useCashierSessionOrders(table.active_session_id);
  const [closing, setClosing]     = useState(false);
  const [closed, setClosed]       = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const printReceiptRef           = useRef(null);

  const total = orders.reduce((sum, o) => sum + (o.subtotal || 0), 0);

  async function handleCloseTable(paymentMethod) {
    setShowPayment(false);
    setClosing(true);
    try {
      const updates = [];

      if (table.active_session_id) {
        updates.push(updateDoc(doc(db, 'sessions', table.active_session_id), {
          status:         'closed',
          closed_at:      serverTimestamp(),
          payment_method: paymentMethod,
        }));
      }

      for (const order of orders) {
        if (order.status !== 'served') {
          updates.push(updateDoc(doc(db, 'orders', order.id), {
            status:         'served',
            payment_method: paymentMethod,
          }));
        }
      }

      updates.push(updateDoc(doc(db, 'tables', table.id), {
        status:            'available',
        active_session_id: null,
      }));

      await Promise.all(updates);
      setClosed(true);
      setTimeout(onClose, 1500);
    } catch (e) {
      console.error(e);
    } finally {
      setClosing(false);
    }
  }

  async function handlePrint() {
    if (!printReceiptRef.current) return;
    try {
      const canvas = await html2canvas(printReceiptRef.current, {
        scale: 2, backgroundColor: '#ffffff', useCORS: true
      });
      await printCanvas(canvas);
    } catch (err) {
      console.error('Print failed', err);
      alert('فشل الطباعة: ' + (err.message || 'Unknown error'));
    }
  }

  if (closed) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.8)' }}>
      <div className="bg-brand-card rounded-3xl p-10 text-center space-y-4 border border-white/10">
        <div className="w-16 h-16 rounded-full bg-brand-green/20 flex items-center justify-center text-3xl mx-auto">✅</div>
        <h3 className="text-xl font-bold text-white">Tavolo {table.table_number} chiuso</h3>
        <p className="text-white/50 italic">تم إغلاق الطاولة بنجاح</p>
      </div>
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}>
        <div className="bg-brand-card w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 shadow-2xl">
          {/* Header */}
          <div className="sticky top-0 bg-brand-card/95 px-5 pt-5 pb-4 border-b border-white/10 z-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Tavolo {table.table_number}</h2>
                <p className="text-sm text-white/50">الفاتورة — Il Conto</p>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10">
                <X size={20} className="text-white/60" />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-white/40">جاري التحميل...</div>
          ) : (
            <div id="receipt" className="p-5 space-y-4">
              {/* Receipt Header */}
              <div className="text-center border-b border-white/10 pb-4">
                <p className="font-display italic font-bold text-2xl text-brand-gold">Pizzaria da Mario</p>
                <p className="text-xs text-white/40">Via Aldo Moro 164 — Gallicano nel Lazio (RM)</p>
                <p className="text-xs text-white/40 mt-1">
                  Tavolo {table.table_number} — {new Date().toLocaleString('it-IT')}
                </p>
              </div>

              {orders.map((order, oi) => (
                <div key={order.id} className="space-y-1">
                  {oi > 0 && <div className="border-t border-white/10 pt-3" />}
                  <p className="text-xs text-white/40">Ordine #{order.id.slice(-4).toUpperCase()}</p>
                  {order.items?.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-white/80">
                        {item.quantity}× {item.item_name}
                        {item.size && <span className="text-xs text-white/40"> ({item.size})</span>}
                      </span>
                      <span className="text-white font-medium">
                        €{(item.total_price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm text-white/50 border-t border-white/5 pt-1">
                    <span>Subtotale</span>
                    <span>€{order.subtotal?.toFixed(2)}</span>
                  </div>
                </div>
              ))}

              <div className="border-t-2 border-white/20 pt-3 flex justify-between items-center">
                <span className="text-lg font-bold text-white">TOTALE</span>
                <span className="text-3xl font-black text-brand-gold">€{total.toFixed(2)}</span>
              </div>
              <p className="text-xs text-white/30 text-center italic">Grazie per la vostra visita! 🙏</p>
            </div>
          )}

          {/* Actions */}
          <div className="p-5 border-t border-white/10 space-y-3">
            <button onClick={handlePrint} className="btn-ghost w-full flex items-center justify-center gap-2">
              <Printer size={18} /> Stampa scontrino
            </button>
            <button
              onClick={() => setShowPayment(true)}
              disabled={closing || loading}
              className="btn-primary w-full flex items-center justify-center gap-2 bg-brand-green hover:bg-green-700">
              {closing ? <span className="animate-spin">⏳</span> : <Check size={18} />}
              {closing ? 'Chiusura in corso...' : 'Chiudi Tavolo'}
            </button>
          </div>

          {/* Hidden print receipt */}
          {!loading && (
            <div ref={printReceiptRef} style={{
              position: 'absolute', left: '-9999px', top: 0,
              width: '380px', background: 'white', color: 'black', padding: '20px'
            }}>
              <div className="text-center border-b border-black pb-4 mb-4">
                <p className="font-bold text-2xl">Pizzaria da Mario</p>
                <p className="text-sm">Via Aldo Moro 164 - Gallicano nel Lazio (RM)</p>
                <p className="text-sm mt-1">
                  Tavolo {table.table_number} - {new Date().toLocaleString('it-IT')}
                </p>
              </div>
              {orders.map((order, oi) => (
                <div key={order.id} className="mb-4">
                  {oi > 0 && <div className="border-t border-black pt-3 mt-3" />}
                  <p className="text-sm font-bold mb-2">Ordine #{order.id.slice(-4).toUpperCase()}</p>
                  {order.items?.map((item, i) => (
                    <div key={i} className="flex justify-between text-base mb-1">
                      <span>{item.quantity}x {item.item_name}
                        {item.size && <span className="text-sm"> ({item.size})</span>}
                      </span>
                      <span className="font-bold">€{(item.total_price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              ))}
              <div className="border-t-2 border-black pt-4 mt-4 flex justify-between items-center">
                <span className="text-xl font-bold">TOTALE</span>
                <span className="text-2xl font-black">€{total.toFixed(2)}</span>
              </div>
              <p className="text-center text-sm mt-6 mb-2">Grazie per la vostra visita!</p>
            </div>
          )}
        </div>
      </div>

      {/* Payment method modal */}
      {showPayment && (
        <PaymentMethodModal
          total={total}
          onSelect={handleCloseTable}
          onCancel={() => setShowPayment(false)}
        />
      )}
    </>
  );
}

// ─────────────────────────────────────────────
// Toggle Row (Inventory)
// ─────────────────────────────────────────────
function ToggleRow({ item, collection: col, onToggle }) {
  return (
    <div className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all
      ${item.is_available ? 'border-white/10 bg-white/3' : 'border-red-500/30 bg-red-500/5 opacity-60'}`}>
      <div>
        <p className="text-sm font-medium text-white">{item.name_it || item.name_ar}</p>
        {item.name_ar && item.name_it && <p className="text-xs text-white/40">{item.name_ar}</p>}
        {item.price && <p className="text-xs text-brand-gold">€{item.price?.toFixed(2)}</p>}
      </div>
      <button
        onClick={() => onToggle(col, item.id, item.is_available)}
        className={`relative inline-flex w-12 h-6 rounded-full transition-all duration-300 flex-shrink-0
          ${item.is_available ? 'bg-brand-green' : 'bg-white/20'}`}>
        <span className={`inline-block w-5 h-5 rounded-full bg-white shadow-md transform transition-all duration-300 mt-0.5
          ${item.is_available ? 'translate-x-6' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────
// Inventory Tab
// ─────────────────────────────────────────────
function InventoryTab() {
  const { pizzas, fritti, bevande, ingredients, loading } = useMenu();
  const [activeSection, setActiveSection] = useState('ingredients');

  async function toggleItem(collectionName, docId, currentVal) {
    await updateDoc(doc(db, collectionName, docId), { is_available: !currentVal });
  }

  if (loading) return (
    <div className="text-white/40 text-center py-8 italic">Caricamento inventario...</div>
  );

  const sections = [
    { id: 'ingredients', label: 'Ingredienti', emoji: '🧀' },
    { id: 'pizzas',      label: 'Pizze',       emoji: '🍕' },
    { id: 'fritti',      label: 'Fritti',      emoji: '🍟' },
    { id: 'bevande',     label: 'Bevande',     emoji: '🥤' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
        {sections.map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 transition-all
              ${activeSection === s.id ? 'bg-brand-red text-white' : 'bg-white/10 text-white/50 hover:bg-white/15'}`}>
            {s.emoji} {s.label}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {activeSection === 'ingredients' && Object.values(ingredients).map(ing => (
          <ToggleRow key={ing.id} item={ing} collection="ingredients" onToggle={toggleItem} />
        ))}
        {activeSection === 'pizzas' && pizzas.map(p => (
          <ToggleRow key={p.id} item={p} collection="menu_items" onToggle={toggleItem} />
        ))}
        {activeSection === 'fritti' && fritti.map(f => (
          <ToggleRow key={f.id} item={f} collection="menu_items" onToggle={toggleItem} />
        ))}
        {activeSection === 'bevande' && bevande.map(b => (
          <ToggleRow key={b.id} item={b} collection="menu_items" onToggle={toggleItem} />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// QR Code Tab
// ─────────────────────────────────────────────
function QRTab({ tables }) {
  const [selectedTable, setSelectedTable] = useState(null);
  const baseUrl = window.location.origin;

  function generateQR(tableId) {
    const url = `${baseUrl}/table/${tableId}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}&bgcolor=1A1A2E&color=FFFFFF&format=png`;
  }

  return (
    <div className="space-y-4">
      <p className="text-white/50 text-sm">Clicca su un tavolo per vedere il suo QR Code</p>
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
        {tables.map(t => (
          <button key={t.id} onClick={() => setSelectedTable(t)}
            className={`aspect-square rounded-xl flex items-center justify-center text-xl font-bold border-2 transition-all
              ${selectedTable?.id === t.id
                ? 'border-brand-red bg-brand-red/20 text-white'
                : 'border-white/10 bg-white/5 text-white/70 hover:border-white/30'}`}>
            {t.table_number}
          </button>
        ))}
      </div>
      {selectedTable && (
        <div className="card p-6 text-center space-y-4 animate-fade-in">
          <h3 className="font-bold text-white text-lg">Tavolo {selectedTable.table_number}</h3>
          <div className="flex justify-center">
            <img src={generateQR(selectedTable.id)}
              alt={`QR Tavolo ${selectedTable.table_number}`}
              className="w-48 h-48 rounded-2xl" />
          </div>
          <p className="text-xs text-white/40 break-all">{baseUrl}/table/{selectedTable.id}</p>
          <a href={generateQR(selectedTable.id)}
            download={`qr-tavolo-${selectedTable.table_number}.png`}
            className="btn-ghost inline-flex items-center gap-2 mx-auto">
            <QrCode size={16} /> Scarica QR
          </a>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Settings Tab (admin only)
// ─────────────────────────────────────────────
function SettingsTab() {
  const [showPrinter, setShowPrinter] = useState(false);

  return (
    <div className="space-y-4">
      {/* Printer settings */}
      <div className="card p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-white">Stampante Termica</h3>
            <p className="text-xs text-white/40 mt-0.5">Configurazione connessione TCP</p>
          </div>
          <button
            onClick={() => setShowPrinter(true)}
            className="btn-ghost flex items-center gap-2 py-2 px-4">
            <Printer size={14} /> Configura
          </button>
        </div>
      </div>

      {/* Embedded MenuManager */}
      <div>
        <p className="text-xs text-white/40 font-semibold uppercase tracking-wide mb-3 px-1">
          Gestione Menu
        </p>
        <MenuManager />
      </div>

      {showPrinter && <PrinterSettingsModal onClose={() => setShowPrinter(false)} />}
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN CASHIER DASHBOARD
// ─────────────────────────────────────────────
export function CashierDashboard() {
  const { tables, loading }     = useTables();
  const { isAdmin, user, logout } = useAuth();
  const [activeTab, setActiveTab]         = useState('tables');
  const [selectedTable, setSelectedTable] = useState(null);
  const [showTakeaway, setShowTakeaway]   = useState(false);
  const [takeawaySession, setTakeawaySession] = useState(null);

  if (loading) return <LoadingScreen message="Caricamento dashboard..." />;

  const tabs = [
    { id: 'tables',    label: 'Tavoli',      emoji: '🪑',  adminOnly: false },
    { id: 'inventory', label: 'Inventario',  emoji: '📦',  adminOnly: false },
    { id: 'reports',   label: 'Report',      emoji: '📊',  adminOnly: true  },
    { id: 'settings',  label: 'Impostazioni',emoji: '⚙️',  adminOnly: true  },
    { id: 'qr',        label: 'QR Codes',    emoji: '📱',  adminOnly: false },
  ].filter(t => !t.adminOnly || isAdmin);

  const stats = {
    occupied:  tables.filter(t => t.status === 'occupied').length,
    available: tables.filter(t => t.status === 'available').length,
    waiting:   tables.filter(t => t.status === 'waiting_payment').length,
  };

  function handleTakeawayCreated(session) {
    setShowTakeaway(false);
    setTakeawaySession(session);
  }

  return (
    <div className="min-h-screen bg-brand-dark">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-brand-dark/95 backdrop-blur-md border-b border-white/10">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">💰</span>
            <div>
              <h1 className="text-xl font-bold text-white">Cassa</h1>
              <p className="text-xs text-white/40">
                {isAdmin ? '👑 Admin' : '👤 Cassiere'} — {user?.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Takeaway button */}
            <button
              onClick={() => setShowTakeaway(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold
                bg-orange-500/20 text-orange-400 border border-orange-500/30 hover:bg-orange-500/30 transition-colors">
              <ShoppingBag size={14} />
              Asporto
            </button>

            {/* Live stats */}
            <div className="flex gap-3">
              <div className="text-center">
                <p className="text-xl font-black text-brand-red">{stats.occupied}</p>
                <p className="text-[10px] text-white/40">Occupati</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-black text-brand-green">{stats.available}</p>
                <p className="text-[10px] text-white/40">Liberi</p>
              </div>
              {stats.waiting > 0 && (
                <div className="text-center">
                  <p className="text-xl font-black text-brand-gold">{stats.waiting}</p>
                  <p className="text-[10px] text-white/40">Il Conto</p>
                </div>
              )}
            </div>

            {/* Logout */}
            <button
              onClick={logout}
              className="p-2 rounded-xl hover:bg-white/10 transition-colors"
              title="Logout">
              <LogOut size={18} className="text-white/40" />
            </button>
          </div>
        </div>

        {/* Tab nav */}
        <div className="px-6 pb-4 flex gap-2 overflow-x-auto scrollbar-none">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 transition-all
                ${activeTab === tab.id ? 'bg-brand-red text-white' : 'bg-white/10 text-white/50 hover:bg-white/15'}`}>
              <span>{tab.emoji}</span> {tab.label}
            </button>
          ))}
        </div>
      </header>

      <main className="p-6">
        {/* TABLES TAB */}
        {activeTab === 'tables' && (
          <div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mb-6">
              {tables.map(table => (
                <TableCard key={table.id} table={table}
                  isSelected={selectedTable?.id === table.id}
                  onClick={() => {
                    if (table.status !== 'available') setSelectedTable(table);
                  }}
                />
              ))}
            </div>
            {/* Legend */}
            <div className="flex gap-4 text-xs text-white/40">
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-brand-green" />Libero</div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-brand-red animate-pulse" />Occupato</div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-brand-gold animate-pulse" />Il Conto</div>
            </div>
            <p className="text-xs text-white/30 mt-2 italic">
              Clicca su un tavolo occupato per vedere il conto
            </p>
          </div>
        )}

        {/* INVENTORY TAB */}
        {activeTab === 'inventory' && <InventoryTab />}

        {/* REPORTS TAB — admin only */}
        {activeTab === 'reports' && isAdmin && <Reports />}

        {/* SETTINGS TAB — admin only */}
        {activeTab === 'settings' && isAdmin && <SettingsTab />}

        {/* QR TAB */}
        {activeTab === 'qr' && <QRTab tables={tables} />}
      </main>

      {/* Bill Modal */}
      {selectedTable && selectedTable.status !== 'available' && (
        <BillModal table={selectedTable} onClose={() => setSelectedTable(null)} />
      )}

      {/* Takeaway creation modal */}
      {showTakeaway && (
        <TakeawayModal
          onClose={() => setShowTakeaway(false)}
          onCreated={handleTakeawayCreated}
        />
      )}

      {/* Takeaway order builder */}
      {takeawaySession && (
        <TakeawayOrderBuilder
          session={takeawaySession}
          onClose={() => setTakeawaySession(null)}
          onOrderPlaced={() => setTakeawaySession(null)}
        />
      )}
    </div>
  );
}
