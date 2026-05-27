import React, { useState } from 'react';

const CustomSelect = ({ value, onChange, options, minWidth = '100px', className, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div 
      className="relative flex-1 sm:flex-none" 
      style={{ minWidth }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setIsOpen(false);
        }
      }}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={className || "w-full flex items-center justify-between text-[11px] sm:text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg sm:rounded-xl text-zinc-600 dark:text-zinc-300 bg-white dark:bg-[#1a1d27] px-3 sm:px-4 py-1.5 sm:py-2 outline-none focus:ring-2 focus:ring-purple-500 shadow-sm font-medium transition-colors cursor-pointer backdrop-blur-md disabled:opacity-50 disabled:cursor-not-allowed"}
      >
        <span className="truncate">{options.find(o => o.value == value)?.label || value}</span>
        {!disabled && (
          <svg className={`w-3 h-3 ml-2 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
        )}
      </button>
      
      {isOpen && !disabled && (
        <div 
          onMouseDown={(e) => e.preventDefault()}
          className="absolute top-full left-0 right-0 sm:right-auto sm:min-w-[160px] mt-1.5 bg-white dark:bg-[#1a1d27] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-50 animate-in slide-in-from-top-2 fade-in duration-200 overflow-hidden"
        >
          <div className="max-h-60 overflow-y-auto custom-scrollbar p-1">
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 text-[11px] sm:text-sm rounded-lg transition-colors truncate ${
                  value == opt.value
                    ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
