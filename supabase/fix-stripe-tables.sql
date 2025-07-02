-- Check if stripe tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('stripe_customers', 'stripe_subscriptions');

-- Check existing RLS policies
SELECT schemaname, tablename, policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename IN ('stripe_customers', 'stripe_subscriptions');

-- Drop all existing policies on stripe tables (if any)
DROP POLICY IF EXISTS "Users can view own Stripe customer record" ON public.stripe_customers;
DROP POLICY IF EXISTS "Service role can manage all customers" ON public.stripe_customers;
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.stripe_subscriptions;
DROP POLICY IF EXISTS "Service role can manage all subscriptions" ON public.stripe_subscriptions;

-- Enable RLS on stripe tables
ALTER TABLE public.stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for stripe_customers
CREATE POLICY "Users can view own Stripe customer record"
ON public.stripe_customers
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Service role can do everything"
ON public.stripe_customers
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Create policies for stripe_subscriptions
CREATE POLICY "Users can view own subscriptions"
ON public.stripe_subscriptions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Service role can do everything"
ON public.stripe_subscriptions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Test insert with service role (this will only work in SQL editor with service role)
-- INSERT INTO public.stripe_subscriptions (id, user_id, status)
-- VALUES ('test_sub_123', 'YOUR_USER_ID_HERE', 'active')
-- ON CONFLICT (id) DO NOTHING;

-- Verify policies are created
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies
WHERE tablename IN ('stripe_customers', 'stripe_subscriptions')
ORDER BY tablename, policyname;