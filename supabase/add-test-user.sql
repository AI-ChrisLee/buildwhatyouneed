-- ========================================
-- ADD TEST USER FOR DEVELOPMENT
-- ========================================

-- First, check if test user already exists
DO $$
DECLARE
  test_user_id UUID;
BEGIN
  -- Check if test@example.com already exists
  SELECT id INTO test_user_id FROM auth.users WHERE email = 'test@example.com';
  
  IF test_user_id IS NOT NULL THEN
    RAISE NOTICE 'Test user already exists with ID: %', test_user_id;
  ELSE
    -- Create test user in auth.users
    -- Note: This is for development only. In production, use Supabase Auth API
    test_user_id := gen_random_uuid();
    
    -- Insert into auth.users
    INSERT INTO auth.users (
      id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_user_meta_data,
      is_super_admin,
      role
    ) VALUES (
      test_user_id,
      'test@example.com',
      crypt('password123', gen_salt('bf')), -- Password: password123
      NOW(),
      NOW(),
      NOW(),
      jsonb_build_object('full_name', 'Test User'),
      false,
      'authenticated'
    );
    
    -- The trigger should create the public.users entry automatically
    -- But let's ensure it exists
    INSERT INTO public.users (id, email, full_name, is_admin, created_at)
    VALUES (
      test_user_id,
      'test@example.com',
      'Test User',
      false,
      NOW()
    )
    ON CONFLICT (id) DO UPDATE
    SET 
      email = EXCLUDED.email,
      full_name = EXCLUDED.full_name;
    
    -- Create a lead entry
    INSERT INTO public.leads (email, name, stage, user_id, source)
    VALUES (
      'test@example.com',
      'Test User',
      'member',
      test_user_id,
      'test_script'
    )
    ON CONFLICT (email) DO NOTHING;
    
    RAISE NOTICE 'Test user created successfully!';
    RAISE NOTICE 'Email: test@example.com';
    RAISE NOTICE 'Password: password123';
    RAISE NOTICE 'User ID: %', test_user_id;
  END IF;
END $$;

-- Verify the user was created
SELECT 'Auth Users:' as table_name, COUNT(*) as count FROM auth.users WHERE email = 'test@example.com';
SELECT 'Public Users:' as table_name, COUNT(*) as count FROM public.users WHERE email = 'test@example.com';
SELECT 'Leads:' as table_name, COUNT(*) as count FROM public.leads WHERE email = 'test@example.com';

-- Show the test user details
SELECT 
  u.id,
  u.email,
  u.full_name,
  u.is_admin,
  u.created_at
FROM users u
WHERE u.email = 'test@example.com';