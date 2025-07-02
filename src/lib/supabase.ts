// Type definitions for our database
export type User = {
  id: string
  email: string
  full_name: string | null
  is_admin: boolean
  created_at: string
}

export type Thread = {
  id: string
  title: string
  content: string
  category: 'announcements' | 'general' | 'show-tell' | 'help'
  author_id: string
  created_at: string
  last_activity_at: string
}

export type Comment = {
  id: string
  thread_id: string
  content: string
  author_id: string
  created_at: string
}

export type Course = {
  id: string
  title: string
  description: string | null
  order_index: number
  created_at: string
}

export type Lesson = {
  id: string
  course_id: string
  title: string
  wistia_video_id: string
  order_index: number
}

export type StripeSubscription = {
  id: string
  user_id: string
  status: string
  current_period_end: string | null
  created_at: string
}