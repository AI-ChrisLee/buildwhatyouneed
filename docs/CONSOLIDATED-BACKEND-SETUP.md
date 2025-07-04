# 🚀 Complete Backend Setup Guide
## Build What You Need - All Backend Configuration

---

## 📋 Table of Contents
1. [Environment Setup](#1-environment-setup)
2. [Supabase Configuration](#2-supabase-configuration)
3. [Stripe Integration](#3-stripe-integration)
4. [API Routes](#4-api-routes)
5. [Authentication Flow](#5-authentication-flow)
6. [Production Checklist](#6-production-checklist)

---

## 1. Environment Setup

### Required Environment Variables
Create `.env.local` with these values:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_PRICE_ID=price_your_price_id

# App
NEXT_PUBLIC_BASE_URL=https://www.aichrislee.com
```

### Project Dependencies
```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.x",
    "@supabase/ssr": "^0.x",
    "stripe": "^14.x",
    "next": "14.x",
    "react": "^18.x"
  }
}
```

---

## 2. Supabase Configuration

### Client Setup
```typescript
// /src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### Server Setup
```typescript
// /src/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}
```

### Authentication Settings
In Supabase Dashboard:

1. **Email Templates** (Authentication → Email Templates)
   - Customize confirmation email (if enabled)
   - Update password reset template:
   ```
   Subject: Reset your password
   Body: Click here to reset your password: {{ .SiteURL }}/auth/callback?code={{ .Token }}&type=recovery
   ```

2. **URL Configuration** (Authentication → URL Configuration)
   - Site URL: `https://www.aichrislee.com`
   - Redirect URLs:
   ```
   https://www.aichrislee.com/auth/callback
   https://www.aichrislee.com/reset-password
   https://www.aichrislee.com/payment
   https://www.aichrislee.com/threads
   http://localhost:3000/* (for development)
   ```

3. **Auth Settings** (Authentication → Settings)
   - Disable email confirmations (for MVP)
   - Enable email/password auth
   - Disable all OAuth providers

---

## 3. Stripe Integration

### Stripe Configuration
```typescript
// /src/lib/stripe.ts
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

// Price configuration
export const MEMBERSHIP_PRICE_ID = process.env.STRIPE_PRICE_ID!
export const MEMBERSHIP_PRICE = 97 // $97/month
```

### Create Stripe Product
In Stripe Dashboard:
1. Create Product: "Build What You Need Membership"
2. Create Price: $97/month (recurring)
3. Copy Price ID to env variables

### Webhook Configuration
1. In Stripe Dashboard → Webhooks
2. Add endpoint: `https://www.aichrislee.com/api/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.deleted`
4. Copy webhook secret to env

---

## 4. API Routes

### Authentication Routes

#### Signup (`/api/auth/signup`)
```typescript
export async function POST(request: Request) {
  const { email, password, fullName } = await request.json()
  
  // 1. Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName }
    }
  })
  
  // 2. Save lead
  await supabase.from('leads').insert({
    email,
    name: fullName,
    stage: 'hot_lead',
    source: 'signup'
  })
  
  return Response.json({ 
    success: true,
    redirectTo: '/payment'
  })
}
```

#### Login (`/api/auth/login`)
```typescript
export async function POST(request: Request) {
  const { email, password } = await request.json()
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  
  if (data.user) {
    // Check subscription
    const { data: sub } = await supabase
      .from('stripe_subscriptions')
      .select('status')
      .eq('user_id', data.user.id)
      .eq('status', 'active')
      .single()
    
    return Response.json({
      success: true,
      redirectTo: sub ? '/threads' : '/payment'
    })
  }
}
```

### Stripe Routes

#### Checkout (`/api/stripe/checkout`)
```typescript
export async function POST(request: Request) {
  const { data: { user } } = await supabase.auth.getUser()
  
  // Get or create Stripe customer
  let customerId
  const { data: existing } = await supabase
    .from('stripe_customers')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single()
  
  if (existing) {
    customerId = existing.stripe_customer_id
  } else {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { user_id: user.id }
    })
    customerId = customer.id
    
    await supabase.from('stripe_customers').insert({
      user_id: user.id,
      stripe_customer_id: customerId
    })
  }
  
  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [{
      price: MEMBERSHIP_PRICE_ID,
      quantity: 1
    }],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment`,
    metadata: { user_id: user.id }
  })
  
  return Response.json({ url: session.url })
}
```

#### Webhook (`/api/stripe/webhook`)
```typescript
export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!
  
  const event = stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  )
  
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object
      
      // Save subscription
      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      )
      
      await supabase.from('stripe_subscriptions').insert({
        id: subscription.id,
        user_id: session.metadata!.user_id,
        status: subscription.status,
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
      })
      
      // Update lead stage
      await supabase
        .from('leads')
        .update({ 
          stage: 'member',
          member_at: new Date().toISOString()
        })
        .eq('user_id', session.metadata!.user_id)
      
      break
      
    case 'customer.subscription.deleted':
      const deletedSub = event.data.object
      
      await supabase
        .from('stripe_subscriptions')
        .update({ status: 'canceled' })
        .eq('id', deletedSub.id)
      
      await supabase
        .from('leads')
        .update({ 
          stage: 'cancelled',
          cancelled_at: new Date().toISOString()
        })
        .eq('user_id', deletedSub.metadata.user_id)
      
      break
  }
  
  return Response.json({ received: true })
}
```

### Community Routes

#### Threads (`/api/threads`)
```typescript
// GET - List threads
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  
  let query = supabase
    .from('threads')
    .select(`
      *,
      author:users!author_id(*),
      comments(count)
    `)
    .eq('is_deleted', false)
    .order('is_pinned', { ascending: false })
    .order('last_activity_at', { ascending: false })
  
  if (category && category !== 'all') {
    query = query.eq('category', category)
  }
  
  const { data, error } = await query
  return Response.json({ data })
}

