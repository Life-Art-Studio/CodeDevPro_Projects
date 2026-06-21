import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateInvoicePDF } from '../../utils/generatePdf'; 
import { calculateOrderTotal, getOrderPaidAmount } from '../../utils/financeUtils';
import PaymentModal from './PaymentModal';
import { useAuth } from '../../context/AuthContext';
import ResponsiveTable from '../ui/ResponsiveTable';
import StatusBadge from '../ui/StatusBadge';
import CustomSelect from '../ui/CustomSelect';
import { Plus, CreditCard, FileText, Edit2, Trash2, PackageSearch, Eye, Receipt } from 'lucide-react';

const OrderList = ({ orders, customer, distributors = [], superStockists = [], users = [], onCreateNew, onEdit, onDelete, onStatusChange, defaultFilter, onRecordPayment }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [filterStatus, setFilterStatus] = useState(defaultFilter || "All");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentTargetOrder, setPaymentTargetOrder] = useState(null);

  const filteredOrders = filterStatus === "All" ? orders : orders.filter(o => o.status === filterStatus);

  const columns = [
    { key: "id", label: "Order ID" },
    { key: "date", label: "Date" },
    { key: "status", label: "Status" },
    { key: "total", label: "Total Amount" },
    { key: "actions", label: "Actions", align: "right" },
  ];

  const renderStatusDropdown = (order) => (
    <div onClick={(e) => e.stopPropagation()}>
      <CustomSelect
        value={order.status}
        onChange={(newStatus) => {
          if (newStatus === 'Paid' && order.status !== 'Paid') {
            toast((t) => (
              <form onSubmit={(e) => {
                e.preventDefault();
                const mode = e.target.elements.mode.value;
                toast.dismiss(t.id);
                if (mode) {
                  onStatusChange(order.id, newStatus, mode);
                }
              }} className="flex flex-col gap-3">
                <span className="font-semibold text-sm">Enter Payment Mode (Cash, UPI, Cheque):</span>
                <input name="mode" defaultValue="Cash" className="border border-zinc-200 dark:border-zinc-700 rounded px-2 py-1 bg-white dark:bg-zinc-800 text-sm" autoFocus />
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => toast.dismiss(t.id)} className="px-3 py-1 bg-zinc-200 dark:bg-zinc-700 rounded text-xs">Cancel</button>
                  <button type="submit" className="px-3 py-1 bg-indigo-600 text-white rounded text-xs font-semibold hover:bg-indigo-700">Submit</button>
                </div>
              </form>
            ), { duration: Infinity });
          } else {
            onStatusChange(order.id, newStatus);
          }
        }}
        className="px-3 py-1.5 sm:py-1 rounded-xl sm:rounded-full text-[11px] sm:text-xs font-semibold border outline-none focus:ring-2 focus:ring-indigo-500 transition-colors w-[120px] bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 flex items-center justify-between cursor-pointer"
        options={[
          { value: 'Pending', label: 'Pending' },
          { value: 'Partially Paid', label: 'Partially Paid' },
          { value: 'Processing', label: 'Processing' },
          { value: 'Shipped', label: 'Shipped' },
          { value: 'Delivered', label: 'Delivered' },
          { value: 'Paid', label: 'Paid' },
          { value: 'Cancelled', label: 'Cancelled' }
        ]}
      />
    </div>
  );

  const rowData = filteredOrders.map(order => {
    const listTotal = calculateOrderTotal(order);
    const paidAmount = getOrderPaidAmount(order);
    const isPartial = paidAmount > 0 && order.status !== 'Paid';
    const progressWidth = Math.min(100, (paidAmount / listTotal) * 100) || 0;

    const fulfillerId = order.distributorId || order.distributor_id || order.owner_id;
    const fulfillerName = distributors?.find(d => d.id === fulfillerId)?.name 
      || superStockists?.find(s => s.id === fulfillerId)?.name
      || users?.find(u => u.id === fulfillerId)?.full_name
      || fulfillerId;

    return {
      _rawId: order.id,
      id: (
        <div>
           <span className="font-bold">{order.id}</span>
           {fulfillerId && (
             <div className="text-[10px] text-zinc-500 mt-1 flex items-center gap-1">
               <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 rounded font-medium">
                 {fulfillerName}
               </span>
             </div>
           )}
        </div>
      ),
      date: order.date,
      status: currentUser?.role !== 'SALES' ? (
        <StatusBadge status={order.status} />
      ) : renderStatusDropdown(order),
      total: (
        <div>
          <div className="font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
            ₹{listTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          {isPartial && (
            <div className="mt-1">
              <div className="w-24 h-1.5 bg-zinc-200 dark:bg-zinc-700/50 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${progressWidth}%` }}></div>
              </div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium tabular-nums">
                Paid: ₹{paidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          )}
        </div>
      ),
      actions: (
        <div className="flex justify-end items-center gap-1 lg:gap-2">
          {currentUser?.role === 'SALES' && order.status !== 'Paid' && order.status !== 'Cancelled' && (
            <button 
              onClick={(e) => { e.stopPropagation(); setPaymentTargetOrder(order); setIsPaymentModalOpen(true); }}
              className="p-1 lg:p-2 text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-500/10 rounded-lg transition-colors min-h-[32px] min-w-[32px] lg:min-h-[44px] lg:min-w-[44px] flex items-center justify-center"
              title="Record Payment"
            >
              <CreditCard className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
            </button>
          )}
          {currentUser?.role !== 'SALES' && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/dashboard/billing?action=create-invoice&customerId=${customer.id}&orderId=${order.id}`);
              }}
              className="p-1 lg:p-2 text-purple-600 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-500/10 rounded-lg transition-colors min-h-[32px] min-w-[32px] lg:min-h-[44px] lg:min-w-[44px] flex items-center justify-center"
              title="Generate Invoice from Order"
            >
              <Receipt className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
            </button>
          )}
          <button 
            onClick={(e) => { e.stopPropagation(); generateInvoicePDF(order, customer, currentUser); }}
            className="p-1 lg:p-2 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-500/10 rounded-lg transition-colors min-h-[32px] min-w-[32px] lg:min-h-[44px] lg:min-w-[44px] flex items-center justify-center"
            title="Download PDF"
          >
            <FileText className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
          </button>
          
          {/* View/Edit Button */}
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(order); }}
            className="p-1 lg:p-2 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 rounded-lg transition-colors min-h-[32px] min-w-[32px] lg:min-h-[44px] lg:min-w-[44px] flex items-center justify-center"
            title={currentUser?.role !== 'SALES' ? "View Details" : "Edit Order"}
          >
            {currentUser?.role !== 'SALES' ? <Eye className="w-3.5 h-3.5 lg:w-4 lg:h-4" /> : <Edit2 className="w-3.5 h-3.5 lg:w-4 lg:h-4" />}
          </button>

          {/* Delete Button (Only for Non-Admins) */}
          {currentUser?.role === 'SALES' && (
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(order.id); }}
              className="p-1 lg:p-2 text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 rounded-lg transition-colors min-h-[32px] min-w-[32px] lg:min-h-[44px] lg:min-w-[44px] flex items-center justify-center"
              title="Delete Order"
            >
              <Trash2 className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
            </button>
          )}
        </div>
      )
    };
  });

  const renderMobileCard = (row, index) => {
    const order = filteredOrders[index];
    const listTotal = calculateOrderTotal(order);
    const paidAmount = getOrderPaidAmount(order);
    const isPartial = paidAmount > 0 && order.status !== 'Paid';

    const fulfillerId = order.distributorId || order.distributor_id || order.owner_id;
    const fulfillerName = distributors?.find(d => d.id === fulfillerId)?.name 
      || superStockists?.find(s => s.id === fulfillerId)?.name
      || users?.find(u => u.id === fulfillerId)?.full_name
      || fulfillerId;

    return (
      <div key={row.id} className="bg-white dark:bg-[#1a1d27] p-3 lg:p-4 border-b border-zinc-200 dark:border-zinc-800 space-y-2 lg:space-y-3">
        <div className="flex justify-between items-start">
           <div>
             <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm lg:text-base">{order.id}</span>
             {fulfillerId && (
               <div className="text-[10px] text-zinc-500 my-0.5">
                 <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 rounded font-medium">
                   {fulfillerName}
                 </span>
               </div>
             )}
             <p className="text-[10px] lg:text-xs text-zinc-500">{order.date}</p>
           </div>
           <div className="scale-90 origin-top-right lg:scale-100">{row.status}</div>
        </div>
        
        <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50 p-2 lg:p-3 rounded-xl border border-zinc-100 dark:border-zinc-800/50">
           <div>
             <p className="text-[9px] lg:text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Total Amount</p>
             <p className="font-bold text-zinc-900 dark:text-zinc-100 text-base lg:text-lg tabular-nums leading-none mt-1">
               ₹{listTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
             </p>
             {isPartial && <p className="text-[10px] lg:text-xs text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">Paid: ₹{paidAmount.toLocaleString('en-IN')}</p>}
           </div>
           <div>{row.actions}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 lg:gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <CustomSelect 
            value={filterStatus} 
            onChange={setFilterStatus}
            className="w-full sm:w-auto px-3 lg:px-4 py-1.5 lg:py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-[#1a1d27] text-xs lg:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors min-h-[36px] lg:min-h-[44px] flex items-center justify-between outline-none cursor-pointer"
            options={[
              { value: 'All', label: 'All Statuses' },
              { value: 'Pending', label: 'Pending' },
              { value: 'Partially Paid', label: 'Partially Paid' },
              { value: 'Processing', label: 'Processing' },
              { value: 'Shipped', label: 'Shipped' },
              { value: 'Delivered', label: 'Delivered' },
              { value: 'Paid', label: 'Paid' },
              { value: 'Cancelled', label: 'Cancelled' }
            ]}
            minWidth="140px"
          />
        </div>
        {currentUser?.role === 'SALES' && (
          <button onClick={onCreateNew} className="w-full sm:w-auto bg-indigo-600 text-white px-4 lg:px-5 py-2 lg:py-2.5 rounded-xl text-xs lg:text-sm font-semibold hover:bg-indigo-700 shadow-sm flex items-center justify-center gap-1.5 lg:gap-2 transition-colors min-h-[36px] lg:min-h-[44px]">
            <Plus className="w-3.5 h-3.5 lg:w-4 lg:h-4" /> New Order
          </button>
        )}
      </div>

      <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden transition-colors bg-white dark:bg-[#1a1d27]">
        {filteredOrders.length > 0 ? (
          <ResponsiveTable 
            keyField="_rawId"
            columns={columns}
            data={rowData}
            renderMobileCard={renderMobileCard}
            onRowClick={(row) => {
              const order = filteredOrders.find(o => o.id === row._rawId);
              if (order) onEdit(order);
            }}
          />
        ) : (
          <div className="py-12 text-center text-zinc-500 dark:text-zinc-400 flex flex-col items-center justify-center">
            <PackageSearch className="w-12 h-12 mb-4 text-zinc-300 dark:text-zinc-600" />
            <p className="mb-4 font-medium text-zinc-600 dark:text-zinc-300">No orders found.</p>
            {currentUser?.role !== 'ADMIN' && (
              <button onClick={onCreateNew} className="bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors min-h-[44px]">
                Create First Order
              </button>
            )}
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
