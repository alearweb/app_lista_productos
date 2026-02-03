import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ShoppingItem } from './types.ts';

// --- COMPONENTE INTERNO: HEADER ---
const Header = ({ total, totalItems, boughtCount, searchTerm, setSearchTerm }: any) => {
  const percentage = totalItems > 0 ? Math.round((boughtCount / totalItems) * 100) : 0;
  return (
    <header className="sticky top-0 z-40 bg-indigo-600 text-white p-5 shadow-xl rounded-b-[2.5rem]">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className="text-xl font-black tracking-tighter leading-none">SUPERLIST</h1>
          <p className="text-indigo-200 text-[11px] font-bold uppercase mt-1 tracking-widest">{boughtCount} / {totalItems} LISTO</p>
        </div>
        <div className="text-right">
          <p className="text-indigo-200 text-[10px] font-bold uppercase opacity-80 mb-0">Total</p>
          <p className="text-2xl font-black leading-none">₡{total.toLocaleString('es-CR')}</p>
        </div>
      </div>
      <div className="relative mb-4">
        <input 
          type="text"
          className="w-full bg-white/10 border border-white/20 rounded-2xl pl-11 pr-4 py-3 text-sm placeholder-indigo-200 text-white focus:bg-white/20 outline-none"
          placeholder="Buscar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50">🔍</span>
      </div>
      <div className="w-full bg-indigo-900/40 rounded-full h-2 overflow-hidden">
        <div className="bg-emerald-400 h-full transition-all duration-700" style={{ width: `${percentage}%` }} />
      </div>
    </header>
  );
};

// --- COMPONENTE INTERNO: ITEM ROW ---
const ItemRow = ({ item, index, onUpdate, onRemove }: any) => {
  const subtotal = item.quantity * item.unitPrice;
  return (
    <div className={`rounded-3xl border-2 p-4 transition-all duration-300 ${item.bought ? 'bg-slate-100 border-indigo-200 opacity-60' : 'bg-white border-slate-100 shadow-sm'}`}>
      <div className="flex items-center gap-3 mb-3">
        <input 
          type="checkbox" 
          className="w-6 h-6 rounded-lg border-2 border-slate-300 text-indigo-600 focus:ring-0"
          checked={item.bought}
          onChange={(e) => onUpdate({ bought: e.target.checked })}
        />
        <input 
          type="text"
          className={`flex-1 font-bold text-slate-700 bg-transparent border-none focus:ring-0 p-0 ${item.bought ? 'line-through opacity-50' : ''}`}
          value={item.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
        />
        <button onClick={onRemove} className="text-rose-400 p-2">🗑️</button>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <p className="text-[9px] font-black text-slate-400 uppercase mb-1 ml-1">Cant.</p>
          <input 
            type="number" 
            className="w-full bg-slate-50 border-none rounded-xl p-2 text-sm font-bold text-slate-600 focus:bg-white"
            value={item.quantity === 0 ? '' : item.quantity} 
            onChange={(e) => onUpdate({ quantity: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div>
          <p className="text-[9px] font-black text-slate-400 uppercase mb-1 ml-1">Precio</p>
          <input 
            type="number" 
            className="w-full bg-slate-50 border-none rounded-xl p-2 text-sm font-bold text-slate-600 focus:bg-white"
            value={item.unitPrice === 0 ? '' : item.unitPrice} 
            onChange={(e) => onUpdate({ unitPrice: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div className="flex flex-col justify-end">
          <p className="text-[9px] font-black text-slate-400 uppercase mb-1 text-right mr-1">Subtotal</p>
          <div className="bg-indigo-50 rounded-xl p-2 text-xs font-black text-indigo-600 text-right">
            ₡{subtotal.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---
const App: React.FC = () => {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newItemName, setNewItemName] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('superlist_final_v1');
    if (saved) {
      try { setItems(JSON.parse(saved)); } catch (e) { console.error(e); }
    } else {
      setItems([{ id: '1', name: 'Leche', bought: false, quantity: 1, unitPrice: 0 }]);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) localStorage.setItem('superlist_final_v1', JSON.stringify(items));
  }, [items, isLoaded]);

  const addItem = () => {
    if (!newItemName.trim()) return;
    const newItem: ShoppingItem = { id: Date.now().toString(), name: newItemName, bought: false, quantity: 1, unitPrice: 0 };
    setItems([newItem, ...items]);
    setNewItemName('');
  };

  const filteredItems = items.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const boughtItems = items.filter(i => i.bought);
  const total = boughtItems.reduce((s, i) => s + (i.quantity * i.unitPrice), 0);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-2xl mx-auto pb-40">
      <Header total={total} totalItems={items.length} boughtCount={boughtItems.length} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      
      <main className="p-4 space-y-4">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Añadir artículo..." 
            className="w-full p-5 rounded-[2rem] border-2 border-slate-100 bg-white outline-none focus:border-indigo-400 text-lg font-bold shadow-lg shadow-slate-200/50 transition-all pr-16"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addItem()}
          />
          <button 
            onClick={addItem}
            className={`absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${newItemName.trim() ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-300'}`}
          >
            <span className="text-2xl font-bold">+</span>
          </button>
        </div>

        <div className="space-y-4">
          {filteredItems.map((item, index) => (
            <ItemRow 
              key={item.id} 
              item={item} 
              index={index}
              onUpdate={(upd: any) => setItems(items.map(i => i.id === item.id ? {...i, ...upd} : i))}
              onRemove={() => setItems(items.filter(i => i.id !== item.id))}
            />
          ))}
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-5 bg-white/80 backdrop-blur-xl border-t border-slate-100 z-50 rounded-t-[3rem] shadow-2xl max-w-2xl mx-auto">
        <button className="w-full bg-indigo-600 text-white font-black py-5 rounded-[2rem] shadow-xl flex justify-between px-10 items-center">
          <span className="text-[10px] uppercase tracking-widest opacity-80">RESUMEN</span>
          <span className="text-xl">₡{total.toLocaleString()}</span>
        </button>
      </div>
    </div>
  );
};

export default App;