-- ========================================
-- ADD TEST USERS FOR AICHRISLEE.COM
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
  'admin@aichrislee.com',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  '{"full_name": "Chris Lee"}'::jsonb,
  NOW(),
  NOW()
);

INSERT INTO public.users (id, email, full_name, is_admin)
VALUES ('a0000000-0000-0000-0000-000000000001'::uuid, 'admin@aichrislee.com', 'Chris Lee', true);

INSERT INTO public.leads (email, name, stage, user_id)
VALUES ('admin@aichrislee.com', 'Chris Lee', 'member', 'a0000000-0000-0000-0000-000000000001'::uuid);

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
  'paid@aichrislee.com',
  crypt('paid123', gen_salt('bf')),
  NOW(),
  '{"full_name": "Test Paid Member"}'::jsonb,
  NOW(),
  NOW()
);

INSERT INTO public.users (id, email, full_name, is_admin)
VALUES ('b0000000-0000-0000-0000-000000000002'::uuid, 'paid@aichrislee.com', 'Test Paid Member', false);

INSERT INTO public.leads (email, name, stage, user_id)
VALUES ('paid@aichrislee.com', 'Test Paid Member', 'member', 'b0000000-0000-0000-0000-000000000002'::uuid);

-- Add Stripe subscription for paid member
INSERT INTO public.stripe_customers (user_id, stripe_customer_id)
VALUES ('b0000000-0000-0000-0000-000000000002'::uuid, 'cus_test_paid_member');

INSERT INTO public.stripe_subscriptions (id, user_id, status, current_period_end)
VALUES ('sub_test_paid_member', 'b0000000-0000-0000-0000-000000000002'::uuid, 'active', NOW() + INTERVAL '30 days');

-- 3. Add Free Member (has auth but no subscription)
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
  'c0000000-0000-0000-0000-000000000003'::uuid,
  'authenticated',
  'authenticated',
  'free@aichrislee.com',
  crypt('free123', gen_salt('bf')),
  NOW(),
  '{"full_name": "Test Free Member"}'::jsonb,
  NOW(),
  NOW()
);

INSERT INTO public.users (id, email, full_name, is_admin)
VALUES ('c0000000-0000-0000-0000-000000000003'::uuid, 'free@aichrislee.com', 'Test Free Member', false);

INSERT INTO public.leads (email, name, stage, user_id)
VALUES ('free@aichrislee.com', 'Test Free Member', 'member', 'c0000000-0000-0000-0000-000000000003'::uuid);

-- 4. Add Lead Only (no auth account)
INSERT INTO public.leads (email, name, stage, source)
VALUES 
  ('lead1@example.com', 'Lead User 1', 'lead', 'youtube'),
  ('lead2@example.com', 'Lead User 2', 'hot_lead', 'landing_page'),
  ('lead3@example.com', 'Lead User 3', 'lead', 'referral');

-- 5. Add some test content
INSERT INTO public.courses (id, title, description, order_index)
VALUES 
  ('c1000000-0000-0000-0000-000000000001'::uuid, 'SaaS Destruction Week 1', 'Destroy your first 5 SaaS subscriptions', 1),
  ('c2000000-0000-0000-0000-000000000002'::uuid, 'SaaS Destruction Week 2', 'Build enterprise tools in 4 hours', 2);

INSERT INTO public.lessons (id, course_id, title, wistia_video_id, source_code_url, order_index)
VALUES 
  ('l1000000-0000-0000-0000-000000000001'::uuid, 'c1000000-0000-0000-0000-000000000001'::uuid, 'Day 1: CRM Replacement', 'wistia123', 'https://github.com/aichrislee/crm-build', 1),
  ('l2000000-0000-0000-0000-000000000002'::uuid, 'c1000000-0000-0000-0000-000000000001'::uuid, 'Day 2: Email Tool Build', 'wistia456', 'https://github.com/aichrislee/email-build', 2),
  ('l3000000-0000-0000-0000-000000000003'::uuid, 'c2000000-0000-0000-0000-000000000002'::uuid, 'Day 8: Analytics Dashboard', 'wistia789', 'https://github.com/aichrislee/analytics-build', 1);

