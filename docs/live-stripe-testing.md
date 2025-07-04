# Live Stripe Testing Guide

## How to Safely Test Live Stripe Integration

### 1. Create a Test User Account
- Use a personal email (not your admin email)
- Sign up as a regular user

### 2. Make a Small Test Purchase
- Use your REAL credit card
- The charge will be REAL (you'll pay $97)
- This confirms the entire flow works

### 3. Verify Everything Works:
- [ ] Payment processes successfully
- [ ] User gets redirected to success page
- [ ] Webhook fires and updates user's membership_tier to 'paid'
- [ ] User can access paid content (Threads, Calendar)
- [ ] Confirmation email is sent
- [ ] Subscription appears in Stripe Dashboard

### 4. Refund the Test Payment
- Go to Stripe Dashboard → Payments
- Find your test payment
- Click "Refund" 
- The subscription will be cancelled automatically

### 5. Monitor for Issues:
- Check Vercel Functions logs for any errors
- Check Stripe webhook logs for successful delivery
- Verify database updates happened correctly

## What to Check in Each System:

### Stripe Dashboard (Live Mode):
- Payment appears in Payments section
- Customer is created
- Subscription is active
- Webhook shows as delivered (200 status)

### Supabase Database:
```sql
-- Check user's membership tier
SELECT id, email, membership_tier, created_at 
FROM users 
WHERE email = 'your-test-email@example.com';

-- Check subscription record
SELECT * FROM stripe_subscriptions 
WHERE user_id = 'user-id-from-above';

-- Check lead status
SELECT * FROM leads 
WHERE email = 'your-test-email@example.com';
```

### Vercel Logs:
- Go to Functions tab
- Check logs for `/api/stripe/webhook`
- Look for successful processing messages

## Common Issues to Watch For:

1. **Webhook not firing**: Check webhook URL and signing secret
2. **User not upgraded**: Check webhook processing logic
3. **No confirmation email**: Check email service integration
4. **Access still denied**: Check membership checking logic

## Emergency Rollback:
If something goes wrong:
1. Switch back to test keys in Vercel
2. Investigate the issue
3. Fix and test with test keys
4. Try live keys again

Remember: It's normal to be nervous about the first live transaction! Take your time and verify each step.