import React, { useState } from 'react';
import ProductSuggestionPanel from './ProductSuggestionPanel';
import QuantityStepper from '../ui/QuantityStepper';
import BottomSheet from '../ui/BottomSheet';
import { Plus, Trash2, Tag, Package, Search, ToggleLeft, ToggleRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import CustomSelect from '../ui/CustomSelect';
import { useSupplyChainContext } from '../../context/SupplyChainContext';
import { useProductContext } from '../../context/ProductContext';
import useOrderContext from '../../context/OrderContext';
import toast from 'react-hot-toast';

const OrderBuilder = ({ initialOrder, customer, onSave, onCancel }) => {
  const { currentUser } = useAuth();

  const { distributors, inventoryLedger } = useSupplyChainContext();
  const { products } = useProductContext();
  const { orders } = useOrderContext();

  const [activeOrder, setActiveOrder] = useState({
    ...initialOrder,
    globalDiscount: initialOrder?.globalDiscount ?? initialOrder?.global_discount ?? '',
    distributorId: initialOrder?.distributorId || initialOrder?.distributor_id || '',
  });
  const [isProductSheetOpen, setIsProductSheetOpen] = useState(false);

  const isEdit = orders.some((o) => o.id === activeOrder.id);
  const isReadOnly = currentUser?.role !== 'SALES';

  const getItemStockInfo = (item) => {
    if (!activeOrder.distributorId) return null;
    
    let sku = item.sku;
    if (!sku && item.name) {
      const match = products.find(p => (p.name || '').toLowerCase() === (item.name || '').trim().toLowerCase());
      if (match) sku = match.sku;
    }
    
    if (!sku) return null;
    
    return inventoryLedger.find(
      (entry) => entry.distributorId === activeOrder.distributorId && entry.sku === sku
    ) || null;
  };

  const handleConfirmOrder = () => {
    let finalOrder = { ...activeOrder };
    let hasInsufficientStock = false;
    let outOfStockNames = [];

    finalOrder.items.forEach(item => {
      if (finalOrder.distributorId) {
        const stockInfo = getItemStockInfo(item);
        const currentStock = stockInfo ? stockInfo.currentStock : 0;
        if (item.qty > currentStock) {
          hasInsufficientStock = true;
          outOfStockNames.push(item.name || "Unnamed Product");
        }
      }
    });

    // Allow backordered items to just result in negative stock in DB ledger
    // without changing the order status to Backordered or showing an error.
    toast.success("Order saved successfully.");
    onSave(finalOrder);
  };

  // --- Handlers ---
  const handleAddItem = () => {
    setActiveOrder({
      ...activeOrder,
      items: [...activeOrder.items, { id: Date.now(), name: "", qty: 1, price: 0, discount: 0, applyScheme: false }]
    });
  };

  const handleRemoveItem = (itemId) => {
    setActiveOrder({ ...activeOrder, items: activeOrder.items.filter(item => item.id !== itemId) });
  };

  const handleAddProductFromCatalogue = (product, pricing) => {
    if (activeOrder.items.find(i => i.sku === product.sku)) {
      toast('Product already in order', { icon: '⚠️' });
      return;
    }
    const prodGst = product.gst || 18;
    const preGstPrice = pricing.retailerCost / (1 + prodGst / 100);
    
    const schemeActive = (() => {
      if (!product.scheme || product.scheme.free === 0) return false;
      if (!product.schemeEndDate) return true;
      return new Date(product.schemeEndDate) >= new Date();
    })();

    setActiveOrder(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: Date.now(),
          sku: product.sku,
          name: product.name,
          qty: 1,
          price: Number(preGstPrice.toFixed(2)),
          discount: 0,
          // Per-item scheme: ON by default when product has an active scheme
          applyScheme: schemeActive,
          schemeInfo: schemeActive ? `Scheme: ${product.scheme.buy}+${product.scheme.free}` : null,
        }
      ]
    }));
  };

  const handleItemChange = (itemId, field, value) => {
    const updatedItems = activeOrder.items.map(item => item.id === itemId ? { ...item, [field]: value } : item );
    setActiveOrder({ ...activeOrder, items: updatedItems });
  };

  const calculateRowTotal = (item) => {
    const itemTotal = item.qty * item.price;
    const afterDiscount = itemTotal - (itemTotal * ((Number(item.discount) || 0) / 100));
    return afterDiscount + (afterDiscount * ((Number(item.gst) || 0) / 100));
  };

  const currentSubtotal = activeOrder.items.reduce((sum, item) => sum + calculateRowTotal(item), 0);
  const globalDiscountPercentage = Number(activeOrder.globalDiscount) || 0;
  const globalDiscountAmount = currentSubtotal * (globalDiscountPercentage / 100);
  const currentFinalTotal = currentSubtotal - globalDiscountAmount;

  return (
    <div className="fixed inset-0 z-60 bg-zinc-50 dark:bg-[#0f1117] flex flex-col animate-slide-up-fade lg:relative lg:inset-auto lg:h-[calc(100vh-120px)] lg:rounded-2xl lg:border lg:border-zinc-200 lg:dark:border-zinc-800 lg:overflow-hidden lg:shadow-xl lg:flex-row">
      <div className="flex-1 lg:w-2/3 flex flex-col min-w-0 min-h-0 lg:border-r lg:border-zinc-200 lg:dark:border-zinc-800">
        {/* Mobile Sticky Header */}
        <div className="flex-none bg-white dark:bg-[#1a1d27] border-b border-zinc-200 dark:border-zinc-800 p-3 pt-[calc(12px+env(safe-area-inset-top))] lg:p-4 sticky top-0 z-20 shadow-sm flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h2 className="text-base lg:text-lg font-bold text-zinc-900 dark:text-zinc-100 truncate">
              {isReadOnly ? `Viewing Order ${activeOrder.id}` : isEdit ? `Edit Order ${activeOrder.id}` : "New Order"}
            </h2>
            <p className="text-[10px] lg:text-xs text-zinc-500 dark:text-zinc-400 truncate">{activeOrder.date}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={onCancel} className="hidden lg:block px-3 lg:px-4 py-1.5 lg:py-2 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-xs lg:text-sm font-medium transition-colors min-h-[36px] lg:min-h-[44px]">
              {isReadOnly ? "Close" : "Cancel"}
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 min-h-0 overflow-y-auto pb-[240px] lg:pb-0 custom-scrollbar relative">
        <div className="p-3 lg:p-4 space-y-3 lg:space-y-4 min-w-0">
          
          {/* Fulfilling Distributor Selection */}
          <div className="bg-white dark:bg-[#1a1d27] border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                Fulfilling Distributor
              </label>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Select the distributor supplying stock for this billing order.
              </p>
            </div>
            <div className="w-full md:w-64">
              <CustomSelect
                value={activeOrder.distributorId || ""}
                onChange={(val) => {
                  setActiveOrder(prev => ({ ...prev, distributorId: val }));
                }}
                disabled={isReadOnly || distributors.length === 0}
                className="w-full border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 rounded-xl p-2.5 flex items-center justify-between outline-none cursor-pointer text-sm"
                options={[
                  { value: "", label: distributors.length === 0 ? "-- No Distributors Found --" : "-- Direct Corporate / None --" },
                  ...distributors.map(db => ({ value: db.id, label: `${db.name} (${db.district})` }))
                ]}
              />
              {distributors.length === 0 && !isReadOnly && (
                <p className="text-[10px] text-amber-600 dark:text-amber-500 mt-1 italic">
                  No distributor profiles exist. You must create one in the Supply Chain section first to manage inventory.
                </p>
              )}
            </div>
          </div>
          
          {activeOrder.items.length > 0 && (
            <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto bg-white dark:bg-[#1a1d27] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800 text-xs uppercase text-zinc-500 font-bold">
                    <th className="px-4 py-3">Product Name</th>
                    <th className="px-4 py-3 w-32">Qty</th>
                    <th className="px-4 py-3 w-32">Price (₹)</th>
                    <th className="px-4 py-3 w-24">Disc %</th>
                    <th className="px-4 py-3 w-32 text-right">Total (₹)</th>
                    {!isReadOnly && <th className="px-4 py-3 w-16 text-center"></th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {activeOrder.items.map(item => (
                    <tr key={`desktop-${item.id}`} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                    <td className="px-4 py-3">
                        <input 
                          type="text" 
                          value={item.name} 
                          placeholder="Product name"
                          onChange={(e) => handleItemChange(item.id, "name", e.target.value)} 
                          readOnly={isReadOnly}
                          className="w-full text-sm font-semibold bg-transparent border-b border-transparent hover:border-dashed hover:border-zinc-300 dark:hover:border-zinc-700 focus:outline-none focus:border-indigo-500 pb-1 rounded-none text-zinc-900 dark:text-zinc-100 read-only:focus:border-transparent read-only:hover:border-transparent" 
                        />
                        {/* Per-item scheme toggle */}
                        {item.schemeInfo !== undefined && !isReadOnly && (
                          <button
                            type="button"
                            onClick={() => {
                              const toggled = !item.applyScheme;
                              handleItemChange(item.id, 'applyScheme', toggled);
                              handleItemChange(item.id, 'schemeInfo', toggled && item.schemeInfo ? item.schemeInfo : (toggled ? item.schemeInfo : null));
                            }}
                            className={`mt-1 inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded transition-all ${
                              item.applyScheme
                                ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30'
                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 border border-zinc-200 dark:border-zinc-700'
                            }`}
                          >
                            {item.applyScheme ? <ToggleRight className="w-3 h-3" /> : <ToggleLeft className="w-3 h-3" />}
                            {item.applyScheme ? 'Scheme ON' : 'Scheme OFF'}
                          </button>
                        )}
                        {item.applyScheme && item.schemeInfo && <p className="text-[10px] text-indigo-600 dark:text-indigo-400 mt-0.5 font-medium">{item.schemeInfo}</p>}
                        {(() => {
                          if (activeOrder.distributorId) {
                            const stockInfo = getItemStockInfo(item);
                            const currentStock = stockInfo ? stockInfo.currentStock : 0;
                            if (item.qty > currentStock) {
                              const dbName = distributors.find(d => d.id === activeOrder.distributorId)?.name || "Distributor";
                              return (
                                <p className="text-[10px] text-red-500 dark:text-red-400 mt-1.5 font-bold flex items-center gap-1 bg-red-50 dark:bg-red-500/10 px-2 py-0.5 rounded border border-red-200 dark:border-red-500/20 w-fit">
                                  ⚠️ Insufficient Stock at {dbName} (Available: {currentStock})
                                </p>
                              );
                            }
                          }
                          return null;
                        })()}
                      </td>
                      <td className="px-4 py-3">
                        <QuantityStepper value={item.qty} min={1} max={9999} onChange={(val) => handleItemChange(item.id, "qty", val)} disabled={isReadOnly} />
                      </td>
                      <td className="px-4 py-3">
                        <input 
                          type="number" 
                          value={item.price} 
                          onChange={(e) => handleItemChange(item.id, "price", Number(e.target.value))} 
                          readOnly={isReadOnly}
                          className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 tabular-nums text-sm read-only:focus:ring-0" 
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input 
                          type="number" 
                          value={item.discount} 
                          onChange={(e) => handleItemChange(item.id, "discount", Number(e.target.value))} 
                          readOnly={isReadOnly}
                          className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-amber-600 dark:text-amber-400 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500 tabular-nums text-sm text-center read-only:focus:ring-0" 
                        />
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-zinc-900 dark:text-zinc-100 tabular-nums text-sm">
                        ₹{calculateRowTotal(item).toFixed(2)}
                      </td>
                      {!isReadOnly && (
                        <td className="px-4 py-3 text-center">
                          <button 
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 p-1.5 rounded-lg transition-colors inline-flex items-center justify-center"
                            title="Remove Item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
            {activeOrder.items.map((item) => (
              <div key={item.id} className="bg-white dark:bg-[#1a1d27] border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 shadow-[0_1px_3px_rgba(0,0,0,0.06)] relative group">
                {!isReadOnly && (
                  <button 
                    onClick={() => handleRemoveItem(item.id)}
                    className="absolute right-2 top-2 text-red-500/70 hover:text-red-600 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 p-1.5 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}

                <div className="pr-12 mb-3 lg:mb-4">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 block">Product Name</label>
                  <input 
                    type="text" 
                    value={item.name} 
                    placeholder="Enter product name"
                    onChange={(e) => handleItemChange(item.id, "name", e.target.value)} 
                    readOnly={isReadOnly}
                    className="w-full text-sm lg:text-base font-semibold bg-transparent border-b border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500 pb-1 rounded-none read-only:focus:border-transparent read-only:hover:border-transparent read-only:border-transparent" 
                  />
                  {/* Per-item scheme toggle (mobile) */}
                  {item.schemeInfo !== undefined && !isReadOnly && (
                    <button
                      type="button"
                      onClick={() => {
                        handleItemChange(item.id, 'applyScheme', !item.applyScheme);
                      }}
                      className={`mt-1.5 inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full transition-all ${
                        item.applyScheme
                          ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 border border-zinc-200 dark:border-zinc-700'
                      }`}
                    >
                      {item.applyScheme ? <ToggleRight className="w-3 h-3" /> : <ToggleLeft className="w-3 h-3" />}
                      {item.applyScheme ? 'Scheme ON' : 'Scheme OFF'}
                    </button>
                  )}
                  {item.applyScheme && item.schemeInfo && <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1 font-medium">{item.schemeInfo}</p>}
                  {(() => {
                    if (activeOrder.distributorId) {
                      const stockInfo = getItemStockInfo(item);
                      const currentStock = stockInfo ? stockInfo.currentStock : 0;
                      if (item.qty > currentStock) {
                        const dbName = distributors.find(d => d.id === activeOrder.distributorId)?.name || "Distributor";
                        return (
                          <p className="text-xs text-red-500 dark:text-red-400 mt-1.5 font-bold flex items-center gap-1 bg-red-50 dark:bg-red-500/10 px-2 py-0.5 rounded border border-red-200 dark:border-red-500/20 w-fit">
                            ⚠️ Insufficient Stock at {dbName} (Available: {currentStock})
                          </p>
                        );
                      }
                    }
                    return null;
                  })()}
                </div>

                <div className="grid grid-cols-2 gap-3 lg:gap-4 mb-3 lg:mb-4">
                   <div>
                     <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2 block">Quantity</label>
                     <QuantityStepper value={item.qty} min={1} max={9999} onChange={(val) => handleItemChange(item.id, "qty", val)} disabled={isReadOnly} />
                   </div>
                   <div>
                     <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 block">Unit Price (₹)</label>
                     <input 
                       type="number" 
                       value={item.price} 
                       onChange={(e) => handleItemChange(item.id, "price", Number(e.target.value))} 
                       readOnly={isReadOnly}
                       className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-lg px-2 lg:px-3 min-h-[36px] lg:min-h-[44px] focus:outline-none focus:ring-1 focus:ring-indigo-500 tabular-nums text-sm lg:text-base read-only:focus:ring-0" 
                     />
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
                  <div className="flex items-center justify-between">
                     <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Discount %</label>
                     <input 
                       type="number" 
                       value={item.discount} 
                       onChange={(e) => handleItemChange(item.id, "discount", Number(e.target.value))} 
                       readOnly={isReadOnly}
                       className="w-16 bg-transparent border-b border-zinc-200 dark:border-zinc-700 text-amber-600 dark:text-amber-400 text-right focus:outline-none focus:border-amber-500 pb-0.5 tabular-nums read-only:focus:border-transparent read-only:border-transparent" 
                     />
                  </div>
                </div>

                <div className="mt-3 lg:mt-4 pt-2.5 lg:pt-3 border-t border-zinc-100 dark:border-zinc-800/50 flex justify-between items-center">
                  <span className="text-xs lg:text-sm text-zinc-500">Item Total</span>
                  <span className="text-base lg:text-lg font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">₹{calculateRowTotal(item).toFixed(2)}</span>
                </div>
              </div>
            ))}
            </div>
            </>
          )}

          {activeOrder.items.length === 0 && (
            <div className="text-center py-12 px-4 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
              <Package className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-500 dark:text-zinc-400 font-medium mb-1">No items in order</p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">Use the buttons below to add items</p>
            </div>
          )}
        </div>
      </div>
      </div>

      {/* Summary Footer Drawer (Mobile) & Panel (Desktop) */}
      <div className="fixed bottom-[64px] left-0 right-0 bg-white dark:bg-[#1a1d27] border-t border-zinc-200 dark:border-zinc-800 p-2.5 lg:p-4 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] z-30 lg:bottom-0 lg:relative lg:w-1/3 lg:flex-none lg:h-full lg:shadow-none lg:border-t-0 lg:flex lg:flex-col custom-scrollbar pb-[calc(10px+env(safe-area-inset-bottom))] lg:pb-4">
        
        {/* Desktop Title */}
        <div className="hidden lg:block border-b border-zinc-200 dark:border-zinc-800 pb-4 mb-4 shrink-0">
           <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Order Summary</h3>
        </div>

        {/* Quick Add Buttons (Always Visible unless ReadOnly) */}
        {!isReadOnly && (
          <div className="flex gap-2 mb-2 lg:mb-4 shrink-0">
            <button 
              onClick={handleAddItem} 
              className="flex-1 bg-white dark:bg-[#1a1d27] border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg lg:rounded-xl px-2 lg:px-3 py-1.5 lg:py-2.5 text-[10px] lg:text-sm font-medium flex items-center justify-center gap-1.5 lg:gap-2 transition-colors min-h-[32px] lg:min-h-[44px] shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 lg:w-4 h-4" /> Custom Item
            </button>
            <button 
              onClick={() => setIsProductSheetOpen(true)}
              className="flex-1 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 hover:bg-indigo-100 dark:hover:bg-indigo-500/30 rounded-lg lg:rounded-xl px-2 lg:px-3 py-1.5 lg:py-2.5 text-[10px] lg:text-sm font-medium flex items-center justify-center gap-1.5 lg:gap-2 transition-colors min-h-[32px] lg:min-h-[44px] lg:hidden"
            >
              <Search className="w-3.5 h-3.5 lg:w-4 h-4" /> Browse
            </button>
          </div>
        )}

        {/* Desktop Product Suggestion inline */}
        {!isReadOnly && (
          <div className="hidden lg:flex flex-1 overflow-hidden flex-col mb-4">
             <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-2 shrink-0"><Search className="w-4 h-4"/> Browse Catalogue</h3>
             <div className="flex-1 overflow-y-auto">
               <ProductSuggestionPanel onAddProduct={handleAddProductFromCatalogue} distributorId={activeOrder.distributorId} />
             </div>
          </div>
        )}


        <div className="space-y-1 lg:space-y-3 mb-2 lg:mb-4 shrink-0 pt-2 lg:pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex justify-between text-[10px] lg:text-sm">
            <span className="text-zinc-500 dark:text-zinc-400">Subtotal</span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">₹{currentSubtotal.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between items-center text-[10px] lg:text-sm">
            <span className="text-zinc-500 dark:text-zinc-400">Discount (%)</span>
            <div className="relative w-12 lg:w-20">
              <input 
                type="number" 
                min="0" max="100" 
                value={activeOrder.globalDiscount} 
                onChange={(e) => setActiveOrder({...activeOrder, globalDiscount: Number(e.target.value)})} 
                readOnly={isReadOnly}
                className="w-full pl-1.5 pr-4 py-0.5 lg:py-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded text-right text-amber-600 focus:outline-amber-500 transition-colors min-h-[24px] lg:min-h-[32px] tabular-nums read-only:focus:border-zinc-200 text-[10px] lg:text-sm" 
              />
              <span className="absolute right-1 top-0.5 lg:top-1.5 text-zinc-400 text-[8px] lg:text-xs">%</span>
            </div>
          </div>
          
          {globalDiscountAmount > 0 && (
            <div className="flex justify-between text-[9px] lg:text-xs text-amber-600 dark:text-amber-500">
              <span>Amount</span>
              <span>-₹{globalDiscountAmount.toFixed(2)}</span>
            </div>
          )}
          
          <div className="flex justify-between items-end border-t border-zinc-200 dark:border-zinc-800 pt-1 lg:pt-3 mt-0.5">
            <span className="text-xs lg:text-sm font-semibold text-zinc-900 dark:text-zinc-100">Total</span>
            <span className="text-lg lg:text-2xl font-bold text-indigo-600 dark:text-indigo-400 tabular-nums leading-none">₹{currentFinalTotal.toFixed(2)}</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={onCancel} 
            className={`lg:hidden ${isReadOnly ? 'w-full' : 'w-1/3'} shrink-0 bg-white dark:bg-[#1a1d27] border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg py-2 text-xs font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all min-h-[36px]`}
          >
            {isReadOnly ? "Close" : "Cancel"}
          </button>

          {!isReadOnly && (
            <button 
              onClick={handleConfirmOrder} 
              disabled={!activeOrder.distributorId || activeOrder.items.length === 0 || activeOrder.items.some(i => !i.name.trim())}
              className="flex-1 shrink-0 bg-indigo-600 text-white rounded-lg lg:rounded-xl py-2 lg:py-3.5 text-xs lg:text-base font-semibold hover:bg-indigo-700 shadow-[0_4px_12px_rgba(79,70,229,0.2)] transition-all min-h-[36px] lg:min-h-[52px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirm Order
            </button>
          )}
        </div>
      </div>

      {/* Mobile Product Suggestion Sheet */}
      <div className="lg:hidden">
        <BottomSheet 
          isOpen={isProductSheetOpen} 
          onClose={() => setIsProductSheetOpen(false)} 
          title="Catalogue"
          height="85vh"
        >
          <ProductSuggestionPanel onAddProduct={handleAddProductFromCatalogue} distributorId={activeOrder.distributorId} />
        </BottomSheet>
      </div>

    </div>
  );
};

export default OrderBuilder;