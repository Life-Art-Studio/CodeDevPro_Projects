import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

const CustomSelect = ({ value, onChange, options, minWidth = '100px', className, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef(null);
  const [dropdownStyle, setDropdownStyle] = useState({});

  const updatePosition = () => {
    if (buttonRef.current && isOpen) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownStyle({
        top: rect.bottom + window.scrollY + 6,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  };

  useEffect(() => {
    updatePosition();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (buttonRef.current && buttonRef.current.contains(e.target)) return;
      if (e.target.closest('.custom-select-dropdown')) return;
      setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const dropdownContent = isOpen && !disabled ? (
    <div 
      style={{
        position: 'absolute',
        top: `${dropdownStyle.top}px`,
        left: `${dropdownStyle.left}px`,
        width: `${dropdownStyle.width}px`,
        zIndex: 99999
      }}
      className="custom-select-dropdown bg-white dark:bg-[#1a1d27] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl animate-in fade-in duration-200 overflow-hidden"
    >
      <div className="max-h-60 overflow-y-auto custom-scrollbar p-1">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={(e) => {
              e.stopPropagation();
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
  ) : null;

  return (
    <div 
      className="relative flex-1 sm:flex-none" 
      style={{ minWidth }}
    >
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          if (!disabled) setIsOpen(!isOpen);
        }}
        className={className || "w-full flex items-center justify-between text-[11px] sm:text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg sm:rounded-xl text-zinc-600 dark:text-zinc-300 bg-white dark:bg-[#1a1d27] px-3 sm:px-4 py-1.5 sm:py-2 outline-none focus:ring-2 focus:ring-purple-500 shadow-sm font-medium transition-colors cursor-pointer backdrop-blur-md disabled:opacity-50 disabled:cursor-not-allowed"}
      >
        <span className="truncate">{options.find(o => o.value == value)?.label || value}</span>
        {!disabled && (
          <svg className={`w-3 h-3 ml-2 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
        )}
      </button>
      
      {dropdownContent && createPortal(dropdownContent, document.body)}
    </div>
  );
};

export default CustomSelect;
