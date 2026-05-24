import React, { useState } from 'react';
import { generateInvoicePDF } from '../../utils/generatePdf'; 
import { calculateOrderTotal, getOrderPaidAmount, getOrderOutstanding } from '../../utils/financeUtils';
import PaymentModal from './PaymentModal';

// Added onStatusChange to props
const OrderList = ({ orders, customer, onCreateNew, onEdit, onDelete, onStatusChange, defaultFilter, onRecordPayment }) => {

  // --- NEW: Color Coded Status Helper ---
  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid': return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50';
      case 'Pending': return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50';
      case 'Partially Paid': return 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-800/50';
      case 'Processing': return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50';
      case 'Shipped': return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800/50';
      case 'Delivered': return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800/50';
      case 'Cancelled': return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50';
      default: return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };
    
  const [filterStatus, setFilterStatus] = useState(defaultFilter || "All");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentTargetOrder, setPaymentTargetOrder] = useState(null);

  const filteredOrders = filterStatus === "All" ? orders : orders.filter(o => o.status === filterStatus);

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 transition-colors">Order History</h3>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Partially Paid">Partially Paid</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Paid">Paid</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
        <button onClick={onCreateNew} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 shadow-sm flex items-center gap-2 transition-colors">
          <span>➕</span> New Order
        </button>
      </div>

      <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden transition-colors -mx-4 sm:mx-0">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse min-w-[600px]">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 transition-colors">
              <tr className="text-slate-500 dark:text-slate-400">
                <th className="py-3 px-4 font-semibold uppercase tracking-wider text-xs whitespace-nowrap">Order ID</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider text-xs whitespace-nowrap">Date</th>
              <th className="py-3 px-4 font-semibold uppercase tracking-wider text-xs">Status</th>
              <th className="py-3 px-4 font-semibold uppercase tracking-wider text-xs">Total Amount</th>
              <th className="py-3 px-4 font-semibold uppercase tracking-wider text-xs text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
            {filteredOrders.map(order => {
               
               // Look how clean this is now! 
               // Just one line calling our utility function.
               const listTotal = calculateOrderTotal(order);
               const paidAmount = getOrderPaidAmount(order);
               const isPartial = paidAmount > 0 && order.status !== 'Paid';
               const progressWidth = Math.min(100, (paidAmount / listTotal) * 100) || 0;

               return (
                <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">{order.id}</td>
                  <td className="py-3 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">{order.date}</td>
                  <td className="py-3 px-4">
                    
                    {/* --- NEW: Interactive Status Dropdown --- */}
                    <select
                      value={order.status}
                      onChange={(e) => onStatusChange(order.id, e.target.value)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold border appearance-none cursor-pointer outline-none focus:ring-2 focus:ring-blue-500 transition-colors min-w-[110px] ${getStatusColor(order.status)}`}
                      style={{ 
                        // Adds a tiny custom dropdown arrow via CSS
                        backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E")`, 
                        backgroundRepeat: 'no-repeat', 
                        backgroundPosition: 'right 0.4rem center', 
                        backgroundSize: '1em',
                        paddingRight: '1.5rem' // Make room for the arrow
                      }}
                    >
                      <option className="dark:bg-slate-900" value="Pending">Pending</option>
                      <option className="dark:bg-slate-900" value="Partially Paid">Partially Paid</option>
                      <option className="dark:bg-slate-900" value="Processing">Processing</option>
                      <option className="dark:bg-slate-900" value="Shipped">Shipped</option>
                      <option className="dark:bg-slate-900" value="Delivered">Delivered</option>
                      <option className="dark:bg-slate-900" value="Paid">Paid</option>
                      <option className="dark:bg-slate-900" value="Cancelled">Cancelled</option>
                    </select>

                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-800 dark:text-slate-100">
                      ₹{listTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    {isPartial && (
                      <div className="mt-1">
                        <div className="w-24 h-1.5 bg-slate-200 dark:bg-slate-700/50 rounded-full overflow-hidden">
                          <div className="h-full bg-teal-500 rounded-full transition-all" style={{ width: `${progressWidth}%` }}></div>
                        </div>
                        <div className="text-[10px] text-teal-600 dark:text-teal-400 mt-0.5 font-medium">
                          Paid: ₹{paidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    
                    {order.status !== 'Paid' && order.status !== 'Cancelled' && (
                      <button 
                        onClick={() => {
                          setPaymentTargetOrder(order);
                          setIsPaymentModalOpen(true);
                        }} 
                        className="text-teal-600 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 font-medium px-3 py-1 bg-teal-50 dark:bg-teal-900/30 hover:bg-teal-100 dark:hover:bg-teal-900/50 rounded transition-colors mr-2"
                        title="Record Payment"
                      >
                        💳 Pay
                      </button>
                    )}

                    <button 
                      onClick={() => generateInvoicePDF(order, customer)} 
                      className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-medium px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded transition-colors mr-2"
                      title="Download PDF Invoice"
                    >
                      PDF
                    </button>
                    
                    <button onClick={() => onEdit(order)} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium px-3 py-1 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded transition-colors mr-2">
                      Edit
                    </button>
                    <button onClick={() => onDelete(order.id)} className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium px-3 py-1 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 rounded transition-colors">
                      Delete
                    </button>
                  </td>
                </tr>
               )
            })}
          </tbody>
        </table>
        </div>
        {filteredOrders.length === 0 && (
          <div className="py-12 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center justify-center">
            <span className="text-4xl mb-4">📭</span>
            <p className="mb-4">No orders found.</p>
            <button onClick={onCreateNew} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 shadow-sm transition-colors">
              Create First Order
            </button>
          </div>
        )}
      </div>

      <PaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setPaymentTargetOrder(null);
        }}
        order={paymentTargetOrder}
        onRecordPayment={onRecordPayment}
      />
    </div>
  );
};

export default OrderList;