-- ========================================
-- DATABASE ANALYSIS SCRIPT (FIXED)
-- ========================================
-- This script analyzes your entire database to identify all tables,
-- their sizes, relationships, and usage

-- 1. List ALL tables in your database
SELECT 
  n.nspname as schema_name,
  c.relname as table_name,
  pg_size_pretty(pg_total_relation_size(c.oid)) as total_size,
  c.reltuples::bigint as estimated_rows
FROM pg_class c
LEFT JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relkind = 'r'
  AND n.nspname NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
ORDER BY pg_total_relation_size(c.oid) DESC;

-- 2. Show all tables with their columns (simplified)
SELECT 
  table_schema,
  table_name,
  count(*) as column_count
FROM information_schema.columns
WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
GROUP BY table_schema, table_name
ORDER BY table_schema, table_name;

-- 3. List all columns for each table
SELECT 
  table_schema,
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
ORDER BY table_schema, table_name, ordinal_position;

-- 4. Show tables that might be unnecessary
SELECT 
  schemaname,
  tablename,
  n_live_tup as row_count,
  CASE 
    WHEN n_live_tup = 0 THEN 'EMPTY - Consider removing'
    WHEN tablename LIKE '%test%' THEN 'TEST TABLE - Consider removing'
    WHEN tablename LIKE '%backup%' THEN 'BACKUP TABLE - Consider removing'
    WHEN tablename LIKE '%old%' THEN 'OLD TABLE - Consider removing'
    WHEN tablename LIKE '%temp%' THEN 'TEMP TABLE - Consider removing'
    ELSE 'Active table'
  END as status
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_live_tup ASC, tablename;

-- 5. Show all foreign key relationships
SELECT
  conname as constraint_name,
  conrelid::regclass as from_table,
  a.attname as from_column,
  confrelid::regclass as to_table,
  af.attname as to_column
FROM pg_constraint c
JOIN pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid
JOIN pg_attribute af ON af.attnum = ANY(c.confkey) AND af.attrelid = c.confrelid
WHERE c.contype = 'f'
ORDER BY conrelid::regclass::text, conname;

-- 6. List all views
SELECT 
  schemaname,
  viewname,
  definition
FROM pg_views
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY schemaname, viewname;

-- 7. Check RLS status for all tables
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 8. List all RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 9. Check storage by schema
SELECT 
  nspname as schema_name,
  count(*) as table_count,
  pg_size_pretty(sum(pg_total_relation_size(c.oid))::bigint) as total_size
FROM pg_class c
LEFT JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relkind = 'r'
  AND n.nspname NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
GROUP BY nspname
ORDER BY sum(pg_total_relation_size(c.oid)) DESC;

-- 10. Check for your expected tables
WITH expected_tables AS (
  SELECT unnest(ARRAY[
    'users',
    'threads', 
    'comments',
    'courses',
    'lessons',
    'stripe_customers',
    'stripe_subscriptions',
    'leads'
  ]) as table_name
),
actual_tables AS (
  SELECT tablename 
  FROM pg_tables 
  WHERE schemaname = 'public'
)
SELECT 
  COALESCE(e.table_name, a.tablename) as table_name,
  CASE 
    WHEN e.table_name IS NOT NULL AND a.tablename IS NOT NULL THEN 'EXISTS ✓'
    WHEN e.table_name IS NOT NULL AND a.tablename IS NULL THEN 'MISSING ❌'
    ELSE 'EXTRA TABLE (not in PRD) ⚠️'
  END as status,
  (SELECT n_live_tup FROM pg_stat_user_tables WHERE tablename = COALESCE(e.table_name, a.tablename) AND schemaname = 'public') as row_count
FROM expected_tables e
FULL OUTER JOIN actual_tables a ON e.table_name = a.tablename
ORDER BY 
  CASE 
    WHEN e.table_name IS NOT NULL AND a.tablename IS NULL THEN 1
    WHEN e.table_name IS NULL THEN 2
    ELSE 3
  END,
  table_name;

-- 11. Summary counts
SELECT 'ANALYSIS SUMMARY' as section;
SELECT '=================' as divider;

SELECT 
  'Total tables in public schema: ' || count(*) as info
FROM pg_tables 
WHERE schemaname = 'public';

SELECT 
  'Tables with data: ' || count(*) as info
FROM pg_stat_user_tables 
WHERE schemaname = 'public' AND n_live_tup > 0;

SELECT 
  'Empty tables: ' || count(*) as info
FROM pg_stat_user_tables 
WHERE schemaname = 'public' AND n_live_tup = 0;

SELECT 
  'Tables with RLS enabled: ' || count(*) as info
FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = true;