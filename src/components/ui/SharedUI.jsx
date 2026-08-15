// src/components/ui/SharedUI.jsx — Italian primary language

export function LoadingScreen({ message = 'Caricamento in corso...' }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-brand-dark gap-6">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full border-4 border-brand-red/20 animate-ping" />
        <div className="absolute inset-0 rounded-full border-4 border-t-brand-red border-brand-red/20 animate-spin" />
        <span className="absolute inset-0 flex items-center justify-center text-3xl">🍕</span>
      </div>
      <p className="text-white/60 font-medium italic">{message}</p>
    </div>
  );
}

export function StatusBadge({ status }) {
  const config = {
    pending:        { label: 'In Attesa',       cls: 'badge-pending',     emoji: '⏳' },
    in_preparation: { label: 'In Preparazione', cls: 'badge-preparation', emoji: '👨‍🍳' },
    in_oven:        { label: 'In Forno',         cls: 'badge-oven',        emoji: '🔥' },
    ready:          { label: 'Pronto!',          cls: 'badge-ready',       emoji: '✅' },
    served:         { label: 'Servito',          cls: 'badge-served',      emoji: '🍽️' },
  };
  const cfg = config[status] || config.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${cfg.cls}`}>
      <span>{cfg.emoji}</span>
      <span>{cfg.label}</span>
    </span>
  );
}
