export default function StatusBadge({ status, className = '' }) {
  let colorClass = 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300';
  
  const statusStr = (status || '').toLowerCase();
  
  if (statusStr.includes('paid') || statusStr === 'active' || statusStr === 'visited') {
    colorClass = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 ring-1 ring-emerald-600/20';
  } else if (statusStr.includes('pending') || statusStr.includes('partially') || statusStr === 'scheduled') {
    colorClass = 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 ring-1 ring-amber-600/20';
  } else if (statusStr.includes('cancelled') || statusStr === 'inactive' || statusStr === 'missed' || statusStr === 'bounced') {
    colorClass = 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 ring-1 ring-red-600/20';
  } else if (statusStr.includes('dispatched')) {
    colorClass = 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 ring-1 ring-indigo-600/20';
  }

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${colorClass} ${className}`}>
      {status}
    </span>
  );
}
