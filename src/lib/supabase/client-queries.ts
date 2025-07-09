import { createClient } from '@/lib/supabase/client'

interface User {
  id: string
  email: string
  full_name: string | null
  is_admin: boolean
  membership_tier: string
  profile_image_url: string | null
  bio: string | null
  created_at: string
  updated_at: string
}

interface Thread {
  id: string
  title: string
  content: string
  category: string
  author_id: string
  is_pinned: boolean
  is_locked: boolean
  is_deleted: boolean
  created_at: string
  updated_at: string
  last_activity_at: string
}

interface Comment {
  id: string
  thread_id: string
  author_id: string
  content: string
  is_deleted: boolean
  created_at: string
  updated_at: string
}

// Thread with author info
export type ThreadWithAuthor = Thread & {
  author: User & { founding_number?: number | null }
  comment_count: number
}

// Comment with author info
export type CommentWithAuthor = Comment & {
  author: User & { founding_number?: number | null }
}

// Fetch all threads with author info and comment count
export async function getThreads(category?: string) {
  const supabase = createClient()
  
  let query = supabase
    .from('threads')
    .select(`
      *,
      author:users!author_id(*),
      comments(count)
    `)
    .eq('is_deleted', false)
    .order('is_pinned', { ascending: false })
    .order('last_activity_at', { ascending: false })
  
  if (category && category !== 'all') {
    query = query.eq('category', category)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching threads:', error)
    return []
  }
  
  // Transform the data to include comment_count
  return data.map(thread => ({
    ...thread,
    comment_count: thread.comments[0]?.count || 0,
    comments: undefined // Remove the count object
  })) as ThreadWithAuthor[]
}

// Fetch a single thread with author info
export async function getThread(threadId: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('threads')
    .select(`
      *,
      author:users!author_id(*),
      comments(count)
    `)
    .eq('id', threadId)
    .single()
  
  if (error) {
    console.error('Error fetching thread:', error)
    return null
  }
  
  return {
    ...data,
    comment_count: data.comments[0]?.count || 0,
    comments: undefined
  } as ThreadWithAuthor
}

// Fetch comments for a thread
export async function getComments(threadId: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      author:users!author_id(*)
    `)
    .eq('thread_id', threadId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: true })
  
  if (error) {
    console.error('Error fetching comments:', error)
    return []
  }
  
  return data as CommentWithAuthor[]
}

// Create a new thread
export async function createThread(thread: {
  title: string
  content: string
  category: string
}) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  const { data, error } = await supabase
    .from('threads')
    .insert({
      title: thread.title,
      content: thread.content,
      category: thread.category,
      author_id: user.id
    })
    .select(`
      *,
      author:users!author_id(*)
    `)
    .single()
  
  if (error) {
    console.error('Error creating thread:', error)
    throw error
  }
  
  return { ...data, comment_count: 0 } as ThreadWithAuthor
}

// Create a new comment
export async function createComment(threadId: string, content: string) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  const { data, error } = await supabase
    .from('comments')
    .insert({
      thread_id: threadId,
      content: content,
      author_id: user.id
    })
    .select(`
      *,
      author:users!author_id(*)
    `)
    .single()
  
  if (error) {
    console.error('Error creating comment:', error)
    throw error
  }
  
  return data as CommentWithAuthor
}

// Get user's threads
export async function getUserThreads(userId: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('threads')
    .select(`
      *,
      author:users!author_id(*),
      comments(count)
    `)
    .eq('author_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching user threads:', error)
    return []
  }
  
  return data.map(thread => ({
    ...thread,
    comment_count: thread.comments[0]?.count || 0,
    comments: undefined
  })) as ThreadWithAuthor[]
}