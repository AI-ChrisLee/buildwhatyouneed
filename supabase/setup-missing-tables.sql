-- Add site_content table if it doesn't exist
-- This table is used by the about page for editable content

CREATE TABLE IF NOT EXISTS site_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page VARCHAR(255) UNIQUE NOT NULL,
  content JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- Anyone can read site content
CREATE POLICY "Anyone can view site content" ON site_content
  FOR SELECT USING (true);

-- Only admins can update site content
CREATE POLICY "Admins can update site content" ON site_content
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.is_admin = true
    )
  );

-- Create or update function for the about page default content
CREATE OR REPLACE FUNCTION create_default_about_content()
RETURNS void AS $$
BEGIN
  INSERT INTO site_content (page, content)
  VALUES (
    'about',
    jsonb_build_object(
      'title', 'Build What You Need',
      'subtitle', 'Stop paying for SaaS. Start building.',
      'mainDescription', 'The days of overpriced SaaS are over.',
      'memberCount', '2k',
      'onlineCount', '8',
      'adminCount', '10',
      'learnItems', jsonb_build_array(
        'Build tools that replace expensive SaaS subscriptions',
        'Save thousands of dollars per month',
        'Own your tools and data completely'
      ),
      'benefitItems', jsonb_build_array(
        'Access to code templates that replace $1000s in SaaS costs',
        'Step-by-step courses on building your own tools',
        'Community support from experienced builders',
        'Weekly challenges to practice your skills'
      ),
      'footerText', 'Join for just $97/month. Cancel anytime.'
    )
  )
  ON CONFLICT (page) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Create default content
SELECT create_default_about_content();-- Create function to get member statistics
-- This bypasses RLS to allow the about page to show real member counts

CREATE OR REPLACE FUNCTION get_member_stats()
RETURNS TABLE (
  active_member_count BIGINT,
  admin_count BIGINT
) 
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT u.id) FILTER (
      WHERE EXISTS (
        SELECT 1 FROM stripe_subscriptions s 
        WHERE s.user_id = u.id 
        AND s.status = 'active'
      )
    ) as active_member_count,
    COUNT(*) FILTER (WHERE u.is_admin = true) as admin_count
  FROM users u;
END;
$$ LANGUAGE plpgsql;