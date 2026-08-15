// src/components/customer/OrderTracker.jsx — Italian primary language
import { StatusBadge } from '../ui/SharedUI';

const STATUS_STEPS = ['pending', 'in_preparation', 'in_oven', 'ready', 'served'];

const STATUS_CONFIG = {
  pending:        { emoji: '⏳', label: 'In Attesa' },
  in_preparation: { emoji: '👨‍🍳', label: 'In Preparazione' },
  in_oven:        { emoji: '🔥', label: 'In Forno' },
  ready:          { emoji: '✅', label: 'Pronto!' },
  served:         { emoji: '🍽️', label: 'Servito' },
};

function ProgressBar({ status }) {
  const currentIdx = STATUS_STEPS.indexOf(status);
  return (
    <div className="flex items-center gap-1">
      {STATUS_STEPS.slice(0, 4).map((s, i) => {
        const isDone   = currentIdx > i;
        const isActive = currentIdx === i;
        return (
          <div key={s} className="flex items-center gap-1 flex-1">
            <div className={`flex-1 h-1.5 rounded-full transition-all duration-700
              ${isDone || isActive ? 'bg-brand-red' : 'bg-white/15'}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 transition-all duration-500
              ${isDone ? 'border-brand-green bg-brand-green/20' :
                isActive ? 'border-brand-red bg-brand-red/20 animate-pulse-slow' :
                           'border-white/15 bg-transparent opacity-40'}`}>
              {STATUS_CONFIG[s]?.emoji}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function OrderTracker({ orders }) {
  if (!orders || orders.length === 0) return null;

  const activeOrders = orders.filter(o => o.status !== 'served');
  const servedOrders = orders.filter(o => o.status === 'served');

  return (
    <div className="space-y-4">
      {activeOrders.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-white/60 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-red animate-pulse" />
            I tuoi ordini in corso
          </h3>
          {activeOrders.map(order => (
            <div key={order.id} className="card p-4 space-y-3 mb-3 border border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/40 uppercase tracking-wide">
                  Ordine #{order.id.slice(-4).toUpperCase()}
                </span>
                <StatusBadge status={order.status} />
              </div>
              <ProgressBar status={order.status} />
              <div className="space-y-1 mt-1">
                {order.items?.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-white/80">
                      {item.quantity}× {item.item_name}
                      {item.size && <span className="text-xs text-white/40 ml-1 capitalize">({item.size})</span>}
                    </span>
                    <span className="text-white/50">€{(item.total_price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {order.status === 'ready' && (
                <div className="bg-brand-green/10 border border-brand-green/30 rounded-xl p-3 text-center">
                  <p className="text-brand-green font-semibold">✅ Il tuo ordine è pronto!</p>
                  <p className="text-xs text-white/40 mt-0.5">Viene portato al tavolo</p>
                </div>
              )}
              {order.status === 'in_oven' && (
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-2.5 text-center">
                  <p className="text-orange-300 text-sm font-medium">🔥 La tua pizza è in forno!</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {servedOrders.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-white/30 mb-3">Già serviti ✓</h3>
          {servedOrders.map(order => (
            <div key={order.id} className="card p-3 opacity-40 mb-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/40">
                  Ordine #{order.id.slice(-4).toUpperCase()}
                </span>
                <StatusBadge status="served" />
              </div>
              <p className="text-xs text-white/30 mt-1">
                €{order.subtotal?.toFixed(2)} — {order.items?.length} articoli
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
