# Production Setup Checklist

## 1. Vercel Environment Variables

Go to your Vercel project settings and add these environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_PRICE_ID=your_stripe_price_id
NEXT_PUBLIC_BASE_URL=https://aichrislee.com
```

## 2. Supabase Configuration

### Add Your Domain to Allowed URLs
1. Go to Supabase Dashboard → Settings → API
2. Under "URL Configuration", add:
   - `https://aichrislee.com`
   - `https://*.vercel.app` (for preview deployments)
   - `http://localhost:3000` (already there)

### Enable Anonymous Sign-ins (if not already)
1. Go to Authentication → Settings
2. Make sure "Enable anonymous sign-ins" is OFF (we're not using it)

### Check RLS Policies
The leads table has admin-only access. For the landing page to work, we need to allow anonymous inserts.

## 3. Quick Fix for Leads Table Access

Run this in Supabase SQL Editor:

```sql
-- Allow anonymous users to insert leads (for landing page)
CREATE POLICY "Anyone can create leads" ON public.leads
  FOR INSERT WITH CHECK (true);
```

## 4. Debug the Issue

Add this temporary debug code to see what's happening:

```javascript
// In src/app/page.tsx, update the fetch to show errors:
const response = await fetch('/api/leads', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: formData.email,
    name: formData.name,
    source: 'landing_page',
  }),
})

if (!response.ok) {
  const error = await response.json()
  console.error('Lead API error:', error)
  alert('There was an error. Please try again.')
}
```

## 5. Test in Production

1. Open browser console (F12)
2. Go to https://aichrislee.com
3. Try the opt-in form
4. Check console for errors
5. Check Network tab for failed requests

## Common Issues and Solutions

### "Failed to fetch" Error
- Missing environment variables in Vercel
- Check Vercel logs: Project → Functions tab

### "Permission denied" Error
- RLS policy issue
- Run the SQL fix above

### CORS Error
- Domain not whitelisted in Supabase
- Add domain to URL configuration

### 500 Internal Server Error
- Check Vercel function logs
- Usually missing env variables

## Verify Everything Works

After fixing:
1. Test opt-in form → should redirect to /join
2. Check Supabase → Table Editor → leads table
3. New lead should appear with correct stage