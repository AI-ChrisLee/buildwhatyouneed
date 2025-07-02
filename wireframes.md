# Build What You Need - Wireframes & UI Design

## Information Architecture

### Sitemap
```
/
├── / (Landing Page - Public)
├── /join (Sales Page - Public)
├── /login (Authentication)
├── /signup (Registration)
├── /dashboard (Member Home - redirects to /threads)
├── /threads
│   ├── /threads/[category] (Category View)
│   ├── /threads/[id] (Thread Detail)
│   └── /threads/new (Create Thread)
├── /classroom
│   ├── /classroom/[courseId] (Course View)
│   └── /classroom/[courseId]/[lessonId] (Lesson View)
├── /calendar (Office Hours Schedule)
└── /admin
    ├── /admin/courses (Course Management)
    └── /admin/announcements (Announcement Creation)
```

### URL Structure
- Clean, semantic URLs
- No query parameters for core navigation
- Category slugs: `announcements`, `general`, `show-tell`, `help`
- Use hyphens for multi-word slugs

### Navigation Structure
```
[Logo] [Threads] [Classroom] [Calendar] [Logout]
```
- Fixed top navigation bar
- No dropdowns or submenus
- Active state indication with underline
- Logo links to /threads (for logged in) or / (for logged out)

### Responsive Breakpoints
- Mobile: 320px - 768px
- Desktop: 769px+
- No tablet-specific designs (scales naturally)

---

## Core Feature Wireframes

### Authentication Flow

#### Login Page (/login)
```
┌─────────────────────────────────┐
│          Build What You Need     │
│                                  │
│  ┌─────────────────────────┐    │
│  │ Email                   │    │
│  └─────────────────────────┘    │
│                                  │
│  ┌─────────────────────────┐    │
│  │ Password                │    │
│  └─────────────────────────┘    │
│                                  │
│  [────── Login ──────]          │
│                                  │
│  Don't have an account? Sign up │
│                                  │
└─────────────────────────────────┘
```

#### Signup Page (/signup)
```
┌─────────────────────────────────┐
│          Build What You Need     │
│                                  │
│  Join the revolution.            │
│  $97/month. Cancel anytime.      │
│                                  │
│  ┌─────────────────────────┐    │
│  │ Email                   │    │
│  └─────────────────────────┘    │
│                                  │
│  ┌─────────────────────────┐    │
│  │ Password                │    │
│  └─────────────────────────┘    │
│                                  │
│  [──── Continue to Payment ────] │
│                                  │
│  Already a member? Login        │
│                                  │
└─────────────────────────────────┘
```

### Threads Interface

#### Thread List (/threads)
```
┌─────────────────────────────────────────────┐
│ [Logo] [Threads] [Classroom] [Calendar] [X] │
├─────────────────────────────────────────────┤
│                                             │
│ [Announcements][General][Show & Tell][Help] │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ 🔍 Search threads...                    │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ [──────── New Thread ────────]              │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ How I replaced $10k of SaaS             │ │
│ │ Show & Tell • by john • 2 hours ago    │ │
│ │ 12 comments • Last: 5 min ago          │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ Need help with Stripe webhooks         │ │
│ │ Help • by sarah • 4 hours ago          │ │
│ │ 8 comments • Last: 1 hour ago          │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ [ADMIN] Week 3 Focus: Kill Your CRM    │ │
│ │ Announcements • by admin • 1 day ago   │ │
│ │ 45 comments • Last: 3 hours ago        │ │
│ └─────────────────────────────────────────┘ │
│                                             │
└─────────────────────────────────────────────┘
```

