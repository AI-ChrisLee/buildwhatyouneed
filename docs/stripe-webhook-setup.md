# Stripe Webhook Setup

## Issue
When users complete payment, their membership status is updated in Stripe but not always in Supabase. This is because the webhook needs to be properly configured.

## Solution

### For Local Development
1. Install Stripe CLI: `brew install stripe/stripe-cli/stripe`
2. Login to Stripe: `stripe login`
3. Forward webhooks to your local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
4. The CLI will show your webhook signing secret - update it in `.env.local`:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_YOUR_NEW_SECRET_HERE
   ```

### For Production
1. Go to Stripe Dashboard > Webhooks
2. Add endpoint: `https://yourdomain.com/api/stripe/webhook`
3. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy the signing secret and add to your production environment variables

## Current Workaround
The app currently saves subscription data directly in the API endpoint (`/api/stripe/create-subscription`). This works but webhooks are more reliable for handling all subscription events.

## Testing
After payment, check:
1. Stripe Dashboard - subscription should be active
2. Supabase - `stripe_subscriptions` table should have the subscription
3. User should see success message on `/about?success=true`