// POST - Create thread
export async function POST(request: Request) {
  const { title, content, category } = await request.json()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data, error } = await supabase
    .from('threads')
    .insert({
      title,
      content,
      category,
      author_id: user.id
    })
    .select(`
      *,
      author:users!author_id(*)
    `)
    .single()
  
  return Response.json({ data })
}
```

---

## 5. Authentication Flow

### User Journey
```
1. Landing Page → Signup
   ↓
2. Create Supabase Auth User
   ↓
3. Create Lead (hot_lead stage)
   ↓
4. Redirect to Payment Page
   ↓
5. Stripe Checkout
   ↓
6. Webhook Updates:
   - Create subscription record
   - Update lead to 'member'
   ↓
7. Redirect to Threads
```

### Protected Routes Middleware
```typescript
// /src/middleware.ts
import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
        },
      },
    }
  )
  
  const { data: { user } } = await supabase.auth.getUser()
  
  // Protected routes
  if (request.nextUrl.pathname.startsWith('/threads') ||
      request.nextUrl.pathname.startsWith('/classroom') ||
      request.nextUrl.pathname.startsWith('/calendar')) {
    
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    // Check subscription
    const { data: subscription } = await supabase
      .from('stripe_subscriptions')
      .select('status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()
    
    if (!subscription) {
      return NextResponse.redirect(new URL('/payment', request.url))
    }
  }
  
  return response
}

export const config = {
  matcher: ['/threads/:path*', '/classroom/:path*', '/calendar/:path*']
}
```

---

## 6. Production Checklist

### Pre-Launch
- [ ] All environment variables set in Vercel
- [ ] Supabase RLS policies tested
- [ ] Stripe webhook endpoint verified
- [ ] Email templates configured
- [ ] Domain configured and SSL active

### Database
- [ ] Run all migrations in order
- [ ] Verify RLS policies work
- [ ] Test user registration flow
- [ ] Confirm Stripe integration

### Security
- [ ] API routes check authentication
- [ ] Service role key only used server-side
- [ ] CORS configured properly
- [ ] Rate limiting enabled (Vercel)

### Performance
- [ ] Database indexes created
- [ ] API responses < 200ms
- [ ] Static pages cached
- [ ] Images optimized

### Monitoring
- [ ] Vercel Analytics enabled
- [ ] Error tracking setup
- [ ] Stripe webhook logs monitored
- [ ] Database size tracked

---

## 🔧 Common Issues & Solutions

### Issue: "User not found after signup"
**Solution**: Check that auth trigger creates user record
```sql
-- Verify trigger exists
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
```

### Issue: "Stripe webhook 400 error"
**Solution**: 
1. Verify webhook secret matches
2. Check raw body parsing
3. Ensure no middleware modifies body

### Issue: "RLS policy denied"
**Solution**:
1. Check user is authenticated
2. Verify JWT contains expected claims
3. Test policies with Supabase dashboard

### Issue: "Subscription status not updating"
**Solution**:
1. Check webhook events in Stripe
2. Verify service role key has permissions
3. Check for unique constraint violations

---

## 📝 Testing Commands

### Local Development
```bash
# Start dev server
npm run dev

# Test Stripe webhooks locally
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Trigger test payment
stripe trigger payment_intent.succeeded
```

### Production Testing
```bash
# Check deployment
curl https://www.aichrislee.com/api/health

# Test auth endpoint
curl -X POST https://www.aichrislee.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass"}'
```

---

## 🚀 Deployment

### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
# ... etc
```

### Post-Deployment
1. Test full user flow
2. Verify Stripe webhooks working
3. Check all protected routes
4. Monitor error logs
5. Test on mobile devices

---

## 📊 Metrics to Track

### Conversion Funnel
- Landing → Signup: Target >20%
- Signup → Payment: Target >50%
- Payment → Active: Target >90%

### Platform Health
- API response time: <200ms
- Error rate: <1%
- Uptime: >99.9%

### Business Metrics
- MRR growth
- Churn rate: <5%
- Support tickets: <10/week

---

Remember: **Keep it simple. Ship it fast. Scale when needed.**