# Stripe Live Test Verification Checklist

## During the Test Purchase:

1. **On Your Website:**
   - [ ] "Get Free Template" button works
   - [ ] Signup modal appears correctly
   - [ ] After signup, redirects to payment page
   - [ ] Stripe Checkout loads with correct price ($97/month)
   - [ ] Payment form accepts card details
   - [ ] After payment, redirects to success page
   - [ ] User can access Threads and Calendar (paid features)

2. **In Stripe Dashboard (Live Mode):**
   - [ ] Go to https://dashboard.stripe.com
   - [ ] Switch to "Live" mode (top right toggle)
   - [ ] Check Payments → See your $97 payment
   - [ ] Check Customers → See new customer created
   - [ ] Check Subscriptions → See active subscription
   - [ ] Check Webhooks → Verify webhook was delivered (200 status)

3. **In Supabase Dashboard:**
   ```sql
   -- Run these queries to verify
   -- Check user was upgraded
   SELECT id, email, membership_tier, created_at 
   FROM users 
   WHERE email = 'your-test-email@example.com';

   -- Check subscription was created
   SELECT * FROM stripe_subscriptions 
   WHERE user_id = '[user-id-from-above]';
   ```

4. **Email Verification:**
   - [ ] Check if confirmation email was sent
   - [ ] Check spam folder if not in inbox

## After Successful Test:

### To Get Your Money Back:
1. Go to Stripe Dashboard
2. Find the payment in Payments section
3. Click on it → Click "Refund"
4. Full refund will process
5. The subscription will automatically cancel

## If Something Goes Wrong:

### Common Issues:
1. **Payment succeeds but user not upgraded:**
   - Check webhook logs in Stripe
   - Verify webhook secret is correct in Vercel
   - Check Vercel function logs for errors

2. **Webhook not firing:**
   - Verify webhook URL: `https://www.aichrislee.com/api/stripe/webhook`
   - Check webhook signing secret matches

3. **User can't access paid content:**
   - Check database - is membership_tier = 'paid'?
   - Check middleware protection logic

## Emergency Actions:
If critical issues:
1. Switch back to test keys immediately in Vercel
2. Debug the issue
3. Fix and test with test keys first
4. Switch back to live when confident

Remember: This $97 test payment is an investment in making sure your customers have a smooth experience!