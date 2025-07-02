# Information Architecture

## Sitemap

```
/ (Landing Page - Public)
├── /join (Sales Page - Public)
├── /login (Authentication)
├── /signup (Registration)
└── /(app) (Protected Routes)
    ├── /threads (Thread List) ⚡ Default after login
    │   ├── /threads/new (Create Thread)
    │   └── /threads/[id] (Thread Detail)
    ├── /classroom (Course List)
    │   └── /classroom/[courseId]/[lessonId] (Lesson View)
    └── /calendar (Office Hours Schedule)

Admin Routes (Future):
└── /admin
    ├── /admin/courses (Course Management)
    └── /admin/announcements (Announcement Creation)
```

## URL Structure

### Public URLs
- `/` - Landing page with marketing content
- `/join` - Detailed sales page
- `/login` - Member login
- `/signup` - New member registration

### Protected URLs (Requires Authentication)
- `/threads` - Main community hub
- `/threads/announcements` - Announcements category
- `/threads/general` - General discussion
- `/threads/show-tell` - Show & Tell category
- `/threads/help` - Help category
- `/threads/[id]` - Individual thread view
- `/threads/new` - Create new thread
- `/classroom` - All courses
- `/classroom/[courseId]/[lessonId]` - Watch lesson
- `/calendar` - Office hours schedule

### URL Design Principles
- Clean, semantic URLs without query parameters
- Use hyphens for multi-word slugs
- Category filtering via path segments
- RESTful structure for resources

## User Flows

### 1. New Member Onboarding Flow
```
Opt in Page (/)
    ↓ [Name and email]
Sales Page (/join)
    ↓ [Secure Your Spot]
Signup (/signup)
    ↓ [Continue to Payment]
Stripe Payment (External)
    ↓ [Payment Success]
Threads (/threads) - First destination
```

### 2. Returning Member Flow
```
Login (/login)
    ↓ [Login]
Threads (/threads) - Default landing
    ↓ [Navigate freely]
Any protected page
```

### 3. Thread Interaction Flow
```
Threads List (/threads)
    ↓ [Click thread]
Thread Detail (/threads/[id])
    ↓ [Post Comment]
Thread Detail (Updated)
    OR
    ↓ [New Thread button]
Create Thread (/threads/new)
    ↓ [Create Thread]
New Thread Detail (/threads/[id])
```

### 4. Learning Flow
```
Classroom (/classroom)
    ↓ [Select course]
Course Lessons (/classroom/[courseId])
    ↓ [Watch lesson]
Lesson View (/classroom/[courseId]/[lessonId])
    ↓ [Mark Complete → Next]
Next Lesson
```

### 5. Office Hours Flow
```
Calendar (/calendar)
    ↓ [View schedule]
See countdown timer
    ↓ [When live]
Join link appears
    ↓ [Click link]
External video call
```

## Navigation Structure

### Primary Navigation (Logged In)
```
[Logo] [Threads] [Classroom] [Calendar] [Logout]
```

### Mobile Navigation
- Same items, horizontal scroll if needed
- No hamburger menu
- Logo always visible

### Navigation States
- **Active**: Black underline
- **Hover**: Gray background
- **Default**: No decoration

### Category Navigation (Threads)
```
[Announcements] [General] [Show & Tell] [Help]
```
- Horizontal pills
- Active category highlighted
- Scrollable on mobile

## Responsive Breakpoints

### Breakpoint Strategy
```css
/* Mobile First Approach */
/* Base: 320px - 768px */
/* Desktop: 769px+ */
```

### Mobile (320px - 768px)
- Single column layout
- Full-width cards
- Stacked navigation (horizontal scroll)
- Larger touch targets (44px minimum)
- Simplified tables → cards
- Bottom sheet for forms

### Desktop (769px+)
- Max content width: 800px
- Centered content
- Fixed navigation
- Side-by-side elements where beneficial
- Hover states enabled

### Specific Responsive Behaviors

#### Navigation
- **Mobile**: Horizontal scroll, fixed to top
- **Desktop**: Centered, no scroll needed

#### Thread List
- **Mobile**: Full-width cards, vertical stack
- **Desktop**: Contained width, comfortable reading

#### Forms
- **Mobile**: Full-width inputs, stacked labels
- **Desktop**: Contained width, inline where appropriate

#### Video Player
- **Mobile**: Full-width, 16:9 aspect ratio maintained
- **Desktop**: Max-width 800px, centered

#### Calendar
- **Mobile**: Stacked session cards
- **Desktop**: Same (no grid needed)

### Performance Considerations
- No layout shift between breakpoints
- CSS-only responsive (no JS)
- Images lazy-loaded at all sizes
- Minimal media queries

## Accessibility Paths

### Keyboard Navigation
```
Tab Order:
1. Skip to main content
2. Logo
3. Primary nav items
4. Main content interactive elements
5. Forms and buttons
```

### Screen Reader Landmarks
```html
<header> - Site header
<nav> - Primary navigation
<main> - Main content
<section> - Major content sections
<footer> - Site footer (if added)
```

### ARIA Labels
- Navigation: `aria-label="Primary navigation"`
- Categories: `aria-label="Thread categories"`
- Forms: Proper label associations
- Buttons: Descriptive text or aria-label

## Implementation Status

✅ **Completed**:
- Sitemap structure defined
- URL patterns implemented
- Navigation component built
- Basic responsive layout

🚧 **In Progress**:
- User flow refinements
- Mobile optimizations

📋 **Planned**:
- Admin routes
- Advanced filtering URLs
- Deep linking for video timestamps