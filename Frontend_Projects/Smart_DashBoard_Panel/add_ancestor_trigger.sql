-- Create a robust trigger function to automatically set owner_ancestor_ids on ANY table that has owner_id and owner_ancestor_ids
CREATE OR REPLACE FUNCTION public.set_owner_ancestor_ids()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- If owner_id is set, fetch their ancestors from profiles
  IF NEW.owner_id IS NOT NULL THEN
    SELECT ancestor_ids INTO NEW.owner_ancestor_ids FROM public.profiles WHERE id = NEW.owner_id;
  END IF;
  
  -- Fallback to empty array to prevent null-related issues
  IF NEW.owner_ancestor_ids IS NULL THEN
    NEW.owner_ancestor_ids := '{}'::uuid[];
  END IF;
  
  RETURN NEW;
END;
$$;

-- Apply this trigger to all tables that rely on UPWARD hierarchy flow
DROP TRIGGER IF EXISTS tr_set_customers_ancestors ON public.customers;
CREATE TRIGGER tr_set_customers_ancestors BEFORE INSERT OR UPDATE OF owner_id ON public.customers FOR EACH ROW EXECUTE FUNCTION public.set_owner_ancestor_ids();

DROP TRIGGER IF EXISTS tr_set_orders_ancestors ON public.orders;
CREATE TRIGGER tr_set_orders_ancestors BEFORE INSERT OR UPDATE OF owner_id ON public.orders FOR EACH ROW EXECUTE FUNCTION public.set_owner_ancestor_ids();

DROP TRIGGER IF EXISTS tr_set_visits_ancestors ON public.visits;
CREATE TRIGGER tr_set_visits_ancestors BEFORE INSERT OR UPDATE OF owner_id ON public.visits FOR EACH ROW EXECUTE FUNCTION public.set_owner_ancestor_ids();

DROP TRIGGER IF EXISTS tr_set_beats_ancestors ON public.beats;
CREATE TRIGGER tr_set_beats_ancestors BEFORE INSERT OR UPDATE OF owner_id ON public.beats FOR EACH ROW EXECUTE FUNCTION public.set_owner_ancestor_ids();

DROP TRIGGER IF EXISTS tr_set_invoices_ancestors ON public.invoices;
CREATE TRIGGER tr_set_invoices_ancestors BEFORE INSERT OR UPDATE OF owner_id ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.set_owner_ancestor_ids();

DROP TRIGGER IF EXISTS tr_set_distributors_ancestors ON public.distributors;
CREATE TRIGGER tr_set_distributors_ancestors BEFORE INSERT OR UPDATE OF owner_id ON public.distributors FOR EACH ROW EXECUTE FUNCTION public.set_owner_ancestor_ids();

DROP TRIGGER IF EXISTS tr_set_super_stockists_ancestors ON public.super_stockists;
CREATE TRIGGER tr_set_super_stockists_ancestors BEFORE INSERT OR UPDATE OF owner_id ON public.super_stockists FOR EACH ROW EXECUTE FUNCTION public.set_owner_ancestor_ids();

DROP TRIGGER IF EXISTS tr_set_inventory_ledger_ancestors ON public.inventory_ledger;
CREATE TRIGGER tr_set_inventory_ledger_ancestors BEFORE INSERT OR UPDATE OF owner_id ON public.inventory_ledger FOR EACH ROW EXECUTE FUNCTION public.set_owner_ancestor_ids();

-- Immediately run a backfill to fix all EXISTING rows that were created without ancestor IDs
UPDATE public.customers SET owner_ancestor_ids = (SELECT ancestor_ids FROM public.profiles WHERE id = owner_id) WHERE owner_ancestor_ids IS NULL OR owner_ancestor_ids = '{}'::uuid[];
UPDATE public.orders SET owner_ancestor_ids = (SELECT ancestor_ids FROM public.profiles WHERE id = owner_id) WHERE owner_ancestor_ids IS NULL OR owner_ancestor_ids = '{}'::uuid[];
UPDATE public.visits SET owner_ancestor_ids = (SELECT ancestor_ids FROM public.profiles WHERE id = owner_id) WHERE owner_ancestor_ids IS NULL OR owner_ancestor_ids = '{}'::uuid[];
UPDATE public.beats SET owner_ancestor_ids = (SELECT ancestor_ids FROM public.profiles WHERE id = owner_id) WHERE owner_ancestor_ids IS NULL OR owner_ancestor_ids = '{}'::uuid[];
UPDATE public.invoices SET owner_ancestor_ids = (SELECT ancestor_ids FROM public.profiles WHERE id = owner_id) WHERE owner_ancestor_ids IS NULL OR owner_ancestor_ids = '{}'::uuid[];
UPDATE public.distributors SET owner_ancestor_ids = (SELECT ancestor_ids FROM public.profiles WHERE id = owner_id) WHERE owner_ancestor_ids IS NULL OR owner_ancestor_ids = '{}'::uuid[];
UPDATE public.super_stockists SET owner_ancestor_ids = (SELECT ancestor_ids FROM public.profiles WHERE id = owner_id) WHERE owner_ancestor_ids IS NULL OR owner_ancestor_ids = '{}'::uuid[];
UPDATE public.inventory_ledger SET owner_ancestor_ids = (SELECT ancestor_ids FROM public.profiles WHERE id = owner_id) WHERE owner_ancestor_ids IS NULL OR owner_ancestor_ids = '{}'::uuid[];
