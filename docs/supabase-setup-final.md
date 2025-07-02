# Supabase Setup - Final Version

## Overview
This guide sets up your complete database with:
- **8 Tables**: users, leads, threads, comments, courses, lessons, stripe_customers, stripe_subscriptions
- **2 Views**: lead_analytics, conversion_funnel
- **CRM System**: Automatic lead tracking through customer journey
- **Full RLS**: Row Level Security for all tables

## Prerequisites
- Supabase account with project created
- Environment variables in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Setup Steps

### 1️⃣ Run Database Setup
1. Go to **SQL Editor** in Supabase Dashboard
2. Click **New query**
3. Copy & paste entire contents of: `/supabase/setup/01-complete-database.sql`
4. Click **RUN**
5. You should see: "Database setup complete! You now have 8 tables + 2 views ready."

### 2️⃣ Create Test Users
Go to **Authentication → Users** and create these 3 users:

| Email | Password | Role | Access |
|-------|----------|------|--------|
| 3taehn@gmail.com | buildwhatyouneed123! | Admin + Paid | Everything |
| me@aichrislee.com | buildwhatyouneed123! | Paid Member | Community access |
| 2taehn@gmail.com | buildwhatyouneed123! | Free Member | Payment page only |

**For each user:**
1. Click **Add user** → **Create new user**
2. Enter email and password
3. Check **Auto Confirm User** ✅
4. Click **Create user**

### 3️⃣ Add Test Data
1. Go back to **SQL Editor**
2. Click **New query**
3. Copy & paste: `/supabase/setup/02-add-test-data.sql`
4. Click **RUN**
5. You'll see a summary of all users and their roles

### 4️⃣ Verify Everything
1. Still in **SQL Editor**, click **New query**
2. Copy & paste: `/supabase/setup/03-verify-setup.sql`
3. Click **RUN**

**Expected Results:**
```
✅ Tables: 8/8
✅ Views: 2/2
✅ Auth Users: 3
✅ Public Users: 3
✅ Active Subscriptions: 2
✅ Sample Content: 3 threads, 2 courses
```

## File Structure
```
/supabase/setup/
├── 00-reset-if-needed.sql    # (Optional) Complete reset
├── 01-complete-database.sql  # Main setup - creates everything
├── 02-add-test-data.sql      # Adds test users and content
└── 03-verify-setup.sql       # Verifies installation
```

## CRM Lead Tracking

The system automatically tracks leads through these stages:

| Stage | When | Description |
|-------|------|-------------|
| lead | Email captured on landing page | Prospect |
| hot_lead | User signs up | Created account |
| member | User pays | Active subscriber |
| cancelled | Subscription cancelled | Former member |
| optout | User unsubscribes | Opted out |

### How It Works
1. **Landing Page** → Saves email as "lead"
2. **Signup** → Trigger updates to "hot_lead"
3. **Payment** → Trigger updates to "member"
4. **Cancel** → Trigger updates to "cancelled"

### View Analytics
Visit `/admin/leads` (admin only) to see:
- Conversion funnel metrics
- Lead to signup rate
- Signup to paid rate
- Recent leads table

## Troubleshooting

### Policy Already Exists Error
Run `/supabase/setup/00-reset-if-needed.sql` first, then start over.

### Missing Users
Make sure to create users in Authentication tab with "Auto Confirm" checked.

### No Test Data
Re-run `02-add-test-data.sql` - it's safe to run multiple times.

### Complete Reset
To start completely fresh:
1. Run `00-reset-if-needed.sql`
2. Then follow setup steps from beginning

## Database Schema

### Tables (8)
- `users` - User profiles linked to auth
- `leads` - CRM tracking for customer journey
- `threads` - Community discussions
- `comments` - Thread replies
- `courses` - Video course containers
- `lessons` - Individual course videos
- `stripe_customers` - Stripe customer IDs
- `stripe_subscriptions` - Active subscriptions

### Views (2)
- `lead_analytics` - Lead counts by stage
- `conversion_funnel` - Conversion metrics

### Key Features
- Automatic lead stage updates via triggers
- RLS policies enforce access control
- Admin can post announcements
- Free members can only access payment page
- Paid members get full community access

## Next Steps
1. Set up Stripe products and webhooks
2. Test the payment flow
3. Start capturing real leads!

Total setup time: ~5 minutes ⚡