-- ========================================
-- COMPLETE DATABASE SETUP FOR BWYN
-- ========================================
-- Run this entire file in Supabase SQL Editor
-- This creates all 8 tables + 2 views + all policies

-- ========================================
-- 1. ENABLE EXTENSIONS
-- ========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- 2. CREATE ALL TABLES (8 total)
-- ========================================

-- Users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stripe customers table
CREATE TABLE IF NOT EXISTS public.stripe_customers (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stripe subscriptions table
CREATE TABLE IF NOT EXISTS public.stripe_subscriptions (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Threads table
CREATE TABLE IF NOT EXISTS public.threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('announcements', 'general', 'show-tell', 'help')),
  author_id UUID REFERENCES public.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID REFERENCES public.threads(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES public.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Courses table
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  order_index INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lessons table
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  wistia_video_id TEXT NOT NULL,
  order_index INT NOT NULL
);

-- Leads table (CRM)
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
-- 3. ENABLE ROW LEVEL SECURITY
-- ========================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 4. CREATE INDEXES FOR PERFORMANCE
-- ========================================
CREATE INDEX IF NOT EXISTS idx_threads_category_activity ON public.threads(category, last_activity_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_thread ON public.comments(thread_id, created_at);
CREATE INDEX IF NOT EXISTS idx_threads_author ON public.threads(author_id);
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_stage ON public.leads(stage);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);

-- ========================================
-- 5. CREATE FUNCTIONS
-- ========================================

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update thread activity
CREATE OR REPLACE FUNCTION public.update_thread_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.threads
  SET last_activity_at = NOW()
  WHERE id = NEW.thread_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically update lead stage when user signs up
CREATE OR REPLACE FUNCTION update_lead_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  -- Update existing lead or create new one
  INSERT INTO public.leads (email, name, stage, user_id, hot_lead_at)
  VALUES (NEW.email, NEW.full_name, 'hot_lead', NEW.id, NOW())
  ON CONFLICT (email) DO UPDATE
  SET 
    stage = 'hot_lead',
    user_id = NEW.id,
    hot_lead_at = NOW(),
    name = COALESCE(public.leads.name, NEW.full_name);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update lead stage when subscription is created
CREATE OR REPLACE FUNCTION update_lead_on_payment()
RETURNS TRIGGER AS $$
BEGIN
  -- Update lead to member status
  UPDATE public.leads
  SET 
    stage = 'member',
    member_at = NOW()
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update lead stage when subscription is cancelled
CREATE OR REPLACE FUNCTION update_lead_on_cancel()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if status changed from active to something else
  IF OLD.status = 'active' AND NEW.status != 'active' THEN
    UPDATE public.leads
    SET 
      stage = 'cancelled',
      cancelled_at = NOW()
    WHERE user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 6. CREATE TRIGGERS
-- ========================================

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger to update thread activity on new comment
DROP TRIGGER IF EXISTS on_comment_created ON public.comments;
CREATE TRIGGER on_comment_created
  AFTER INSERT ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.update_thread_activity();

-- Trigger for user signup to update leads
DROP TRIGGER IF EXISTS on_user_signup ON public.users;
CREATE TRIGGER on_user_signup
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_lead_on_signup();

-- Trigger for subscription creation to update leads
DROP TRIGGER IF EXISTS on_subscription_created ON public.stripe_subscriptions;
CREATE TRIGGER on_subscription_created
  AFTER INSERT ON public.stripe_subscriptions
  FOR EACH ROW
  WHEN (NEW.status = 'active')
  EXECUTE FUNCTION update_lead_on_payment();

-- Trigger for subscription cancellation to update leads
DROP TRIGGER IF EXISTS on_subscription_cancelled ON public.stripe_subscriptions;
CREATE TRIGGER on_subscription_cancelled
  AFTER UPDATE ON public.stripe_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_lead_on_cancel();

-- ========================================
-- 7. CREATE RLS POLICIES
-- ========================================

-- Users table policies
CREATE POLICY "Users can read own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Stripe tables policies
CREATE POLICY "Users can read own stripe data" ON public.stripe_customers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can read own subscription" ON public.stripe_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Threads table policies
CREATE POLICY "Paid members can read threads" ON public.threads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.stripe_subscriptions 
      WHERE user_id = auth.uid() 
      AND status = 'active'
    )
  );

