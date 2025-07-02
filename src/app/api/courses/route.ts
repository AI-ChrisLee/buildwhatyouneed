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