import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-transparent min-h-[400px]">
      <div className="relative">
        {/* Outer Ring */}
        <div className="w-16 h-16 border-4 border-slate-200 dark:border-slate-800 rounded-full"></div>
        {/* Inner Ring (Animated) */}
        <div className="w-16 h-16 border-4 border-purple-500 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
      </div>
      <p className="mt-4 text-sm font-semibold text-slate-500 dark:text-slate-400 animate-pulse">
        Loading...
      </p>
    </div>
  );
};

export default LoadingSpinner;
