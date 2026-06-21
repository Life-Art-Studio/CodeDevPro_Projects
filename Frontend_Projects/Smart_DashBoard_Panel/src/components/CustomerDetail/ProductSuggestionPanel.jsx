import React, { useState } from 'react';
import { useProductContext } from '../../context/ProductContext';
import { useSupplyChainContext } from '../../context/SupplyChainContext';
import { calculateChainedPrices } from '../../utils/pricingUtils';
import { Search, Package, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import CustomSelect from '../ui/CustomSelect';

const ProductSuggestionPanel = ({ onAddProduct, distributorId }) => {
  const { products } = useProductContext();
  const { inventoryLedger, distributors } = useSupplyChainContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [stockFilter, setStockFilter] = useState("All");

  const categories = ["All", ...new Set(products.map(p => p.category).filter(Boolean))];

  const getStockCount = (sku) => {
    if (!distributorId) return null;
    const entry = inventoryLedger.find(item => item.distributorId === distributorId && item.sku === sku);
    return entry ? entry.currentStock : 0;
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = (p.name || '').toLowerCase().includes((searchQuery || '').toLowerCase()) || (p.sku || '').toLowerCase().includes((searchQuery || '').toLowerCase());
    const matchesCategory = categoryFilter === "All" || p.category === categoryFilter;
    
    // Apply real-time distributor stock level filtering
    let matchesStock = true;
    if (distributorId) {
      const stock = getStockCount(p.sku);
      const entry = inventoryLedger.find(item => item.distributorId === distributorId && item.sku === p.sku);
      const reorder = entry ? entry.reorderLevel : 20;
      if (stockFilter === "In Stock Only") {
        matchesStock = stock > 0;
      } else if (stockFilter === "Low / Out of Stock") {
        matchesStock = stock <= reorder;
      }
    } else if (stockFilter === "In Stock Only") {
      matchesStock = p.inStock !== false;
    }
    
    return matchesSearch && matchesCategory && matchesStock;
  });

  return (
    <div className="w-full h-full flex flex-col bg-zinc-50/50 dark:bg-zinc-900/50">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-[#1a1d27] border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-zinc-100 min-h-[44px]"
            />
          </div>
          <div className={`grid ${distributorId ? 'grid-cols-2' : 'grid-cols-1'} gap-2`}>
            <div className="relative">
               <CustomSelect 
                 value={categoryFilter} 
                 onChange={setCategoryFilter}
                 className="w-full px-3 py-2 text-sm bg-white dark:bg-[#1a1d27] border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-zinc-100 min-h-[44px] flex items-center justify-between outline-none cursor-pointer"
                 options={categories.map(c => ({ value: c, label: c }))}
                 minWidth="100%"
               />
            </div>
            {distributorId && (
              <div className="relative">
                 <CustomSelect 
                   value={stockFilter} 
                   onChange={setStockFilter}
                   className="w-full px-3 py-2 text-sm bg-white dark:bg-[#1a1d27] border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-zinc-100 min-h-[44px] flex items-center justify-between outline-none cursor-pointer"
                   options={[
                     { value: "All", label: "All Stock" },
                     { value: "In Stock Only", label: "In Stock" },
                     { value: "Low / Out of Stock", label: "Low/Out" }
                   ]}
                   minWidth="100%"
                 />
              </div>
            )}
          </div>
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
            <div key={product.id} className="bg-white dark:bg-[#1a1d27] border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 flex flex-col gap-2 shadow-[0_1px_3px_rgba(0,0,0,0.06)] relative overflow-hidden group">
              <div className="flex gap-3">
                <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-6 h-6 text-zinc-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 truncate">{product.name}</h4>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] text-zinc-500 font-mono">{product.sku}</span>
                    {(() => {
                      if (!distributorId) {
                        return (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                            Direct Delivery
                          </span>
                        );
                      }
                      const entry = inventoryLedger.find(item => item.distributorId === distributorId && item.sku === product.sku);
                      const stock = entry ? entry.currentStock : 0;
                      const reorder = entry ? entry.reorderLevel : 20;

                      if (stock === 0) {
                        return (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold bg-red-100 dark:bg-red-500/15 text-red-600 dark:text-red-400 border border-red-200/30 dark:border-red-500/20">
                            ⚠️ Out of Stock
                          </span>
                        );
                      }
                      if (stock <= reorder) {
                        return (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-200/30 dark:border-amber-500/20">
                            ⚠️ Low Stock: {stock} units
                          </span>
                        );
                      }
                      return (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-200/30 dark:border-emerald-500/20">
                          ✓ Stock: {stock} units
                        </span>
                      );
                    })()}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-1 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-2 text-[10px] mt-1 tabular-nums">
                <div className="flex flex-col"><span className="text-zinc-400">MRP</span><span className="font-semibold text-zinc-600 dark:text-zinc-300">₹{pricing.mrp.toFixed(2)}</span></div>
                <div className="flex flex-col"><span className="text-emerald-600 dark:text-emerald-500 font-semibold">Retailer</span><span className="font-bold text-zinc-900 dark:text-zinc-100">₹{pricing.retailerCost.toFixed(2)}</span></div>
                <div className="flex flex-col"><span className="text-indigo-600 dark:text-indigo-400 font-semibold">DB</span><span className="font-bold text-zinc-900 dark:text-zinc-100">₹{pricing.dbCost.toFixed(2)}</span></div>
                <div className="flex flex-col"><span className="text-amber-600 dark:text-amber-500 font-semibold">SS</span><span className="font-bold text-zinc-900 dark:text-zinc-100">₹{pricing.ssCost.toFixed(2)}</span></div>
              </div>

              {activeScheme && (
                 <div className="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[9px] font-bold px-2 py-1 rounded w-fit uppercase tracking-wider">
                    {product.scheme.buy}+{product.scheme.free} Scheme
                 </div>
              )}

              <button 
                onClick={() => {
                  onAddProduct(product, pricing);
                  toast.success(`${product.name} added to order`, { icon: '🛒', style: { borderRadius: '12px', background: '#333', color: '#fff' }});
                }}
                className="mt-2 w-full py-2 bg-zinc-100 hover:bg-indigo-600 hover:text-white dark:bg-zinc-800 dark:hover:bg-indigo-600 text-zinc-700 dark:text-zinc-200 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1 min-h-[44px] active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" /> Add to Order
              </button>
            </div>
          );
        })}
        {filteredProducts.length === 0 && (
          <div className="text-center py-8">
            <Package className="w-8 h-8 mx-auto text-zinc-300 dark:text-zinc-700 mb-2" />
            <p className="text-sm text-zinc-500">No products found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductSuggestionPanel;
