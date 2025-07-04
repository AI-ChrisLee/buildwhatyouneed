import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/lessons/[id] - Get single lesson
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  
  const { data: lesson, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !lesson) {
    return NextResponse.json(
      { error: 'Lesson not found' },
      { status: 404 }
    )
  }

  return NextResponse.json({ data: lesson })
}

// PUT /api/lessons/[id] - Update lesson
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
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

  // Update lesson
  const body = await request.json()
  const { title, description, wistia_video_id, order_index, duration_minutes } = body

  const { data: lesson, error } = await supabase
    .from('lessons')
    .update({
      title,
      description,
      wistia_video_id,
      order_index,
      duration_minutes,
    })
    .eq('id', params.id)
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

// DELETE /api/lessons/[id] - Delete lesson
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
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

  // Delete lesson
  const { error } = await supabase
    .from('lessons')
    .delete()
    .eq('id', params.id)

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }

  return NextResponse.json({ success: true })
}