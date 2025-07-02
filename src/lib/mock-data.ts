export const mockUsers = {
  john: {
    id: "usr_1",
    username: "john",
    displayName: "John Builder",
    email: "john@example.com",
    joinedDate: "December 2024",
    totalSaved: 45000,
    threadsCount: 23,
    bio: "Killing SaaS one tool at a time. Previously wasted $10k/month on 37 different tools.",
    isAdmin: false,
  },
  sarah: {
    id: "usr_2",
    username: "sarah",
    displayName: "Sarah Chen",
    email: "sarah@example.com",
    joinedDate: "November 2024",
    totalSaved: 82000,
    threadsCount: 45,
    bio: "Former CTO who discovered 90% of our stack was unnecessary. Now I build everything from scratch.",
    isAdmin: false,
  },
  mike: {
    id: "usr_3",
    username: "mike",
    displayName: "Mike Rodriguez",
    email: "mike@example.com",
    joinedDate: "December 2024",
    totalSaved: 23000,
    threadsCount: 12,
    bio: "Indie hacker. Replaced my entire MarTech stack with 200 lines of Python.",
    isAdmin: false,
  },
  admin: {
    id: "usr_admin",
    username: "admin",
    displayName: "Platform Admin",
    email: "admin@buildwhatyouneed.com",
    joinedDate: "October 2024",
    totalSaved: 0,
    threadsCount: 89,
    bio: "Building the revolution. Death to SaaS.",
    isAdmin: true,
  },
}

export const mockThreads = [
  {
    id: "1",
    title: "How I replaced $10k of SaaS",
    content: `I was paying for 37 different tools. Today I canceled 34 of them.

Here's what I built instead:

**Customer support**: 50 lines of code
- Simple email form → PostgreSQL → Admin panel
- Response time: 5 minutes (vs $399/mo Intercom)

**Analytics**: PostgreSQL + 1 query
- Page views, user sessions, conversions
- Real SQL instead of proprietary query languages
- Cost: $0 (vs $500/mo Mixpanel)

**Email marketing**: for loop + SMTP
- Send to segments with a simple WHERE clause
- Open tracking with a 1x1 pixel
- Cost: $10/mo SMTP (vs $299/mo ConvertKit)

Total time: 4 hours
Money saved: **$10,847/month**

The best part? I actually understand how everything works now.`,
    category: "show-tell",
    categoryLabel: "Show & Tell",
    author: "john",
    authorId: "usr_1",
    createdAt: "2 hours ago",
    lastActivity: "5 min ago",
    commentCount: 12,
    views: 234,
  },
  {
    id: "2",
    title: "Need help with Stripe webhooks",
    content: `I'm trying to set up Stripe webhooks for my subscription system but running into issues.

Current setup:
- Next.js API routes
- Stripe checkout sessions
- PostgreSQL database

The webhook hits my endpoint but I'm getting signature verification errors. Anyone dealt with this before?

Error: 
\`\`\`
Stripe webhook signature verification failed
\`\`\``,
    category: "help",
    categoryLabel: "Help",
    author: "sarah",
    authorId: "usr_2",
    createdAt: "4 hours ago",
    lastActivity: "1 hour ago",
    commentCount: 8,
    views: 89,
  },
  {
    id: "3",
    title: "[ADMIN] Week 3 Focus: Kill Your CRM",
    content: `This week we're declaring war on CRM software.

**The Scam**: Salesforce wants $125/user/month to store customer data in a database. HubSpot "starts" at $45/month then explodes to $3,200/month when you need actual features.

**The Reality**: A CRM is literally just:
1. A contacts table
2. A deals/opportunities table  
3. Some related tables for activities
4. Basic CRUD operations

**This Week's Challenge**: Build your own CRM in <100 lines of code

Resources:
- Database schema: Check the classroom
- Example UI: See my thread from last week
- Email integration: Use webhooks

Post your builds in Show & Tell. Best implementation gets featured next week.

Death to Salesforce. Death to HubSpot. Build what you need.`,
    category: "announcements",
    categoryLabel: "Announcements",
    author: "admin",
    authorId: "usr_admin",
    createdAt: "1 day ago",
    lastActivity: "3 hours ago",
    commentCount: 45,
    views: 1203,
  },
  {
    id: "4",
    title: "My analytics setup: Postgres + 1 query",
    content: `Killed Google Analytics, Mixpanel, and Heap. Here's my entire analytics system:

\`\`\`sql
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  user_id UUID,
  session_id UUID,
  event_type VARCHAR(50),
  properties JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Daily active users
SELECT DATE(created_at), COUNT(DISTINCT user_id)
FROM events
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at);
\`\`\`

That's it. That's the whole thing.`,
    category: "show-tell",
    categoryLabel: "Show & Tell",
    author: "john",
    authorId: "usr_1",
    createdAt: "3 days ago",
    lastActivity: "1 day ago",
    commentCount: 28,
    views: 567,
  },
  {
    id: "5",
    title: "Email marketing without ConvertKit",
    content: `ConvertKit wanted $299/month for my 5,000 subscriber list. Here's what I built instead:

\`\`\`python
import smtplib
from email.mime.text import MIMEText

def send_newsletter(subscribers, subject, content):
    for subscriber in subscribers:
        msg = MIMEText(content)
        msg['Subject'] = subject
        msg['From'] = 'me@example.com'
        msg['To'] = subscriber.email
        
        smtp.send_message(msg)
\`\`\`

Added unsubscribe links, open tracking, and segmentation. Total cost: $10/month for SendGrid SMTP.`,
    category: "show-tell",
    categoryLabel: "Show & Tell",
    author: "sarah",
    authorId: "usr_2",
    createdAt: "1 week ago",
    lastActivity: "3 days ago",
    commentCount: 67,
    views: 892,
  },
]

