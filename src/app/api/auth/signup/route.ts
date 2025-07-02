import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = createClient()
  
  try {
    const { email, password, full_name } = await request.json()

    // Simple validation
    if (!email || !password || !full_name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      )
    }

    // Create user without email confirmation
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/payment`,
      },
    })

    if (signUpError) {
      return NextResponse.json(
        { error: signUpError.message },
        { status: 400 }
      )
    }

    // Auto sign in the user after signup
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      return NextResponse.json(
        { error: 'Account created but could not sign in automatically' },
        { status: 400 }
      )
    }

    // User created and signed in - they're now a free member
    // They can only access /payment until they pay
    return NextResponse.json({
      data: {
        user: signInData.user,
        session: signInData.session,
        message: 'Account created! Redirecting to payment...'
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}