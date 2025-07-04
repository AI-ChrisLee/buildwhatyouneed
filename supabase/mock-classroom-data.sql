-- ========================================
-- MOCK DATA FOR CLASSROOM FEATURE
-- ========================================
-- Run this after setting up the database structure

-- Insert Courses
INSERT INTO public.courses (id, title, description, order_index) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'SaaS Destruction 101', 'Learn the fundamentals of replacing expensive SaaS with simple code. Build real alternatives to popular tools.', 1),
  ('550e8400-e29b-41d4-a716-446655440002', 'Advanced Patterns', 'Complex replacements for enterprise software. Real production examples from companies saving millions.', 2),
  ('550e8400-e29b-41d4-a716-446655440003', 'Quick Wins', '5 tools you can replace today. Under 50 lines of code each. Perfect for beginners.', 3),
  ('550e8400-e29b-41d4-a716-446655440004', 'Next.js Mastery', 'Build production-ready applications with Next.js 14. From basics to advanced deployment strategies.', 4),
  ('550e8400-e29b-41d4-a716-446655440005', 'Database Optimization', 'PostgreSQL and Supabase best practices. Query optimization, indexing, and real-time features.', 5);

-- Insert Lessons for SaaS Destruction 101
INSERT INTO public.lessons (course_id, title, wistia_video_id, order_index) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Introduction: The SaaS Lie', 'abc123def1', 1),
  ('550e8400-e29b-41d4-a716-446655440001', 'Setting Up Your Dev Environment', 'abc123def2', 2),
  ('550e8400-e29b-41d4-a716-446655440001', 'Replacing Intercom with 50 Lines', 'abc123def3', 3),
  ('550e8400-e29b-41d4-a716-446655440001', 'Kill Your Analytics Platform', 'abc123def4', 4),
  ('550e8400-e29b-41d4-a716-446655440001', 'Email Marketing = For Loop', 'abc123def5', 5),
  ('550e8400-e29b-41d4-a716-446655440001', 'CRM in a Spreadsheet', 'abc123def6', 6),
  ('550e8400-e29b-41d4-a716-446655440001', 'Project Management = Markdown', 'abc123def7', 7),
  ('550e8400-e29b-41d4-a716-446655440001', 'Landing Pages Without Builders', 'abc123def8', 8),
  ('550e8400-e29b-41d4-a716-446655440001', 'Forms Without TypeForm', 'abc123def9', 9),
  ('550e8400-e29b-41d4-a716-446655440001', 'Scheduling Without Calendly', 'abc123def10', 10),
  ('550e8400-e29b-41d4-a716-446655440001', 'Payments Without Complexity', 'abc123def11', 11),
  ('550e8400-e29b-41d4-a716-446655440001', 'Putting It All Together', 'abc123def12', 12);

-- Insert Lessons for Advanced Patterns
INSERT INTO public.lessons (course_id, title, wistia_video_id, order_index) VALUES
  ('550e8400-e29b-41d4-a716-446655440002', 'Enterprise Auth Systems', 'xyz789ghi1', 1),
  ('550e8400-e29b-41d4-a716-446655440002', 'Real-time Collaboration', 'xyz789ghi2', 2),
  ('550e8400-e29b-41d4-a716-446655440002', 'Data Pipelines', 'xyz789ghi3', 3),
  ('550e8400-e29b-41d4-a716-446655440002', 'Search at Scale', 'xyz789ghi4', 4),
  ('550e8400-e29b-41d4-a716-446655440002', 'Multi-tenant Architecture', 'xyz789ghi5', 5),
  ('550e8400-e29b-41d4-a716-446655440002', 'API Gateway Patterns', 'xyz789ghi6', 6),
  ('550e8400-e29b-41d4-a716-446655440002', 'Monitoring Without DataDog', 'xyz789ghi7', 7),
  ('550e8400-e29b-41d4-a716-446655440002', 'CI/CD Without Services', 'xyz789ghi8', 8);

