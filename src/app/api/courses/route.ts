import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/courses - List all courses
export async function GET() {
  const supabase = createClient()
  
  const { data: courses, error } = await supabase
    .from('courses')
    .select(`
      *,
      lessons(count)
    `)
    .order('is_free', { ascending: false })
    .order('order_index', { ascending: true })

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }

  // Transform data to include lesson count
  const coursesWithCount = courses?.map(course => ({
    ...course,
    lesson_count: course.lessons[0]?.count || 0
  })) || []

  return NextResponse.json({
    data: coursesWithCount
  })
}

// POST /api/courses - Create new course
export async function POST(request: Request) {
  const supabase = createClient()
  
  // Check if user is admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const { data: userData } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!userData?.is_admin) {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    )
  }

  // Create course
  const body = await request.json()
  const { title, description, order_index } = body

  const { data: course, error } = await supabase
    .from('courses')
    .insert({
      title,
      description,
      order_index: order_index || 1,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }

  return NextResponse.json({ data: course })
}