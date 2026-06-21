-- 1. Add username column
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS username text UNIQUE;

-- 2. Generate usernames for existing users based on their name
-- We remove spaces and special characters and lowercase it.
UPDATE public.users 
SET username = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]', '', 'g'))
WHERE username IS NULL;

-- 3. If there are duplicates, we might need manual intervention, but let's assume they are unique for now, or append part of ID.
-- To be safe against duplicates, we can append the first 4 chars of ID if it's not unique:
UPDATE public.users u
SET username = u.username || substring(u.id, 1, 4)
WHERE EXISTS (
  SELECT 1 FROM public.users u2 
  WHERE u2.username = u.username AND u2.id != u.id
);

-- 4. Update auth.users email for SALES reps so they can login with the new username pseudo-email
UPDATE auth.users au
SET email = u.username || '@sales.local'
FROM public.users u
WHERE au.id::text = u.id AND u.role = 'SALES';
