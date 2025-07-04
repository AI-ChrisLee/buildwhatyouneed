-- ========================================
-- CHECK TABLE STRUCTURE FIRST
-- ========================================

-- Check what columns exist in users table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY ordinal_position;

-- Check what columns exist in leads table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'leads'
ORDER BY ordinal_position;

-- ========================================
-- RESET SCRIPT WITH CORRECT COLUMNS
-- ========================================

-- Disable trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Clean all data
TRUNCATE TABLE comments CASCADE;
TRUNCATE TABLE threads CASCADE;
TRUNCATE TABLE lessons CASCADE;
TRUNCATE TABLE courses CASCADE;
TRUNCATE TABLE stripe_subscriptions CASCADE;
TRUNCATE TABLE stripe_customers CASCADE;
TRUNCATE TABLE leads CASCADE;
TRUNCATE TABLE users CASCADE;
DELETE FROM auth.users;

-- Create users based on actual table structure
DO $$
DECLARE
  admin_id uuid;
  paid_id uuid;
  free_id uuid;
  user_has_full_name boolean;
  user_has_name boolean;
BEGIN
  -- Check if users table has full_name or name column
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'full_name'
  ) INTO user_has_full_name;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'name'
  ) INTO user_has_name;

  -- 1. Create Admin
  admin_id := gen_random_uuid();
  
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_user_meta_data, created_at, updated_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', admin_id,
    'authenticated', 'authenticated', 'admin@aichrislee.com',
    crypt('admin123', gen_salt('bf')), NOW(),
    '{"full_name": "Chris Lee"}'::jsonb, NOW(), NOW()
  );
  
  -- Insert into users with available columns
  IF user_has_full_name THEN
    INSERT INTO public.users (id, email, full_name, is_admin)
    VALUES (admin_id, 'admin@aichrislee.com', 'Chris Lee', true);
  ELSIF user_has_name THEN
    INSERT INTO public.users (id, email, name, is_admin)
    VALUES (admin_id, 'admin@aichrislee.com', 'Chris Lee', true);
  ELSE
    INSERT INTO public.users (id, email, is_admin)
    VALUES (admin_id, 'admin@aichrislee.com', true);
  END IF;
  
  INSERT INTO public.leads (email, name, stage, user_id)
  VALUES ('admin@aichrislee.com', 'Chris Lee', 'member', admin_id);

  -- 2. Create Paid Member
  paid_id := gen_random_uuid();
  
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_user_meta_data, created_at, updated_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', paid_id,
    'authenticated', 'authenticated', 'paid@aichrislee.com',
    crypt('paid123', gen_salt('bf')), NOW(),
    '{"full_name": "Test Paid Member"}'::jsonb, NOW(), NOW()
  );
  
  IF user_has_full_name THEN
    INSERT INTO public.users (id, email, full_name, is_admin)
    VALUES (paid_id, 'paid@aichrislee.com', 'Test Paid Member', false);
  ELSIF user_has_name THEN
    INSERT INTO public.users (id, email, name, is_admin)
    VALUES (paid_id, 'paid@aichrislee.com', 'Test Paid Member', false);
  ELSE
    INSERT INTO public.users (id, email, is_admin)
    VALUES (paid_id, 'paid@aichrislee.com', false);
  END IF;
  
  INSERT INTO public.leads (email, name, stage, user_id)
  VALUES ('paid@aichrislee.com', 'Test Paid Member', 'member', paid_id);
  
  INSERT INTO public.stripe_customers (user_id, stripe_customer_id)
  VALUES (paid_id, 'cus_test_paid');
  
  INSERT INTO public.stripe_subscriptions (id, user_id, status, current_period_end)
  VALUES ('sub_test_paid', paid_id, 'active', NOW() + INTERVAL '30 days');

  -- 3. Create Free Member
  free_id := gen_random_uuid();
  
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_user_meta_data, created_at, updated_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', free_id,
    'authenticated', 'authenticated', 'free@aichrislee.com',
    crypt('free123', gen_salt('bf')), NOW(),
    '{"full_name": "Test Free Member"}'::jsonb, NOW(), NOW()
  );
  
  IF user_has_full_name THEN
    INSERT INTO public.users (id, email, full_name, is_admin)
    VALUES (free_id, 'free@aichrislee.com', 'Test Free Member', false);
  ELSIF user_has_name THEN
    INSERT INTO public.users (id, email, name, is_admin)
    VALUES (free_id, 'free@aichrislee.com', 'Test Free Member', false);
  ELSE
    INSERT INTO public.users (id, email, is_admin)
    VALUES (free_id, 'free@aichrislee.com', false);
  END IF;
  
  INSERT INTO public.leads (email, name, stage, user_id)
  VALUES ('free@aichrislee.com', 'Test Free Member', 'member', free_id);

END $$;

-- Add leads without auth
INSERT INTO public.leads (email, name, stage, source)
VALUES 
  ('lead1@example.com', 'Lead User 1', 'lead', 'youtube'),
  ('lead2@example.com', 'Lead User 2', 'hot_lead', 'landing_page');

-- Add sample content
INSERT INTO public.courses (title, description, order_index)
VALUES 
  ('Week 1: SaaS Destruction', 'Learn to build what you need', 1);

-- Recreate trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Show results
SELECT '=== USERS CREATED ===' as status;
SELECT email, is_admin, 
  CASE 
    WHEN email LIKE '%@aichrislee.com' THEN 
      'Password: ' || split_part(email, '@', 1) || '123'
    ELSE 'No login'
  END as credentials
FROM users
ORDER BY is_admin DESC;