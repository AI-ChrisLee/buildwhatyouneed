import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { signupSchema } from '@/lib/validations'
import { z } from 'zod'

export async function POST(request: Request) {
  const supabase = createClient()
  
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = signupSchema.parse(body)
    const { email, password, full_name } = validatedData

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