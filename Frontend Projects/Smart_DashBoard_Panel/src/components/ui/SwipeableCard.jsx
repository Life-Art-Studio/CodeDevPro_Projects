import { useState, useRef } from 'react';

export default function SwipeableCard({ children, actions }) {
  const [translateX, setTranslateX] = useState(0);
  const startXRef = useRef(0);
  const isSwiping = useRef(false);
  const [isOpen, setIsOpen] = useState(false);
  
  const actionWidth = 64;
  const numActions = actions ? actions.length : 0;
  const maxSwipe = -(actionWidth * numActions); 
  const revealThreshold = -40;

  const handleTouchStart = (e) => {
    if (numActions === 0) return;
    startXRef.current = e.touches[0].clientX;
    isSwiping.current = true;
  };

  const handleTouchMove = (e) => {
    if (!isSwiping.current || numActions === 0) return;
    const diff = e.touches[0].clientX - startXRef.current;
    
    let target = isOpen ? maxSwipe + diff : diff;

    if (target > 0) target = target * 0.1; // resistance going right
    if (target < maxSwipe) target = maxSwipe + (target - maxSwipe) * 0.2; // resistance going left

    setTranslateX(target);
  };

  const handleTouchEnd = () => {
    if (!isSwiping.current || numActions === 0) return;
    isSwiping.current = false;
    
    if (isOpen) {
      if (translateX > maxSwipe - revealThreshold) {
        setTranslateX(0);
        setIsOpen(false);
      } else {
        setTranslateX(maxSwipe);
      }
    } else {
      if (translateX < revealThreshold) {
        setTranslateX(maxSwipe);
        setIsOpen(true);
      } else {
        setTranslateX(0);
      }
    }
  };

  return (
    <div className="relative overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800 w-full touch-pan-y">
      {/* Background Actions Layer */}
      <div className="absolute inset-y-0 right-0 flex items-center justify-end z-0">
        {actions && actions.map((action, i) => (
          <button 
            key={i}
            onClick={(e) => {
              e.stopPropagation();
              action.onClick();
              setTranslateX(0);
              setIsOpen(false);
            }}
            className={`h-full w-[64px] flex flex-col items-center justify-center text-white ${action.colorClass}`}
          >
            {action.icon}
            <span className="text-[10px] mt-1 font-semibold">{action.label}</span>
          </button>
        ))}
      </div>
      
      {/* Foreground Card */}
      <div 
        className="relative bg-white dark:bg-[#1a1d27] border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] w-full h-full z-10"
        style={{ 
          touchAction: 'pan-y',
          transform: `translateX(${translateX}px)`,
          transition: isSwiping.current ? 'none' : 'transform 300ms cubic-bezier(0.32, 0.72, 0, 1)'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}
