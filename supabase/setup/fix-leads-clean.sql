-- ========================================
-- CLEAN FIX FOR LEADS TABLE POLICIES
-- ========================================

-- First, see what policies exist
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'leads';

-- Drop ALL existing policies on leads table
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'leads'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.leads', pol.policyname);
    END LOOP;
END $$;

-- Now create the correct policies
-- 1. ANYONE can insert (for opt-in form)
CREATE POLICY "Anyone can insert leads" ON public.leads
  FOR INSERT 
  WITH CHECK (true);

-- 2. Only admins can view/update/delete
CREATE POLICY "Admin full access" ON public.leads
  FOR ALL 
  USING (
    auth.uid() IN (
      SELECT id FROM public.users WHERE is_admin = TRUE
    )
  );

-- Test with an insert
INSERT INTO public.leads (email, name, stage, source)
VALUES ('testfix@example.com', 'Test Fix', 'lead', 'test')
ON CONFLICT (email) DO UPDATE SET name = 'Test Fix Updated';

-- Verify policies
SELECT 'Fixed! Policies are now:' as message;
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'leads';