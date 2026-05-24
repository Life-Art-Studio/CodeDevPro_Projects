import React from 'react';
import { useNavigate } from 'react-router-dom';
import useOrderContext from '../context/OrderContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { generateDashboardReport } from '../utils/generateReports';
import { calculateOrderTotal, formatCurrency, getOrderOutstanding } from '../utils/financeUtils';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { orders, clearAllOrders } = useOrderContext();

  // ==========================================
  // DYNAMIC METRICS
  // ==========================================
  const totalOrdersCount = orders.length;
  const navigate = useNavigate();

  const pendingOrders = orders.filter(o => o.status === "Pending" || o.status === "Partially Paid");
  const pendingTotal = pendingOrders.reduce((sum, o) => sum + getOrderOutstanding(o), 0);

  // Chart Data preparation
  const chartData = orders.reduce((acc, order) => {
    const existing = acc.find(d => d.date === order.date);
    if (existing) {
      existing.revenue += calculateOrderTotal(order);
    } else {
      acc.push({ date: order.date, revenue: calculateOrderTotal(order) });
    }
    return acc;
  }, []);

  const totalRevenue = orders.reduce((sum, order) => {
    if (order.status === "Paid") {
      return sum + calculateOrderTotal(order);
    }
    return sum;
  }, 0);

  const uniqueCustomerIds = new Set(orders.map(order => order.customerId));
  uniqueCustomerIds.delete(undefined); 
  const activeCustomersCount = uniqueCustomerIds.size;

  const recentOrders = orders.slice(0, 4);

  // ==========================================
  // RESET FUNCTIONALITY
  // ==========================================
  const handleResetDashboard = () => {
    toast((t) => (
      <div className="flex flex-col gap-2">
        <span className="font-semibold text-sm">⚠️ WARNING: Are you sure you want to reset the dashboard? This will permanently delete ALL orders across all customers. This action cannot be undone.</span>
        <div className="flex gap-2 justify-end mt-2">
          <button 
            onClick={() => {
              toast.dismiss(t.id);
              clearAllOrders();
              toast.success("Dashboard reset.");
            }}
            className="bg-red-500 text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-red-600 transition-colors"
          >Reset</button>
          <button onClick={() => toast.dismiss(t.id)} className="bg-slate-200 dark:bg-slate-700 px-3 py-1 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">Cancel</button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  // ==========================================
  // THE "EMPTY STATE" UI (NO DATA)
  // ==========================================
  if (orders.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-transparent font-sans h-full flex flex-col items-center justify-center transition-colors">
        <div className="max-w-md text-center animate-slide-up-fade glass-panel p-10 rounded-3xl">
          <div className="w-24 h-24 bg-gradient-to-tr from-purple-500/20 to-pink-500/20 text-pink-500 rounded-full flex items-center justify-center text-5xl mx-auto mb-6 shadow-[0_0_30px_rgba(236,72,153,0.3)] transition-colors animate-float">
            📊
          </div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-4 transition-colors">Welcome to your Dashboard</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed transition-colors">
            It looks like you don't have any data yet. Once you navigate to a customer and create your first order, your live revenue and analytics will automatically appear here.
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // THE "ACTIVE STATE" UI (HAS DATA)
  // ==========================================
  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-transparent font-sans h-full transition-colors animate-in fade-in duration-500">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 transition-colors tracking-tight">Overview</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">Here is what's happening with your business today.</p>
        </div>
        
        {/* ACTION BUTTONS GROUP */}
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={handleResetDashboard}
            className="flex items-center gap-2 px-4 py-2 glass-panel border-red-500/30 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium hover:bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.1)] hover:shadow-[0_0_20px_rgba(239,68,68,0.2)] transition-all"
          >
            <span>🔄</span> Reset
          </button>

         <button 
            onClick={() => generateDashboardReport(orders, { totalRevenue, totalOrdersCount, activeCustomersCount })}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl text-sm font-medium hover:shadow-[0_0_20px_rgba(236,72,153,0.4)] transition-all"
          >
            <span>📥</span> Download Report
          </button>
        </div>
      </div>

      {/* METRIC CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        
        <div className="glass-panel p-6 rounded-2xl border-b-4 border-b-emerald-500 group">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1 group-hover:text-emerald-400 transition-colors">Total Revenue</p>
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 dark:text-slate-100 neon-text group-hover:scale-105 transform origin-left transition-transform tracking-tighter">₹{formatCurrency(totalRevenue)}</h3>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-3 flex items-center gap-1 bg-emerald-500/10 inline-block px-2 py-1 rounded-md">
            <span>Live Data (Paid Only)</span>
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border-b-4 border-b-purple-500 group animate-slide-up-fade" style={{ animationDelay: '100ms' }}>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1 group-hover:text-purple-400 transition-colors">Active Buyers</p>
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 dark:text-slate-100 neon-text group-hover:scale-105 transform origin-left transition-transform tracking-tighter">{activeCustomersCount}</h3>
          <p className="text-xs text-purple-500 dark:text-purple-400 font-medium mt-3 flex items-center gap-1 bg-purple-500/10 inline-block px-2 py-1 rounded-md">
            <span>Live Data</span>
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border-b-4 border-b-pink-500 group animate-slide-up-fade" style={{ animationDelay: '200ms' }}>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1 group-hover:text-pink-400 transition-colors">Total Orders</p>
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 dark:text-slate-100 neon-text-pink group-hover:scale-105 transform origin-left transition-transform tracking-tighter">{totalOrdersCount}</h3>
          <p className="text-xs text-pink-500 dark:text-pink-400 font-medium mt-3 flex items-center gap-1 bg-pink-500/10 inline-block px-2 py-1 rounded-md">
            <span>Live Data</span>
          </p>
        </div>

        <div onClick={() => navigate('/dashboard/customers', { state: { filterStatus: 'Pending' }})}
             className="cursor-pointer glass-panel p-6 rounded-2xl border-b-4 border-b-amber-500 group animate-slide-up-fade hover:scale-[1.02] transition-transform" style={{ animationDelay: '300ms' }}>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1 group-hover:text-amber-400 transition-colors">Pending Payments</p>
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 dark:text-slate-100 neon-text group-hover:scale-105 transform origin-left transition-transform tracking-tighter">₹{formatCurrency(pendingTotal)}</h3>
          <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-3 flex items-center gap-1 bg-amber-500/10 inline-block px-2 py-1 rounded-md">
            <span>{pendingOrders.length} orders awaiting</span>
          </p>
        </div>

      </div>

      {/* MAIN CHARTS & ACTIVITY AREA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up-fade" style={{ animationDelay: '400ms' }}>
        
        <div className="lg:col-span-2 glass-panel rounded-2xl flex flex-col transition-colors overflow-hidden">
          <div className="p-6 border-b border-slate-200/50 dark:border-white/10 flex justify-between items-center bg-white/10 dark:bg-[#0a0c14]/30">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Revenue Analytics</h2>
            <select className="text-sm border border-slate-200/50 dark:border-white/10 rounded-lg text-slate-500 dark:text-slate-300 bg-white/50 dark:bg-white/5 px-3 py-1.5 outline-none focus:ring-2 focus:ring-purple-500 transition-colors backdrop-blur-md">
              <option>This Year</option>
              <option>Last Year</option>
            </select>
          </div>
          <div className="flex-1 min-h-[300px] p-6 flex items-center justify-center relative overflow-hidden">
            {/* Glowing orb behind chart */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px]"></div>
            
            <div className="w-full h-[300px] p-4 border border-dashed border-purple-500/30 rounded-xl flex items-center justify-center text-purple-400/50 bg-white/5 dark:bg-[#0a0c14]/30 backdrop-blur-sm transition-colors relative z-10">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(v) => `₹${v.toFixed(2)}`} />
                  <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-2xl flex flex-col transition-colors overflow-hidden">
          <div className="p-6 border-b border-slate-200/50 dark:border-white/10 bg-white/10 dark:bg-[#0a0c14]/30">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse-glow"></span>
              Recent Activity
            </h2>
          </div>
          <div className="p-6 flex-1 flex flex-col relative">
            <div className="space-y-6 flex-1 relative z-10">
              
              {recentOrders.map((order) => (
                <div key={order.id} 
                     onClick={() => navigate('/dashboard/customers', { state: { openCustomerId: order.customerId, openOrderId: order.id }})}
                     className="flex gap-4 items-start hover:translate-x-2 transition-all cursor-pointer p-2 -mx-2 rounded-xl hover:bg-white/10 dark:hover:bg-white/5 hover:ring-1 hover:ring-purple-500/30">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 shadow-lg ${
                    order.status === 'Paid' ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30' :
                    order.status === 'Cancelled' ? 'bg-red-500/20 text-red-500 border border-red-500/30' :
                    order.status === 'Partially Paid' ? 'bg-teal-500/20 text-teal-500 border border-teal-500/30' :
                    'bg-purple-500/20 text-purple-500 border border-purple-500/30'
                  }`}>
                    {order.status === 'Paid' ? '💰' : order.status === 'Cancelled' ? '❌' : order.status === 'Partially Paid' ? '💳' : '🛒'}
                  </div>
                  <div>
                    <p className="text-sm text-slate-800 dark:text-slate-200 transition-colors">
                      Order <span className="font-bold text-purple-500">{order.id}</span> is marked as <span className="font-semibold text-pink-500">{order.status}</span>.
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 transition-colors">
                      Amount: ₹{formatCurrency(calculateOrderTotal(order))}
                    </p>
                  </div>
                </div>
              ))}

            </div>
            
            {orders.length > 4 && (
              <button className="w-full mt-6 py-3 border border-slate-200/50 dark:border-white/10 rounded-xl text-sm font-semibold text-purple-600 dark:text-purple-400 hover:bg-purple-500/10 hover:border-purple-500/30 transition-all relative z-10">
                View All {orders.length} Orders
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;