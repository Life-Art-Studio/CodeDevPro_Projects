-- Fix all users who logged in via Google but got wrong role
-- Identify them by checking if their admin_id equals their own id (self-referencing = Admin)
-- or if they have no admin_id at all but exist from an OAuth login

UPDATE public.users 
SET role = 'ADMIN', admin_id = id
WHERE id IN (
  SELECT id FROM public.users 
  WHERE role = 'SALES' 
  AND id IN (
    -- These are auth users who signed up via Google OAuth
    SELECT id::text FROM auth.users 
    WHERE raw_app_meta_data->>'provider' = 'google'
  )
);

-- Direct fix for the specific affected user
UPDATE public.users 
SET role = 'ADMIN', admin_id = id, status = 'Active'
WHERE email = 'lifeart774@gmail.com';

-- Also fix by auth provider in case email differs
UPDATE public.users 
SET role = 'ADMIN', admin_id = id, status = 'Active'  
WHERE id IN (
  SELECT id::text FROM auth.users 
  WHERE raw_app_meta_data->>'provider' = 'google'
  AND email = 'lifeart774@gmail.com'
);
