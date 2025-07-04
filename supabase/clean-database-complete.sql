-- ========================================
-- COMPLETE DATABASE CLEANUP & RESET
-- WARNING: This will DELETE ALL DATA!
-- ========================================

-- STEP 1: Delete ALL data from all tables
-- ========================================

-- First, disable RLS temporarily to ensure we can delete everything
ALTER TABLE IF EXISTS threads DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS leads DISABLE ROW LEVEL SECURITY;

-- Delete all data in order (respecting foreign keys)
TRUNCATE TABLE comments CASCADE;
TRUNCATE TABLE threads CASCADE;
TRUNCATE TABLE lessons CASCADE;
TRUNCATE TABLE courses CASCADE;
TRUNCATE TABLE stripe_subscriptions CASCADE;
TRUNCATE TABLE stripe_customers CASCADE;
TRUNCATE TABLE leads CASCADE;
TRUNCATE TABLE users CASCADE;

-- Delete ALL auth users too
DELETE FROM auth.users;

-- STEP 2: Drop unnecessary tables completely
-- ========================================
DROP TABLE IF EXISTS conversion_funnel CASCADE;
DROP TABLE IF EXISTS course_enrollments CASCADE;
DROP TABLE IF EXISTS office_hours CASCADE;
DROP TABLE IF EXISTS site_content CASCADE;
DROP TABLE IF EXISTS user_progress CASCADE;
DROP VIEW IF EXISTS lead_analytics CASCADE;

-- STEP 3: Verify we have exactly 8 tables
-- ========================================
SELECT 
  tablename,
  CASE 
    WHEN tablename IN ('users', 'leads', 'threads', 'comments', 'courses', 'lessons', 'stripe_customers', 'stripe_subscriptions') 
    THEN '✓ Core table (EMPTY)'
    ELSE '❌ Should be deleted!'
  END as status
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- STEP 4: Re-enable RLS with simple policies
-- ========================================

-- Users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id OR is_admin = true);

-- Threads table  
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Members can view threads" ON threads;
DROP POLICY IF EXISTS "Members can create threads" ON threads;
CREATE POLICY "Anyone can view threads" ON threads
  FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create threads" ON threads
  FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Comments table
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Members can view comments" ON comments;
DROP POLICY IF EXISTS "Members can create comments" ON comments;
CREATE POLICY "Anyone can view comments" ON comments
  FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create comments" ON comments
  FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Leads table (admin only)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage leads" ON leads;
CREATE POLICY "Admins can manage leads" ON leads
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.is_admin = true
    )
  );

-- STEP 5: Create helper functions for adding test users
-- ========================================

-- Function to create a test user (for your manual testing)
CREATE OR REPLACE FUNCTION create_test_user(
  test_email TEXT,
  test_password TEXT,
  test_name TEXT,
  test_is_admin BOOLEAN DEFAULT false
) RETURNS uuid AS $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Create auth user
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    test_email,
    crypt(test_password, gen_salt('bf')),
    NOW(),
    jsonb_build_object('full_name', test_name),
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  ) RETURNING id INTO new_user_id;

  -- Create public user
  INSERT INTO public.users (id, email, full_name, is_admin)
  VALUES (new_user_id, test_email, test_name, test_is_admin);

  -- Create lead entry
  INSERT INTO public.leads (email, name, stage, source, user_id)
  VALUES (test_email, test_name, 'member', 'manual', new_user_id);

  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 6: Summary
-- ========================================
SELECT 'DATABASE CLEANED!' as status;
SELECT 'Tables remaining: ' || count(*) as info FROM pg_tables WHERE schemaname = 'public';
SELECT 'Auth users: ' || count(*) as info FROM auth.users;
SELECT 'Public users: ' || count(*) as info FROM public.users;

-- Instructions for adding test users:
SELECT '
To add test users, run these commands:

-- Add admin user:
SELECT create_test_user(''admin@buildwhatyouneed.com'', ''password123'', ''Admin User'', true);

-- Add paid member:
SELECT create_test_user(''paid@example.com'', ''password123'', ''Paid Member'', false);

-- Add free user (lead):
INSERT INTO leads (email, name, stage) VALUES (''free@example.com'', ''Free User'', ''lead'');
' as next_steps;