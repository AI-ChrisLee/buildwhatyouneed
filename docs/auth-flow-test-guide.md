# Authentication Flow Test Guide

## Overview
This guide walks through testing the complete authentication flow for Build What You Need.

## Test Flow

### 1. Landing Page → Lead Capture
1. Go to `/join`
2. Enter email and name
3. Submit form
4. Should redirect to `/` (sales page)
5. Verify lead is created in database

### 2. Sales Page → Signup
1. From `/` click "Join Now" or similar CTA
2. Should go to `/signup`

### 3. Signup Flow
1. At `/signup` page:
   - Enter First Name: Test
   - Enter Last Name: User
   - Enter Email: test@example.com
   - Enter Password: test123
2. Click "SIGN UP"
3. Should redirect to `/payment`

### 4. Payment Page
1. At `/payment` page:
   - Should see $97/month plan selected
   - Annual plan should show "Coming Soon"
2. Click "JOIN $97/month"
3. Should redirect to Stripe checkout

### 5. Login Flow (No Subscription)
1. Go to `/login`
2. Enter credentials from signup
3. Click "LOG IN"
4. Should redirect to `/payment` (because no active subscription)

### 6. Login Flow (With Subscription)
After completing Stripe payment:
1. Go to `/login`
2. Enter credentials
3. Click "LOG IN"
4. Should redirect to `/threads` (default community page)

## Database Verification

### Check Users Table
```sql
SELECT * FROM users WHERE email = 'test@example.com';
```

### Check Leads Table
```sql
SELECT * FROM leads WHERE email = 'test@example.com';
```

### Check Stripe Subscriptions
```sql
SELECT * FROM stripe_subscriptions WHERE user_id = (
  SELECT id FROM users WHERE email = 'test@example.com'
);
```

## Expected Behavior

### Redirects
- **Not logged in**:
  - `/threads` → `/login`
  - `/classroom` → `/login`
  - `/about` → Accessible (public page)

- **Logged in, no subscription**:
  - `/login` → `/payment`
  - `/threads` → `/payment`

- **Logged in, with subscription**:
  - `/login` → `/threads`
  - `/payment` → `/threads`
  - All community pages accessible

### Error States
- Invalid credentials: Show error message
- Email already exists: Show error on signup
- Payment fails: Show error, stay on payment page

## Stripe Test Cards
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires authentication: `4000 0025 0000 3155`

Use any future date for expiry and any 3 digits for CVC.

## Cleanup Test Data
```sql
-- Delete test user and related data
DELETE FROM stripe_subscriptions WHERE user_id = (
  SELECT id FROM users WHERE email = 'test@example.com'
);
DELETE FROM leads WHERE email = 'test@example.com';
DELETE FROM users WHERE email = 'test@example.com';
DELETE FROM auth.users WHERE email = 'test@example.com';
```