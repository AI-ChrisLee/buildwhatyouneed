-- ========================================
-- FIX STRIPE TABLES RLS POLICIES
-- ========================================
-- This adds policies to allow service role to insert/update stripe data

-- First, let's check current policies
SELECT schemaname, tablename, policyname, cmd, roles, qual, with_check 
FROM pg_policies 
WHERE tablename IN ('stripe_customers', 'stripe_subscriptions');

-- Drop existing policies if any (be careful with this in production)
DROP POLICY IF EXISTS "Users can read own stripe data" ON public.stripe_customers;
DROP POLICY IF EXISTS "Users can read own subscription" ON public.stripe_subscriptions;

-- Recreate policies with proper permissions
-- For stripe_customers table
CREATE POLICY "Users can read own stripe data" ON public.stripe_customers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage stripe customers" ON public.stripe_customers
  FOR ALL USING (auth.role() = 'service_role');

-- For stripe_subscriptions table  
CREATE POLICY "Users can read own subscription" ON public.stripe_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage subscriptions" ON public.stripe_subscriptions
  FOR ALL USING (auth.role() = 'service_role');

-- Verify the policies were created
SELECT schemaname, tablename, policyname, cmd, roles, qual, with_check 
FROM pg_policies 
WHERE tablename IN ('stripe_customers', 'stripe_subscriptions')
ORDER BY tablename, policyname;

-- Also ensure the tables have the correct structure
-- Check if all columns exist
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name IN ('stripe_customers', 'stripe_subscriptions')
ORDER BY table_name, ordinal_position;