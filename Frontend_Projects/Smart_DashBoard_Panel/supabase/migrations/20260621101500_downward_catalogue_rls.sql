-- Creates a helper function to securely get the current user's ancestors without causing recursion in RLS
CREATE OR REPLACE FUNCTION public.auth_my_ancestors()
RETURNS uuid[]
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ancestor_ids FROM public.profiles WHERE id = auth.uid();
$$;

-- Drop previous overly permissive or upward-flowing policies on products
DROP POLICY IF EXISTS "org visibility select" ON public.products;
DROP POLICY IF EXISTS "org + hierarchy isolation select" ON public.products;
DROP POLICY IF EXISTS "org + hierarchy isolation insert" ON public.products;
DROP POLICY IF EXISTS "org + hierarchy isolation update" ON public.products;
DROP POLICY IF EXISTS "org + hierarchy isolation delete" ON public.products;

-- Create downward-flowing only policies
-- 1. I can see/edit if I am the owner (creator).
-- 2. I can see/edit if the owner is one of MY ancestors (meaning the creator is my parent/grandparent).
-- This explicitly PREVENTS a parent from seeing a product created by their child, because the child is NOT in the parent's ancestors.
-- It also PREVENTS Admins from seeing it if the Admin didn't create it, because the Admin has no ancestors.

CREATE POLICY "downward hierarchy isolation select" ON public.products FOR SELECT USING (
  org_id = public.auth_org_id() AND (
    owner_id = auth.uid() OR owner_id = ANY(public.auth_my_ancestors())
  )
);

CREATE POLICY "downward hierarchy isolation insert" ON public.products FOR INSERT WITH CHECK (
  org_id = public.auth_org_id() AND (
    owner_id = auth.uid() OR owner_id = ANY(public.auth_my_ancestors())
  )
);

CREATE POLICY "downward hierarchy isolation update" ON public.products FOR UPDATE USING (
  org_id = public.auth_org_id() AND (
    owner_id = auth.uid() OR owner_id = ANY(public.auth_my_ancestors())
  )
);

CREATE POLICY "downward hierarchy isolation delete" ON public.products FOR DELETE USING (
  org_id = public.auth_org_id() AND (
    owner_id = auth.uid() OR owner_id = ANY(public.auth_my_ancestors())
  )
);
