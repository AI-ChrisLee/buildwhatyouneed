import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/threads/[id] - Get thread with comments
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  
  // Get thread with author info
  const { data: thread, error: threadError } = await supabase
    .from('threads')
    .select(`
      *,
      author:users(email, full_name)
    `)
    .eq('id', params.id)
    .single()

  if (threadError || !thread) {
    return NextResponse.json(
      { error: 'Thread not found' },
      { status: 404 }
    )
  }

  // Get comments for this thread
  const { data: comments, error: commentsError } = await supabase
    .from('comments')
    .select(`
      *,
      author:users(email, full_name)
    `)
    .eq('thread_id', params.id)
    .order('created_at', { ascending: true })

  if (commentsError) {
    return NextResponse.json(
      { error: commentsError.message },
      { status: 400 }
    )
  }

  return NextResponse.json({
    data: {
      thread,
      comments: comments || []
    }
  })
}