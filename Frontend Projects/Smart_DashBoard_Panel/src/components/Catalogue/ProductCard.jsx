import React from 'react';
import { calculateChainedPrices } from '../../utils/pricingUtils';

const ProductCard = ({ product, onEdit, onDelete, hideEdit }) => {
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
    product.scheme?.free
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

  return (
    <div className="glass-panel p-4 rounded-2xl border border-slate-200/50 dark:border-white/10 hover:shadow-xl transition-all flex flex-col h-full relative group bg-white/40 dark:bg-slate-900/40">
      
      {!hideEdit && (
        <div className="absolute top-2 right-2 flex gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => onEdit(product)}
            className="p-1.5 bg-white/80 dark:bg-slate-800/80 rounded-full shadow hover:bg-purple-100 dark:hover:bg-purple-900/50 hover:text-purple-600 transition-colors text-sm"
          >
            ✏️
          </button>
          <button 
            onClick={() => onDelete && onDelete(product.id)}
            className="p-1.5 bg-white/80 dark:bg-slate-800/80 rounded-full shadow hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-600 transition-colors text-sm"
          >
            🗑️
          </button>
        </div>
      )}

      {/* Image & Badges */}
      <div className="relative w-full h-40 rounded-xl overflow-hidden mb-4 bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200/50 dark:border-white/5">
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl text-slate-300">📦</div>
        )}
        
        {/* Out of Stock Badge */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center backdrop-blur-[2px]">
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">OUT OF STOCK</span>
          </div>
        )}

        {/* Scheme Badge */}
        {active && (
          <div className="absolute bottom-2 left-2 right-2">
             <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-lg flex justify-between items-center backdrop-blur-md">
                <span>🎁 {product.scheme.buy}+{product.scheme.free} {product.schemeLabel}</span>
                {getExpiryWarning()}
             </div>
          </div>
        )}
      </div>

      {/* Header Info */}
      <div className="flex-1">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-bold text-slate-800 dark:text-white text-base leading-tight truncate pr-4">{product.name}</h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 font-medium uppercase tracking-wider">{product.sku} • {product.category}</p>
        
        {/* Pricing Table */}
        <div className="bg-slate-50/50 dark:bg-slate-950/30 rounded-xl border border-slate-200/50 dark:border-white/5 overflow-hidden">
          <div className="grid grid-cols-2 text-xs divide-x divide-y divide-slate-200/50 dark:divide-white/5">
            {/* MRP */}
            <div className="p-2 flex flex-col col-span-2 bg-slate-100/50 dark:bg-slate-800/50">
              <span className="text-slate-500 font-medium">MRP</span>
              <span className="font-bold text-lg text-slate-800 dark:text-white">₹{mrp.toFixed(2)}</span>
            </div>
            
            {/* Retailer */}
            <div className="p-2 flex flex-col">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Retailer</span>
                <span className="text-[9px] text-emerald-600 bg-emerald-100 dark:bg-emerald-500/20 px-1 rounded font-bold">{retailerMarginPercent.toFixed(1)}%</span>
              </div>
              <span className="font-bold text-slate-800 dark:text-slate-200">₹{retailerCost.toFixed(2)}</span>
            </div>

            {/* DB */}
            <div className="p-2 flex flex-col">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Distributor</span>
                <span className="text-[9px] text-blue-600 bg-blue-100 dark:bg-blue-500/20 px-1 rounded font-bold">{dbMarginPercent.toFixed(1)}%</span>
              </div>
              <span className="font-bold text-slate-800 dark:text-slate-200">₹{dbCost.toFixed(2)}</span>
            </div>
            
            {/* SS */}
            <div className="p-2 flex flex-col col-span-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Super Stockist</span>
                <span className="text-[9px] text-purple-600 bg-purple-100 dark:bg-purple-500/20 px-1 rounded font-bold">{ssMarginPercent.toFixed(1)}%</span>
              </div>
              <span className="font-bold text-slate-800 dark:text-slate-200">₹{ssCost.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
