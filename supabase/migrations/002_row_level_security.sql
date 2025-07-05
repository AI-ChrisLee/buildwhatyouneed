-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE office_hours ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Public can read user profiles" ON users
  FOR SELECT USING (true);

-- Leads table policies (admin only)
CREATE POLICY "Service role can manage leads" ON leads
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Courses table policies
CREATE POLICY "Anyone can read published courses" ON courses
  FOR SELECT USING (is_published = true);

CREATE POLICY "Service role can manage courses" ON courses
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Lessons table policies
CREATE POLICY "Paid members can read published lessons" ON lessons
  FOR SELECT USING (
    is_published = true AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND membership_tier = 'paid'
    )
  );

CREATE POLICY "Service role can manage lessons" ON lessons
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Threads table policies
CREATE POLICY "Anyone can read threads" ON threads
  FOR SELECT USING (true);

CREATE POLICY "Paid members can create threads" ON threads
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND membership_tier = 'paid'
    )
  );

CREATE POLICY "Authors can update own threads" ON threads
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete own threads" ON threads
  FOR DELETE USING (auth.uid() = author_id);

-- Comments table policies
CREATE POLICY "Anyone can read comments" ON comments
  FOR SELECT USING (true);

CREATE POLICY "Paid members can create comments" ON comments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND membership_tier = 'paid'
    )
  );

CREATE POLICY "Authors can update own comments" ON comments
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete own comments" ON comments
  FOR DELETE USING (auth.uid() = author_id);

-- Stripe subscriptions policies
CREATE POLICY "Users can read own subscription" ON stripe_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage subscriptions" ON stripe_subscriptions
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Office hours policies
CREATE POLICY "Anyone can read published office hours" ON office_hours
  FOR SELECT USING (is_published = true);

CREATE POLICY "Service role can manage office hours" ON office_hours
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');