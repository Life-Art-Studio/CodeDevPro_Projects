import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useBeatContext } from '../context/BeatContext';
import { useVisitContext } from '../context/VisitContext';
import useCustomerContext from '../context/CustomerContext';
import useOrderContext from '../context/OrderContext';
import LogVisitModal from '../components/Beats/LogVisitModal';
import CreateBeatModal from '../components/Beats/CreateBeatModal';
import { calculateOrderTotal, getOrderPaidAmount, getOrderOutstanding, formatCurrency } from '../utils/financeUtils';
import { generateBeatPDF } from '../utils/generateBeatPdf';
import { useAuth } from '../context/AuthContext';
import BeatsCalendar from '../components/Beats/BeatsCalendar';

const Beats = () => {
  const { currentUser } = useAuth();
  const { beats, addBeat, updateBeat, deleteBeat, addCustomerToBeat, removeCustomerFromBeat } = useBeatContext();
  const { visits, addVisit } = useVisitContext();
  const { customers } = useCustomerContext();
  const { orders } = useOrderContext();
  const navigate = useNavigate();

  const [selectedBeatId, setSelectedBeatId] = useState(null);
  const selectedBeat = beats.find(b => b.id === selectedBeatId) || null;
  const [activeTab, setActiveTab] = useState('info');
  const [isLogVisitModalOpen, setIsLogVisitModalOpen] = useState(false);
  const [isCreateBeatModalOpen, setIsCreateBeatModalOpen] = useState(false);
  const [selectedCustomers, setSelectedCustomers] = useState(new Set());
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'

  const handleAddBeat = () => {
    setIsCreateBeatModalOpen(true);
  };

  const getCustomerName = (id) => customers.find(c => c.id === id)?.name || 'Unknown';

  const renderInfoTab = () => {
    // 1. Gather all customers in this beat
    const assignedIds = selectedBeat.assignedCustomers || [];
    
    // 2. Gather all orders for these customers
    const beatOrders = orders.filter(o => assignedIds.includes(o.customerId));
    const paidOrders = beatOrders.filter(o => o.status === 'Paid' || o.status === 'Partially Paid');
    
    const totalOrders = beatOrders.length;
    const totalRevenue = paidOrders.reduce((sum, o) => sum + getOrderPaidAmount(o), 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const outstandingBalance = beatOrders.reduce((sum, o) => sum + getOrderOutstanding(o), 0);

    // 3. Gather visits
    const beatVisits = visits.filter(v => v.beatId === selectedBeat.id);
    const visitedCount = beatVisits.filter(v => v.status === 'Visited').length;
    const missedCount = beatVisits.filter(v => v.status === 'Missed').length;
    const visitRate = (visitedCount + missedCount) > 0 ? (visitedCount / (visitedCount + missedCount)) * 100 : 0;

    // 4. Last Activity
    const allDates = [
      ...beatOrders.map(o => new Date(o.date).getTime()),
      ...beatVisits.map(v => new Date(v.visitDate).getTime())
    ].filter(d => !isNaN(d));
    const lastActivity = allDates.length > 0 ? new Date(Math.max(...allDates)).toLocaleDateString() : 'No Activity';

    return (
      <div className="flex flex-col gap-6 animate-in fade-in">
        <div className="bg-white dark:bg-[#1a1d27] shadow-sm p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <span className="bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-400 text-xs font-bold px-2 py-1 rounded-md border border-teal-200 dark:border-teal-500/30">Live Data</span>
          </div>
          <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-100 mb-6">Beat Performance</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-zinc-50 dark:bg-zinc-900 p-3 sm:p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 uppercase font-bold tracking-wider mb-1 truncate">Total Revenue</p>
              <p className="text-[clamp(0.7rem,3.5vw,1.25rem)] leading-tight font-extrabold text-emerald-600 dark:text-emerald-400">₹{formatCurrency(totalRevenue)}</p>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-900 p-3 sm:p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 uppercase font-bold tracking-wider mb-1 truncate">Total Orders</p>
              <p className="text-[clamp(0.7rem,3.5vw,1.25rem)] leading-tight font-extrabold text-purple-600 dark:text-purple-400">{totalOrders}</p>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-900 p-3 sm:p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 uppercase font-bold tracking-wider mb-1 truncate">Visit Rate</p>
              <div className="flex items-end gap-2">
                <p className={`text-[clamp(0.7rem,3.5vw,1.25rem)] leading-tight font-extrabold ${visitRate >= 70 ? 'text-emerald-600' : visitRate >= 40 ? 'text-amber-600' : 'text-red-600'}`}>
                  {visitRate.toFixed(0)}%
                </p>
              </div>
              <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 mt-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${visitRate >= 70 ? 'bg-emerald-500' : visitRate >= 40 ? 'bg-amber-500' : 'bg-red-500'}`} 
                  style={{ width: `${visitRate}%` }}
                ></div>
              </div>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-900 p-3 sm:p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 uppercase font-bold tracking-wider mb-1 truncate">Avg Order Value</p>
              <p className="text-[clamp(0.7rem,3.5vw,1.25rem)] leading-tight font-extrabold text-zinc-800 dark:text-zinc-100">₹{formatCurrency(averageOrderValue)}</p>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-900 p-3 sm:p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 uppercase font-bold tracking-wider mb-1 truncate">Last Activity</p>
              <p className="text-[clamp(0.7rem,3.5vw,1.125rem)] leading-tight font-bold text-zinc-700 dark:text-zinc-300">{lastActivity}</p>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-900 p-3 sm:p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 uppercase font-bold tracking-wider mb-1 truncate">Outstanding</p>
              <p className="text-[clamp(0.7rem,3.5vw,1.25rem)] leading-tight font-extrabold text-amber-600 dark:text-amber-500">₹{formatCurrency(outstandingBalance)}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCustomersTab = () => {
    const assignedIds = selectedBeat.assignedCustomers || [];
    const assignedCustomers = customers.filter(c => assignedIds.includes(c.id));
    const availableCustomers = customers.filter(c => !assignedIds.includes(c.id));
    const beatVisits = visits
      .filter(v => v.beatId === selectedBeat.id)
      .sort((a, b) => new Date(b.visitDate) - new Date(a.visitDate));

    return (
      <div className="flex flex-col h-full animate-in fade-in relative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full pb-16">
          {/* Assigned Customers */}
          <div className="flex flex-col">
            <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-100 mb-4">Assigned to Beat ({assignedCustomers.length})</h3>
            <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
              {assignedCustomers.length === 0 ? (
                <p className="text-zinc-500 text-sm">No customers assigned yet.</p>
              ) : (
                assignedCustomers.map(c => (
                  <div key={c.id} className="flex justify-between items-center p-3 bg-white dark:bg-[#1a1d27] shadow-sm rounded-xl border border-zinc-200 dark:border-zinc-800 group">
                    <div 
                      className="cursor-pointer overflow-hidden"
                      onClick={() => navigate('/dashboard/customers', { state: { openCustomerId: c.id } })}
                    >
                      <p className="font-semibold text-sm text-zinc-800 dark:text-zinc-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors truncate">{c.name}</p>
                      <p className="text-xs text-zinc-500 truncate">{c.id}</p>
                    </div>
                    {currentUser?.role !== 'ADMIN' && (
                      <button 
                        onClick={() => removeCustomerFromBeat(selectedBeat.id, c.id)}
                        className="text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 p-2 rounded-lg transition-colors text-xs font-semibold"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Available Customers */}
          <div className="flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">Available Customers</h3>
              {currentUser?.role !== 'ADMIN' && (
                <label className="flex items-center gap-2 text-sm font-semibold text-zinc-600 dark:text-zinc-300 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={availableCustomers.length > 0 && selectedCustomers.size === availableCustomers.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedCustomers(new Set(availableCustomers.map(c => c.id)));
                      } else {
                        setSelectedCustomers(new Set());
                      }
                    }}
                    className="rounded text-purple-600 focus:ring-purple-500"
                  />
                  Select All
                </label>
              )}
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
              {availableCustomers.length === 0 ? (
                <p className="text-zinc-500 text-sm">All customers are assigned to beats.</p>
              ) : (
                availableCustomers.map(c => (
                  <label key={c.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                    currentUser?.role !== 'ADMIN' ? 'cursor-pointer' : 'cursor-default'
                  } ${
                    selectedCustomers.has(c.id) 
                      ? 'bg-purple-50 border-purple-300 dark:bg-purple-500/10 dark:border-purple-500/50' 
                      : 'bg-white dark:bg-[#1a1d27] shadow-sm border-zinc-200 dark:border-zinc-800 hover:border-purple-200 dark:hover:border-white/20'
                  }`}>
                    {currentUser?.role !== 'ADMIN' && (
                      <input 
                        type="checkbox"
                        checked={selectedCustomers.has(c.id)}
                        onChange={(e) => {
                          const newSet = new Set(selectedCustomers);
                          if (e.target.checked) newSet.add(c.id);
                          else newSet.delete(c.id);
                          setSelectedCustomers(newSet);
                        }}
                        className="rounded text-purple-600 focus:ring-purple-500"
                      />
                    )}
                    <div 
                      className="cursor-pointer hover:text-purple-600 dark:hover:text-purple-400 transition-colors w-full overflow-hidden"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navigate('/dashboard/customers', { state: { openCustomerId: c.id } });
                      }}
                    >
                      <p className="font-semibold text-sm text-zinc-800 dark:text-zinc-100 truncate">{c.name}</p>
                      <p className="text-xs text-zinc-500 truncate">{c.id}</p>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Floating Action Bar */}
        {selectedCustomers.size > 0 && currentUser?.role !== 'ADMIN' && (
          <div className="absolute bottom-4 left-0 right-0 mx-auto w-[90%] md:w-[70%] bg-white dark:bg-[#1a1d27] shadow-xl rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] p-4 flex justify-between items-center z-20 border border-white/20 animate-slide-up-fade">
            <span className="font-bold text-zinc-800 dark:text-white">
              <span className="text-purple-600 dark:text-purple-400 text-lg mr-1">{selectedCustomers.size}</span>
              customers selected
            </span>
            <div className="flex gap-3">
              <button 
                onClick={() => setSelectedCustomers(new Set())}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  selectedCustomers.forEach(id => {
                    addCustomerToBeat(selectedBeat.id, id);
                  });
                  setSelectedCustomers(new Set());
                }}
                className="px-6 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-500 hover:shadow-lg hover:shadow-purple-500/30 transition-all"
              >
                Assign to This Beat
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderVisitsTab = () => {
    const beatVisits = visits
      .filter(v => v.beatId === selectedBeat.id)
      .sort((a, b) => new Date(b.visitDate) - new Date(a.visitDate));

    return (
      <div className="flex flex-col h-full animate-in fade-in">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">Visit Timeline</h3>
          {currentUser?.role !== 'ADMIN' && (
            <button 
              onClick={() => setIsLogVisitModalOpen(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors"
            >
              + Log Visit
            </button>
          )}
        </div>

        <div className="space-y-4">
          {beatVisits.length === 0 ? (
            <p className="text-zinc-500 dark:text-zinc-400 text-center py-8">No visits recorded yet.</p>
          ) : (
            beatVisits.map(visit => (
              <div key={visit.id} className={`p-4 rounded-xl bg-white dark:bg-[#1a1d27] shadow-sm border-l-4 transition-all ${
                visit.status === 'Visited' ? 'border-l-emerald-500' :
                visit.status === 'Missed' ? 'border-l-red-500' :
                'border-l-amber-500'
              }`}>
                <div className="flex justify-between items-start mb-2 gap-2">
                  <div className="overflow-hidden">
                    <h4 className="font-bold text-zinc-800 dark:text-zinc-100 truncate">{getCustomerName(visit.customerId)}</h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{visit.visitDate} • {visit.visitTime}</p>
                  </div>
                  <span className={`px-2 py-1 text-[10px] uppercase font-bold rounded-full ${
                    visit.status === 'Visited' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                    visit.status === 'Missed' ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' :
                    'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                  }`}>
                    {visit.status}
                  </span>
                </div>
                {visit.notes && <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-2">{visit.notes}</p>}
                {visit.nextVisitDate && (
                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-2 font-medium">
                    📅 Next Visit: {visit.nextVisitDate}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col z-0">
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8 bg-zinc-50 dark:bg-[#0f1117] font-sans transition-colors animate-in fade-in duration-500">
        <div className="max-w-7xl mx-auto h-full flex flex-col md:flex-row gap-6">
      
      {/* LEFT PANEL: Beat List */}
      <div className={`w-full md:w-1/3 flex-col bg-white dark:bg-[#1a1d27] shadow-sm rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 transition-colors ${selectedBeat ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 flex justify-between items-center transition-colors">
          <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">Beats</h2>
          <div className="flex gap-2">
            <div className="flex bg-zinc-200 dark:bg-zinc-800 p-1 rounded-lg">
              <button 
                onClick={() => setViewMode('list')}
                className={`px-2 py-1 rounded-md text-xs font-semibold transition-all ${viewMode === 'list' ? 'bg-white dark:bg-zinc-600 text-zinc-800 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
              >
                List
              </button>
              <button 
                onClick={() => setViewMode('calendar')}
                className={`px-2 py-1 rounded-md text-xs font-semibold transition-all ${viewMode === 'calendar' ? 'bg-white dark:bg-zinc-600 text-zinc-800 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
              >
                Cal
              </button>
            </div>
            {currentUser?.role !== 'ADMIN' && (
              <button 
                onClick={handleAddBeat}
                className="p-1.5 bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-500/30 transition-colors"
              >
                + New
              </button>
            )}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {beats.length === 0 ? (
            <div className="text-center py-10 text-zinc-500 dark:text-zinc-400">
              No beats found. Create one!
            </div>
          ) : (
            beats.map(beat => {
              const beatVisits = visits.filter(v => v.beatId === beat.id);
              const visitedCount = beatVisits.filter(v => v.status === 'Visited').length;
              const missedCount = beatVisits.filter(v => v.status === 'Missed').length;
              const scheduledCount = beatVisits.filter(v => v.status === 'Scheduled').length;

              return (
                <div 
                  key={beat.id}
                  onClick={() => { setSelectedBeatId(beat.id); setActiveTab('info'); }}
                  className={`p-4 rounded-xl cursor-pointer transition-all border ${
                    selectedBeat?.id === beat.id 
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.15)]' 
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-purple-300 dark:hover:border-purple-500/50 bg-white dark:bg-[#0a0c14]'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-zinc-800 dark:text-zinc-100">{beat.name}</h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{beat.id}</p>
                    </div>
                    <span className="text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 px-2 py-1 rounded-full">
                      {beat.assignedCustomers?.length || 0} Cust.
                    </span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {visitedCount > 0 && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded">V: {visitedCount}</span>}
                    {missedCount > 0 && <span className="text-[10px] font-bold text-red-600 bg-red-50 dark:bg-red-500/10 px-1.5 py-0.5 rounded">M: {missedCount}</span>}
                    {scheduledCount > 0 && <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-500/10 px-1.5 py-0.5 rounded">S: {scheduledCount}</span>}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT PANEL: Beat Detail */}
      {viewMode === 'calendar' ? (
        <div className="w-full md:w-2/3 flex flex-col bg-white dark:bg-[#1a1d27] shadow-sm rounded-2xl overflow-hidden shadow-sm border border-zinc-200 dark:border-zinc-800 transition-colors p-6">
          <BeatsCalendar />
        </div>
      ) : (
        <div className={`w-full md:w-2/3 flex-col bg-white dark:bg-[#1a1d27] shadow-sm rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 transition-colors ${!selectedBeat ? 'hidden md:flex' : 'flex'}`}>
          {selectedBeat ? (
            <div className="flex-1 flex flex-col p-4 sm:p-6 overflow-y-auto custom-scrollbar">
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setSelectedBeatId(null)}
                      className="md:hidden p-2 -ml-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white rounded-lg transition-colors shrink-0"
                      title="Close Details"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                    </button>
                    <h2 className="text-xl sm:text-2xl font-bold text-zinc-800 dark:text-zinc-100 truncate">{selectedBeat.name}</h2>
                  </div>
                  <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    {currentUser?.role !== 'ADMIN' && (
                      <button 
                        onClick={() => {
                          toast((t) => (
                            <div className="flex flex-col gap-2">
                              <span className="font-semibold text-sm">Are you sure you want to delete the beat "{selectedBeat.name}"?</span>
                              <div className="flex gap-2 justify-end mt-2">
                                <button 
                                  onClick={() => {
                                    toast.dismiss(t.id);
                                    deleteBeat(selectedBeat.id);
                                    setSelectedBeatId(null);
                                    toast.success("Beat deleted successfully.");
                                  }}
                                  className="bg-red-500 text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-red-600 transition-colors"
                                >Delete</button>
                                <button onClick={() => toast.dismiss(t.id)} className="bg-zinc-200 dark:bg-zinc-700 px-3 py-1 rounded-lg text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors">Cancel</button>
                              </div>
                            </div>
                          ), { duration: Infinity });
                        }}
                        className="px-4 py-2 bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 rounded-lg text-sm font-semibold hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        Delete
                      </button>
                    )}
                    <button 
                      onClick={() => generateBeatPDF(selectedBeat, customers, orders, visits, getOrderPaidAmount, getOrderOutstanding)}
                      className="flex-1 sm:flex-none justify-center px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg text-sm font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                      Export Report
                    </button>
                    <button 
                      onClick={() => setSelectedBeatId(null)}
                      className="hidden md:flex justify-center px-3 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors"
                      title="Close Details"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <div className="flex gap-4 mt-4 border-b border-zinc-200 dark:border-zinc-800">
                  {['info', 'customers', 'visits'].map(tab => (
                    <button 
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`pb-2 text-sm font-semibold capitalize transition-colors ${
                        activeTab === tab 
                          ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400' 
                          : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 relative">
                {activeTab === 'info' && renderInfoTab()}
                {activeTab === 'customers' && renderCustomersTab()}
                {activeTab === 'visits' && renderVisitsTab()}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 dark:text-zinc-400 p-8 text-center">
              <div className="w-20 h-20 mb-4 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-4xl">
                🗺️
              </div>
              <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 mb-2">No Beat Selected</h3>
              <p>Select a beat from the list to view its details, assigned customers, and schedule.</p>
            </div>
          )}
        </div>
      )}

      <LogVisitModal 
        isOpen={isLogVisitModalOpen}
        onClose={() => setIsLogVisitModalOpen(false)}
        onSubmit={(data) => {
          addVisit(data);
        }}
        beat={selectedBeat}
      />
      
      <CreateBeatModal 
        isOpen={isCreateBeatModalOpen}
        onClose={() => setIsCreateBeatModalOpen(false)}
        onSubmit={addBeat}
      />
        </div>
      </div>
    </div>
  );
};

export default Beats;
