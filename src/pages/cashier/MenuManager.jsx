import { useState } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, deleteDoc, doc, updateDoc, setDoc } from 'firebase/firestore';
import { useMenu } from '../../hooks/useMenu';
import { useTables } from '../../hooks/useTables';
import { Trash2, Plus, Edit2, Save, X, QrCode } from 'lucide-react';

// ─── Confirm Modal (replaces browser confirm()) ───────────────────────────────
function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}>
      <div className="bg-card w-full max-w-sm rounded-2xl border border-border shadow-2xl p-6 space-y-5 animate-fade-in">
        <div className="text-center">
          <div className="text-4xl mb-3">⚠️</div>
          <h3 className="font-bold text-foreground text-lg">Conferma eliminazione</h3>
          <p className="text-sm opacity-60 mt-2">{message}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="btn-ghost flex-1 py-2">Annulla</button>
          <button onClick={onConfirm}
            className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors">
            Elimina
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── QR Code Modal ────────────────────────────────────────────────────────────
function QRModal({ table, onClose }) {
  const baseUrl = window.location.origin;
  const tableUrl = `${baseUrl}/table/${table.id}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(tableUrl)}&size=250x250&bgcolor=ffffff&color=1A1A2E&margin=2`;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}>
      <div className="bg-card w-full max-w-xs rounded-2xl border border-border shadow-2xl p-6 space-y-5 animate-fade-in text-center">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-foreground">QR — Tavolo {table.table_number}</h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-black/10 dark:hover:bg-white/10">
            <X size={18} className="opacity-50" />
          </button>
        </div>
        <div className="bg-white rounded-2xl p-4 flex items-center justify-center">
          <img src={qrUrl} alt={`QR Tavolo ${table.table_number}`} width={220} height={220} />
        </div>
        <p className="text-xs opacity-40 break-all font-mono">{tableUrl}</p>
        <a href={qrUrl} download={`qr_tavolo_${table.table_number}.png`}
          className="btn-primary w-full flex items-center justify-center gap-2 text-sm">
          ⬇️ Scarica QR Code
        </a>
      </div>
    </div>
  );
}

