DROP POLICY IF EXISTS "org + hierarchy isolation update" ON public.super_stockists;
DROP POLICY IF EXISTS "org + hierarchy isolation insert" ON public.super_stockists;
DROP POLICY IF EXISTS "org + hierarchy isolation delete" ON public.super_stockists;

CREATE POLICY "org visibility update" ON public.super_stockists FOR UPDATE USING (org_id = public.auth_org_id());
CREATE POLICY "org visibility insert" ON public.super_stockists FOR INSERT WITH CHECK (org_id = public.auth_org_id());
CREATE POLICY "org visibility delete" ON public.super_stockists FOR DELETE USING (org_id = public.auth_org_id());

DROP POLICY IF EXISTS "org + hierarchy isolation update" ON public.distributors;
DROP POLICY IF EXISTS "org + hierarchy isolation insert" ON public.distributors;
DROP POLICY IF EXISTS "org + hierarchy isolation delete" ON public.distributors;

CREATE POLICY "org visibility update" ON public.distributors FOR UPDATE USING (org_id = public.auth_org_id());
CREATE POLICY "org visibility insert" ON public.distributors FOR INSERT WITH CHECK (org_id = public.auth_org_id());
CREATE POLICY "org visibility delete" ON public.distributors FOR DELETE USING (org_id = public.auth_org_id());

DROP POLICY IF EXISTS "org + hierarchy isolation update" ON public.inventory_ledger;
DROP POLICY IF EXISTS "org + hierarchy isolation insert" ON public.inventory_ledger;
DROP POLICY IF EXISTS "org + hierarchy isolation delete" ON public.inventory_ledger;

CREATE POLICY "org visibility update" ON public.inventory_ledger FOR UPDATE USING (org_id = public.auth_org_id());
CREATE POLICY "org visibility insert" ON public.inventory_ledger FOR INSERT WITH CHECK (org_id = public.auth_org_id());
CREATE POLICY "org visibility delete" ON public.inventory_ledger FOR DELETE USING (org_id = public.auth_org_id());
