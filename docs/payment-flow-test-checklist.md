# Payment Flow Test Checklist

## ✅ Components Implemented

### 1. **Webhook Handler** (`/src/app/api/stripe/webhook/route.ts`)
- ✅ Handles `checkout.session.completed`
- ✅ Handles `payment_intent.succeeded` 
- ✅ Handles `customer.subscription.created`
- ✅ Handles `customer.subscription.updated`
- ✅ Handles `customer.subscription.deleted` (reverts to free tier)
- ✅ Updates membership_tier on all relevant events
- ✅ Updates lead status to 'member'

### 2. **Payment Endpoints**
- ✅ `/api/stripe/create-subscription` - Original subscription creation
- ✅ `/api/stripe/create-payment` - Simplified payment flow (fallback)
- ✅ `/api/stripe/webhook` - Webhook handler

### 3. **Middleware** (`/src/middleware.ts`)
- ✅ Checks membership_tier field
- ✅ Allows 'paid' tier users to access all routes
- ✅ Allows 'free' tier users to access /classroom only
- ✅ Redirects based on user tier

### 4. **UI Components**
- ✅ `PaymentModal` - Handles card input and payment
- ✅ `AccessDeniedModal` - Shows upgrade prompt
- ✅ `CourseCard` - Shows lock for premium courses
- ✅ `CommunityBadge` - Shows correct CTA based on tier

### 5. **Access Control**
- ✅ `useMembership` hook checks membership_tier
- ✅ Course access validation in `/lib/course-access.ts`
- ✅ Protected navbar checks subscription status

## 📋 Test Flow

### 1. **Free User Signup**
1. Sign up new user → Should get `membership_tier: 'free'`
2. Access /classroom → ✅ Should work
3. Access /threads → ❌ Should redirect to home
4. Click locked course → Should show payment modal

### 2. **Payment Process**
1. Enter test card: `4242 4242 4242 4242`
2. Submit payment
3. Check console for:
   - Payment intent creation
   - Webhook events firing
   - Database updates

### 3. **Post-Payment Verification**
After successful payment, verify:

#### Database Changes:
```sql
-- Check user tier
SELECT id, email, membership_tier, tier_updated_at 
FROM users 
WHERE email = 'your-test@email.com';

-- Check subscription
SELECT * FROM stripe_subscriptions 
WHERE user_id = 'user-id-here';

-- Check lead status
SELECT * FROM leads 
WHERE email = 'your-test@email.com';
```

#### Access Changes:
- ✅ Can access /threads
- ✅ Can access /calendar  
- ✅ Can access all courses
- ✅ Community badge shows "Member" status
- ✅ No payment modals appear

### 4. **Subscription Cancellation**
1. Cancel subscription in Stripe dashboard
2. Webhook should fire and:
   - Set subscription status to 'canceled'
   - Revert membership_tier to 'free'
   - Restrict access to premium content

## 🐛 Common Issues & Solutions

### Issue 1: "Failed to get payment client secret"
**Cause**: Invalid Stripe price ID or mismatched API keys
**Solution**: 
- Verify STRIPE_PRICE_ID in .env.local
- Ensure using test keys consistently
- Create new price in Stripe dashboard

### Issue 2: Webhook not firing
**Cause**: Webhook endpoint not configured in Stripe
**Solution**:
1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://yourdomain.com/api/stripe/webhook`
3. Select events: All subscription and payment events
4. Copy webhook secret to STRIPE_WEBHOOK_SECRET

### Issue 3: User still sees payment modal after paying
**Cause**: Membership tier not updated properly
**Solution**: Check webhook logs and database updates

## 🧪 Test Cards

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires Auth**: `4000 0025 0000 3155`

## 📝 Email Notification (Not Implemented)
The checklist mentions sending upgrade confirmation email, but this is not yet implemented. To add this:

1. Set up email service (Resend, SendGrid, etc.)
2. Add email sending in webhook handler after successful payment
3. Create email templates for:
   - Welcome to paid membership
   - Subscription cancelled
   - Payment failed

## ✅ Final Verification
Run through this complete flow:
1. [ ] Create new user (free tier)
2. [ ] Verify limited access
3. [ ] Make payment
4. [ ] Verify webhook fires
5. [ ] Verify database updates
6. [ ] Verify full access granted
7. [ ] Test course access
8. [ ] Test thread access