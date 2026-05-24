import React from 'react';

const ReportsTab = ({ orders }) => {
  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-slate-800">Analytics & Reports</h3>
        <select defaultValue="Weekly Report" className="px-3 py-1.5 border rounded-lg bg-white text-sm font-medium focus:outline-blue-500">
          <option value="Weekly Report">Weekly Report</option>
          <option value="Monthly Report">Monthly Report</option>
          <option value="Quarterly Report">Quarterly Report</option>
          <option value="Annual GST Summary">Annual GST Summary</option>
        </select>
      </div>
      <div className="h-64 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 bg-slate-50">
        [ Chart / Data Table Area for Reports ]
      </div>
    </div>
  );
};

export default ReportsTab;