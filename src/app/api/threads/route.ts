import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/threads - List threads
export async function GET(request: Request) {
  const supabase = createClient()
  
  // Get URL params
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = 20
  const offset = (page - 1) * limit

  // Build query
  let query = supabase
    .from('threads')
    .select(`
      *,
      author:users(email, full_name),
      comment_count:comments(count)
    `)
    .order('last_activity_at', { ascending: false })
    .range(offset, offset + limit - 1)

  // Filter by category if provided
  if (category && category !== 'all') {
    query = query.eq('category', category)
  }

  const { data: threads, error } = await query

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }

  // Get total count for pagination
  const { count } = await supabase
    .from('threads')
    .select('*', { count: 'exact', head: true })
    .eq(category && category !== 'all' ? 'category' : '', category || '')

  return NextResponse.json({
    data: {
      threads: threads || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    }
  })
}

// POST /api/threads - Create thread
export async function POST(request: Request) {
  const supabase = createClient()
  
  try {
    const { title, content, category } = await request.json()

    // Validate
    if (!title || !content || !category) {
      return NextResponse.json(
        { error: 'Title, content, and category are required' },
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

    // Check if user can post in this category
    if (category === 'announcements') {
      const { data: userData } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', user.id)
        .single()

      if (!userData?.is_admin) {
        return NextResponse.json(
          { error: 'Only admins can post announcements' },
          { status: 403 }
        )
      }
    }

    // Create thread
    const { data: thread, error } = await supabase
      .from('threads')
      .insert({
        title,
        content,
        category,
        author_id: user.id
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ data: thread })
  } catch (error) {
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}