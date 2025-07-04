# Product Requirements Document (PRD)
## Build What You Need - Club Platform

### Document Information
- **Version**: 1.0 MVP
- **Date**: January 2025
- **Status**: Essential Features Only

---

## 1. Executive Summary

### Product Vision
The world's simplest community platform. Built to prove that $419/month community software is a scam. Three features. Zero bloat. Total control.

### MVP Scope
1. **Threads** - Focused discussions
2. **Classroom** - Video content delivery  
3. **Calendar** - Weekly office hours

That's it. Nothing else.

---

## 2. Problem Statement

### The Community Platform Scam
- **Circle**: $419/month for features no one uses
- **Skool**: Gamification addiction instead of value
- **Discord**: Built for gamers, adapted poorly for business
- **Slack**: Information maze, not community

### Our Approach
Build only what members actually use. Skip everything else.

---

## 3. Core Features (MVP)

### 3.1 Threads (Community Hub)

**Purpose**: Focused discussion without distraction

**Structure**:
```
Categories (Hardcoded):
├── Announcements (Admin only post)
├── General Discussion  
├── Show & Tell
└── Help
```

**Functionality**:
- Create thread (title + markdown content)
- Add comments (markdown)
- Sort by recent activity
- Basic search by title
- No nested comments
- No reactions/likes
- No private threads

**Data Model**:
```sql
threads:
  - id, title, content, category
  - author_id, created_at, last_activity_at

comments:
  - id, thread_id, content
  - author_id, created_at
```

### 3.2 Classroom (Video Delivery)

**Purpose**: Structured learning content

**Structure**:
```
Courses → Lessons → Video
Simple hierarchy, no complex paths
```

**Functionality**:
- Admin uploads course structure
- Wistia video embeds
- Mark as watched (localStorage)
- Previous/Next navigation
- No quizzes
- No certificates
- No cohorts
- No assignments

**Data Model**:
```sql
courses:
  - id, title, description, order_index

lessons:
  - id, course_id, title
  - wistia_video_id, order_index
```

### 3.3 Calendar (Office Hours)

**Purpose**: Weekly live support sessions

**Functionality**:
- Display weekly schedule (hardcoded)
- Show next session countdown
- Zoom/Google Meet link when live
- No booking system
- No reminders
- No timezone conversion (show in PST)
- No calendar sync

**Schedule** (Hardcoded):
- Tuesday 10 AM PST: Build Review
- Thursday 10 AM PST: Open Office Hours

---

## 4. Authentication & Access

### Stripe-First Authentication
1. User signs up (email/password)
2. Redirected to Stripe Payment Link
3. Webhook confirms payment
4. Access granted to platform

### Access Control
- **Free**: Can view sales page only
- **Paid**: Full access to all features
- **Admin**: Can post announcements, upload courses

No complex roles. No permissions matrix.

---

## 5. Design Principles

### Visual Design
- **Minimal**: Black text, white background
- **Dense**: Information over aesthetics
- **Fast**: No animations or transitions
- **Obvious**: No clever UI patterns

### Navigation
```
[Logo] [Threads] [Classroom] [Calendar] [Logout]
```
That's the entire navigation. No dropdowns. No hamburger menus.

### Mobile
Responsive CSS. Not a "mobile experience." Just readable on phones.

---

## 6. Marketing Side Features

### Public Pages

#### Landing Page (/)
**Purpose**: Convert visitors to members

**Content Blocks**:
1. **Hero**: The $50B SaaS Scam headline
2. **Proof**: "This platform built in 4 hours"
3. **Price**: $97/month (crossing out $419)
4. **Urgency**: First 1000 members lock in founding price
5. **CTA**: "Join The Revolution"

**Copy Reference**: Use `/paste-2.txt` for voice and messaging

#### Sales Page (/join)
**Purpose**: Handle objections and close the sale

