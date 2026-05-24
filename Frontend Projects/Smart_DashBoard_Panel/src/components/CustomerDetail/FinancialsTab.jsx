import React from 'react';
import { calculateOrderTotal, formatCurrency, getOrderPaidAmount, getOrderOutstanding } from '../../utils/financeUtils';

const FinancialsTab = ({ orders = [] }) => {
  const totalInbound = orders.reduce((sum, o) => sum + getOrderPaidAmount(o), 0);
  
  const cancelledOrders = orders.filter(o => o.status === 'Cancelled');
  const totalRefunds = cancelledOrders.reduce((sum, o) => sum + calculateOrderTotal(o), 0);

  const nonCancelledOrders = orders.filter(o => o.status !== 'Cancelled');
  const totalOutstanding = nonCancelledOrders.reduce((sum, o) => sum + getOrderOutstanding(o), 0);

  const allPayments = orders.flatMap(order => 
    (order.payments || []).map(p => ({ ...p, orderId: order.id, orderTotal: calculateOrderTotal(order) }))
  ).sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="space-y-6 animate-in fade-in">
      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 transition-colors">Financial Overview</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="glass-panel p-4 rounded-xl border border-slate-200/50 dark:border-white/5 transition-colors">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Total Inbound</p>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">+₹{formatCurrency(totalInbound)}</p>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-slate-200/50 dark:border-white/5 transition-colors">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Total Outbound/Refunds</p>
          <p className="text-xl font-bold text-red-600 dark:text-red-400">-₹{formatCurrency(totalRefunds)}</p>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-slate-200/50 dark:border-white/5 transition-colors">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Outstanding Balance</p>
          <p className="text-xl font-bold text-amber-600 dark:text-amber-400">₹{formatCurrency(totalOutstanding)}</p>
        </div>
      </div>

      <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden transition-colors">
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 transition-colors">
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Payment Ledger</h4>
        </div>
        <div className="w-full overflow-x-auto scrollbar-hide">
          <table className="w-full text-left text-sm border-collapse min-w-[600px]">
            <thead className="bg-white dark:bg-[#0a0c14]/50 border-b border-slate-200 dark:border-slate-800 transition-colors">
              <tr className="text-slate-500 dark:text-slate-400">
                <th className="py-3 px-4 font-semibold uppercase tracking-wider text-xs whitespace-nowrap">Date</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider text-xs whitespace-nowrap">Order ID</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider text-xs whitespace-nowrap">Method</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider text-xs whitespace-nowrap">Amount</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider text-xs whitespace-nowrap">Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 bg-white/50 dark:bg-[#0a0c14]/20 transition-colors">
              {allPayments.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-500 dark:text-slate-400">
                    No payments recorded yet.
                  </td>
                </tr>
              ) : (
                allPayments.map(payment => (
                  <tr key={payment.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">{payment.date}</td>
                    <td className="py-3 px-4 font-medium text-purple-600 dark:text-purple-400 whitespace-nowrap">{payment.orderId}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      <span className="px-2 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">{payment.method}</span>
                    </td>
                    <td className="py-3 px-4 font-bold text-teal-600 dark:text-teal-400 whitespace-nowrap">₹{formatCurrency(payment.amount)}</td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 text-xs">{payment.note || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FinancialsTab;