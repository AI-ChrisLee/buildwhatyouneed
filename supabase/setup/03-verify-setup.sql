-- ========================================
-- VERIFY SETUP - CHECK EVERYTHING WORKS
-- ========================================
-- Run this to verify your database is set up correctly

-- Check if all tables exist
WITH table_check AS (
  SELECT 
    COUNT(*) FILTER (WHERE tablename = 'users') as users_exists,
    COUNT(*) FILTER (WHERE tablename = 'leads') as leads_exists,
    COUNT(*) FILTER (WHERE tablename = 'threads') as threads_exists,
    COUNT(*) FILTER (WHERE tablename = 'comments') as comments_exists,
    COUNT(*) FILTER (WHERE tablename = 'courses') as courses_exists,
    COUNT(*) FILTER (WHERE tablename = 'lessons') as lessons_exists,
    COUNT(*) FILTER (WHERE tablename = 'stripe_customers') as stripe_customers_exists,
    COUNT(*) FILTER (WHERE tablename = 'stripe_subscriptions') as stripe_subscriptions_exists
  FROM pg_tables 
  WHERE schemaname = 'public'
),
-- Check if views exist
view_check AS (
  SELECT 
    COUNT(*) FILTER (WHERE viewname = 'lead_analytics') as lead_analytics_exists,
    COUNT(*) FILTER (WHERE viewname = 'conversion_funnel') as conversion_funnel_exists
  FROM pg_views
  WHERE schemaname = 'public'
),
-- Count records
data_check AS (
  SELECT 
    (SELECT COUNT(*) FROM auth.users) as auth_users,
    (SELECT COUNT(*) FROM public.users) as public_users,
    (SELECT COUNT(*) FROM public.leads) as leads,
    (SELECT COUNT(*) FROM public.threads) as threads,
    (SELECT COUNT(*) FROM public.comments) as comments,
    (SELECT COUNT(*) FROM public.courses) as courses,
    (SELECT COUNT(*) FROM public.lessons) as lessons,
    (SELECT COUNT(*) FROM public.stripe_subscriptions WHERE status = 'active') as active_subs
)
SELECT 
  '🔍 VERIFICATION RESULTS' as section,
  '' as status,
  '' as details
UNION ALL
SELECT 
  'Tables (8 expected)',
  CASE 
    WHEN users_exists + leads_exists + threads_exists + comments_exists + 
         courses_exists + lessons_exists + stripe_customers_exists + stripe_subscriptions_exists = 8 
    THEN '✅' 
    ELSE '❌' 
  END,
  'Found: ' || (users_exists + leads_exists + threads_exists + comments_exists + 
                courses_exists + lessons_exists + stripe_customers_exists + stripe_subscriptions_exists) || '/8'
FROM table_check
UNION ALL
SELECT 
  'Views (2 expected)',
  CASE 
    WHEN lead_analytics_exists + conversion_funnel_exists = 2 
    THEN '✅' 
    ELSE '❌' 
  END,
  'Found: ' || (lead_analytics_exists + conversion_funnel_exists) || '/2'
FROM view_check
UNION ALL
SELECT 
  'Auth Users',
  CASE WHEN auth_users >= 3 THEN '✅' ELSE '❌' END,
  auth_users || ' users (need 3)'
FROM data_check
UNION ALL
SELECT 
  'Public Users',
  CASE WHEN public_users >= 3 THEN '✅' ELSE '❌' END,
  public_users || ' users (should match auth users)'
FROM data_check
UNION ALL
SELECT 
  'Active Subscriptions',
  CASE WHEN active_subs >= 2 THEN '✅' ELSE '❌' END,
  active_subs || ' active (2 expected for paid members)'
FROM data_check
UNION ALL
SELECT 
  'Sample Content',
  CASE WHEN threads >= 3 AND courses >= 2 THEN '✅' ELSE '❌' END,
  threads || ' threads, ' || courses || ' courses'
FROM data_check;

-- Show user details
SELECT 
  '',
  '',
  ''
UNION ALL
SELECT 
  '👥 USER DETAILS' as section,
  '' as status,
  '' as details
UNION ALL
SELECT 
  u.email,
  CASE 
    WHEN u.is_admin THEN '👑 Admin'
    WHEN s.status = 'active' THEN '💎 Paid'
    ELSE '🆓 Free'
  END,
  COALESCE(l.stage, 'No lead record') as lead_stage
FROM public.users u
LEFT JOIN public.stripe_subscriptions s ON u.id = s.user_id AND s.status = 'active'
LEFT JOIN public.leads l ON u.id = l.user_id
ORDER BY u.created_at;