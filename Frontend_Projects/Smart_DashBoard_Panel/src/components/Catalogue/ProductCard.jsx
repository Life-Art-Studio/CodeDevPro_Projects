import React from 'react';
import { calculateChainedPrices } from '../../utils/pricingUtils';
import { Edit2, Trash2, Package, Check } from 'lucide-react';

const ProductCard = ({ product, onEdit, onDelete, hideEdit, isSelected, onToggleSelect }) => {
  const {
    mrp,
    retailerCost,
    dbCost,
    ssCost,
    retailerMarginPercent,
    dbMarginPercent,
    ssMarginPercent
  } = calculateChainedPrices(
    product.mrp,
    product.retailerDivisor,
    product.dbDivisor,
    product.ssDivisor,
    product.scheme?.buy,
    product.scheme?.free,
    product.pricingMode,
    product.retailerMargin,
    product.dbMargin,
    product.ssMargin
  );

  const isSchemeActive = () => {
    if (!product.scheme || product.scheme.free === 0) return false;
    if (!product.schemeEndDate) return true;
    const endDate = new Date(product.schemeEndDate);
    const today = new Date();
    return endDate >= today;
  };

  const active = isSchemeActive();

  const getExpiryWarning = () => {
    if (!product.schemeEndDate) return null;
    const endDate = new Date(product.schemeEndDate);
    const today = new Date();
    const diffDays = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return <span className="text-red-500 text-[10px] font-bold">Expired</span>;
    if (diffDays <= 7) return <span className="text-amber-500 text-[10px] font-bold">Expires in {diffDays} days</span>;
    return null;
  };

  const renderSourceBadge = () => {
    const src = product.source || "manual";
    if (src === "ai") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20 shadow-sm">
          🤖 AI
        </span>
      );
    }
    if (src === "ai-edited") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/30 shadow-sm">
          ✏️ Edited
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 shadow-sm">
        👤 Custom
      </span>
    );
  };

  return (
    <div 
      onClick={() => {
        if (!hideEdit && onEdit && !onToggleSelect) onEdit(product);
        if (onToggleSelect) onToggleSelect(product.id);
      }}
      className={`bg-white dark:bg-[#1a1d27] p-4 rounded-2xl border ${isSelected ? 'border-indigo-500 shadow-md ring-2 ring-indigo-500/20' : 'border-zinc-200 dark:border-zinc-800 hover:border-indigo-200 dark:hover:border-indigo-500/30 hover:shadow-md'} transition-all flex flex-col h-full relative group shadow-sm ${!hideEdit || onToggleSelect ? 'cursor-pointer' : ''}`}
    >
      
      {!hideEdit && (
        <div className="absolute top-2 right-2 flex gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(product); }}
            className="p-2 bg-white dark:bg-zinc-800 rounded-full shadow hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center justify-center min-w-[36px] min-h-[36px]"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete && onDelete(product.id); }}
            className="p-2 bg-white dark:bg-zinc-800 rounded-full shadow hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-colors flex items-center justify-center min-w-[36px] min-h-[36px]"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
 
       {/* Image & Badges */}
       <div className="relative w-full h-40 rounded-xl overflow-hidden mb-4 bg-zinc-100 dark:bg-[#0f1117] shrink-0 border border-zinc-200 dark:border-zinc-800">
         
         {/* Selection Checkbox */}
         {onToggleSelect && (
           <div 
             className={`absolute top-2 left-2 z-20 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors shadow-sm ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white/80 dark:bg-black/50 border-zinc-300 dark:border-zinc-600 text-transparent hover:border-indigo-400'}`}
             onClick={(e) => {
               e.stopPropagation();
               onToggleSelect(product.id);
             }}
           >
             <Check className={`w-4 h-4 ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
           </div>
         )}
         {product.image ? (
           <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
         ) : (
           <div className="w-full h-full flex items-center justify-center text-zinc-300 dark:text-zinc-700">
             <Package className="w-12 h-12" />
           </div>
         )}
         
         {/* Out of Stock Badge */}
         {!product.inStock && (
           <div className="absolute inset-0 bg-zinc-900/50 flex items-center justify-center backdrop-blur-sm">
             <span className="bg-red-600 text-white px-3 py-1 rounded-md text-xs font-bold shadow-lg uppercase tracking-wider">Out of Stock</span>
           </div>
         )}
 
         {/* Scheme Badge */}
         {active && (
           <div className="absolute bottom-2 left-2 right-2">
              <div className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-1.5 rounded-md shadow-lg flex justify-between items-center">
                 <span>🎁 {product.scheme.buy}+{product.scheme.free} {product.schemeLabel}</span>
                 {getExpiryWarning()}
              </div>
           </div>
         )}
       </div>
 
       {/* Header Info */}
       <div className="flex-1">
         <div className="flex justify-between items-start mb-1 gap-2">
           <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-base leading-tight truncate">{product.name}</h3>
           <div className="shrink-0">{renderSourceBadge()}</div>
         </div>
         <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3 font-medium uppercase tracking-wider">{product.sku} • {product.category}</p>
        
        {/* Pricing Table */}
        <div className="bg-zinc-50 dark:bg-[#0f1117] rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <div className="grid grid-cols-2 text-xs divide-x divide-y divide-zinc-200 dark:divide-zinc-800">
            {/* MRP */}
            <div className="p-2.5 flex flex-col col-span-2 bg-white dark:bg-[#1a1d27]">
              <span className="text-zinc-500 dark:text-zinc-400 font-medium">MRP</span>
              <span className="font-bold text-lg text-zinc-900 dark:text-zinc-100">₹{mrp.toFixed(2)}</span>
            </div>
            
            {/* Retailer */}
            <div className="p-2.5 flex flex-col">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase font-bold">Retailer</span>
                <span className="text-[9px] text-emerald-700 bg-emerald-50 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 px-1 py-0.5 rounded font-bold">{retailerMarginPercent.toFixed(1)}%</span>
              </div>
              <span className="font-bold text-zinc-900 dark:text-zinc-100">₹{retailerCost.toFixed(2)}</span>
            </div>

            {/* DB */}
            <div className="p-2.5 flex flex-col">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase font-bold">Distributor</span>
                <span className="text-[9px] text-blue-700 bg-blue-50 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 px-1 py-0.5 rounded font-bold">{dbMarginPercent.toFixed(1)}%</span>
              </div>
              <span className="font-bold text-zinc-900 dark:text-zinc-100">₹{dbCost.toFixed(2)}</span>
            </div>
            
            {/* SS */}
            <div className="p-2.5 flex flex-col col-span-2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase font-bold">Super Stockist</span>
                <span className="text-[9px] text-indigo-700 bg-indigo-50 border border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20 px-1 py-0.5 rounded font-bold">{ssMarginPercent.toFixed(1)}%</span>
              </div>
              <span className="font-bold text-zinc-900 dark:text-zinc-100">₹{ssCost.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
