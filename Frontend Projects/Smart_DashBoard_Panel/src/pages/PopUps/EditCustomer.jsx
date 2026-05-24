import React, { useState, useEffect } from 'react';
import useCustomerContext from '../../context/CustomerContext';
import ReactDOM from 'react-dom';

// We accept the specific customer data as a prop!
const EditCustomerModal = ({ isOpen, onClose, customer }) => {
  const { updateCustomer } = useCustomerContext();
  
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    address: '',
    phone: '',
    status: 'Active',
    spend: '',
    date: '',
    tags: '',
    notes: ''
  });

  // Automatically fill the form when a customer is passed in
  useEffect(() => {
    if (customer) {
      // Strip the '$' and commas from the spend string so it fits in the number input
      const rawSpend = customer.spend ? customer.spend.replace(/[^0-9.-]+/g, "") : "";
      
      setFormData({
        id: customer.id,
        name: customer.name,
        email: customer.email || '',
        address: customer.address,
        phone: customer.phone,
        status: customer.status,
        spend: rawSpend,
        date: customer.date, // Keep their original join date!
        tags: customer.tags ? customer.tags.join(', ') : '',
        notes: customer.notes || ''
      });
    }
  }, [customer]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Format the data back into our nice table structure
    const updatedCustomerData = {
      ...formData,
      spend: `₹${parseFloat(formData.spend || 0).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : []
    };

    updateCustomer(updatedCustomerData);
    onClose();
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-[#0a0c14]/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="glass-modal rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 transition-colors border border-white/20">
        
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-white/5 dark:bg-white/5 transition-colors backdrop-blur-md">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 transition-colors tracking-tight">Edit Customer</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-pink-500 dark:hover:text-pink-400 hover:bg-white/10 p-2 rounded-full transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-5">
            {/* ID Display (Read Only) */}
            <div>
               <label htmlFor="id" className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 transition-colors">Customer ID</label>
               <input type="text" id="id" name="id" value={formData.id} readOnly className="w-full px-3 py-2.5 border border-slate-200/50 dark:border-white/10 rounded-xl bg-slate-50/50 dark:bg-white/5 text-slate-500 dark:text-slate-400 text-sm cursor-not-allowed transition-colors" />
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 transition-colors">Full Name *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">👤</span>
                <input type="text" id="name" name="name" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full pl-10 pr-3 py-2.5 bg-white/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 dark:text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition-all shadow-inner focus:shadow-[0_0_15px_rgba(168,85,247,0.2)]" />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 transition-colors">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">✉️</span>
                <input type="email" id="email" name="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full pl-10 pr-3 py-2.5 bg-white/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 dark:text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition-all shadow-inner focus:shadow-[0_0_15px_rgba(168,85,247,0.2)]" />
              </div>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 transition-colors">Address *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">📍</span>
                <input type="text" id="address" name="address" required value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full pl-10 pr-3 py-2.5 bg-white/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 dark:text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition-all shadow-inner focus:shadow-[0_0_15px_rgba(168,85,247,0.2)]" />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 transition-colors">Phone *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">📱</span>
                <input type="text" id="phone" name="phone" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full pl-10 pr-3 py-2.5 bg-white/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 dark:text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition-all shadow-inner focus:shadow-[0_0_15px_rgba(168,85,247,0.2)]" />
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label htmlFor="status" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 transition-colors">Status</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">⚡</span>
                  <select id="status" name="status" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full pl-10 pr-3 py-2.5 bg-white/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 dark:text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition-all shadow-inner focus:shadow-[0_0_15px_rgba(168,85,247,0.2)] appearance-none">
                    <option className="bg-slate-900" value="Active">Active</option>
                    <option className="bg-slate-900" value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex-1">
                <label htmlFor="spend" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 transition-colors">Total Spend</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">₹</span>
                  <input type="number" id="spend" name="spend" step="0.01" value={formData.spend} onChange={(e) => setFormData({...formData, spend: e.target.value})} className="w-full pl-9 pr-3 py-2.5 bg-white/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 dark:text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition-all shadow-inner focus:shadow-[0_0_15px_rgba(168,85,247,0.2)]" />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 transition-colors">Tags (comma separated)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">🏷️</span>
                <input type="text" id="tags" name="tags" value={formData.tags} onChange={(e) => setFormData({...formData, tags: e.target.value})} placeholder="e.g. VIP, Wholesale" className="w-full pl-10 pr-3 py-2.5 bg-white/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 dark:text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition-all shadow-inner focus:shadow-[0_0_15px_rgba(168,85,247,0.2)]" />
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 transition-colors">Notes</label>
              <textarea id="notes" name="notes" rows="3" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} className="w-full px-3 py-2.5 bg-white/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 dark:text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition-all shadow-inner focus:shadow-[0_0_15px_rgba(168,85,247,0.2)]" />
            </div>
          </div>

          <div className="px-6 py-5 border-t border-white/10 bg-white/5 dark:bg-white/5 flex justify-end gap-3 transition-colors backdrop-blur-md">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 rounded-xl hover:bg-white/80 dark:hover:bg-white/10 transition-colors">Cancel</button>
            <button type="submit" className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-500 rounded-xl hover:shadow-[0_0_20px_rgba(236,72,153,0.5)] transition-all transform hover:scale-105">Save Changes</button>
          </div>
        </form>

      </div>
    </div>,
    document.getElementById('PopModal')
  );
};

export default EditCustomerModal;