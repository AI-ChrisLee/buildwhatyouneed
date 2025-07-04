# Fix Confirmation Email Issue

## Problem
Confirmation emails aren't being sent after successful payments because Stripe webhooks aren't reaching the application.

## Root Cause
The webhook handler at `/api/stripe/webhook` has email sending logic implemented, but it's not receiving events from Stripe.

## Solutions

### For Local Development

1. **Install Stripe CLI** (if not already installed):
   ```bash
   brew install stripe/stripe-cli/stripe
   ```

2. **Login to Stripe**:
   ```bash
   stripe login
   ```

3. **Forward webhooks to your local server**:
   ```bash
   stripe listen --forward-to localhost:3001/api/stripe/webhook
   ```
   
   Note: Use port 3001 if that's what your app is running on.

4. **Update your `.env.local`** with the webhook secret shown by the CLI:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_[the_secret_from_cli]
   ```

5. **Test the webhook**:
   - Make a test payment
   - Check the terminal running `stripe listen` - you should see events
   - Check your app logs - you should see "=== Stripe Webhook Called ==="

### For Production (Vercel)

1. **Go to Stripe Dashboard** → Webhooks → Add endpoint

2. **Add your production webhook URL**:
   ```
   https://www.aichrislee.com/api/stripe/webhook
   ```

3. **Select these events**:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

4. **Copy the signing secret** and add to Vercel environment variables:
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add `STRIPE_WEBHOOK_SECRET` with the value from Stripe

5. **Verify Resend environment variables** are also set in Vercel:
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL` = `AI Chris Lee <chris@me.aichrislee.com>`
   - `RESEND_REPLY_TO_EMAIL` = `me@aichrislee.com`

## Testing Email Sending

### Manual Test (Admin Only)
```bash
# Test sending confirmation email
curl -X POST https://www.aichrislee.com/api/send-confirmation \
  -H "Content-Type: application/json" \
  -H "Cookie: [your-auth-cookie]" \
  -d '{"email": "test@example.com", "name": "Test User"}'
```

### Check Email Configuration
```bash
# Check if environment variables are set correctly
curl https://www.aichrislee.com/api/test-webhook
```

## Email Template Changes Applied

All email sender configurations have been updated from:
- `chris@me.aichrislee.com`

To:
- `AI Chris Lee <chris@me.aichrislee.com>`

This provides a better user experience by showing the sender name in email clients.

## Files Updated
1. `.env.local` - Updated RESEND_FROM_EMAIL
2. `.env.local.example` - Added Resend configuration example
3. `scripts/send-manual-confirmation.js` - Updated sender format
4. `scripts/test-upgrade-email.js` - Updated sender format

## Verification Steps

1. **Check webhook is receiving events**:
   - Look for "=== Stripe Webhook Called ===" in logs
   - Check Stripe Dashboard → Webhooks → Your endpoint → View attempts

2. **Check email is being sent**:
   - Look for "Upgrade confirmation email sent successfully" in logs
   - Check Resend dashboard for sent emails

3. **Common issues**:
   - Wrong webhook secret → "Invalid signature" error
   - Missing Resend API key → Email send will fail
   - Wrong sender email format → Resend may reject

## Quick Debug Commands

```bash
# Test if webhooks are working (local)
stripe trigger payment_intent.succeeded

# Check recent webhook attempts (requires Stripe CLI)
stripe events list --limit 5

# Send test email (requires node)
node scripts/test-upgrade-email.js
```