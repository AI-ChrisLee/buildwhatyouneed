import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// PUT /api/modules/[moduleId] - Update module
export async function PUT(
  request: Request,
  { params }: { params: { moduleId: string } }
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

  // Update module
  const body = await request.json()
  const { title, order_index, is_collapsed } = body

  const { data: module, error } = await supabase
    .from('course_modules')
    .update({
      title,
      order_index,
      is_collapsed,
    })
    .eq('id', params.moduleId)
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

// DELETE /api/modules/[moduleId] - Delete module
export async function DELETE(
  request: Request,
  { params }: { params: { moduleId: string } }
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

  // Delete module
  const { error } = await supabase
    .from('course_modules')
    .delete()
    .eq('id', params.moduleId)

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }

  return NextResponse.json({ success: true })
}