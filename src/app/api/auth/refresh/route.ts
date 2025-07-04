import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = createClient()
  
  try {
    // Refresh the session
    const { data: { session }, error } = await supabase.auth.refreshSession()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    
    if (!session) {
      return NextResponse.json({ error: 'No session' }, { status: 401 })
    }
    
    // Get updated user data
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single()
    
    return NextResponse.json({ 
      message: 'Session refreshed',
      user: {
        ...session.user,
        membership_tier: userData?.membership_tier,
        is_admin: userData?.is_admin
      }
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}