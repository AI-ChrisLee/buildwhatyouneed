# Community Platform UX Flow (UI-Only Implementation)

## Overview
This document outlines the UX flow and UI patterns for the Build What You Need (BWYN) community platform, focusing on creating an intuitive frontend experience without backend dependencies. All data will be mocked/static for now.

## UI-First Implementation Strategy

### Static Data Approach
- Use mock data files for all content
- Local state management (React useState/useReducer)
- LocalStorage for persistence simulation
- Static routing with Next.js

## Page Layouts & Components

### 1. Threads Page

#### Layout Structure
```
Header (Fixed)
├── Logo + Title
├── Search Bar
└── User Actions (Bell, Avatar)

Navigation Tabs
├── Threads (active)
├── Classroom
└── Calendar

Main Content Area
├── Page Title & Description
├── Create Post Trigger
├── Category Filter Pills
└── Thread List
    ├── Thread Card
    │   ├── Author Avatar
    │   ├── Author Name & Time
    │   ├── Thread Title
    │   ├── Preview Text
    │   ├── Tags
    │   └── Engagement Stats (Likes, Replies)
    └── Load More Button
```

#### Key UI States
- **Default**: Show all threads
- **Filtered**: Show by category
- **Empty**: "No threads found" message
- **Loading**: Skeleton screens (simulated)
- **Create Mode**: Modal/drawer overlay

#### Interactive Elements
1. **Create Post Area**
   - Clickable div that looks like input
   - Opens modal with full composer
   - Mock save to localStorage

2. **Category Pills**
   - Toggle active state
   - Filter displayed threads
   - Smooth transitions

3. **Thread Cards**
   - Hover state with shadow
   - Click to open detail view
   - Like button (toggle state)

### 2. Classroom Page

#### Layout Structure
```
Header (Same as Threads)

Navigation Tabs
├── Threads
├── Classroom (active)
└── Calendar

Main Content Area
├── Page Title & Description
├── Course Categories (Tabs/Pills)
├── Course Grid
│   ├── Course Card
│   │   ├── Thumbnail
│   │   ├── Title
│   │   ├── Instructor
│   │   ├── Duration
│   │   ├── Progress Bar
│   │   └── Start/Continue Button
│   └── Course Card (repeated)
└── Pagination
```

#### Course Detail View (Modal/Page)
```
Course Header
├── Back Button
├── Course Title
├── Instructor Info
└── Progress Overview

Video/Content Area
├── Video Player (YouTube embed)
├── Chapter Navigation
└── Transcript/Notes

Sidebar
├── Course Outline
├── Resources
└── Discussion
```

#### UI Components
1. **Course Cards**
   - Image placeholder
   - Progress indicator (static %)
   - Hover effects
   - Status badges (New, In Progress, Completed)

2. **Video Player**
   - YouTube/Vimeo embeds
   - Custom controls overlay
   - Chapter markers

3. **Course Navigation**
   - Accordion-style chapters
   - Check marks for completed
   - Current lesson highlight

### 3. Calendar Page

#### Layout Structure
```
Header (Same as above)

Navigation Tabs
├── Threads
├── Classroom
└── Calendar (active)

Main Content Area
├── View Toggle (Month/Week/List)
├── Calendar Header
│   ├── Previous/Next Navigation
│   └── Current Month/Week Display
├── Calendar Grid
│   ├── Day Headers
│   └── Day Cells
│       ├── Date Number
│       └── Event Dots/Previews
└── Upcoming Events Sidebar
    ├── Event Card
    │   ├── Date/Time
    │   ├── Event Title
    │   ├── Type Badge
    │   └── RSVP Button
    └── Event Card (repeated)
```

#### Event Modal
```
Event Details
├── Event Title
├── Date & Time
├── Description
├── Event Type/Category
├── Host Information
└── Action Buttons
    ├── Add to Calendar
    ├── Set Reminder
    └── Close
```

## Common UI Patterns

### 1. Modal System
```jsx
// Reusable modal component
<Modal>
  <ModalHeader>
    <ModalTitle />
    <ModalClose />
  </ModalHeader>
  <ModalContent>
    {/* Dynamic content */}
  </ModalContent>
  <ModalFooter>
    <Button variant="ghost">Cancel</Button>
    <Button variant="primary">Action</Button>
  </ModalFooter>
</Modal>
```

