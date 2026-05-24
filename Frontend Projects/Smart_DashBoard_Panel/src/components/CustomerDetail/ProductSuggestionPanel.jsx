import React, { useState } from 'react';
import { useProductContext } from '../../context/ProductContext';
import { calculateChainedPrices } from '../../utils/pricingUtils';

const ProductSuggestionPanel = ({ onAddProduct }) => {
  const { products } = useProductContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const categories = ["All", ...new Set(products.map(p => p.category).filter(Boolean))];

  const filteredProducts = products.filter(p => {
    if (!p.inStock) return false;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "All" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-full h-full flex flex-col bg-slate-50/50 dark:bg-[#0a0c14]/50 border-l border-slate-200 dark:border-slate-800">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-3">Product Catalogue</h3>
        <div className="flex flex-col gap-2">
          <input 
            type="text" 
            placeholder="Search products..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-white"
          />
          <select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-white"
          >
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {filteredProducts.map(product => {
          const pricing = calculateChainedPrices(
            product.mrp, product.retailerDivisor, product.dbDivisor, product.ssDivisor, product.scheme?.buy, product.scheme?.free
          );

          const isSchemeActive = () => {
            if (!product.scheme || product.scheme.free === 0) return false;
            if (!product.schemeEndDate) return true;
            return new Date(product.schemeEndDate) >= new Date();
          };

          const activeScheme = isSchemeActive();

          return (
            <div key={product.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 flex flex-col gap-2 hover:border-blue-300 dark:hover:border-blue-500 transition-colors group relative overflow-hidden">
              <div className="flex gap-3">
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-900 rounded-lg overflow-hidden shrink-0">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl">📦</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-slate-800 dark:text-white truncate">{product.name}</h4>
                  <p className="text-[10px] text-slate-500">{product.sku}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-1 bg-slate-50 dark:bg-slate-900 rounded-lg p-2 text-[10px] mt-1">
                <div className="flex flex-col"><span className="text-slate-400">MRP</span><span className="font-bold dark:text-slate-300">₹{pricing.mrp.toFixed(2)}</span></div>
                <div className="flex flex-col"><span className="text-emerald-500 font-bold">Retailer</span><span className="font-bold dark:text-slate-300">₹{pricing.retailerCost.toFixed(2)}</span></div>
                <div className="flex flex-col"><span className="text-blue-500 font-bold">DB</span><span className="font-bold dark:text-slate-300">₹{pricing.dbCost.toFixed(2)}</span></div>
                <div className="flex flex-col"><span className="text-purple-500 font-bold">SS</span><span className="font-bold dark:text-slate-300">₹{pricing.ssCost.toFixed(2)}</span></div>
              </div>

              {activeScheme && (
                 <div className="bg-pink-100 dark:bg-pink-500/20 text-pink-600 dark:text-pink-400 text-[9px] font-bold px-2 py-1 rounded inline-block w-fit">
                    🎁 {product.scheme.buy}+{product.scheme.free} {product.schemeLabel}
                 </div>
              )}

              <button 
                onClick={() => onAddProduct(product, pricing)}
                className="mt-2 w-full py-1.5 bg-slate-100 hover:bg-blue-600 hover:text-white dark:bg-slate-700 dark:hover:bg-blue-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold transition-colors"
              >
                + Add to Order
              </button>
            </div>
          );
        })}
        {filteredProducts.length === 0 && (
          <p className="text-center text-sm text-slate-500 mt-4">No products found.</p>
        )}
      </div>
    </div>
  );
};

export default ProductSuggestionPanel;
