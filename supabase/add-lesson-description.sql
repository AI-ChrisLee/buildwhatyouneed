-- ========================================
-- ADD DESCRIPTION TO LESSONS TABLE
-- ========================================

-- Add description column to lessons table
ALTER TABLE public.lessons 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add duration column (optional - for displaying estimated time)
ALTER TABLE public.lessons 
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER;

-- Update existing lessons with sample descriptions (optional)
UPDATE public.lessons SET description = 
  CASE 
    WHEN title LIKE '%Introduction%' THEN 'Get started with the fundamentals and understand the core concepts of this course.'
    WHEN title LIKE '%Setup%' OR title LIKE '%Environment%' THEN 'Set up your development environment and tools needed for this course.'
    WHEN title LIKE '%Advanced%' THEN 'Deep dive into advanced concepts and real-world implementations.'
    ELSE 'Learn practical skills and techniques in this comprehensive lesson.'
  END
WHERE description IS NULL;

-- Update mock data with more specific descriptions
UPDATE public.lessons SET description = 'Discover why expensive SaaS tools are often unnecessary and how simple code can replace them. Learn the philosophy behind building what you need.', duration_minutes = 12 
WHERE title = 'Introduction: The SaaS Lie';

UPDATE public.lessons SET description = 'Configure your development environment with the essential tools. We''ll set up VS Code, Node.js, and other prerequisites for the course.', duration_minutes = 18 
WHERE title = 'Setting Up Your Dev Environment';

UPDATE public.lessons SET description = 'Build a fully functional customer support chat widget that replaces Intercom. Learn WebSocket basics and create a clean UI in just 50 lines of code.', duration_minutes = 25 
WHERE title = 'Replacing Intercom with 50 Lines';

UPDATE public.lessons SET description = 'Create your own analytics dashboard without Google Analytics or Mixpanel. Track page views, user sessions, and custom events with a simple database.', duration_minutes = 19 
WHERE title = 'Kill Your Analytics Platform';

UPDATE public.lessons SET description = 'Build an email marketing system using basic loops and templates. Send newsletters, track opens, and manage subscribers without expensive services.', duration_minutes = 22 
WHERE title = 'Email Marketing = For Loop';

UPDATE public.lessons SET description = 'Implement a simple CRM system using spreadsheet-like functionality. Track customers, deals, and interactions without Salesforce complexity.', duration_minutes = 15 
WHERE title = 'CRM in a Spreadsheet';

UPDATE public.lessons SET description = 'Replace Jira, Asana, or Trello with a markdown-based project management system. Simple, fast, and perfectly customizable for your needs.', duration_minutes = 18 
WHERE title = 'Project Management = Markdown';

UPDATE public.lessons SET description = 'Create beautiful, fast landing pages without Webflow or other builders. Use modern HTML/CSS and simple templating for maximum control.', duration_minutes = 28 
WHERE title = 'Landing Pages Without Builders';

UPDATE public.lessons SET description = 'Build custom forms with validation, file uploads, and conditional logic. No need for TypeForm or similar services.', duration_minutes = 16 
WHERE title = 'Forms Without TypeForm';

UPDATE public.lessons SET description = 'Create a scheduling system that rivals Calendly. Handle availability, bookings, and calendar integration with straightforward code.', duration_minutes = 20 
WHERE title = 'Scheduling Without Calendly';

UPDATE public.lessons SET description = 'Implement payment processing with Stripe in a simple, maintainable way. Handle subscriptions, one-time payments, and webhooks.', duration_minutes = 24 
WHERE title = 'Payments Without Complexity';

UPDATE public.lessons SET description = 'Combine all the concepts from this course into a complete SaaS replacement toolkit. Review best practices and deployment strategies.', duration_minutes = 30 
WHERE title = 'Putting It All Together';

-- Verify the changes
SELECT 
  c.title as course_title,
  l.title as lesson_title,
  l.description,
  l.duration_minutes,
  l.order_index
FROM public.lessons l
JOIN public.courses c ON l.course_id = c.id
ORDER BY c.order_index, l.order_index
LIMIT 5;