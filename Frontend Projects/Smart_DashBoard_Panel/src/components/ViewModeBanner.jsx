 import React, { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAudit } from '../context/AuditContext';
import useOrderContext from '../context/OrderContext';
import useCustomerContext from '../context/CustomerContext';
import { useVisitContext } from '../context/VisitContext';
import { calculateOrderTotal, getOrderPaidAmount } from '../utils/financeUtils';
import { useNavigate } from 'react-router-dom';

const ViewModeBanner = ({ viewAsUser }) => {
  const { setViewAsUserId } = useAuth();
  const { logAction } = useAudit();
  const { orders } = useOrderContext();
  const { customers } = useCustomerContext();
  const { visits } = useVisitContext();
  const navigate = useNavigate();

  const handleExit = () => {
    logAction("Impersonate", "Users", `Exited view mode for ${viewAsUser.name}`);
    setViewAsUserId(null);
    navigate('/dashboard');
  };

  const suggestions = useMemo(() => {
    const alerts = [];
    
    // Suggestion 1: Outstanding amount
    let outstanding = 0;
    let outstandingCustomers = new Set();
    orders.forEach(order => {
      const total = calculateOrderTotal(order);
      const paid = getOrderPaidAmount(order);
      if (total > paid && order.status !== 'Cancelled') {
        outstanding += (total - paid);
        outstandingCustomers.add(order.customerId);
      }
    });
    if (outstanding > 0) {
      alerts.push(`₹${outstanding.toLocaleString('en-IN')} outstanding from ${outstandingCustomers.size} customer(s)`);
    }

    // Suggestion 2: Inactive for 6 days
    if (orders.length > 0) {
      const sortedOrders = [...orders].sort((a, b) => new Date(b.date) - new Date(a.date));
      const lastOrder = sortedOrders[0];
      const daysSince = Math.floor((new Date() - new Date(lastOrder.date)) / (1000 * 60 * 60 * 24));
      if (daysSince > 3) {
        alerts.push(`Last order was placed ${daysSince} days ago`);
      }
    }

    // Suggestion 3: Beat compliance / Missed visits
    const missed = visits.filter(v => v.status === 'Missed').length;
    if (missed > 0) {
      alerts.push(`${missed} visits missed recently`);
    }

    return alerts;
  }, [orders, customers, visits]);

  return (
    <div className="bg-[#0f111a] border-b border-indigo-500/30 text-white z-50 shadow-sm relative animate-in slide-in-from-top-2">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/30 to-blue-900/30 opacity-50"></div>
      
      <div className="relative px-2 sm:px-4 py-1.5 flex justify-between items-center gap-2">
        {/* Left Side: Avatar & Name */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 text-white flex items-center justify-center font-bold text-[9px] shadow-md ring-1 ring-white/10 shrink-0">
            {viewAsUser.name.charAt(0)}
          </div>
          <div className="flex items-center gap-1.5 min-w-0">
            <h3 className="font-bold text-[10px] sm:text-xs truncate whitespace-nowrap">Viewing as {viewAsUser.name}</h3>
            <span className="flex items-center gap-1 text-[9px] text-emerald-400 font-medium whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </span>
          </div>
        </div>

        {/* Middle: Insights Ticker (Hidden on small mobile) */}
        {suggestions.length > 0 && (
          <div className="hidden sm:flex items-center gap-1 overflow-hidden text-[9px] sm:text-[10px] flex-1 max-w-[50%] px-4">
            <span className="font-bold text-amber-400 whitespace-nowrap">💡</span>
            <div className="flex gap-3 overflow-hidden whitespace-nowrap items-center text-slate-300">
              <span className="truncate">{suggestions.join("  •  ")}</span>
            </div>
          </div>
        )}

        {/* Right Side: Exit Button */}
        <button 
          onClick={handleExit}
          className="bg-red-500/20 hover:bg-red-500/40 text-red-100 border border-red-500/30 px-1.5 py-0.5 rounded text-[9px] font-bold transition-all flex items-center gap-1 shrink-0"
        >
          <span>✕</span> Exit
        </button>
      </div>
    </div>
  );
};

export default ViewModeBanner;
