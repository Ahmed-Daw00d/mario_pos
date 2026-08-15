import { useState } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { useMenu } from '../../hooks/useMenu';
import { useTables } from '../../hooks/useTables';
import { Trash2, Plus, Edit2, Save, X } from 'lucide-react';

export function MenuManager() {
  const { pizzas, kebab, fritti, bevande, ingredients, loading: menuLoading } = useMenu();
  const { tables, loading: tablesLoading } = useTables();
  const [activeSection, setActiveSection] = useState('tables');

  if (menuLoading || tablesLoading) return <div className="text-white/40 text-center py-8">Caricamento in corso...</div>;

  const sections = [
    { id: 'tables', label: 'Tavoli' },
    { id: 'ingredients', label: 'Ingredienti' },
    { id: 'menu_items', label: 'Prodotti (Pizze/Fritti/Bevande)' }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex gap-2 border-b border-white/10 pb-2 overflow-x-auto scrollbar-none">
        {sections.map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeSection === s.id ? 'bg-brand-red text-white' : 'text-white/50 hover:bg-white/10 hover:text-white'}`}>
            {s.label}
          </button>
        ))}
      </div>

      {activeSection === 'tables' && <TableManager tables={tables} />}
      {activeSection === 'ingredients' && <IngredientManager ingredients={ingredients} />}
      {activeSection === 'menu_items' && <MenuItemManager pizzas={pizzas} fritti={fritti} bevande={bevande} />}
    </div>
  );
}

function TableManager({ tables }) {
  const [newNum, setNewNum] = useState('');
  const [newSeats, setNewSeats] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleAdd() {
    if (!newNum || !newSeats) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'tables'), {
        table_number: parseInt(newNum),
        seats: parseInt(newSeats),
        status: 'available',
        active_session_id: null
      });
      setNewNum(''); setNewSeats('');
    } catch (e) { console.error(e); }
    finally { setSubmitting(false); }
  }

  async function handleDelete(id) {
    if (confirm("Sei sicuro di voler eliminare questo tavolo?")) {
      await deleteDoc(doc(db, 'tables', id));
    }
  }

  return (
    <div className="space-y-4">
      <div className="card p-4 flex gap-2 items-end">
        <div className="flex-1">
          <label className="text-xs text-white/50 block mb-1">Numero Tavolo</label>
          <input type="number" value={newNum} onChange={e => setNewNum(e.target.value)} className="input-field py-2" placeholder="Es. 10" />
        </div>
        <div className="flex-1">
          <label className="text-xs text-white/50 block mb-1">Posti</label>
          <input type="number" value={newSeats} onChange={e => setNewSeats(e.target.value)} className="input-field py-2" placeholder="Es. 4" />
        </div>
        <button onClick={handleAdd} disabled={submitting} className="btn-primary py-2 px-4 flex items-center gap-1">
          <Plus size={16} /> Aggiungi
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {tables.map(t => (
          <div key={t.id} className="card p-4 flex items-center justify-between">
            <div>
              <p className="font-bold text-white text-lg">#{t.table_number}</p>
              <p className="text-xs text-white/50">{t.seats} posti</p>
            </div>
            <button onClick={() => handleDelete(t.id)} className="text-red-400 p-2 hover:bg-white/10 rounded-lg transition-colors">
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function IngredientManager({ ingredients }) {
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const ingList = Object.values(ingredients);

  function startEdit(ing) {
    setEditingId(ing.id);
    setFormData(ing);
  }

  function startNew() {
    setEditingId('new');
    setFormData({ id: '', name_it: '', name_ar: '', price_tonda: 0, price_teglia: 0, is_available: true });
  }

  async function handleSave() {
    if (editingId === 'new') {
      const { id, ...rest } = formData;
      if (!id) return alert("Inserisci un ID per l'ingrediente");
      await addDoc(collection(db, 'ingredients'), { ...rest, id_name: id });
    } else {
      await updateDoc(doc(db, 'ingredients', editingId), formData);
    }
    setEditingId(null);
  }

  async function handleDelete(id) {
    if (confirm("Eliminare ingrediente?")) {
      await deleteDoc(doc(db, 'ingredients', id));
    }
  }

  return (
    <div className="space-y-4">
      <button onClick={startNew} className="btn-ghost flex items-center gap-2"><Plus size={16} /> Nuovo Ingrediente</button>
      {editingId && (
        <div className="card p-4 border border-brand-red space-y-3">
          <h3 className="font-bold text-white">{editingId === 'new' ? 'Nuovo Ingrediente' : 'Modifica Ingrediente'}</h3>
          {editingId === 'new' && (
            <input type="text" placeholder="ID (es. cipolla)" className="input-field py-2" value={formData.id || ''} onChange={e => setFormData({...formData, id: e.target.value})} />
          )}
          <div className="flex gap-2">
            <input type="text" placeholder="Nome IT" className="input-field py-2 flex-1" value={formData.name_it || ''} onChange={e => setFormData({...formData, name_it: e.target.value})} />
            <input type="text" placeholder="Nome AR" className="input-field py-2 flex-1 text-right" value={formData.name_ar || ''} onChange={e => setFormData({...formData, name_ar: e.target.value})} />
          </div>
          <div className="flex gap-2">
            <input type="number" placeholder="Prezzo Tonda" className="input-field py-2 flex-1" value={formData.price_tonda || ''} onChange={e => setFormData({...formData, price_tonda: parseFloat(e.target.value)})} />
            <input type="number" placeholder="Prezzo Teglia" className="input-field py-2 flex-1" value={formData.price_teglia || ''} onChange={e => setFormData({...formData, price_teglia: parseFloat(e.target.value)})} />
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <button onClick={() => setEditingId(null)} className="btn-ghost py-2">Annulla</button>
            <button onClick={handleSave} className="btn-primary py-2 px-6 flex items-center gap-2"><Save size={16} /> Salva</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {ingList.map(ing => (
          <div key={ing.id} className="card p-3 flex items-center justify-between">
            <div>
              <p className="font-medium text-white">{ing.name_it} <span className="text-xs text-white/50">{ing.name_ar}</span></p>
              <p className="text-xs text-brand-gold">Tonda: €{ing.price_tonda?.toFixed(2)} | Teglia: €{ing.price_teglia?.toFixed(2)}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => startEdit(ing)} className="p-2 text-white/50 hover:bg-white/10 rounded"><Edit2 size={16} /></button>
              <button onClick={() => handleDelete(ing.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MenuItemManager({ pizzas, fritti, bevande }) {
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const allItems = [...pizzas, ...fritti, ...bevande];

  function startEdit(item) {
    setEditingId(item.id);
    setFormData(item);
  }

  function startNew() {
    setEditingId('new');
    setFormData({ category: 'pizza', name_it: '', name_ar: '', price: 0, base_price_tonda: 0, base_price_teglia: 0, is_available: true });
  }

  async function handleSave() {
    if (editingId === 'new') {
      await addDoc(collection(db, 'menu_items'), formData);
    } else {
      await updateDoc(doc(db, 'menu_items', editingId), formData);
    }
    setEditingId(null);
  }

  async function handleDelete(id) {
    if (confirm("Eliminare prodotto?")) {
      await deleteDoc(doc(db, 'menu_items', id));
    }
  }

  return (
    <div className="space-y-4">
      <button onClick={startNew} className="btn-ghost flex items-center gap-2"><Plus size={16} /> Nuovo Prodotto</button>
      {editingId && (
        <div className="card p-4 border border-brand-red space-y-3">
          <h3 className="font-bold text-white">{editingId === 'new' ? 'Nuovo Prodotto' : 'Modifica Prodotto'}</h3>
          
          <select className="input-field py-2 w-full bg-brand-dark" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
            <option value="pizza">Pizza</option>
            <option value="fritti">Fritti</option>
            <option value="bevande">Bevande</option>
          </select>

          <div className="flex gap-2">
            <input type="text" placeholder="Nome IT" className="input-field py-2 flex-1" value={formData.name_it || ''} onChange={e => setFormData({...formData, name_it: e.target.value})} />
            <input type="text" placeholder="Nome AR" className="input-field py-2 flex-1 text-right" value={formData.name_ar || ''} onChange={e => setFormData({...formData, name_ar: e.target.value})} />
          </div>
          
          {formData.category === 'pizza' ? (
            <div className="flex gap-2">
              <input type="number" placeholder="Prezzo Tonda" className="input-field py-2 flex-1" value={formData.base_price_tonda || ''} onChange={e => setFormData({...formData, base_price_tonda: parseFloat(e.target.value)})} />
              <input type="number" placeholder="Prezzo Teglia" className="input-field py-2 flex-1" value={formData.base_price_teglia || ''} onChange={e => setFormData({...formData, base_price_teglia: parseFloat(e.target.value)})} />
            </div>
          ) : (
            <input type="number" placeholder="Prezzo" className="input-field py-2 w-full" value={formData.price || ''} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} />
          )}

          <div className="flex justify-end gap-2 mt-2">
            <button onClick={() => setEditingId(null)} className="btn-ghost py-2">Annulla</button>
            <button onClick={handleSave} className="btn-primary py-2 px-6 flex items-center gap-2"><Save size={16} /> Salva</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {allItems.map(item => (
          <div key={item.id} className="card p-3 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase bg-white/10 px-1.5 py-0.5 rounded text-white/50">{item.category}</span>
                <p className="font-medium text-white">{item.name_it}</p>
              </div>
              <p className="text-xs text-brand-gold mt-1">
                {item.category === 'pizza' ? `Tonda: €${item.base_price_tonda?.toFixed(2)} | Teglia: €${item.base_price_teglia?.toFixed(2)}` : `€${item.price?.toFixed(2)}`}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => startEdit(item)} className="p-2 text-white/50 hover:bg-white/10 rounded"><Edit2 size={16} /></button>
              <button onClick={() => handleDelete(item.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
