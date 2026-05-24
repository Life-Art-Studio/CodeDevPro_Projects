import React, { useState } from 'react';
import { useVisitContext } from '../../context/VisitContext';
import { useBeatContext } from '../../context/BeatContext';
import useCustomerContext from '../../context/CustomerContext';
import LogVisitModal from './LogVisitModal';

const BeatsCalendar = () => {
  const { visits, updateVisit } = useVisitContext();
  const { beats } = useBeatContext();
  const { customers } = useCustomerContext();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const handleVisitClick = (visit) => {
    setSelectedVisit(visit);
    setIsModalOpen(true);
  };

  const handleSaveVisit = (updatedData) => {
    updateVisit(updatedData.id, updatedData);
  };

  const renderCells = () => {
    const cells = [];
    const monthStr = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const yearStr = currentDate.getFullYear();

    for (let i = 0; i < firstDayOfMonth; i++) {
      cells.push(<div key={`empty-${i}`} className="bg-slate-50/50 dark:bg-slate-900/30 min-h-[100px] border border-slate-200/50 dark:border-white/5"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dayStr = day.toString().padStart(2, '0');
      const dateString = `${yearStr}-${monthStr}-${dayStr}`;
      
      const dayVisits = visits.filter(v => v.visitDate === dateString);

      cells.push(
        <div key={day} className="bg-white dark:bg-[#0a0c14] min-h-[100px] p-2 border border-slate-200/50 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
          <p className="text-xs font-bold text-slate-400 mb-1">{day}</p>
          <div className="space-y-1">
            {dayVisits.map(visit => {
              const customer = customers.find(c => c.id === visit.customerId);
              const isVisited = visit.status === 'Visited';
              const isMissed = visit.status === 'Missed';
              return (
                <div 
                  key={visit.id}
                  onClick={() => handleVisitClick(visit)}
                  className={`text-[10px] px-1.5 py-1 rounded cursor-pointer truncate transition-all hover:opacity-80 ${
                    isVisited ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                    isMissed ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' :
                    'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                  }`}
                  title={`${customer?.name || 'Unknown'} - ${visit.status}`}
                >
                  {visit.visitTime} {customer?.name || 'Unknown'}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return cells;
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            &larr;
          </button>
          <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300">
            Today
          </button>
          <button onClick={nextMonth} className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            &rarr;
          </button>
        </div>
      </div>

      <div className="flex-1 glass-panel rounded-2xl border border-slate-200/50 dark:border-white/10 overflow-hidden flex flex-col">
        <div className="grid grid-cols-7 bg-slate-100 dark:bg-slate-900/50 border-b border-slate-200/50 dark:border-white/10">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-2 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>
        <div className="flex-1 grid grid-cols-7 auto-rows-fr overflow-y-auto custom-scrollbar">
          {renderCells()}
        </div>
      </div>

      <LogVisitModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveVisit}
        fixedCustomerId={selectedVisit?.customerId}
        initialData={selectedVisit}
      />
    </div>
  );
};

export default BeatsCalendar;
