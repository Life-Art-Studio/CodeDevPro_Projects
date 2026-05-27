import { TrendingUp, TrendingDown } from 'lucide-react';
import { useAnimatedCounter } from '../../hooks/useAnimatedCounter';

export default function MetricCard({ title, icon, value, trend, sparklineData }) {
  const numericValue = typeof value === 'number' ? value : 0;
  const animatedValue = useAnimatedCounter(numericValue);

  // Simple SVG sparkline generator
  const renderSparkline = () => {
    if (!sparklineData || sparklineData.length === 0) return null;
    const max = Math.max(...sparklineData);
    const min = Math.min(...sparklineData);
    const range = max - min || 1;
    const width = 100;
    const height = 30;
    const stepX = width / (sparklineData.length - 1);

    const points = sparklineData.map((val, i) => {
      const x = i * stepX;
      const y = height - ((val - min) / range) * height;
      return `${x},${y}`;
    }).join(' ');

    const isPositive = sparklineData[sparklineData.length - 1] >= sparklineData[0];
    const strokeColor = isPositive ? '#10b981' : '#ef4444'; // emerald-500 / red-500

    return (
      <svg width="100%" height="100%" viewBox={`0 -5 ${width} ${height + 10}`} preserveAspectRatio="none" className="overflow-visible">
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    );
  };

  return (
    <div className="bg-white dark:bg-[#1a1d27] border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] min-h-[120px] flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{title}</p>
        <div className="text-zinc-400 dark:text-zinc-500">
          {icon}
        </div>
      </div>
      
      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
            {typeof value === 'number' ? (
               title.toLowerCase().includes('revenue') || title.toLowerCase().includes('total') 
                 ? `₹${animatedValue.toLocaleString()}` 
                 : animatedValue
             ) : value}
          </p>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 text-xs font-medium mt-2 ${trend >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{Math.abs(trend)}% vs last month</span>
            </div>
          )}
        </div>
        
        {sparklineData && (
          <div className="w-24 h-8 opacity-70">
            {renderSparkline()}
          </div>
        )}
      </div>
    </div>
  );
}