#### Thread Detail (/threads/[id])
```
┌─────────────────────────────────────────────┐
│ [Logo] [Threads] [Classroom] [Calendar] [X] │
├─────────────────────────────────────────────┤
│                                             │
│ ← Back to threads                           │
│                                             │
│ # How I replaced $10k of SaaS               │
│                                             │
│ Show & Tell • by john • 2 hours ago        │
│                                             │
│ ─────────────────────────────────────────── │
│                                             │
│ I was paying for 37 different tools.        │
│ Today I canceled 34 of them.                │
│                                             │
│ Here's what I built instead:                │
│ - Customer support: 50 lines of code        │
│ - Analytics: PostgreSQL + 1 query           │
│ - Email marketing: for loop + SMTP          │
│                                             │
│ Total time: 4 hours                         │
│ Money saved: $10,847/month                  │
│                                             │
│ ─────────────────────────────────────────── │
│                                             │
│ ## Comments (12)                            │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ This is the way. Just killed Intercom.  │ │
│ │ - sarah • 1 hour ago                    │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ Can you share the analytics query?     │ │
│ │ - mike • 45 min ago                     │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ Write a comment... (Markdown)          │ │
│ │                                        │ │
│ │                                        │ │
│ └─────────────────────────────────────────┘ │
│ [──── Post Comment ────]                    │
│                                             │
└─────────────────────────────────────────────┘
```

#### Create Thread (/threads/new)
```
┌─────────────────────────────────────────────┐
│ [Logo] [Threads] [Classroom] [Calendar] [X] │
├─────────────────────────────────────────────┤
│                                             │
│ ← Back to threads                           │
│                                             │
│ ## New Thread                               │
│                                             │
│ Category:                                   │
│ [General ▼]                                 │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ Thread title...                        │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ Write your post... (Markdown)          │ │
│ │                                        │ │
│ │                                        │ │
│ │                                        │ │
│ │                                        │ │
│ │                                        │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ [──── Create Thread ────]                   │
│                                             │
└─────────────────────────────────────────────┘
```

### Classroom Interface

#### Course List (/classroom)
```
┌─────────────────────────────────────────────┐
│ [Logo] [Threads] [Classroom] [Calendar] [X] │
├─────────────────────────────────────────────┤
│                                             │
│ ## Classroom                                │
│                                             │
│ Learn to destroy your SaaS dependencies.    │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ ### SaaS Destruction 101               │ │
│ │ 12 lessons • 3h 24m total              │ │
│ │                                        │ │
│ │ Learn the fundamentals of replacing    │ │
│ │ expensive SaaS with simple code.       │ │
│ │                                        │ │
│ │ Progress: ████████░░ 80%               │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ ### Advanced Patterns                  │ │
│ │ 8 lessons • 2h 15m total               │ │
│ │                                        │ │
│ │ Complex replacements for enterprise    │ │
│ │ software. Real production examples.    │ │
│ │                                        │ │
│ │ Progress: ██░░░░░░░░ 20%               │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ ### Quick Wins                         │ │
│ │ 5 lessons • 45m total                  │ │
│ │                                        │ │
│ │ 5 tools you can replace today.         │ │
│ │ Under 50 lines of code each.           │ │
│ │                                        │ │
│ │ Progress: Not started                  │ │
│ └─────────────────────────────────────────┘ │
│                                             │
└─────────────────────────────────────────────┘
```

#### Lesson View (/classroom/[courseId]/[lessonId])
```
┌─────────────────────────────────────────────┐
│ [Logo] [Threads] [Classroom] [Calendar] [X] │
├─────────────────────────────────────────────┤
│                                             │
│ ← Back to SaaS Destruction 101              │
│                                             │
│ Lesson 3 of 12                              │
│                                             │
│ ## Replacing Intercom with 50 Lines         │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │                                        │ │
│ │         [Wistia Video Embed]           │ │
│ │                                        │ │
│ │                                        │ │
│ │                                        │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ [← Previous] [Mark Complete] [Next →]       │
│                                             │
└─────────────────────────────────────────────┘
```

### Calendar Interface

