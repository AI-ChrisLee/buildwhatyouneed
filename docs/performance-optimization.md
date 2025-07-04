# Performance Optimization Plan

## Current Status

### ✅ Good News
- No large images to optimize (using text/SVG icons)
- Minimal dependencies (29 production deps)
- Clean file structure

### ⚠️ Areas for Improvement
- Bundle size: ~400KB estimated (target: <200KB)
- No code splitting implemented
- No lazy loading for components

## Optimization Tasks

### 1. Code Splitting Implementation

#### High Priority Pages to Split
- `/classroom` - Video player components
- `/calendar` - Calendar components  
- `/admin/*` - Admin-only features

#### Components to Lazy Load
```typescript
// Example implementation
const PaymentModal = dynamic(() => import('@/components/payment-modal'), {
  loading: () => <div>Loading...</div>,
  ssr: false
})

const VideoPlayer = dynamic(() => import('@/components/video-player'), {
  loading: () => <div>Loading video...</div>,
  ssr: false
})
```

### 2. API Performance

#### Current Endpoints to Optimize
- `/api/threads` - Add pagination
- `/api/comments` - Implement cursor-based pagination
- `/api/courses` - Cache course data

#### Database Optimizations
- Add indexes for frequently queried fields
- Implement connection pooling
- Use Supabase Edge Functions for complex queries

### 3. Next.js Optimizations

#### Image Component Usage
```typescript
import Image from 'next/image'

// Replace <img> with <Image>
<Image
  src="/logo.png"
  alt="Logo"
  width={100}
  height={100}
  priority // for above-fold images
/>
```

#### Font Optimization
```typescript
// Use next/font for optimal loading
import { Inter } from 'next/font/google'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
})
```

### 4. Bundle Size Reduction

#### Libraries to Review
- `stripe` - Load only on payment pages
- `@supabase/supabase-js` - Tree-shake unused features
- UI components - Import only what's needed

#### Dynamic Imports Example
```typescript
// Before
import { loadStripe } from '@stripe/stripe-js'

// After
const loadStripe = () => import('@stripe/stripe-js').then(m => m.loadStripe)
```

### 5. Loading States

#### Implement Suspense Boundaries
```typescript
<Suspense fallback={<ThreadsSkeleton />}>
  <ThreadsList />
</Suspense>
```

#### Skeleton Components
- ThreadsSkeleton
- CourseCardSkeleton
- CommentSkeleton

### 6. Caching Strategy

#### Static Generation
- `/about` - Static page
- `/terms` - Static page
- `/privacy` - Static page

#### ISR (Incremental Static Regeneration)
- `/` - Landing page (revalidate: 3600)

#### Client-Side Caching
- SWR for data fetching
- LocalStorage for user preferences
- SessionStorage for temporary data

## Performance Metrics

### Current (Estimated)
- First Contentful Paint: ~2.5s
- Time to Interactive: ~3.5s
- Bundle Size: ~400KB

### Target
- First Contentful Paint: <1.5s
- Time to Interactive: <2.5s
- Bundle Size: <200KB

## Implementation Priority

1. **Immediate** (Do Now)
   - Add dynamic imports for modals
   - Implement loading skeletons
   - Add pagination to threads

2. **Short Term** (This Week)
   - Code split admin routes
   - Optimize API queries
   - Add caching headers

3. **Long Term** (Next Month)
   - Implement CDN
   - Add service worker
   - Full bundle optimization

## Testing Plan

1. Use Lighthouse for metrics
2. Test on 3G connection
3. Monitor real user metrics
4. A/B test optimizations

## Remember

> "Build What You Need" - Don't over-optimize. Focus on real user impact, not perfect scores.