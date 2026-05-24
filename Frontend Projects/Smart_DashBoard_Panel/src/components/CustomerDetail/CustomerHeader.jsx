import React from 'react';
import { calculateOrderTotal, getOrderPaidAmount, getOrderOutstanding } from '../../utils/financeUtils';

const CustomerHeader = ({ customer, orders = [], onBack }) => {
  const validOrders = orders.filter(order => order.status !== 'Cancelled');
  const totalBilled = validOrders.reduce((sum, order) => sum + calculateOrderTotal(order), 0);
  const totalReceived = orders.reduce((sum, order) => sum + getOrderPaidAmount(order), 0);
  const totalOutstanding = validOrders.reduce((sum, order) => sum + getOrderOutstanding(order), 0);
  
  return (
    <div className="flex items-center justify-between mb-6 bg-white dark:bg-slate-900/50 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 backdrop-blur-sm transition-colors">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 transition-colors flex items-center gap-2">
            {customer.name}
            {customer.tags && customer.tags.map(tag => (
              <span key={tag} className="text-[10px] bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 px-2 py-0.5 rounded-full font-bold uppercase">{tag}</span>
            ))}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 transition-colors mb-1">ID: {customer.id} | {customer.email}</p>
          {customer.notes && (
            <p className="text-xs text-slate-600 dark:text-slate-300 italic">{customer.notes}</p>
          )}
        </div>
      </div>
      <div className="text-right">
        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold mb-0.5 transition-colors">Outstanding Balance</p>
        <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 transition-colors">₹{totalOutstanding.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        <div className="flex justify-end gap-3 mt-1">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Billed: <span className="font-bold">₹{totalBilled.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </p>
          <p className="text-xs text-teal-600 dark:text-teal-400 font-medium">
            Received: <span className="font-bold">₹{totalReceived.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomerHeader;