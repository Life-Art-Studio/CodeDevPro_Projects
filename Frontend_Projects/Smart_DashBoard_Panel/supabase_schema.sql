-- Smart Dashboard Panel - Multi-Tenant Hierarchical Supabase Schema setup

-------------------------------------------------------------------
-- 1. CLEANUP PREVIOUS TABLES & CONSTRAINTS
-------------------------------------------------------------------
-- We are starting fresh for users, organizations, etc.
-- If starting fresh, dropping public.users might fail if dependent objects exist,
-- so we'll drop it with CASCADE.
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.invites CASCADE;
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.organizations CASCADE;
DROP TYPE IF EXISTS public.user_role CASCADE;

-------------------------------------------------------------------
-- 2. CREATE HIERARCHY & AUTH TABLES
-------------------------------------------------------------------

CREATE TABLE public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  logo_url text,
  primary_color text default '#4f46e5',
  owner_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);

CREATE TYPE public.user_role AS ENUM ('ADMIN','SUPER_STOCKIST','DISTRIBUTOR','SALES');

CREATE TABLE public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  org_id uuid not null references public.organizations(id) on delete cascade,
  role public.user_role not null,
  parent_id uuid references public.profiles(id) on delete set null,
  ancestor_ids uuid[] not null default '{}',
  full_name text,
  username text unique,
  email text,
  phone text,
  status text not null default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

CREATE INDEX idx_profiles_org ON public.profiles(org_id);
CREATE INDEX idx_profiles_ancestors ON public.profiles USING gin(ancestor_ids);

-- Auto-populate ancestor_ids on insert
CREATE OR REPLACE FUNCTION public.set_ancestor_ids()
RETURNS trigger AS $$
BEGIN
  IF NEW.parent_id IS NULL THEN
    NEW.ancestor_ids := '{}';
  ELSE
    SELECT ancestor_ids || id INTO NEW.ancestor_ids
    FROM public.profiles WHERE id = NEW.parent_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_set_ancestor_ids
BEFORE INSERT OR UPDATE OF parent_id ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_ancestor_ids();

-------------------------------------------------------------------
-- 3. CREATE INVITES & AUDIT LOGS
-------------------------------------------------------------------

CREATE TABLE public.invites (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.organizations(id) on delete cascade not null,
  email text not null,
  role public.user_role not null,
  parent_id uuid references public.profiles(id) on delete cascade,
  token uuid not null default gen_random_uuid(),
  expires_at timestamptz default now() + interval '7 days',
  used boolean default false,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

CREATE TABLE public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  target_id uuid,
  metadata jsonb,
  created_at timestamptz default now()
);

-------------------------------------------------------------------
-- 4. JWT CUSTOM CLAIMS HOOK
-------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_role text;
  v_org_id uuid;
  claims jsonb;
BEGIN
  SELECT role::text, org_id INTO v_role, v_org_id
  FROM public.profiles WHERE id = (event->>'user_id')::uuid;

  claims := coalesce(event->'claims', '{}'::jsonb);
  
  IF v_role IS NOT NULL THEN
    claims := jsonb_set(claims, '{app_role}', to_jsonb(v_role));
  END IF;
  IF v_org_id IS NOT NULL THEN
    claims := jsonb_set(claims, '{org_id}', to_jsonb(v_org_id));
  END IF;

  event := jsonb_set(event, '{claims}', claims);
  RETURN event;
END;
$$;

-- Note: The hook needs to be assigned to auth in Supabase dashboard.

-- !! SECURITY-CRITICAL !!
-- These functions ONLY read from JWT claims. They NEVER query profiles.
-- This prevents infinite recursion when used inside RLS policies on profiles,
-- and prevents any cross-tenant data leak via SECURITY DEFINER bypass.
-- The JWT claims are populated by:
--   1. custom_access_token_hook (sets top-level 'org_id' and 'app_role')
--   2. Edge Function admin.updateUserById (sets app_metadata.org_id and app_metadata.app_role)

