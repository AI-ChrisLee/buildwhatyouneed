-- Script to delete a specific test user from auth and user tables
-- This will NOT delete any site content (courses, lessons, etc.)

-- Set the email of the user to delete
DO $$
DECLARE
    user_email TEXT := 'chrisleesystem@gmail.com';
    user_id UUID;
BEGIN
    -- First, get the user ID from auth.users
    SELECT id INTO user_id FROM auth.users WHERE email = user_email;
    
    IF user_id IS NOT NULL THEN
        RAISE NOTICE 'Found user with ID: %', user_id;
        
        -- Delete from related tables (in order of dependencies)
        
        -- Delete from stripe_subscriptions
        DELETE FROM public.stripe_subscriptions WHERE user_id = user_id;
        RAISE NOTICE 'Deleted from stripe_subscriptions';
        
        -- Delete from stripe_customers
        DELETE FROM public.stripe_customers WHERE user_id = user_id;
        RAISE NOTICE 'Deleted from stripe_customers';
        
        -- Delete from course_access
        DELETE FROM public.course_access WHERE user_id = user_id;
        RAISE NOTICE 'Deleted from course_access';
        
        -- Delete from leads
        DELETE FROM public.leads WHERE email = user_email OR user_id = user_id;
        RAISE NOTICE 'Deleted from leads';
        
        -- Delete from users table
        DELETE FROM public.users WHERE id = user_id;
        RAISE NOTICE 'Deleted from users table';
        
        -- Finally, delete from auth.users (this will cascade to auth.identities)
        DELETE FROM auth.users WHERE id = user_id;
        RAISE NOTICE 'Deleted from auth.users';
        
        RAISE NOTICE 'Successfully deleted user: %', user_email;
    ELSE
        RAISE NOTICE 'User not found: %', user_email;
    END IF;
END $$;