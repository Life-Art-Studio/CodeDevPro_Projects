import React, { useMemo, useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { calculateOrderTotal, formatCurrency } from '../../utils/financeUtils';
import CustomSelect from '../ui/CustomSelect';

const ReportsTab = ({ orders }) => {
  const analytics = useMemo(() => {
    let totalRevenue = 0;
    let totalOrders = orders.length;
    let monthlyData = {};

    orders.forEach(order => {
      const orderTotal = calculateOrderTotal(order);
      if (order.status !== 'Cancelled') {
        totalRevenue += orderTotal;
        const date = new Date(order.date);
        const month = date.toLocaleString('default', { month: 'short' });
        if (!monthlyData[month]) monthlyData[month] = 0;
        monthlyData[month] += orderTotal;
      }
    });

    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    const chartData = Object.keys(monthlyData).map(month => ({
      name: month,
      Revenue: monthlyData[month]
    }));

    return { totalRevenue, totalOrders, averageOrderValue, chartData };
  }, [orders]);

  const [isMounted, setIsMounted] = useState(false);
  const [reportType, setReportType] = useState("Monthly Report");
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Analytics & Reports</h3>
        <CustomSelect 
          value={reportType}
          onChange={setReportType}
          className="px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-[#1a1d27] text-zinc-700 dark:text-zinc-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 flex items-center justify-between outline-none cursor-pointer"
          options={[
            { value: 'Weekly Report', label: 'Weekly Report' },
            { value: 'Monthly Report', label: 'Monthly Report' },
            { value: 'Quarterly Report', label: 'Quarterly Report' },
            { value: 'Annual GST Summary', label: 'Annual GST Summary' }
          ]}
          minWidth="160px"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">₹{formatCurrency(analytics.totalRevenue)}</p>
        </div>
        <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium mb-1">Total Orders</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{analytics.totalOrders}</p>
        </div>
        <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium mb-1">Avg Order Value</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">₹{formatCurrency(analytics.averageOrderValue)}</p>
        </div>
      </div>

      <div className="h-72 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 bg-white dark:bg-[#1a1d27] min-h-[288px] w-full">
        {isMounted && (
          <ResponsiveContainer width="99%" height="99%" minWidth={1} minHeight={1}>
            <BarChart data={analytics.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" strokeOpacity={0.5} className="dark:stroke-zinc-800" />
              <XAxis dataKey="name" stroke="#a1a1aa" tick={{fill: '#a1a1aa', fontSize: 12}} tickLine={false} axisLine={false} dy={10} />
              <YAxis stroke="#a1a1aa" tick={{fill: '#a1a1aa', fontSize: 12}} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
              <Tooltip 
                formatter={(v) => [`₹${v.toFixed(2)}`, 'Revenue']} 
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e4e4e7', color: '#18181b', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                itemStyle={{ color: '#4f46e5', fontWeight: '600' }}
                cursor={{ fill: 'rgba(79, 70, 229, 0.05)' }}
              />
              <Bar dataKey="Revenue" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default ReportsTab;
