# 🗄️ Complete Database Setup Guide
## Build What You Need - All SQL in One Place

---

## 📋 Table of Contents
1. [Initial Setup](#1-initial-setup)
2. [Core Tables](#2-core-tables)
3. [Feature Enhancements](#3-feature-enhancements)
4. [Admin Features](#4-admin-features)
5. [Final Configuration](#5-final-configuration)

---

## 1. Initial Setup

### Reset Database (If Needed)
```sql
-- ⚠️ WARNING: This will delete ALL data
-- Only run this if you need to start fresh

-- Drop all tables
DROP TABLE IF EXISTS public.comments CASCADE;
DROP TABLE IF EXISTS public.threads CASCADE;
DROP TABLE IF EXISTS public.lessons CASCADE;
DROP TABLE IF EXISTS public.courses CASCADE;
DROP TABLE IF EXISTS public.leads CASCADE;
DROP TABLE IF EXISTS public.stripe_subscriptions CASCADE;
DROP TABLE IF EXISTS public.stripe_customers CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Drop views
DROP VIEW IF EXISTS public.active_members CASCADE;
DROP VIEW IF EXISTS public.lead_funnel CASCADE;
```

### Enable Extensions
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

---

## 2. Core Tables

### Run this complete setup in order:

```sql
-- ========================================
-- USERS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  founding_number INTEGER UNIQUE, -- Added for founding member tracking
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- STRIPE TABLES
-- ========================================
CREATE TABLE IF NOT EXISTS public.stripe_customers (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.stripe_subscriptions (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- COMMUNITY TABLES
-- ========================================
CREATE TABLE IF NOT EXISTS public.threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('announcements', 'general', 'show-tell', 'help')),
  author_id UUID REFERENCES public.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  -- Admin features
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  pinned_at TIMESTAMPTZ,
  locked_at TIMESTAMPTZ,
  locked_by UUID REFERENCES auth.users(id),
  -- Soft delete
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES auth.users(id)
);

CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID REFERENCES public.threads(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES public.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- Soft delete
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES auth.users(id)
);

-- ========================================
-- LEARNING TABLES
-- ========================================
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  order_index INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  wistia_video_id TEXT NOT NULL,
  order_index INT NOT NULL
);

-- ========================================
-- CRM TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  stage TEXT NOT NULL CHECK (stage IN ('lead', 'hot_lead', 'member', 'cancelled', 'optout')),
  source TEXT DEFAULT 'landing_page',
  user_id UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  hot_lead_at TIMESTAMPTZ,
  member_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  optout_at TIMESTAMPTZ,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  notes TEXT
);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================
CREATE INDEX IF NOT EXISTS idx_threads_category_activity ON public.threads(category, last_activity_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_thread ON public.comments(thread_id, created_at);
CREATE INDEX IF NOT EXISTS idx_threads_author ON public.threads(author_id);
CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_user ON public.stripe_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_status ON public.stripe_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_stage ON public.leads(stage);
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON public.leads(user_id);
CREATE INDEX IF NOT EXISTS idx_threads_is_pinned ON public.threads(is_pinned);
CREATE INDEX IF NOT EXISTS idx_threads_is_deleted ON public.threads(is_deleted);
CREATE INDEX IF NOT EXISTS idx_comments_is_deleted ON public.comments(is_deleted);
```

---

## 3. Feature Enhancements

### Founding Number System
```sql
-- Create sequence for founding numbers
CREATE SEQUENCE IF NOT EXISTS founding_number_seq START 1;

-- Function to assign founding number
CREATE OR REPLACE FUNCTION assign_founding_number()
RETURNS TRIGGER AS $$
BEGIN
  -- Only assign if user doesn't have one already
  IF NEW.founding_number IS NULL THEN
    NEW.founding_number := nextval('founding_number_seq');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-assign on user creation
DROP TRIGGER IF EXISTS assign_founding_number_trigger ON public.users;
CREATE TRIGGER assign_founding_number_trigger
  BEFORE INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION assign_founding_number();

-- Backfill existing users (run once)
UPDATE public.users 
SET founding_number = nextval('founding_number_seq')
WHERE founding_number IS NULL
ORDER BY created_at ASC;
```

### Thread Update Trigger
```sql
-- Update last_activity_at when comments are added
CREATE OR REPLACE FUNCTION update_thread_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.threads
  SET last_activity_at = NOW()
  WHERE id = NEW.thread_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_thread_activity_trigger ON public.comments;
CREATE TRIGGER update_thread_activity_trigger
  AFTER INSERT ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION update_thread_activity();
```

---

## 4. Admin Features

### Admin Helper Functions
```sql
-- Check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if thread is locked
CREATE OR REPLACE FUNCTION public.thread_is_not_locked(thread_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM public.threads
    WHERE id = thread_id
    AND is_locked = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check delete permissions
CREATE OR REPLACE FUNCTION public.can_delete_thread(thread_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.threads t
    LEFT JOIN public.users u ON u.id = user_id
    WHERE t.id = thread_id
    AND (t.author_id = user_id OR u.is_admin = true)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.can_delete_comment(comment_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.comments c
    LEFT JOIN public.users u ON u.id = user_id
    LEFT JOIN public.threads t ON t.id = c.thread_id
    WHERE c.id = comment_id
    AND (
      c.author_id = user_id 
      OR u.is_admin = true 
      OR t.author_id = user_id
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Soft Delete Functions
```sql
-- Soft delete thread
CREATE OR REPLACE FUNCTION public.soft_delete_thread(thread_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.threads
  SET 
    is_deleted = true,
    deleted_at = NOW(),
    deleted_by = auth.uid()
  WHERE id = thread_id
  AND public.can_delete_thread(thread_id, auth.uid());
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Soft delete comment
CREATE OR REPLACE FUNCTION public.soft_delete_comment(comment_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.comments
  SET 
    is_deleted = true,
    deleted_at = NOW(),
    deleted_by = auth.uid()
  WHERE id = comment_id
  AND public.can_delete_comment(comment_id, auth.uid());
  
  UPDATE public.threads
  SET last_activity_at = NOW()
  WHERE id = (SELECT thread_id FROM public.comments WHERE id = comment_id);
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Restore functions (admin only)
CREATE OR REPLACE FUNCTION public.restore_thread(thread_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RETURN false;
  END IF;
  
  UPDATE public.threads
  SET 
    is_deleted = false,
    deleted_at = NULL,
    deleted_by = NULL
  WHERE id = thread_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.restore_comment(comment_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RETURN false;
  END IF;
  
  UPDATE public.comments
  SET 
    is_deleted = false,
    deleted_at = NULL,
    deleted_by = NULL
  WHERE id = comment_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Admin Field Protection Trigger
```sql
-- Prevent non-admins from changing admin fields
CREATE OR REPLACE FUNCTION public.prevent_non_admin_field_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT public.is_admin() THEN
    NEW.is_pinned := OLD.is_pinned;
    NEW.is_locked := OLD.is_locked;
    NEW.pinned_at := OLD.pinned_at;
    NEW.locked_at := OLD.locked_at;
    NEW.locked_by := OLD.locked_by;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prevent_non_admin_changes ON public.threads;
CREATE TRIGGER prevent_non_admin_changes
  BEFORE UPDATE ON public.threads
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_non_admin_field_changes();
```

---

## 5. Final Configuration

### Row Level Security (RLS)
```sql
-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- ========================================
-- USERS POLICIES
-- ========================================
CREATE POLICY "Users can read all users" ON public.users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ========================================
-- THREADS POLICIES
-- ========================================
CREATE POLICY "Anyone can read non-deleted threads" ON public.threads
  FOR SELECT USING (NOT is_deleted OR auth.uid() = author_id OR public.is_admin());

CREATE POLICY "Authenticated users can create threads" ON public.threads
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own non-admin fields" ON public.threads
  FOR UPDATE USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Admins can update all fields" ON public.threads
  FOR UPDATE USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Users can soft delete threads" ON public.threads
  FOR UPDATE USING (public.can_delete_thread(id, auth.uid()))
  WITH CHECK (public.can_delete_thread(id, auth.uid()));

-- ========================================
-- COMMENTS POLICIES
-- ========================================
CREATE POLICY "Anyone can read non-deleted comments" ON public.comments
  FOR SELECT USING (NOT is_deleted OR auth.uid() = author_id OR public.is_admin());

CREATE POLICY "Users can comment on unlocked threads" ON public.comments
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL 
    AND (public.thread_is_not_locked(thread_id) OR public.is_admin())
  );

CREATE POLICY "Users can soft delete comments" ON public.comments
  FOR UPDATE USING (public.can_delete_comment(id, auth.uid()))
  WITH CHECK (public.can_delete_comment(id, auth.uid()));

-- ========================================
-- COURSES & LESSONS POLICIES
-- ========================================
CREATE POLICY "Authenticated users can view courses" ON public.courses
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can manage courses" ON public.courses
  FOR ALL USING (public.is_admin());

CREATE POLICY "Authenticated users can view lessons" ON public.lessons
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can manage lessons" ON public.lessons
  FOR ALL USING (public.is_admin());

-- ========================================
-- STRIPE POLICIES
-- ========================================
CREATE POLICY "Users can view own Stripe data" ON public.stripe_customers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage Stripe customers" ON public.stripe_customers
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Users can view own subscriptions" ON public.stripe_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage subscriptions" ON public.stripe_subscriptions
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- ========================================
-- LEADS POLICIES
-- ========================================
CREATE POLICY "Service role can manage leads" ON public.leads
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Admins can view all leads" ON public.leads
  FOR SELECT USING (public.is_admin());
```

### User Registration Function
```sql
-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

### Useful Views
```sql
-- Active members view
CREATE OR REPLACE VIEW public.active_members AS
SELECT 
  u.id,
  u.email,
  u.full_name,
  u.founding_number,
  u.created_at,
  CASE 
    WHEN ss.status = 'active' THEN true 
    ELSE false 
  END as has_active_subscription
FROM public.users u
LEFT JOIN public.stripe_subscriptions ss ON u.id = ss.user_id AND ss.status = 'active';

-- Lead funnel view
CREATE OR REPLACE VIEW public.lead_funnel AS
SELECT 
  stage,
  COUNT(*) as count,
  COUNT(DISTINCT email) as unique_emails
FROM public.leads
GROUP BY stage
ORDER BY 
  CASE stage
    WHEN 'lead' THEN 1
    WHEN 'hot_lead' THEN 2
    WHEN 'member' THEN 3
    WHEN 'cancelled' THEN 4
    WHEN 'optout' THEN 5
  END;
```

### Disable Email Confirmation (for MVP)
```sql
-- Run in Supabase Dashboard under Authentication > Settings
-- This is a configuration change, not SQL:
-- 1. Go to Authentication > Settings
-- 2. Under "Email Auth" section
-- 3. Turn OFF "Enable email confirmations"
-- 4. Save changes
```

---

## 🎯 Verification Queries

Run these to verify everything is set up correctly:

```sql
-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Check policies exist
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;

-- Check indexes
SELECT tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Test user count
SELECT COUNT(*) as total_users FROM public.users;

-- Test active subscriptions
SELECT COUNT(*) as active_subs 
FROM public.stripe_subscriptions 
WHERE status = 'active';
```

---

## 🚨 Important Notes

1. **Run sections in order** - Dependencies matter
2. **Backup before major changes** - Use Supabase dashboard backups
3. **Test in staging first** - Create a separate Supabase project
4. **Monitor RLS policies** - They affect performance
5. **Keep it simple** - Don't add features you don't need

---

## 🔧 Troubleshooting

### Common Issues:

1. **"Permission denied" errors**
   - Check RLS policies
   - Verify user is authenticated
   - Check service role key usage

2. **"Relation does not exist" errors**
   - Run tables creation in order
   - Check for typos in table names

3. **Slow queries**
   - Check indexes are created
   - Review query plans with EXPLAIN
   - Consider pagination

4. **Stripe webhook failures**
   - Verify service role key in env
   - Check webhook endpoint URL
   - Review Stripe logs

---

## 📝 Next Steps

1. Run all SQL in order
2. Test with sample data
3. Configure Stripe webhooks
4. Set up email templates
5. Deploy and monitor

Remember: **Build what you need. Nothing else.**