import { useEffect, useState } from 'react';

export function usePullToRefresh(onRefresh, containerRef) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const maxPullDistance = 80;

  useEffect(() => {
    if (!containerRef.current) return;
    
    let startY = 0;
    let isPulling = false;

    const el = containerRef.current;

    const handleTouchStart = (e) => {
      if (el.scrollTop === 0) {
        startY = e.touches[0].clientY;
        isPulling = true;
      }
    };

    const handleTouchMove = (e) => {
      if (!isPulling) return;
      
      const currentY = e.touches[0].clientY;
      const diff = currentY - startY;

      if (diff > 0 && el.scrollTop === 0) {
        // Only prevent default if we're actually pulling down at the top
        if (e.cancelable) e.preventDefault();
        setPullDistance(Math.min(diff, maxPullDistance + 20));
      } else {
        isPulling = false;
      }
    };

    const handleTouchEnd = async () => {
      if (!isPulling) return;
      isPulling = false;
      
      if (pullDistance > maxPullDistance && !isRefreshing) {
        setIsRefreshing(true);
        try {
          if (onRefresh) await onRefresh();
        } finally {
          setIsRefreshing(false);
          setPullDistance(0);
        }
      } else {
        setPullDistance(0);
      }
    };

    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd);

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onRefresh, containerRef, isRefreshing, pullDistance]);

  return { pullDistance, isRefreshing, maxPullDistance };
}
