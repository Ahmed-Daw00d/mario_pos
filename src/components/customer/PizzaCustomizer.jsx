// src/components/customer/PizzaCustomizer.jsx — Italian primary language
import { useState, useMemo } from 'react';
import { X, Plus, Minus, ChevronRight } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';

const CATEGORY_LABELS = {
  sauce_cheese: { label: 'Salse e Formaggi', emoji: '🧀' },
  meat:         { label: 'Carni',            emoji: '🥩' },
  vegetable:    { label: 'Verdure',          emoji: '🥦' },
  other:        { label: 'Altro',            emoji: '✨' },
};

function IngredientToggle({ ingredient, isOn, isRemoved, price, onToggle }) {
  return (
    <button
      onClick={onToggle}
      disabled={!ingredient.is_available}
      className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl border transition-all duration-200
        ${!ingredient.is_available
          ? 'opacity-40 cursor-not-allowed border-white/5 bg-white/2'
          : isRemoved
            ? 'border-red-500/60 bg-red-500/10 text-red-300'
            : isOn
              ? 'border-brand-green/60 bg-brand-green/10 text-green-300'
              : 'border-white/10 bg-white/3 hover:border-white/25 text-white/80'}
      `}
    >
      <span className="text-sm font-medium">{ingredient.name_it}</span>
      <div className="flex items-center gap-2">
        {!ingredient.is_available && (
          <span className="text-xs text-red-400 italic">Esaurito</span>
        )}

        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
          ${isRemoved ? 'border-red-400 bg-red-400' : isOn ? 'border-brand-green bg-brand-green' : 'border-white/30'}`}>
          {isRemoved && <X size={10} className="text-white" />}
          {isOn && !isRemoved && <span className="text-white text-[9px] font-bold">✓</span>}
        </div>
      </div>
    </button>
  );
}

