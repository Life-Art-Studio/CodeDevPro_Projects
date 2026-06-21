-- Force auth helper functions to strictly use the profiles table ONLY.
-- This bypasses any corrupted, stale, or mismatched JWT claims entirely.

CREATE OR REPLACE FUNCTION public.auth_org_id() RETURNS uuid AS $$
  SELECT org_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.auth_role() RETURNS text AS $$
  SELECT role::text FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;
