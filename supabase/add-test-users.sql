-- ========================================
-- ADD TEST USERS AFTER CLEANUP
-- Run this AFTER the cleanup script
-- ========================================

-- 1. Add Admin User
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
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'a0000000-0000-0000-0000-000000000001'::uuid,
  'authenticated',
  'authenticated',
  'admin@buildwhatyouneed.com',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  '{"full_name": "Admin User"}'::jsonb,
  NOW(),
  NOW()
);

INSERT INTO public.users (id, email, full_name, is_admin)
VALUES ('a0000000-0000-0000-0000-000000000001'::uuid, 'admin@buildwhatyouneed.com', 'Admin User', true);

INSERT INTO public.leads (email, name, stage, user_id)
VALUES ('admin@buildwhatyouneed.com', 'Admin User', 'member', 'a0000000-0000-0000-0000-000000000001'::uuid);

-- 2. Add Paid Member
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
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'b0000000-0000-0000-0000-000000000002'::uuid,
  'authenticated',
  'authenticated',
  'paid@example.com',
  crypt('paid123', gen_salt('bf')),
  NOW(),
  '{"full_name": "Paid Member"}'::jsonb,
  NOW(),
  NOW()
);

INSERT INTO public.users (id, email, full_name, is_admin)
VALUES ('b0000000-0000-0000-0000-000000000002'::uuid, 'paid@example.com', 'Paid Member', false);

INSERT INTO public.leads (email, name, stage, user_id)
VALUES ('paid@example.com', 'Paid Member', 'member', 'b0000000-0000-0000-0000-000000000002'::uuid);

-- Add Stripe subscription for paid member
INSERT INTO public.stripe_customers (user_id, stripe_customer_id)
VALUES ('b0000000-0000-0000-0000-000000000002'::uuid, 'cus_test_paid_member');

INSERT INTO public.stripe_subscriptions (id, user_id, status, current_period_end)
VALUES ('sub_test_paid_member', 'b0000000-0000-0000-0000-000000000002'::uuid, 'active', NOW() + INTERVAL '30 days');

-- 3. Add Free User (Lead only, no auth account)
INSERT INTO public.leads (email, name, stage, source)
VALUES ('free@example.com', 'Free User', 'lead', 'landing_page');

-- 4. Add some test content
INSERT INTO public.courses (id, title, description, order_index)
VALUES 
  ('c0000000-0000-0000-0000-000000000001'::uuid, 'Week 1: SaaS Destruction Basics', 'Learn the fundamentals of building what you need', 1),
  ('c0000000-0000-0000-0000-000000000002'::uuid, 'Week 2: Advanced Builds', 'Take down bigger SaaS companies', 2);

INSERT INTO public.lessons (id, course_id, title, wistia_video_id, source_code_url, order_index)
VALUES 
  ('l0000000-0000-0000-0000-000000000001'::uuid, 'c0000000-0000-0000-0000-000000000001'::uuid, 'Day 1: Destroy Your First SaaS', 'abc123', 'https://github.com/example/day1', 1),
  ('l0000000-0000-0000-0000-000000000002'::uuid, 'c0000000-0000-0000-0000-000000000001'::uuid, 'Day 2: Building a CRM in 4 Hours', 'def456', 'https://github.com/example/day2', 2);

-- 5. Add a test thread
INSERT INTO public.threads (id, title, content, category, author_id)
VALUES (
  't0000000-0000-0000-0000-000000000001'::uuid,
  'Welcome to the Revolution!',
  'This is where we destroy SaaS companies together.',
  'announcements',
  'a0000000-0000-0000-0000-000000000001'::uuid
);

-- 6. Verify everything was created
SELECT 'Test Data Summary:' as report;
SELECT 'Auth users: ' || count(*) as count FROM auth.users;
SELECT 'Public users: ' || count(*) as count FROM public.users;
SELECT 'Leads: ' || count(*) as count FROM public.leads;
SELECT 'Courses: ' || count(*) as count FROM public.courses;
SELECT 'Lessons: ' || count(*) as count FROM public.lessons;
SELECT 'Threads: ' || count(*) as count FROM public.threads;

-- Show user details
SELECT 
  u.email,
  u.full_name,
  u.is_admin,
  l.stage as lead_stage,
  CASE 
    WHEN ss.status = 'active' THEN 'Paid Member'
    WHEN u.id IS NOT NULL THEN 'Free Member'
    ELSE 'Lead Only'
  END as user_type
FROM public.leads l
LEFT JOIN public.users u ON l.user_id = u.id
LEFT JOIN public.stripe_subscriptions ss ON u.id = ss.user_id AND ss.status = 'active'
ORDER BY u.is_admin DESC, user_type;