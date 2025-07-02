-- ========================================
-- RESET DATABASE (OPTIONAL)
-- ========================================
-- Only run this if you need to start completely fresh
-- WARNING: This will delete ALL data!

-- Drop all views first
DROP VIEW IF EXISTS lead_analytics CASCADE;
DROP VIEW IF EXISTS conversion_funnel CASCADE;

-- Drop all policies
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
            pol.policyname, pol.schemaname, pol.tablename);
    END LOOP;
END $$;

-- Drop all triggers
DO $$ 
DECLARE
    trig RECORD;
BEGIN
    FOR trig IN 
        SELECT trigger_name, event_object_schema, event_object_table 
        FROM information_schema.triggers 
        WHERE trigger_schema = 'public'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I.%I', 
            trig.trigger_name, trig.event_object_schema, trig.event_object_table);
    END LOOP;
END $$;

-- Drop trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop all functions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_thread_activity() CASCADE;
DROP FUNCTION IF EXISTS update_lead_on_signup() CASCADE;
DROP FUNCTION IF EXISTS update_lead_on_payment() CASCADE;
DROP FUNCTION IF EXISTS update_lead_on_cancel() CASCADE;

-- Drop all tables in correct order
DROP TABLE IF EXISTS public.leads CASCADE;
DROP TABLE IF EXISTS public.lessons CASCADE;
DROP TABLE IF EXISTS public.courses CASCADE;
DROP TABLE IF EXISTS public.comments CASCADE;
DROP TABLE IF EXISTS public.threads CASCADE;
DROP TABLE IF EXISTS public.stripe_subscriptions CASCADE;
DROP TABLE IF EXISTS public.stripe_customers CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Success message
SELECT 'Database reset complete! Now run 01-complete-database.sql' as message;