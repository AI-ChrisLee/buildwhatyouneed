# Supabase Database Setup

## Quick Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key
3. Create the required tables using the Supabase dashboard SQL editor

## Required Tables

### 1. Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  membership_tier TEXT DEFAULT 'free' CHECK (membership_tier IN ('free', 'paid')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. Leads Table
```sql
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3. Courses Table
```sql
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  order_index INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4. Lessons Table
```sql
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  video_url TEXT,
  order_index INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 5. Threads Table
```sql
CREATE TABLE threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 6. Comments Table
```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID REFERENCES threads(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 7. Stripe Subscriptions Table
```sql
CREATE TABLE stripe_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  status TEXT,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 8. Office Hours Table
```sql
CREATE TABLE office_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  zoom_link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Enable Row Level Security

Run this for ALL tables:
```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE office_hours ENABLE ROW LEVEL SECURITY;
```

## Create User Trigger

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, membership_tier)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    'free'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

## Create Indexes

```sql
CREATE INDEX idx_threads_created ON threads(created_at DESC);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_subs_user ON stripe_subscriptions(user_id);
CREATE INDEX idx_subscriptions_user_status ON stripe_subscriptions(user_id, status);
```

## RLS Policies

See the main build guide for detailed RLS policies based on your access control needs.