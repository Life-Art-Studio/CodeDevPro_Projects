import React, { useState } from 'react';
import { calculateOrderTotal, getOrderPaidAmount, getOrderOutstanding } from '../../utils/financeUtils';
import { ArrowLeft, User, Phone, MapPin } from 'lucide-react';

const CustomerHeader = ({ customer, orders = [], onBack }) => {
  const validOrders = orders.filter(order => order.status !== 'Cancelled');
  const totalBilled = validOrders.reduce((sum, order) => sum + calculateOrderTotal(order), 0);
  const totalReceived = orders.reduce((sum, order) => sum + getOrderPaidAmount(order), 0);
  const totalOutstanding = validOrders.reduce((sum, order) => sum + getOrderOutstanding(order), 0);
  
  const [isBalanceExpanded, setIsBalanceExpanded] = useState(false);

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-3 mb-6 md:mb-6 bg-white dark:bg-[#1a1d27] p-2 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 transition-colors relative">
      <div className="flex items-center md:items-start gap-2 sm:gap-4 w-full md:w-auto">
        <button onClick={onBack} className="p-1.5 sm:p-2 text-zinc-500 hover:text-zinc-900 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 rounded-lg transition-colors shrink-0 flex items-center justify-center">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-[clamp(1rem,4vw,1.5rem)] leading-tight font-bold text-zinc-900 dark:text-zinc-100 transition-colors flex flex-wrap items-center gap-2 mb-0 md:mb-1 truncate">
            <span className="truncate">{customer.name}</span>
            {customer.tags && customer.tags.map(tag => (
               <span key={tag} className="text-[9px] sm:text-[10px] bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider shrink-0">{tag}</span>
            ))}
          </h1>
          
          {/* Desktop Metadata (Hidden on Mobile) */}
          <div className="hidden md:flex flex-wrap items-center gap-x-3 gap-y-1 text-xs md:text-sm text-zinc-500 dark:text-zinc-400 transition-colors mb-1 sm:mb-2 mt-1">
            <span className="flex items-center gap-1 shrink-0"><User className="w-3.5 h-3.5" /> ID: {customer.id}</span>
            {customer.phone && <span className="flex items-center gap-1 shrink-0"><Phone className="w-3.5 h-3.5" /> {customer.phone}</span>}
            {customer.location && <span className="flex items-center gap-1 shrink-0"><MapPin className="w-3.5 h-3.5" /> {customer.location}</span>}
          </div>
          {customer.notes && (
            <p className="hidden md:block text-[11px] sm:text-xs text-zinc-600 dark:text-zinc-300 italic max-w-2xl line-clamp-1 sm:line-clamp-none">{customer.notes}</p>
          )}
        </div>
      </div>
      
      {/* Mobile Toggle Pull Tab */}
      <button 
        onClick={() => setIsBalanceExpanded(!isBalanceExpanded)}
        className="md:hidden absolute -bottom-4 left-1/2 -translate-x-1/2 w-10 h-10 flex items-center justify-center z-20 cursor-pointer text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
      >
        <svg className={`w-5 h-5 transition-transform duration-300 ${isBalanceExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
      </button>

      {/* Expanded Details & Balance Section */}
      <div className={`w-full md:w-auto pt-3 md:pt-0 pb-4 md:pb-0 border-t md:border-t-0 border-zinc-100 dark:border-zinc-800 ${isBalanceExpanded ? 'block animate-in fade-in duration-300' : 'hidden md:block'}`}>
        
        {/* Mobile-only Metadata (visible when expanded) */}
        <div className="md:hidden flex flex-col gap-1.5 mb-3 pb-3 border-b border-zinc-100 dark:border-zinc-800/50">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-zinc-500 dark:text-zinc-400 transition-colors">
            <span className="flex items-center gap-1 shrink-0"><User className="w-3 h-3" /> ID: {customer.id}</span>
            {customer.phone && <span className="flex items-center gap-1 shrink-0"><Phone className="w-3 h-3" /> {customer.phone}</span>}
            {customer.location && <span className="flex items-center gap-1 shrink-0"><MapPin className="w-3 h-3" /> {customer.location}</span>}
          </div>
          {customer.notes && (
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 italic line-clamp-2">{customer.notes}</p>
          )}
        </div>

        <div className="text-left md:text-right">
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-bold mb-1 transition-colors">Outstanding Balance</p>
          <p className="text-[clamp(1.2rem,5vw,1.875rem)] leading-tight font-bold text-amber-600 dark:text-amber-500 transition-colors tabular-nums tracking-tight">₹{totalOutstanding.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <div className="flex flex-wrap md:justify-end gap-4 mt-2">
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
              Billed <span className="text-[clamp(0.8rem,3.5vw,1rem)] font-bold text-zinc-900 dark:text-zinc-100 block mt-0.5">₹{totalBilled.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </p>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium border-l border-zinc-200 dark:border-zinc-800 pl-4">
              Received <span className="text-[clamp(0.8rem,3.5vw,1rem)] font-bold text-emerald-600 block mt-0.5">₹{totalReceived.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerHeader;