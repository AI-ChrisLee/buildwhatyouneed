# Enable Email Signups in Supabase

## Error: "Email signups are disabled"

This error occurs when the Email provider is disabled in Supabase.

## Fix Steps:

### 1. Enable Email Provider
1. Go to Supabase Dashboard
2. Navigate to **Authentication** → **Providers**
3. Find **Email** provider
4. Toggle it **ON** (should be green)
5. Click **Save**

### 2. Configure Auth Settings
1. Still in Authentication section
2. Go to **Settings** tab
3. Under **Auth settings**, ensure:
   - ✅ **Enable signup** = ON
   - ✅ **Enable email provider** = ON
   - ❌ **Enable email confirmations** = OFF (as requested)

### 3. Check Email Template Settings
1. Go to **Authentication** → **Email Templates**
2. Make sure templates are configured (even if not sending confirmation emails)

### 4. Verify in SQL Editor
Run this to check auth configuration:
```sql
-- Check if any users can sign up
SELECT 
  CASE 
    WHEN current_setting('auth.email_signup_disabled', true) = 'true' 
    THEN 'Email signup is DISABLED' 
    ELSE 'Email signup is ENABLED' 
  END as status;
```

## Common Issues:

### Still getting "Email signups are disabled"?
- Clear browser cache
- Check if you saved the settings in Supabase
- Verify environment variables are correct
- Make sure you're not in maintenance mode

### Want to allow signups for specific domains only?
In Supabase Dashboard → Authentication → Settings:
- Add allowed email domains (optional)
- Leave blank to allow all domains

## Testing:
After enabling, test at:
- https://aichrislee.com/signup
- Should create account and redirect to /payment