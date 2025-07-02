# Stripe Webhook Setup

## Production Webhook Configuration

1. Go to Stripe Dashboard > Developers > Webhooks
2. Click "Add endpoint"
3. Enter the following details:

**Endpoint URL:** `https://aichrislee.com/api/stripe/webhook`

**Events to listen for:**
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

4. After creating the webhook, copy the webhook signing secret
5. Update your production environment variables with the new webhook secret:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_YOUR_PRODUCTION_SECRET_HERE
   ```

## Testing Locally

For local development, use Stripe CLI:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to local endpoint
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Copy the webhook signing secret shown and update .env.local
STRIPE_WEBHOOK_SECRET=whsec_test_YOUR_LOCAL_SECRET_HERE
```

## Verifying Webhook Setup

Run the test script to verify your webhook configuration:

```bash
node test-webhook.js
```

## Common Issues and Solutions

### 307 Redirect Error
- **Cause:** Middleware was intercepting API routes
- **Solution:** Added check to skip middleware for `/api/` routes

### 406 Not Acceptable Error
- **Cause:** Using `.single()` when no subscription exists
- **Solution:** Changed to `.maybeSingle()` which returns null instead of error

### Webhook Not Processing
- **Cause:** Wrong webhook secret or URL
- **Solution:** Verify webhook URL and secret in Stripe dashboard

### Payment Redirect Loop
- **Cause:** Success URL redirecting back to payment page
- **Solution:** Ensure subscription is created before redirect completes