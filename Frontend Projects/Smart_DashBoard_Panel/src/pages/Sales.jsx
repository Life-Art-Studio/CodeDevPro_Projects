import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useOrderContext from '../context/OrderContext';
import useCustomerContext from '../context/CustomerContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { calculateOrderTotal, calculateRowTotal, formatCurrency, getOrderPaidAmount } from '../utils/financeUtils';
import toast from 'react-hot-toast';

const Sales = () => {
  const { orders } = useOrderContext();
  const { customers } = useCustomerContext();
  const navigate = useNavigate();
  const [timeframe, setTimeframe] = useState('This Month');
  const [isSalesDetailOpen, setIsSalesDetailOpen] = useState(false);
  const [isProductBreakdownOpen, setIsProductBreakdownOpen] = useState(false);
  const [selectedSaleOrder, setSelectedSaleOrder] = useState(null);

  const getCustomerName = (id) => {
    const c = customers.find(c => c.id === id);
    return c ? c.name : 'Unknown';
  };

  // ==========================================
  // DATA FILTERING
  // ==========================================
  const completedSales = orders.filter(
    (order) => order.status === "Paid" || order.status === "Delivered" || order.status === "Partially Paid"
  );

  const totalSalesRevenue = completedSales.reduce((sum, order) => sum + getOrderPaidAmount(order), 0);
  const averageOrderValue = completedSales.length > 0 ? totalSalesRevenue / completedSales.length : 0;
  const totalItemsSold = completedSales.reduce((total, order) => {
    const orderItemCount = order.items.reduce((sum, item) => sum + Number(item.qty), 0);
    return total + orderItemCount;
  }, 0);

  // ==========================================
  // CHART DATA PREPARATION
  // ==========================================
  const chartData = completedSales.reduce((acc, order) => {
    const existing = acc.find(d => d.date === order.date);
    if (existing) {
      existing.revenue += calculateOrderTotal(order);
    } else {
      acc.push({ date: order.date, revenue: calculateOrderTotal(order) });
    }
    return acc;
  }, []);

  const categoryData = completedSales.reduce((acc, order) => {
    order.items.forEach(item => {
      const existing = acc.find(d => d.name === (item.name || 'Unknown'));
      if (existing) {
        existing.value += calculateRowTotal(item);
      } else {
        acc.push({ name: item.name || 'Unknown', value: calculateRowTotal(item) });
      }
    });
    return acc;
  }, []);

  const dailySales = orders.reduce((acc, order) => {
    const date = order.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(order);
    return acc;
  }, {});

  const salesByCustomer = completedSales.reduce((acc, order) => {
    if (!acc[order.customerId]) acc[order.customerId] = [];
    acc[order.customerId].push(order);
    return acc;
  }, {});

  const productBreakdown = completedSales.reduce((acc, order) => {
    order.items.forEach(item => {
      const key = item.name || 'Unknown';
      if (!acc[key]) acc[key] = { name: key, totalQty: 0, totalRevenue: 0, customers: new Set() };
      acc[key].totalQty += Number(item.qty);
      acc[key].totalRevenue += calculateRowTotal(item);
      acc[key].customers.add(order.customerId);
    });
    return acc;
  }, {});

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // ==========================================
  // CSV EXPORT LOGIC
  // ==========================================
  const handleExportCSV = () => {
    if (completedSales.length === 0) {
      toast.error("No sales data available to export.");
      return;
    }

    // 1. Define the CSV Headers
    const headers = ["Order ID", "Date", "Status", "Items Count", "Total Amount (INR)"];
    
    // 2. Map the orders into CSV rows
    const rows = completedSales.map(order => [
      order.id,
      order.date,
      order.status,
      order.items.length,
      calculateOrderTotal(order).toFixed(2)
    ]);

    // 3. Combine headers and rows into a single string
    // Each row is joined by a comma, and rows are separated by newlines
    const csvContent = [headers, ...rows]
      .map(e => e.join(","))
      .join("\n");

    // 4. Create a Blob (Binary Large Object) for the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // 5. Create a hidden 'a' tag to trigger the download
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Sales_Report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide p-6 lg:p-8 bg-transparent font-sans h-full transition-colors animate-in fade-in duration-500">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8 ">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 transition-colors tracking-tight">Sales Analytics</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">Deep dive into your revenue streams and transaction history.</p>
        </div>
        
        <div className="flex items-center gap-3 shrink-0">
          <select 
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="text-sm border border-slate-200/50 dark:border-white/10 rounded-xl text-slate-600 dark:text-slate-300 bg-white/50 dark:bg-white/5 px-4 py-2 outline-none focus:ring-2 focus:ring-purple-500 shadow-sm font-medium transition-colors cursor-pointer backdrop-blur-md"
          >
            <option>Today</option>
            <option>This Week</option>
            <option>This Month</option>
            <option>This Year</option>
            <option>All Time</option>
          </select>
          
          {/* NOW ATTACHED TO handleExportCSV */}
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-500 text-white rounded-xl text-sm font-semibold hover:shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all"
          >
            <span>📊</span> Export CSV
          </button>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div 
          onClick={() => setIsSalesDetailOpen(true)}
          className="glass-panel p-6 rounded-2xl border-b-4 border-b-emerald-500 relative overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 text-4xl group-hover:scale-110 transition-transform">💰</div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1 group-hover:text-emerald-400 transition-colors">Gross Sales Volume</p>
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 dark:text-slate-100 neon-text transition-colors tracking-tighter">₹{formatCurrency(totalSalesRevenue)}</h3>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-3 flex items-center gap-1 transition-colors bg-emerald-500/10 inline-block px-2 py-1 rounded-md">
            <span>Based on {completedSales.length} successful transactions</span>
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border-b-4 border-b-blue-500 relative overflow-hidden group animate-slide-up-fade" style={{ animationDelay: '100ms' }}>
          <div className="absolute top-0 right-0 p-4 opacity-10 text-4xl group-hover:scale-110 transition-transform">📈</div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1 group-hover:text-blue-400 transition-colors">Average Order Value (AOV)</p>
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 dark:text-slate-100 neon-text transition-colors tracking-tighter">₹{formatCurrency(averageOrderValue)}</h3>
          <p className="text-xs text-blue-500 dark:text-blue-400 font-medium mt-3 flex items-center gap-1 transition-colors bg-blue-500/10 inline-block px-2 py-1 rounded-md">
            <span>Revenue per customer checkout</span>
          </p>
        </div>

        <div 
          onClick={() => setIsProductBreakdownOpen(true)}
          className="glass-panel p-6 rounded-2xl border-b-4 border-b-purple-500 relative overflow-hidden group animate-slide-up-fade cursor-pointer hover:scale-[1.02] transition-transform" style={{ animationDelay: '200ms' }}
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 text-4xl group-hover:scale-110 transition-transform">📦</div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1 group-hover:text-purple-400 transition-colors">Total Units Sold</p>
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 dark:text-slate-100 neon-text-pink transition-colors tracking-tighter">{totalItemsSold}</h3>
          <p className="text-xs text-purple-500 dark:text-purple-400 font-medium mt-3 flex items-center gap-1 transition-colors bg-purple-500/10 inline-block px-2 py-1 rounded-md">
            <span>Individual items shipped</span>
          </p>
        </div>
      </div>

      {/* CHARTS PLACEHOLDERS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 animate-slide-up-fade" style={{ animationDelay: '300ms' }}>
        <div className="glass-panel rounded-2xl flex flex-col transition-colors overflow-hidden">
          <div className="p-5 border-b border-slate-200/50 dark:border-white/10 bg-white/10 dark:bg-[#0a0c14]/30">
            <h2 className="text-md font-bold text-slate-800 dark:text-slate-100">Sales Trend ({timeframe})</h2>
          </div>
          <div className="h-64 p-6 flex items-center justify-center relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-emerald-500/20 rounded-full blur-[60px]"></div>
            <div className="w-full h-52 p-4 border border-dashed border-emerald-500/30 rounded-xl flex items-center justify-center text-emerald-400/50 bg-white/5 dark:bg-[#0a0c14]/30 backdrop-blur-sm transition-colors relative z-10">
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(v) => `₹${v.toFixed(2)}`} />
                  <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-2xl flex flex-col transition-colors overflow-hidden">
          <div className="p-5 border-b border-slate-200/50 dark:border-white/10 bg-white/10 dark:bg-[#0a0c14]/30">
            <h2 className="text-md font-bold text-slate-800 dark:text-slate-100">Sales by Category</h2>
          </div>
          <div className="h-64 p-6 flex items-center justify-center relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-500/20 rounded-full blur-[60px]"></div>
            <div className="w-full h-52 p-4 border border-dashed border-blue-500/30 rounded-xl flex items-center justify-center text-blue-400/50 bg-white/5 dark:bg-[#0a0c14]/30 backdrop-blur-sm transition-colors relative z-10">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => `₹${v.toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* TRANSACTION TABLE */}
      <div className="glass-panel rounded-2xl overflow-hidden transition-colors animate-slide-up-fade" style={{ animationDelay: '400ms' }}>
        <div className="p-5 border-b border-slate-200/50 dark:border-white/10 flex justify-between items-center bg-white/10 dark:bg-[#0a0c14]/30 transition-colors">
          <h2 className="text-md font-bold text-slate-800 dark:text-slate-100">Recent Transactions</h2>
        </div>
        
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-white/5 dark:bg-white/5 border-b border-slate-200/50 dark:border-white/10 transition-colors">
              <tr className="text-slate-500 dark:text-slate-400">
                <th className="py-4 px-6 font-semibold uppercase tracking-wider text-xs">Order ID</th>
                <th className="py-4 px-6 font-semibold uppercase tracking-wider text-xs">Date</th>
                <th className="py-4 px-6 font-semibold uppercase tracking-wider text-xs">Customer</th>
                <th className="py-4 px-6 font-semibold uppercase tracking-wider text-xs">Status</th>
                <th className="py-4 px-6 font-semibold uppercase tracking-wider text-xs text-right">Paid / Total</th>
                <th className="py-4 px-6 font-semibold uppercase tracking-wider text-xs text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50 dark:divide-white/5">
              {completedSales.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500 dark:text-slate-400">
                    No completed sales found.
                  </td>
                </tr>
              ) : (
                completedSales.slice(0, 8).map(order => (
                  <tr key={order.id} 
                      onClick={() => setSelectedSaleOrder(order)}
                      className="hover:bg-white/40 dark:hover:bg-white/5 transition-colors group cursor-pointer hover:ring-1 hover:ring-purple-500/30">
                    <td className="py-4 px-6 font-medium text-purple-600 dark:text-purple-400 group-hover:text-purple-500">{order.id}</td>
                    <td className="py-4 px-6 text-slate-600 dark:text-slate-300">{order.date}</td>
                    <td className="py-4 px-6 text-slate-700 dark:text-slate-200">{getCustomerName(order.customerId)}</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                        order.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:text-emerald-400' : 
                        order.status === 'Partially Paid' ? 'bg-teal-500/10 text-teal-600 border-teal-500/30 dark:text-teal-400' :
                        'bg-white/10 text-slate-600 border-white/20 dark:text-slate-300'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right text-xs whitespace-nowrap">
                      <span className={getOrderPaidAmount(order) < calculateOrderTotal(order) ? "text-teal-600 dark:text-teal-400 font-bold" : "text-slate-600 dark:text-slate-400"}>
                        ₹{formatCurrency(getOrderPaidAmount(order))}
                      </span>
                      <span className="text-slate-400 dark:text-slate-500 mx-1">/</span>
                      <span className="text-slate-500 dark:text-slate-400">₹{formatCurrency(calculateOrderTotal(order))}</span>
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-800 dark:text-slate-100 text-right">
                      ₹{formatCurrency(calculateOrderTotal(order))}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DAILY SALES BREAKDOWN */}
      <div className="glass-panel rounded-2xl overflow-hidden transition-colors animate-slide-up-fade mt-8" style={{ animationDelay: '500ms' }}>
        <div className="p-5 border-b border-slate-200/50 dark:border-white/10 flex justify-between items-center bg-white/10 dark:bg-[#0a0c14]/30 transition-colors">
          <h2 className="text-md font-bold text-slate-800 dark:text-slate-100">Daily Sales Breakdown</h2>
        </div>
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-white/5 dark:bg-white/5 border-b border-slate-200/50 dark:border-white/10 transition-colors">
              <tr className="text-slate-500 dark:text-slate-400">
                <th className="py-4 px-6 font-semibold uppercase tracking-wider text-xs whitespace-nowrap">Date</th>
                <th className="py-4 px-6 font-semibold uppercase tracking-wider text-xs whitespace-nowrap">Customer Name</th>
                <th className="py-4 px-6 font-semibold uppercase tracking-wider text-xs text-right whitespace-nowrap">Paid Amount</th>
                <th className="py-4 px-6 font-semibold uppercase tracking-wider text-xs text-right whitespace-nowrap">Pending Amount</th>
                <th className="py-4 px-6 font-semibold uppercase tracking-wider text-xs whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50 dark:divide-white/5">
              {Object.keys(dailySales).length === 0 ? (
                <tr><td colSpan="5" className="py-8 text-center text-slate-500 dark:text-slate-400">No orders found.</td></tr>
              ) : Object.entries(dailySales).map(([date, dailyOrders]) => (
                <React.Fragment key={date}>
                  {dailyOrders.map((order, idx) => {
                    const total = calculateOrderTotal(order);
                    const isPaid = order.status === 'Paid' || order.status === 'Delivered';
                    const isPending = order.status === 'Pending' || order.status === 'Processing';
                    return (
                      <tr key={order.id} className="hover:bg-white/40 dark:hover:bg-white/5 transition-colors group">
                        {idx === 0 ? (
                          <td className="py-4 px-6 font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap border-r border-slate-200/50 dark:border-white/10 align-top" rowSpan={dailyOrders.length}>{date}</td>
                        ) : null}
                        <td className="py-4 px-6 text-slate-600 dark:text-slate-300 whitespace-nowrap">{getCustomerName(order.customerId)} <span className="text-xs opacity-50">({order.customerId})</span></td>
                        <td className="py-4 px-6 text-emerald-600 dark:text-emerald-400 font-medium text-right whitespace-nowrap">{isPaid ? `₹${formatCurrency(total)}` : '-'}</td>
                        <td className="py-4 px-6 text-amber-600 dark:text-amber-400 font-medium text-right whitespace-nowrap">{isPending ? `₹${formatCurrency(total)}` : '-'}</td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                            isPaid ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:text-emerald-400' :
                            isPending ? 'bg-amber-500/10 text-amber-600 border-amber-500/30 dark:text-amber-400' :
                            'bg-white/10 text-slate-600 border-white/20 dark:text-slate-300'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Gross Sales Panel */}
      {isSalesDetailOpen && (
        <div className="fixed inset-0 z-[100] flex">
          <div className="absolute inset-0 bg-[#0a0c14]/60 backdrop-blur-sm" onClick={() => setIsSalesDetailOpen(false)}></div>
          <div className="absolute inset-y-0 right-0 w-full sm:w-[480px] glass-panel border-l border-white/10 shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5 backdrop-blur-md">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Sales by Customer</h2>
              <button onClick={() => setIsSalesDetailOpen(false)} className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white p-2 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">✕</button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {Object.entries(salesByCustomer).map(([custId, custOrders]) => (
                <div key={custId} className="glass-panel p-4 rounded-xl border border-slate-200/50 dark:border-white/5">
                  <div className="flex justify-between items-center mb-3">
                    <p className="font-bold text-slate-800 dark:text-slate-200">{getCustomerName(custId)}</p>
                    <p className="font-bold text-emerald-600 dark:text-emerald-400">₹{formatCurrency(custOrders.reduce((sum, o) => sum + calculateOrderTotal(o), 0))}</p>
                  </div>
                  <div className="space-y-2">
                    {custOrders.map(order => (
                      <div key={order.id} className="flex justify-between text-sm bg-slate-50 dark:bg-white/5 p-2 rounded-lg">
                        <span className="text-slate-600 dark:text-slate-400">{order.id} ({order.date})</span>
                        <span className="text-slate-700 dark:text-slate-300 font-medium">₹{formatCurrency(calculateOrderTotal(order))}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Product Breakdown Panel */}
      {isProductBreakdownOpen && (
        <div className="fixed inset-0 z-[100] flex">
          <div className="absolute inset-0 bg-[#0a0c14]/60 backdrop-blur-sm" onClick={() => setIsProductBreakdownOpen(false)}></div>
          <div className="absolute inset-y-0 right-0 w-full sm:w-[480px] glass-panel border-l border-white/10 shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5 backdrop-blur-md">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Product Breakdown</h2>
              <button onClick={() => setIsProductBreakdownOpen(false)} className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white p-2 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">✕</button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {Object.values(productBreakdown).sort((a,b) => b.totalQty - a.totalQty).map((prod, idx) => (
                <div key={idx} className="glass-panel p-4 rounded-xl border border-slate-200/50 dark:border-white/5">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-bold text-slate-800 dark:text-slate-200">{prod.name}</p>
                    <div className="text-right">
                      <p className="font-bold text-purple-600 dark:text-purple-400">{prod.totalQty} units</p>
                      <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">₹{formatCurrency(prod.totalRevenue)}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Bought by {prod.customers.size} customers</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Transactions Inline Modal */}
      {selectedSaleOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0a0c14]/80 backdrop-blur-sm" onClick={() => setSelectedSaleOrder(null)}></div>
          <div className="relative glass-modal rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300 transition-colors border border-white/20 flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-slate-200/50 dark:border-white/10 flex items-center justify-between bg-white/5 backdrop-blur-md">
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Order {selectedSaleOrder.id}</h3>
              <button onClick={() => setSelectedSaleOrder(null)} className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white p-2 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">✕</button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="flex justify-between mb-6">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Date: {selectedSaleOrder.date}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Status: <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{selectedSaleOrder.status}</span></p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-600 dark:text-slate-400">Customer: <span className="font-bold text-slate-800 dark:text-slate-200">{getCustomerName(selectedSaleOrder.customerId)}</span></p>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200/50 dark:border-white/10 overflow-hidden mb-6">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100 dark:bg-white/5 border-b border-slate-200/50 dark:border-white/10 text-slate-500 dark:text-slate-400">
                    <tr>
                      <th className="px-4 py-2 font-medium">Item</th>
                      <th className="px-4 py-2 font-medium">Qty</th>
                      <th className="px-4 py-2 font-medium text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/50 dark:divide-white/5">
                    {selectedSaleOrder.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{item.name}</td>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{item.qty}</td>
                        <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300 font-medium">₹{formatCurrency(calculateRowTotal(item))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="p-4 bg-slate-100 dark:bg-white/5 text-right border-t border-slate-200/50 dark:border-white/10">
                  <p className="text-sm text-slate-600 dark:text-slate-400">Total: <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 ml-2">₹{formatCurrency(calculateOrderTotal(selectedSaleOrder))}</span></p>
                </div>
              </div>
              <div className="flex justify-end">
                <button 
                  onClick={() => navigate('/dashboard/customers', { state: { openCustomerId: selectedSaleOrder.customerId, openOrderId: selectedSaleOrder.id }})}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-semibold transition-colors"
                >
                  Go to Customer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;