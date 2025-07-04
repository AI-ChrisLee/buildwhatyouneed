-- Create function to get member statistics
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