import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import useCustomerContext from '../../context/CustomerContext';
import CustomSelect from '../ui/CustomSelect';
import toast from 'react-hot-toast';

// Use the standard modal target we already have in index.html
const modalRoot = document.getElementById('PopModal');

const LogVisitModal = ({ isOpen, onClose, onSubmit, beat, initialData = null, fixedCustomerId = null }) => {
  const { customers } = useCustomerContext();
  
  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toTimeString().split(' ')[0].substring(0, 5); // "HH:MM"

  const [customerId, setCustomerId] = useState(initialData?.customerId || fixedCustomerId || '');
  const [visitDate, setVisitDate] = useState(initialData?.visitDate || today);
  const [visitTime, setVisitTime] = useState(initialData?.visitTime || now);
  const [status, setStatus] = useState(initialData?.status || 'Visited');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [nextVisitDate, setNextVisitDate] = useState(initialData?.nextVisitDate || '');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!customerId) {
      toast.error('Please select a customer first');
      return;
    }
    
    onSubmit({
      id: initialData?.id,
      customerId,
      beatId: beat?.id || initialData?.beatId,
      visitDate,
      visitTime,
      status,
      notes,
      nextVisitDate
    });
    onClose();
  };

  // If beat is provided, only show assigned customers. Otherwise show all (for CustomerDetail view)
  const availableCustomers = beat 
    ? customers.filter(c => beat.assignedCustomers?.includes(c.id))
    : customers;

  const modalContent = (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative flex flex-col max-h-[calc(100dvh-2rem)] bg-white dark:bg-[#0a0c14] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-slide-up-fade">
        <div className="shrink-0 p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-white/5">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            {initialData ? 'Edit Visit' : 'Log New Visit'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-5 space-y-4 overflow-y-auto overscroll-contain flex-1 custom-scrollbar">
          {!fixedCustomerId && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Customer</label>
              <CustomSelect 
                value={customerId} 
                onChange={setCustomerId}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 outline-none focus:border-purple-500 flex items-center justify-between cursor-pointer"
                options={[
                  { value: "", label: "Select Customer" },
                  ...availableCustomers.map(c => ({ value: c.id, label: `${c.name} (${c.id})` }))
                ]}
                minWidth="100%"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Date</label>
              <input 
                type="date" 
                value={visitDate} 
                onChange={(e) => setVisitDate(e.target.value)}
                required
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Time</label>
              <input 
                type="time" 
                value={visitTime} 
                onChange={(e) => setVisitTime(e.target.value)}
                required
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Status</label>
            <div className="grid grid-cols-3 gap-2">
              {['Visited', 'Missed', 'Scheduled'].map(s => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`py-2 rounded-lg text-sm font-semibold transition-all border ${
                    status === s 
                      ? (s === 'Visited' ? 'bg-emerald-50 border-emerald-600 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-600 dark:text-emerald-400' :
                         s === 'Missed' ? 'bg-red-50 border-red-600 text-red-700 dark:bg-red-500/10 dark:border-red-600 dark:text-red-400' :
                         'bg-amber-50 border-amber-600 text-amber-700 dark:bg-amber-500/10 dark:border-amber-600 dark:text-amber-400')
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 dark:bg-slate-900/50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Notes (Optional)</label>
            <textarea 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Discussion points, follow-ups..."
              className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 outline-none focus:border-purple-500 h-20 resize-none"
            ></textarea>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Next Visit Date (Optional)</label>
            <input 
              type="date" 
              value={nextVisitDate} 
              onChange={(e) => setNextVisitDate(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 outline-none focus:border-purple-500"
            />
          </div>

          </div>
          <div className="shrink-0 p-5 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 bg-white dark:bg-[#0a0c14]">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-6 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-500 hover:shadow-lg hover:shadow-purple-500/30 transition-all">
              Save Visit
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, modalRoot);
};

export default LogVisitModal;
