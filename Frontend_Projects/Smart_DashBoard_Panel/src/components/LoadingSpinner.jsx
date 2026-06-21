import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-transparent min-h-[400px]">
      <div className="relative">
        {/* Outer Ring */}
        <div className="w-16 h-16 border-4 border-zinc-200 dark:border-zinc-800 rounded-full"></div>
        {/* Inner Ring (Animated) */}
        <div className="w-16 h-16 border-4 border-transparent border-t-indigo-600 rounded-full animate-spin absolute top-0 left-0"></div>
      </div>
      <p className="mt-4 text-sm font-semibold text-slate-500 dark:text-slate-400 animate-pulse">
        Loading...
      </p>
    </div>
  );
};

export default LoadingSpinner;