#### Calendar View (/calendar)
```
┌─────────────────────────────────────────────┐
│ [Logo] [Threads] [Classroom] [Calendar] [X] │
├─────────────────────────────────────────────┤
│                                             │
│ ## Office Hours                             │
│                                             │
│ Live sessions every week. No recordings.    │
│ Show up or miss out.                        │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ ### Next Session                       │ │
│ │                                        │ │
│ │ Build Review                           │ │
│ │ Tuesday, 10 AM PST                     │ │
│ │                                        │ │
│ │ Starting in: 2d 14h 32m                │ │
│ │                                        │ │
│ │ [Session starts at 10 AM PST]          │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ### Weekly Schedule                         │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ Tuesday 10 AM PST                      │ │
│ │ Build Review                           │ │
│ │ Show what you built. Get feedback.     │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ Thursday 10 AM PST                     │ │
│ │ Open Office Hours                      │ │
│ │ Get unstuck. Ask anything.             │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ All times in PST. Figure out your timezone. │
│                                             │
└─────────────────────────────────────────────┘
```

---

## Marketing Pages Wireframes

### Landing Page (/)
```
┌─────────────────────────────────────────────┐
│               Build What You Need            │
│                                             │
│ ─────────────────────────────────────────── │
│                                             │
│          They charge $419/month             │
│             for a forum.                    │
│                                             │
│         I built this in 4 hours.            │
│                                             │
│      Join 847 builders destroying SaaS      │
│                                             │
│         [── Start Building →──]             │
│                                             │
│ ─────────────────────────────────────────── │
│                                             │
│         ## The $50B SaaS Scam               │
│                                             │
│   You're paying $419/month for Circle.      │
│   $299/month for ConvertKit.                │
│   $149/month for Calendly.                  │
│   $99/month for TypeForm.                   │
│                                             │
│   For what? A database and some HTML.       │
│                                             │
│         [── See The Proof →──]              │
│                                             │
│ ─────────────────────────────────────────── │
│                                             │
│      ## This Platform: Built in 4 Hours     │
│                                             │
│         ┌─────────────────────┐             │
│         │   [YouTube Embed]   │             │
│         │  Watch me build it  │             │
│         └─────────────────────┘             │
│                                             │
│ ─────────────────────────────────────────── │
│                                             │
│            ## $97 vs $10,000+               │
│                                             │
│         ̶$̶4̶1̶9̶/̶m̶o̶n̶t̶h̶ → $97/month          │
│                                             │
│      First 1000 members lock this price     │
│            Members: 847/1000                │
│                                             │
│         [── Join The Revolution ──]         │
│                                             │
│ ─────────────────────────────────────────── │
│                                             │
│         ## What Members Built               │
│                                             │
│   "Replaced $8k of SaaS in one weekend"     │
│   - Sarah, killed 12 tools                  │
│                                             │
│   "My SaaS bill went from $10k to $400"     │
│   - Mike, built his own stack               │
│                                             │
│   "Best $97 I spend every month"            │
│   - Lisa, saved $45k this year              │
│                                             │
│ ─────────────────────────────────────────── │
│                                             │
│          Total SaaS Killed: $2.4M           │
│          Money Saved: $847,293/mo           │
│                                             │
│         [── Start Saving Now ──]            │
│                                             │
└─────────────────────────────────────────────┘
```

