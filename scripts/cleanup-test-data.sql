-- Cleanup script to remove all test data
-- Run this in Supabase SQL editor

-- Delete in reverse order of dependencies

-- 1. Delete thread-related data
DELETE FROM thread_reactions;
DELETE FROM thread_replies;
DELETE FROM threads;

-- 2. Delete course-related data
DELETE FROM course_access;
DELETE FROM course_progress;
DELETE FROM course_enrollments;
DELETE FROM lessons;
DELETE FROM courses;

-- 3. Delete Stripe-related data
DELETE FROM stripe_subscriptions;
DELETE FROM stripe_customers;

-- 4. Delete lead data
DELETE FROM leads;

-- 5. Delete user data (this will cascade to auth.users)
DELETE FROM users;

-- 6. Delete auth users (if not cascaded)
DELETE FROM auth.users;

-- Reset any sequences if needed (optional)
-- ALTER SEQUENCE courses_id_seq RESTART WITH 1;
-- ALTER SEQUENCE threads_id_seq RESTART WITH 1;

-- Verify cleanup
SELECT 'Users:', COUNT(*) FROM users
UNION ALL
SELECT 'Auth Users:', COUNT(*) FROM auth.users
UNION ALL
SELECT 'Leads:', COUNT(*) FROM leads
UNION ALL
SELECT 'Stripe Customers:', COUNT(*) FROM stripe_customers
UNION ALL
SELECT 'Stripe Subscriptions:', COUNT(*) FROM stripe_subscriptions
UNION ALL
SELECT 'Threads:', COUNT(*) FROM threads
UNION ALL
SELECT 'Courses:', COUNT(*) FROM courses;