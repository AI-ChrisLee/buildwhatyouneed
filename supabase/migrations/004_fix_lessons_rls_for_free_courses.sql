-- Fix RLS policy for lessons to allow authenticated users to view lessons in free courses
-- Previously, free members couldn't see any lessons even in free courses

-- Drop the existing policy that was too restrictive
DROP POLICY IF EXISTS "Members can read lessons" ON lessons;

-- Create a new policy that allows access to lessons in free courses
CREATE POLICY "Members can read lessons" ON lessons
FOR SELECT USING (
  -- Admins can see all lessons
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() AND users.is_admin = true
  )
  OR 
  -- Non-admins can see published lessons if:
  (
    is_draft = false AND (
      -- The course is free
      EXISTS (
        SELECT 1 FROM courses 
        WHERE courses.id = lessons.course_id 
        AND courses.is_free = true
      )
      OR
      -- OR they have paid access (membership or subscription)
      EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND (
          users.membership_tier = 'paid' 
          OR EXISTS (
            SELECT 1 FROM stripe_subscriptions 
            WHERE stripe_subscriptions.user_id = auth.uid() 
            AND stripe_subscriptions.status = 'active'
          )
        )
      )
    )
  )
);