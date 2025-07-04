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

DO $$
DECLARE
  admin_id uuid;
  paid_id uuid;
  free_id uuid;
  course1_id uuid;
  course2_id uuid;
  thread1_id uuid;
  thread2_id uuid;
  thread3_id uuid;
BEGIN
  -- 1. Create Admin User
  admin_id := gen_random_uuid();
  
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
    admin_id,
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
  VALUES (admin_id, 'admin@aichrislee.com', 'Chris Lee', true);
  
  INSERT INTO public.leads (email, name, stage, user_id)
  VALUES ('admin@aichrislee.com', 'Chris Lee', 'member', admin_id);

  -- 2. Create Paid Member
  paid_id := gen_random_uuid();
  
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
    paid_id,
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
  VALUES (paid_id, 'paid@aichrislee.com', 'Test Paid Member', false);
  
  INSERT INTO public.leads (email, name, stage, user_id)
  VALUES ('paid@aichrislee.com', 'Test Paid Member', 'member', paid_id);
  
  -- Add Stripe subscription
  INSERT INTO public.stripe_customers (user_id, stripe_customer_id)
  VALUES (paid_id, 'cus_test_' || substring(paid_id::text, 1, 8));
  
  INSERT INTO public.stripe_subscriptions (id, user_id, status, current_period_end)
  VALUES ('sub_test_' || substring(paid_id::text, 1, 8), paid_id, 'active', NOW() + INTERVAL '30 days');

  -- 3. Create Free Member
  free_id := gen_random_uuid();
  
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
    free_id,
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
  VALUES (free_id, 'free@aichrislee.com', 'Test Free Member', false);
  
  INSERT INTO public.leads (email, name, stage, user_id)
  VALUES ('free@aichrislee.com', 'Test Free Member', 'member', free_id);

  -- 4. Add leads without auth
  INSERT INTO public.leads (email, name, stage, source)
  VALUES 
    ('lead1@example.com', 'Lead User 1', 'lead', 'youtube'),
    ('lead2@example.com', 'Lead User 2', 'hot_lead', 'landing_page'),
    ('lead3@example.com', 'Lead User 3', 'lead', 'referral');

  -- 5. Add courses
  course1_id := gen_random_uuid();
  course2_id := gen_random_uuid();
  
  INSERT INTO public.courses (id, title, description, order_index)
  VALUES 
    (course1_id, 'SaaS Destruction Week 1', 'Destroy your first 5 SaaS subscriptions', 1),
    (course2_id, 'SaaS Destruction Week 2', 'Build enterprise tools in 4 hours', 2);
  
  -- Add lessons
  INSERT INTO public.lessons (course_id, title, wistia_video_id, source_code_url, order_index)
  VALUES 
    (course1_id, 'Day 1: CRM Replacement', 'wistia123', 'https://github.com/aichrislee/crm-build', 1),
    (course1_id, 'Day 2: Email Tool Build', 'wistia456', 'https://github.com/aichrislee/email-build', 2),
    (course2_id, 'Day 8: Analytics Dashboard', 'wistia789', 'https://github.com/aichrislee/analytics-build', 1);

  -- 6. Add threads
  thread1_id := gen_random_uuid();
  thread2_id := gen_random_uuid();
  thread3_id := gen_random_uuid();
  
  INSERT INTO public.threads (id, title, content, category, author_id)
  VALUES 
    (thread1_id, 'Welcome to the Build What You Need Revolution!', 'Stop paying for SaaS. Start building what you need. This is where we destroy the $50B SaaS scam together.', 'announcements', admin_id),
    (thread2_id, 'Just cancelled Zapier - Built my own in 3 hours!', 'Was paying $599/month for Zapier. Built exactly what I needed with Claude in 3 hours. Code in the lessons section!', 'show-tell', paid_id),
    (thread3_id, 'Need help with Stripe integration', 'Following the Day 3 tutorial but getting errors with webhook setup. Anyone else face this?', 'help', free_id);

  -- 7. Add comments
  INSERT INTO public.comments (thread_id, content, author_id)
  VALUES
    (thread3_id, 'Great question! Check your webhook URL in Stripe dashboard. Make sure it ends with /api/stripe/webhook', admin_id),
    (thread2_id, 'This is incredible! How long until you break even on the time invested?', free_id);

  RAISE NOTICE 'Test data created successfully!';
  RAISE NOTICE 'Admin ID: %', admin_id;
  RAISE NOTICE 'Paid Member ID: %', paid_id;
  RAISE NOTICE 'Free Member ID: %', free_id;

END $$;

-- STEP 4: Verify the results
-- ========================================
SELECT '=== DATA CREATION COMPLETE ===' as status;

-- Count summary
SELECT 
  'Auth users: ' || (SELECT count(*) FROM auth.users) || ', ' ||
  'Public users: ' || (SELECT count(*) FROM public.users) || ', ' ||
  'Leads: ' || (SELECT count(*) FROM public.leads) || ', ' ||
  'Paid members: ' || (SELECT count(*) FROM public.stripe_subscriptions WHERE status = 'active') as counts;

SELECT 
  'Courses: ' || (SELECT count(*) FROM public.courses) || ', ' ||
  'Lessons: ' || (SELECT count(*) FROM public.lessons) || ', ' ||
  'Threads: ' || (SELECT count(*) FROM public.threads) || ', ' ||
  'Comments: ' || (SELECT count(*) FROM public.comments) as content_counts;

-- Show user details
SELECT 
  '=== USER ACCOUNTS ===' as section;
  
SELECT 
  COALESCE(u.email, l.email) as email,
  COALESCE(u.full_name, l.name) as name,
  CASE 
    WHEN u.is_admin = true THEN 'ADMIN'
    WHEN ss.status = 'active' THEN 'PAID MEMBER'
    WHEN u.id IS NOT NULL THEN 'FREE MEMBER'
    ELSE 'LEAD ONLY'
  END as access_level,
  l.stage as lead_stage
FROM public.leads l
LEFT JOIN public.users u ON l.user_id = u.id
LEFT JOIN public.stripe_subscriptions ss ON u.id = ss.user_id AND ss.status = 'active'
ORDER BY 
  CASE 
    WHEN u.is_admin = true THEN 1
    WHEN ss.status = 'active' THEN 2
    WHEN u.id IS NOT NULL THEN 3
    ELSE 4
  END,
  email;

-- Show login credentials
SELECT 
  '=== LOGIN CREDENTIALS ===' as section;
  
SELECT 
  'Admin: admin@aichrislee.com / admin123' as account
UNION ALL
SELECT 
  'Paid: paid@aichrislee.com / paid123'
UNION ALL
SELECT 
  'Free: free@aichrislee.com / free123'
ORDER BY account;