-- ========================================
-- COMPLETE DATABASE CLEANUP & RESET (FIXED)
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

-- STEP 2: Drop unnecessary views and tables
-- ========================================

-- Drop VIEWS first
DROP VIEW IF EXISTS conversion_funnel CASCADE;
DROP VIEW IF EXISTS lead_analytics CASCADE;

-- Drop TABLES
DROP TABLE IF EXISTS course_enrollments CASCADE;
DROP TABLE IF EXISTS office_hours CASCADE;
DROP TABLE IF EXISTS site_content CASCADE;
DROP TABLE IF EXISTS user_progress CASCADE;

-- STEP 3: Clean up table structures
-- ========================================

-- Remove unnecessary columns if they exist
ALTER TABLE users 
DROP COLUMN IF EXISTS avatar_url,
DROP COLUMN IF EXISTS bio,
DROP COLUMN IF EXISTS subscription_status,
DROP COLUMN IF EXISTS subscription_id;

ALTER TABLE courses
DROP COLUMN IF EXISTS is_published,
DROP COLUMN IF EXISTS thumbnail_url,
DROP COLUMN IF EXISTS duration_minutes;

ALTER TABLE lessons
DROP COLUMN IF EXISTS duration_minutes,
DROP COLUMN IF EXISTS is_free;

-- STEP 4: Verify we have exactly 8 tables
-- ========================================
DO $$
DECLARE
  table_count INTEGER;
  extra_tables TEXT;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM pg_tables 
  WHERE schemaname = 'public';
  
  RAISE NOTICE 'Total tables in public schema: %', table_count;
  
  -- List any extra tables
  SELECT string_agg(tablename, ', ') INTO extra_tables
  FROM pg_tables 
  WHERE schemaname = 'public'
    AND tablename NOT IN ('users', 'leads', 'threads', 'comments', 'courses', 'lessons', 'stripe_customers', 'stripe_subscriptions');
    
  IF extra_tables IS NOT NULL THEN
    RAISE WARNING 'Extra tables found that should be removed: %', extra_tables;
  END IF;
END $$;

-- Show final table list
SELECT 
  tablename,
  CASE 
    WHEN tablename IN ('users', 'leads', 'threads', 'comments', 'courses', 'lessons', 'stripe_customers', 'stripe_subscriptions') 
    THEN '✓ Core table (EMPTY)'
    ELSE '❌ Extra table - manually drop this!'
  END as status
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY 
  CASE 
    WHEN tablename IN ('users', 'leads', 'threads', 'comments', 'courses', 'lessons', 'stripe_customers', 'stripe_subscriptions') 
    THEN 0
    ELSE 1
  END,
  tablename;

-- STEP 5: Re-enable RLS with simple policies
-- ========================================

-- Users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id OR EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true
  ));

-- Threads table  
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view threads" ON threads;
DROP POLICY IF EXISTS "Members can create threads" ON threads;
CREATE POLICY "Anyone can view threads" ON threads
  FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create threads" ON threads
  FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Comments table
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view comments" ON comments;
DROP POLICY IF EXISTS "Members can create comments" ON comments;
CREATE POLICY "Anyone can view comments" ON comments
  FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create comments" ON comments
  FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Leads table (public insert for landing page, admin read)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can create leads" ON leads;
DROP POLICY IF EXISTS "Admins can view leads" ON leads;
CREATE POLICY "Anyone can create leads" ON leads
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view leads" ON leads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.is_admin = true
    )
  );

-- STEP 6: Ensure trigger exists for new users
-- ========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
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
    RAISE WARNING 'Failed to create public.users entry for %: %', NEW.email, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- STEP 7: Final summary
-- ========================================
SELECT 'DATABASE CLEANED!' as status;
SELECT 'Tables: ' || count(*) || ' (should be 8)' as info FROM pg_tables WHERE schemaname = 'public';
SELECT 'Views: ' || count(*) || ' (should be 0)' as info FROM pg_views WHERE schemaname = 'public';
SELECT 'Auth users: ' || count(*) || ' (should be 0)' as info FROM auth.users;
SELECT 'Public users: ' || count(*) || ' (should be 0)' as info FROM public.users;

-- Next steps
SELECT '
Next: Run the add-test-users.sql script to create:
- Admin user: admin@buildwhatyouneed.com / admin123
- Paid member: paid@example.com / paid123  
- Free lead: free@example.com (no login)
' as next_steps;