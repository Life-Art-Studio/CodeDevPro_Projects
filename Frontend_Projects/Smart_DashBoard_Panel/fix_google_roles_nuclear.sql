-- Step 1: See what exists for your Google accounts
SELECT u.id, u.email, u.role, u.admin_id, u.status, 
       au.raw_app_meta_data->>'provider' as provider
FROM public.users u
JOIN auth.users au ON au.id::text = u.id
ORDER BY u.created_at DESC;

-- Step 2: Nuclear fix — force ALL Google OAuth users to ADMIN
UPDATE public.users 
SET 
  role = 'ADMIN',
  admin_id = id,
  status = 'Active'
WHERE id IN (
  SELECT id::text FROM auth.users 
  WHERE raw_app_meta_data->>'provider' = 'google'
);

-- Step 3: Verify the fix
SELECT id, email, role, admin_id, status FROM public.users;

-- Step 4: Also check if there are duplicate rows by email
SELECT email, COUNT(*) FROM public.users GROUP BY email HAVING COUNT(*) > 1;

-- Step 5: If duplicate rows exist, delete the wrong one
-- (keep the one where id matches auth.users id)
DELETE FROM public.users 
WHERE role = 'SALES' 
AND id IN (
  SELECT id::text FROM auth.users 
  WHERE raw_app_meta_data->>'provider' = 'google'
);
