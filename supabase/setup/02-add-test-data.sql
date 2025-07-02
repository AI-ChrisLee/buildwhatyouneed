-- ========================================
-- ADD TEST DATA
-- ========================================
-- Run this AFTER 01-complete-database.sql
-- This adds test users and sample content

-- ========================================
-- 1. SET ADMIN STATUS
-- ========================================
-- Make 3taehn@gmail.com an admin
UPDATE public.users 
SET is_admin = TRUE 
WHERE email = '3taehn@gmail.com';

-- ========================================
-- 2. ADD STRIPE DATA
-- ========================================
-- Add Stripe customer records for paid users
INSERT INTO public.stripe_customers (user_id, stripe_customer_id)
SELECT id, 'cus_test_' || id FROM public.users WHERE email IN ('3taehn@gmail.com', 'me@aichrislee.com')
ON CONFLICT (user_id) DO NOTHING;

-- Add active subscriptions for paid users
INSERT INTO public.stripe_subscriptions (id, user_id, status, current_period_end)
SELECT 
  'sub_test_' || id,
  id,
  'active',
  NOW() + INTERVAL '30 days'
FROM public.users 
WHERE email IN ('3taehn@gmail.com', 'me@aichrislee.com')
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- 3. ADD SAMPLE THREADS
-- ========================================
INSERT INTO public.threads (title, content, category, author_id) VALUES
-- Admin announcement
(
  'Welcome to Build What You Need Community!',
  E'Hey builders! 👋\n\nWelcome to our community where we build what we need, nothing else.\n\nA few quick notes:\n- Weekly office hours are Tuesday and Thursday at 10 AM PST\n- Share your builds in #show-tell\n- Ask for help in #help\n\nLet''s stop bleeding money to overpriced SaaS and start building!\n\n- Chris',
  'announcements',
  (SELECT id FROM public.users WHERE email = '3taehn@gmail.com')
),
-- General discussion
(
  'Just replaced $300/mo worth of tools',
  E'I can''t believe how much money I was wasting. Here''s what I replaced:\n\n- Calendly ($15/mo) → Built with Cal.com\n- ConvertKit ($29/mo) → Built with Resend\n- MemberStack ($49/mo) → Built with Supabase\n- Circle.so ($99/mo) → Built this community platform\n\nTotal saved: $192/month!\n\nWhat have you built recently?',
  'show-tell',
  (SELECT id FROM public.users WHERE email = 'me@aichrislee.com')
),
-- Help thread
(
  'Help with Stripe webhook setup',
  E'I''m following the tutorial but getting stuck on the webhook part. \n\nI''ve set up ngrok and added the webhook endpoint, but events aren''t coming through.\n\nAnyone else run into this?',
  'help',
  (SELECT id FROM public.users WHERE email = 'me@aichrislee.com')
)
ON CONFLICT DO NOTHING;

-- ========================================
-- 4. ADD SAMPLE COMMENTS
-- ========================================
INSERT INTO public.comments (thread_id, content, author_id)
SELECT 
  t.id,
  E'Great question! Make sure you''re using the signing secret from Stripe, not the API key. That got me the first time.',
  (SELECT id FROM public.users WHERE email = '3taehn@gmail.com')
FROM public.threads t
WHERE t.title = 'Help with Stripe webhook setup'
ON CONFLICT DO NOTHING;

-- ========================================
-- 5. ADD SAMPLE COURSES
-- ========================================
INSERT INTO public.courses (title, description, order_index) VALUES
(
  'Replace Circle.so in 3 Hours',
  'Build a full community platform with discussions, courses, and payments',
  1
),
(
  'Replace ConvertKit in 1 Hour', 
  'Build your own email automation with Resend and Supabase',
  2
)
ON CONFLICT DO NOTHING;

-- ========================================
-- 6. ADD SAMPLE LESSONS
-- ========================================
INSERT INTO public.lessons (course_id, title, wistia_video_id, order_index)
SELECT 
  c.id,
  lesson.title,
  lesson.video_id,
  lesson.order_index
FROM public.courses c
CROSS JOIN (
  VALUES 
    ('Setting Up Next.js & Supabase', 'abc123', 1),
    ('Building the Thread System', 'def456', 2),
    ('Adding Stripe Payments', 'ghi789', 3)
) AS lesson(title, video_id, order_index)
WHERE c.title = 'Replace Circle.so in 3 Hours'
ON CONFLICT DO NOTHING;

-- ========================================
-- 7. DISPLAY USER SUMMARY
-- ========================================
SELECT 
  u.email,
  CASE 
    WHEN u.is_admin THEN 'Admin'
    WHEN s.status = 'active' THEN 'Paid Member'
    ELSE 'Free Member'
  END as role,
  CASE 
    WHEN s.status = 'active' THEN 'Full community access'
    ELSE 'Checkout page only'
  END as access
FROM public.users u
LEFT JOIN public.stripe_subscriptions s ON u.id = s.user_id
ORDER BY u.created_at;