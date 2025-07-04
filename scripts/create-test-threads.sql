-- Create threads with mock data
-- Note: You'll need to create a user first to be the author of these threads
-- The user_id below should be replaced with an actual user ID from your database

-- Example threads for different categories
INSERT INTO threads (id, title, content, category, author_id) VALUES
  ('t1111111-1111-1111-1111-111111111111', 
   'Welcome to Build What You Need!', 
   'Hey everyone! I''m excited to announce the launch of our community. This is a place where developers can learn to build their own tools and save thousands on SaaS subscriptions. Looking forward to building amazing things together!', 
   'announcements', 
   '11111111-1111-1111-1111-111111111111'),
   
  ('t2222222-2222-2222-2222-222222222222', 
   'What tools are you planning to build?', 
   'I''m curious about what everyone is planning to build. I''m starting with a simple project management tool for my team. We''ve been paying $99/month for a tool that we only use 20% of the features. What about you?', 
   'general', 
   '11111111-1111-1111-1111-111111111111'),
   
  ('t3333333-3333-3333-3333-333333333333', 
   'Just built my first expense tracker!', 
   'Following the Supabase course, I built a full-featured expense tracker with real-time updates and multi-currency support. It''s replacing a $29/month subscription I had. Here''s a screenshot of the dashboard...', 
   'show-tell', 
   '11111111-1111-1111-1111-111111111111'),
   
  ('t4444444-4444-4444-4444-444444444444', 
   'Help: Stripe webhook not firing', 
   'I''m following the Stripe Integration course but my webhooks aren''t being received. I''ve set up the endpoint and added the webhook secret to my env vars. Using Next.js 14 with the app router. Any ideas what might be wrong?', 
   'help', 
   '11111111-1111-1111-1111-111111111111'),
   
  ('t5555555-5555-5555-5555-555555555555', 
   'Tips for building a customer portal', 
   'After building several SaaS tools, here are my top tips for creating a great customer portal:\n\n1. Keep it simple - users should find what they need in 2 clicks\n2. Mobile-first design is crucial\n3. Include a billing section with Stripe Customer Portal\n4. Add a support ticket system\n5. Show clear subscription status\n\nWhat features do you consider essential?', 
   'general', 
   '11111111-1111-1111-1111-111111111111'),
   
  ('t6666666-6666-6666-6666-666666666666', 
   'New Course Coming: Email Automation', 
   'Based on your feedback, we''re creating a new course on building your own email automation tool. This will cover:\n- Sending transactional emails\n- Email templates with React Email\n- Queue management with BullMQ\n- Analytics and tracking\n\nExpected launch: Next week!', 
   'announcements', 
   '11111111-1111-1111-1111-111111111111');

-- Update last_activity_at for some variety
UPDATE threads SET last_activity_at = created_at + interval '2 hours' WHERE id = 't4444444-4444-4444-4444-444444444444';
UPDATE threads SET last_activity_at = created_at + interval '1 day' WHERE id = 't3333333-3333-3333-3333-333333333333';

-- Pin the welcome announcement
UPDATE threads SET is_pinned = true, pinned_at = now() WHERE id = 't1111111-1111-1111-1111-111111111111';