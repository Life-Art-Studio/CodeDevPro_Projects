import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Ensure the environment has the SUPABASE_SERVICE_ROLE_KEY
// Typically it's in .env as VITE_SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SERVICE_ROLE_KEY
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase URL or Service Role Key in .env. Exiting.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function run() {
  console.log("Seeding test organization...");

  // 1. Create ADMIN user
  const adminEmail = `admin-${Date.now()}@test.com`;
  const { data: adminAuth, error: adminErr } = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: 'Password123!',
    email_confirm: true,
  });
  if (adminErr) throw adminErr;
  console.log(`Created ADMIN auth user: ${adminEmail} (ID: ${adminAuth.user.id})`);

  // 2. Create Organization
  const { data: org, error: orgErr } = await supabase
    .from('organizations')
    .insert({
      name: 'Test Acme Corp',
      slug: `acme-${Date.now()}`,
      owner_id: adminAuth.user.id,
      primary_color: '#ff0000'
    })
    .select()
    .single();
  if (orgErr) throw orgErr;
  console.log(`Created Organization: ${org.name} (ID: ${org.id})`);

  // 3. Create ADMIN profile
  const { error: pAdminErr } = await supabase.from('profiles').insert({
    id: adminAuth.user.id,
    org_id: org.id,
    role: 'ADMIN',
    parent_id: null,
    full_name: 'Test Admin',
    email: adminEmail
  });
  if (pAdminErr) throw pAdminErr;

  // 4. Create SUPER_STOCKIST
  const ssEmail = `ss-${Date.now()}@test.com`;
  const { data: ssAuth, error: ssErr } = await supabase.auth.admin.createUser({
    email: ssEmail,
    password: 'Password123!',
    email_confirm: true,
  });
  if (ssErr) throw ssErr;
  
  const { error: pSsErr } = await supabase.from('profiles').insert({
    id: ssAuth.user.id,
    org_id: org.id,
    role: 'SUPER_STOCKIST',
    parent_id: adminAuth.user.id,
    full_name: 'Test Super Stockist',
    email: ssEmail
  });
  if (pSsErr) throw pSsErr;
  console.log(`Created SUPER_STOCKIST: ${ssEmail} (Parent: ADMIN)`);

  // 5. Create DISTRIBUTOR
  const distEmail = `dist-${Date.now()}@test.com`;
  const { data: distAuth, error: distErr } = await supabase.auth.admin.createUser({
    email: distEmail,
    password: 'Password123!',
    email_confirm: true,
  });
  if (distErr) throw distErr;

  const { error: pDistErr } = await supabase.from('profiles').insert({
    id: distAuth.user.id,
    org_id: org.id,
    role: 'DISTRIBUTOR',
    parent_id: ssAuth.user.id,
    full_name: 'Test Distributor',
    email: distEmail
  });
  if (pDistErr) throw pDistErr;
  console.log(`Created DISTRIBUTOR: ${distEmail} (Parent: SUPER_STOCKIST)`);

  // 6. Create SALES
  const salesEmail = `sales-${Date.now()}@test.com`;
  const { data: salesAuth, error: salesErr } = await supabase.auth.admin.createUser({
    email: salesEmail,
    password: 'Password123!',
    email_confirm: true,
  });
  if (salesErr) throw salesErr;

  const { error: pSalesErr } = await supabase.from('profiles').insert({
    id: salesAuth.user.id,
    org_id: org.id,
    role: 'SALES',
    parent_id: distAuth.user.id,
    full_name: 'Test Sales Rep',
    email: salesEmail
  });
  if (pSalesErr) throw pSalesErr;
  console.log(`Created SALES: ${salesEmail} (Parent: DISTRIBUTOR)`);

  console.log("\\nSeed completed successfully!");
  console.log(`Password for all accounts: Password123!`);
}

run().catch(err => {
  console.error("Seed error:", err);
  process.exit(1);
});
