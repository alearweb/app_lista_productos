
import React from 'react';
import { ShoppingItem } from '../types';

interface ItemRowProps {
  item: ShoppingItem;
  index: number;
  onUpdate: (updates: Partial<ShoppingItem>) => void;
  onRemove: () => void;
}

const ItemRow: React.FC<ItemRowProps> = ({ item, index, onUpdate, onRemove }) => {
  const subtotal = item.quantity * item.unitPrice;
  const isIntercalated = index % 2 === 0;

  const handleNumericChange = (field: 'quantity' | 'unitPrice', value: string) => {
    const numValue = parseFloat(value);
    onUpdate({ [field]: isNaN(numValue) ? 0 : numValue });
  };

  return (
    <div className={`
      rounded-2xl shadow-sm border p-4 transition-all duration-300
      ${item.bought 
        ? 'opacity-80 bg-indigo-50/30 border-indigo-500 border-2 scale-[0.98]' 
        : `border-slate-200 hover:border-indigo-200 ${isIntercalated ? 'bg-emerald-50/60' : 'bg-white'}`}
    `}>
      <div className="flex items-center gap-4 mb-3">
        <label className="relative flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            className="sr-only peer"
            checked={item.bought}
            onChange={(e) => onUpdate({ bought: e.target.checked })}
          />
          <div className="w-7 h-7 bg-slate-100 border-2 border-slate-300 rounded-lg peer-checked:bg-indigo-500 peer-checked:border-indigo-500 flex items-center justify-center transition-all">
            <svg 
              className={`w-5 h-5 text-white transform transition-transform ${item.bought ? 'scale-100' : 'scale-0'}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </label>

        <input 
          type="text"
          className={`flex-1 font-bold text-lg bg-transparent border-none focus:ring-0 p-0 ${item.bought ? 'line-through text-slate-400' : 'text-slate-700'}`}
          value={item.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder="Nombre del artículo"
        />

        <button 
          onClick={onRemove}
          className="text-slate-300 hover:text-rose-500 transition-colors p-1"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Cant.</label>
          <div className="relative">
            <input 
              type="number"
              inputMode="decimal"
              step="any"
              className="w-full bg-white/60 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              value={item.quantity === 0 ? '' : item.quantity}
              onChange={(e) => handleNumericChange('quantity', e.target.value)}
              placeholder="0"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Precio Unit.</label>
          <div className="relative">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₡</span>
            <input 
              type="number"
              inputMode="decimal"
              step="any"
              className="w-full bg-white/60 border border-slate-200 rounded-xl pl-5 pr-2 py-2 text-sm font-semibold focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              value={item.unitPrice === 0 ? '' : item.unitPrice}
              onChange={(e) => handleNumericChange('unitPrice', e.target.value)}
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Subtotal</label>
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-2 text-sm font-black text-indigo-600 flex items-center justify-end h-[38px]">
            ₡{subtotal.toLocaleString('es-CR', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemRow;
