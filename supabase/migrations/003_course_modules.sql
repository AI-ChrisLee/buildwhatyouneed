-- Add cover_image_url and is_draft to courses table
ALTER TABLE courses 
ADD COLUMN cover_image_url TEXT,
ADD COLUMN is_draft BOOLEAN DEFAULT true;

-- Create course_modules table
CREATE TABLE IF NOT EXISTS course_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  is_collapsed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add module_id to lessons table
ALTER TABLE lessons
ADD COLUMN module_id UUID REFERENCES course_modules(id) ON DELETE SET NULL;

-- Create indexes
CREATE INDEX idx_course_modules_course ON course_modules(course_id);
CREATE INDEX idx_lessons_module ON lessons(module_id);

-- Add updated_at trigger for course_modules
CREATE TRIGGER update_course_modules_updated_at BEFORE UPDATE ON course_modules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies for course_modules
ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;

-- Anyone can view published course modules
CREATE POLICY "Public course modules are viewable by everyone"
  ON course_modules FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM courses 
      WHERE courses.id = course_modules.course_id 
      AND courses.is_published = true
    )
  );

-- Admins can manage course modules
CREATE POLICY "Admins can manage course modules"
  ON course_modules FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.is_admin = true
    )
  );