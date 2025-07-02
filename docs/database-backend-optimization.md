# Database & Backend Optimization Guide
## Build What You Need - MVP Architecture

---

## Core Philosophy
**"Build what you need. Nothing else."**

This guide follows your platform's core principle: minimal complexity, maximum value. Every decision prioritizes simplicity, speed, and cost-effectiveness over "best practices" that add unnecessary complexity.

---

## 1. Database Design Principles

### 1.1 Keep It Stupidly Simple
- **No over-normalization**: Some duplication is fine if it makes queries simpler
- **No premature optimization**: Start with the simplest schema that works
- **No complex relationships**: If you need a join table, question if you really need the feature
- **No soft deletes**: Delete means delete. Keep it simple.

### 1.2 Tables You Actually Need (MVP)
```sql
-- Only 7 tables for entire platform
users
threads
comments
courses
lessons
stripe_customers
stripe_subscriptions
```

That's it. No more.

### 1.3 What You DON'T Need
- ❌ User profiles table (put essential fields in users)
- ❌ Notifications table (no notifications feature)
- ❌ Analytics tables (use Supabase dashboard)
- ❌ Audit logs (not needed for MVP)
- ❌ Tags/Categories tables (hardcode them)
- ❌ Permissions tables (3 roles only: free, paid, admin)

---

## 2. Supabase-First Architecture

### 2.1 Why Supabase?
- **Built-in auth**: No need to build authentication
- **Realtime**: WebSocket subscriptions included
- **PostgreSQL**: Battle-tested, no NoSQL complexity
- **Row Level Security**: Authorization at database level
- **Free tier**: Generous limits for 1000 users

### 2.2 Supabase Best Practices
```sql
-- Use RLS instead of middleware
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;

-- Simple policies
CREATE POLICY "Members can read all threads" ON threads
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Members can create threads" ON threads
  FOR INSERT WITH CHECK (auth.uid() = author_id);
```

### 2.3 What NOT to Use
- ❌ Supabase Edge Functions (use Next.js API routes)
- ❌ Supabase Storage (use Wistia for videos)
- ❌ Supabase Realtime for everything (only for new comments)
- ❌ Complex RLS policies (keep them readable)

---

## 3. Simplified Schema Design