CREATE POLICY "Paid members can create threads" ON public.threads
  FOR INSERT WITH CHECK (
    auth.uid() = author_id 
    AND (
      category != 'announcements' 
      OR EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND is_admin = TRUE
      )
    )
  );

-- Comments table policies
CREATE POLICY "Paid members can read comments" ON public.comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.stripe_subscriptions 
      WHERE user_id = auth.uid() 
      AND status = 'active'
    )
  );

CREATE POLICY "Paid members can create comments" ON public.comments
  FOR INSERT WITH CHECK (
    auth.uid() = author_id
    AND EXISTS (
      SELECT 1 FROM public.stripe_subscriptions 
      WHERE user_id = auth.uid() 
      AND status = 'active'
    )
  );

-- Courses table policies
CREATE POLICY "Paid members can read courses" ON public.courses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.stripe_subscriptions 
      WHERE user_id = auth.uid() 
      AND status = 'active'
    )
  );

CREATE POLICY "Admins can insert courses" ON public.courses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND is_admin = TRUE
    )
  );

-- Lessons table policies
CREATE POLICY "Paid members can read lessons" ON public.lessons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.stripe_subscriptions 
      WHERE user_id = auth.uid() 
      AND status = 'active'
    )
  );

CREATE POLICY "Admins can insert lessons" ON public.lessons
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND is_admin = TRUE
    )
  );

-- Leads table policies (Admin only)
CREATE POLICY "Admin can view all leads" ON public.leads
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND is_admin = TRUE
    )
  );

-- ========================================
-- 8. CREATE ANALYTICS VIEWS
-- ========================================

-- View for lead analytics by stage
CREATE OR REPLACE VIEW lead_analytics AS
SELECT 
  stage,
  COUNT(*) as count,
  COUNT(DISTINCT DATE(created_at)) as days_active,
  MIN(created_at) as first_lead_date,
  MAX(created_at) as last_lead_date
FROM public.leads
GROUP BY stage;

-- Conversion funnel view
CREATE OR REPLACE VIEW conversion_funnel AS
SELECT 
  COUNT(*) FILTER (WHERE stage IN ('lead', 'hot_lead', 'member', 'cancelled', 'optout')) as total_leads,
  COUNT(*) FILTER (WHERE stage IN ('hot_lead', 'member', 'cancelled')) as signups,
  COUNT(*) FILTER (WHERE stage IN ('member', 'cancelled')) as paid_members,
  COUNT(*) FILTER (WHERE stage = 'member') as active_members,
  COUNT(*) FILTER (WHERE stage = 'cancelled') as cancelled_members,
  COUNT(*) FILTER (WHERE stage = 'optout') as optouts,
  -- Conversion rates
  ROUND(100.0 * COUNT(*) FILTER (WHERE stage IN ('hot_lead', 'member', 'cancelled')) / NULLIF(COUNT(*), 0), 2) as lead_to_signup_rate,
  ROUND(100.0 * COUNT(*) FILTER (WHERE stage IN ('member', 'cancelled')) / NULLIF(COUNT(*) FILTER (WHERE stage IN ('hot_lead', 'member', 'cancelled')), 0), 2) as signup_to_paid_rate,
  ROUND(100.0 * COUNT(*) FILTER (WHERE stage = 'member') / NULLIF(COUNT(*) FILTER (WHERE stage IN ('member', 'cancelled')), 0), 2) as retention_rate
FROM public.leads;

-- Grant access to views
GRANT SELECT ON lead_analytics TO authenticated;
GRANT SELECT ON conversion_funnel TO authenticated;

-- ========================================
-- DONE! 
-- ========================================
SELECT 'Database setup complete! You now have 8 tables + 2 views ready.' as message;