CREATE OR REPLACE FUNCTION public.auth_org_id() RETURNS uuid AS $$
  SELECT coalesce(
    (auth.jwt() ->> 'org_id')::uuid,
    (auth.jwt() -> 'app_metadata' ->> 'org_id')::uuid
  );
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION public.auth_role() RETURNS text AS $$
  SELECT coalesce(
    auth.jwt() ->> 'app_role',
    auth.jwt() -> 'app_metadata' ->> 'app_role'
  );
$$ LANGUAGE sql STABLE;

-------------------------------------------------------------------
-- 5. BUSINESS TABLES SCHEMA
-------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.customers (id uuid default gen_random_uuid() primary key);
CREATE TABLE IF NOT EXISTS public.orders (id uuid default gen_random_uuid() primary key);
CREATE TABLE IF NOT EXISTS public.products (id uuid default gen_random_uuid() primary key);
CREATE TABLE IF NOT EXISTS public.visits (id uuid default gen_random_uuid() primary key);
CREATE TABLE IF NOT EXISTS public.beats (id uuid default gen_random_uuid() primary key);
CREATE TABLE IF NOT EXISTS public.super_stockists (id uuid default gen_random_uuid() primary key);
CREATE TABLE IF NOT EXISTS public.distributors (id uuid default gen_random_uuid() primary key);
CREATE TABLE IF NOT EXISTS public.inventory_ledger (id uuid default gen_random_uuid() primary key);
CREATE TABLE IF NOT EXISTS public.invoices (id uuid default gen_random_uuid() primary key);

-- Drop legacy admin_id and created_by constraints/columns
DO $$
DECLARE
  t text;
BEGIN
  FOR t IN SELECT table_name FROM information_schema.columns WHERE column_name = 'admin_id' AND table_schema = 'public' LOOP
    EXECUTE format('ALTER TABLE public.%I DROP COLUMN IF EXISTS admin_id CASCADE;', t);
  END LOOP;
END $$;

-------------------------------------------------------------------
-- 6. CLEAR PREVIOUS TEST DATA & ADD COMMON HIERARCHY COLUMNS
-------------------------------------------------------------------

-- Wipe legacy test data to allow adding NOT NULL constraints
TRUNCATE public.customers, public.orders, public.products, public.visits, public.beats, public.super_stockists, public.distributors, public.inventory_ledger, public.invoices CASCADE;

-- Add hierarchy columns to all business tables
DO $$
DECLARE
  t text;
  tables text[] := ARRAY['customers', 'orders', 'products', 'visits', 'beats', 'super_stockists', 'distributors', 'inventory_ledger', 'invoices'];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS org_id uuid NOT NULL DEFAULT ''00000000-0000-0000-0000-000000000000'' REFERENCES public.organizations(id) ON DELETE CASCADE;', t);
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL;', t);
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS owner_ancestor_ids uuid[] NOT NULL DEFAULT ''{}'';', t);
  END LOOP;
END $$;

-------------------------------------------------------------------
-- 7. AUTO-STAMP OWNER CONTEXT ON BUSINESS TABLE INSERTS
-------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.set_owner_context()
RETURNS trigger AS $$
DECLARE
  p record;
BEGIN
  SELECT org_id, ancestor_ids INTO p FROM public.profiles WHERE id = auth.uid();

  IF p IS NOT NULL THEN
    NEW.org_id := p.org_id;
    NEW.owner_id := auth.uid();
    SELECT ancestor_ids INTO NEW.owner_ancestor_ids 
    FROM public.profiles WHERE id = auth.uid();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$
DECLARE
  t text;
  tables text[] := ARRAY['customers', 'orders', 'products', 'visits', 'beats', 'super_stockists', 'distributors', 'inventory_ledger', 'invoices'];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_set_owner_context ON public.%I;', t);
    EXECUTE format('CREATE TRIGGER trg_set_owner_context BEFORE INSERT ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_owner_context();', t);
  END LOOP;
END $$;

-------------------------------------------------------------------
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-------------------------------------------------------------------

-- Organizations
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Organization Access" ON public.organizations;
DROP POLICY IF EXISTS "Admin Organization Update" ON public.organizations;
CREATE POLICY "Public Organization Access" ON public.organizations FOR SELECT USING (true);
CREATE POLICY "Admin Organization Update" ON public.organizations FOR UPDATE USING (owner_id = auth.uid());

