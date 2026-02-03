
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ShoppingItem } from './types';
import Header from './components/Header';
import ItemRow from './components/ItemRow';
import AddItemForm from './components/AddItemForm';

const STORAGE_KEY = 'superlist_offline_data_v2';

const DEFAULT_ITEMS: string[] = [
  "Arroz", "Atun", "Sardinas", "Chile en lata", "Azucar", "Frijol", "Garbanzos", "Frijo molido", "Sal", "Sopa",
  "Condimentos", "Mantequilla", "Arina", "Aceite", "Galleas sodas", "Galletas dulce", "Avena", "Masa", "Espaguetti", "Shop suy",
  "Caracolitos", "Salsa de tomate", "Salsa naturas", "Mayonesa", "Mostaza miel", "Chipotle", "Salsa Lizano", "Vinagre", "Crema dulce", "Sirope",
  "Té mansanilla", "Café instantaneo", "Leche delactomi", "Leche en polvo", "Leche evaporada", "Leche condensada", "Panqueque", "Gelatina", "Flan", "Confites",
  "Chocolates", "Miel de aveja", "Miel de maple", "Papel higenico", "Pasta de dientes", "Pasta de dientes Ale", "Hilo dental", "Enjuague bucal", "Cepillo de dientes",
  "Jabon en barra manos", "Jabon liquido manos", "Champu ale", "Champu papi", "Desodorante mami", "Desodorante papi", "Desodorante ale", "Tuallas sanitarias", "Rasuradora", "Pastillas",
  "Alcohol", "Crema de manos", "Crema de cuerpo", "Crema de cara", "Talcos", "Aceite de manos", "Jabon azul", "Cloro", "Detergente lavadora", "Bolsas basura pequeña",
  "Bolsas basura medio", "Bolsas basura grande", "Latas para gatos", "Jabón de platos", "Saniador", "Pala basura", "Escoba", "Palo de escoba", "Desinfectante", "Esponja platos",
  "Lysol liquido", "Lysol Aerosol", "Lusol toalla", "Paños", "Limpiador de vodrios", "Suavizante", "Insecticida", "Yogurt liquido", "Yogurt griego", "Mantequilla fria",
  "Natilla", "Helado", "Queso zarcero", "Queso rayado", "Queso crema", "Dip", "Jugos", "Servilleta", "Toallas cocina", "Toallas reusables",
  "Bolsas emparedados", "Bolsa ziploc", "Papel aluminio", "Rollo pLástico", "Platanitos", "Mani", "Papas fritas", "Coca cola", "Gaseosa 1", "Gaseosa 2",
  "Aloe liquido", "Cerveza", "Pate", "Salchichas", "Tocineta", "Pechuga", "Trocitos", "Muslo entero", "Carne molida", "Baterias AA", "Baterias AAA", "Fosforos", "Tomate", "Papas"
];

const App: React.FC = () => {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        console.error("Error parsing saved data", e);
      }
    } else {
      const initialItems: ShoppingItem[] = DEFAULT_ITEMS.map((name, index) => ({
        id: `default-${index}-${Date.now()}`,
        name,
        bought: false,
        quantity: 1,
        unitPrice: 0,
      }));
      setItems(initialItems);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, isLoaded]);

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

  const clearBought = useCallback(() => {
    if (window.confirm('¿Eliminar todos los artículos comprados de la lista?')) {
      setItems(prev => prev.filter(item => !item.bought));
    }
  }, []);

  const uncheckAll = useCallback(() => {
    if (window.confirm('¿Desmarcar todos los artículos para una nueva compra?')) {
      setItems(prev => prev.map(item => ({ ...item, bought: false })));
    }
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

  const handleShare = useCallback(async () => {
    if (boughtItems.length === 0) {
      alert("No hay artículos marcados como comprados para compartir.");
      return;
    }

    const dateStr = new Date().toLocaleDateString('es-CR');
    let content = `🛒 *MI COMPRA - ${dateStr}*\n`;
    content += "----------------------------------------\n";

    boughtItems.forEach((item, index) => {
      const subtotal = item.quantity * item.unitPrice;
      content += `✅ *${item.name}*\n`;
      content += `   Cant: ${item.quantity} x ₡${item.unitPrice.toLocaleString('es-CR')}\n`;
      content += `   Subtotal: ₡${subtotal.toLocaleString('es-CR')}\n`;
    });

    content += "----------------------------------------\n";
    content += `💰 *TOTAL: ₡${totalCost.toLocaleString('es-CR', { minimumFractionDigits: 2 })}*\n`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Resumen de Compra',
          text: content
        });
      } catch (err) {
        console.error("Error al compartir", err);
      }
    } else {
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Compra_${dateStr}.txt`;
      link.click();
    }
  }, [boughtItems, totalCost]);

  return (
    <div className="min-h-screen flex flex-col max-w-2xl mx-auto pb-56">
      <Header 
        total={totalCost} 
        totalItems={items.length} 
        boughtCount={boughtItems.length} 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
      
      <main className="flex-1 p-4 space-y-4">
        <AddItemForm onAdd={addItem} />

        {/* Acciones Rápidas */}
        <div className="flex gap-2 mb-2">
           <button 
            onClick={uncheckAll}
            className="flex-1 text-[11px] font-bold uppercase tracking-wider bg-white border border-slate-200 text-slate-500 py-3 rounded-xl active:bg-slate-100 transition-colors shadow-sm"
          >
            Limpiar Checks
          </button>
          {boughtItems.length > 0 && (
            <button 
              onClick={clearBought}
              className="flex-1 text-[11px] font-bold uppercase tracking-wider bg-rose-50 border border-rose-100 text-rose-600 py-3 rounded-xl active:bg-rose-100 transition-colors shadow-sm"
            >
              Borrar Comprados
            </button>
          )}
        </div>

        <div className="space-y-3">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="bg-slate-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <p className="text-slate-500 font-medium">
                {searchTerm ? 'No se encontraron resultados' : 'Tu lista está vacía'}
              </p>
            </div>
          ) : (
            filteredItems.map((item, index) => (
              <ItemRow 
                key={item.id} 
                item={item} 
                index={index}
                onUpdate={updateUpdate => updateItem(item.id, updateUpdate)}
                onRemove={() => removeItem(item.id)}
              />
            ))
          )}
        </div>
      </main>

      {/* Footer Fijo con Share */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-lg border-t border-slate-200 shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.1)] flex flex-col gap-2 z-50 rounded-t-[2.5rem]">
        <div className="max-w-md mx-auto w-full">
          <button 
            onClick={handleShare}
            disabled={boughtItems.length === 0}
            className={`w-full font-black py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-3 active:scale-95 text-lg ${boughtItems.length > 0 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            COMPARTIR RESUMEN
          </button>
          <p className="text-center text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">
            {boughtItems.length} artículos seleccionados
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;
