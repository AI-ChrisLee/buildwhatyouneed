-- ========================================
-- FIX USER SIGNUP TRIGGER (CORRECTED VERSION)
-- ========================================
-- This script fixes the "Database error saving new user" issue
-- Run this in your Supabase SQL editor

-- 1. First, check if the users table exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'users'
  ) THEN
    RAISE EXCEPTION 'public.users table does not exist! Run the full database setup first.';
  END IF;
END $$;

-- 2. Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- 3. Create the function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into public.users
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the auth signup
    RAISE WARNING 'Failed to create public.users entry for %: %', NEW.email, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create the trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 5. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, authenticated, anon;
GRANT ALL ON public.users TO postgres;
GRANT SELECT ON public.users TO authenticated, anon;

-- 6. Fix any existing auth users that don't have public.users entries
INSERT INTO public.users (id, email, full_name)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', '')
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- 7. Verify the fix
DO $$
DECLARE
  auth_count INTEGER;
  public_count INTEGER;
  missing_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO auth_count FROM auth.users;
  SELECT COUNT(*) INTO public_count FROM public.users;
  
  SELECT COUNT(*) INTO missing_count
  FROM auth.users au
  LEFT JOIN public.users pu ON au.id = pu.id
  WHERE pu.id IS NULL;
  
  RAISE NOTICE 'Auth users: %, Public users: %, Missing: %', 
    auth_count, public_count, missing_count;
  
  IF missing_count > 0 THEN
    RAISE WARNING 'There are still % auth users without public.users entries!', missing_count;
  ELSE
    RAISE NOTICE 'All auth users have corresponding public.users entries ✓';
  END IF;
END $$;

-- 8. Check if trigger exists and is enabled
SELECT 
  tgname as trigger_name,
  tgenabled as is_enabled,
  pg_get_triggerdef(oid) as trigger_definition
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- 9. Check if the function exists
SELECT 
  proname as function_name,
  pronargs as arg_count
FROM pg_proc
WHERE proname = 'handle_new_user';

-- Done! The trigger should now work for new signups.
-- To test, try creating a new user through your app's signup flow.