# Launch Checklist

## Before Going Live:

### 1. Vercel Deployment
- [ ] Check build succeeded on Vercel
- [ ] No build errors or warnings
- [ ] Preview deployment works correctly

### 2. Environment Variables (Vercel)
- [ ] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (live key)
- [ ] STRIPE_SECRET_KEY (live key)
- [ ] STRIPE_WEBHOOK_SECRET (live webhook secret)
- [ ] NEXT_PUBLIC_SUPABASE_URL
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
- [ ] SUPABASE_SERVICE_ROLE_KEY
- [ ] DATABASE_URL
- [ ] RESEND_API_KEY (if using email)

### 3. Stripe Setup
- [ ] Live mode activated
- [ ] Products created in live mode
- [ ] Prices set correctly ($97/month)
- [ ] Webhook endpoint added for production URL
- [ ] Webhook events selected (subscription events)

### 4. Domain Setup
- [ ] Custom domain connected to Vercel
- [ ] SSL certificate active
- [ ] www redirect configured

### 5. Database Checks
- [ ] All migrations run
- [ ] Admin user exists
- [ ] Test content created (courses, threads)

### 6. SEO/Meta
- [ ] Favicon appears correctly
- [ ] Meta descriptions show in view-source
- [ ] Social sharing preview works
- [ ] robots.txt accessible
- [ ] sitemap.xml accessible

### 7. Final Tests
- [ ] Homepage loads
- [ ] Free signup works
- [ ] Login works
- [ ] Payment modal appears
- [ ] All navigation links work

## After Going Live:

### 1. First Live Transaction Test
- [ ] Create test account with personal email
- [ ] Make real $97 payment
- [ ] Verify access granted
- [ ] Check Stripe dashboard
- [ ] Refund if needed

### 2. Monitor First 24 Hours
- [ ] Check Vercel logs regularly
- [ ] Monitor Stripe webhooks
- [ ] Watch for user reports
- [ ] Check email deliverability

### 3. Analytics Setup (Optional)
- [ ] Google Analytics
- [ ] Hotjar or similar
- [ ] Error tracking (Sentry)

## Emergency Contacts:
- Vercel Support: https://vercel.com/support
- Stripe Support: https://support.stripe.com
- Supabase Support: https://supabase.com/support

## Rollback Plan:
If critical issues arise:
1. Switch Stripe keys back to test mode
2. Put up maintenance message
3. Debug in test environment
4. Fix and redeploy
5. Switch back to live mode

Good luck with your launch! 🚀