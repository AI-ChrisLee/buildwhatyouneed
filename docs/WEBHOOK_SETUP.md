# Stripe Webhook Setup Guide

## Production Webhook Configuration

### ⚠️ IMPORTANT: Domain Redirect Issue
If your site redirects from `aichrislee.com` to `www.aichrislee.com` (or vice versa), you MUST use the final destination URL in your webhook configuration. Otherwise, Stripe will receive a 307 redirect and the webhook will fail.

### 1. Go to Stripe Dashboard
1. Login to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers** → **Webhooks**
3. Click **"Add endpoint"**

### 2. Configure Webhook Endpoint
- **Endpoint URL**: `https://www.aichrislee.com/api/stripe/webhook`
- **Description**: Production webhook for BuildWhatYouNeed
- **Important**: Use the exact domain that your site resolves to (with or without www)

### 3. Select Events to Listen For
Select these events:
- ✅ `checkout.session.completed`
- ✅ `customer.subscription.created`
- ✅ `customer.subscription.updated`
- ✅ `customer.subscription.deleted`

### 4. Copy Webhook Signing Secret
1. After creating the endpoint, click on it
2. Click **"Reveal"** under Signing secret
3. Copy the secret (starts with `whsec_`)
4. Update your production environment variable:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
   ```

### 5. Test the Webhook
1. In Stripe Dashboard, go to your webhook endpoint
2. Click **"Send test webhook"**
3. Select `checkout.session.completed`
4. Send test event
5. Check the response - should be 200 OK

## Troubleshooting

### 307 Redirect Error
- This happens when your domain redirects (e.g., from non-www to www)
- Make sure the webhook URL matches your actual domain:
  - If your site redirects to `www.aichrislee.com`, use `https://www.aichrislee.com/api/stripe/webhook`
  - If your site uses `aichrislee.com`, use `https://aichrislee.com/api/stripe/webhook`
- No trailing slash
- Using https:// not http://
- Check your Vercel domain settings to see which is the primary domain

### 406 Error from Supabase
- This is already fixed in the code
- Using `.maybeSingle()` instead of `.single()`

### Subscription Not Created
1. Check Stripe Dashboard → Logs
2. Look for webhook delivery attempts
3. Check the response body for errors
4. Verify the webhook secret matches

### Payment Loop Issue
- After payment, Stripe redirects to `/threads`
- If subscription isn't created fast enough, middleware redirects back to `/payment`
- The webhook should create the subscription immediately

## Local Testing with Stripe CLI

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Copy the webhook signing secret it gives you
# Update .env.local:
STRIPE_WEBHOOK_SECRET=whsec_test_secret_here

# In another terminal, trigger test events
stripe trigger checkout.session.completed
```

## Environment Variables Required

```env
# .env.local or production env
STRIPE_SECRET_KEY=sk_live_xxx  # or sk_test_xxx for testing
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_ID=price_xxx
NEXT_PUBLIC_BASE_URL=https://www.aichrislee.com  # Must match your actual domain
```