-- ========================================
-- IMMEDIATE FIX FOR LEADS TABLE
-- ========================================
-- Run this RIGHT NOW in Supabase SQL Editor

-- First, check current policies
SELECT * FROM pg_policies WHERE tablename = 'leads';

-- Drop the restrictive policy
DROP POLICY IF EXISTS "Admin can view all leads" ON public.leads;

-- Create new policies that allow anonymous inserts
CREATE POLICY "Anyone can insert leads" ON public.leads
  FOR INSERT 
  WITH CHECK (true);

-- Admin can still view/update/delete
CREATE POLICY "Admin can select leads" ON public.leads
  FOR SELECT 
  USING (
    auth.uid() IN (
      SELECT id FROM public.users WHERE is_admin = TRUE
    )
  );

CREATE POLICY "Admin can update leads" ON public.leads
  FOR UPDATE 
  USING (
    auth.uid() IN (
      SELECT id FROM public.users WHERE is_admin = TRUE
    )
  );

CREATE POLICY "Admin can delete leads" ON public.leads
  FOR DELETE 
  USING (
    auth.uid() IN (
      SELECT id FROM public.users WHERE is_admin = TRUE
    )
  );

-- Test the fix by trying an insert
INSERT INTO public.leads (email, name, stage, source)
VALUES ('test@example.com', 'Test User', 'lead', 'test')
ON CONFLICT (email) DO NOTHING;

-- Check if it worked
SELECT 'POLICIES FIXED! Try your opt-in form now.' as message;