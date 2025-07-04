import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createClient()
  
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ 
        error: 'Not authenticated',
        details: userError?.message 
      }, { status: 401 })
    }
    
    // Get user data from database
    const { data: userData, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()
    
    // Get subscription data
    const { data: subscriptions } = await supabase
      .from('stripe_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
    
    // Get course access
    const { data: courseAccess } = await supabase
      .from('user_course_access')
      .select(`
        *,
        courses (
          id,
          title,
          is_free
        )
      `)
      .eq('user_id', user.id)
    
    return NextResponse.json({
      auth: {
        id: user.id,
        email: user.email,
        session: !!user
      },
      database: {
        userData,
        hasActiveSubscription: subscriptions && subscriptions.length > 0,
        courseAccess
      },
      access: {
        membershipTier: userData?.membership_tier,
        isAdmin: userData?.is_admin,
        shouldHaveClassroomAccess: userData?.membership_tier === 'free' || userData?.is_admin || (subscriptions && subscriptions.length > 0)
      }
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Server error',
      details: error 
    }, { status: 500 })
  }
}