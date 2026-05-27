import React, { useState, useEffect } from 'react';
import { calculateChainedPrices } from '../../utils/pricingUtils';
import CameraCapture from './CameraCapture';
import { Camera, Save, X, Trash2 } from 'lucide-react';
import CustomSelect from '../ui/CustomSelect';

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
  const [isCalculatorExpanded, setIsCalculatorExpanded] = useState(false);

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
    if (formData.retailerDivisor < 1.01 || formData.dbDivisor < 1.01 || formData.ssDivisor < 1.01) {
      alert("Price Chain Error: Divisors must be at least 1.01 to ensure a valid margin chain.");
      return;
    }
    onSave(formData);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 animate-in fade-in h-full">
      {/* LEFT: Calculator Form */}
      <div className="w-full lg:w-2/3 bg-white dark:bg-[#1a1d27] p-4 lg:p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-y-auto custom-scrollbar h-full shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 lg:mb-6">
          <h2 className="text-lg lg:text-xl font-bold text-zinc-900 dark:text-zinc-100">
            {initialData ? "Edit Product Pricing" : "Create New Product"}
          </h2>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
             {initialData && onDelete && (
               <button onClick={() => { onDelete(initialData.id); onCancel(); }} type="button" className="px-3 py-1.5 lg:px-4 lg:py-2 bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 rounded-xl text-xs lg:text-sm font-semibold hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors flex items-center gap-1.5 lg:gap-2 min-h-[36px] lg:min-h-[44px] flex-1 sm:flex-none justify-center">
                 <Trash2 className="w-3.5 h-3.5 lg:w-4 lg:h-4" /> Delete
               </button>
             )}
             <button onClick={onCancel} type="button" className="px-3 py-1.5 lg:px-4 lg:py-2 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 rounded-xl text-xs lg:text-sm font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5 lg:gap-2 min-h-[36px] lg:min-h-[44px] flex-1 sm:flex-none justify-center">
               <X className="w-3.5 h-3.5 lg:w-4 lg:h-4" /> Cancel
             </button>
             <button onClick={handleSubmit} type="button" className="px-3 py-1.5 lg:px-4 lg:py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs lg:text-sm font-semibold shadow-sm transition-all flex items-center gap-1.5 lg:gap-2 min-h-[36px] lg:min-h-[44px] flex-1 sm:flex-none justify-center">
               <Save className="w-3.5 h-3.5 lg:w-4 lg:h-4" /> Save
             </button>
          </div>
        </div>

        <form className="space-y-4 lg:space-y-6" onSubmit={handleSubmit}>
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1">Product Name</label>
              <input type="text" required value={formData.name} onChange={e => handleChange('name', e.target.value)} className="w-full px-3 py-2 lg:px-4 lg:py-2.5 bg-zinc-50 dark:bg-[#0f1117] border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all dark:text-zinc-100 text-sm min-h-[40px] lg:min-h-[44px]" placeholder="e.g. Premium Engine Oil" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1">SKU</label>
              <input type="text" required value={formData.sku} onChange={e => handleChange('sku', e.target.value)} className="w-full px-3 py-2 lg:px-4 lg:py-2.5 bg-zinc-50 dark:bg-[#0f1117] border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all dark:text-zinc-100 text-sm min-h-[40px] lg:min-h-[44px]" placeholder="e.g. LUB-10W30" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1">Category</label>
              <input type="text" value={formData.category} onChange={e => handleChange('category', e.target.value)} className="w-full px-3 py-2 lg:px-4 lg:py-2.5 bg-zinc-50 dark:bg-[#0f1117] border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all dark:text-zinc-100 text-sm min-h-[40px] lg:min-h-[44px]" placeholder="e.g. Lubricants" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1">Unit of Measure</label>
              <CustomSelect 
                value={formData.uom} 
                onChange={val => handleChange('uom', val)} 
                className="w-full px-3 py-2 lg:px-4 lg:py-2.5 bg-zinc-50 dark:bg-[#0f1117] border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all dark:text-zinc-100 text-sm min-h-[40px] lg:min-h-[44px] flex items-center justify-between outline-none cursor-pointer"
                options={[
                  { value: 'Piece', label: 'Piece' },
                  { value: 'Liter', label: 'Liter' },
                  { value: 'Kg', label: 'Kg' },
                  { value: 'Box', label: 'Box' }
                ]}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-zinc-500 mb-1">Image (URL or Capture)</label>
              <div className="flex gap-2">
                <input type="text" value={formData.image} onChange={e => handleChange('image', e.target.value)} className="w-full px-3 py-2 lg:px-4 lg:py-2.5 bg-zinc-50 dark:bg-[#0f1117] border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all dark:text-zinc-100 text-sm min-h-[40px] lg:min-h-[44px]" placeholder="https://... or base64" />
                <button 
                  type="button" 
                  onClick={() => setIsCameraOpen(true)}
                  className="px-3 py-2 lg:px-4 lg:py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs lg:text-sm font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors whitespace-nowrap flex items-center gap-1.5 lg:gap-2 min-h-[40px] lg:min-h-[44px]"
                >
                  <Camera className="w-3.5 h-3.5 lg:w-4 lg:h-4" /> <span>Capture</span>
                </button>
              </div>
            </div>
          </div>

          <hr className="border-zinc-200 dark:border-zinc-800" />

          {/* Pricing & Margins */}
          <div>
            <h3 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mb-3 lg:mb-4 uppercase tracking-wider">Pricing & Margins</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">MRP (₹)</label>
                <input type="number" required min="0" step="0.01" value={formData.mrp} onChange={e => handleChange('mrp', Number(e.target.value))} className="w-full px-3 py-2 lg:px-4 lg:py-2.5 bg-white dark:bg-[#0f1117] border-2 border-zinc-200 dark:border-zinc-700 rounded-xl focus:border-indigo-500 focus:ring-0 focus:outline-none transition-all dark:text-zinc-100 font-bold text-base lg:text-lg min-h-[40px] lg:min-h-[44px]" />
              </div>
              <div>
                <label className="block text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1">Retailer Divisor</label>
                <input type="number" required min="1.01" step="0.01" value={formData.retailerDivisor} onChange={e => handleChange('retailerDivisor', Number(e.target.value))} className="w-full px-3 py-2 lg:px-4 lg:py-2.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all dark:text-emerald-100 text-sm font-bold min-h-[40px] lg:min-h-[44px]" />
              </div>
              <div>
                <label className="block text-xs font-bold text-blue-700 dark:text-blue-400 mb-1">DB Divisor</label>
                <input type="number" required min="1.01" step="0.01" value={formData.dbDivisor} onChange={e => handleChange('dbDivisor', Number(e.target.value))} className="w-full px-3 py-2 lg:px-4 lg:py-2.5 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all dark:text-blue-100 text-sm font-bold min-h-[40px] lg:min-h-[44px]" />
              </div>
              <div>
                <label className="block text-xs font-bold text-indigo-700 dark:text-indigo-400 mb-1">SS Divisor</label>
                <input type="number" required min="1.01" step="0.01" value={formData.ssDivisor} onChange={e => handleChange('ssDivisor', Number(e.target.value))} className="w-full px-3 py-2 lg:px-4 lg:py-2.5 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all dark:text-indigo-100 text-sm font-bold min-h-[40px] lg:min-h-[44px]" />
              </div>
            </div>
          </div>

          <hr className="border-zinc-200 dark:border-zinc-800" />

          {/* Scheme */}
          <div>
            <div className="flex justify-between items-center mb-3 lg:mb-4">
              <h3 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Active Scheme</h3>
              <label className="flex items-center gap-2 cursor-pointer min-h-[40px] lg:min-h-[44px]">
                <input type="checkbox" checked={formData.inStock} onChange={e => handleChange('inStock', e.target.checked)} className="w-4 h-4 lg:w-5 lg:h-5 rounded text-indigo-600 focus:ring-indigo-500 bg-zinc-100 border-zinc-300 dark:border-zinc-600 dark:bg-zinc-700" />
                <span className="text-xs lg:text-sm font-bold text-zinc-700 dark:text-zinc-300">In Stock</span>
              </label>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4 p-3 lg:p-4 bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Buy Qty</label>
                <input type="number" min="0" value={formData.scheme.buy} onChange={e => handleSchemeChange('buy', e.target.value)} className="w-full px-3 py-2 lg:px-4 lg:py-2.5 bg-white dark:bg-[#0f1117] border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all dark:text-zinc-100 text-sm font-bold min-h-[40px] lg:min-h-[44px]" />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Free Qty</label>
                <input type="number" min="0" value={formData.scheme.free} onChange={e => handleSchemeChange('free', e.target.value)} className="w-full px-3 py-2 lg:px-4 lg:py-2.5 bg-white dark:bg-[#0f1117] border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all dark:text-zinc-100 text-sm font-bold min-h-[40px] lg:min-h-[44px]" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-zinc-500 mb-1">Scheme Label</label>
                <input type="text" value={formData.schemeLabel} onChange={e => handleChange('schemeLabel', e.target.value)} className="w-full px-3 py-2 lg:px-4 lg:py-2.5 bg-white dark:bg-[#0f1117] border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all dark:text-zinc-100 text-sm min-h-[40px] lg:min-h-[44px]" placeholder="e.g. Diwali Offer" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-zinc-500 mb-1">Validity (End Date)</label>
                <input type="date" value={formData.schemeEndDate} onChange={e => handleChange('schemeEndDate', e.target.value)} className="w-full px-3 py-2 lg:px-4 lg:py-2.5 bg-white dark:bg-[#0f1117] border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all dark:text-zinc-100 text-sm min-h-[40px] lg:min-h-[44px]" />
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Mobile Toggle for Calculator */}
      <div className="lg:hidden w-full">
        <button 
          type="button" 
          onClick={() => setIsCalculatorExpanded(!isCalculatorExpanded)}
          className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-bold rounded-full shadow-md flex items-center justify-center gap-2 transition-all min-h-[44px] hover:shadow-lg active:scale-95"
        >
          {isCalculatorExpanded ? "Hide Live Margin Calculator" : "View Live Margin Calculator"}
        </button>
      </div>

      {/* RIGHT: Live Preview & Math */}
      <div className={`w-full lg:w-1/3 flex-col gap-3 lg:gap-4 lg:flex ${isCalculatorExpanded ? 'flex animate-in slide-in-from-top-4 duration-300' : 'hidden'}`}>
        {/* Step-by-Step Strip */}
        <div className="bg-zinc-50 dark:bg-[#0f1117] p-3 lg:p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
           <h3 className="text-[10px] lg:text-xs font-bold text-zinc-400 mb-1.5 lg:mb-2 uppercase tracking-wider">Live Calculation Chain</h3>
           <div className="p-2.5 lg:p-3 bg-zinc-900 dark:bg-black rounded-xl border border-zinc-800 shadow-inner">
             <code className="text-xs lg:text-sm text-emerald-400 font-mono break-words leading-relaxed">
               {calcResults.formulaStrip}
             </code>
           </div>
        </div>

        {/* Calculated Margin Cards */}
        <div className="bg-white dark:bg-[#1a1d27] p-4 lg:p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex-1 space-y-3 shadow-sm">
           <h3 className="text-xs lg:text-sm font-bold text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800 pb-2">Resulting Landing Costs</h3>
           
           <div className="flex justify-between items-center p-3 lg:p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
              <div>
                <p className="text-[10px] lg:text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase">Retailer</p>
                <p className="text-[9px] lg:text-[10px] text-emerald-600 dark:text-emerald-500">Margin: {calcResults.retailerMarginPercent.toFixed(1)}%</p>
              </div>
              <span className="text-lg lg:text-xl font-black text-zinc-900 dark:text-zinc-100">₹{calcResults.retailerCost.toFixed(2)}</span>
           </div>

           <div className="flex justify-between items-center p-3 lg:p-4 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
              <div>
                <p className="text-[10px] lg:text-xs font-bold text-blue-700 dark:text-blue-400 uppercase">Distributor (DB)</p>
                <p className="text-[9px] lg:text-[10px] text-blue-600 dark:text-blue-500">Margin: {calcResults.dbMarginPercent.toFixed(1)}%</p>
              </div>
              <span className="text-lg lg:text-xl font-black text-zinc-900 dark:text-zinc-100">₹{calcResults.dbCost.toFixed(2)}</span>
           </div>

           <div className="flex justify-between items-center p-3 lg:p-4 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20">
              <div>
                <p className="text-[10px] lg:text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase">Super Stockist (SS)</p>
                <p className="text-[9px] lg:text-[10px] text-indigo-600 dark:text-indigo-500">Margin: {calcResults.ssMarginPercent.toFixed(1)}%</p>
              </div>
              <span className="text-lg lg:text-xl font-black text-zinc-900 dark:text-zinc-100">₹{calcResults.ssCost.toFixed(2)}</span>
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
