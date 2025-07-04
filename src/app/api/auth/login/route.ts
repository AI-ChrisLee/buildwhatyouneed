import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { loginSchema } from '@/lib/validations'
import { authRateLimit } from '@/lib/rate-limiter'
import { z } from 'zod'

export async function POST(request: Request) {
  const supabase = createClient()
  
  try {
    // Get IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const { allowed, remaining } = await authRateLimit(ip)
    
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      )
    }
    
    const body = await request.json()
    
    // Validate input
    const validatedData = loginSchema.parse(body)
    const { email, password } = validatedData

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
      .maybeSingle()

    return NextResponse.json({
      data: {
        user: data.user,
        hasActiveSubscription: !!subscription,
        redirectTo: subscription ? '/threads' : '/payment'
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}