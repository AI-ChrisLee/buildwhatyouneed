-- ========================================
-- COMPLETE DATABASE SETUP
-- Run this to set up everything properly
-- ========================================

\echo '=== Starting Complete Database Setup ==='

-- 1. First run the fixes
\echo '1. Applying database fixes...'
\i fix-database-issues.sql

-- 2. Add site_content table if missing
\echo '2. Checking site_content table...'
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'site_content') THEN
    RAISE NOTICE 'Creating site_content table...';
    -- Create the table
    CREATE TABLE site_content (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      page VARCHAR(255) UNIQUE NOT NULL,
      content JSONB NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Enable RLS
    ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
    
    -- Add default content
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
  ELSE
    RAISE NOTICE 'site_content table already exists';
  END IF;
END $$;

-- 3. Add test user
\echo '3. Adding test user...'
\i add-test-user.sql

-- 4. Final verification
\echo '4. Verifying setup...'

SELECT '=== Table Status ===' as status;
SELECT 
  tablename,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies WHERE tablename = t.tablename
    ) THEN '✓ Has policies'
    ELSE '✗ No policies'
  END as policy_status
FROM pg_tables t
WHERE schemaname = 'public'
ORDER BY tablename;

SELECT '=== User Counts ===' as status;
SELECT 'Auth Users' as type, COUNT(*) as count FROM auth.users
UNION ALL
SELECT 'Public Users' as type, COUNT(*) as count FROM public.users
UNION ALL
SELECT 'Leads' as type, COUNT(*) as count FROM public.leads;

SELECT '=== Test User ===' as status;
SELECT email, full_name, is_admin FROM users WHERE email = 'test@example.com';

\echo '=== Setup Complete! ==='
\echo 'Test credentials:'
\echo 'Email: test@example.com'
\echo 'Password: password123'
\echo ''
\echo 'Next steps:'
\echo '1. Restart your Next.js dev server'
\echo '2. Visit http://localhost:3000/about'
\echo '3. Click "JOIN $97/month" to test signup flow'
\echo '4. Or use test credentials to log in'