-- Insert Lessons for Quick Wins
INSERT INTO public.lessons (course_id, title, wistia_video_id, order_index) VALUES
  ('550e8400-e29b-41d4-a716-446655440003', 'URL Shortener in 20 Lines', 'qwe456jkl1', 1),
  ('550e8400-e29b-41d4-a716-446655440003', 'Status Page in 30 Lines', 'qwe456jkl2', 2),
  ('550e8400-e29b-41d4-a716-446655440003', 'Feedback Widget in 25 Lines', 'qwe456jkl3', 3),
  ('550e8400-e29b-41d4-a716-446655440003', 'Newsletter Signup in 15 Lines', 'qwe456jkl4', 4),
  ('550e8400-e29b-41d4-a716-446655440003', 'FAQ Bot in 40 Lines', 'qwe456jkl5', 5);

-- Insert Lessons for Next.js Mastery
INSERT INTO public.lessons (course_id, title, wistia_video_id, order_index) VALUES
  ('550e8400-e29b-41d4-a716-446655440004', 'Next.js 14 Fundamentals', 'nxt001vid1', 1),
  ('550e8400-e29b-41d4-a716-446655440004', 'App Router Deep Dive', 'nxt001vid2', 2),
  ('550e8400-e29b-41d4-a716-446655440004', 'Server Components & Actions', 'nxt001vid3', 3),
  ('550e8400-e29b-41d4-a716-446655440004', 'Data Fetching Patterns', 'nxt001vid4', 4),
  ('550e8400-e29b-41d4-a716-446655440004', 'Authentication & Authorization', 'nxt001vid5', 5),
  ('550e8400-e29b-41d4-a716-446655440004', 'Performance Optimization', 'nxt001vid6', 6),
  ('550e8400-e29b-41d4-a716-446655440004', 'Deployment Strategies', 'nxt001vid7', 7),
  ('550e8400-e29b-41d4-a716-446655440004', 'Production Best Practices', 'nxt001vid8', 8);

-- Insert Lessons for Database Optimization
INSERT INTO public.lessons (course_id, title, wistia_video_id, order_index) VALUES
  ('550e8400-e29b-41d4-a716-446655440005', 'PostgreSQL Fundamentals', 'db001vid1', 1),
  ('550e8400-e29b-41d4-a716-446655440005', 'Query Optimization Techniques', 'db001vid2', 2),
  ('550e8400-e29b-41d4-a716-446655440005', 'Indexing Strategies', 'db001vid3', 3),
  ('550e8400-e29b-41d4-a716-446655440005', 'Supabase Real-time Features', 'db001vid4', 4),
  ('550e8400-e29b-41d4-a716-446655440005', 'Row Level Security', 'db001vid5', 5),
  ('550e8400-e29b-41d4-a716-446655440005', 'Database Functions & Triggers', 'db001vid6', 6);

-- ========================================
-- OPTIONAL: User Progress Tracking
-- ========================================
-- If you want to add progress tracking, create these tables:

-- User Progress Table
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  last_position INTEGER DEFAULT 0, -- Video position in seconds
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Course Enrollment Table (optional)
CREATE TABLE IF NOT EXISTS public.course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, course_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_progress_user ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_lesson ON public.user_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_user ON public.course_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_course ON public.course_enrollments(course_id);

-- RLS Policies for new tables
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;

-- Users can only view/manage their own progress
CREATE POLICY "Users can view own progress" ON public.user_progress
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own enrollments" ON public.course_enrollments
  FOR ALL USING (auth.uid() = user_id);

-- ========================================
-- VERIFICATION
-- ========================================
-- Run these to verify the data was inserted correctly:

-- Check courses
SELECT id, title, order_index FROM public.courses ORDER BY order_index;

-- Check lesson count per course
SELECT 
  c.title as course_title, 
  COUNT(l.id) as lesson_count 
FROM public.courses c
LEFT JOIN public.lessons l ON c.id = l.course_id
GROUP BY c.id, c.title
ORDER BY c.order_index;

-- Check first few lessons
SELECT 
  c.title as course_title,
  l.title as lesson_title,
  l.wistia_video_id,
  l.order_index
FROM public.lessons l
JOIN public.courses c ON l.course_id = c.id
ORDER BY c.order_index, l.order_index
LIMIT 10;