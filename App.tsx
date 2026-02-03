
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ShoppingItem } from './types.ts';
import Header from './components/Header.tsx';
import ItemRow from './components/ItemRow.tsx';
import AddItemForm from './components/AddItemForm.tsx';

const STORAGE_KEY = 'superlist_offline_data_v3';

const DEFAULT_ITEMS: string[] = [
  "Arroz", "Atun", "Frijol", "Sal", "Azucar", "Aceite", "Café", "Leche", "Pan", "Huevos"
];

const App: React.FC = () => {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    setIsStandalone(isPWA);

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        console.error("Error al cargar datos", e);
      }
    } else {
      const initialItems: ShoppingItem[] = DEFAULT_ITEMS.map((name, index) => ({
        id: `def-${index}-${Date.now()}`,
        name,
        bought: false,
        quantity: 1,
        unitPrice: 0,
      }));
      setItems(initialItems);
    }
    setIsLoaded(true);

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, isLoaded]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setDeferredPrompt(null);
    } else {
      alert("Instrucciones para Android:\n1. Toca los 3 puntos (⋮).\n2. Selecciona 'Instalar aplicación'.");
    }
  };

  const addItem = useCallback((name: string) => {
    const newItem: ShoppingItem = {
      id: Date.now().toString(),
      name,
      bought: false,
      quantity: 1,
      unitPrice: 0,
    };
    setItems(prev => [newItem, ...prev]);
    setSearchTerm('');
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<ShoppingItem>) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return items;
    const term = searchTerm.toLowerCase();
    return items.filter(item => item.name.toLowerCase().includes(term));
  }, [items, searchTerm]);

  const boughtItems = useMemo(() => items.filter(i => i.bought), [items]);
  const totalCost = useMemo(() => {
    return boughtItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  }, [boughtItems]);

  return (
    <div className="min-h-screen flex flex-col max-w-2xl mx-auto pb-40">
      <Header 
        total={totalCost} 
        totalItems={items.length} 
        boughtCount={boughtItems.length} 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
      
      <main className="p-4 space-y-4">
        {!isStandalone && (
          <div className="bg-indigo-600 text-white p-6 rounded-[2rem] shadow-lg mb-6">
            <h2 className="text-lg font-black mb-1 uppercase tracking-tight">📲 Instalar Aplicación</h2>
            <p className="text-xs font-bold opacity-90 mb-4">Para usarla sin internet y tener el icono en tu pantalla.</p>
            <button 
              onClick={handleInstallClick}
              className="w-full bg-white text-indigo-600 font-black py-3 rounded-xl shadow-md active:scale-95 transition-transform uppercase text-xs"
            >
              Instalar Ahora
            </button>
          </div>
        )}

        <AddItemForm onAdd={addItem} />

        <div className="space-y-3">
          {filteredItems.map((item, index) => (
            <ItemRow 
              key={item.id} 
              item={item} 
              index={index}
              onUpdate={updateUpdate => updateItem(item.id, updateUpdate)}
              onRemove={() => removeItem(item.id)}
            />
          ))}
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-slate-200 z-50 rounded-t-[2rem] safe-area-bottom shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <button 
          className={`w-full font-black py-4 rounded-2xl shadow-lg transition-all active:scale-95 ${boughtItems.length > 0 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'}`}
        >
          RESUMEN: ₡{totalCost.toLocaleString()}
        </button>
      </div>
    </div>
  );
};

export default App;
