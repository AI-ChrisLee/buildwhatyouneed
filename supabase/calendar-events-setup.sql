-- ========================================
-- CALENDAR EVENTS SYSTEM
-- ========================================

-- Create events table
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('workshop', 'webinar', 'office-hours', 'community-call', 'other')),
  
  -- Date and time
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ NOT NULL,
  timezone TEXT DEFAULT 'UTC',
  
  -- Location/Access
  location_type TEXT NOT NULL CHECK (location_type IN ('online', 'in-person', 'hybrid')),
  location_details JSONB DEFAULT '{}', -- URL for online, address for in-person
  
  -- Capacity and registration
  max_attendees INTEGER,
  registration_required BOOLEAN DEFAULT false,
  registration_deadline TIMESTAMPTZ,
  
  -- Status
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'cancelled')),
  
  -- Host information
  host_id UUID REFERENCES public.users(id) NOT NULL,
  co_hosts UUID[] DEFAULT '{}',
  
  -- Additional details
  tags TEXT[] DEFAULT '{}',
  image_url TEXT,
  
  -- Recurring events
  is_recurring BOOLEAN DEFAULT false,
  recurrence_rule JSONB, -- RRULE format
  parent_event_id UUID REFERENCES public.events(id),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES public.users(id),
  
  CONSTRAINT valid_datetime CHECK (end_datetime > start_datetime)
);

-- Event registrations/RSVPs
CREATE TABLE IF NOT EXISTS public.event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  
  status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'waitlisted', 'cancelled', 'attended')),
  
  -- Registration details
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ,
  attended_at TIMESTAMPTZ,
  
  -- Additional info
  notes TEXT,
  reminder_sent BOOLEAN DEFAULT false,
  
  UNIQUE(event_id, user_id)
);

