import { useState } from 'react';
import { X } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';

const SAUCES = [
  { id: 'ketchup', name_it: 'Ketchup' },
  { id: 'maionese', name_it: 'Maionese' },
  { id: 'bbq', name_it: 'Salsa BBQ' },
  { id: 'senape', name_it: 'Senape' }
];

export function FrittiCustomizer({ item, onClose }) {
  const { addItem } = useCart();
  const [selectedSauces, setSelectedSauces] = useState([]);
  const [quantity, setQuantity] = useState(1);

  const toggleSauce = (id) => {
    setSelectedSauces(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleAddToCart = () => {
    let notes = selectedSauces.length > 0 ? `Salse: ${selectedSauces.map(s => SAUCES.find(x => x.id === s)?.name_it).join(', ')}` : '';
    addItem({
      item_id: item.id,
      item_name: item.name_it,
      category: 'fritti',
      quantity,
      size: null, split_type: null, splits: null,
      removed_ingredients: [], added_ingredients: [],
      unit_price: item.price,
      total_price: item.price,
      kebab_config: null,
      notes,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
         style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-brand-card w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-white/10 shadow-2xl animate-slide-up">
        
        <div className="sticky top-0 bg-brand-card/95 backdrop-blur-sm z-10 px-5 pt-5 pb-4 border-b border-white/10">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-white font-display italic">{item.name_it}</h2>
              <p className="text-brand-gold font-bold mt-1">€{item.price.toFixed(2)}</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 transition-colors ml-2">
              <X size={20} className="text-white/60" />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <h3 className="font-semibold text-white">Scegli le salse (Opzionale)</h3>
          <div className="grid grid-cols-2 gap-3">
            {SAUCES.map(sauce => (
              <button key={sauce.id} onClick={() => toggleSauce(sauce.id)}
                className={`p-3 rounded-xl border-2 transition-all font-medium text-sm
                  ${selectedSauces.includes(sauce.id) ? 'border-brand-gold bg-brand-gold/10 text-yellow-300' : 'border-white/10 text-white/70 hover:border-white/25'}`}>
                {sauce.name_it}
              </button>
            ))}
          </div>
        </div>

        <div className="sticky bottom-0 bg-brand-card/95 backdrop-blur-sm border-t border-white/10 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-10 h-10 rounded-xl border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors text-lg font-bold">
                −
              </button>
              <span className="text-xl font-bold w-6 text-center">{quantity}</span>
              <button onClick={() => setQuantity(q => q + 1)}
                className="w-10 h-10 rounded-xl bg-brand-red flex items-center justify-center hover:bg-red-700 transition-colors text-lg font-bold">
                +
              </button>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/40">Totale</p>
              <p className="text-2xl font-bold text-brand-gold">€{(item.price * quantity).toFixed(2)}</p>
            </div>
          </div>
          <button onClick={handleAddToCart} className="btn-primary w-full text-base">
            Aggiungi all'ordine
          </button>
        </div>

      </div>
    </div>
  );
}
