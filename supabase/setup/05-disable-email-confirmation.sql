-- ========================================
-- DISABLE EMAIL CONFIRMATION
-- ========================================
-- Run this in Supabase SQL Editor

-- Check current auth settings
SELECT 'Current email confirmation settings:' as info;

-- Update all existing users to confirmed
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL;

-- Make sure auto-confirm is enabled for new users
-- This needs to be done in Supabase Dashboard:
-- 1. Go to Authentication → Settings
-- 2. Under "Auth Providers" → Email
-- 3. DISABLE "Confirm email" toggle
-- 4. Save changes

-- Verify all users are confirmed
SELECT 
  email,
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN 'Confirmed'
    ELSE 'Not Confirmed'
  END as status
FROM auth.users
ORDER BY created_at DESC;

-- Done
SELECT 'All users confirmed! Now disable email confirmation in Dashboard settings.' as message;