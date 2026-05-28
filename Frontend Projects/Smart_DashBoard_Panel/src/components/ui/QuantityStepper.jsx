import { useState, useRef, useEffect, useCallback } from 'react';
import { Minus, Plus } from 'lucide-react';

export default function QuantityStepper({ value, min = 1, max = 9999, onChange }) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleIncrement = useCallback(() => {
    onChange(Math.min(value + 1, max));
  }, [value, max, onChange]);

  const handleDecrement = useCallback(() => {
    onChange(Math.max(value - 1, min));
  }, [value, min, onChange]);

  const startPress = (action) => {
    action();
    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(action, 100);
    }, 400);
  };

  const endPress = () => {
    clearTimeout(timeoutRef.current);
    clearInterval(intervalRef.current);
  };

  const handleInputBlur = () => {
    setIsEditing(false);
    let val = parseInt(inputValue, 10);
    if (isNaN(val)) val = min;
    if (val < min) val = min;
    if (val > max) val = max;
    onChange(val);
  };

  return (
    <div className="flex items-center bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden w-fit shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <button
        type="button"
        onPointerDown={() => startPress(handleDecrement)}
        onPointerUp={endPress}
        onPointerLeave={endPress}
        disabled={value <= min}
        className="w-8 h-8 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 disabled:opacity-30 transition-colors shrink-0"
      >
        <Minus className="w-4 h-4" />
      </button>
      
      {isEditing ? (
        <input
          type="text"
          inputMode="numeric"
          autoFocus
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleInputBlur}
          onKeyDown={(e) => { if (e.key === 'Enter') handleInputBlur(); }}
          className="w-10 h-8 text-center text-sm font-semibold text-zinc-900 dark:text-zinc-100 bg-transparent focus:outline-none tabular-nums"
        />
      ) : (
        <div 
          onClick={() => setIsEditing(true)}
          className="w-10 h-8 flex items-center justify-center text-sm font-semibold text-zinc-900 dark:text-zinc-100 cursor-text tabular-nums"
        >
          {value}
        </div>
      )}

      <button
        type="button"
        onPointerDown={() => startPress(handleIncrement)}
        onPointerUp={endPress}
        onPointerLeave={endPress}
        disabled={value >= max}
        className="w-8 h-8 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 disabled:opacity-30 transition-colors shrink-0"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}
