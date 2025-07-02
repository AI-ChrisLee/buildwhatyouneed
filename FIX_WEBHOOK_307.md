# URGENT: Fix Webhook 307 Redirect Error

## The Problem
Your webhook is failing because:
- Stripe is sending to: `https://aichrislee.com/api/stripe/webhook`
- Your site redirects to: `https://www.aichrislee.com/api/stripe/webhook`
- This causes a 307 redirect, and Stripe doesn't follow redirects

## The Solution

### Option 1: Update Stripe Webhook URL (Fastest Fix)
1. Go to [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks)
2. Find your webhook endpoint
3. Click on it and then click "Update endpoint"
4. Change the URL to: `https://www.aichrislee.com/api/stripe/webhook`
5. Save the changes
6. Test a payment again

### Option 2: Update Vercel Domain Settings
1. Go to your Vercel project settings
2. Under Domains, make `aichrislee.com` (without www) the primary domain
3. Remove any redirect from non-www to www
4. Keep the Stripe webhook URL as is

## Verify the Fix
After updating:
1. In Stripe Dashboard, go to your webhook
2. Click "Send test webhook"
3. Select `checkout.session.completed`
4. It should return 200 OK (not 307)

## Check Your Environment Variables
Make sure in Vercel:
```
NEXT_PUBLIC_BASE_URL=https://www.aichrislee.com
```

This ensures your success URLs also use the correct domain.