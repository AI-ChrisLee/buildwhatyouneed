# Disable Email Confirmation - Setup Guide

## Steps to Disable Email Confirmation

### 1. Update Supabase Dashboard Settings

1. Go to your Supabase Dashboard
2. Navigate to **Authentication → Settings**
3. Under **Auth Providers** → **Email**
4. **DISABLE** the "Confirm email" toggle
5. Click **Save**

### 2. Run SQL to Confirm Existing Users

Run this SQL in Supabase SQL Editor:
```sql
-- Confirm all existing unconfirmed users
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL;
```

### 3. Update Environment Variable (if needed)

Make sure your production environment has:
```env
NEXT_PUBLIC_BASE_URL=https://aichrislee.com
```

## How It Works Now

1. User signs up → Account created immediately
2. User is auto-signed in after signup
3. User redirected to /payment page
4. No email confirmation needed
5. User can access /payment only until they pay

## Testing

1. Try signing up with a new email
2. Should redirect directly to /payment
3. No confirmation email sent
4. User can immediately access /payment page

## Troubleshooting

If users still get redirected to home (/):
- Check middleware is allowing /payment for authenticated users
- Verify Supabase email confirmation is disabled
- Check browser console for errors