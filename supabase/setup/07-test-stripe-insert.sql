-- ========================================
-- TEST STRIPE SUBSCRIPTION INSERT
-- ========================================
-- Use this to manually test if subscription inserts work

-- First, check if we have any users
SELECT id, email, created_at 
FROM public.users 
ORDER BY created_at DESC 
LIMIT 5;

-- Check current subscriptions
SELECT s.*, u.email 
FROM public.stripe_subscriptions s
JOIN public.users u ON s.user_id = u.id
ORDER BY s.created_at DESC;

-- Try to insert a test subscription
-- Replace the user_id with an actual user ID from above
DO $$
DECLARE
  test_user_id UUID;
BEGIN
  -- Get the first user
  SELECT id INTO test_user_id FROM public.users ORDER BY created_at DESC LIMIT 1;
  
  IF test_user_id IS NOT NULL THEN
    -- Try to insert
    INSERT INTO public.stripe_subscriptions (
      id,
      user_id,
      status,
      current_period_end,
      created_at
    ) VALUES (
      'sub_test_' || extract(epoch from now())::text,
      test_user_id,
      'active',
      NOW() + INTERVAL '30 days',
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      status = 'active',
      current_period_end = NOW() + INTERVAL '30 days';
    
    RAISE NOTICE 'Test subscription created successfully for user %', test_user_id;
  ELSE
    RAISE NOTICE 'No users found to test with';
  END IF;
END $$;

-- Check if it was created
SELECT s.*, u.email 
FROM public.stripe_subscriptions s
JOIN public.users u ON s.user_id = u.id
WHERE s.id LIKE 'sub_test_%'
ORDER BY s.created_at DESC;