import React, { useState, useEffect } from "react";
import CustomerHeader from "../components/CustomerDetail/CustomerHeader";
import OrderList from "../components/CustomerDetail/OrderList";
import OrderBuilder from "../components/CustomerDetail/OrderBuilder";
import FinancialsTab from "../components/CustomerDetail/FinancialsTab";
import ReportsTab from "../components/CustomerDetail/ReportsTab";
import useOrderContext from "../context/OrderContext";
import { useVisitContext } from "../context/VisitContext";
import { useBeatContext } from "../context/BeatContext";
import LogVisitModal from "../components/Beats/LogVisitModal";
import StorageService from "../services/storageService";
import toast from 'react-hot-toast';
import { calculateOrderTotal, getOrderPaidAmount, deriveOrderStatus } from "../utils/financeUtils";

const CustomerDetail = ({ customer, onBack, defaultOrderId, defaultOrderFilter }) => {
  const [activeTab, setActiveTab] = useState("orders");
  const [orderView, setOrderView] = useState("list");
  const [activeOrder, setActiveOrder] = useState(null);
  const [isLogVisitModalOpen, setIsLogVisitModalOpen] = useState(false);
  const [visitToEdit, setVisitToEdit] = useState(null);

  const { orders, addOrder, deleteOrder, updateOrder } = useOrderContext();
  const { visits, addVisit, updateVisit } = useVisitContext();
  const { beats } = useBeatContext();

  // IMPORTANT: Filter global orders to ONLY show ones for THIS customer
  const customerOrders = orders.filter(
    (order) => order.customerId === customer.id,
  );

  const customerVisits = visits.filter(v => v.customerId === customer.id)
    .sort((a, b) => new Date(b.visitDate) - new Date(a.visitDate));

  // --- ROUTING / VIEW FUNCTIONS ---

  useEffect(() => {
    if (defaultOrderId) {
      const orderToEdit = orders.find(o => o.id === defaultOrderId && o.customerId === customer.id);
      if (orderToEdit) {
        handleEditOrder(orderToEdit);
      }
    }
  }, [defaultOrderId, orders, customer.id]);
 

  const handleCreateNewOrder = () => {
    setActiveOrder({
      id: StorageService.getNextInvoiceNumber(),
      customerId: customer.id, // <-- NEW: Tag the order to this specific customer!
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
      status: "Pending",
      globalDiscount: "",
      items: [
        { id: Date.now(), name: "", qty: 1, price: "", discount: "", gst: 18 },
      ],
    });
    setOrderView("edit");
  };

  const handleEditOrder = (orderToEdit) => {
    setActiveOrder(JSON.parse(JSON.stringify(orderToEdit)));
    setOrderView("edit");
  };

  const handleSaveOrder = (completedOrder) => {
    // Check against global orders
    const isExisting = orders.find((o) => o.id === completedOrder.id);

    if (isExisting) {
      updateOrder(completedOrder.id, completedOrder);
    } else {
      addOrder(completedOrder);
    }

    setOrderView("list");
  };

  const handleDeleteOrder = (orderId) => {
    toast((t) => (
      <div className="flex flex-col gap-2">
        <span className="font-semibold text-sm">Are you sure you want to delete order {orderId}? This cannot be undone.</span>
        <div className="flex gap-2 justify-end mt-2">
          <button 
            onClick={() => {
              toast.dismiss(t.id);
              deleteOrder(orderId);
              toast.success("Order deleted.");
            }}
            className="bg-red-500 text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-red-600 transition-colors"
          >Delete</button>
          <button onClick={() => toast.dismiss(t.id)} className="bg-slate-200 dark:bg-slate-700 px-3 py-1 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">Cancel</button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  const handleStatusChange = (orderId, newStatus) => {
    const orderToUpdate = orders.find(o => o.id === orderId);
    if (orderToUpdate) {
      updateOrder(orderId, { ...orderToUpdate, status: newStatus });
      toast.success(`Order ${orderId} marked as ${newStatus}`);
    }
  };

  const handleRecordPayment = (orderId, paymentData) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const orderTotal = calculateOrderTotal(order);
    const existingPaid = getOrderPaidAmount(order);
    const newPaidAmount = existingPaid + paymentData.amount;
    
    const newPayments = [
      ...(order.payments || []), 
      { 
        id: 'PAY-' + Date.now(), 
        amount: paymentData.amount,
        method: paymentData.method,
        note: paymentData.note,
        date: paymentData.date
      }
    ];
    
    const mockOrder = { ...order, payments: newPayments, paidAmount: newPaidAmount };
    const newStatus = deriveOrderStatus(mockOrder);

    updateOrder(orderId, {
      ...order,
      payments: newPayments,
      paidAmount: newPaidAmount,
      status: newStatus
    });

    toast.success(`Recorded ₹${paymentData.amount.toLocaleString('en-IN')} payment for ${orderId}`);
  };

  const handleSaveVisit = (visitData) => {
    if (visitData.id) {
      updateVisit(visitData.id, visitData);
    } else {
      addVisit(visitData);
    }
  };

  const renderVisitsTab = () => {
    const totalVisits = customerVisits.length;
    const visitedCount = customerVisits.filter(v => v.status === 'Visited').length;
    const missedCount = customerVisits.filter(v => v.status === 'Missed').length;
    const scheduledCount = customerVisits.filter(v => v.status === 'Scheduled').length;
    const visitRate = (visitedCount + missedCount) > 0 ? (visitedCount / (visitedCount + missedCount)) * 100 : 0;
    
    let daysSinceLast = 'N/A';
    const visitedDates = customerVisits.filter(v => v.status === 'Visited').map(v => new Date(v.visitDate).getTime());
    if (visitedDates.length > 0) {
      const lastVisit = Math.max(...visitedDates);
      const diffTime = Math.abs(new Date() - lastVisit);
      daysSinceLast = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }

    return (
      <div className="flex flex-col md:flex-row gap-6 animate-in fade-in h-full">
        {/* LEFT: Timeline List */}
        <div className="w-full md:w-2/3 flex flex-col h-full">
          <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Visit History</h3>
            <button 
              onClick={() => { setVisitToEdit(null); setIsLogVisitModalOpen(true); }}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors w-full sm:w-auto"
            >
              Schedule Visit
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2 pb-10">
            {customerVisits.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No visits recorded.</p>
            ) : (
              customerVisits.map(visit => {
                const beat = beats.find(b => b.id === visit.beatId);
                return (
                  <div key={visit.id} className={`p-4 rounded-xl glass-panel border-l-4 transition-all relative ${
                    visit.status === 'Visited' ? 'border-l-emerald-500' :
                    visit.status === 'Missed' ? 'border-l-red-500' :
                    'border-l-amber-500'
                  }`}>
                    <button 
                      onClick={() => { setVisitToEdit(visit); setIsLogVisitModalOpen(true); }}
                      className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-purple-600 bg-white/50 dark:bg-slate-800/50 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                    </button>
                    <div className="flex justify-between items-start mb-2 pr-8">
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-100">{visit.visitDate} • {visit.visitTime}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{beat ? beat.name : 'No Beat'}</p>
                      </div>
                      <span className={`px-2 py-1 text-[10px] uppercase font-bold rounded-full ${
                        visit.status === 'Visited' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                        visit.status === 'Missed' ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' :
                        'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                      }`}>
                        {visit.status}
                      </span>
                    </div>
                    {visit.notes && <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">{visit.notes}</p>}
                    {visit.nextVisitDate && (
                      <p className="text-xs text-purple-600 dark:text-purple-400 mt-2 font-medium">
                        📅 Next Visit: {visit.nextVisitDate}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT: Mini Stats Panel */}
        <div className="w-full md:w-1/3">
          <div className="glass-panel p-5 rounded-2xl border border-slate-200/50 dark:border-white/10 sticky top-0">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4 uppercase tracking-wider">Visit Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-500 uppercase">Total Visits</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">{totalVisits}</span>
              </div>
              <div className="flex justify-between items-center bg-emerald-50 dark:bg-emerald-500/10 p-3 rounded-xl border border-emerald-200 dark:border-emerald-500/30">
                <span className="text-xs font-semibold text-emerald-600 uppercase">Visited</span>
                <span className="font-bold text-emerald-600">{visitedCount}</span>
              </div>
              <div className="flex justify-between items-center bg-red-50 dark:bg-red-500/10 p-3 rounded-xl border border-red-200 dark:border-red-500/30">
                <span className="text-xs font-semibold text-red-600 uppercase">Missed</span>
                <span className="font-bold text-red-600">{missedCount}</span>
              </div>
              <div className="flex justify-between items-center bg-amber-50 dark:bg-amber-500/10 p-3 rounded-xl border border-amber-200 dark:border-amber-500/30">
                <span className="text-xs font-semibold text-amber-600 uppercase">Scheduled</span>
                <span className="font-bold text-amber-600">{scheduledCount}</span>
              </div>
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-500 uppercase">Visit Rate</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{visitRate.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className={`h-full ${visitRate >= 70 ? 'bg-emerald-500' : visitRate >= 40 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${visitRate}%` }}></div>
                </div>
              </div>
              <div className="pt-2">
                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Days Since Last Visit</p>
                <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{daysSinceLast}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto h-full p-4 sm:p-6 lg:p-8 animate-in slide-in-from-right-8 duration-500 transition-colors w-full">
      <div className="flex flex-col h-full max-w-7xl mx-auto">
        {/* --- HEADER --- */}
      <CustomerHeader customer={customer} orders={customerOrders} onBack={onBack} />

      {/* --- TAB NAVIGATION --- */}
      <div className="flex gap-2 mb-6 border-b border-white/10 pb-px transition-colors overflow-x-auto custom-scrollbar shrink-0">
        {["orders", "visits", "financials", "reports"].map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setOrderView("list");
            }}
            className={`px-6 py-2.5 text-sm font-semibold capitalize rounded-t-xl transition-all whitespace-nowrap ${
              activeTab === tab
                ? "bg-white/10 dark:bg-white/10 text-purple-600 dark:text-purple-400 border-t border-x border-white/20 border-b-transparent backdrop-blur-md shadow-[0_-5px_15px_rgba(168,85,247,0.15)] -mb-px relative z-10"
                : "text-slate-500 dark:text-slate-400 hover:text-pink-500 dark:hover:text-pink-400 hover:bg-white/5 border border-transparent"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* --- TAB CONTENT --- */}
      <div className="flex-1 glass-panel rounded-2xl rounded-tl-none p-4 sm:p-6 transition-colors relative z-0">
        {/* ========================================== */}
        {/* ORDERS TAB                                 */}
        {/* ========================================== */}
        {activeTab === "orders" && (
          <div className="animate-in fade-in duration-300">
            {orderView === "list" ? (
              <OrderList
                orders={customerOrders} // <-- Pass only this customer's orders!
                onCreateNew={handleCreateNewOrder}
                onEdit={handleEditOrder}
                onDelete={handleDeleteOrder}
                customer={customer}
                onStatusChange={handleStatusChange}
                defaultFilter={defaultOrderFilter}
                onRecordPayment={handleRecordPayment}
              />
            ) : (
              <OrderBuilder
                initialOrder={activeOrder}
                onSave={handleSaveOrder}
                onCancel={() => setOrderView("list")}
              />
            )}
          </div>
        )}

        {/* ========================================== */}
        {/* VISITS TAB                                 */}
        {/* ========================================== */}
        {activeTab === "visits" && renderVisitsTab()}

        {/* ========================================== */}
        {/* FINANCIALS TAB                             */}
        {/* ========================================== */}
        {activeTab === "financials" && (
          <FinancialsTab orders={customerOrders} /> // <-- Pass only this customer's orders!
        )}

        {/* ========================================== */}
        {/* REPORTS TAB                                */}
        {/* ========================================== */}
        {activeTab === "reports" && (
          <ReportsTab orders={customerOrders} /> // <-- Pass only this customer's orders!
        )}
      </div>

      <LogVisitModal 
        isOpen={isLogVisitModalOpen}
        onClose={() => setIsLogVisitModalOpen(false)}
        onSubmit={handleSaveVisit}
        fixedCustomerId={customer.id}
        initialData={visitToEdit}
      />
      </div>
    </div>
  );
};

export default CustomerDetail;
