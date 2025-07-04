-- ========================================
-- DATABASE ANALYSIS SCRIPT (SIMPLE VERSION)
-- ========================================

-- 1. List ALL tables in public schema
SELECT 
  tablename as table_name,
  hasindexes as has_indexes,
  hasrules as has_rules,
  hastriggers as has_triggers,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. Show row counts for each table
SELECT 
  relname as table_name,
  n_live_tup as row_count,
  n_dead_tup as dead_rows,
  last_vacuum,
  last_analyze
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC;

-- 3. Show all columns for each table
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- 4. Check for empty or suspicious tables
SELECT 
  relname as table_name,
  n_live_tup as row_count,
  CASE 
    WHEN n_live_tup = 0 THEN 'EMPTY - Consider removing'
    WHEN relname LIKE '%test%' THEN 'TEST TABLE - Consider removing'
    WHEN relname LIKE '%backup%' THEN 'BACKUP TABLE - Consider removing'
    WHEN relname LIKE '%old%' THEN 'OLD TABLE - Consider removing'
    WHEN relname LIKE '%temp%' THEN 'TEMP TABLE - Consider removing'
    ELSE 'Active table'
  END as status
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_live_tup ASC, relname;

-- 5. Check which expected tables exist
SELECT 
  table_name,
  EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = table_name
  ) as exists_in_db
FROM (
  VALUES 
    ('users'),
    ('threads'), 
    ('comments'),
    ('courses'),
    ('lessons'),
    ('stripe_customers'),
    ('stripe_subscriptions'),
    ('leads')
) AS expected(table_name)
ORDER BY exists_in_db DESC, table_name;

-- 6. Find extra tables not in expected list
SELECT 
  tablename as extra_table_name
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename NOT IN (
    'users', 'threads', 'comments', 'courses', 
    'lessons', 'stripe_customers', 'stripe_subscriptions', 'leads'
  )
ORDER BY tablename;

-- 7. Show foreign key relationships
SELECT
  conname as constraint_name,
  conrelid::regclass::text as from_table,
  confrelid::regclass::text as to_table
FROM pg_constraint
WHERE contype = 'f'
  AND connamespace = 'public'::regnamespace
ORDER BY conrelid::regclass::text;

-- 8. Summary
SELECT 'SUMMARY' as report_section;
SELECT count(*) as total_tables FROM pg_tables WHERE schemaname = 'public';
SELECT count(*) as empty_tables FROM pg_stat_user_tables WHERE schemaname = 'public' AND n_live_tup = 0;
SELECT count(*) as tables_with_data FROM pg_stat_user_tables WHERE schemaname = 'public' AND n_live_tup > 0;