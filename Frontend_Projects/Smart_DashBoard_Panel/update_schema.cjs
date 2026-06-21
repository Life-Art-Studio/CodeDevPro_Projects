const fs = require('fs');
let content = fs.readFileSync('supabase_schema.sql', 'utf8');

const tables = [
  'customers', 'orders', 'products', 'visits', 'beats', 
  'super_stockists', 'distributors', 'inventory_ledger', 'invoices', 'audit_logs'
];

let addedColumns = '';
tables.forEach(t => {
  addedColumns += `\n`;
});

content = content.replace(/-------------------------------------------------------------------\r?\n-- 5\. ROW LEVEL SECURITY & POLICIES\r?\n-------------------------------------------------------------------/, 
``);

let policiesStr = `
-- Helper function to avoid infinite recursion in policies
CREATE OR REPLACE FUNCTION public.get_auth_admin_id()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT admin_id FROM public.users WHERE id = auth.uid()::text LIMIT 1;
$$;

-- Users Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access to users" ON public.users;
DROP POLICY IF EXISTS "Allow individual insert access" ON public.users;
DROP POLICY IF EXISTS "Allow individual update access" ON public.users;
DROP POLICY IF EXISTS "Tenant Isolation Select" ON public.users;
DROP POLICY IF EXISTS "Allow user creation" ON public.users;
DROP POLICY IF EXISTS "Tenant Isolation Update" ON public.users;
DROP POLICY IF EXISTS "Tenant Isolation Delete" ON public.users;

CREATE POLICY "Tenant Isolation Select" ON public.users FOR SELECT USING (id = auth.uid()::text OR admin_id = public.get_auth_admin_id());
CREATE POLICY "Allow user creation" ON public.users FOR INSERT WITH CHECK (id = auth.uid()::text OR admin_id = public.get_auth_admin_id());
CREATE POLICY "Tenant Isolation Update" ON public.users FOR UPDATE USING (id = auth.uid()::text OR admin_id = public.get_auth_admin_id());
CREATE POLICY "Tenant Isolation Delete" ON public.users FOR DELETE USING (id = auth.uid()::text OR admin_id = public.get_auth_admin_id());
`;

tables.forEach(t => {
  policiesStr += `
-- ${t.charAt(0).toUpperCase() + t.slice(1)} Policies
ALTER TABLE public.${t} ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access to ${t}" ON public.${t};
DROP POLICY IF EXISTS "Allow public insert access" ON public.${t};
DROP POLICY IF EXISTS "Allow public update access" ON public.${t};
DROP POLICY IF EXISTS "Allow public delete access" ON public.${t};
DROP POLICY IF EXISTS "Tenant Isolation Select" ON public.${t};
DROP POLICY IF EXISTS "Tenant Isolation Insert" ON public.${t};
DROP POLICY IF EXISTS "Tenant Isolation Update" ON public.${t};
DROP POLICY IF EXISTS "Tenant Isolation Delete" ON public.${t};

CREATE POLICY "Tenant Isolation Select" ON public.${t} FOR SELECT USING (admin_id = public.get_auth_admin_id());
CREATE POLICY "Tenant Isolation Insert" ON public.${t} FOR INSERT WITH CHECK (admin_id = public.get_auth_admin_id());
CREATE POLICY "Tenant Isolation Update" ON public.${t} FOR UPDATE USING (admin_id = public.get_auth_admin_id());
CREATE POLICY "Tenant Isolation Delete" ON public.${t} FOR DELETE USING (admin_id = public.get_auth_admin_id());
`;
});

const rlsIndex = content.indexOf('-- Users Policies');
if (rlsIndex !== -1) {
  content = content.substring(0, rlsIndex) + policiesStr;
} else {
  content += policiesStr;
}

fs.writeFileSync('supabase_schema.sql', content);