-- 6. Add test threads
INSERT INTO public.threads (id, title, content, category, author_id)
VALUES 
  ('t1000000-0000-0000-0000-000000000001'::uuid, 'Welcome to the Build What You Need Revolution!', 'Stop paying for SaaS. Start building what you need. This is where we destroy the $50B SaaS scam together.', 'announcements', 'a0000000-0000-0000-0000-000000000001'::uuid),
  ('t2000000-0000-0000-0000-000000000002'::uuid, 'Just cancelled Zapier - Built my own in 3 hours!', 'Was paying $599/month for Zapier. Built exactly what I needed with Claude in 3 hours. Code in the lessons section!', 'show-tell', 'b0000000-0000-0000-0000-000000000002'::uuid),
  ('t3000000-0000-0000-0000-000000000003'::uuid, 'Need help with Stripe integration', 'Following the Day 3 tutorial but getting errors with webhook setup. Anyone else face this?', 'help', 'c0000000-0000-0000-0000-000000000003'::uuid);

-- 7. Add test comments
INSERT INTO public.comments (id, thread_id, content, author_id)
VALUES
  ('cm100000-0000-0000-0000-000000000001'::uuid, 't3000000-0000-0000-0000-000000000003'::uuid, 'Check your webhook URL in Stripe dashboard. Make sure it ends with /api/stripe/webhook', 'a0000000-0000-0000-0000-000000000001'::uuid),
  ('cm200000-0000-0000-0000-000000000002'::uuid, 't2000000-0000-0000-0000-000000000002'::uuid, 'This is incredible! How long until you break even on the time invested?', 'c0000000-0000-0000-0000-000000000003'::uuid);

-- 8. Verify everything was created
SELECT '=== TEST DATA SUMMARY ===' as report;
SELECT 'Auth users: ' || count(*) as count FROM auth.users;
SELECT 'Public users: ' || count(*) as count FROM public.users;
SELECT 'Leads total: ' || count(*) as count FROM public.leads;
SELECT 'Paid members: ' || count(*) as count FROM public.stripe_subscriptions WHERE status = 'active';
SELECT 'Courses: ' || count(*) as count FROM public.courses;
SELECT 'Lessons: ' || count(*) as count FROM public.lessons;
SELECT 'Threads: ' || count(*) as count FROM public.threads;
SELECT 'Comments: ' || count(*) as count FROM public.comments;

-- Show user details with their access levels
SELECT 
  '=== USER ACCESS LEVELS ===' as section;
  
SELECT 
  COALESCE(u.email, l.email) as email,
  COALESCE(u.full_name, l.name) as name,
  CASE 
    WHEN u.is_admin = true THEN 'ADMIN'
    WHEN ss.status = 'active' THEN 'PAID MEMBER'
    WHEN u.id IS NOT NULL THEN 'FREE MEMBER'
    ELSE 'LEAD ONLY'
  END as access_level,
  l.stage as lead_stage,
  CASE 
    WHEN u.id IS NOT NULL THEN 'Can login'
    ELSE 'No login'
  END as auth_status
FROM public.leads l
LEFT JOIN public.users u ON l.user_id = u.id
LEFT JOIN public.stripe_subscriptions ss ON u.id = ss.user_id AND ss.status = 'active'
ORDER BY 
  CASE 
    WHEN u.is_admin = true THEN 1
    WHEN ss.status = 'active' THEN 2
    WHEN u.id IS NOT NULL THEN 3
    ELSE 4
  END;

-- Show login credentials
SELECT 
  '=== LOGIN CREDENTIALS ===' as section;
  
SELECT 
  'Admin: admin@aichrislee.com / admin123' as credentials
UNION ALL
SELECT 
  'Paid: paid@aichrislee.com / paid123'
UNION ALL
SELECT 
  'Free: free@aichrislee.com / free123';