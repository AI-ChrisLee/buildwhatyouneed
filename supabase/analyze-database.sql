-- ========================================
-- DATABASE ANALYSIS SCRIPT
-- ========================================
-- This script analyzes your entire database to identify all tables,
-- their sizes, relationships, and usage

-- 1. List ALL tables in your database with row counts
SELECT 
  schemaname as schema,
  tablename as table_name,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
  (SELECT COUNT(*) FROM information_schema.tables t WHERE t.table_schema = schemaname AND t.table_name = tablename) as exists,
  n_live_tup as approximate_row_count
FROM pg_stat_user_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- 2. Show all tables with their columns
SELECT 
  t.table_schema,
  t.table_name,
  string_agg(
    c.column_name || ' (' || c.data_type || 
    CASE 
      WHEN c.is_nullable = 'NO' THEN ' NOT NULL' 
      ELSE '' 
    END || ')', 
    ', ' ORDER BY c.ordinal_position
  ) as columns
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_schema = c.table_schema AND t.table_name = c.table_name
WHERE t.table_schema NOT IN ('pg_catalog', 'information_schema')
GROUP BY t.table_schema, t.table_name
ORDER BY t.table_schema, t.table_name;

-- 3. Identify tables that might be unnecessary (empty or test tables)
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
ORDER BY n_live_tup ASC, tablename;

-- 4. Show all foreign key relationships
SELECT
  tc.table_schema || '.' || tc.table_name as from_table,
  kcu.column_name as from_column,
  ccu.table_schema || '.' || ccu.table_name as to_table,
  ccu.column_name as to_column,
  tc.constraint_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_schema, tc.table_name;

-- 5. List all views
SELECT 
  table_schema,
  table_name as view_name,
  view_definition
FROM information_schema.views
WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
ORDER BY table_schema, table_name;

-- 6. List all functions
SELECT 
  n.nspname as schema,
  p.proname as function_name,
  pg_get_function_arguments(p.oid) as arguments,
  pg_get_functiondef(p.oid) as definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
ORDER BY n.nspname, p.proname;

-- 7. Check for RLS policies
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
ORDER BY schemaname, tablename, policyname;

-- 8. Storage usage by schema
SELECT 
  schema_name,
  pg_size_pretty(sum(table_size)::bigint) as total_size,
  count(*) as table_count
FROM (
  SELECT 
    pg_catalog.pg_namespace.nspname as schema_name,
    pg_relation_size(pg_catalog.pg_class.oid) as table_size
  FROM pg_catalog.pg_class
  JOIN pg_catalog.pg_namespace ON relnamespace = pg_catalog.pg_namespace.oid
  WHERE pg_catalog.pg_class.relkind = 'r'
) t
GROUP BY schema_name
ORDER BY sum(table_size) DESC;

-- 9. SPECIFIC TO YOUR PROJECT: Check expected vs actual tables
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
  END as status
FROM expected_tables e
FULL OUTER JOIN actual_tables a ON e.table_name = a.tablename
ORDER BY 
  CASE 
    WHEN e.table_name IS NOT NULL AND a.tablename IS NULL THEN 1
    WHEN e.table_name IS NULL THEN 2
    ELSE 3
  END,
  table_name;

-- 10. Summary of what needs attention
SELECT 'SUMMARY REPORT' as report;
SELECT '===============' as divider;
SELECT 'Total schemas: ' || count(distinct schema_name) FROM information_schema.schemata WHERE schema_name NOT IN ('pg_catalog', 'information_schema');
SELECT 'Total tables: ' || count(*) FROM information_schema.tables WHERE table_schema = 'public';
SELECT 'Empty tables: ' || count(*) FROM pg_stat_user_tables WHERE n_live_tup = 0 AND schemaname = 'public';
SELECT 'Tables with data: ' || count(*) FROM pg_stat_user_tables WHERE n_live_tup > 0 AND schemaname = 'public';