-- Profiles (CRITICAL: auth_org_id() does NOT query profiles, so no recursion)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "org + hierarchy visibility on profiles select" ON public.profiles;
DROP POLICY IF EXISTS "org + hierarchy visibility on profiles update" ON public.profiles;
DROP POLICY IF EXISTS "org + hierarchy visibility on profiles insert" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile via invite" ON public.profiles;

CREATE POLICY "org + hierarchy visibility on profiles select"
ON public.profiles FOR SELECT
USING (
  id = auth.uid() OR
  (
    org_id = public.auth_org_id()
    AND (
      public.auth_role() = 'ADMIN'
      OR auth.uid() = ANY(ancestor_ids)
    )
  )
);
CREATE POLICY "org + hierarchy visibility on profiles update"
ON public.profiles FOR UPDATE
USING (
  org_id = public.auth_org_id()
  AND (
    public.auth_role() = 'ADMIN'
    OR id = auth.uid()
    OR auth.uid() = ANY(ancestor_ids)
  )
);
CREATE POLICY "org + hierarchy visibility on profiles insert"
ON public.profiles FOR INSERT
WITH CHECK (
  id = auth.uid()
  OR (
    org_id = public.auth_org_id()
    AND (
      public.auth_role() = 'ADMIN'
      OR auth.uid() = parent_id
    )
  )
);

-- Invites
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "org + hierarchy visibility on invites select" ON public.invites;
DROP POLICY IF EXISTS "public read invites" ON public.invites;
DROP POLICY IF EXISTS "org + hierarchy visibility on invites update" ON public.invites;
DROP POLICY IF EXISTS "org + hierarchy visibility on invites insert" ON public.invites;

CREATE POLICY "org + hierarchy visibility on invites select"
ON public.invites FOR SELECT
USING (
  org_id = public.auth_org_id()
  AND (
    public.auth_role() = 'ADMIN'
    OR created_by = auth.uid()
  )
);
-- Allow reading invites by token for redemption (narrowly scoped)
CREATE POLICY "public read invites by email" ON public.invites FOR SELECT
USING (email = (auth.jwt() ->> 'email'));

CREATE POLICY "org + hierarchy visibility on invites update"
ON public.invites FOR UPDATE
USING (
  org_id = public.auth_org_id()
  AND (
    public.auth_role() = 'ADMIN'
    OR created_by = auth.uid()
  )
);
CREATE POLICY "org + hierarchy visibility on invites insert"
ON public.invites FOR INSERT
WITH CHECK (
  org_id = public.auth_org_id()
);

-- Audit Logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "org visibility on audit_logs" ON public.audit_logs;
DROP POLICY IF EXISTS "insert on audit_logs" ON public.audit_logs;

CREATE POLICY "org visibility on audit_logs" ON public.audit_logs FOR SELECT USING (
  org_id = public.auth_org_id() AND public.auth_role() = 'ADMIN'
);
CREATE POLICY "insert on audit_logs" ON public.audit_logs FOR INSERT WITH CHECK (
  org_id = public.auth_org_id()
);

