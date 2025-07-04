-- ========================================
-- UPDATE LESSON DESCRIPTIONS WITH STRUCTURED CONTENT
-- ========================================
-- This updates existing lessons with structured JSON content

-- Example of updating a specific lesson with structured content
UPDATE public.lessons 
SET description = '{
  "overview": "Build a fully functional customer support chat widget that replaces Intercom. We''ll implement WebSocket connections for real-time messaging, create a clean floating UI, and add message persistence - all in about 50 lines of code.",
  "learningPoints": [
    "Set up WebSocket server with Node.js for real-time communication",
    "Create a floating chat widget with modern CSS",
    "Implement message persistence with localStorage",
    "Handle online/offline states gracefully",
    "Add notification system for new messages",
    "Deploy your chat widget to production"
  ],
  "resources": [
    {
      "type": "link",
      "title": "WebSocket Documentation",
      "url": "https://developer.mozilla.org/en-US/docs/Web/API/WebSocket",
      "description": "Official MDN documentation for WebSocket API"
    },
    {
      "type": "download",
      "title": "Complete Source Code",
      "url": "https://github.com/yourusername/intercom-replacement",
      "description": "Download the complete working code from this lesson"
    },
    {
      "type": "video",
      "title": "Extended Tutorial: Adding File Uploads",
      "url": "https://youtube.com/watch?v=example",
      "description": "30-minute bonus video on adding file upload support"
    },
    {
      "type": "document",
      "title": "Deployment Guide",
      "url": "https://docs.example.com/deploy-chat-widget",
      "description": "Step-by-step guide to deploy your chat widget"
    }
  ]
}'::jsonb
WHERE title = 'Replacing Intercom with 50 Lines';

-- Another example with different content structure
UPDATE public.lessons 
SET description = '{
  "overview": "Learn how to build a complete email marketing system using basic loops and templates. We''ll create a subscriber management system, design responsive email templates, and implement open tracking - all without expensive third-party services.",
  "learningPoints": [
    "Design a subscriber database with proper segmentation",
    "Create responsive HTML email templates",
    "Implement email sending with SMTP",
    "Track email opens and clicks",
    "Handle unsubscribes and bounce management",
    "Schedule campaigns with cron jobs"
  ],
  "resources": [
    {
      "type": "download",
      "title": "Email Templates Pack",
      "url": "https://example.com/email-templates.zip",
      "description": "5 responsive email templates ready to use"
    },
    {
      "type": "link",
      "title": "SMTP Setup Guide",
      "url": "https://docs.sendgrid.com/for-developers/sending-email/smtp",
      "description": "Configure SMTP for reliable email delivery"
    },
    {
      "type": "document",
      "title": "Email Best Practices",
      "url": "https://example.com/email-best-practices.pdf",
      "description": "Industry best practices for email deliverability"
    }
  ]
}'::jsonb
WHERE title = 'Email Marketing = For Loop';

-- Update a Quick Wins lesson
UPDATE public.lessons 
SET description = '{
  "overview": "Create a URL shortener service in just 20 lines of code. Perfect for internal use or as a microservice in your application stack.",
  "learningPoints": [
    "Generate unique short codes efficiently",
    "Store and retrieve URLs with PostgreSQL",
    "Handle redirects with proper HTTP status codes",
    "Add basic analytics tracking"
  ],
  "resources": [
    {
      "type": "download",
      "title": "Complete URL Shortener Code",
      "url": "https://gist.github.com/example/url-shortener",
      "description": "Copy and paste ready implementation"
    },
    {
      "type": "link",
      "title": "Live Demo",
      "url": "https://short.example.com",
      "description": "See the URL shortener in action"
    }
  ]
}'::jsonb
WHERE title = 'URL Shortener in 20 Lines';

-- Verify the updates
SELECT 
  c.title as course_title,
  l.title as lesson_title,
  jsonb_pretty(l.description::jsonb) as formatted_description
FROM public.lessons l
JOIN public.courses c ON l.course_id = c.id
WHERE l.description IS NOT NULL 
  AND l.description::text LIKE '%resources%'
LIMIT 3;