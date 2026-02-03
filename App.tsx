
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
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallHelp, setShowInstallHelp] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isInIframe, setIsInIframe] = useState(false);

  useEffect(() => {
    const inIframe = window.self !== window.top;
    setIsInIframe(inIframe);

    const isPWA = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    setIsStandalone(isPWA);

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
      alert("Para instalar en Android:\n1. Toca los 3 puntos (⋮) de Chrome.\n2. Dale a 'Instalar aplicación'.");
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

  const clearBought = useCallback(() => {
    if (window.confirm('¿Eliminar artículos comprados?')) {
      setItems(prev => prev.filter(item => !item.bought));
    }
  }, []);

  const uncheckAll = useCallback(() => {
    if (window.confirm('¿Desmarcar todo para iniciar nueva compra?')) {
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
    const dateStr = new Date().toLocaleDateString('es-CR');
    let content = `🛒 *MI COMPRA - ${dateStr}*\n`;
    boughtItems.forEach((item) => {
      content += `✅ *${item.name}*: ₡${(item.quantity * item.unitPrice).toLocaleString('es-CR')}\n`;
    });
    content += `💰 *TOTAL: ₡${totalCost.toLocaleString('es-CR')}*`;

    if (navigator.share) {
      await navigator.share({ title: 'Compra', text: content });
    } else {
      alert("Copiado al portapapeles (Simulado)");
    }
  }, [boughtItems, totalCost]);

  return (
    <div className="min-h-screen flex flex-col max-w-2xl mx-auto bg-slate-50">
      <Header 
        total={totalCost} 
        totalItems={items.length} 
        boughtCount={boughtItems.length} 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
      
      <main className="flex-1 p-4 space-y-4 pb-48">
        {/* GUÍA DE SUPERVIVENCIA / INSTALACIÓN */}
        {!isStandalone && (
          <div className="bg-indigo-600 text-white p-6 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M17,1H7A2,2 0 0,0 5,3V21A2,2 0 0,0 7,23H17A2,2 0 0,0 19,21V3A2,2 0 0,0 17,1M17,19H7V5H17V19M16,13H13V16H11V13H8V11H11V8H13V11H16V13Z"/></svg>
            </div>
            
            <h2 className="text-xl font-black mb-2 uppercase tracking-tight">¿Cómo usar esta App?</h2>
            <p className="text-sm font-bold text-indigo-100 mb-4 leading-tight">Para tenerla fija en tu celular y que funcione sin internet:</p>
            
            <div className="space-y-3 relative z-10">
              <div className="flex items-start gap-3">
                <div className="bg-white text-indigo-600 w-6 h-6 rounded-full flex items-center justify-center font-black text-xs shrink-0 mt-0.5">1</div>
                <p className="text-xs font-bold">Abre este enlace directamente en el navegador <span className="underline">Chrome</span> de tu Android.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-white text-indigo-600 w-6 h-6 rounded-full flex items-center justify-center font-black text-xs shrink-0 mt-0.5">2</div>
                <p className="text-xs font-bold">Toca los <span className="bg-white/20 px-1.5 py-0.5 rounded">3 puntos (⋮)</span> arriba a la derecha en Chrome.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-white text-indigo-600 w-6 h-6 rounded-full flex items-center justify-center font-black text-xs shrink-0 mt-0.5">3</div>
                <p className="text-xs font-bold">Selecciona <span className="bg-emerald-400 text-emerald-950 px-2 py-0.5 rounded">Instalar aplicación</span>.</p>
              </div>
            </div>

            <button 
              onClick={handleInstallClick}
              className="mt-6 w-full bg-white text-indigo-600 font-black py-4 rounded-2xl shadow-lg active:scale-95 transition-transform uppercase text-sm tracking-widest"
            >
              Probar Instalación Ahora
            </button>
          </div>
        )}

        <AddItemForm onAdd={addItem} />

        <div className="flex gap-2">
           <button onClick={uncheckAll} className="flex-1 text-[11px] font-bold uppercase bg-white border border-slate-200 text-slate-500 py-3 rounded-xl shadow-sm">
            Reiniciar Lista
          </button>
          <button onClick={clearBought} className="flex-1 text-[11px] font-bold uppercase bg-rose-50 border border-rose-100 text-rose-600 py-3 rounded-xl shadow-sm">
            Borrar Comprados
          </button>
        </div>

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

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-slate-200 z-50 rounded-t-[2.5rem] safe-area-bottom">
        <div className="max-w-md mx-auto">
          <button 
            onClick={handleShare}
            disabled={boughtItems.length === 0}
            className={`w-full font-black py-4 rounded-2xl shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all ${boughtItems.length > 0 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'}`}
          >
            COMPARTIR COMPRA (₡{totalCost.toLocaleString()})
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