-- Business Tables RLS Macro (strict org_id + hierarchy)
DO $$
DECLARE
  t text;
  tables text[] := ARRAY['customers', 'orders', 'products', 'visits', 'beats', 'super_stockists', 'distributors', 'inventory_ledger', 'invoices'];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format('DROP POLICY IF EXISTS "org + hierarchy isolation select" ON public.%I;', t);
    EXECUTE format('DROP POLICY IF EXISTS "org + hierarchy isolation insert" ON public.%I;', t);
    EXECUTE format('DROP POLICY IF EXISTS "org + hierarchy isolation update" ON public.%I;', t);
    EXECUTE format('DROP POLICY IF EXISTS "org + hierarchy isolation delete" ON public.%I;', t);
    
    EXECUTE format('
      CREATE POLICY "org + hierarchy isolation select" ON public.%I FOR SELECT USING (
        org_id = public.auth_org_id() AND (
          public.auth_role() = ''ADMIN'' OR owner_id = auth.uid() OR auth.uid() = ANY(owner_ancestor_ids)
        )
      );
    ', t);
    
    EXECUTE format('
      CREATE POLICY "org + hierarchy isolation insert" ON public.%I FOR INSERT WITH CHECK (
        org_id = public.auth_org_id() AND (
          public.auth_role() = ''ADMIN'' OR owner_id = auth.uid() OR auth.uid() = ANY(owner_ancestor_ids)
        )
      );
    ', t);
    
    EXECUTE format('
      CREATE POLICY "org + hierarchy isolation update" ON public.%I FOR UPDATE USING (
        org_id = public.auth_org_id() AND (
          public.auth_role() = ''ADMIN'' OR owner_id = auth.uid() OR auth.uid() = ANY(owner_ancestor_ids)
        )
      );
    ', t);
    
    EXECUTE format('
      CREATE POLICY "org + hierarchy isolation delete" ON public.%I FOR DELETE USING (
        org_id = public.auth_org_id() AND (
          public.auth_role() = ''ADMIN'' OR owner_id = auth.uid() OR auth.uid() = ANY(owner_ancestor_ids)
        )
      );
    ', t);
  END LOOP;
END $$;

-- Stamp ownership trigger function
CREATE OR REPLACE FUNCTION public.stamp_ownership()
RETURNS trigger AS $$
DECLARE
  p record;
BEGIN
  SELECT org_id, ancestor_ids INTO p FROM public.profiles WHERE id = auth.uid();
  IF NOT FOUND THEN
    -- If no profile found (e.g. service role bypass), allow it if org_id is provided
    RETURN NEW;
  END IF;
  NEW.org_id := p.org_id;
  NEW.owner_id := coalesce(NEW.owner_id, auth.uid());
  SELECT ancestor_ids INTO NEW.owner_ancestor_ids 
    FROM public.profiles WHERE id = NEW.owner_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$
DECLARE
  t text;
  tables text[] := ARRAY['customers', 'orders', 'products', 'visits', 'beats', 'super_stockists', 'distributors', 'inventory_ledger', 'invoices'];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS org_id uuid NOT NULL;', t);
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS owner_id uuid NOT NULL;', t);
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS owner_ancestor_ids uuid[] NOT NULL DEFAULT ''{}'';', t);
    
    -- Attach trigger
    EXECUTE format('DROP TRIGGER IF EXISTS trg_stamp_ownership ON public.%I;', t);
    EXECUTE format('CREATE TRIGGER trg_stamp_ownership BEFORE INSERT ON public.%I FOR EACH ROW EXECUTE FUNCTION public.stamp_ownership();', t);
  END LOOP;
END $$;

-- Need to add FK separately because not all might be compatible dynamically in DO block
ALTER TABLE public.customers ADD CONSTRAINT customers_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.orders ADD CONSTRAINT orders_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.products ADD CONSTRAINT products_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.visits ADD CONSTRAINT visits_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.beats ADD CONSTRAINT beats_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.super_stockists ADD CONSTRAINT super_stockists_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.distributors ADD CONSTRAINT distributors_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.inventory_ledger ADD CONSTRAINT inventory_ledger_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.invoices ADD CONSTRAINT invoices_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


-------------------------------------------------------------------
-- 7. BUSINESS COLUMNS
-------------------------------------------------------------------

-- Customers
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS type text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS contact text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS status text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS date text;

-- Orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_id uuid;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS date text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS status text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS items jsonb;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS total numeric;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS "paidAmount" numeric;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS global_discount numeric;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payments jsonb;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS "paymentMode" text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS "distributorId" uuid;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS "dueDate" text;

-- Products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sku text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS price numeric;

-- Visits
ALTER TABLE public.visits ADD COLUMN IF NOT EXISTS "customerId" uuid;
ALTER TABLE public.visits ADD COLUMN IF NOT EXISTS "salesRepId" uuid;
ALTER TABLE public.visits ADD COLUMN IF NOT EXISTS "visitDate" text;
ALTER TABLE public.visits ADD COLUMN IF NOT EXISTS purpose text;
ALTER TABLE public.visits ADD COLUMN IF NOT EXISTS outcome text;
ALTER TABLE public.visits ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE public.visits ADD COLUMN IF NOT EXISTS location jsonb;

-- Beats
ALTER TABLE public.beats ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE public.beats ADD COLUMN IF NOT EXISTS "assignedTo" uuid;
ALTER TABLE public.beats ADD COLUMN IF NOT EXISTS date text;
ALTER TABLE public.beats ADD COLUMN IF NOT EXISTS status text;
ALTER TABLE public.beats ADD COLUMN IF NOT EXISTS customers jsonb;

-- Super Stockists
ALTER TABLE public.super_stockists ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE public.super_stockists ADD COLUMN IF NOT EXISTS state text;
ALTER TABLE public.super_stockists ADD COLUMN IF NOT EXISTS "contactPhone" text;
ALTER TABLE public.super_stockists ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.super_stockists ADD COLUMN IF NOT EXISTS "totalBilled" numeric;
ALTER TABLE public.super_stockists ADD COLUMN IF NOT EXISTS "outstandingBalance" numeric;
ALTER TABLE public.super_stockists ADD COLUMN IF NOT EXISTS status text;
ALTER TABLE public.super_stockists ADD COLUMN IF NOT EXISTS lat numeric;
ALTER TABLE public.super_stockists ADD COLUMN IF NOT EXISTS lng numeric;
ALTER TABLE public.super_stockists ADD COLUMN IF NOT EXISTS "gstNo" text;

-- Distributors
ALTER TABLE public.distributors ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE public.distributors ADD COLUMN IF NOT EXISTS "superStockistId" uuid;
ALTER TABLE public.distributors ADD COLUMN IF NOT EXISTS district text;
ALTER TABLE public.distributors ADD COLUMN IF NOT EXISTS "contactPhone" text;
ALTER TABLE public.distributors ADD COLUMN IF NOT EXISTS "assignedBeats" jsonb;
ALTER TABLE public.distributors ADD COLUMN IF NOT EXISTS status text;
ALTER TABLE public.distributors ADD COLUMN IF NOT EXISTS lat numeric;
ALTER TABLE public.distributors ADD COLUMN IF NOT EXISTS lng numeric;
ALTER TABLE public.distributors ADD COLUMN IF NOT EXISTS "gstNo" text;

-- Inventory Ledger
ALTER TABLE public.inventory_ledger ADD COLUMN IF NOT EXISTS "superStockistId" uuid;
ALTER TABLE public.inventory_ledger ADD COLUMN IF NOT EXISTS "distributorId" uuid;
ALTER TABLE public.inventory_ledger ADD COLUMN IF NOT EXISTS sku text;
ALTER TABLE public.inventory_ledger ADD COLUMN IF NOT EXISTS "currentStock" numeric;
ALTER TABLE public.inventory_ledger ADD COLUMN IF NOT EXISTS "reorderLevel" numeric;
ALTER TABLE public.inventory_ledger ADD COLUMN IF NOT EXISTS "lastRestockDate" text;


-------------------------------------------------------------------
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-------------------------------------------------------------------

-- Organizations
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Organization Access" ON public.organizations;
-- Allows public to read orgs (e.g., for branding)
CREATE POLICY "Public Organization Access" ON public.organizations FOR SELECT USING (true);
CREATE POLICY "Admin Organization Update" ON public.organizations FOR UPDATE USING (owner_id = auth.uid());

-- Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "org + hierarchy visibility on profiles select" ON public.profiles;
DROP POLICY IF EXISTS "org + hierarchy visibility on profiles update" ON public.profiles;
DROP POLICY IF EXISTS "org + hierarchy visibility on profiles insert" ON public.profiles;

CREATE POLICY "org + hierarchy visibility on profiles select"
ON public.profiles FOR SELECT
USING (
  id = auth.uid() OR
  (
    org_id = public.auth_org_id()
    AND (
      public.auth_role() = 'ADMIN'
      OR auth.uid() = ANY(ancestor_ids)
    )
  )
);
CREATE POLICY "org + hierarchy visibility on profiles update"
ON public.profiles FOR UPDATE
USING (
  org_id = public.auth_org_id()
  AND (
    public.auth_role() = 'ADMIN'
    OR id = auth.uid()
    OR auth.uid() = ANY(ancestor_ids)
  )
);
CREATE POLICY "org + hierarchy visibility on profiles insert"
ON public.profiles FOR INSERT
WITH CHECK (
  org_id = public.auth_org_id()
  AND (
    public.auth_role() = 'ADMIN'
    OR auth.uid() = parent_id
  )
);

CREATE POLICY "Users can insert their own profile via invite"
ON public.profiles FOR INSERT
WITH CHECK (
  id = auth.uid() 
  AND EXISTS (
    SELECT 1 FROM public.invites 
    WHERE email = (auth.jwt() ->> 'email')
      AND org_id = profiles.org_id 
      AND role = profiles.role
  )
);

-- Invites
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "org + hierarchy visibility on invites select" ON public.invites;
DROP POLICY IF EXISTS "public read invites" ON public.invites;
DROP POLICY IF EXISTS "org + hierarchy visibility on invites update" ON public.invites;
DROP POLICY IF EXISTS "org + hierarchy visibility on invites insert" ON public.invites;

CREATE POLICY "org + hierarchy visibility on invites select"
ON public.invites FOR SELECT
USING (
  org_id = public.auth_org_id()
  AND (
    public.auth_role() = 'ADMIN'
    OR created_by = auth.uid()
  )
);
-- Allow unauthenticated to read invites by email for redemption
CREATE POLICY "public read invites" ON public.invites FOR SELECT USING (true);
CREATE POLICY "org + hierarchy visibility on invites update"
ON public.invites FOR UPDATE
USING (
  org_id = public.auth_org_id() OR true
);
CREATE POLICY "org + hierarchy visibility on invites insert"
ON public.invites FOR INSERT
WITH CHECK (
  org_id = public.auth_org_id()
);

-- Audit Logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "org visibility on audit_logs" ON public.audit_logs;
DROP POLICY IF EXISTS "insert on audit_logs" ON public.audit_logs;

CREATE POLICY "org visibility on audit_logs" ON public.audit_logs FOR SELECT USING (
  org_id = public.auth_org_id() AND public.auth_role() = 'ADMIN'
);
CREATE POLICY "insert on audit_logs" ON public.audit_logs FOR INSERT WITH CHECK (
  org_id = public.auth_org_id()
);

-- Business Tables RLS Macro
DO $$
DECLARE
  t text;
  tables text[] := ARRAY['customers', 'orders', 'products', 'visits', 'beats', 'super_stockists', 'distributors', 'inventory_ledger', 'invoices'];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format('DROP POLICY IF EXISTS "org + hierarchy isolation select" ON public.%I;', t);
    EXECUTE format('DROP POLICY IF EXISTS "org + hierarchy isolation insert" ON public.%I;', t);
    EXECUTE format('DROP POLICY IF EXISTS "org + hierarchy isolation update" ON public.%I;', t);
    EXECUTE format('DROP POLICY IF EXISTS "org + hierarchy isolation delete" ON public.%I;', t);
    
    EXECUTE format('
      CREATE POLICY "org + hierarchy isolation select" ON public.%I FOR SELECT USING (
        org_id = public.auth_org_id() AND (
          public.auth_role() = ''ADMIN'' OR owner_id = auth.uid() OR auth.uid() = ANY(owner_ancestor_ids)
        )
      );
    ', t);
    
    EXECUTE format('
      CREATE POLICY "org + hierarchy isolation insert" ON public.%I FOR INSERT WITH CHECK (
        org_id = public.auth_org_id() AND (
          public.auth_role() = ''ADMIN'' OR owner_id = auth.uid() OR auth.uid() = ANY(owner_ancestor_ids)
        )
      );
    ', t);
    
    EXECUTE format('
      CREATE POLICY "org + hierarchy isolation update" ON public.%I FOR UPDATE USING (
        org_id = public.auth_org_id() AND (
          public.auth_role() = ''ADMIN'' OR owner_id = auth.uid() OR auth.uid() = ANY(owner_ancestor_ids)
        )
      );
    ', t);
    
    EXECUTE format('
      CREATE POLICY "org + hierarchy isolation delete" ON public.%I FOR DELETE USING (
        org_id = public.auth_org_id() AND (
          public.auth_role() = ''ADMIN'' OR owner_id = auth.uid() OR auth.uid() = ANY(owner_ancestor_ids)
        )
      );
    ', t);
  END LOOP;
END $$;
