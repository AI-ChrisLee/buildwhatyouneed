# Testing Free Tier Upgrade Flow

## Test Scenarios

### 1. Free User Signup
1. Go to homepage
2. Click "Get Free Access" 
3. Create a new account
4. Verify:
   - User is redirected to /classroom
   - Can see the free course
   - Premium courses show lock icon
   - membership_tier = 'free' in database

### 2. Free to Paid Upgrade
1. As a free user, click on a locked premium course
2. Click "Upgrade to Premium" in the modal
3. Complete payment with test card: `4242 4242 4242 4242`
4. Verify:
   - Webhook updates membership_tier to 'paid'
   - User can now access all courses
   - Lock icons are removed
   - Navigation shows all features

### 3. Subscription Cancellation
1. Cancel subscription in Stripe Dashboard
2. Verify:
   - Webhook updates membership_tier back to 'free'
   - Premium courses show lock icon again
   - User retains access to free course only

## Database Queries for Verification

```sql
-- Check user's membership tier
SELECT id, email, membership_tier, tier_updated_at 
FROM users 
WHERE email = 'test@example.com';

-- Check subscription status
SELECT * FROM stripe_subscriptions 
WHERE user_id = (SELECT id FROM users WHERE email = 'test@example.com');

-- Check course access
SELECT c.title, c.is_free 
FROM courses c
WHERE c.is_free = true 
   OR EXISTS (
     SELECT 1 FROM users u 
     WHERE u.email = 'test@example.com' 
     AND (u.membership_tier = 'paid' OR u.is_admin = true)
   );
```

## Stripe Test Cards
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires auth: `4000 0025 0000 3155`