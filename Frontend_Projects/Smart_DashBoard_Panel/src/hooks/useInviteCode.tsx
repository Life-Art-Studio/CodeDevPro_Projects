import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook to capture an invite code from URL query string and store it in localStorage.
 * It runs once on mount and then removes the query param from the address bar.
 */
export function useInviteCode() {
  const { search, pathname } = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(search);
    const code = params.get('invite');
    if (code) {
      localStorage.setItem('invite_code', code);
      // Clean the URL so the code doesn't persist after redirect
      const cleanUrl = pathname + window.location.hash;
      window.history.replaceState(null, '', cleanUrl);
    }
  }, [search, pathname]);
}
