import React, { useState } from 'react';
import { useAudit } from '../context/AuditContext';
import toast from 'react-hot-toast';

const AuditLogs = () => {
  const { auditLogs, clearLogs, isLoading } = useAudit();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredLogs = auditLogs.filter(log => 
    (log.action || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.userName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.module || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.details || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleClearLogs = () => {
    toast((t) => (
      <div className="flex flex-col gap-2">
        <span className="font-semibold text-sm">Are you sure you want to clear all audit logs? This cannot be undone.</span>
        <div className="flex gap-2 justify-end mt-2">
          <button 
            onClick={() => {
              toast.dismiss(t.id);
              clearLogs();
              toast.success("Audit logs cleared.");
            }}
            className="bg-red-500 text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-red-600 transition-colors"
          >Clear All</button>
          <button onClick={() => toast.dismiss(t.id)} className="bg-zinc-200 dark:bg-zinc-700 px-3 py-1 rounded-lg text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors">Cancel</button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  const getModuleIcon = (module) => {
    switch ((module || '').toLowerCase()) {
      case 'auth': return '🔐';
      case 'users': return '👥';
      case 'customers': return '👤';
      case 'orders': return '📦';
      case 'beats': return '🗺️';
      case 'visits': return '🏪';
      default: return '⚙️';
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center bg-zinc-50 dark:bg-[#0f1117] transition-colors">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-500 rounded-full animate-spin"></div>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium">Loading audit logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col z-0">
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8 bg-transparent font-sans transition-colors animate-in fade-in duration-500">
        <div className="max-w-7xl mx-auto h-full flex flex-col gap-6">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-zinc-800 dark:text-zinc-100 transition-colors tracking-tight">Audit Trail</h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1 transition-colors">
              System-wide log of all user activities and data changes.
            </p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={handleClearLogs}
              className="w-full sm:w-auto justify-center bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 font-medium py-2 px-4 rounded-xl transition-all flex items-center gap-2 hover:bg-red-500/20"
            >
              <span>🗑️</span> Clear Logs
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white dark:bg-[#1a1d27] shadow-sm p-4 rounded-2xl flex flex-col sm:flex-row justify-between gap-4 transition-colors">
          <div className="relative w-full max-w-md">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400 dark:text-zinc-500">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search by action, user, module..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm text-zinc-700 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500 transition-all backdrop-blur-md shadow-inner focus:shadow-[0_0_15px_rgba(168,85,247,0.2)]"
            />
          </div>
          <div className="flex items-center text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Total Logs: {filteredLogs.length}
          </div>
        </div>

        {/* Logs List */}
        <div className="bg-white dark:bg-[#1a1d27] shadow-sm rounded-2xl overflow-hidden transition-colors flex-1 flex flex-col">
          <div className="overflow-x-auto flex-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-xs uppercase text-zinc-500 dark:text-zinc-400 font-semibold tracking-wider transition-colors">
                  <th className="px-4 sm:px-6 py-3 sm:py-4">Timestamp</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4">User</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4">Module</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4">Action</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 w-1/3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/50 dark:divide-white/5">
                {filteredLogs.length > 0 ? (
                  filteredLogs.map(log => (
                    <tr key={log.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group">
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-[11px] sm:text-xs font-mono text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-xs sm:text-sm text-zinc-800 dark:text-zinc-200">{log.userName}</span>
                          <span className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400">{log.role}</span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md text-[10px] sm:text-xs font-medium bg-zinc-100 dark:bg-white text-zinc-700 dark:text-zinc-300">
                          {getModuleIcon(log.module)} <span className="hidden sm:inline">{log.module}</span>
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <span className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[9px] sm:text-xs font-bold uppercase tracking-wider ${
                          log.action.includes('Create') || log.action.includes('Add') ? 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10' :
                          log.action.includes('Delete') || log.action.includes('Remove') ? 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-500/10' :
                          log.action.includes('Update') || log.action.includes('Edit') ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-500/10' :
                          'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-500/10'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 min-w-[200px]">
                        {log.details}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <p className="text-zinc-500 text-sm">No audit logs found.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
