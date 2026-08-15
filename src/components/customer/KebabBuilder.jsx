// src/components/customer/KebabBuilder.jsx — Italian primary language
import { useState } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { KEBAB_OPTIONS } from '../../data/menuData';

const STEPS = ['serving', 'vegetables', 'sauces'];
const STEP_LABELS = ['Tipo di servizio', 'Verdure', 'Salse'];

export function KebabBuilder({ onClose }) {
  const { addItem } = useCart();
  const [step, setStep]       = useState(0);
  const [serving, setServing] = useState(null);
  const [vegetables, setVegs] = useState([]);
  const [sauces, setSauces]   = useState([]);
  const [quantity, setQty]    = useState(1);
  const [notes, setNotes]     = useState('');

  function toggleArr(arr, setArr, val) {
    setArr(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]);
  }

  function handleAdd() {
    const price = serving === 'sandwich_focaccia' ? 5 : 6;
    addItem({
      item_id:   'kebab_builder',
      item_name: 'Kebab di Pollo',
      category:  'kebab',
      quantity,
      size: null, split_type: null, splits: null,
      removed_ingredients: [], added_ingredients: [],
      unit_price:  price,
      total_price: price,
      kebab_config: { serving_style: serving, vegetables, sauces },
      notes,
    });
    onClose();
  }

  const canNext = step === 0 ? !!serving : true;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
         style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-brand-card w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-white/10 shadow-2xl animate-slide-up">

        {/* Header */}
        <div className="sticky top-0 bg-brand-card/95 backdrop-blur-sm px-5 pt-5 pb-4 border-b border-white/10 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white font-display italic">🥙 Kebab di Pollo</h2>
              <p className="text-sm text-white/50 italic mt-0.5">Pollo fresco alla griglia</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
              <X size={20} className="text-white/60" />
            </button>
          </div>
          {/* Step indicator */}
          <div className="flex gap-2 mt-4">
            {STEPS.map((s, i) => (
              <div key={s} className={`h-1 flex-1 rounded-full transition-all ${i <= step ? 'bg-brand-red' : 'bg-white/20'}`} />
            ))}
          </div>
          <p className="text-xs text-white/40 mt-2">Step {step + 1} di {STEPS.length} — {STEP_LABELS[step]}</p>
        </div>

        <div className="p-5 space-y-4">

          {/* Step 0: Serving Style */}
          {step === 0 && (
            <div className="animate-fade-in space-y-3">
              <h3 className="font-semibold text-white">Come lo vuoi?</h3>
              {KEBAB_OPTIONS.serving_styles.map(s => (
                <button key={s.id} onClick={() => setServing(s.id)}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left
                    ${serving === s.id ? 'border-brand-red bg-brand-red/10' : 'border-white/10 hover:border-white/25'}`}>
                  <span className="text-2xl">{s.id === 'piatto' ? '🍽️' : '🥙'}</span>
                  <div>
                    <p className="font-semibold text-white">{s.name_it}</p>
                  </div>
                  {serving === s.id && (
                    <span className="ml-auto text-brand-red font-bold">✓</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Step 1: Vegetables */}
          {step === 1 && (
            <div className="animate-fade-in space-y-3">
              <div>
                <h3 className="font-semibold text-white">Verdure 🥗</h3>
                <p className="text-xs text-white/40 mt-0.5">Scegli quello che vuoi (opzionale)</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {KEBAB_OPTIONS.vegetables.map(v => (
                  <button key={v.id} onClick={() => toggleArr(vegetables, setVegs, v.id)}
                    className={`p-3 rounded-xl border-2 transition-all text-sm font-medium text-left
                      ${vegetables.includes(v.id)
                        ? 'border-brand-green bg-brand-green/10 text-green-300'
                        : 'border-white/10 text-white/70 hover:border-white/25'}`}>
                    {v.name_it}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Sauces */}
          {step === 2 && (
            <div className="animate-fade-in space-y-3">
              <div>
                <h3 className="font-semibold text-white">Salse 🥣</h3>
                <p className="text-xs text-white/40 mt-0.5">Scegli quello che vuoi (opzionale)</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {KEBAB_OPTIONS.sauces.map(s => (
                  <button key={s.id} onClick={() => toggleArr(sauces, setSauces, s.id)}
                    className={`p-3 rounded-xl border-2 transition-all text-sm font-medium text-left
                      ${sauces.includes(s.id)
                        ? 'border-brand-gold bg-brand-gold/10 text-yellow-300'
                        : 'border-white/10 text-white/70 hover:border-white/25'}`}>
                    {s.name_it}
                  </button>
                ))}
              </div>

              <div>
                <label className="text-sm text-white/60 mb-1.5 block">Note (opzionale)</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)}
                  placeholder="Istruzioni speciali..."
                  className="input-field resize-none h-16 text-sm" />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-brand-card/95 backdrop-blur-sm border-t border-white/10 p-5">
          {step === 2 && (
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <button onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="w-10 h-10 rounded-xl border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors">
                  <span className="text-lg font-bold">−</span>
                </button>
                <span className="text-xl font-bold w-6 text-center">{quantity}</span>
                <button onClick={() => setQty(q => q + 1)}
                  className="w-10 h-10 rounded-xl bg-brand-red flex items-center justify-center hover:bg-red-700 transition-colors">
                  <span className="text-lg font-bold">+</span>
                </button>
              </div>
              <div className="text-right">
                <p className="text-xs text-white/40">Totale</p>
                <p className="text-2xl font-bold text-brand-gold">€{((serving === 'sandwich_focaccia' ? 5 : 6) * quantity).toFixed(2)}</p>
              </div>
            </div>
          )}
          <div className="flex gap-3">
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)}
                className="btn-ghost flex items-center gap-1 px-4">
                <ChevronLeft size={18} /> Indietro
              </button>
            )}
            {step < 2 ? (
              <button onClick={() => setStep(s => s + 1)} disabled={!canNext}
                className="btn-primary flex-1 flex items-center justify-center gap-2">
                Avanti <ChevronRight size={18} />
              </button>
            ) : (
              <button onClick={handleAdd} className="btn-primary flex-1">
                Aggiungi all'ordine
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
