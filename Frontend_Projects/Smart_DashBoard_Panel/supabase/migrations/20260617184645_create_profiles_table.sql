-- Create a table for public profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid not null references auth.users on delete cascade primary key,
    updated_at timestamp with time zone,
    username text unique,
    full_name text,
    avatar_url text
);
-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
-- --------------------------------------------------------
-- RLS POLICIES
-- --------------------------------------------------------
-- Policy 1: Anyone can read profiles (or you can restrict to authenticated users only)
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR
SELECT USING (true);
-- Policy 2: Users can insert their own profile (necessary when they sign up)
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR
INSERT WITH CHECK (auth.uid() = id);
-- Policy 3: Users can only update their own profile
CREATE POLICY "Users can update own profile." ON public.profiles FOR
UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
-- Create an extension if not exists for the updated_at trigger (Supabase built-in function)
CREATE EXTENSION IF NOT EXISTS moddatetime schema extensions;
-- Apply the trigger to the profiles table
CREATE TRIGGER handle_updated_at BEFORE
UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime (updated_at);