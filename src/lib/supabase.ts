// Type definitions for our database
export type User = {
  id: string
  email: string
  full_name: string | null
  is_admin: boolean
  founding_number?: number | null
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
  is_pinned: boolean
  pinned_at: string | null
  is_deleted: boolean
  deleted_at: string | null
  deleted_by: string | null
}

export type Comment = {
  id: string
  thread_id: string
  content: string
  author_id: string
  created_at: string
  is_deleted: boolean
  deleted_at: string | null
  deleted_by: string | null
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
  description?: string | null
  wistia_video_id: string
  order_index: number
  duration_minutes?: number | null
}

export type StripeSubscription = {
  id: string
  user_id: string
  status: string
  current_period_end: string | null
  created_at: string
}

export type Event = {
  id: string
  title: string
  description: string | null
  event_type: 'workshop' | 'webinar' | 'office-hours' | 'community-call' | 'other'
  start_datetime: string
  end_datetime: string
  timezone: string
  location_type: 'online' | 'in-person' | 'hybrid'
  location_details: any
  max_attendees: number | null
  registration_required: boolean
  registration_deadline: string | null
  status: 'draft' | 'published' | 'cancelled'
  host_id: string
  co_hosts: string[]
  tags: string[]
  image_url: string | null
  is_recurring: boolean
  recurrence_rule: any | null
  parent_event_id: string | null
  created_at: string
  updated_at: string
  created_by: string | null
  // Additional fields from views
  host_name?: string
  host_email?: string
  available_spots?: number | null
  registered_count?: number
}

export type EventRegistration = {
  id: string
  event_id: string
  user_id: string
  status: 'registered' | 'waitlisted' | 'cancelled' | 'attended'
  registered_at: string
  cancelled_at: string | null
  attended_at: string | null
  notes: string | null
  reminder_sent: boolean
}

export type EventResource = {
  id: string
  event_id: string
  resource_type: 'slide' | 'recording' | 'document' | 'link' | 'other'
  title: string
  url: string
  description: string | null
  is_public: boolean
  order_index: number
  created_at: string
  created_by: string | null
}