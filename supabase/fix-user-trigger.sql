-- ========================================
-- FIX USER SIGNUP TRIGGER
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

-- 8. Test the trigger with a dummy user (will be rolled back)
DO $$
DECLARE
  test_user_id UUID := gen_random_uuid();
  public_user_exists BOOLEAN;
BEGIN
  -- Start a savepoint
  BEGIN
    -- Insert a test auth user
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token
    ) VALUES (
      test_user_id,
      '00000000-0000-0000-0000-000000000000',
      'trigger-test-' || test_user_id || '@example.com',
      '$2a$10$PExmelFAB8oQR5lKvIV2JeLgwF5JmgBUcXhAw.UHU5xgcWXLaB2HS', -- dummy password
      NOW(),
      '{"full_name": "Trigger Test User"}'::jsonb,
      NOW(),
      NOW(),
      '',
      ''
    );
    
    -- Check if public.users entry was created
    SELECT EXISTS (
      SELECT 1 FROM public.users WHERE id = test_user_id
    ) INTO public_user_exists;
    
    IF public_user_exists THEN
      RAISE NOTICE 'SUCCESS: Trigger is working! Test user was created in public.users';
    ELSE
      RAISE WARNING 'FAILURE: Trigger did not create public.users entry!';
    END IF;
    
    -- Rollback the test
    ROLLBACK;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'Test failed with error: %', SQLERRM;
      ROLLBACK;
  END;
END $$;

-- Done! The trigger should now work for new signups.