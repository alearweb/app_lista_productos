
import React, { useState, useEffect, useMemo } from 'react';
import { ShoppingItem } from './types.ts';
import Header from './components/Header.tsx';
import ItemRow from './components/ItemRow.tsx';
import AddItemForm from './components/AddItemForm.tsx';

// --- COMPONENTE PRINCIPAL: APP ---
const App: React.FC = () => {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fix: Initialize state from localStorage or use defaults on first load
  useEffect(() => {
    const saved = localStorage.getItem('superlist_data_v4');
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved data", e);
      }
    } else {
      setItems(["Arroz", "Frijoles", "Leche", "Huevos"].map((n, i) => ({
        id: String(Date.now() + i), 
        name: n, 
        bought: false, 
        quantity: 1, 
        unitPrice: 0 
      })));
    }
    setIsLoaded(true);

    // Fix: Basic PWA event listener for installation prompts
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  // Fix: Sync local state with localStorage for persistence
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('superlist_data_v4', JSON.stringify(items));
    }
  }, [items, isLoaded]);

  // Fix: Logical function to add items to the list
  const addItem = (name: string) => {
    if (!name.trim()) return;
    const newItem: ShoppingItem = { 
      id: String(Date.now()), 
      name, 
      bought: false, 
      quantity: 1, 
      unitPrice: 0 
    };
    setItems(prev => [newItem, ...prev]);
    setSearchTerm('');
  };

  // Fix: Memoized filtering to optimize performance
  const filteredItems = useMemo(() => 
    items.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase())), 
  [items, searchTerm]);

  // Fix: Calculate totals based on bought state
  const boughtItems = useMemo(() => items.filter(i => i.bought), [items]);
  const total = useMemo(() => boughtItems.reduce((s, i) => s + (i.quantity * i.unitPrice), 0), [boughtItems]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-2xl mx-auto pb-40">
      {/* Header component handling search and summary progress */}
      <Header 
        total={total} 
        totalItems={items.length} 
        boughtCount={boughtItems.length} 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm} 
      />
      
      <main className="p-4 space-y-4">
        {/* Modular form to add new items */}
        <AddItemForm onAdd={addItem} />

        {/* List display area */}
        <div className="space-y-3">
          {filteredItems.map((item, index) => (
            <ItemRow 
              key={item.id} 
              item={item} 
              index={index}
              onUpdate={(upd) => setItems(prev => prev.map(i => i.id === item.id ? {...i, ...upd} : i))}
              onRemove={() => setItems(prev => prev.filter(i => i.id !== item.id))}
            />
          ))}
          
          {/* Empty state messaging */}
          {filteredItems.length === 0 && (
            <div className="text-center py-16 px-4">
              <div className="text-5xl mb-4 opacity-20">🛒</div>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
                {searchTerm ? 'No hay resultados' : 'Lista vacía'}
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Persistent footer with purchase summary */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-lg border-t border-slate-200 z-50 rounded-t-[2.5rem] shadow-2xl max-w-2xl mx-auto">
        <button 
          onClick={() => alert("Resumen de compra:\nTotal: ₡" + total.toLocaleString('es-CR'))}
          className={`w-full font-black py-4 rounded-2xl shadow-lg transition-all active:scale-95 flex justify-between px-8 items-center ${boughtItems.length > 0 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'}`}
        >
          <span className="text-xs uppercase opacity-80 font-bold tracking-tight">Finalizar Compra</span>
          <span className="text-xl">₡{total.toLocaleString('es-CR')}</span>
        </button>
      </div>
    </div>
  );
};

export default App;
