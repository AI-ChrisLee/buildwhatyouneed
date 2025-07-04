-- ========================================
-- CHECK RLS POLICIES
-- ========================================
-- This script checks RLS policies that might be blocking user creation

-- 1. Check if RLS is enabled on public.users
SELECT 
  schemaname,
  tablename,
  rowsecurity,
  CASE 
    WHEN rowsecurity THEN 'RLS is ENABLED - policies apply'
    ELSE 'RLS is DISABLED - no restrictions'
  END as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'users';

-- 2. List all policies on public.users
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'users'
ORDER BY policyname;

-- 3. Check if service role can bypass RLS
SELECT 
  rolname,
  rolbypassrls
FROM pg_roles 
WHERE rolname IN ('postgres', 'authenticator', 'authenticated', 'anon', 'service_role');

-- 4. Test INSERT permission for different roles
DO $$
DECLARE
  can_insert BOOLEAN;
BEGIN
  -- Test if the trigger function (runs as SECURITY DEFINER) can insert
  RAISE NOTICE 'Testing INSERT permissions...';
  
  -- Check if there's an INSERT policy
  SELECT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'users'
    AND cmd = 'INSERT'
  ) INTO can_insert;
  
  IF NOT can_insert THEN
    RAISE WARNING 'No INSERT policy found on public.users! This might block the trigger.';
  ELSE
    RAISE NOTICE 'INSERT policy exists on public.users';
  END IF;
END $$;

-- 5. Create missing INSERT policy if needed
DO $$
BEGIN
  -- Check if we need to create an INSERT policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'users'
    AND cmd = 'INSERT'
  ) THEN
    RAISE NOTICE 'Creating INSERT policy for public.users...';
    
    -- This policy allows the trigger to insert users
    EXECUTE 'CREATE POLICY "Enable insert for auth trigger" ON public.users
      FOR INSERT
      WITH CHECK (true)';
    
    RAISE NOTICE 'INSERT policy created!';
  END IF;
END $$;

-- 6. Alternative: Make the trigger function bypass RLS
-- The SECURITY DEFINER in handle_new_user() should already do this,
-- but let's verify the function owner
SELECT 
  n.nspname as schema,
  p.proname as function_name,
  r.rolname as owner,
  p.prosecdef as security_definer,
  CASE 
    WHEN p.prosecdef THEN 'Runs with owner privileges (bypasses RLS)'
    ELSE 'Runs with caller privileges (subject to RLS)'
  END as security_context
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
JOIN pg_roles r ON p.proowner = r.oid
WHERE p.proname = 'handle_new_user';

-- 7. Summary and recommendations
SELECT 
  'DIAGNOSIS COMPLETE' as status,
  'Check the output above for any warnings or issues' as message;