-- ========================================
-- COMPLETE DATABASE SETUP SCRIPT
-- Run this after clean-database-fixed.sql
-- ========================================

-- 1. Add site_content table for editable about page
\i add-site-content-table.sql

-- 2. Add member stats function
\i add-member-stats-function.sql

-- 3. Add test users (if needed)
-- \i add-test-users-aichrislee.sql

-- 4. Verify setup
SELECT '=== Database Setup Complete ===' as status;

SELECT 'Tables:' as category, COUNT(*) as count 
FROM pg_tables 
WHERE schemaname = 'public';

SELECT 'Core Tables Present:' as check,
  EXISTS(SELECT 1 FROM pg_tables WHERE tablename = 'users' AND schemaname = 'public') as users,
  EXISTS(SELECT 1 FROM pg_tables WHERE tablename = 'leads' AND schemaname = 'public') as leads,
  EXISTS(SELECT 1 FROM pg_tables WHERE tablename = 'threads' AND schemaname = 'public') as threads,
  EXISTS(SELECT 1 FROM pg_tables WHERE tablename = 'comments' AND schemaname = 'public') as comments,
  EXISTS(SELECT 1 FROM pg_tables WHERE tablename = 'courses' AND schemaname = 'public') as courses,
  EXISTS(SELECT 1 FROM pg_tables WHERE tablename = 'lessons' AND schemaname = 'public') as lessons,
  EXISTS(SELECT 1 FROM pg_tables WHERE tablename = 'stripe_customers' AND schemaname = 'public') as stripe_customers,
  EXISTS(SELECT 1 FROM pg_tables WHERE tablename = 'stripe_subscriptions' AND schemaname = 'public') as stripe_subscriptions,
  EXISTS(SELECT 1 FROM pg_tables WHERE tablename = 'site_content' AND schemaname = 'public') as site_content;

SELECT 'Functions:' as category,
  EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'get_member_stats') as get_member_stats,
  EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user') as handle_new_user;

SELECT 'About Page Content:' as category,
  CASE WHEN COUNT(*) > 0 THEN 'Created' ELSE 'Missing' END as status
FROM site_content 
WHERE page = 'about';

SELECT '=== Ready for Testing! ===' as status;