import React, { useState, useEffect } from 'react';
import useCustomerContext from '../../context/CustomerContext';
import ReactDOM from 'react-dom';
import CustomSelect from '../../components/ui/CustomSelect';
import { useAuth } from "../../context/AuthContext";

// We accept the specific customer data as a prop!
const EditCustomerModal = ({ isOpen, onClose, customer }) => {
  const { updateCustomer } = useCustomerContext();
  const { currentUser, users } = useAuth();
  
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
    notes: '',
    owner_id: ''
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
        notes: customer.notes || '',
        owner_id: customer.owner_id || ''
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
      ...customer,
      ...formData,
      owner_id: formData.owner_id || currentUser?.id,
      spend: `₹${parseFloat(formData.spend || 0).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : []
    };

    updateCustomer(updatedCustomerData);
    onClose();
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-[#0a0c14]/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-[#1a1d27] flex flex-col max-h-[calc(100dvh-2rem)] shadow-xl rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 transition-colors border border-white/20">
        
        <div className="shrink-0 px-6 py-5 border-b border-white/10 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900 transition-colors backdrop-blur-md">
          <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 transition-colors tracking-tight">Edit Customer</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-pink-500 dark:hover:text-pink-400 hover:bg-white p-2 rounded-full transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 space-y-5 overflow-y-auto overscroll-contain flex-1 custom-scrollbar">
            {/* ID Display (Read Only) */}
            <div>
               <label htmlFor="id" className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5 transition-colors">Customer ID</label>
               <input type="text" id="id" name="id" value={formData.id} readOnly className="w-full px-3 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-sm cursor-not-allowed transition-colors" />
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 transition-colors">Full Name *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">👤</span>
                <input type="text" id="name" name="name" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full pl-10 pr-3 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 dark:text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition-all shadow-inner focus:shadow-[0_0_15px_rgba(168,85,247,0.2)]" />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 transition-colors">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">✉️</span>
                <input type="email" id="email" name="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full pl-10 pr-3 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 dark:text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition-all shadow-inner focus:shadow-[0_0_15px_rgba(168,85,247,0.2)]" />
              </div>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 transition-colors">Address *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">📍</span>
                <input type="text" id="address" name="address" required value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full pl-10 pr-3 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 dark:text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition-all shadow-inner focus:shadow-[0_0_15px_rgba(168,85,247,0.2)]" />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 transition-colors">Phone *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">📱</span>
                <input type="text" id="phone" name="phone" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full pl-10 pr-3 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 dark:text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition-all shadow-inner focus:shadow-[0_0_15px_rgba(168,85,247,0.2)]" />
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label htmlFor="status" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 transition-colors">Status</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">⚡</span>
                  <CustomSelect 
                    value={formData.status} 
                    onChange={val => setFormData({...formData, status: val})} 
                    className="w-full pl-10 pr-3 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 dark:text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition-all shadow-inner focus:shadow-[0_0_15px_rgba(168,85,247,0.2)] flex items-center justify-between outline-none cursor-pointer"
                    options={[
                      { value: 'Active', label: 'Active' },
                      { value: 'Inactive', label: 'Inactive' }
                    ]}
                  />
                </div>
              </div>

              <div className="flex-1">
                <label htmlFor="spend" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 transition-colors">Total Spend</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">₹</span>
                  <input type="number" id="spend" name="spend" step="0.01" value={formData.spend} onChange={(e) => setFormData({...formData, spend: e.target.value})} className="w-full pl-9 pr-3 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 dark:text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition-all shadow-inner focus:shadow-[0_0_15px_rgba(168,85,247,0.2)]" />
                </div>
              </div>
            </div>

            {/* Sales Rep Assignment Dropdown (for DBs and above) */}
            {currentUser?.role !== 'SALES' && (
              <div>
                <label
                  htmlFor="owner_id"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 transition-colors"
                >
                  Assigned Sales Rep
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">👤</span>
                  <CustomSelect
                    value={formData.owner_id || ""}
                    onChange={(val) => setFormData({ ...formData, owner_id: val })}
                    className="w-full pl-10 pr-3 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 dark:text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition-all shadow-inner flex items-center justify-between outline-none cursor-pointer"
                    options={[
                      { value: "", label: "-- Assign to Me --" },
                      ...(users
                        ?.filter(u => u.role === 'SALES' && u.parent_id === currentUser?.id)
                        .map(u => ({ value: u.id, label: u.full_name || u.email })) || [])
                    ]}
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 transition-colors">Tags (comma separated)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">🏷️</span>
                <input type="text" id="tags" name="tags" value={formData.tags} onChange={(e) => setFormData({...formData, tags: e.target.value})} placeholder="e.g. VIP, Wholesale" className="w-full pl-10 pr-3 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 dark:text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition-all shadow-inner focus:shadow-[0_0_15px_rgba(168,85,247,0.2)]" />
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 transition-colors">Notes</label>
              <textarea id="notes" name="notes" rows="3" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 dark:text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition-all shadow-inner focus:shadow-[0_0_15px_rgba(168,85,247,0.2)]" />
            </div>
          </div>

          <div className="shrink-0 px-6 py-5 border-t border-white/10 bg-zinc-50 dark:bg-zinc-900 flex justify-end gap-3 transition-colors backdrop-blur-md">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-white dark:hover:bg-white transition-colors">Cancel</button>
            <button type="submit" className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-500 rounded-xl hover:shadow-[0_0_20px_rgba(236,72,153,0.5)] transition-all transform hover:scale-105">Save Changes</button>
          </div>
        </form>

      </div>
    </div>,
    document.getElementById('PopModal')
  );
};

export default EditCustomerModal;