### Sales Page (/join)
```
┌─────────────────────────────────────────────┐
│               Build What You Need            │
│                                             │
│ ─────────────────────────────────────────── │
│                                             │
│        ## Your SaaS Invoice is a Lie        │
│                                             │
│         ┌─────────────────────┐             │
│         │ [SaaS Invoice Image]│             │
│         │   Total: $10,847    │             │
│         └─────────────────────┘             │
│                                             │
│   37 different tools. $130k per year.       │
│   For features you'll never use.            │
│                                             │
│ ─────────────────────────────────────────── │
│                                             │
│          ## The Simple Solution             │
│                                             │
│   Stop renting software. Start building.    │
│                                             │
│   • Threads: Where builders share wins      │
│   • Classroom: How to replace any SaaS      │  
│   • Calendar: Live help twice a week        │
│                                             │
│   That's it. No gamification. No BS.        │
│                                             │
│ ─────────────────────────────────────────── │
│                                             │
│            ## Member Results                │
│                                             │
│   Week 1: Kill your first SaaS              │
│   Week 2: Build the replacement             │
│   Week 3: Save thousands                    │
│   Week 4: Help others do the same           │
│                                             │
│   Average member saves $3k/month            │
│                                             │
│ ─────────────────────────────────────────── │
│                                             │
│              ## The Price                   │
│                                             │
│   Community platforms: $419/month           │
│   Course platforms: $299/month              │
│   Forum software: $199/month                │
│                                             │
│   Build What You Need: $97/month            │
│                                             │
│   First 1000 members only.                  │
│   Price doubles at 1001.                    │
│                                             │
│         [── Secure Your Spot ──]            │
│                                             │
│ ─────────────────────────────────────────── │
│                                             │
│           ## The Guarantee                  │
│                                             │
│   Cancel anytime. No questions.             │
│   No 30-day notice. No retention team.      │
│   Just an unsubscribe button.               │
│                                             │
│   Because we're not SaaS parasites.         │
│                                             │
│         [── Join Now ──]                    │
│                                             │
└─────────────────────────────────────────────┘
```

---

## Component Hierarchy (shadcn/ui)

### Base Components
- `Button` - Primary CTAs, minimal variants
- `Input` - Text inputs with no fancy styling
- `Textarea` - For markdown content
- `Card` - Thread/course containers
- `Badge` - Category indicators
- `Select` - Category selection

### Custom Components
```typescript
// Navigation
<NavBar />

// Threads
<ThreadList />
<ThreadCard />
<ThreadDetail />
<CommentList />
<CommentForm />

// Classroom  
<CourseList />
<CourseCard />
<VideoPlayer />
<LessonNav />

// Calendar
<SessionCard />
<CountdownTimer />

// Marketing
<HeroSection />
<SocialProof />
<PricingCard />
```

### Design Tokens
```css
/* Colors */
--background: white
--foreground: black
--muted: #666
--border: #eee

/* Spacing */
--space-xs: 4px
--space-sm: 8px
--space-md: 16px
--space-lg: 24px
--space-xl: 32px

/* Typography */
--font-sans: system-ui
--text-sm: 14px
--text-base: 16px
--text-lg: 18px
--text-xl: 24px
--text-2xl: 32px

/* Layout */
--max-width: 800px
--nav-height: 48px
```

---

## Mobile Adaptations

### Responsive Patterns
- Stack navigation horizontally (scrollable)
- Full-width cards and forms
- Larger touch targets (44px minimum)
- No hover states, only active states
- Bottom-sheet pattern for forms

### Performance Considerations
- Lazy load video embeds
- Virtualize long thread lists
- Progressive image loading
- Minimal JavaScript bundle
- Service worker for offline thread reading

---

## Accessibility Requirements
- Semantic HTML throughout
- ARIA labels for interactive elements
- Keyboard navigation support
- Focus indicators
- Screen reader announcements
- Contrast ratio 7:1 minimum

---

## Additional Features Implemented

### User Profiles
- `/profile/[username]` - User profile page with stats and recent threads
- `/profile/edit` - Edit profile page for updating user information
- Profile links throughout the app (in threads, comments, navigation)
- User stats: total saved, threads count, join date

### Rich Text Editor
- Custom markdown editor component with toolbar
- Live preview mode toggle
- Formatting buttons: Bold, Italic, Link, Code, Quote, List
- Integrated into thread creation and comment forms
- Simple markdown rendering for display

### Edit/Delete Functionality
- Thread authors can edit/delete their threads
- Comment authors can edit/delete their comments
- Inline editing with save/cancel options
- Edit/Delete buttons with icon indicators
- Dropdown menu support for actions

## Next Steps
1. ~~Set up Next.js project with shadcn/ui~~ ✅
2. ~~Create component library based on wireframes~~ ✅
3. ~~Implement responsive layouts~~ ✅
4. ~~Build reusable components~~ ✅
5. Connect to Supabase backend (Phase 3)