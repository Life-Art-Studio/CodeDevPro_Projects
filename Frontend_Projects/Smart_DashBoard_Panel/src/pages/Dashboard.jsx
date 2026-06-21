import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useOrderContext from '../context/OrderContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { generateDashboardReport } from '../utils/generateReports';
import { calculateOrderTotal, formatCurrency, getOrderOutstanding, getOrderPaidAmount } from '../utils/financeUtils';
import toast from 'react-hot-toast';

import { useAuth } from '../context/AuthContext';
import { useAudit } from '../context/AuditContext';
import CustomSelect from '../components/ui/CustomSelect';
import { Download, RefreshCw, BarChart2, Users, ShoppingCart, Clock, Trophy, Activity, ArrowRight, DollarSign, XCircle, CreditCard } from 'lucide-react';

const Dashboard = () => {
  const { viewAsUserId, setViewAsUserId, currentUser } = useAuth();
  const { logAction } = useAudit();
  const { orders, clearAllOrders, isLoading } = useOrderContext();
  const { users } = useAuth();
  const [revenuePeriod, setRevenuePeriod] = useState("This Year");

  const totalOrdersCount = orders.length;
  const navigate = useNavigate();

  const pendingOrders = orders.filter(o => o.status === "Pending" || o.status === "Partially Paid");
  const pendingTotal = pendingOrders.reduce((sum, o) => sum + getOrderOutstanding(o), 0);

  const chartData = orders.reduce((acc, order) => {
    const existing = acc.find(d => d.date === order.date);
    if (existing) {
      existing.revenue += calculateOrderTotal(order);
    } else {
      acc.push({ date: order.date, revenue: calculateOrderTotal(order) });
    }
    return acc;
  }, []).sort((a, b) => new Date(a.date) - new Date(b.date));

  const totalRevenue = orders.reduce((sum, order) => {
    if (order.status === "Paid" || order.status === "Partially Paid" || order.status === "Delivered") {
      return sum + getOrderPaidAmount(order);
    }
    return sum;
  }, 0);

  const uniqueCustomerIds = new Set(orders.map(order => order.customerId || order.customer_id));
  uniqueCustomerIds.delete(undefined); 
  const activeCustomersCount = uniqueCustomerIds.size;

  const recentOrders = orders.slice(0, 4);

  const leaderboard = users.filter(u => u.role === 'SALES').map(user => {
    const userOrders = orders.filter(o => (o.owner_id === user.id || o.owner_id === user.id) && (o.status === 'Paid' || o.status === 'Delivered' || o.status === 'Partially Paid'));
    const revenue = userOrders.reduce((sum, o) => sum + getOrderPaidAmount(o), 0);
    return { ...user, revenue, orderCount: userOrders.length };
  }).sort((a, b) => b.revenue - a.revenue).slice(0, 5); 

  const handleResetDashboard = () => {
    toast((t) => (
      <div className="flex flex-col gap-2">
        <span className="font-semibold text-sm text-zinc-900">Are you sure you want to reset the dashboard? This will permanently delete ALL orders across all customers.</span>
        <div className="flex gap-2 justify-end mt-2">
          <button 
            onClick={() => {
              toast.dismiss(t.id);
              clearAllOrders();
              toast.success("Dashboard reset.");
            }}
            className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
          >Reset</button>
          <button onClick={() => toast.dismiss(t.id)} className="bg-zinc-100 px-4 py-2 rounded-lg text-sm font-semibold text-zinc-800 hover:bg-zinc-200 transition-colors">Cancel</button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  if (isLoading) {
    return (
      <div className="flex-1 min-h-0 overflow-y-auto p-6 lg:p-8 bg-zinc-50 dark:bg-[#0f1117] font-sans flex flex-col items-center justify-center transition-colors">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-500 rounded-full animate-spin"></div>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex-1 min-h-0 overflow-y-auto p-6 lg:p-8 bg-zinc-50 dark:bg-[#0f1117] font-sans flex flex-col items-center justify-center transition-colors">
        <div className="max-w-md text-center bg-white dark:bg-[#1a1d27] p-10 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <BarChart2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">Welcome to your Dashboard</h2>
          <p className="text-zinc-500 dark:text-zinc-400 mb-8 leading-relaxed">
            It looks like you don't have any data yet. Once you navigate to a customer and create your first order, your live revenue and analytics will automatically appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-zinc-50 dark:bg-[#0f1117] font-sans transition-colors animate-in fade-in duration-300">
      <div className="max-w-7xl mx-auto h-full pb-20 sm:pb-6">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Overview</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Here is what's happening with your business today.</p>
        </div>
        
        {/* ACTION BUTTONS GROUP */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {currentUser?.role === 'ADMIN' && (
            <button 
              onClick={handleResetDashboard}
              className="flex-1 sm:flex-none items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-[#1a1d27] border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-all min-h-[44px] flex"
            >
              <RefreshCw className="w-4 h-4" /> Reset
            </button>
          )}

         <button 
            onClick={() => generateDashboardReport(orders, { totalRevenue, totalOrdersCount, activeCustomersCount }, currentUser)}
            className="flex-1 sm:flex-none items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-all min-h-[44px] flex"
          >
            <Download className="w-4 h-4" /> Download Report
          </button>
        </div>
      </div>

      {/* METRIC CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        
        <div className="bg-white dark:bg-[#1a1d27] p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm border-l-4 border-l-emerald-500">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Revenue</p>
            <DollarSign className="w-5 h-5 text-emerald-500 opacity-50" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight tabular-nums">₹{formatCurrency(totalRevenue)}</h3>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-3 bg-emerald-50 dark:bg-emerald-500/10 inline-block px-2 py-1 rounded">
            Collected Revenue
          </p>
        </div>

        <div className="bg-white dark:bg-[#1a1d27] p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm border-l-4 border-l-indigo-500">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Active Buyers</p>
            <Users className="w-5 h-5 text-indigo-500 opacity-50" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight tabular-nums">{activeCustomersCount}</h3>
          <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-3 bg-indigo-50 dark:bg-indigo-500/10 inline-block px-2 py-1 rounded">
            Live Data
          </p>
        </div>

        <div className="bg-white dark:bg-[#1a1d27] p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm border-l-4 border-l-blue-500">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Orders</p>
            <ShoppingCart className="w-5 h-5 text-blue-500 opacity-50" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight tabular-nums">{totalOrdersCount}</h3>
          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-3 bg-blue-50 dark:bg-blue-500/10 inline-block px-2 py-1 rounded">
            Live Data
          </p>
        </div>

        <div onClick={() => navigate('/dashboard/customers', { state: { filterStatus: 'Pending' }})}
             className="cursor-pointer bg-white dark:bg-[#1a1d27] p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm border-l-4 border-l-amber-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Pending Payments</p>
            <Clock className="w-5 h-5 text-amber-500 opacity-50" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight tabular-nums">₹{formatCurrency(pendingTotal)}</h3>
          <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-3 bg-amber-50 dark:bg-amber-500/10 inline-block px-2 py-1 rounded">
            {pendingOrders.length} order{pendingOrders.length === 1 ? '' : 's'} awaiting
          </p>
        </div>

      </div>

      {/* TOP PERFORMERS LEADERBOARD */}
      {!viewAsUserId && (
        <div className="mb-8 bg-white dark:bg-[#1a1d27] border border-zinc-200 dark:border-zinc-800 shadow-sm rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 uppercase tracking-wider">
              <Trophy className="w-4 h-4 text-amber-500" /> Top Performing Salespeople
            </h2>
          </div>
          <div className="p-6 overflow-x-auto" style={{ WebkitMaskImage: 'linear-gradient(to right, white 90%, transparent)', maskImage: 'linear-gradient(to right, white 90%, transparent)' }}>
            {leaderboard.length > 0 ? (
              <div className="flex gap-4 min-w-max">
                {leaderboard.map((user, idx) => (
                  <div 
                    key={user.id} 
                    onClick={() => {
                      if (currentUser?.role === 'ADMIN') {
                        logAction("Impersonate", "Dashboard", `Started viewing dashboard as ${user.full_name || 'User'}`);
                        setViewAsUserId(user.id);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    className={`bg-zinc-50 dark:bg-zinc-800/50 p-5 rounded-xl border border-zinc-200 dark:border-zinc-700 relative w-48 shrink-0 flex flex-col items-center text-center ${currentUser?.role === 'ADMIN' ? 'cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors' : ''}`}
                  >
                    {idx === 0 && <div className="absolute top-2 right-2 text-xl">🥇</div>}
                    {idx === 1 && <div className="absolute top-2 right-2 text-xl">🥈</div>}
                    {idx === 2 && <div className="absolute top-2 right-2 text-xl">🥉</div>}
                    <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold mb-3 border border-indigo-200 dark:border-indigo-500/30">
                      {(user.full_name || user.username || 'U').charAt(0)}
                    </div>
                    <h4 className="font-bold text-zinc-900 dark:text-zinc-100 truncate w-full">{user.full_name || user.username || 'User'}</h4>
                    <p className="text-emerald-600 dark:text-emerald-400 font-bold mt-1 tabular-nums">₹{formatCurrency(user.revenue)}</p>
                    <p className="text-xs text-zinc-500 mt-1">{user.orderCount} Orders</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-zinc-500 text-sm text-center py-4">No sales data available yet.</p>
            )}
          </div>
        </div>
      )}

      {/* MAIN CHARTS & ACTIVITY AREA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 bg-white dark:bg-[#1a1d27] border border-zinc-200 dark:border-zinc-800 shadow-sm rounded-2xl flex flex-col overflow-hidden">
          <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-500" /> Revenue Analytics
            </h2>
            <CustomSelect 
              value={revenuePeriod}
              onChange={setRevenuePeriod}
              className="text-xs font-medium border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-700 dark:text-zinc-300 bg-white dark:bg-[#1a1d27] px-3 py-1.5 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer min-h-[36px] sm:min-h-[44px] flex items-center justify-between"
              options={[
                { value: 'This Year', label: 'This Year' },
                { value: 'Last Year', label: 'Last Year' }
              ]}
              minWidth="120px"
            />
          </div>
          <div className="flex-1 p-6 flex items-center justify-center min-h-0 min-w-0" style={{ width: '100%', height: 300 }}>
            <div className="w-full h-[300px] min-h-[300px] min-w-0">
              <ResponsiveContainer width="99%" height={300} minWidth={1} minHeight={1}>
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" strokeOpacity={0.5} className="dark:stroke-zinc-800" />
                  <XAxis dataKey="date" stroke="#a1a1aa" tick={{fill: '#a1a1aa', fontSize: 12}} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#a1a1aa" tick={{fill: '#a1a1aa', fontSize: 12}} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} dx={-10} />
                  <Tooltip 
                    formatter={(v) => [`₹${v.toFixed(2)}`, 'Revenue']} 
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e4e4e7', color: '#18181b', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    itemStyle={{ color: '#4f46e5', fontWeight: '600' }}
                    labelStyle={{ color: '#71717a', marginBottom: '4px' }}
                    cursor={{ stroke: '#a1a1aa', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2, fill: '#4f46e5' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1a1d27] border border-zinc-200 dark:border-zinc-800 shadow-sm rounded-2xl flex flex-col overflow-hidden">
          <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
              Recent Activity
            </h2>
          </div>
          <div className="p-6 flex-1 flex flex-col">
            <div className="space-y-4 flex-1">
              {recentOrders.map((order, index) => (
                <div key={order.id} 
                     onClick={() => navigate('/dashboard/customers', { state: { openCustomerId: order.customerId || order.customer_id, openOrderId: order.id }})}
                     className="flex gap-4 items-center p-3 rounded-xl cursor-pointer border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    order.status === 'Paid' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' :
                    order.status === 'Cancelled' ? 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400' :
                    order.status === 'Partially Paid' ? 'bg-teal-100 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400' :
                    'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400'
                  }`}>
                    {order.status === 'Paid' ? <DollarSign className="w-5 h-5"/> : order.status === 'Cancelled' ? <XCircle className="w-5 h-5"/> : order.status === 'Partially Paid' ? <CreditCard className="w-5 h-5"/> : <ShoppingCart className="w-5 h-5"/>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-900 dark:text-zinc-100 font-medium truncate">
                      Order {order.id}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {order.status} • ₹{formatCurrency(calculateOrderTotal(order))}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-indigo-500" />
                </div>
              ))}
            </div>
            
            {orders.length > 4 && (
              <button className="w-full mt-6 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors min-h-[44px]">
                View All {orders.length} Orders
              </button>
            )}
          </div>
        </div>

      </div>
      </div>
    </div>
  );
};

export default Dashboard;
