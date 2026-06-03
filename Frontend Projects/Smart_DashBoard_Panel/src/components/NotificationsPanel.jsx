import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import useCustomerContext from '../context/CustomerContext';
import useOrderContext from '../context/OrderContext';
import { useVisitContext } from '../context/VisitContext';
import { useBeatContext } from '../context/BeatContext';
import { getOrderOutstanding } from '../utils/financeUtils';
import { useNavigate } from 'react-router-dom';
import { useSupplyChainContext } from '../context/SupplyChainContext';
import { useProductContext } from '../context/ProductContext';

const NotificationsPanel = () => {
  const { isNotificationsOpen, onOpenNotificationsHandler } = useAuth();
  const { customers } = useCustomerContext();
  const { orders } = useOrderContext();
  const { visits } = useVisitContext();
  const { beats } = useBeatContext();
  const { superStockists, distributors, inventoryLedger } = useSupplyChainContext();
  const { products } = useProductContext();
  const navigate = useNavigate();

  const [dismissedIds, setDismissedIds] = useState(new Set());
  const [filter, setFilter] = useState('All'); // All, Urgent, Reminders

  const handleDismiss = (id, e) => {
    e.stopPropagation();
    setDismissedIds(prev => new Set(prev).add(id));
  };

  const notifications = useMemo(() => {
    const notifs = [];
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // 1. Overdue payments
    orders.forEach(order => {
      if (order.status === 'Pending' || order.status === 'Partially Paid') {
        const orderDate = new Date(order.date);
        const diffDays = Math.floor((today - orderDate) / (1000 * 60 * 60 * 24));
        if (diffDays > 7) {
          const customer = customers.find(c => c.id === order.customerId);
          const amt = getOrderOutstanding(order);
          if (amt > 0) {
            notifs.push({
              id: `overdue-${order.id}`,
              type: 'Urgent',
              icon: '💰',
              color: 'text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-500/20',
              title: 'Overdue Payment',
              message: `${customer?.name || 'Unknown'} has an overdue payment of ₹${amt.toLocaleString()} for ${diffDays} days.`,
              date: order.date,
              action: () => navigate('/dashboard/customers', { state: { openCustomerId: customer?.id } })
            });
          }
        }
      }
    });

    // 2. Scheduled visits today
    visits.forEach(visit => {
      if (visit.status === 'Scheduled' && visit.visitDate === todayStr) {
        const customer = customers.find(c => c.id === visit.customerId);
        notifs.push({
          id: `sched-${visit.id}`,
          type: 'Reminders',
          icon: '📅',
          color: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-500/20',
          title: 'Scheduled Visit',
          message: `Visit scheduled with ${customer?.name || 'Unknown'} today.`,
          date: todayStr,
          action: () => navigate('/dashboard/customers', { state: { openCustomerId: customer?.id } })
        });
      }
    });

    // 3. Missed visits (last 7 days)
    visits.forEach(visit => {
      if (visit.status === 'Missed') {
        const visitDate = new Date(visit.visitDate);
        const diffDays = Math.floor((today - visitDate) / (1000 * 60 * 60 * 24));
        if (diffDays <= 7) {
          const customer = customers.find(c => c.id === visit.customerId);
          notifs.push({
            id: `missed-${visit.id}`,
            type: 'Urgent',
            icon: '⚠️',
            color: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-500/20',
            title: 'Missed Visit',
            message: `Missed visit with ${customer?.name || 'Unknown'} on ${visit.visitDate}.`,
            date: visit.visitDate,
            action: () => navigate('/dashboard/customers', { state: { openCustomerId: customer?.id } })
          });
        }
      }
    });

    // 4 & 5. Customers without beat / location & 6. High Balance
    customers.forEach(customer => {
      // Is assigned?
      const isAssigned = beats.some(b => b.assignedCustomers?.includes(customer.id));
      if (!isAssigned) {
        notifs.push({
          id: `nobeat-${customer.id}`,
          type: 'Reminders',
          icon: '🗺️',
          color: 'text-zinc-600 bg-zinc-100 dark:text-zinc-400 dark:bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400',
          title: 'Unassigned Customer',
          message: `${customer.name} has no beat assigned.`,
          date: todayStr,
          action: () => navigate('/dashboard/beats')
        });
      }

      // Missing location
      if (!customer.lat || !customer.lng) {
        notifs.push({
          id: `nolocation-${customer.id}`,
          type: 'Reminders',
          icon: '📍',
          color: 'text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-500/20',
          title: 'Missing Location',
          message: `${customer.name} has no GPS location.`,
          date: todayStr,
          action: () => navigate('/dashboard/map')
        });
      }

      // High balance
      const outstanding = orders
        .filter(o => o.customerId === customer.id)
        .reduce((sum, o) => sum + getOrderOutstanding(o), 0);
      
      if (outstanding > 50000) {
        notifs.push({
          id: `highbal-${customer.id}`,
          type: 'Urgent',
          icon: '🚨',
          color: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-500/20',
          title: 'High Outstanding Balance',
          message: `${customer.name} has an outstanding balance of ₹${outstanding.toLocaleString()}.`,
          date: todayStr,
          action: () => navigate('/dashboard/customers', { state: { openCustomerId: customer.id } })
        });
      }
    });

    // 7. Supply Chain Low Stock Alerts
    inventoryLedger.forEach(item => {
      if (item.currentStock <= item.reorderLevel) {
        const product = products.find(p => p.sku === item.sku);
        if (!product) return;

        if (item.distributorId) {
          const distributor = distributors.find(d => d.id === item.distributorId);
          if (distributor) {
            notifs.push({
              id: `lowstock-db-${distributor.id}-${item.sku}`,
              type: 'Urgent',
              icon: '📦',
              color: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-500/20',
              title: 'Low Inventory Alert (Distributor)',
              message: `${distributor.name} (${distributor.district}) is running low on ${product.name} (${item.currentStock} / ${item.reorderLevel} units).`,
              date: todayStr,
              action: () => navigate('/dashboard/supply-chain')
            });
          }
        } else if (item.superStockistId) {
          const ss = superStockists.find(s => s.id === item.superStockistId);
          if (ss) {
            notifs.push({
              id: `lowstock-ss-${ss.id}-${item.sku}`,
              type: 'Urgent',
              icon: '📦',
              color: 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-500/20',
              title: 'Low Inventory Alert (Super Stockist)',
              message: `Super Stockist ${ss.name} (${ss.state}) is running low on ${product.name} (${item.currentStock} / ${item.reorderLevel} units).`,
              date: todayStr,
              action: () => navigate('/dashboard/supply-chain')
            });
          }
        }
      }
    });

    // Filter out dismissed
    return notifs
      .filter(n => !dismissedIds.has(n.id))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [orders, visits, customers, beats, dismissedIds, navigate, inventoryLedger, distributors, products]);

  const filteredNotifs = notifications.filter(n => filter === 'All' || n.type === filter);

  return (
    <>
      {isNotificationsOpen && (
        <div
          className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm z-[90] transition-opacity"
          onClick={onOpenNotificationsHandler}
        ></div>
      )}

      <div
        className={`fixed top-0 right-0 h-full w-full max-w-[400px] bg-white dark:bg-[#1a1d27] shadow-sm shadow-2xl z-[100] transform transition-transform duration-300 ease-in-out border-l border-zinc-200 dark:border-zinc-800 ${
          isNotificationsOpen ? 'translate-x-0' : 'translate-x-full'
        } flex flex-col`}
      >
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-white dark:bg-zinc-900">
          <div>
            <h2 className="text-xl font-bold text-zinc-800 dark:text-white">Notifications</h2>
            <p className="text-sm text-zinc-500">{notifications.length} Unread</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setDismissedIds(new Set([...dismissedIds, ...notifications.map(n => n.id)]))}
              className="text-xs font-semibold text-indigo-600 dark:text-purple-400 hover:text-purple-700 transition-colors"
            >
              Dismiss All
            </button>
            <button
              onClick={onOpenNotificationsHandler}
              className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
        </div>

        <div className="px-6 py-4 flex gap-2 border-b border-zinc-200 dark:border-zinc-800">
          {['All', 'Urgent', 'Reminders'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                filter === f 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {filteredNotifs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500">
              <span className="text-4xl mb-3">📭</span>
              <p className="font-medium">You're all caught up!</p>
            </div>
          ) : (
            filteredNotifs.map(notif => (
              <div 
                key={notif.id}
                onClick={() => {
                  if (notif.action) notif.action();
                  onOpenNotificationsHandler();
                }}
                className="p-4 rounded-xl bg-white dark:bg-[#1a1d27] shadow-sm border border-zinc-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-500/50 cursor-pointer transition-all flex gap-4 group"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${notif.color} text-lg`}>
                  {notif.icon}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-sm text-zinc-800 dark:text-zinc-100">{notif.title}</h4>
                    <button 
                      onClick={(e) => handleDismiss(notif.id, e)}
                      className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-opacity p-1 -mr-1 -mt-1"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1 leading-relaxed">{notif.message}</p>
                  <p className="text-[10px] text-zinc-400 mt-2 font-medium">{notif.date}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationsPanel;
