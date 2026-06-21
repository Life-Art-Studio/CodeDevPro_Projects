import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

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
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error("Usage: node scripts/create-admin.js <email> <org_name> [password]");
    process.exit(1);
  }

  const [email, orgName, password = 'Password123!'] = args;

  console.log(`Creating ADMIN organization for: ${orgName}`);

  // 1. Create ADMIN user
  const { data: adminAuth, error: adminErr } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (adminErr) {
    if (adminErr.message.includes('already registered')) {
      console.log(`User ${email} already exists, fetching their ID...`);
      // In a real script you'd query auth.users, but admin.createUser fails if exists.
      // We will try to fetch the user.
      console.error("Please use a non-existing email or delete the user first.");
      process.exit(1);
    }
    throw adminErr;
  }
  
  console.log(`Created ADMIN auth user: ${email} (ID: ${adminAuth.user.id})`);

  // 2. Create Organization
  const { data: org, error: orgErr } = await supabase
    .from('organizations')
    .insert({
      name: orgName,
      slug: orgName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      owner_id: adminAuth.user.id
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
    full_name: 'Admin',
    email
  });
  if (pAdminErr) throw pAdminErr;

  console.log("\\nSuccessfully bootstrapped new ADMIN!");
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
}

run().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
