import { useState, useEffect } from 'react';

export function useTouchDevice() {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const checkTouch = () => {
      // Use matchMedia pointer: coarse as the primary reliable check
      if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) {
        return true;
      }
      return false;
    };

    setIsTouch(checkTouch());

    // Listen for changes (e.g. tablet keyboard attached/detached, devtools toggled)
    const mediaQuery = window.matchMedia('(pointer: coarse)');
    const handler = (e) => setIsTouch(e.matches);
    
    // Modern browsers use addEventListener
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } 
    // Fallback for older Safari
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handler);
      return () => mediaQuery.removeListener(handler);
    }
  }, []);

  return isTouch;
}
