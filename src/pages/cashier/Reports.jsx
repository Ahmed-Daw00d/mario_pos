// src/pages/cashier/Reports.jsx — Daily sales analytics (admin only)
import { useState, useEffect } from 'react';
import {
  collection, query, where, getDocs, Timestamp
} from 'firebase/firestore';
import { db } from '../../firebase';
import {
  TrendingUp, DollarSign, CreditCard, Banknote,
  ShoppingBag, UtensilsCrossed, RefreshCw, Calendar
} from 'lucide-react';

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className={`card p-5 border ${color.border}`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color.bg}`}>
          <Icon size={18} className={color.text} />
        </div>
      </div>
      <p className={`text-2xl font-black ${color.text}`}>{value}</p>
      <p className="text-sm text-white/50 mt-1">{label}</p>
      {sub && <p className="text-xs text-white/30 mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function Reports() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [indexError, setIndexError] = useState(null); // holds Firebase console link if index is missing
  const [date, setDate]         = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0]; // YYYY-MM-DD
  });

  async function fetchData(targetDate) {
    setLoading(true);
    try {
      setIndexError(null);
      // Build start/end Timestamps for the selected day
      const start = new Date(targetDate + 'T00:00:00');
      const end   = new Date(targetDate + 'T23:59:59');

      const q = query(
        collection(db, 'sessions'),
        where('status', '==', 'closed'),
        where('closed_at', '>=', Timestamp.fromDate(start)),
        where('closed_at', '<=', Timestamp.fromDate(end))
      );

      const snap = await getDocs(q);
      setSessions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error('Reports fetch error:', e);
      // Detect missing Composite Index (Firebase error code)
      if (e.code === 'failed-precondition' || e.message?.includes('index')) {
        // Firebase embeds the console URL in the error message
        const match = e.message?.match(/https:\/\/console\.firebase\.google\.com\S+/);
        setIndexError(match ? match[0] : 'https://console.firebase.google.com');
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchData(date); }, [date]);

  // ─── Compute stats ───────────────────────────────────────────────────────────
  const totalRevenue = sessions.reduce((s, se) => s + (se.total_amount || 0), 0);
  const cashTotal    = sessions
    .filter(s => s.payment_method === 'cash')
    .reduce((s, se) => s + (se.total_amount || 0), 0);
  const cardTotal    = sessions
    .filter(s => s.payment_method === 'card')
    .reduce((s, se) => s + (se.total_amount || 0), 0);
  const takeawayCount = sessions.filter(s => s.type === 'takeaway').length;
  const dineInCount   = sessions.filter(s => s.type !== 'takeaway').length;

  const isToday = date === new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      {/* Date picker + Refresh */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2">
          <Calendar size={16} className="text-white/40" />
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="bg-transparent text-white text-sm outline-none"
            max={new Date().toISOString().split('T')[0]}
          />
        </div>
        <button
          onClick={() => fetchData(date)}
          disabled={loading}
          className="btn-ghost flex items-center gap-2 py-2 px-4"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Aggiorna
        </button>
        {isToday && (
          <span className="px-3 py-1 bg-brand-green/20 border border-brand-green/30 text-brand-green text-xs font-semibold rounded-full">
            📅 Oggi
          </span>
        )}
      </div>

      {loading ? (
        <div className="py-16 text-center">
          <div className="text-4xl mb-3 animate-bounce">📊</div>
          <p className="text-white/40 italic">Caricamento dati...</p>
        </div>
      ) : indexError ? (
        // Missing Firestore Composite Index
        <div className="py-12 text-center space-y-4">
          <div className="text-5xl mb-2">⚠️</div>
          <h3 className="text-lg font-bold text-white">Index mancante su Firestore</h3>
          <p className="text-sm text-white/50 max-w-xs mx-auto">
            Per i report è richiesto un indice composito su Firestore.
            Clicca il pulsante per crearlo (operazione una-tantum).
          </p>
          <a
            href={indexError}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-gold text-black font-bold hover:bg-yellow-400 transition-colors">
            🔗 Crea Indice su Firebase Console
          </a>
          <p className="text-xs text-white/30 italic">
            Dopo la creazione (1-2 minuti) ricarica questa pagina.
          </p>
        </div>
      ) : sessions.length === 0 ? (
        <div className="py-16 text-center">
          <div className="text-6xl mb-4 opacity-20">📈</div>
          <p className="text-white/40 text-lg font-medium">Nessun dato per questa data</p>
          <p className="text-white/20 text-sm mt-1">
            {date === new Date().toISOString().split('T')[0]
              ? 'La giornata non ha ancora ordini chiusi.'
              : 'Nessuna sessione chiusa in questa data.'}
          </p>
        </div>
      ) : (
        <>
          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              icon={TrendingUp}
              label="Incasso Totale"
              value={`€${totalRevenue.toFixed(2)}`}
              color={{ border: 'border-brand-gold/30', bg: 'bg-brand-gold/10', text: 'text-brand-gold' }}
              sub={`${sessions.length} sessioni chiuse`}
            />
            <StatCard
              icon={Banknote}
              label="Contanti"
              value={`€${cashTotal.toFixed(2)}`}
              color={{ border: 'border-green-500/30', bg: 'bg-green-500/10', text: 'text-green-400' }}
              sub={`${sessions.filter(s => s.payment_method === 'cash').length} pagamenti`}
            />
            <StatCard
              icon={CreditCard}
              label="Carta"
              value={`€${cardTotal.toFixed(2)}`}
              color={{ border: 'border-blue-500/30', bg: 'bg-blue-500/10', text: 'text-blue-400' }}
              sub={`${sessions.filter(s => s.payment_method === 'card').length} pagamenti`}
            />
            <StatCard
              icon={ShoppingBag}
              label="Asporto"
              value={takeawayCount}
              color={{ border: 'border-orange-500/30', bg: 'bg-orange-500/10', text: 'text-orange-400' }}
              sub={`${dineInCount} tavoli`}
            />
          </div>

          {/* Payment breakdown bar */}
          {totalRevenue > 0 && (
            <div className="card p-4 space-y-3">
              <p className="text-xs text-white/40 font-semibold uppercase tracking-wide">
                Ripartizione pagamenti
              </p>
              <div className="flex rounded-full overflow-hidden h-3">
                {cashTotal > 0 && (
                  <div
                    className="bg-green-500 h-full transition-all"
                    style={{ width: `${(cashTotal / totalRevenue) * 100}%` }}
                    title={`Cash: ${((cashTotal / totalRevenue) * 100).toFixed(1)}%`}
                  />
                )}
                {cardTotal > 0 && (
                  <div
                    className="bg-blue-500 h-full transition-all"
                    style={{ width: `${(cardTotal / totalRevenue) * 100}%` }}
                    title={`Card: ${((cardTotal / totalRevenue) * 100).toFixed(1)}%`}
                  />
                )}
                {(totalRevenue - cashTotal - cardTotal) > 0 && (
                  <div
                    className="bg-white/20 h-full flex-1"
                    title="Non specificato"
                  />
                )}
              </div>
              <div className="flex gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  <span className="text-white/50">Contanti {cashTotal > 0 ? `${((cashTotal / totalRevenue) * 100).toFixed(0)}%` : ''}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span className="text-white/50">Carta {cardTotal > 0 ? `${((cardTotal / totalRevenue) * 100).toFixed(0)}%` : ''}</span>
                </div>
              </div>
            </div>
          )}

          {/* Sessions list */}
          <div className="space-y-2">
            <p className="text-xs text-white/40 font-semibold uppercase tracking-wide px-1">
              Dettaglio Sessioni — {sessions.length}
            </p>
            {sessions
              .slice()
              .sort((a, b) => (b.closed_at?.toMillis?.() || 0) - (a.closed_at?.toMillis?.() || 0))
              .map(session => {
                const closedAt = session.closed_at?.toDate
                  ? session.closed_at.toDate().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
                  : '—';
                const isTakeaway = session.type === 'takeaway';
                const payIcon = session.payment_method === 'cash' ? '💵' :
                                session.payment_method === 'card' ? '💳' : '❓';

                return (
                  <div key={session.id}
                    className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl border border-white/5">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/10 flex-shrink-0">
                      {isTakeaway
                        ? <ShoppingBag size={16} className="text-orange-400" />
                        : <UtensilsCrossed size={16} className="text-white/50" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white">
                        {isTakeaway
                          ? `🛍️ ${session.customer_name || 'Asporto'}`
                          : `Tavolo ${session.table_number || '—'}`}
                      </p>
                      <p className="text-xs text-white/40">
                        {session.order_ids?.length || 0} ordini · chiuso alle {closedAt}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-white">€{(session.total_amount || 0).toFixed(2)}</p>
                      <p className="text-xs text-white/40">{payIcon}</p>
                    </div>
                  </div>
                );
              })}
          </div>
        </>
      )}
    </div>
  );
}
