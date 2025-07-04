#!/bin/bash

# Database setup script
echo "=== Starting Complete Database Setup ==="

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "ERROR: DATABASE_URL environment variable is not set"
    echo "Please set it to your Supabase connection string"
    exit 1
fi

# Change to the supabase directory
cd "$(dirname "$0")"

# 1. Apply database fixes
echo "1. Applying database fixes..."
psql $DATABASE_URL -f fix-database-issues.sql

# 2. Add site_content table
echo "2. Adding site_content table..."
psql $DATABASE_URL -f add-site-content-table.sql 2>/dev/null || echo "   (Table may already exist)"

# 3. Add member stats function
echo "3. Adding member stats function..."
psql $DATABASE_URL -f add-member-stats-function.sql 2>/dev/null || echo "   (Function may already exist)"

# 4. Add test user
echo "4. Adding test user..."
psql $DATABASE_URL -f add-test-user.sql

# 5. Verify setup
echo "5. Verifying setup..."
psql $DATABASE_URL << EOF
SELECT '=== Table Count ===' as status;
SELECT COUNT(*) as table_count FROM pg_tables WHERE schemaname = 'public';

SELECT '=== Tables with RLS ===' as status;
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'leads', 'threads', 'stripe_subscriptions')
ORDER BY tablename;

SELECT '=== User Counts ===' as status;
SELECT 'Public Users' as type, COUNT(*) as count FROM public.users;

SELECT '=== Test User ===' as status;
SELECT email, full_name FROM users WHERE email = 'test@example.com';
EOF

echo ""
echo "=== Setup Complete! ==="
echo "Test credentials:"
echo "Email: test@example.com"
echo "Password: password123"
echo ""
echo "Next steps:"
echo "1. Restart your Next.js dev server"
echo "2. Visit http://localhost:3000/about"
echo "3. Click 'JOIN \$97/month' to test signup flow"
echo "4. Or use test credentials to log in"