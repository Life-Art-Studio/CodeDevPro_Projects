import React, { useState, useEffect } from 'react';
import { calculateChainedPrices } from '../../utils/pricingUtils';
import CameraCapture from './CameraCapture';

const ProductForm = ({ initialData, onSave, onCancel, onDelete }) => {
  const [formData, setFormData] = useState(
    initialData || {
      id: `PROD-${Date.now()}`,
      name: "",
      sku: "",
      category: "",
      uom: "Piece",
      image: "",
      mrp: 100,
      retailerDivisor: 1.20,
      dbDivisor: 1.10,
      ssDivisor: 1.08,
      scheme: { buy: 0, free: 0 },
      schemeLabel: "",
      schemeEndDate: "",
      inStock: true
    }
  );

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [preview, setPreview] = useState(null);

  // Auto-calculate based on current form state
  const calcResults = calculateChainedPrices(
    formData.mrp,
    formData.retailerDivisor,
    formData.dbDivisor,
    formData.ssDivisor,
    formData.scheme.buy,
    formData.scheme.free
  );

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSchemeChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      scheme: { ...prev.scheme, [field]: Number(value) }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 animate-in fade-in h-full">
      {/* LEFT: Calculator Form */}
      <div className="w-full lg:w-2/3 glass-panel p-6 rounded-3xl border border-slate-200/50 dark:border-white/10 overflow-y-auto custom-scrollbar h-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            {initialData ? "Edit Product Pricing" : "Create New Product"}
          </h2>
          <div className="flex gap-2">
             {initialData && onDelete && (
               <button onClick={() => { onDelete(initialData.id); onCancel(); }} type="button" className="px-4 py-2 bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400 rounded-xl text-sm font-semibold hover:bg-red-200 dark:hover:bg-red-500/20 transition-colors">Delete</button>
             )}
             <button onClick={onCancel} type="button" className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
             <button onClick={handleSubmit} type="button" className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl text-sm font-bold shadow-lg hover:shadow-purple-500/30 transition-all">Save Product</button>
          </div>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Product Name</label>
              <input type="text" required value={formData.name} onChange={e => handleChange('name', e.target.value)} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all dark:text-white" placeholder="e.g. Premium Engine Oil" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">SKU</label>
              <input type="text" required value={formData.sku} onChange={e => handleChange('sku', e.target.value)} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all dark:text-white" placeholder="e.g. LUB-10W30" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Category</label>
              <input type="text" value={formData.category} onChange={e => handleChange('category', e.target.value)} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all dark:text-white" placeholder="e.g. Lubricants" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Unit of Measure</label>
              <select value={formData.uom} onChange={e => handleChange('uom', e.target.value)} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all dark:text-white">
                <option value="Piece">Piece</option>
                <option value="Liter">Liter</option>
                <option value="Kg">Kg</option>
                <option value="Box">Box</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 mb-1">Image (URL or Capture)</label>
              <div className="flex gap-2">
                <input type="text" value={formData.image} onChange={e => handleChange('image', e.target.value)} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all dark:text-white text-sm" placeholder="https://... or base64" />
                <button 
                  type="button" 
                  onClick={() => setIsCameraOpen(true)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors whitespace-nowrap flex items-center gap-2"
                >
                  📸 <span>Capture</span>
                </button>
              </div>
            </div>
          </div>

          <hr className="border-slate-200 dark:border-slate-800" />

          {/* Pricing & Margins */}
          <div>
            <h3 className="text-sm font-bold text-purple-600 dark:text-purple-400 mb-4 uppercase tracking-wider">Pricing & Margins</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">MRP (₹)</label>
                <input type="number" required min="0" step="0.01" value={formData.mrp} onChange={e => handleChange('mrp', Number(e.target.value))} className="w-full px-4 py-2 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-purple-500 focus:ring-0 focus:outline-none transition-all dark:text-white font-bold text-lg" />
              </div>
              <div>
                <label className="block text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1">Retailer Divisor</label>
                <input type="number" required min="1" step="0.01" value={formData.retailerDivisor} onChange={e => handleChange('retailerDivisor', Number(e.target.value))} className="w-full px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all dark:text-emerald-100 font-bold" />
              </div>
              <div>
                <label className="block text-xs font-bold text-blue-600 dark:text-blue-400 mb-1">DB Divisor</label>
                <input type="number" required min="1" step="0.01" value={formData.dbDivisor} onChange={e => handleChange('dbDivisor', Number(e.target.value))} className="w-full px-4 py-2 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all dark:text-blue-100 font-bold" />
              </div>
              <div>
                <label className="block text-xs font-bold text-purple-600 dark:text-purple-400 mb-1">SS Divisor</label>
                <input type="number" required min="1" step="0.01" value={formData.ssDivisor} onChange={e => handleChange('ssDivisor', Number(e.target.value))} className="w-full px-4 py-2 bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/30 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all dark:text-purple-100 font-bold" />
              </div>
            </div>
          </div>

          <hr className="border-slate-200 dark:border-slate-800" />

          {/* Scheme */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-pink-500 dark:text-pink-400 uppercase tracking-wider">Active Scheme</h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.inStock} onChange={e => handleChange('inStock', e.target.checked)} className="rounded text-purple-600 focus:ring-purple-500 bg-slate-100 border-slate-300 dark:border-slate-600 dark:bg-slate-700" />
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">In Stock</span>
              </label>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-pink-50/50 dark:bg-pink-500/5 border border-pink-100 dark:border-pink-500/20 rounded-2xl">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Buy Qty</label>
                <input type="number" min="0" value={formData.scheme.buy} onChange={e => handleSchemeChange('buy', e.target.value)} className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-pink-500 focus:outline-none transition-all dark:text-white font-bold" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Free Qty</label>
                <input type="number" min="0" value={formData.scheme.free} onChange={e => handleSchemeChange('free', e.target.value)} className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-pink-500 focus:outline-none transition-all dark:text-white font-bold" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-500 mb-1">Scheme Label</label>
                <input type="text" value={formData.schemeLabel} onChange={e => handleChange('schemeLabel', e.target.value)} className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-pink-500 focus:outline-none transition-all dark:text-white" placeholder="e.g. Diwali Offer" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-500 mb-1">Validity (End Date)</label>
                <input type="date" value={formData.schemeEndDate} onChange={e => handleChange('schemeEndDate', e.target.value)} className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-pink-500 focus:outline-none transition-all dark:text-white" />
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* RIGHT: Live Preview & Math */}
      <div className="w-full lg:w-1/3 flex flex-col gap-4">
        {/* Step-by-Step Strip */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-200/50 dark:border-white/10 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
           <h3 className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Live Calculation Chain</h3>
           <div className="p-3 bg-slate-800 dark:bg-black rounded-xl border border-slate-700 shadow-inner">
             <code className="text-sm text-green-400 font-mono break-words leading-relaxed">
               {calcResults.formulaStrip}
             </code>
           </div>
        </div>

        {/* Calculated Margin Cards */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-200/50 dark:border-white/10 flex-1 space-y-4 bg-white/40 dark:bg-[#0a0c14]/40">
           <h3 className="text-sm font-bold text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">Resulting Landing Costs</h3>
           
           <div className="flex justify-between items-center p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
              <div>
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase">Retailer</p>
                <p className="text-[10px] text-emerald-500">Margin: {calcResults.retailerMarginPercent.toFixed(1)}%</p>
              </div>
              <span className="text-xl font-black text-slate-800 dark:text-white">₹{calcResults.retailerCost.toFixed(2)}</span>
           </div>

           <div className="flex justify-between items-center p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
              <div>
                <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase">Distributor (DB)</p>
                <p className="text-[10px] text-blue-500">Margin: {calcResults.dbMarginPercent.toFixed(1)}%</p>
              </div>
              <span className="text-xl font-black text-slate-800 dark:text-white">₹{calcResults.dbCost.toFixed(2)}</span>
           </div>

           <div className="flex justify-between items-center p-3 rounded-xl bg-purple-50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20">
              <div>
                <p className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase">Super Stockist (SS)</p>
                <p className="text-[10px] text-purple-500">Margin: {calcResults.ssMarginPercent.toFixed(1)}%</p>
              </div>
              <span className="text-xl font-black text-slate-800 dark:text-white">₹{calcResults.ssCost.toFixed(2)}</span>
           </div>
        </div>
      </div>
      
      {isCameraOpen && (
        <CameraCapture 
          onCapture={(base64Str) => {
            handleChange('image', base64Str);
            setIsCameraOpen(false);
          }}
          onCancel={() => setIsCameraOpen(false)}
        />
      )}
    </div>
  );
};

export default ProductForm;