function SectionCustomizer({ sectionLabel, pizza, ingredients, size, value, onChange }) {
  const presetIds = new Set(pizza?.ingredients || []);
  const [added, setAdded]     = useState(value?.added_ingredients || []);
  const [removed, setRemoved] = useState(value?.removed_ingredients || []);

  function toggleIngredient(ingId) {
    const isPreset = presetIds.has(ingId);
    let newAdded = added, newRemoved = removed;
    if (isPreset) {
      newRemoved = removed.includes(ingId) ? removed.filter(x => x !== ingId) : [...removed, ingId];
      setRemoved(newRemoved);
    } else {
      newAdded = added.includes(ingId) ? added.filter(x => x !== ingId) : [...added, ingId];
      setAdded(newAdded);
    }
    onChange({ pizza_id: pizza?.id || 'custom', pizza_name: pizza?.name_it || 'Personalizzata', added_ingredients: newAdded, removed_ingredients: newRemoved });
  }

  const groupedIngredients = useMemo(() => {
    const groups = {};
    Object.values(ingredients).forEach(ing => {
      if (!groups[ing.category]) groups[ing.category] = [];
      groups[ing.category].push(ing);
    });
    return groups;
  }, [ingredients]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <div className="bg-brand-red/20 text-brand-red text-xs font-bold px-2.5 py-1 rounded-lg">{sectionLabel}</div>
      </div>
      {Object.entries(groupedIngredients).map(([cat, ings]) => (
        <div key={cat}>
          <p className="text-xs text-white/40 font-medium mb-1.5 flex items-center gap-1">
            <span>{CATEGORY_LABELS[cat]?.emoji}</span>
            <span>{CATEGORY_LABELS[cat]?.label}</span>
          </p>
          <div className="space-y-1.5">
            {ings.map(ing => {
              const isPreset  = presetIds.has(ing.id);
              const isRemoved = removed.includes(ing.id);
              const isAdded   = added.includes(ing.id);
              const isOn      = isPreset ? !isRemoved : isAdded;
              const price     = size === 'tonda' ? ing.price_tonda : ing.price_teglia;
              return (
                <IngredientToggle key={ing.id} ingredient={ing} isOn={isOn}
                  isRemoved={isRemoved} price={price} onToggle={() => toggleIngredient(ing.id)} />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export function PizzaCustomizer({ pizza, ingredients, onClose }) {
  const { addItem } = useCart();
  const [step, setStep]           = useState('size');
  const [size, setSize]           = useState('tonda');
  const [splitType, setSplitType] = useState('whole');
  const [removedIng, setRemovedIng] = useState([]);
  const [addedIng, setAddedIng]     = useState([]);
  const [splits, setSplits] = useState([
    { section: 1, pizza_id: pizza?.id, pizza_name: pizza?.name_it, added_ingredients: [], removed_ingredients: [] },
    { section: 2, pizza_id: pizza?.id, pizza_name: pizza?.name_it, added_ingredients: [], removed_ingredients: [] },
    { section: 3, pizza_id: pizza?.id, pizza_name: pizza?.name_it, added_ingredients: [], removed_ingredients: [] },
  ]);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes]       = useState('');

  const presetIds = new Set(pizza?.ingredients || []);

  const basePrice  = size === 'tonda' ? (pizza?.base_price_tonda ?? 0) : (pizza?.base_price_teglia ?? 0);
  const addedPrice = addedIng.length > 0 
    ? 1.00 + (addedIng.length - 1) * 0.50 
    : 0;
  const totalPrice = (basePrice + addedPrice) * quantity;

  function toggleIngredient(ingId) {
    const isPreset = presetIds.has(ingId);
    if (isPreset) {
      setRemovedIng(prev => prev.includes(ingId) ? prev.filter(x => x !== ingId) : [...prev, ingId]);
    } else {
      setAddedIng(prev => prev.includes(ingId) ? prev.filter(x => x !== ingId) : [...prev, ingId]);
    }
  }

  function handleAddToCart() {
    const isTeglia = size === 'teglia';
    addItem({
      item_id:   pizza?.id || 'custom_pizza',
      item_name: pizza?.name_it || 'Pizza Personalizzata',
      category:  'pizza',
      quantity,
      size,
      unit_price:  basePrice + addedPrice,
      total_price: basePrice + addedPrice,
      split_type: isTeglia ? splitType : 'whole',
      splits: isTeglia && splitType !== 'whole' ? splits.slice(0, splitType === 'half' ? 2 : 3) : null,
      removed_ingredients: removedIng,
      added_ingredients:   addedIng,
      kebab_config: null,
      notes,
    });
    onClose();
  }

  const groupedIngredients = useMemo(() => {
    const groups = {};
    Object.values(ingredients).forEach(ing => {
      if (!groups[ing.category]) groups[ing.category] = [];
      groups[ing.category].push(ing);
    });
    return groups;
  }, [ingredients]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
         style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-brand-card w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-white/10 shadow-2xl animate-slide-up">

        {/* Header */}
        <div className="sticky top-0 bg-brand-card/95 backdrop-blur-sm z-10 px-5 pt-5 pb-4 border-b border-white/10">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-white font-display italic">{pizza?.name_it}</h2>
              {pizza?.description_it && (
                <p className="text-xs text-white/40 mt-1 italic leading-relaxed max-w-xs">{pizza.description_it}</p>
              )}
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 transition-colors ml-2 flex-shrink-0">
              <X size={20} className="text-white/60" />
            </button>
          </div>
          {/* Progress */}
          <div className="flex gap-2 mt-4">
            <div className={`h-1 flex-1 rounded-full transition-all ${step !== 'size' ? 'bg-brand-red' : 'bg-brand-red/40'}`} />
            <div className={`h-1 flex-1 rounded-full transition-all ${['customize','customize_splits'].includes(step) ? 'bg-brand-red' : 'bg-white/20'}`} />
          </div>
        </div>

        <div className="p-5 space-y-6">

          {/* STEP 1: Size */}
          {step === 'size' && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="font-semibold text-white">Scegli il formato</h3>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setSize('tonda')}
                  className={`card p-4 flex flex-col items-center gap-2 border-2 transition-all ${size === 'tonda' ? 'border-brand-red bg-brand-red/10' : 'border-transparent hover:border-white/20'}`}>
                  <span className="text-4xl">🍕</span>
                  <span className="font-bold text-white text-lg">Tonda</span>
                  <span className="text-xs text-white/50">Individuale — rotonda</span>
                  <span className="text-brand-gold font-bold text-lg">€{pizza?.base_price_tonda?.toFixed(2)}</span>
                </button>
                <button onClick={() => setSize('teglia')}
                  className={`card p-4 flex flex-col items-center gap-2 border-2 transition-all ${size === 'teglia' ? 'border-brand-red bg-brand-red/10' : 'border-transparent hover:border-white/20'}`}>
                  <span className="text-4xl">🍫</span>
                  <span className="font-bold text-white text-lg">Teglia</span>
                  <span className="text-xs text-white/50">Familiare — rettangolare</span>
                  <span className="text-brand-gold font-bold text-lg">€{pizza?.base_price_teglia?.toFixed(2)}</span>
                </button>
              </div>

              {/* Teglia splits */}
              {size === 'teglia' && (
                <div className="space-y-2 animate-fade-in">
                  <h4 className="text-sm font-semibold text-white/70">Divisione della teglia</h4>
                  {[
                    { id: 'whole',  label: 'Un gusto unico',    sub: 'Gusto Unico',   emoji: '🟥' },
                    { id: 'half',   label: 'Metà e metà (½+½)', sub: 'Mezza e Mezza', emoji: '🟥🟦' },
                    { id: 'thirds', label: 'Tre gusti (⅓+⅓+⅓)', sub: 'Tre Gusti',    emoji: '🟥🟦🟩' },
                  ].map(opt => (
                    <button key={opt.id} onClick={() => setSplitType(opt.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all
                        ${splitType === opt.id ? 'border-brand-red bg-brand-red/10' : 'border-white/10 hover:border-white/25'}`}>
                      <span className="text-xl">{opt.emoji}</span>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-white">{opt.label}</p>
                        <p className="text-xs text-white/50 italic">{opt.sub}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <button onClick={() => setStep(size === 'teglia' && splitType !== 'whole' ? 'customize_splits' : 'customize')}
                className="btn-primary w-full flex items-center justify-center gap-2">
                Avanti <ChevronRight size={18} />
              </button>
            </div>
          )}

          {/* STEP 2a: Customize whole pizza */}
          {step === 'customize' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h3 className="font-semibold text-white">Personalizza la tua pizza</h3>
                <p className="text-xs text-white/40 mt-1">
                  Ingredienti base: {pizza?.ingredients?.map(id => ingredients[id]?.name_it).filter(Boolean).join(', ')}
                </p>
              </div>
              {Object.entries(groupedIngredients).map(([cat, ings]) => (
                <div key={cat}>
                  <p className="text-xs text-white/40 font-medium mb-2 flex items-center gap-1">
                    <span>{CATEGORY_LABELS[cat]?.emoji}</span>
                    <span>{CATEGORY_LABELS[cat]?.label}</span>
                  </p>
                  <div className="space-y-1.5">
                    {ings.map(ing => {
                      const isPreset  = presetIds.has(ing.id);
                      const isRemoved = removedIng.includes(ing.id);
                      const isAdded   = addedIng.includes(ing.id);
                      const isOn      = isPreset ? !isRemoved : isAdded;
                      const price     = size === 'tonda' ? ing.price_tonda : ing.price_teglia;
                      return (
                        <IngredientToggle key={ing.id} ingredient={ing} isOn={isOn}
                          isRemoved={isRemoved} price={price} onToggle={() => toggleIngredient(ing.id)} />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* STEP 2b: Customize splits */}
          {step === 'customize_splits' && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="font-semibold text-white">Personalizza ogni sezione</h3>
              {Array.from({ length: splitType === 'half' ? 2 : 3 }, (_, i) => (
                <div key={i} className="card p-4 space-y-3">
                  <SectionCustomizer
                    sectionLabel={`Sezione ${i + 1}`}
                    pizza={pizza}
                    ingredients={ingredients}
                    size={size}
                    value={splits[i]}
                    onChange={(val) => setSplits(prev => prev.map((s, idx) => idx === i ? { ...s, ...val } : s))}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Notes */}
          {(step === 'customize' || step === 'customize_splits') && (
            <div>
              <label className="text-sm text-white/60 mb-1.5 block">Note (opzionale)</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="Istruzioni speciali per il cuoco..."
                className="input-field resize-none h-20 text-sm" />
            </div>
          )}
        </div>

        {/* Footer */}
        {step !== 'size' && (
          <div className="sticky bottom-0 bg-brand-card/95 backdrop-blur-sm border-t border-white/10 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-10 h-10 rounded-xl border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors">
                  <Minus size={16} />
                </button>
                <span className="text-xl font-bold w-6 text-center">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)}
                  className="w-10 h-10 rounded-xl bg-brand-red flex items-center justify-center hover:bg-red-700 transition-colors">
                  <Plus size={16} />
                </button>
              </div>
              <div className="text-right">
                <p className="text-xs text-white/40">Totale</p>
                <p className="text-2xl font-bold text-brand-gold">€{totalPrice.toFixed(2)}</p>
              </div>
            </div>
            <button onClick={handleAddToCart} className="btn-primary w-full text-base">
              Aggiungi all'ordine
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
