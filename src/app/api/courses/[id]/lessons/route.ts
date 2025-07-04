import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { checkCourseAccess } from '@/lib/course-access'

// GET /api/courses/[id]/lessons - Get lessons for a course
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  
  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
  
  // Check course access
  const access = await checkCourseAccess(user.id, params.id)
  if (!access.hasAccess) {
    return NextResponse.json(
      { error: access.requiresUpgrade ? 'Upgrade required' : 'Access denied' },
      { status: 403 }
    )
  }
  
  // Get course with lessons
  const { data: course, error } = await supabase
    .from('courses')
    .select(`
      *,
      lessons(*)
    `)
    .eq('id', params.id)
    .single()

  if (error || !course) {
    return NextResponse.json(
      { error: 'Course not found' },
      { status: 404 }
    )
  }

  // Sort lessons by order_index
  const lessons = course.lessons.sort((a: any, b: any) => a.order_index - b.order_index)

  return NextResponse.json({
    data: {
      course: {
        id: course.id,
        title: course.title,
        description: course.description
      },
      lessons
    }
  })
}