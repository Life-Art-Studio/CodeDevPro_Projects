import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export function useCompanyBranding() {
  const { currentUser } = useAuth();
  const [branding, setBranding] = useState({
    companyName: 'Smart Dashboard Panel',
    logoUrl: null,
  });

  useEffect(() => {
    async function fetchBranding() {
      if (!currentUser || !currentUser.org_id) return;

      const { data, error } = await supabase
        .from('organizations')
        .select('name, logo_url')
        .eq('id', currentUser.org_id)
        .maybeSingle();

      if (data && !error) {
        setBranding({
          companyName: data.name || 'Smart Dashboard Panel',
          logoUrl: data.logo_url || null,
        });
      }
    }

    fetchBranding();
  }, [currentUser]);

  // Update document title
  useEffect(() => {
    document.title = branding.companyName;
  }, [branding.companyName]);

  return branding;
}
