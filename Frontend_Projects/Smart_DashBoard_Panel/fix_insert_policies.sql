-- Fix INSERT policies for all business tables to allow ADMIN to insert on behalf of other users
-- This is necessary for the "View As" mode to work correctly when creating records

DROP POLICY IF EXISTS "org + hierarchy isolation insert" ON public.customers;
CREATE POLICY "org + hierarchy isolation insert" ON public.customers FOR INSERT WITH CHECK (
  org_id = public.auth_org_id() AND (public.auth_role() = 'ADMIN' OR owner_id = auth.uid())
);

DROP POLICY IF EXISTS "org + hierarchy isolation insert" ON public.orders;
CREATE POLICY "org + hierarchy isolation insert" ON public.orders FOR INSERT WITH CHECK (
  org_id = public.auth_org_id() AND (public.auth_role() = 'ADMIN' OR owner_id = auth.uid())
);

DROP POLICY IF EXISTS "org + hierarchy isolation insert" ON public.visits;
CREATE POLICY "org + hierarchy isolation insert" ON public.visits FOR INSERT WITH CHECK (
  org_id = public.auth_org_id() AND (public.auth_role() = 'ADMIN' OR owner_id = auth.uid())
);

DROP POLICY IF EXISTS "org + hierarchy isolation insert" ON public.beats;
CREATE POLICY "org + hierarchy isolation insert" ON public.beats FOR INSERT WITH CHECK (
  org_id = public.auth_org_id() AND (public.auth_role() = 'ADMIN' OR owner_id = auth.uid())
);

DROP POLICY IF EXISTS "org + hierarchy isolation insert" ON public.invoices;
CREATE POLICY "org + hierarchy isolation insert" ON public.invoices FOR INSERT WITH CHECK (
  org_id = public.auth_org_id() AND (public.auth_role() = 'ADMIN' OR owner_id = auth.uid())
);

DROP POLICY IF EXISTS "org + hierarchy isolation insert" ON public.distributors;
CREATE POLICY "org + hierarchy isolation insert" ON public.distributors FOR INSERT WITH CHECK (
  org_id = public.auth_org_id() AND (public.auth_role() = 'ADMIN' OR owner_id = auth.uid())
);

DROP POLICY IF EXISTS "org + hierarchy isolation insert" ON public.super_stockists;
CREATE POLICY "org + hierarchy isolation insert" ON public.super_stockists FOR INSERT WITH CHECK (
  org_id = public.auth_org_id() AND (public.auth_role() = 'ADMIN' OR owner_id = auth.uid())
);

DROP POLICY IF EXISTS "org + hierarchy isolation insert" ON public.inventory_ledger;
CREATE POLICY "org + hierarchy isolation insert" ON public.inventory_ledger FOR INSERT WITH CHECK (
  org_id = public.auth_org_id() AND (public.auth_role() = 'ADMIN' OR owner_id = auth.uid())
);

DROP POLICY IF EXISTS "downward hierarchy isolation insert" ON public.products;
CREATE POLICY "downward hierarchy isolation insert" ON public.products FOR INSERT WITH CHECK (
  org_id = public.auth_org_id() AND (public.auth_role() = 'ADMIN' OR owner_id = auth.uid())
);