**Sections**:
1. **The Problem**: Your SaaS invoice screenshot
2. **The Solution**: Build what you need
3. **The Proof**: Member success stories
4. **The Price**: $97 vs. $10,000+ in SaaS
5. **The Guarantee**: Cancel anytime

### Marketing Automation

#### Tracking (Simple)
- Member count display (social proof)
- "SaaS Killed" counter
- Total money saved ticker
- No complex analytics
- No pixel tracking
- No A/B testing

#### Content Marketing
- YouTube embeds on landing page
- Member testimonials (text only)
- Daily build showcase (latest 3)

---

## 7. Technical Constraints

### Performance Requirements
- Page load: < 2 seconds
- No loading states (optimistic UI)
- Works on 3G connection
- No JavaScript required for core features

### Stack Limitations
- Next.js + Supabase + Stripe
- No additional services
- No third-party analytics
- No customer support tools
- No email service (except auth)

---

## 8. What We DON'T Build

### Community Features We Skip
- ❌ Direct messaging
- ❌ User profiles
- ❌ Notifications
- ❌ Email digests
- ❌ Mobile app
- ❌ Search (beyond basic)
- ❌ Tags/Categories (beyond hardcoded)
- ❌ Moderation tools
- ❌ Report system
- ❌ Block/Mute users

### Platform Features We Skip
- ❌ API access
- ❌ Webhooks
- ❌ Integrations
- ❌ Custom domains
- ❌ White labeling
- ❌ Analytics dashboard
- ❌ Admin panel (use Supabase directly)

### Learning Features We Skip
- ❌ Progress tracking (beyond localStorage)
- ❌ Certificates
- ❌ Quizzes
- ❌ Assignments
- ❌ Cohort-based courses
- ❌ Drip content
- ❌ Content gating by progress

---

## 9. User Flows

### New Member Flow
```
Land on homepage → See the revolution message
↓
Click "Join" → See price and value
↓
Sign up → Email + Password
↓
Pay via Stripe → $97/month
↓
Access granted → Land in Threads
```

### Daily Member Flow
```
Login → See latest threads
↓
Check announcements → Get today's focus
↓
Watch classroom content → Learn new pattern
↓
Post in Show & Tell → Share success
```

### Weekly Rhythm
```
Tuesday: Join Build Review call
Thursday: Join Office Hours
Daily: Check threads, watch lessons
```

---

## 10. Success Metrics

### Platform Health
- Signup → Payment conversion: >50%
- Daily active members: >40%
- Weekly active members: >80%
- Thread creation: >10/day
- Video completion: >60%

### Business Metrics
- MRR: $97,000 (1000 members)
- Churn: <5% monthly
- CAC: <$50
- LTV: >$1,200

---

## 11. Launch Requirements

### Definition of Done (MVP)
- [ ] Members can sign up and pay
- [ ] Members can create/read threads
- [ ] Members can watch classroom videos
- [ ] Members can see calendar events
- [ ] Admin can post announcements
- [ ] Admin can upload courses
- [ ] Platform handles 1000 concurrent users

### Not Required for Launch
- Email notifications
- Search beyond titles
- User profiles
- Edit/Delete posts
- Video transcripts
- Mobile app
- API access

---

## 12. Content Strategy

### Copy Voice (Reference: paste-2.txt)
- **Angry** at SaaS pricing
- **Excited** about building
- **Direct** without corporate speak
- **Honest** about limitations

### Example Copy
```
Homepage Hero:
"They charge $419/month for a forum.
I built this in 4 hours.
Join 1000 builders destroying SaaS."

CTA Button:
"Start Building. Stop Bleeding."
```

### Social Proof Elements
- Live member count
- Latest success story
- Money saved counter
- No fake testimonials
- No stock photos
- No badges/awards

---

## Final Philosophy

This platform exists to prove a point: Most software is overengineered to justify inflated prices.

Every feature decision should answer: "Do members actually use this?"

If the answer is maybe, the answer is no.

**Build what you need. Nothing else.**