-- Create site_content table for storing editable page content
CREATE TABLE IF NOT EXISTS public.site_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page VARCHAR(50) UNIQUE NOT NULL,
  content JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Anyone can read site content
CREATE POLICY "Anyone can read site content" ON public.site_content
  FOR SELECT
  USING (true);

-- Only admins can update site content
CREATE POLICY "Only admins can update site content" ON public.site_content
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

-- Create index for page lookup
CREATE INDEX IF NOT EXISTS idx_site_content_page ON public.site_content(page);

-- Drop existing function if exists
DROP FUNCTION IF EXISTS public.get_member_stats();

-- Create function to get member stats (bypasses RLS)
CREATE OR REPLACE FUNCTION public.get_member_stats()
RETURNS TABLE (
  active_member_count BIGINT,
  admin_count BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(DISTINCT user_id) FROM public.stripe_subscriptions WHERE status = 'active') as active_member_count,
    (SELECT COUNT(*) FROM public.users WHERE is_admin = true) as admin_count;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_member_stats() TO authenticated;

-- Insert default about page content
INSERT INTO public.site_content (page, content)
VALUES (
  'about',
  jsonb_build_object(
    'title', 'Build What You Need',
    'subtitle', 'Stop paying for SaaS. Start building.',
    'mainDescription', 'The days of overpriced SaaS are over.',
    'memberCount', '2k',
    'onlineCount', '8',
    'adminCount', '10',
    'learnItems', ARRAY[
      'Build tools that replace expensive SaaS subscriptions',
      'Save thousands of dollars per month',
      'Own your tools and data completely'
    ],
    'benefitItems', ARRAY[
      'Access to code templates that replace $1000s in SaaS costs',
      'Step-by-step courses on building your own tools',
      'Community support from experienced builders',
      'Weekly challenges to practice your skills'
    ],
    'footerText', 'Join for just $97/month. Cancel anytime.'
  )
) ON CONFLICT (page) DO NOTHING;