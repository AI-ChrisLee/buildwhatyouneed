# Supabase Database Files

## 🚀 Quick Setup (Use These 3 Files)

1. **`01-complete-setup.sql`** - Creates all tables, indexes, RLS, triggers
2. **`02-add-test-data.sql`** - Adds subscriptions and sample content (run after creating users)
3. **`03-verify-setup.sql`** - Checks if everything is working

## 📚 Full Guide

See `/docs/supabase-setup-streamlined.md` for step-by-step instructions.

## ⚠️ Old Files (Don't Use)

The other SQL files in this directory are from earlier iterations and contain errors or partial solutions. Only use the numbered files above.

## 🔄 Clean Restart

If you need to start fresh:
```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
```
Then run the 3 files in order.