-- Event resources (materials, recordings, etc.)
CREATE TABLE IF NOT EXISTS public.event_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  
  resource_type TEXT NOT NULL CHECK (resource_type IN ('slide', 'recording', 'document', 'link', 'other')),
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  
  is_public BOOLEAN DEFAULT false, -- Available to non-attendees
  order_index INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES public.users(id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_events_start_datetime ON public.events(start_datetime);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_events_host ON public.events(host_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON public.events(event_type);
CREATE INDEX IF NOT EXISTS idx_registrations_event ON public.event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_user ON public.event_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON public.event_registrations(status);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_resources ENABLE ROW LEVEL SECURITY;

-- ========================================
-- ROW LEVEL SECURITY POLICIES
-- ========================================

-- Events policies
CREATE POLICY "Anyone can view published events" ON public.events
  FOR SELECT USING (status = 'published' OR host_id = auth.uid() OR public.is_admin());

CREATE POLICY "Admins and hosts can create events" ON public.events
  FOR INSERT WITH CHECK (public.is_admin() OR auth.uid() = host_id);

CREATE POLICY "Admins and hosts can update events" ON public.events
  FOR UPDATE USING (public.is_admin() OR auth.uid() = host_id);

CREATE POLICY "Admins can delete events" ON public.events
  FOR DELETE USING (public.is_admin());

-- Registration policies
CREATE POLICY "Users can view their own registrations" ON public.event_registrations
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Admins can view all registrations" ON public.event_registrations
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Users can register for events" ON public.event_registrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own registrations" ON public.event_registrations
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all registrations" ON public.event_registrations
  FOR ALL USING (public.is_admin());

-- Resources policies
CREATE POLICY "View public resources or own events" ON public.event_resources
  FOR SELECT USING (
    is_public = true 
    OR EXISTS (
      SELECT 1 FROM public.events 
      WHERE id = event_resources.event_id 
      AND (host_id = auth.uid() OR public.is_admin())
    )
    OR EXISTS (
      SELECT 1 FROM public.event_registrations 
      WHERE event_id = event_resources.event_id 
      AND user_id = auth.uid()
      AND status IN ('registered', 'attended')
    )
  );

CREATE POLICY "Admins and hosts can manage resources" ON public.event_resources
  FOR ALL USING (
    public.is_admin() 
    OR EXISTS (
      SELECT 1 FROM public.events 
      WHERE id = event_resources.event_id 
      AND host_id = auth.uid()
    )
  );

-- ========================================
-- HELPER FUNCTIONS
-- ========================================

-- Get available spots for an event
CREATE OR REPLACE FUNCTION public.get_available_spots(event_id UUID)
RETURNS INTEGER AS $$
DECLARE
  max_spots INTEGER;
  registered_count INTEGER;
BEGIN
  SELECT max_attendees INTO max_spots
  FROM public.events
  WHERE id = event_id;
  
  IF max_spots IS NULL THEN
    RETURN NULL; -- Unlimited spots
  END IF;
  
  SELECT COUNT(*) INTO registered_count
  FROM public.event_registrations
  WHERE event_registrations.event_id = get_available_spots.event_id
  AND status IN ('registered', 'attended');
  
  RETURN GREATEST(0, max_spots - registered_count);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user can register for event
CREATE OR REPLACE FUNCTION public.can_register_for_event(event_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  event_status TEXT;
  reg_required BOOLEAN;
  reg_deadline TIMESTAMPTZ;
  available_spots INTEGER;
  already_registered BOOLEAN;
BEGIN
  -- Get event details
  SELECT status, registration_required, registration_deadline
  INTO event_status, reg_required, reg_deadline
  FROM public.events
  WHERE id = can_register_for_event.event_id;
  
  -- Check event exists and is published
  IF event_status IS NULL OR event_status != 'published' THEN
    RETURN FALSE;
  END IF;
  
  -- Check if registration is required
  IF NOT reg_required THEN
    RETURN FALSE;
  END IF;
  
  -- Check registration deadline
  IF reg_deadline IS NOT NULL AND reg_deadline < NOW() THEN
    RETURN FALSE;
  END IF;
  
  -- Check if already registered
  SELECT EXISTS (
    SELECT 1 FROM public.event_registrations
    WHERE event_registrations.event_id = can_register_for_event.event_id
    AND event_registrations.user_id = can_register_for_event.user_id
    AND status != 'cancelled'
  ) INTO already_registered;
  
  IF already_registered THEN
    RETURN FALSE;
  END IF;
  
  -- Check available spots
  available_spots := public.get_available_spots(can_register_for_event.event_id);
  IF available_spots IS NOT NULL AND available_spots <= 0 THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- VIEWS
-- ========================================

-- Upcoming events view
CREATE OR REPLACE VIEW public.upcoming_events AS
SELECT 
  e.*,
  u.full_name as host_name,
  u.email as host_email,
  public.get_available_spots(e.id) as available_spots,
  COUNT(er.id) as registered_count
FROM public.events e
LEFT JOIN public.users u ON e.host_id = u.id
LEFT JOIN public.event_registrations er ON e.id = er.event_id AND er.status IN ('registered', 'attended')
WHERE e.status = 'published'
  AND e.start_datetime > NOW()
GROUP BY e.id, u.id
ORDER BY e.start_datetime ASC;

-- User's registered events
CREATE OR REPLACE VIEW public.my_events AS
SELECT 
  e.*,
  er.status as registration_status,
  er.registered_at,
  u.full_name as host_name
FROM public.events e
JOIN public.event_registrations er ON e.id = er.event_id
LEFT JOIN public.users u ON e.host_id = u.id
WHERE er.user_id = auth.uid()
  AND er.status != 'cancelled'
ORDER BY e.start_datetime ASC;

-- ========================================
-- MOCK DATA
-- ========================================

-- Insert sample events (run after setting up users)
INSERT INTO public.events (
  title,
  description,
  event_type,
  start_datetime,
  end_datetime,
  location_type,
  location_details,
  max_attendees,
  registration_required,
  host_id,
  tags
) VALUES 
(
  'SaaS Teardown: Analyzing Intercom',
  'Join us as we dissect Intercom''s architecture and discuss how to build similar features with simple code.',
  'workshop',
  NOW() + INTERVAL '7 days',
  NOW() + INTERVAL '7 days' + INTERVAL '90 minutes',
  'online',
  '{"platform": "Zoom", "url": "https://zoom.us/j/123456789", "passcode": "saas123"}'::jsonb,
  50,
  true,
  (SELECT id FROM public.users WHERE is_admin = true LIMIT 1),
  ARRAY['workshop', 'live-coding', 'intercom']
),
(
  'Office Hours with the Founder',
  'Open Q&A session. Bring your questions about building SaaS alternatives, technical challenges, or business strategy.',
  'office-hours',
  NOW() + INTERVAL '3 days',
  NOW() + INTERVAL '3 days' + INTERVAL '60 minutes',
  'online',
  '{"platform": "Google Meet", "url": "https://meet.google.com/abc-defg-hij"}'::jsonb,
  20,
  true,
  (SELECT id FROM public.users WHERE is_admin = true LIMIT 1),
  ARRAY['office-hours', 'q&a', 'community']
),
(
  'Community Show & Tell',
  'Share what you''ve built! Each member gets 5 minutes to demo their SaaS replacement project.',
  'community-call',
  NOW() + INTERVAL '14 days',
  NOW() + INTERVAL '14 days' + INTERVAL '2 hours',
  'online',
  '{"platform": "Zoom", "url": "https://zoom.us/j/987654321"}'::jsonb,
  NULL,
  false,
  (SELECT id FROM public.users WHERE is_admin = true LIMIT 1),
  ARRAY['community', 'demo', 'show-and-tell']
),
(
  'Building a CRM in 100 Lines',
  'Live coding session where we''ll build a functional CRM system from scratch.',
  'webinar',
  NOW() + INTERVAL '10 days',
  NOW() + INTERVAL '10 days' + INTERVAL '2 hours',
  'online',
  '{"platform": "YouTube Live", "url": "https://youtube.com/live/example123"}'::jsonb,
  NULL,
  true,
  (SELECT id FROM public.users WHERE is_admin = true LIMIT 1),
  ARRAY['webinar', 'crm', 'live-coding']
);

-- Verify setup
SELECT 
  'Events created' as status,
  COUNT(*) as count 
FROM public.events;