import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing Authorization header');

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

    const { data: { user }, error: userErr } = await userClient.auth.getUser();

    if (userErr || !user) throw new Error('Invalid token');

    const { data: callerProfile, error: profileErr } = await userClient
      .from('profiles')
      .select('org_id, role, id, ancestor_ids')
      .eq('id', user.id)
      .single();

    if (profileErr || !callerProfile) throw new Error('Profile not found');

    const { username, password, full_name, phone, role: requestedRole, parent_id: requestedParentId } = await req.json();

    if (!requestedRole) {
      throw new Error('Missing role');
    }

    if (!username || !password || !full_name) {
      throw new Error('Username, password, and full name are required for all accounts.');
    }

    // SECURITY: org_id is always sourced from the caller's JWT claim,
    // never from the request payload. A user cannot assign themselves 
    // or others to a different org.
    const orgId = callerProfile.org_id;

    // Validate username format
    const usernameRegex = /^[a-z0-9_]{4,30}$/;
    const cleanUsername = username.trim().toLowerCase();
    
    if (!usernameRegex.test(cleanUsername)) {
      throw new Error('Invalid username format. Use lowercase letters, numbers, and underscores (4-30 chars).');
    }

    const callerRole = callerProfile.role;
    let allowed = false;

    if (callerRole === 'ADMIN') {
      if (['SUPER_STOCKIST', 'DISTRIBUTOR', 'SALES'].includes(requestedRole)) allowed = true;
    } else if (callerRole === 'SUPER_STOCKIST') {
      if (['DISTRIBUTOR', 'SALES'].includes(requestedRole)) allowed = true;
    } else if (callerRole === 'DISTRIBUTOR') {
      if (['SALES'].includes(requestedRole)) allowed = true;
    }

    if (!allowed) {
      return new Response(JSON.stringify({ error: `Forbidden: ${callerRole} cannot create ${requestedRole}` }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Determine Final Parent ID and Ancestor IDs
    let finalParentId = callerProfile.id; // Default to caller
    let finalAncestorIds = [...(callerProfile.ancestor_ids || []), callerProfile.id];

    if (requestedParentId) {
       if (callerRole === 'ADMIN') {
          // Admin can assign to anyone in their org
          const { data: targetProfile, error: targetErr } = await serviceClient
             .from('profiles')
             .select('id, org_id, ancestor_ids')
             .eq('id', requestedParentId)
             .single();
          if (targetErr || targetProfile.org_id !== orgId) {
             throw new Error('Invalid parent assignment: Target does not exist or belongs to a different organization.');
          }
          finalParentId = requestedParentId;
          finalAncestorIds = [...(targetProfile.ancestor_ids || []), targetProfile.id];
       } 
       else if (callerRole === 'SUPER_STOCKIST') {
          // SS can only assign to a DB that is currently under their control
          const { data: targetProfile, error: targetErr } = await serviceClient
             .from('profiles')
             .select('id, ancestor_ids, role')
             .eq('id', requestedParentId)
             .single();
          
          if (targetErr || targetProfile.role !== 'DISTRIBUTOR' || !(targetProfile.ancestor_ids || []).includes(callerProfile.id)) {
             throw new Error('Forbidden: You can only link this user to a Distributor currently under your control.');
          }
          finalParentId = requestedParentId;
          finalAncestorIds = [...(targetProfile.ancestor_ids || []), targetProfile.id];
       }
    }

    // Check username uniqueness
    const { data: existingUser, error: existingErr } = await serviceClient
      .from('profiles')
      .select('id')
      .ilike('username', cleanUsername)
      .maybeSingle();
      
    if (existingErr) throw existingErr;
    if (existingUser) {
      return new Response(JSON.stringify({ error: 'Username already taken. Please choose another.' }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // SECURITY: The '@internal.smartdashboard.local' domain is a 
    // non-existent domain. Supabase will never successfully send 
    // email to these addresses. Email confirmation is disabled.
    // These are auth identifiers only, not real email addresses.
    const fakeEmail = `${cleanUsername}@internal.smartdashboard.local`;

    // 1. Create Auth User
    const { data: authUser, error: authError } = await serviceClient.auth.admin.createUser({
      email: fakeEmail,
      password: password,
      email_confirm: true,
      user_metadata: {
         full_name: full_name
      }
    });

    if (authError) {
       // Gracefully handle "already exists" mapping back to username
       if (authError.message.toLowerCase().includes('already registered')) {
          throw new Error('Username already taken. Please choose another.');
       }
       throw authError;
    }

    // Update app_metadata for custom JWT claims
    await serviceClient.auth.admin.updateUserById(authUser.user.id, {
      app_metadata: {
        app_role: requestedRole,
        org_id: orgId
      }
    });

    // 2. Insert Profile Directly
    const { error: insertProfileErr } = await serviceClient
      .from('profiles')
      .insert({
        id: authUser.user.id,
        org_id: orgId,
        role: requestedRole,
        parent_id: finalParentId,
        ancestor_ids: finalAncestorIds,
        full_name: full_name,
        username: cleanUsername,
        phone: phone || null,
        email: null, // no real email for these roles
        status: 'active'
      });

    if (insertProfileErr) {
       // Rollback auth user
       await serviceClient.auth.admin.deleteUser(authUser.user.id);
       if (insertProfileErr.code === '23505') {
          throw new Error('Username already taken. Please choose another.');
       }
       throw insertProfileErr;
    }

    // 3. Audit Log
    // SECURITY: Username is immutable post-creation to prevent 
    // identity confusion in audit logs (audit_logs references 
    // actor_id/target_id by UUID, but username in metadata is 
    // the human-readable identifier at time of action).
    await serviceClient.from('audit_logs').insert({
      org_id: orgId,
      actor_id: callerProfile.id,
      action: 'CREATED_TEAM_MEMBER',
      metadata: { username: cleanUsername, role: requestedRole, assigned_parent: finalParentId, full_name }
    });

    return new Response(JSON.stringify({ message: `${requestedRole.replace('_', ' ')} created successfully`, direct_creation: true, user_id: authUser.user.id, username: cleanUsername }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
