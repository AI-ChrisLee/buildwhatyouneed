import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/courses/[courseId]/modules - Get all modules for a course
export async function GET(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  const supabase = createClient()
  
  const { data: modules, error } = await supabase
    .from('course_modules')
    .select(`
      *,
      lessons:lessons(*)
    `)
    .eq('course_id', params.courseId)
    .order('order_index', { ascending: true })
    .order('order_index', { foreignTable: 'lessons', ascending: true })

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }

  return NextResponse.json({ data: modules })
}

// POST /api/courses/[courseId]/modules - Create new module
export async function POST(
  request: Request,
  { params }: { params: { courseId: string } }
) {
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

  // Create module
  const body = await request.json()
  const { title, order_index } = body

  const { data: module, error } = await supabase
    .from('course_modules')
    .insert({
      course_id: params.courseId,
      title,
      order_index: order_index || 0,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }

  return NextResponse.json({ data: module })
}