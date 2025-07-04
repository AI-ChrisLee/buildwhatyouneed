-- ========================================
-- COMPLETE RESET WITH PROPER CLEANUP
-- ========================================

-- STEP 1: Disable triggers and constraints
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- STEP 2: Clean ALL data in correct order
-- ========================================
-- Disable RLS
ALTER TABLE IF EXISTS threads DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS leads DISABLE ROW LEVEL SECURITY;

-- Delete in correct dependency order
DELETE FROM comments;
DELETE FROM threads;
DELETE FROM lessons;
DELETE FROM courses;
DELETE FROM stripe_subscriptions;
DELETE FROM stripe_customers;
DELETE FROM leads;
DELETE FROM users;
DELETE FROM auth.users;

-- Re-enable RLS
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- STEP 3: Create test users
-- ========================================

-- 1. Admin User
WITH new_admin AS (
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
  ) RETURNING id, email, raw_user_meta_data->>'full_name' as full_name
)
INSERT INTO public.users (id, email, full_name, is_admin)
SELECT id, email, full_name, true FROM new_admin;

-- Add admin to leads (with ON CONFLICT to handle duplicates)
INSERT INTO public.leads (email, name, stage, user_id)
SELECT email, raw_user_meta_data->>'full_name', 'member', id 
FROM auth.users WHERE email = 'admin@aichrislee.com'
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  stage = EXCLUDED.stage,
  user_id = EXCLUDED.user_id;

-- 2. Paid Member
WITH new_paid AS (
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
  ) RETURNING id, email, raw_user_meta_data->>'full_name' as full_name
)
INSERT INTO public.users (id, email, full_name, is_admin)
SELECT id, email, full_name, false FROM new_paid;

-- Add paid member to leads
INSERT INTO public.leads (email, name, stage, user_id)
SELECT u.email, u.full_name, 'member', u.id 
FROM public.users u WHERE u.email = 'paid@aichrislee.com'
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  stage = EXCLUDED.stage,
  user_id = EXCLUDED.user_id;

-- Add Stripe subscription
INSERT INTO public.stripe_customers (user_id, stripe_customer_id)
SELECT id, 'cus_test_paid' FROM users WHERE email = 'paid@aichrislee.com';

INSERT INTO public.stripe_subscriptions (id, user_id, status, current_period_end)
SELECT 'sub_test_paid', id, 'active', NOW() + INTERVAL '30 days' 
FROM users WHERE email = 'paid@aichrislee.com';

-- 3. Free Member
WITH new_free AS (
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
  ) RETURNING id, email, raw_user_meta_data->>'full_name' as full_name
)
INSERT INTO public.users (id, email, full_name, is_admin)
SELECT id, email, full_name, false FROM new_free;

-- Add free member to leads
INSERT INTO public.leads (email, name, stage, user_id)
SELECT u.email, u.full_name, 'member', u.id 
FROM public.users u WHERE u.email = 'free@aichrislee.com'
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  stage = EXCLUDED.stage,
  user_id = EXCLUDED.user_id;

-- 4. Add lead-only users (no auth)
INSERT INTO public.leads (email, name, stage, source)
VALUES 
  ('lead1@example.com', 'Lead User 1', 'lead', 'youtube'),
  ('lead2@example.com', 'Lead User 2', 'hot_lead', 'landing_page'),
  ('lead3@example.com', 'Lead User 3', 'lead', 'referral')
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  stage = EXCLUDED.stage,
  source = EXCLUDED.source;

-- 5. Add sample content
INSERT INTO public.courses (title, description, order_index)
VALUES 
  ('SaaS Destruction Week 1', 'Destroy your first 5 SaaS subscriptions', 1),
  ('SaaS Destruction Week 2', 'Build enterprise tools in 4 hours', 2)
ON CONFLICT DO NOTHING;

INSERT INTO public.lessons (course_id, title, wistia_video_id, order_index)
SELECT 
  c.id, l.title, l.video_id, l.ord
FROM courses c
CROSS JOIN (VALUES
  (1, 'Day 1: CRM Replacement', 'wistia123', 1),
  (1, 'Day 2: Email Tool Build', 'wistia456', 2),
  (2, 'Day 8: Analytics Dashboard', 'wistia789', 1)
) AS l(course_ord, title, video_id, ord)
WHERE c.order_index = l.course_ord
ON CONFLICT DO NOTHING;

-- 6. Add sample threads
INSERT INTO public.threads (title, content, category, author_id)
SELECT 
  'Welcome to Build What You Need!',
  'Stop paying for SaaS. Start building.',
  'announcements',
  id
FROM users WHERE email = 'admin@aichrislee.com'
ON CONFLICT DO NOTHING;

INSERT INTO public.threads (title, content, category, author_id)
SELECT 
  'Cancelled Zapier - Built my own!',
  'Was paying $599/month. Built it in 3 hours.',
  'show-tell',
  id
FROM users WHERE email = 'paid@aichrislee.com'
ON CONFLICT DO NOTHING;

-- STEP 4: Re-enable the trigger for future signups
-- ========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- STEP 5: Verify results
-- ========================================
SELECT '=== RESET COMPLETE ===' as status;

SELECT 
  'Users: ' || count(*) as user_count
FROM users;

SELECT 
  'Leads: ' || count(*) as lead_count
FROM leads;

SELECT 
  'Courses: ' || count(*) as course_count
FROM courses;

SELECT 
  'Threads: ' || count(*) as thread_count
FROM threads;

-- Show accounts
SELECT 
  u.email,
  CASE 
    WHEN u.is_admin THEN 'ADMIN'
    WHEN s.status = 'active' THEN 'PAID'
    ELSE 'FREE'
  END as type,
  CASE 
    WHEN u.email LIKE '%@aichrislee.com' THEN 
      'Password: ' || split_part(u.email, '@', 1) || '123'
    ELSE '-'
  END as password
FROM users u
LEFT JOIN stripe_subscriptions s ON u.id = s.user_id
ORDER BY u.is_admin DESC, s.status DESC NULLS LAST;