### 2. Card Components
```jsx
// Thread Card Pattern
<Card interactive>
  <CardHeader>
    <Avatar />
    <div>
      <AuthorName />
      <TimeStamp />
    </div>
  </CardHeader>
  <CardContent>
    <Title />
    <Preview />
  </CardContent>
  <CardFooter>
    <Tags />
    <Stats />
  </CardFooter>
</Card>
```

### 3. Empty States
- Friendly illustrations
- Clear messaging
- Action buttons
- Consistent styling

### 4. Loading States
- Skeleton screens
- Shimmer effects
- Smooth transitions
- Preserve layout

## UI State Management (No Backend)

### LocalStorage Structure
```javascript
// Mock data persistence
localStorage.setItem('bwyn_threads', JSON.stringify([...]));
localStorage.setItem('bwyn_user_prefs', JSON.stringify({...}));
localStorage.setItem('bwyn_draft_posts', JSON.stringify([...]));
```

### React State Patterns
```javascript
// Global UI state
const [uiState, setUiState] = useState({
  activeModal: null,
  selectedThread: null,
  filters: {
    category: 'all',
    sortBy: 'recent'
  }
});

// Mock data state
const [threads, setThreads] = useState(mockThreads);
const [courses, setCourses] = useState(mockCourses);
const [events, setEvents] = useState(mockEvents);
```

## Responsive Design Breakpoints

### Mobile (< 768px)
- Single column layouts
- Bottom navigation bar
- Full-screen modals
- Swipe gestures
- Larger touch targets

### Tablet (768px - 1024px)
- Two column layouts where appropriate
- Side navigation drawer
- Floating action buttons
- Modal dialogs (not full screen)

### Desktop (> 1024px)
- Multi-column layouts
- Fixed sidebar navigation
- Hover states
- Keyboard shortcuts
- Advanced filtering options

## CSS/Styling Approach

/* Spacing */
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;

/* Border Radius */
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
```

### Component Styling
- Use Tailwind CSS classes
- Component-specific CSS modules for complex styles
- Consistent hover/focus states
- Smooth transitions (200ms default)

## Implementation Priorities (UI Only)

### Phase 1: Foundation
1. **Navigation Header** ✓
2. **Page Layouts**
3. **Basic Thread List**
4. **Modal System**
5. **Card Components**

### Phase 2: Interactivity
1. **Create Thread Modal**
2. **Thread Detail View**
3. **Filter/Sort UI**
4. **Course Grid**
5. **Calendar View**

### Phase 3: Polish
1. **Loading States**
2. **Empty States**
3. **Animations**
4. **Mobile Optimization**
5. **Dark Mode**

## Mock Data Structure

### Threads
```javascript
const mockThreads = [
  {
    id: '1',
    title: 'Welcome to BWYN!',
    content: 'This is where builders connect...',
    author: {
      name: 'John Doe',
      avatar: '/avatars/1.jpg'
    },
    category: 'announcements',
    tags: ['welcome', 'community'],
    likes: 42,
    replies: 7,
    createdAt: '2024-01-01T10:00:00Z'
  }
];
```

### Courses
```javascript
const mockCourses = [
  {
    id: '1',
    title: 'Introduction to Next.js',
    instructor: 'Jane Smith',
    thumbnail: '/course-thumbs/nextjs.jpg',
    duration: '2h 30m',
    modules: 8,
    progress: 60,
    category: 'development'
  }
];
```

### Events
```javascript
const mockEvents = [
  {
    id: '1',
    title: 'Weekly Builder Meetup',
    date: '2024-01-15T18:00:00Z',
    type: 'meetup',
    description: 'Connect with fellow builders',
    attendees: 24
  }
];
```

## Next Steps

1. **Create Component Library**
   - Build reusable UI components
   - Document with Storybook (optional)
   - Establish naming conventions

2. **Implement Page Layouts**
   - Start with Threads page
   - Add Classroom layout
   - Build Calendar view

3. **Add Interactivity**
   - Modal interactions
   - State management
   - LocalStorage integration

4. **Polish & Optimize**
   - Performance optimization
   - Accessibility improvements
   - Cross-browser testing

---

This UI-first approach allows us to build and test the entire user experience without backend dependencies, making it easier to iterate on design and gather feedback.