### 3.1 Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'free' CHECK (role IN ('free', 'paid', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
-- No avatar, bio, social links, preferences, etc.
```

### 3.2 Threads Table
```sql
CREATE TABLE threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('announcements', 'general', 'show-tell', 'help')),
  author_id UUID REFERENCES users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ DEFAULT NOW()
);
-- No tags, no likes, no views, no drafts
```

### 3.3 Comments Table
```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID REFERENCES threads(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
-- No nested replies, no reactions, no edits
```

### 3.4 Courses & Lessons
```sql
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  order_index INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  wistia_video_id TEXT NOT NULL,
  order_index INT NOT NULL
);
-- No progress tracking in DB (use localStorage)
```

### 3.5 Stripe Integration
```sql
CREATE TABLE stripe_customers (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  stripe_customer_id TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE stripe_subscriptions (
  id TEXT PRIMARY KEY, -- Stripe subscription ID
  user_id UUID REFERENCES users(id) NOT NULL,
  status TEXT NOT NULL,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 4. API Design (Keep It Boring)

### 4.1 RESTful Routes Only
```
GET    /api/threads          - List threads
POST   /api/threads          - Create thread
GET    /api/threads/[id]     - Get thread with comments
POST   /api/threads/[id]/comments - Add comment

GET    /api/courses          - List courses
GET    /api/courses/[id]/lessons - Get lessons

GET    /api/calendar         - Get hardcoded schedule
```

### 4.2 No GraphQL, No tRPC
- REST is simple and sufficient
- Everyone understands it
- No learning curve
- Easier to debug

### 4.3 Simple Response Format
```json
// Success
{
  "data": { ... }
}

// Error
{
  "error": "Message here"
}
```

No envelope complexity, no HAL, no JSON:API spec.

---

## 5. Performance Optimization

### 5.1 Database Indexes (Only What's Needed)
```sql
-- Threads by category and activity
CREATE INDEX idx_threads_category_activity ON threads(category, last_activity_at DESC);

-- Comments by thread
CREATE INDEX idx_comments_thread ON comments(thread_id, created_at);

-- User's threads
CREATE INDEX idx_threads_author ON threads(author_id);
```

That's all. No more indexes until proven necessary.

### 5.2 Query Optimization
```sql
-- Bad: N+1 query problem
SELECT * FROM threads;
-- Then for each thread: SELECT COUNT(*) FROM comments WHERE thread_id = ?

-- Good: Get everything in one query
SELECT 
  t.*,
  COUNT(c.id) as comment_count,
  MAX(c.created_at) as last_comment_at
FROM threads t
LEFT JOIN comments c ON t.id = c.thread_id
GROUP BY t.id
ORDER BY t.last_activity_at DESC
LIMIT 20;
```

### 5.3 Caching Strategy
- **Browser Cache**: Static assets (1 year)
- **CDN**: Use Vercel's built-in CDN
- **Database**: Let PostgreSQL handle it
- **Redis**: Not needed for MVP
- **No premature caching**

---

## 6. Stripe Integration (Dead Simple)

### 6.1 Payment Flow
```javascript
// 1. User signs up
const user = await createUser(email, password);

// 2. Redirect to Stripe
const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  line_items: [{
    price: process.env.STRIPE_PRICE_ID,
    quantity: 1,
  }],
  mode: 'subscription',
  success_url: `${url}/welcome`,
  cancel_url: `${url}/signup`,
  client_reference_id: user.id,
});

// 3. Webhook handles the rest
```

### 6.2 Webhook Handler
```javascript
// Only handle what matters
switch (event.type) {
  case 'checkout.session.completed':
    await upgradeUserToPaid(session.client_reference_id);
    break;
    
  case 'customer.subscription.deleted':
    await downgradeUserToFree(subscription.metadata.user_id);
    break;
    
  // Ignore everything else
}
```

### 6.3 No Complex Billing
- One price: $97/month
- No tiers, no annual plans
- No coupons or discounts
- No usage-based billing
- Cancel anytime = Stripe handles it

---

## 7. Security (But Not Paranoid)

### 7.1 Essential Security Only
```javascript
// RLS handles authorization
// Supabase handles authentication
// HTTPS handles encryption

// You only need:
- Input sanitization (Supabase does this)
- Rate limiting (Vercel does this)
- CORS (Next.js does this)
```

### 7.2 What You DON'T Need
- ❌ OAuth providers (email/password only)
- ❌ 2FA (not for MVP)
- ❌ Session management (Supabase handles it)
- ❌ Password complexity rules (basic validation only)
- ❌ IP whitelisting
- ❌ WAF rules

---

## 8. Scaling Strategy (When You Need It)

### 8.1 First 1000 Users
- Supabase free tier: More than enough
- Vercel free tier: 100GB bandwidth
- No optimization needed

### 8.2 1000-10,000 Users
- Upgrade Supabase ($25/month)
- Upgrade Vercel ($20/month)
- Still no code changes needed

### 8.3 Only Optimize When It Breaks
- Monitor response times
- If <2 seconds, do nothing
- If >2 seconds, then optimize
- Not before

---

## 9. Development Workflow

### 9.1 Local Development
```bash
# That's it
npm run dev
```

- Use Supabase local emulator
- Stripe test mode
- No Docker complexity
- No microservices

### 9.2 Deployment
```bash
git push main
# Vercel auto-deploys
# Done
```

### 9.3 Database Migrations
```sql
-- Simple SQL files
-- No complex migration tools
-- Run through Supabase dashboard
```

---

## 10. Monitoring (Keep It Light)

### 10.1 What to Monitor
- Response time (Vercel Analytics)
- Error rate (Vercel Functions logs)
- Stripe webhook failures
- Database size (Supabase dashboard)

### 10.2 What NOT to Monitor
- ❌ User behavior analytics
- ❌ Feature usage metrics
- ❌ Performance profiling
- ❌ A/B test results
- ❌ Detailed user journeys

---

## 11. Anti-Patterns to Avoid

### 11.1 Complexity Creep
```javascript
// ❌ Bad: Abstract for no reason
class ThreadRepositoryFactory {
  createRepository(): IThreadRepository {
    return new ThreadRepository(new DatabaseAdapter());
  }
}

// ✅ Good: Just write the damn query
const threads = await supabase
  .from('threads')
  .select('*')
  .order('last_activity_at', { ascending: false });
```

### 11.2 Premature Optimization
- ❌ Don't add Redis "for caching"
- ❌ Don't split into microservices
- ❌ Don't add GraphQL "for flexibility"
- ❌ Don't implement event sourcing
- ❌ Don't add message queues

### 11.3 Over-Engineering
- ❌ No dependency injection
- ❌ No repository pattern
- ❌ No clean architecture
- ❌ No domain-driven design
- ❌ Just. Ship. Code.

---

## 12. Cost Breakdown (Monthly)

### For 1000 Users:
- Supabase: $0 (free tier)
- Vercel: $0-20 (depends on traffic)
- Stripe: ~$30 (2.9% of $97 × 1000 × 0.03)
- Wistia: $99 (if needed)
- **Total: <$150/month**

### Your Profit:
- Revenue: $97,000
- Costs: $150
- **Profit: $96,850/month**

---

## 13. Launch Checklist

### Database
- [ ] Create 7 tables (no more)
- [ ] Add 3 indexes (no more)
- [ ] Enable RLS with simple policies
- [ ] Test with 1000 fake records

### Backend
- [ ] 8 API endpoints (no more)
- [ ] Stripe webhook (2 events only)
- [ ] Basic error handling
- [ ] No complex middleware

### Performance
- [ ] <2 second page loads
- [ ] <200ms API responses
- [ ] Works on 3G
- [ ] No JavaScript required for core features

---

## 14. Remember This

1. **Every feature = more complexity = more bugs**
2. **1000 users don't need "enterprise architecture"**
3. **PostgreSQL has solved most problems already**
4. **Your users care about value, not your tech stack**
5. **Ship fast, optimize later (probably never)**

---

## Final Thought

The best code is no code. The best feature is no feature. The best architecture is the simplest one that could possibly work.

You're building a community platform, not Facebook. Keep it simple, ship it fast, and laugh all the way to the bank while competitors debate microservices.

**Build what you need. Nothing else.**