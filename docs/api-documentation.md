# API Documentation

## Overview
All API endpoints follow RESTful conventions and return JSON responses.

### Response Format
```json
// Success
{
  "data": { ... }
}

// Error
{
  "error": "Error message"
}
```

## Authentication Endpoints

### POST /api/auth/signup
Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "John Doe"
}
```

**Response:**
```json
{
  "data": {
    "user": { ... },
    "message": "Account created! Redirecting to checkout..."
  }
}
```

### POST /api/auth/login
Log in an existing user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "data": {
    "user": { ... },
    "hasActiveSubscription": true,
    "redirectTo": "/threads"
  }
}
```

### POST /api/auth/logout
Log out the current user.

**Response:**
```json
{
  "data": {
    "message": "Logged out successfully"
  }
}
```

## Threads Endpoints

### GET /api/threads
List threads with pagination.

**Query Parameters:**
- `category` (optional): Filter by category ('announcements', 'general', 'show-tell', 'help')
- `page` (optional): Page number (default: 1)

**Response:**
```json
{
  "data": {
    "threads": [
      {
        "id": "...",
        "title": "Thread title",
        "content": "Thread content",
        "category": "general",
        "author": {
          "email": "user@example.com",
          "full_name": "John Doe"
        },
        "comment_count": [{ "count": 5 }],
        "created_at": "2024-01-01T00:00:00Z",
        "last_activity_at": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

### POST /api/threads
Create a new thread.

**Request Body:**
```json
{
  "title": "Thread title",
  "content": "Thread content in markdown",
  "category": "general"
}
```

**Response:**
```json
{
  "data": {
    "id": "...",
    "title": "Thread title",
    "content": "Thread content",
    "category": "general",
    "author_id": "...",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### GET /api/threads/[id]
Get a thread with all its comments.

**Response:**
```json
{
  "data": {
    "thread": {
      "id": "...",
      "title": "Thread title",
      "content": "Thread content",
      "author": { ... }
    },
    "comments": [
      {
        "id": "...",
        "content": "Comment content",
        "author": { ... },
        "created_at": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

### POST /api/threads/[id]/comments
Add a comment to a thread.

**Request Body:**
```json
{
  "content": "Comment content in markdown"
}
```

**Response:**
```json
{
  "data": {
    "id": "...",
    "content": "Comment content",
    "author": { ... },
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

## Courses Endpoints

### GET /api/courses
List all courses.

**Response:**
```json
{
  "data": [
    {
      "id": "...",
      "title": "Course title",
      "description": "Course description",
      "order_index": 1,
      "lesson_count": 5
    }
  ]
}
```

### GET /api/courses/[id]/lessons
Get lessons for a specific course.

**Response:**
```json
{
  "data": {
    "course": {
      "id": "...",
      "title": "Course title",
      "description": "Course description"
    },
    "lessons": [
      {
        "id": "...",
        "title": "Lesson title",
        "wistia_video_id": "abc123",
        "order_index": 1
      }
    ]
  }
}
```

## Calendar Endpoint

### GET /api/calendar
Get the hardcoded office hours schedule.

**Response:**
```json
{
  "data": [
    {
      "id": "tuesday-build-review",
      "title": "Build Review",
      "description": "Show what you built this week",
      "dayOfWeek": 2,
      "time": "10:00",
      "timezone": "PST",
      "duration": 60,
      "nextDate": "2024-01-02T18:00:00Z",
      "isLive": false,
      "joinUrl": null
    }
  ]
}
```

## Stripe Endpoints

### POST /api/stripe/checkout
Create a Stripe checkout session.

**Request Body:**
```json
{
  "userId": "user-uuid"
}
```

**Response:**
```json
{
  "url": "https://checkout.stripe.com/..."
}
```

### POST /api/stripe/webhook
Stripe webhook handler (called by Stripe).

**Headers Required:**
- `stripe-signature`: Webhook signature from Stripe

**Handled Events:**
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

**Webhook URL Setup:**
- **Development**: Use ngrok URL (e.g., `https://abc123.ngrok.io/api/stripe/webhook`)
- **Production**: Use your domain (e.g., `https://yourdomain.com/api/stripe/webhook`)

## Access Control

### Public Routes
- `/` - Landing page
- `/join` - Sales page
- `/login` - Login page
- `/signup` - Signup page
- `/terms` - Terms of service
- `/privacy` - Privacy policy

### Free Member Routes
- `/checkout` - Payment page (only accessible route for free members)

### Paid Member Routes
- `/threads` - Community discussions
- `/classroom` - Video courses
- `/calendar` - Office hours schedule
- `/about` - Welcome/philosophy page
- `/profile` - User profile

### Admin Features
- Can post in 'announcements' category
- Can upload courses (future feature)

## Error Codes
- `400` - Bad request (validation error)
- `401` - Not authenticated
- `403` - Forbidden (no permission)
- `404` - Not found
- `500` - Server error