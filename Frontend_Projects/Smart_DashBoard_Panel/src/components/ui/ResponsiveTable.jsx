import { useState, useEffect } from 'react';

export default function ResponsiveTable({ columns, data, keyField = 'id', renderMobileCard, onRowClick, swipeActions }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  if (isMobile && renderMobileCard) {
    return (
      <div className="flex flex-col gap-3">
        {data.map((row, i) => {
          const cardContent = renderMobileCard(row, i);
          return (
            <div 
              key={row[keyField] || i} 
              onClick={() => onRowClick && onRowClick(row)}
              className="bg-white dark:bg-[#1a1d27] border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl shadow-sm w-full transition-colors hover:border-indigo-200 dark:hover:border-indigo-500/30"
            >
               {cardContent}
               {swipeActions && (
                 <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                   {swipeActions(row).map((action, idx) => (
                     <button
                       key={idx}
                       onClick={(e) => { e.stopPropagation(); action.onClick(); }}
                       className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 ${action.color === 'red' ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400'}`}
                     >
                       {action.icon} {action.label}
                     </button>
                   ))}
                 </div>
               )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto scrollbar-hide primary-layer overscroll-contain">
      <table className="w-full text-left border-collapse tabular-nums">
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-800 text-sm text-zinc-500 dark:text-zinc-400">
            {columns.map((col, i) => (
              <th key={i} className={`py-3 px-4 font-semibold ${col.hiddenOnMobile ? 'hidden md:table-cell' : ''}`}>
                {col.label || col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {data.map((row, i) => (
            <tr 
              key={row[keyField] || i} 
              onClick={() => onRowClick && onRowClick(row)}
              className="hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer group"
            >
              {columns.map((col, j) => {
                const colKey = col.key || col.accessor;
                return (
                  <td key={j} className={`py-3 px-4 text-sm text-zinc-700 dark:text-zinc-300 ${col.hiddenOnMobile ? 'hidden md:table-cell' : ''}`}>
                    {col.render ? col.render(row) : row[colKey]}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
