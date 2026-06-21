-- Fix RLS for master data tables so they are globally visible within an organization.
-- This ensures that Sales Reps can see Distributors, Super Stockists, Products, and Inventory Ledger created by Admins.

-- 1. PRODUCTS
DROP POLICY IF EXISTS "org + hierarchy isolation select" ON public.products;
CREATE POLICY "org visibility select" ON public.products FOR SELECT USING (org_id = public.auth_org_id());

-- 2. SUPER_STOCKISTS
DROP POLICY IF EXISTS "org + hierarchy isolation select" ON public.super_stockists;
CREATE POLICY "org visibility select" ON public.super_stockists FOR SELECT USING (org_id = public.auth_org_id());

-- 3. DISTRIBUTORS
DROP POLICY IF EXISTS "org + hierarchy isolation select" ON public.distributors;
CREATE POLICY "org visibility select" ON public.distributors FOR SELECT USING (org_id = public.auth_org_id());

-- 4. INVENTORY_LEDGER
DROP POLICY IF EXISTS "org + hierarchy isolation select" ON public.inventory_ledger;
CREATE POLICY "org visibility select" ON public.inventory_ledger FOR SELECT USING (org_id = public.auth_org_id());
