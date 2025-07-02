import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/courses/[id]/lessons - Get lessons for a course
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  
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