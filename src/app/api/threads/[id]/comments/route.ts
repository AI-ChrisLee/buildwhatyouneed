import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// POST /api/threads/[id]/comments - Add comment to thread
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  
  try {
    const { content } = await request.json()

    if (!content) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      )
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Check thread exists
    const { data: thread } = await supabase
      .from('threads')
      .select('id')
      .eq('id', params.id)
      .single()

    if (!thread) {
      return NextResponse.json(
        { error: 'Thread not found' },
        { status: 404 }
      )
    }

    // Create comment
    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        thread_id: params.id,
        content,
        author_id: user.id
      })
      .select(`
        *,
        author:users(email, full_name)
      `)
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ data: comment })
  } catch (error) {
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}