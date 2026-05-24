import React, { useState } from 'react';

const OrderBuilder = ({ initialOrder, onSave, onCancel }) => {
  // Setup local state based on the order passed in
  const [activeOrder, setActiveOrder] = useState(initialOrder);

  // --- Handlers for this specific order ---
  const handleAddItem = () => {
    setActiveOrder({
      ...activeOrder,
      items: [...activeOrder.items, { id: Date.now(), name: "", qty: 1, price: 0, discount: 0, gst: 18 }]
    });
  };

  const handleRemoveItem = (itemId) => {
    setActiveOrder({ ...activeOrder, items: activeOrder.items.filter(item => item.id !== itemId) });
  };

  const handleItemChange = (itemId, field, value) => {
    const updatedItems = activeOrder.items.map(item => item.id === itemId ? { ...item, [field]: value } : item );
    setActiveOrder({ ...activeOrder, items: updatedItems });
  };

  // --- Math ---
  const calculateRowTotal = (item) => {
    const itemTotal = item.qty * item.price;
    const afterDiscount = itemTotal - (itemTotal * (item.discount / 100));
    return afterDiscount + (afterDiscount * (item.gst / 100));
  };

  const currentSubtotal = activeOrder.items.reduce((sum, item) => sum + calculateRowTotal(item), 0);
  const globalDiscountPercentage = Number(activeOrder.globalDiscount) || 0;
  const globalDiscountAmount = currentSubtotal * (globalDiscountPercentage / 100);
  const currentFinalTotal = currentSubtotal - globalDiscountAmount;

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 dark:border-slate-800 pb-4 transition-colors gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 transition-colors">
            {activeOrder.id.startsWith("ORD-") && activeOrder.id.length > 5 ? `Edit Order ${activeOrder.id}` : "New Order"}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 transition-colors">{activeOrder.date}</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button onClick={onCancel} className="flex-1 sm:flex-none px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
          <button onClick={() => onSave(activeOrder)} className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 shadow-sm transition-colors">Save Order</button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 transition-colors">
              <th className="py-3 font-semibold w-1/3">Product Name</th>
              <th className="py-3 font-semibold w-24">Qty</th>
              <th className="py-3 font-semibold w-28">Unit Price</th>
              <th className="py-3 font-semibold w-28">Discount %</th>
              <th className="py-3 font-semibold w-24">GST %</th>
              <th className="py-3 font-semibold text-right">Total</th>
              <th className="py-3 text-center w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
            {activeOrder.items.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 group transition-colors">
                <td className="py-3 pr-2">
                  <input type="text" value={item.name} placeholder="e.g. Engine Oil" onChange={(e) => handleItemChange(item.id, "name", e.target.value)} className="w-full px-3 py-2 bg-transparent border border-slate-200 dark:border-slate-700 dark:text-slate-200 rounded-lg focus:outline-blue-500 transition-colors" />
                </td>
                <td className="py-3 pr-2">
                  <input type="number" min="1" value={item.qty} onChange={(e) => handleItemChange(item.id, "qty", Number(e.target.value))} className="w-full px-3 py-2 bg-transparent border border-slate-200 dark:border-slate-700 dark:text-slate-200 rounded-lg focus:outline-blue-500 transition-colors" />
                </td>
                <td className="py-3 pr-2">
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-400">₹</span>
                    <input type="number" value={item.price} onChange={(e) => handleItemChange(item.id, "price", Number(e.target.value))} className="w-full pl-6 pr-2 py-2 bg-transparent border border-slate-200 dark:border-slate-700 dark:text-slate-200 rounded-lg focus:outline-blue-500 transition-colors" />
                  </div>
                </td>
                <td className="py-3 pr-2">
                  <input type="number" value={item.discount} onChange={(e) => handleItemChange(item.id, "discount", Number(e.target.value))} className="w-full px-3 py-2 bg-transparent border border-slate-200 dark:border-slate-700 text-orange-600 dark:text-orange-400 rounded-lg focus:outline-orange-500 transition-colors" />
                </td>
                <td className="py-3 pr-2">
                  <select value={item.gst} onChange={(e) => handleItemChange(item.id, "gst", Number(e.target.value))} className="w-full px-2 py-2 bg-transparent border border-slate-200 dark:border-slate-700 dark:text-slate-200 rounded-lg focus:outline-blue-500 transition-colors">
                    <option className="dark:bg-slate-900" value={0}>0%</option>
                    <option className="dark:bg-slate-900" value={5}>5%</option>
                    <option className="dark:bg-slate-900" value={12}>12%</option>
                    <option className="dark:bg-slate-900" value={18}>18%</option>
                    <option className="dark:bg-slate-900" value={28}>28%</option>
                  </select>
                </td>
                <td className="py-3 text-right font-bold text-slate-800 dark:text-slate-100 transition-colors">₹{calculateRowTotal(item).toFixed(2)}</td>
                <td className="py-3 text-center">
                  <button onClick={() => handleRemoveItem(item.id)} className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start pt-4 border-t border-slate-200 dark:border-slate-800 transition-colors gap-4">
        <button onClick={handleAddItem} className="text-blue-600 dark:text-blue-400 text-sm font-semibold hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1 transition-colors">
          <span>+</span> Add Line Item
        </button>
        
        <div className="w-full sm:w-72 space-y-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500 dark:text-slate-400">Subtotal (Inc. GST)</span>
            <span className="font-semibold dark:text-slate-200">₹{currentSubtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500 dark:text-slate-400">Global Discount (%)</span>
            <div className="relative w-24">
              <input type="number" min="0" max="100" value={activeOrder.globalDiscount} onChange={(e) => setActiveOrder({...activeOrder, globalDiscount: Number(e.target.value)})} className="w-full pl-2 pr-6 py-1 bg-transparent border border-slate-300 dark:border-slate-600 rounded text-right text-orange-600 dark:text-orange-400 focus:outline-orange-500 transition-colors" />
              <span className="absolute right-2 top-1.5 text-slate-400 text-sm">%</span>
            </div>
          </div>
          {globalDiscountAmount > 0 && (
            <div className="flex justify-between items-center text-xs text-orange-600 dark:text-orange-400">
              <span>Discount Amount</span>
              <span>-₹{globalDiscountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between items-center text-lg font-bold border-t border-slate-300 dark:border-slate-600 pt-3 mt-2 transition-colors">
            <span className="dark:text-slate-200">Final Total</span>
            <span className="text-blue-600 dark:text-blue-400">₹{currentFinalTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderBuilder;