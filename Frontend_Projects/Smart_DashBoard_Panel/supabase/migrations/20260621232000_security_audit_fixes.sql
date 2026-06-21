-- Fix Orders Table: Only SALES can Insert/Update/Delete orders. Others can only view.
DROP POLICY IF EXISTS "org + hierarchy isolation update" ON public.orders;
DROP POLICY IF EXISTS "org + hierarchy isolation insert" ON public.orders;
DROP POLICY IF EXISTS "org + hierarchy isolation delete" ON public.orders;

CREATE POLICY "sales order insert" ON public.orders FOR INSERT 
WITH CHECK (
    org_id = public.auth_org_id() 
    AND public.auth_role() = 'SALES'
);

CREATE POLICY "sales order update" ON public.orders FOR UPDATE 
USING (
    org_id = public.auth_org_id() 
    AND public.auth_role() = 'SALES'
    AND owner_id = auth.uid()
);

CREATE POLICY "sales order delete" ON public.orders FOR DELETE 
USING (
    org_id = public.auth_org_id() 
    AND public.auth_role() = 'SALES'
    AND owner_id = auth.uid()
);


-- Fix Supply Chain Tables: Only ADMIN and SUPER_STOCKIST can modify. DISTRIBUTOR and SALES can only view.
DROP POLICY IF EXISTS "org visibility update" ON public.super_stockists;
DROP POLICY IF EXISTS "org visibility insert" ON public.super_stockists;
DROP POLICY IF EXISTS "org visibility delete" ON public.super_stockists;

CREATE POLICY "admin ss modify update" ON public.super_stockists FOR UPDATE USING (org_id = public.auth_org_id() AND public.auth_role() IN ('ADMIN', 'SUPER_STOCKIST'));
CREATE POLICY "admin ss modify insert" ON public.super_stockists FOR INSERT WITH CHECK (org_id = public.auth_org_id() AND public.auth_role() IN ('ADMIN', 'SUPER_STOCKIST'));
CREATE POLICY "admin ss modify delete" ON public.super_stockists FOR DELETE USING (org_id = public.auth_org_id() AND public.auth_role() IN ('ADMIN', 'SUPER_STOCKIST'));

DROP POLICY IF EXISTS "org visibility update" ON public.distributors;
DROP POLICY IF EXISTS "org visibility insert" ON public.distributors;
DROP POLICY IF EXISTS "org visibility delete" ON public.distributors;

CREATE POLICY "admin db modify update" ON public.distributors FOR UPDATE USING (org_id = public.auth_org_id() AND public.auth_role() IN ('ADMIN', 'SUPER_STOCKIST'));
CREATE POLICY "admin db modify insert" ON public.distributors FOR INSERT WITH CHECK (org_id = public.auth_org_id() AND public.auth_role() IN ('ADMIN', 'SUPER_STOCKIST'));
CREATE POLICY "admin db modify delete" ON public.distributors FOR DELETE USING (org_id = public.auth_org_id() AND public.auth_role() IN ('ADMIN', 'SUPER_STOCKIST'));

DROP POLICY IF EXISTS "org visibility update" ON public.inventory_ledger;
DROP POLICY IF EXISTS "org visibility insert" ON public.inventory_ledger;
DROP POLICY IF EXISTS "org visibility delete" ON public.inventory_ledger;

CREATE POLICY "admin ledger modify update" ON public.inventory_ledger FOR UPDATE USING (org_id = public.auth_org_id() AND public.auth_role() IN ('ADMIN', 'SUPER_STOCKIST', 'DISTRIBUTOR'));
CREATE POLICY "admin ledger modify insert" ON public.inventory_ledger FOR INSERT WITH CHECK (org_id = public.auth_org_id() AND public.auth_role() IN ('ADMIN', 'SUPER_STOCKIST', 'DISTRIBUTOR'));
CREATE POLICY "admin ledger modify delete" ON public.inventory_ledger FOR DELETE USING (org_id = public.auth_org_id() AND public.auth_role() IN ('ADMIN', 'SUPER_STOCKIST', 'DISTRIBUTOR'));
