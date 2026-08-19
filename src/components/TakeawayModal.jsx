// src/components/TakeawayModal.jsx — Create a new takeaway/asporto session
import { useState } from 'react';
import { X, ShoppingBag, User, Phone, ChevronRight, Loader } from 'lucide-react';
import {
  doc, collection, setDoc, serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';

/**
 * @param {function} onClose
 * @param {function} onCreated  — called with the new session object
 */
export function TakeawayModal({ onClose, onCreated }) {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone]               = useState('');
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');

  async function handleCreate() {
    if (!customerName.trim()) {
      setError('Il nome del cliente è obbligatorio.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const sessionRef = doc(collection(db, 'sessions'));
      const sessionData = {
        id:             sessionRef.id,
        type:           'takeaway',
        table_id:       null,
        table_number:   null,
        customer_name:  customerName.trim(),
        phone:          phone.trim() || null,
        started_at:     serverTimestamp(),
        closed_at:      null,
        status:         'open',
        total_amount:   0,
        order_ids:      [],
        payment_method: null,
      };
      await setDoc(sessionRef, sessionData);
      onCreated?.(sessionData);
    } catch (e) {
      console.error(e);
      setError('Errore nella creazione. Riprova.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)' }}
    >
      <div className="bg-brand-card w-full max-w-sm rounded-3xl border border-white/10 shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-orange-500/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
              <ShoppingBag size={18} className="text-orange-400" />
            </div>
            <div>
              <h2 className="font-bold text-white">Asporto / Takeaway</h2>
              <p className="text-xs text-white/40">Nuovo ordine da asporto</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
            <X size={18} className="text-white/60" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Customer name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wide">
              Nome Cliente <span className="text-brand-red">*</span>
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="text"
                value={customerName}
                onChange={e => { setCustomerName(e.target.value); setError(''); }}
                placeholder="Es. Mohamed Ali"
                className={`input-field w-full pl-9 ${error ? 'border-red-500/50' : ''}`}
                autoFocus
              />
            </div>
            {error && <p className="text-red-400 text-xs">{error}</p>}
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wide">
              Telefono <span className="text-white/30">(opzionale)</span>
            </label>
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+39 333 000 0000"
                className="input-field w-full pl-9"
              />
            </div>
          </div>

          <p className="text-xs text-white/30 text-center italic">
            L'ordine apparirà in cucina con il tag 🛍️ Asporto
          </p>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 grid grid-cols-2 gap-3">
          <button onClick={onClose} className="btn-ghost">
            Annulla
          </button>
          <button
            onClick={handleCreate}
            disabled={loading || !customerName.trim()}
            className="btn-primary flex items-center justify-center gap-2 disabled:opacity-40 bg-orange-500 hover:bg-orange-600"
          >
            {loading ? (
              <Loader size={16} className="animate-spin" />
            ) : (
              <>
                Crea Ordine
                <ChevronRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
