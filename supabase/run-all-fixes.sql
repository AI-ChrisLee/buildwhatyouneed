-- ========================================
-- COMPLETE DATABASE FIXES - ALL IN ONE
-- ========================================

-- 1. Fix RLS policies
-- ========================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies safely
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Public users table" ON users;
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Create simple policies
CREATE POLICY "Enable read access for all users" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Fix threads policies
DROP POLICY IF EXISTS "Anyone can view threads" ON threads;
DROP POLICY IF EXISTS "Authenticated users can create threads" ON threads;

CREATE POLICY "Anyone can view threads" ON threads
  FOR SELECT USING (true);
  
CREATE POLICY "Authenticated users can create threads" ON threads
  FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Fix leads policies
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

-- 2. Create site_content table if missing
-- ========================================
CREATE TABLE IF NOT EXISTS site_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page VARCHAR(255) UNIQUE NOT NULL,
  content JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies for site_content
DROP POLICY IF EXISTS "Anyone can view site content" ON site_content;
DROP POLICY IF EXISTS "Admins can update site content" ON site_content;

CREATE POLICY "Anyone can view site content" ON site_content
  FOR SELECT USING (true);

CREATE POLICY "Admins can update site content" ON site_content
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.is_admin = true
    )
  );

-- Insert default content
INSERT INTO site_content (page, content)
VALUES (
  'about',
  jsonb_build_object(
    'title', 'Build What You Need',
    'subtitle', 'Stop paying for SaaS. Start building.',
    'mainDescription', 'The days of overpriced SaaS are over.',
    'memberCount', '2k',
    'onlineCount', '8',
    'adminCount', '10',
    'learnItems', jsonb_build_array(
      'Build tools that replace expensive SaaS subscriptions',
      'Save thousands of dollars per month',
      'Own your tools and data completely'
    ),
    'benefitItems', jsonb_build_array(
      'Access to code templates that replace $1000s in SaaS costs',
      'Step-by-step courses on building your own tools',
      'Community support from experienced builders',
      'Weekly challenges to practice your skills'
    ),
    'footerText', 'Join for just $97/month. Cancel anytime.'
  )
)
ON CONFLICT (page) DO NOTHING;

-- 3. Create member stats function
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

-- 4. Show results
-- ========================================
SELECT 'Setup complete!' as status;

SELECT 
  tablename,
  CASE WHEN rowsecurity THEN '✓ RLS Enabled' ELSE '✗ RLS Disabled' END as rls_status
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN ('users', 'leads', 'threads', 'site_content')
ORDER BY tablename;

SELECT 'Total users in database:' as info, COUNT(*) as count FROM users;