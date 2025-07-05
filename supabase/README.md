# Database Setup Instructions

This directory contains the SQL migrations needed to set up your Supabase database.

## Quick Setup

1. **Create a Supabase Project**
   - Go to [app.supabase.com](https://app.supabase.com)
   - Create a new project
   - Save your project URL and keys

2. **Run Migrations**
   - Go to your Supabase Dashboard
   - Navigate to SQL Editor
   - Run each migration file in order:
     1. `001_initial_schema.sql` - Creates all tables and indexes
     2. `002_row_level_security.sql` - Sets up security policies

3. **Verify Setup**
   - Check that all tables are created in Table Editor
   - Verify RLS is enabled on all tables
   - Test auth by creating a user in Authentication tab

## Migration Files

### 001_initial_schema.sql
Creates the core database structure:
- `users` - User profiles (extends Supabase auth)
- `leads` - Email capture for marketing
- `courses` - Course content organization
- `lessons` - Individual lessons within courses
- `threads` - Community forum posts
- `comments` - Replies to threads
- `stripe_subscriptions` - Payment tracking
- `office_hours` - Calendar events

### 002_row_level_security.sql
Implements security policies:
- Free users can read public content
- Paid users can create threads and comments
- Users can only edit their own content
- Service role has admin access

## Important Notes

- Always run migrations in order
- Enable RLS on all tables for security
- Test policies with different user roles
- Keep your service role key secret

## Troubleshooting

**Tables not showing up?**
- Make sure you're in the correct schema (public)
- Check for SQL errors in the migration output

**Can't access data?**
- Verify RLS policies are created
- Check that you're authenticated
- Ensure user has correct membership_tier

**Trigger not creating user profile?**
- Verify the trigger exists in Database → Functions
- Check function has SECURITY DEFINER
- Test with a new user signup