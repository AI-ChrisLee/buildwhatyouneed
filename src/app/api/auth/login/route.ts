import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = createClient()
  
  try {
    const { email, password } = await request.json()

    // Simple validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    // Check if user has active subscription
    const { data: subscription } = await supabase
      .from('stripe_subscriptions')
      .select('status')
      .eq('user_id', data.user.id)
      .eq('status', 'active')
      .single()

    return NextResponse.json({
      data: {
        user: data.user,
        hasActiveSubscription: !!subscription,
        redirectTo: subscription ? '/threads' : '/payment'
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}