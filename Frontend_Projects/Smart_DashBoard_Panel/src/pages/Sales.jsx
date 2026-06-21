import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useOrderContext from '../context/OrderContext';
import useCustomerContext from '../context/CustomerContext';
import { useSupplyChainContext } from '../context/SupplyChainContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { calculateOrderTotal, calculateRowTotal, formatCurrency, getOrderPaidAmount } from '../utils/financeUtils';
import toast from 'react-hot-toast';

import CustomSelect from '../components/ui/CustomSelect';
import { Search } from 'lucide-react';

const Sales = () => {
  const { orders, isLoading } = useOrderContext();
  const { customers } = useCustomerContext();
  const { currentUser, viewAsUserId } = useAuth();
  const navigate = useNavigate();
  const [timeframe, setTimeframe] = useState('This Month');
  const [salespersonSearchQuery, setSalespersonSearchQuery] = useState('');
  const [isSalespersonDropdownOpen, setIsSalespersonDropdownOpen] = useState(false);
  const [selectedSSFilter, setSelectedSSFilter] = useState('ALL');
  const [selectedDBFilter, setSelectedDBFilter] = useState('ALL');
  const { users } = useAuth();
  const { superStockists, distributors, isLoading: isSupplyChainLoading } = useSupplyChainContext();
  
  const isAdmin = currentUser?.role === 'ADMIN' && !viewAsUserId;

  const filteredOrders = React.useMemo(() => {
    let baseOrders = orders;
    
    if (salespersonSearchQuery.trim() !== '') {
      const matchedUserIds = users
        .filter(u => u.role === 'SALES' && (u.full_name || '').toLowerCase().includes((salespersonSearchQuery || '').toLowerCase()))
        .map(u => u.id);
      baseOrders = baseOrders.filter(o => matchedUserIds.includes(o.owner_id));
    }
    if (selectedSSFilter !== 'ALL') {
      const selectedSS = superStockists.find(ss => ss.id === selectedSSFilter);
      const ssOwnerId = selectedSS?.owner_id;
      
      // Find DBs belonging to this SS
      const ssDBs = distributors.filter(db => db.superStockistId === selectedSSFilter);
      const ssDBOwnerIds = ssDBs.map(db => db.owner_id).filter(Boolean);
      
      // Find SRs belonging to these DBs
      const ssChildrenOwnerIds = users.filter(u => 
        u.parent_id === ssOwnerId || 
        (u.ancestor_ids && u.ancestor_ids.includes(ssOwnerId))
      ).map(u => u.id);

      const allAllowedOwnerIds = new Set([
        ssOwnerId,
        ...ssDBOwnerIds,
        ...ssChildrenOwnerIds
      ]);

      baseOrders = baseOrders.filter(o => 
        ssDBs.map(db=>db.id).includes(o.distributorId || o.distributor_id) || 
        allAllowedOwnerIds.has(o.owner_id)
      );
    }
    if (selectedDBFilter !== 'ALL') {
      const selectedDB = distributors.find(db => db.id === selectedDBFilter);
      const dbOwnerId = selectedDB?.owner_id;
      
      const dbChildrenOwnerIds = users.filter(u => 
        u.parent_id === dbOwnerId || 
        (u.ancestor_ids && u.ancestor_ids.includes(dbOwnerId))
      ).map(u => u.id);

      const allAllowedOwnerIds = new Set([
        dbOwnerId,
        ...dbChildrenOwnerIds
      ]);

      baseOrders = baseOrders.filter(o => 
        (o.distributorId || o.distributor_id) === selectedDBFilter || 
        allAllowedOwnerIds.has(o.owner_id)
      );
    }
    
    return baseOrders;
  }, [orders, salespersonSearchQuery, isAdmin, viewAsUserId, currentUser, users, selectedSSFilter, selectedDBFilter, distributors, superStockists]);
  const [isSalesDetailOpen, setIsSalesDetailOpen] = useState(false);
  const [isProductBreakdownOpen, setIsProductBreakdownOpen] = useState(false);
  const [selectedSaleOrder, setSelectedSaleOrder] = useState(null);

  const getCustomerName = (id) => {
    const c = customers.find(c => c.id === id);
    return c ? c.name : 'Unknown';
  };

  const getCreatorName = (id) => {
    if (!id) return 'Unknown';
    const u = users?.find(u => u.id === id);
    if (!u) return 'Unknown';
    return `${u.full_name || u.email || 'Unknown'} (${(u.role || '').replace('_', ' ')})`;
  };

  // ==========================================
  // DATA FILTERING
  // ==========================================
  const completedSales = React.useMemo(() => {
    return filteredOrders.filter(
      (order) => order.status === "Paid" || order.status === "Delivered" || order.status === "Partially Paid"
    );
  }, [filteredOrders]);

  const totalSalesRevenue = React.useMemo(() => {
    return completedSales.reduce((sum, order) => sum + getOrderPaidAmount(order), 0);
  }, [completedSales]);

  const averageOrderValue = React.useMemo(() => {
    return completedSales.length > 0 ? totalSalesRevenue / completedSales.length : 0;
  }, [completedSales, totalSalesRevenue]);

  const totalItemsSold = React.useMemo(() => {
    return completedSales.reduce((total, order) => {
      const orderItemCount = order.items.reduce((sum, item) => sum + Number(item.qty), 0);
      return total + orderItemCount;
    }, 0);
  }, [completedSales]);
  // ==========================================
  // CHART DATA PREPARATION
  // ==========================================
  const chartData = React.useMemo(() => {
    return completedSales.reduce((acc, order) => {
      const existing = acc.find(d => d.date === order.date);
      if (existing) {
        existing.revenue += calculateOrderTotal(order);
      } else {
        acc.push({ date: order.date, revenue: calculateOrderTotal(order) });
      }
      return acc;
    }, []);
  }, [completedSales]);

  const categoryData = React.useMemo(() => {
    return completedSales.reduce((acc, order) => {
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
  }, [completedSales]);
  const dailySales = React.useMemo(() => {
    return filteredOrders.reduce((acc, order) => {
      const date = order.date;
      if (!acc[date]) acc[date] = [];
      acc[date].push(order);
      return acc;
    }, {});
  }, [filteredOrders]);

  const salesByCustomer = React.useMemo(() => {
    return completedSales.reduce((acc, order) => {
      const custId = order.customerId || order.customer_id;
      if (!acc[custId]) acc[custId] = [];
      acc[custId].push(order);
      return acc;
    }, {});
  }, [completedSales]);

  const productBreakdown = React.useMemo(() => {
    return completedSales.reduce((acc, order) => {
      order.items.forEach(item => {
        const key = item.name || 'Unknown';
        if (!acc[key]) acc[key] = { name: key, totalQty: 0, totalRevenue: 0, customers: new Set() };
        acc[key].totalQty += Number(item.qty);
        acc[key].totalRevenue += calculateRowTotal(item);
        acc[key].customers.add(order.customerId);
      });
      return acc;
    }, {});
  }, [completedSales]);
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // ==========================================
  // CSV EXPORT LOGIC
  // ==========================================
  const handleExportCSV = () => {
    if (completedSales.length === 0) {
      toast.error("No sales data available to export.");
      return;
    }

    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

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
      .map(row => row.map(escapeCsv).join(","))
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

  const salesUsers = users.filter(u => u.role === 'SALES');
  const filteredSalesUsers = salesUsers.filter(u => (u.full_name || '').toLowerCase().includes((salespersonSearchQuery || '').toLowerCase()));

  const displayDBs = selectedSSFilter === 'ALL' 
    ? distributors 
    : distributors.filter(db => db.superStockistId === selectedSSFilter);

  if (isLoading || isSupplyChainLoading) {
    return (
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center bg-zinc-50 dark:bg-[#0f1117] transition-colors">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-500 rounded-full animate-spin"></div>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium">Loading sales data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col z-0">
      <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-zinc-50 dark:bg-[#0f1117] font-sans transition-colors animate-in slide-in-from-right-8 duration-300 custom-scrollbar">
        <div className="max-w-7xl mx-auto flex flex-col">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8 ">
        <div>
          <h1 className="text-3xl font-bold text-zinc-800 dark:text-zinc-100 transition-colors tracking-tight">Sales Analytics</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 transition-colors">Deep dive into your revenue streams and transaction history.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          {isAdmin && (
            <>
            <div className="relative z-50">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input 
                type="text" 
                placeholder="Search Salesperson..." 
                value={salespersonSearchQuery}
                onFocus={() => setIsSalespersonDropdownOpen(true)}
                onBlur={() => setTimeout(() => setIsSalespersonDropdownOpen(false), 200)}
                onChange={(e) => {
                  setSalespersonSearchQuery(e.target.value);
                  setIsSalespersonDropdownOpen(true);
                }}
                className="w-full sm:w-48 pl-9 pr-4 py-1.5 sm:py-2 bg-white dark:bg-[#1a1d27] border border-zinc-200 dark:border-zinc-700 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all dark:text-zinc-100 min-h-[36px] sm:min-h-[44px] text-sm"
              />
              {isSalespersonDropdownOpen && (
                <div className="absolute top-[calc(100%+4px)] left-0 w-full sm:w-48 bg-white dark:bg-[#1a1d27] border border-zinc-200 dark:border-zinc-700 rounded-lg sm:rounded-xl shadow-xl max-h-60 overflow-y-auto custom-scrollbar">
                  {filteredSalesUsers.length > 0 ? (
                    filteredSalesUsers.map(user => (
                      <div 
                        key={user.id}
                        onClick={() => {
                          setSalespersonSearchQuery(user.full_name || '');
                          setIsSalespersonDropdownOpen(false);
                        }}
                        className="px-4 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors border-b border-zinc-100 dark:border-zinc-800 last:border-0"
                      >
                        {user.full_name || 'Unknown User'}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400">No matching salespeople</div>
                  )}
                </div>
              )}
            </div>
            
            <div className="relative z-40">
              <select 
                value={selectedSSFilter}
                onChange={(e) => {
                  setSelectedSSFilter(e.target.value);
                  setSelectedDBFilter('ALL'); // Reset DB filter when SS changes
                }}
                className="w-full sm:w-40 px-3 py-1.5 sm:py-2 bg-white dark:bg-[#1a1d27] border border-zinc-200 dark:border-zinc-700 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all dark:text-zinc-100 min-h-[36px] sm:min-h-[44px] text-sm"
              >
                <option value="ALL">All Super Stockists</option>
                {superStockists.map(ss => (
                  <option key={ss.id} value={ss.id}>{ss.name}</option>
                ))}
              </select>
            </div>
            
            <div className="relative z-40">
              <select 
                value={selectedDBFilter}
                onChange={(e) => setSelectedDBFilter(e.target.value)}
                className="w-full sm:w-40 px-3 py-1.5 sm:py-2 bg-white dark:bg-[#1a1d27] border border-zinc-200 dark:border-zinc-700 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all dark:text-zinc-100 min-h-[36px] sm:min-h-[44px] text-sm"
              >
                <option value="ALL">All Distributors</option>
                {displayDBs.map(db => (
                  <option key={db.id} value={db.id}>{db.name}</option>
                ))}
              </select>
            </div>
          </>
          )}
          
          <CustomSelect
            value={timeframe}
            onChange={setTimeframe}
            minWidth="110px"
            options={[
              { value: 'Today', label: 'Today' },
              { value: 'This Week', label: 'This Week' },
              { value: 'This Month', label: 'This Month' },
              { value: 'This Year', label: 'This Year' },
              { value: 'All Time', label: 'All Time' }
            ]}
          />
          
          {/* NOW ATTACHED TO handleExportCSV */}
          <button 
            onClick={handleExportCSV}
            className="flex-1 sm:flex-none justify-center flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-600 to-indigo-500 text-white rounded-lg sm:rounded-xl text-[11px] sm:text-sm font-semibold hover:shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all whitespace-nowrap min-w-[100px]"
          >
            <span>📊</span> Export <span className="hidden sm:inline">CSV</span>
          </button>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div 
          onClick={() => setIsSalesDetailOpen(true)}
          className="bg-white dark:bg-[#1a1d27] shadow-sm p-6 rounded-2xl border-b-4 border-b-emerald-500 relative overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 text-4xl group-hover:scale-110 transition-transform">💰</div>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1 group-hover:text-emerald-400 transition-colors">Gross Sales Volume</p>
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-zinc-800 dark:text-zinc-100 neon-text transition-colors tracking-tighter">₹{formatCurrency(totalSalesRevenue)}</h3>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-3 flex items-center gap-1 transition-colors bg-emerald-500/10 inline-block px-2 py-1 rounded-md">
            <span>Based on {completedSales.length} successful transactions</span>
          </p>
        </div>

        <div className="bg-white dark:bg-[#1a1d27] shadow-sm p-6 rounded-2xl border-b-4 border-b-blue-500 relative overflow-hidden group animate-slide-up-fade" style={{ animationDelay: '100ms' }}>
          <div className="absolute top-0 right-0 p-4 opacity-10 text-4xl group-hover:scale-110 transition-transform">📈</div>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1 group-hover:text-blue-400 transition-colors">Average Order Value (AOV)</p>
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-zinc-800 dark:text-zinc-100 neon-text transition-colors tracking-tighter">₹{formatCurrency(averageOrderValue)}</h3>
          <p className="text-xs text-blue-500 dark:text-blue-400 font-medium mt-3 flex items-center gap-1 transition-colors bg-blue-500/10 inline-block px-2 py-1 rounded-md">
            <span>Revenue per customer checkout</span>
          </p>
        </div>

        <div 
          onClick={() => setIsProductBreakdownOpen(true)}
          className="bg-white dark:bg-[#1a1d27] shadow-sm p-6 rounded-2xl border-b-4 border-b-purple-500 relative overflow-hidden group animate-slide-up-fade cursor-pointer hover:scale-[1.02] transition-transform" style={{ animationDelay: '200ms' }}
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 text-4xl group-hover:scale-110 transition-transform">📦</div>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1 group-hover:text-purple-400 transition-colors">Total Units Sold</p>
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-zinc-800 dark:text-zinc-100 neon-text-pink transition-colors tracking-tighter">{totalItemsSold}</h3>
          <p className="text-xs text-purple-500 dark:text-purple-400 font-medium mt-3 flex items-center gap-1 transition-colors bg-purple-500/10 inline-block px-2 py-1 rounded-md">
            <span>Individual items shipped</span>
          </p>
        </div>
      </div>

      {/* CHARTS PLACEHOLDERS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 animate-slide-up-fade" style={{ animationDelay: '300ms' }}>
        <div className="bg-white dark:bg-[#1a1d27] shadow-sm rounded-2xl flex flex-col transition-colors overflow-hidden">
          <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0a0c14]">
            <h2 className="text-md font-bold text-zinc-800 dark:text-zinc-100">Sales Trend ({timeframe})</h2>
          </div>
          <div className="h-64 p-6 flex items-center justify-center relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-emerald-500/20 rounded-full blur-[60px]"></div>
            <div className="w-full h-52 p-4 border border-dashed border-emerald-500/30 rounded-xl flex items-center justify-center text-emerald-400/50 bg-white dark:bg-[#0a0c14] backdrop-blur-sm transition-colors relative z-10">
              <ResponsiveContainer width="99%" height={200} minWidth={1} minHeight={1}>
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

        <div className="bg-white dark:bg-[#1a1d27] shadow-sm rounded-2xl flex flex-col transition-colors overflow-hidden">
          <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0a0c14]">
            <h2 className="text-md font-bold text-zinc-800 dark:text-zinc-100">Sales by Category</h2>
          </div>
          <div className="h-64 p-6 flex items-center justify-center relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-500/20 rounded-full blur-[60px]"></div>
            <div className="w-full h-52 p-4 border border-dashed border-blue-500/30 rounded-xl flex items-center justify-center text-blue-400/50 bg-white dark:bg-[#0a0c14] backdrop-blur-sm transition-colors relative z-10">
              <ResponsiveContainer width="99%" height={200} minWidth={1} minHeight={1}>
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
      <div className="bg-white dark:bg-[#1a1d27] shadow-sm rounded-2xl overflow-hidden transition-colors animate-slide-up-fade" style={{ animationDelay: '400ms' }}>
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-white dark:bg-[#0a0c14] transition-colors">
          <h2 className="text-md font-bold text-zinc-800 dark:text-zinc-100">Recent Transactions</h2>
        </div>
        
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-white dark:bg-[#1a1d27] border-b border-zinc-200 dark:border-zinc-800 transition-colors">
              <tr className="text-zinc-500 dark:text-zinc-400">
                <th className="py-4 px-6 font-semibold uppercase tracking-wider text-xs">Order ID</th>
                <th className="py-4 px-6 font-semibold uppercase tracking-wider text-xs">Date</th>
                <th className="py-4 px-6 font-semibold uppercase tracking-wider text-xs">Customer</th>
                <th className="py-4 px-6 font-semibold uppercase tracking-wider text-xs">Created By</th>
                <th className="py-4 px-6 font-semibold uppercase tracking-wider text-xs">Status</th>
                <th className="py-4 px-6 font-semibold uppercase tracking-wider text-xs text-right">Paid / Total</th>
                <th className="py-4 px-6 font-semibold uppercase tracking-wider text-xs text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200/50 dark:divide-white/5">
              {completedSales.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-zinc-500 dark:text-zinc-400">
                    No completed sales found.
                  </td>
                </tr>
              ) : (
                completedSales.slice(0, 8).map(order => (
                  <tr key={order.id} 
                      onClick={() => setSelectedSaleOrder(order)}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group cursor-pointer hover:ring-1 hover:ring-purple-500/30">
                    <td className="py-4 px-6 font-medium text-purple-600 dark:text-purple-400 group-hover:text-purple-500">{order.id}</td>
                    <td className="py-4 px-6 text-zinc-600 dark:text-zinc-300">{order.date}</td>
                    <td className="py-4 px-6 text-zinc-700 dark:text-zinc-200">{getCustomerName(order.customerId)}</td>
                    <td className="py-4 px-6 text-zinc-500 dark:text-zinc-400 text-xs font-medium">{getCreatorName(order.owner_id)}</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                        order.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:text-emerald-400' : 
                        order.status === 'Partially Paid' ? 'bg-teal-500/10 text-teal-600 border-teal-500/30 dark:text-teal-400' :
                        'bg-white text-zinc-600 border-white/20 dark:text-zinc-300'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right text-xs whitespace-nowrap">
                      <span className={getOrderPaidAmount(order) < calculateOrderTotal(order) ? "text-teal-600 dark:text-teal-400 font-bold" : "text-zinc-600 dark:text-zinc-400"}>
                        ₹{formatCurrency(getOrderPaidAmount(order))}
                      </span>
                      <span className="text-zinc-400 dark:text-zinc-500 mx-1">/</span>
                      <span className="text-zinc-500 dark:text-zinc-400">₹{formatCurrency(calculateOrderTotal(order))}</span>
                    </td>
                    <td className="py-4 px-6 font-bold text-zinc-800 dark:text-zinc-100 text-right">
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
      <div className="bg-white dark:bg-[#1a1d27] shadow-sm rounded-2xl overflow-hidden transition-colors animate-slide-up-fade mt-8" style={{ animationDelay: '500ms' }}>
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-white dark:bg-[#0a0c14] transition-colors">
          <h2 className="text-md font-bold text-zinc-800 dark:text-zinc-100">Daily Sales Breakdown</h2>
        </div>
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-white dark:bg-[#1a1d27] border-b border-zinc-200 dark:border-zinc-800 transition-colors">
              <tr className="text-zinc-500 dark:text-zinc-400">
                <th className="py-4 px-6 font-semibold uppercase tracking-wider text-xs whitespace-nowrap">Date</th>
                <th className="py-4 px-6 font-semibold uppercase tracking-wider text-xs whitespace-nowrap">Customer Name</th>
                <th className="py-4 px-6 font-semibold uppercase tracking-wider text-xs whitespace-nowrap">Created By</th>
                <th className="py-4 px-6 font-semibold uppercase tracking-wider text-xs text-right whitespace-nowrap">Paid Amount</th>
                <th className="py-4 px-6 font-semibold uppercase tracking-wider text-xs text-right whitespace-nowrap">Pending Amount</th>
                <th className="py-4 px-6 font-semibold uppercase tracking-wider text-xs whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200/50 dark:divide-white/5">
              {Object.keys(dailySales).length === 0 ? (
                <tr><td colSpan="6" className="py-8 text-center text-zinc-500 dark:text-zinc-400">No orders found.</td></tr>
              ) : Object.entries(dailySales).map(([date, dailyOrders]) => (
                <React.Fragment key={date}>
                  {dailyOrders.map((order, idx) => {
                    const total = calculateOrderTotal(order);
                    const isPaid = order.status === 'Paid' || order.status === 'Delivered';
                    const isPending = order.status === 'Pending' || order.status === 'Processing';
                    return (
                      <tr key={order.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group">
                        {idx === 0 ? (
                          <td className="py-4 px-6 font-medium text-zinc-800 dark:text-zinc-200 whitespace-nowrap border-r border-zinc-200 dark:border-zinc-800 align-top" rowSpan={dailyOrders.length}>{date}</td>
                        ) : null}
                        <td className="py-4 px-6 text-zinc-600 dark:text-zinc-300 whitespace-nowrap">{getCustomerName(order.customerId)} <span className="text-xs opacity-50">({order.customerId})</span></td>
                        <td className="py-4 px-6 text-zinc-500 dark:text-zinc-400 text-xs font-medium">{getCreatorName(order.owner_id)}</td>
                        <td className="py-4 px-6 text-emerald-600 dark:text-emerald-400 font-medium text-right whitespace-nowrap">{isPaid ? `₹${formatCurrency(total)}` : '-'}</td>
                        <td className="py-4 px-6 text-amber-600 dark:text-amber-400 font-medium text-right whitespace-nowrap">{isPending ? `₹${formatCurrency(total)}` : '-'}</td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                            isPaid ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:text-emerald-400' :
                            isPending ? 'bg-amber-500/10 text-amber-600 border-amber-500/30 dark:text-amber-400' :
                            'bg-white text-zinc-600 border-white/20 dark:text-zinc-300'
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
        <div className="fixed inset-0 z-60 flex">
          <div className="absolute inset-0 bg-[#0a0c14]/60 backdrop-blur-sm" onClick={() => setIsSalesDetailOpen(false)}></div>
          <div className="absolute inset-y-0 right-0 w-full sm:w-[480px] bg-white dark:bg-[#1a1d27] shadow-sm border-l border-white/10 shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white backdrop-blur-md">
              <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">Sales by Customer</h2>
              <button onClick={() => setIsSalesDetailOpen(false)} className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-white transition-colors">✕</button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {Object.entries(salesByCustomer).map(([custId, custOrders]) => (
                <div key={custId} className="bg-white dark:bg-[#1a1d27] shadow-sm p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <div className="flex justify-between items-center mb-3">
                    <p className="font-bold text-zinc-800 dark:text-zinc-200">{getCustomerName(custId)}</p>
                    <p className="font-bold text-emerald-600 dark:text-emerald-400">₹{formatCurrency(custOrders.reduce((sum, o) => sum + calculateOrderTotal(o), 0))}</p>
                  </div>
                  <div className="space-y-2">
                    {custOrders.map(order => (
                      <div key={order.id} className="flex justify-between text-sm bg-zinc-50 dark:bg-zinc-900 p-2 rounded-lg">
                        <span className="text-zinc-600 dark:text-zinc-400">{order.id} ({order.date})</span>
                        <span className="text-zinc-700 dark:text-zinc-300 font-medium">₹{formatCurrency(calculateOrderTotal(order))}</span>
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
        <div className="fixed inset-0 z-60 flex">
          <div className="absolute inset-0 bg-[#0a0c14]/60 backdrop-blur-sm" onClick={() => setIsProductBreakdownOpen(false)}></div>
          <div className="absolute inset-y-0 right-0 w-full sm:w-[480px] bg-white dark:bg-[#1a1d27] shadow-sm border-l border-white/10 shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white backdrop-blur-md">
              <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">Product Breakdown</h2>
              <button onClick={() => setIsProductBreakdownOpen(false)} className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-white transition-colors">✕</button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {Object.values(productBreakdown).sort((a,b) => b.totalQty - a.totalQty).map((prod, idx) => (
                <div key={idx} className="bg-white dark:bg-[#1a1d27] shadow-sm p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-bold text-zinc-800 dark:text-zinc-200">{prod.name}</p>
                    <div className="text-right">
                      <p className="font-bold text-purple-600 dark:text-purple-400">{prod.totalQty} units</p>
                      <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">₹{formatCurrency(prod.totalRevenue)}</p>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Bought by {prod.customers.size} customers</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Transactions Inline Modal */}
      {selectedSaleOrder && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0a0c14]/80 backdrop-blur-sm" onClick={() => setSelectedSaleOrder(null)}></div>
          <div className="relative bg-white dark:bg-[#1a1d27] shadow-xl rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300 transition-colors border border-white/20 flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-white backdrop-blur-md">
              <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">Order {selectedSaleOrder.id}</h3>
              <button onClick={() => setSelectedSaleOrder(null)} className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-white transition-colors">✕</button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="flex justify-between mb-6">
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Date: {selectedSaleOrder.date}</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Status: <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{selectedSaleOrder.status}</span></p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Customer: <span className="font-bold text-zinc-800 dark:text-zinc-200">{getCustomerName(selectedSaleOrder.customerId)}</span></p>
                </div>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden mb-6">
                <table className="w-full text-left text-sm">
                  <thead className="bg-zinc-100 dark:bg-white border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400">
                    <tr>
                      <th className="px-4 py-2 font-medium">Item</th>
                      <th className="px-4 py-2 font-medium">Qty</th>
                      <th className="px-4 py-2 font-medium text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200/50 dark:divide-white/5">
                    {selectedSaleOrder.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">{item.name}</td>
                        <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">{item.qty}</td>
                        <td className="px-4 py-3 text-right text-zinc-700 dark:text-zinc-300 font-medium">₹{formatCurrency(calculateRowTotal(item))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="p-4 bg-zinc-100 dark:bg-white text-right border-t border-zinc-200 dark:border-zinc-800">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Total: <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 ml-2">₹{formatCurrency(calculateOrderTotal(selectedSaleOrder))}</span></p>
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
      </div>
    </div>
  );
};

export default Sales;
