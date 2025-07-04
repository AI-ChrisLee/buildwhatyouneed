import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// POST /api/lessons - Create new lesson
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

  // Create lesson
  const body = await request.json()
  const { title, description, wistia_video_id, order_index, duration_minutes, course_id } = body

  const { data: lesson, error } = await supabase
    .from('lessons')
    .insert({
      title,
      description,
      wistia_video_id,
      order_index: order_index || 1,
      duration_minutes,
      course_id,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }

  return NextResponse.json({ data: lesson })
}