export const mockComments = [
  {
    id: "c1",
    threadId: "1",
    content: "This is the way. Just killed Intercom and saved $399/month. My 'support system' is now an email form and a database table.",
    author: "sarah",
    authorId: "usr_2",
    createdAt: "1 hour ago",
  },
  {
    id: "c2",
    threadId: "1",
    content: "Can you share the analytics query for conversion tracking? I'm still stuck with Google Analytics but want out.",
    author: "mike",
    authorId: "usr_3",
    createdAt: "45 min ago",
  },
  {
    id: "c3",
    threadId: "2",
    content: "Check your webhook endpoint URL in Stripe dashboard. Also make sure you're using the endpoint secret, not the API key.",
    author: "john",
    authorId: "usr_1",
    createdAt: "1 hour ago",
  },
  {
    id: "c4",
    threadId: "2",
    content: "I had this exact issue. The problem was my Next.js was parsing the raw body. You need the raw request body for signature verification.",
    author: "mike",
    authorId: "usr_3",
    createdAt: "30 min ago",
  },
]

export const mockCourses = [
  {
    id: "saas-101",
    title: "SaaS Destruction 101",
    description: "Learn the fundamentals of replacing expensive SaaS with simple code.",
    instructor: "admin",
    lessonCount: 12,
    duration: "3h 24m",
    students: 847,
    progress: 80,
    lessons: [
      { id: "1", title: "Introduction: The $50B SaaS Lie", duration: "12:34", completed: true },
      { id: "2", title: "Setting Up Your Dev Environment", duration: "18:45", completed: true },
      { id: "3", title: "Replacing Intercom with 50 Lines", duration: "25:12", completed: true },
      { id: "4", title: "Kill Your Analytics Platform", duration: "19:38", completed: true },
      { id: "5", title: "Email Marketing = For Loop", duration: "22:10", completed: true },
      { id: "6", title: "CRM in a Spreadsheet", duration: "15:55", completed: true },
      { id: "7", title: "Project Management = Markdown", duration: "18:20", completed: true },
      { id: "8", title: "Landing Pages Without Builders", duration: "28:30", completed: true },
      { id: "9", title: "Forms Without TypeForm", duration: "16:42", completed: true },
      { id: "10", title: "Scheduling Without Calendly", duration: "20:15", completed: false },
      { id: "11", title: "Payments Without Complexity", duration: "24:18", completed: false },
      { id: "12", title: "Putting It All Together", duration: "30:00", completed: false },
    ],
  },
  {
    id: "advanced",
    title: "Advanced Patterns",
    description: "Complex replacements for enterprise software. Real production examples.",
    instructor: "admin",
    lessonCount: 8,
    duration: "2h 15m",
    students: 423,
    progress: 20,
    lessons: [
      { id: "1", title: "Enterprise Auth Systems", duration: "32:15", completed: true },
      { id: "2", title: "Real-time Collaboration", duration: "28:40", completed: true },
      { id: "3", title: "Data Pipelines", duration: "35:20", completed: false },
      { id: "4", title: "Search at Scale", duration: "29:55", completed: false },
      { id: "5", title: "Multi-tenant Architecture", duration: "38:10", completed: false },
      { id: "6", title: "API Gateway Patterns", duration: "26:30", completed: false },
      { id: "7", title: "Monitoring Without DataDog", duration: "22:45", completed: false },
      { id: "8", title: "CI/CD Without Services", duration: "31:25", completed: false },
    ],
  },
  {
    id: "quick-wins",
    title: "Quick Wins",
    description: "5 tools you can replace today. Under 50 lines of code each.",
    instructor: "admin",
    lessonCount: 5,
    duration: "45m",
    students: 1247,
    progress: 0,
    lessons: [
      { id: "1", title: "URL Shortener", duration: "8:30", completed: false },
      { id: "2", title: "Status Page", duration: "10:15", completed: false },
      { id: "3", title: "Feedback Widget", duration: "7:45", completed: false },
      { id: "4", title: "Newsletter Signup", duration: "9:20", completed: false },
      { id: "5", title: "FAQ Bot", duration: "11:10", completed: false },
    ],
  },
]

export const mockStats = {
  totalMembers: 847,
  totalSaaSKilled: "$2.4M",
  monthlySavings: "$847,293",
  averageSavingsPerMember: "$3,247",
  topSaaSKilled: [
    { name: "Salesforce", amount: "$125,000", members: 89 },
    { name: "Intercom", amount: "$98,000", members: 245 },
    { name: "Mixpanel", amount: "$89,000", members: 178 },
    { name: "ConvertKit", amount: "$67,000", members: 224 },
    { name: "Calendly", amount: "$45,000", members: 298 },
  ],
}

export const mockCalendarEvents = {
  tuesday: {
    title: "Build Review",
    description: "Show what you built. Get feedback from the community.",
    time: "10 AM PST",
    duration: "1 hour",
    nextSession: new Date("2025-01-07T18:00:00Z"), // Next Tuesday 10 AM PST
    meetingLink: null, // Only shown when session is live
  },
  thursday: {
    title: "Open Office Hours",
    description: "Get unstuck. Ask anything. No stupid questions.",
    time: "10 AM PST", 
    duration: "1 hour",
    nextSession: new Date("2025-01-09T18:00:00Z"), // Next Thursday 10 AM PST
    meetingLink: null,
  },
}