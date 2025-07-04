-- ========================================
-- FIX DATABASE ISSUES
-- ========================================

-- 1. Fix RLS policies (drop existing ones first)
-- ========================================

-- Fix users table RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies safely
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Public users table" ON users;
DROP POLICY IF EXISTS "Enable read access for all users" ON users;

-- Create a simple policy that allows reading all users (for member counts)
CREATE POLICY "Enable read access for all users" ON users
  FOR SELECT USING (true);

-- Create policy for users to update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- 2. Fix threads table policies
-- ========================================
DROP POLICY IF EXISTS "Anyone can view threads" ON threads;
DROP POLICY IF EXISTS "Authenticated users can create threads" ON threads;
DROP POLICY IF EXISTS "Members can create threads" ON threads;

-- Recreate clean policies
CREATE POLICY "Anyone can view threads" ON threads
  FOR SELECT USING (true);
  
CREATE POLICY "Authenticated users can create threads" ON threads
  FOR INSERT WITH CHECK (auth.uid() = author_id);

-- 3. Fix site_content policies
-- ========================================
DROP POLICY IF EXISTS "Anyone can view site content" ON site_content;
DROP POLICY IF EXISTS "Admins can update site content" ON site_content;

-- Only create if table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'site_content') THEN
    -- Recreate policies
    EXECUTE 'CREATE POLICY "Anyone can view site content" ON site_content FOR SELECT USING (true)';
    EXECUTE 'CREATE POLICY "Admins can update site content" ON site_content FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_admin = true))';
  END IF;
END $$;

-- 4. Ensure stripe tables have proper RLS
-- ========================================
ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own stripe data" ON stripe_customers;
DROP POLICY IF EXISTS "Users can view own subscriptions" ON stripe_subscriptions;

-- Create policies for stripe tables
CREATE POLICY "Users can view own stripe data" ON stripe_customers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own subscriptions" ON stripe_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- 5. Fix leads table to allow public inserts
-- ========================================
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can create leads" ON leads;
DROP POLICY IF EXISTS "Admins can view leads" ON leads;

-- Allow public inserts (for landing page)
CREATE POLICY "Anyone can create leads" ON leads
  FOR INSERT WITH CHECK (true);

-- Only admins can view leads
CREATE POLICY "Admins can view leads" ON leads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.is_admin = true
    )
  );

-- 6. Create the get_member_stats function if it doesn't exist
-- ========================================
CREATE OR REPLACE FUNCTION get_member_stats()
RETURNS TABLE (
  active_member_count BIGINT,
  admin_count BIGINT
) 
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT u.id) FILTER (
      WHERE EXISTS (
        SELECT 1 FROM stripe_subscriptions s 
        WHERE s.user_id = u.id 
        AND s.status = 'active'
      )
    ) as active_member_count,
    COUNT(*) FILTER (WHERE u.is_admin = true) as admin_count
  FROM users u;
END;
$$ LANGUAGE plpgsql;

-- 7. Verify everything is set up
-- ========================================
SELECT 'RLS Status Check:' as check_type;
SELECT 
  tablename,
  CASE WHEN rowsecurity THEN '✓ RLS Enabled' ELSE '✗ RLS Disabled' END as rls_status
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN ('users', 'leads', 'threads', 'comments', 'stripe_customers', 'stripe_subscriptions')
ORDER BY tablename;

-- Count policies per table
SELECT 'Policy Count:' as check_type;
SELECT 
  schemaname, 
  tablename, 
  COUNT(*) as policy_count 
FROM pg_policies 
WHERE schemaname = 'public' 
GROUP BY schemaname, tablename 
ORDER BY tablename;

-- Show current user count
SELECT 'User Count:' as check_type, COUNT(*) as total_users FROM users;
SELECT 'Auth User Count:' as check_type, COUNT(*) as total_auth_users FROM auth.users;

SELECT '✅ Database fixes applied!' as status;