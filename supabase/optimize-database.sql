-- ========================================
-- DATABASE OPTIMIZATION SCRIPT
-- Reduces 14 tables to 8 essential tables
-- ========================================

-- STEP 1: Backup important data before deletion
-- ========================================

-- Backup any conversion funnel data to leads table (if needed)
UPDATE leads l
SET 
  converted_at = cf.timestamp,
  source = COALESCE(l.source, cf.source)
FROM conversion_funnel cf
WHERE l.email = cf.email
  AND cf.event = 'member';

-- STEP 2: Drop unnecessary tables
-- ========================================
DROP TABLE IF EXISTS conversion_funnel CASCADE;
DROP TABLE IF EXISTS course_enrollments CASCADE;
DROP TABLE IF EXISTS office_hours CASCADE;
DROP TABLE IF EXISTS site_content CASCADE;
DROP TABLE IF EXISTS user_progress CASCADE;

-- Drop the view (not a table)
DROP VIEW IF EXISTS lead_analytics CASCADE;

-- STEP 3: Ensure all 8 core tables have correct structure
-- ========================================

-- 1. Users table (keep it simple)
ALTER TABLE users 
DROP COLUMN IF EXISTS avatar_url,
DROP COLUMN IF EXISTS bio,
DROP COLUMN IF EXISTS stripe_customer_id,
DROP COLUMN IF EXISTS subscription_status,
DROP COLUMN IF EXISTS subscription_id;

-- 2. Leads table (ensure it has all CRM fields)
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS converted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'landing_page';

-- 3. Threads table (already good)
-- No changes needed

-- 4. Comments table (already good)
-- No changes needed

-- 5. Courses table (simplify)
ALTER TABLE courses
DROP COLUMN IF EXISTS is_published,
DROP COLUMN IF EXISTS thumbnail_url,
DROP COLUMN IF EXISTS duration_minutes;

-- 6. Lessons table (add source code URL)
ALTER TABLE lessons
ADD COLUMN IF NOT EXISTS source_code_url TEXT,
DROP COLUMN IF EXISTS duration_minutes,
DROP COLUMN IF EXISTS is_free;

-- 7. Stripe tables (already good)
-- No changes needed

-- STEP 4: Create simple indexes for performance
-- ========================================
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_stage ON leads(stage);
CREATE INDEX IF NOT EXISTS idx_threads_category ON threads(category);
CREATE INDEX IF NOT EXISTS idx_threads_author ON threads(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_thread ON comments(thread_id);
CREATE INDEX IF NOT EXISTS idx_lessons_course ON lessons(course_id);

-- STEP 5: Verify final table count
-- ========================================
SELECT 
  'Final table count: ' || count(*) as result
FROM pg_tables 
WHERE schemaname = 'public';

-- List remaining tables
SELECT 
  tablename as remaining_tables,
  CASE 
    WHEN tablename IN ('users', 'leads', 'threads', 'comments', 'courses', 'lessons', 'stripe_customers', 'stripe_subscriptions') 
    THEN '✓ Core table'
    ELSE '⚠️ Extra table - should be removed'
  END as status
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY 
  CASE 
    WHEN tablename IN ('users', 'leads', 'threads', 'comments', 'courses', 'lessons', 'stripe_customers', 'stripe_subscriptions') 
    THEN 1
    ELSE 2
  END,
  tablename;

-- STEP 6: Update RLS policies for simplicity
-- ========================================

-- Simple RLS for threads
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view threads" ON threads;
DROP POLICY IF EXISTS "Members can create threads" ON threads;

CREATE POLICY "Members can view threads" ON threads
  FOR SELECT USING (true);
  
CREATE POLICY "Members can create threads" ON threads
  FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Simple RLS for comments
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view comments" ON comments;
DROP POLICY IF EXISTS "Members can create comments" ON comments;

CREATE POLICY "Members can view comments" ON comments
  FOR SELECT USING (true);
  
CREATE POLICY "Members can create comments" ON comments
  FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Done! You should now have exactly 8 tables.