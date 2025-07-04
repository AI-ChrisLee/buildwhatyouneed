-- ========================================
-- RESET AND ADD TEST USERS FOR AICHRISLEE.COM
-- This script safely cleans existing data first
-- ========================================

-- STEP 1: Check what data exists
-- ========================================
DO $$
BEGIN
  RAISE NOTICE 'Current data status:';
  RAISE NOTICE 'Auth users: %', (SELECT count(*) FROM auth.users);
  RAISE NOTICE 'Public users: %', (SELECT count(*) FROM public.users);
  RAISE NOTICE 'Leads: %', (SELECT count(*) FROM public.leads);
END $$;

-- STEP 2: Clean all existing data
-- ========================================
-- Disable RLS temporarily
ALTER TABLE threads DISABLE ROW LEVEL SECURITY;
ALTER TABLE comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;

-- Delete in correct order (foreign key dependencies)
DELETE FROM public.comments;
DELETE FROM public.threads;
DELETE FROM public.lessons;
DELETE FROM public.courses;
DELETE FROM public.stripe_subscriptions;
DELETE FROM public.stripe_customers;
DELETE FROM public.leads;
DELETE FROM public.users;
DELETE FROM auth.users;

-- Re-enable RLS
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- STEP 3: Add fresh test data
-- ========================================

-- 1. Admin User
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
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@aichrislee.com',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  '{"full_name": "Chris Lee"}'::jsonb,
  NOW(),
  NOW()
) RETURNING id INTO @admin_id;

-- Get the admin ID for use in other inserts
DO $$
DECLARE
  admin_id uuid;
  paid_id uuid;
  free_id uuid;
BEGIN
  -- Get admin user ID
  SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@aichrislee.com';
  
  -- Create public.users entry for admin
  INSERT INTO public.users (id, email, full_name, is_admin)
  VALUES (admin_id, 'admin@aichrislee.com', 'Chris Lee', true);
  
  INSERT INTO public.leads (email, name, stage, user_id)
  VALUES ('admin@aichrislee.com', 'Chris Lee', 'member', admin_id);

  -- 2. Paid Member
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
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'paid@aichrislee.com',
    crypt('paid123', gen_salt('bf')),
    NOW(),
    '{"full_name": "Test Paid Member"}'::jsonb,
    NOW(),
    NOW()
  ) RETURNING id INTO paid_id;
  
  INSERT INTO public.users (id, email, full_name, is_admin)
  VALUES (paid_id, 'paid@aichrislee.com', 'Test Paid Member', false);
  
  INSERT INTO public.leads (email, name, stage, user_id)
  VALUES ('paid@aichrislee.com', 'Test Paid Member', 'member', paid_id);
  
  -- Add Stripe subscription
  INSERT INTO public.stripe_customers (user_id, stripe_customer_id)
  VALUES (paid_id, 'cus_test_' || substring(paid_id::text, 1, 8));
  
  INSERT INTO public.stripe_subscriptions (id, user_id, status, current_period_end)
  VALUES ('sub_test_' || substring(paid_id::text, 1, 8), paid_id, 'active', NOW() + INTERVAL '30 days');

  -- 3. Free Member
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
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'free@aichrislee.com',
    crypt('free123', gen_salt('bf')),
    NOW(),
    '{"full_name": "Test Free Member"}'::jsonb,
    NOW(),
    NOW()
  ) RETURNING id INTO free_id;
  
  INSERT INTO public.users (id, email, full_name, is_admin)
  VALUES (free_id, 'free@aichrislee.com', 'Test Free Member', false);
  
  INSERT INTO public.leads (email, name, stage, user_id)
  VALUES ('free@aichrislee.com', 'Test Free Member', 'member', free_id);

  -- 4. Add leads without auth
  INSERT INTO public.leads (email, name, stage, source)
  VALUES 
    ('lead1@example.com', 'Lead User 1', 'lead', 'youtube'),
    ('lead2@example.com', 'Lead User 2', 'hot_lead', 'landing_page'),
    ('lead3@example.com', 'Lead User 3', 'lead', 'referral');

  -- 5. Add courses and lessons
  INSERT INTO public.courses (title, description, order_index)
  VALUES 
    ('SaaS Destruction Week 1', 'Destroy your first 5 SaaS subscriptions', 1),
    ('SaaS Destruction Week 2', 'Build enterprise tools in 4 hours', 2);
  
  -- Get course IDs and add lessons
  INSERT INTO public.lessons (course_id, title, wistia_video_id, source_code_url, order_index)
  SELECT 
    c.id,
    l.title,
    l.wistia_video_id,
    l.source_code_url,
    l.order_index
  FROM courses c
  CROSS JOIN (
    VALUES 
      (1, 'Day 1: CRM Replacement', 'wistia123', 'https://github.com/aichrislee/crm-build', 1),
      (1, 'Day 2: Email Tool Build', 'wistia456', 'https://github.com/aichrislee/email-build', 2),
      (2, 'Day 8: Analytics Dashboard', 'wistia789', 'https://github.com/aichrislee/analytics-build', 1)
  ) AS l(course_order, title, wistia_video_id, source_code_url, order_index)
  WHERE c.order_index = l.course_order;

  -- 6. Add threads
  INSERT INTO public.threads (title, content, category, author_id)
  VALUES 
    ('Welcome to the Build What You Need Revolution!', 'Stop paying for SaaS. Start building what you need. This is where we destroy the $50B SaaS scam together.', 'announcements', admin_id),
    ('Just cancelled Zapier - Built my own in 3 hours!', 'Was paying $599/month for Zapier. Built exactly what I needed with Claude in 3 hours. Code in the lessons section!', 'show-tell', paid_id),
    ('Need help with Stripe integration', 'Following the Day 3 tutorial but getting errors with webhook setup. Anyone else face this?', 'help', free_id);

  -- 7. Add comments
  INSERT INTO public.comments (thread_id, content, author_id)
  SELECT 
    t.id,
    'Great question! Check your webhook URL in Stripe dashboard.',
    admin_id
  FROM threads t
  WHERE t.title LIKE '%Stripe integration%'
  LIMIT 1;

END $$;

-- STEP 4: Verify the results
-- ========================================
SELECT '=== DATA CREATION COMPLETE ===' as status;
SELECT 'Auth users: ' || count(*) as count FROM auth.users;
SELECT 'Public users: ' || count(*) as count FROM public.users;
SELECT 'Leads: ' || count(*) as count FROM public.leads;
SELECT 'Paid members: ' || count(*) as count FROM public.stripe_subscriptions WHERE status = 'active';
SELECT 'Courses: ' || count(*) as count FROM public.courses;
SELECT 'Lessons: ' || count(*) as count FROM public.lessons;
SELECT 'Threads: ' || count(*) as count FROM public.threads;
SELECT 'Comments: ' || count(*) as count FROM public.comments;

-- Show user details
SELECT 
  COALESCE(u.email, l.email) as email,
  CASE 
    WHEN u.is_admin = true THEN 'ADMIN'
    WHEN ss.status = 'active' THEN 'PAID MEMBER'
    WHEN u.id IS NOT NULL THEN 'FREE MEMBER'
    ELSE 'LEAD ONLY'
  END as access_level,
  CASE 
    WHEN u.email IN ('admin@aichrislee.com', 'paid@aichrislee.com', 'free@aichrislee.com') 
    THEN 'Password: ' || substring(u.email, 1, position('@' in u.email) - 1) || '123'
    ELSE 'No login'
  END as credentials
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