export function MenuManager() {
  const { pizzas, kebab, fritti, bevande, ingredients, loading: menuLoading } = useMenu();
  const { tables, loading: tablesLoading } = useTables();
  const [activeSection, setActiveSection] = useState('tables');

  if (menuLoading || tablesLoading) return <div className="opacity-40 text-center py-8">Caricamento in corso...</div>;

  const sections = [
    { id: 'tables',     label: '🪑 Tavoli' },
    { id: 'ingredients',label: '🧀 Ingredienti' },
    { id: 'menu_items', label: '🍕 Prodotti' }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex gap-2 border-b border-border pb-2 overflow-x-auto scrollbar-none">
        {sections.map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeSection === s.id ? 'bg-brand-red text-white' : 'text-foreground opacity-50 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10'}`}>
            {s.label}
          </button>
        ))}
      </div>

      {activeSection === 'tables'      && <TableManager tables={tables} />}
      {activeSection === 'ingredients' && <IngredientManager ingredients={ingredients} />}
      {activeSection === 'menu_items'  && <MenuItemManager pizzas={pizzas} fritti={fritti} bevande={bevande} kebab={kebab} />}
    </div>
  );
}

// ─── Table Manager ────────────────────────────────────────────────────────────
function TableManager({ tables }) {
  const [newNum, setNewNum]     = useState('');
  const [newSeats, setNewSeats] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null); // table to delete
  const [qrTable, setQrTable]   = useState(null);

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

  async function handleDelete(table) {
    await deleteDoc(doc(db, 'tables', table.id));
    setConfirmDelete(null);
  }

  return (
    <div className="space-y-4">
      {/* Add table form */}
      <div className="card p-4 flex gap-2 items-end flex-wrap sm:flex-nowrap">
        <div className="flex-1 w-full sm:w-auto">
          <label className="text-xs opacity-50 block mb-1">Numero Tavolo</label>
          <input type="number" value={newNum} onChange={e => setNewNum(e.target.value)} className="input-field py-2" placeholder="Es. 10" />
        </div>
        <div className="flex-1 w-full sm:w-auto">
          <label className="text-xs opacity-50 block mb-1">Posti</label>
          <input type="number" value={newSeats} onChange={e => setNewSeats(e.target.value)} className="input-field py-2" placeholder="Es. 4" />
        </div>
        <button onClick={handleAdd} disabled={submitting} className="btn-primary py-2 px-4 flex items-center justify-center gap-1 w-full sm:w-auto">
          <Plus size={16} /> Aggiungi
        </button>
      </div>

      {/* Tables grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {tables.map(t => (
          <div key={t.id} className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="font-bold text-foreground text-2xl">#{t.table_number}</p>
              <button onClick={() => setQrTable(t)} title="QR Code"
                className="p-1.5 opacity-50 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors">
                <QrCode size={16} />
              </button>
            </div>
            <p className="text-xs opacity-50">{t.seats} posti</p>
            <button onClick={() => setConfirmDelete(t)}
              className="mt-3 w-full text-xs text-red-500 dark:text-red-400 hover:bg-red-500/10 rounded-lg py-1 transition-colors flex items-center justify-center gap-1">
              <Trash2 size={12} /> Elimina
            </button>
          </div>
        ))}
      </div>

      {confirmDelete && (
        <ConfirmModal
          message={`Eliminare il Tavolo ${confirmDelete.table_number}?`}
          onConfirm={() => handleDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
      {qrTable && <QRModal table={qrTable} onClose={() => setQrTable(null)} />}
    </div>
  );
}

// ─── Ingredient Manager ───────────────────────────────────────────────────────
const ING_CATEGORIES = [
  { id: 'sauce_cheese', label: 'Salse e Formaggi 🧀' },
  { id: 'meat',         label: 'Carni 🥩' },
  { id: 'vegetable',    label: 'Verdure 🥦' },
  { id: 'other',        label: 'Altro ✨' },
];

function IngredientManager({ ingredients }) {
  const [editingId, setEditingId]   = useState(null);
  const [formData, setFormData]     = useState({});
  const [confirmDelete, setConfirmDelete] = useState(null);
  const ingList = Object.values(ingredients);

  function startEdit(ing) { setEditingId(ing.id); setFormData(ing); }
  function startNew()  {
    setEditingId('new');
    setFormData({ id: '', name_it: '', name_ar: '', category: 'sauce_cheese', price_tonda: 0, price_teglia: 0, is_available: true });
  }

  async function handleSave() {
    if (editingId === 'new') {
      const { id: newId, ...rest } = formData;
      if (!newId) return alert("Inserisci un ID per l'ingrediente (es. cipolla)");
      await setDoc(doc(db, 'ingredients', newId), { ...rest, id: newId });
    } else {
      const { id, ...updateData } = formData;
      await updateDoc(doc(db, 'ingredients', editingId), updateData);
    }
    setEditingId(null);
  }

  async function handleDelete(ing) {
    await deleteDoc(doc(db, 'ingredients', ing.id));
    setConfirmDelete(null);
  }

  return (
    <div className="space-y-4">
      <button onClick={startNew} className="btn-ghost flex items-center gap-2"><Plus size={16} /> Nuovo Ingrediente</button>

      {editingId && (
        <div className="card p-4 border border-brand-red space-y-3">
          <h3 className="font-bold text-foreground">{editingId === 'new' ? 'Nuovo Ingrediente' : 'Modifica Ingrediente'}</h3>
          {editingId === 'new' && (
            <input type="text" placeholder="ID (es. cipolla)" className="input-field py-2"
              value={formData.id || ''} onChange={e => setFormData({...formData, id: e.target.value})} />
          )}
          {/* Category selector */}
          <select className="input-field py-2 w-full bg-background"
            value={formData.category || 'sauce_cheese'}
            onChange={e => setFormData({...formData, category: e.target.value})}>
            {ING_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
          <div className="flex flex-col sm:flex-row gap-2">
            <input type="text" placeholder="Nome IT" className="input-field py-2 flex-1"
              value={formData.name_it || ''} onChange={e => setFormData({...formData, name_it: e.target.value})} />
            <input type="text" placeholder="Nome AR" className="input-field py-2 flex-1 sm:text-right"
              value={formData.name_ar || ''} onChange={e => setFormData({...formData, name_ar: e.target.value})} />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <input type="number" step="0.5" placeholder="Prezzo Tonda €" className="input-field py-2 flex-1"
              value={formData.price_tonda || ''} onChange={e => setFormData({...formData, price_tonda: parseFloat(e.target.value)})} />
            <input type="number" step="0.5" placeholder="Prezzo Teglia €" className="input-field py-2 flex-1"
              value={formData.price_teglia || ''} onChange={e => setFormData({...formData, price_teglia: parseFloat(e.target.value)})} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={formData.is_available !== false}
              onChange={e => setFormData({...formData, is_available: e.target.checked})}
              className="w-4 h-4 rounded accent-brand-red" />
            <span className="text-sm opacity-70">Disponibile</span>
          </label>
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
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded opacity-60 font-bold">
                  {ING_CATEGORIES.find(c => c.id === ing.category)?.label?.split(' ')[0] || ing.category}
                </span>
                <p className="font-medium text-foreground">{ing.name_it} <span className="text-xs opacity-50">{ing.name_ar}</span></p>
                {!ing.is_available && <span className="text-[10px] bg-red-500/20 text-red-500 dark:text-red-400 px-1.5 py-0.5 rounded font-bold">ESAURITO</span>}
              </div>
              <p className="text-xs text-brand-gold mt-0.5">Tonda: €{ing.price_tonda?.toFixed(2)} | Teglia: €{ing.price_teglia?.toFixed(2)}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => startEdit(ing)} className="p-2 opacity-50 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 rounded"><Edit2 size={16} /></button>
              <button onClick={() => setConfirmDelete(ing)} className="p-2 text-red-500 dark:text-red-400 hover:bg-red-500/10 rounded"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>

      {confirmDelete && (
        <ConfirmModal
          message={`Eliminare l'ingrediente "${confirmDelete.name_it}"?`}
          onConfirm={() => handleDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}

// ─── Menu Item Manager ────────────────────────────────────────────────────────
function MenuItemManager({ pizzas, fritti, bevande, kebab }) {
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData]   = useState({});
  const [confirmDelete, setConfirmDelete] = useState(null);
  const kebabList = kebab ? [kebab] : [];
  const allItems = [...pizzas, ...kebabList, ...fritti, ...bevande];

  function startEdit(item) { setEditingId(item.id); setFormData(item); }
  function startNew() {
    setEditingId('new');
    setFormData({ category: 'pizza', name_it: '', name_ar: '', price: 0, base_price_tonda: 0, base_price_teglia: 0, is_available: true, sort_order: 0 });
  }

  async function handleSave() {
    if (editingId === 'new') {
      const catItems = allItems.filter(i => i.category === formData.category);
      const maxSort  = catItems.reduce((m, i) => Math.max(m, i.sort_order || 0), 0);
      await addDoc(collection(db, 'menu_items'), {
        ...formData,
        sort_order:   maxSort + 1,
        is_available: formData.is_available !== false,
        category:     formData.category || 'pizza',
      });
    } else {
      const { id, ...updateData } = formData;
      await updateDoc(doc(db, 'menu_items', editingId), updateData);
    }
    setEditingId(null);
  }

  async function handleDelete(item) {
    await deleteDoc(doc(db, 'menu_items', item.id));
    setConfirmDelete(null);
  }

  return (
    <div className="space-y-4">
      <button onClick={startNew} className="btn-ghost flex items-center gap-2"><Plus size={16} /> Nuovo Prodotto</button>

      {editingId && (
        <div className="card p-4 border border-brand-red space-y-3">
          <h3 className="font-bold text-foreground">{editingId === 'new' ? 'Nuovo Prodotto' : 'Modifica Prodotto'}</h3>

          <select className="input-field py-2 w-full bg-background"
            value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
            <option value="pizza">🍕 Pizza</option>
            <option value="kebab">🥙 Kebab</option>
            <option value="fritti">🍟 Fritti</option>
            <option value="bevande">🥤 Bevande</option>
          </select>

          <div className="flex flex-col sm:flex-row gap-2">
            <input type="text" placeholder="Nome IT" className="input-field py-2 flex-1"
              value={formData.name_it || ''} onChange={e => setFormData({...formData, name_it: e.target.value})} />
            <input type="text" placeholder="Nome AR" className="input-field py-2 flex-1 sm:text-right"
              value={formData.name_ar || ''} onChange={e => setFormData({...formData, name_ar: e.target.value})} />
          </div>

          {formData.category === 'pizza' ? (
            <div className="flex flex-col sm:flex-row gap-2">
              <input type="number" step="0.5" placeholder="Prezzo Tonda €" className="input-field py-2 flex-1"
                value={formData.base_price_tonda || ''} onChange={e => setFormData({...formData, base_price_tonda: parseFloat(e.target.value)})} />
              <input type="number" step="0.5" placeholder="Prezzo Teglia €" className="input-field py-2 flex-1"
                value={formData.base_price_teglia || ''} onChange={e => setFormData({...formData, base_price_teglia: parseFloat(e.target.value)})} />
            </div>
          ) : (
            <input type="number" step="0.5" placeholder="Prezzo €" className="input-field py-2 w-full"
              value={formData.price || ''} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} />
          )}

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={formData.is_available !== false}
              onChange={e => setFormData({...formData, is_available: e.target.checked})}
              className="w-4 h-4 rounded accent-brand-red" />
            <span className="text-sm opacity-70">Disponibile</span>
          </label>

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
                <span className="text-[10px] uppercase bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded opacity-60 font-bold">{item.category}</span>
                <p className="font-medium text-foreground">{item.name_it}</p>
                {!item.is_available && <span className="text-[10px] bg-red-500/20 text-red-500 dark:text-red-400 px-1.5 py-0.5 rounded font-bold">ESAURITO</span>}
              </div>
              <p className="text-xs text-brand-gold mt-1">
                {item.category === 'pizza'
                  ? `Tonda: €${item.base_price_tonda?.toFixed(2)} | Teglia: €${item.base_price_teglia?.toFixed(2)}`
                  : `€${item.price?.toFixed(2)}`}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => startEdit(item)} className="p-2 opacity-50 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 rounded"><Edit2 size={16} /></button>
              <button onClick={() => setConfirmDelete(item)} className="p-2 text-red-500 dark:text-red-400 hover:bg-red-500/10 rounded"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>

      {confirmDelete && (
        <ConfirmModal
          message={`Eliminare il prodotto "${confirmDelete.name_it}"?`}
          onConfirm={() => handleDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
