import { createClient } from '@/lib/supabase/client'

// Toggle pin status of a thread
export async function toggleThreadPin(threadId: string, isPinned: boolean) {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('threads')
    .update({ 
      is_pinned: !isPinned,
      pinned_at: !isPinned ? new Date().toISOString() : null
    })
    .eq('id', threadId)
  
  if (error) {
    console.error('Error toggling thread pin:', error)
    throw error
  }
}


// Delete a thread
export async function deleteThread(threadId: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .rpc('soft_delete_thread', { thread_id: threadId })
  
  if (error) {
    console.error('Error deleting thread:', error)
    throw error
  }
  
  return data
}

// Delete a comment
export async function deleteComment(commentId: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .rpc('soft_delete_comment', { comment_id: commentId })
  
  if (error) {
    console.error('Error deleting comment:', error)
    throw error
  }
  
  return data
}

// Restore a deleted thread (admin only)
export async function restoreThread(threadId: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .rpc('restore_thread', { thread_id: threadId })
  
  if (error) {
    console.error('Error restoring thread:', error)
    throw error
  }
  
  return data
}

// Restore a deleted comment (admin only)
export async function restoreComment(commentId: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .rpc('restore_comment', { comment_id: commentId })
  
  if (error) {
    console.error('Error restoring comment:', error)
    throw error
  }
  
  return data
}

// Check if current user is admin
export async function isCurrentUserAdmin() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  
  const { data } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  
  return data?.is_admin || false
}

// Check if current user can delete a thread
export async function canDeleteThread(threadId: string) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  
  const { data } = await supabase
    .rpc('can_delete_thread', { thread_id: threadId, user_id: user.id })
  
  return data || false
}

// Check if current user can delete a comment
export async function canDeleteComment(commentId: string) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  
  const { data } = await supabase
    .rpc('can_delete_comment', { comment_id: commentId, user_id: user.id })
  
  return data || false
}