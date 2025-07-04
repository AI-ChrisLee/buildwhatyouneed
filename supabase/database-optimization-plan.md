# Database Optimization Plan - Build What You Need

## Current State: 14 Tables (TOO MANY!)
You currently have:
1. comments ✓
2. conversion_funnel 🗑️
3. course_enrollments 🗑️
4. courses ✓
5. lead_analytics 🗑️
6. leads ✓
7. lessons ✓
8. office_hours 🗑️
9. site_content 🗑️
10. stripe_customers ✓
11. stripe_subscriptions ✓
12. threads ✓
13. user_progress 🗑️
14. users ✓

## Optimized Structure: 8 Tables ONLY

### Keep These 8 Tables:
1. **users** - Core user data
2. **leads** - CRM and funnel tracking (includes conversion data)
3. **threads** - Community discussions
4. **comments** - Thread replies
5. **courses** - Build collections
6. **lessons** - Individual builds
7. **stripe_customers** - Payment identity
8. **stripe_subscriptions** - Active memberships

### Delete These 6 Tables:
1. **conversion_funnel** → Move to leads table
2. **course_enrollments** → Not needed (all members access all content)
3. **lead_analytics** → This is a view, not a table
4. **office_hours** → Hardcode in frontend
5. **site_content** → Hardcode in frontend
6. **user_progress** → Use localStorage instead

## Consolidated Table Structures

### 1. users (simplified)
```sql
- id (uuid, primary key)
- email (text, unique)
- full_name (text)
- is_admin (boolean, default false)
- created_at (timestamp)
```

### 2. leads (includes all CRM data)
```sql
- id (uuid, primary key)
- email (text, unique)
- name (text)
- stage (text: 'lead', 'hot_lead', 'member', 'cancelled')
- source (text)
- user_id (uuid, references users)
- created_at (timestamp)
- converted_at (timestamp)
- utm_source (text)
- utm_medium (text)
- utm_campaign (text)
```

### 3. threads
```sql
- id (uuid, primary key)
- title (text)
- content (text)
- category (text: 'announcements', 'general', 'show-tell', 'help')
- author_id (uuid, references users)
- created_at (timestamp)
- last_activity_at (timestamp)
```

### 4. comments
```sql
- id (uuid, primary key)
- thread_id (uuid, references threads)
- content (text)
- author_id (uuid, references users)
- created_at (timestamp)
```

### 5. courses
```sql
- id (uuid, primary key)
- title (text)
- description (text)
- order_index (integer)
- created_at (timestamp)
```

### 6. lessons
```sql
- id (uuid, primary key)
- course_id (uuid, references courses)
- title (text)
- wistia_video_id (text)
- source_code_url (text)
- order_index (integer)
- created_at (timestamp)
```

### 7. stripe_customers
```sql
- user_id (uuid, primary key, references users)
- stripe_customer_id (text, unique)
- created_at (timestamp)
```

### 8. stripe_subscriptions
```sql
- id (text, primary key) -- Stripe subscription ID
- user_id (uuid, references users)
- status (text)
- current_period_end (timestamp)
- created_at (timestamp)
```

## Why This is Better

1. **Simpler**: 8 tables instead of 14
2. **No redundancy**: Each piece of data lives in one place
3. **No unnecessary tracking**: Progress in localStorage, not database
4. **No content tables**: Hardcode office hours and site content
5. **Combined CRM**: Leads table handles all funnel tracking
6. **Member access**: No enrollment tracking - all members see all content

## Migration Steps

1. Backup your database first!
2. Migrate any important data from tables being deleted
3. Drop the 6 unnecessary tables
4. Simplify the remaining 8 tables
5. Update your frontend code to match
6. Test everything

## Remember: Build What You Need

- Every table should have a clear purpose
- If you're not using it this week, delete it
- Complexity is the enemy
- 8 tables can run a $100K/month business