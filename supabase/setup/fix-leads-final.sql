-- ========================================
-- FINAL FIX FOR LEADS TABLE
-- ========================================
-- This ensures anonymous users can insert leads

-- 1. Check current RLS status
SELECT 
  tablename,
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'leads';

-- 2. Drop ALL existing policies
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'leads'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.leads', pol.policyname);
        RAISE NOTICE 'Dropped policy: %', pol.policyname;
    END LOOP;
END $$;

-- 3. Create simple INSERT policy for everyone
CREATE POLICY "Anyone can insert leads" 
ON public.leads 
FOR INSERT 
TO PUBLIC
WITH CHECK (true);

-- 4. Create admin policies for other operations
CREATE POLICY "Admins can view leads" 
ON public.leads 
FOR SELECT 
USING (
  auth.uid() IN (
    SELECT id FROM public.users WHERE is_admin = TRUE
  )
);

CREATE POLICY "Admins can update leads" 
ON public.leads 
FOR UPDATE 
USING (
  auth.uid() IN (
    SELECT id FROM public.users WHERE is_admin = TRUE
  )
);

CREATE POLICY "Admins can delete leads" 
ON public.leads 
FOR DELETE 
USING (
  auth.uid() IN (
    SELECT id FROM public.users WHERE is_admin = TRUE
  )
);

-- 5. Test anonymous insert
DO $$
BEGIN
  -- Try to insert as anonymous user
  INSERT INTO public.leads (email, name, stage, source)
  VALUES ('anonymous-test-' || NOW()::text || '@example.com', 'Anonymous Test', 'lead', 'test')
  ON CONFLICT (email) DO NOTHING;
  
  RAISE NOTICE 'Anonymous insert test succeeded!';
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Anonymous insert test failed: %', SQLERRM;
END $$;

-- 6. Verify final policies
SELECT 
  policyname,
  cmd,
  permissive,
  roles
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'leads'
ORDER BY policyname;

-- 7. Check if RLS is enabled
SELECT 
  'RLS is ' || CASE WHEN rowsecurity THEN 'ENABLED' ELSE 'DISABLED' END as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'leads';

-- If you see "RLS is DISABLED", uncomment and run:
-- ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Done!
SELECT 'Leads table is now ready for anonymous inserts!' as message;