-- ========================================
-- SIMPLIFIED OFFICE HOURS SETUP
-- ========================================

-- Drop complex event tables if they exist
DROP TABLE IF EXISTS public.event_resources CASCADE;
DROP TABLE IF EXISTS public.event_registrations CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
DROP VIEW IF EXISTS public.upcoming_events CASCADE;
DROP VIEW IF EXISTS public.my_events CASCADE;

-- Create simple office hours table
CREATE TABLE IF NOT EXISTS public.office_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 1=Monday, etc.
  time_pst TEXT NOT NULL, -- e.g., "10:00 AM" or "2:00 PM"
  zoom_link TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert the fixed office hours
INSERT INTO public.office_hours (day_of_week, time_pst, zoom_link) VALUES
  (1, '10:00 AM', 'https://us06web.zoom.us/j/84785094939?pwd=QyTEFX9rtAgnPyTnULLUCMux8aMnVV.1'), -- Monday
  (4, '2:00 PM', 'https://us06web.zoom.us/j/85179106602'); -- Thursday

-- Create a function to get next office hours
CREATE OR REPLACE FUNCTION public.get_next_office_hours()
RETURNS TABLE (
  id UUID,
  day_name TEXT,
  time_pst TEXT,
  zoom_link TEXT,
  next_date DATE,
  next_datetime_pst TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  WITH days AS (
    SELECT 
      oh.id,
      CASE oh.day_of_week
        WHEN 0 THEN 'Sunday'
        WHEN 1 THEN 'Monday'
        WHEN 2 THEN 'Tuesday'
        WHEN 3 THEN 'Wednesday'
        WHEN 4 THEN 'Thursday'
        WHEN 5 THEN 'Friday'
        WHEN 6 THEN 'Saturday'
      END as day_name,
      oh.time_pst,
      oh.zoom_link,
      oh.day_of_week,
      -- Calculate next occurrence
      CURRENT_DATE + (
        (oh.day_of_week - EXTRACT(DOW FROM CURRENT_DATE)::INT + 7) % 7
      )::INT as next_date
    FROM public.office_hours oh
    WHERE oh.is_active = true
  )
  SELECT 
    d.id,
    d.day_name,
    d.time_pst,
    d.zoom_link,
    d.next_date,
    -- Convert to timestamp in PST
    (d.next_date || ' ' || d.time_pst)::TIMESTAMP AT TIME ZONE 'America/Los_Angeles' as next_datetime_pst
  FROM days d
  WHERE 
    -- If the office hour for today has already passed, get next week's
    CASE 
      WHEN d.next_date = CURRENT_DATE 
        AND (d.next_date || ' ' || d.time_pst)::TIMESTAMP AT TIME ZONE 'America/Los_Angeles' < NOW() AT TIME ZONE 'America/Los_Angeles'
      THEN d.next_date + 7
      ELSE d.next_date
    END >= CURRENT_DATE
  ORDER BY 
    CASE 
      WHEN d.next_date = CURRENT_DATE 
        AND (d.next_date || ' ' || d.time_pst)::TIMESTAMP AT TIME ZONE 'America/Los_Angeles' < NOW() AT TIME ZONE 'America/Los_Angeles'
      THEN d.next_date + 7
      ELSE d.next_date
    END,
    d.time_pst;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS
ALTER TABLE public.office_hours ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read office hours
CREATE POLICY "Anyone can view office hours" ON public.office_hours
  FOR SELECT USING (true);

-- Only admins can modify office hours
CREATE POLICY "Admins can manage office hours" ON public.office_hours
  FOR ALL USING (public.is_admin());

-- Test the function
SELECT * FROM public.get_next_office_hours();