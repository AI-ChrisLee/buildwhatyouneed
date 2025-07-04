import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { signupSchema } from '@/lib/validations'
import { z } from 'zod'

export async function POST(request: Request) {
  const supabase = createClient()
  
  try {
    const body = await request.json()
    
    // Check if this is a free tier signup (based on signup_type parameter)
    const isFreeSignup = body.signup_type === 'free'
    
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
        emailRedirectTo: isFreeSignup 
          ? `${process.env.NEXT_PUBLIC_BASE_URL}/classroom`
          : `${process.env.NEXT_PUBLIC_BASE_URL}/payment`,
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

    // Update user profile with membership tier
    const { error: profileError } = await supabase
      .from('users')
      .update({ 
        membership_tier: isFreeSignup ? 'free' : 'pending_payment',
        tier_created_at: new Date().toISOString()
      })
      .eq('id', signInData.user.id)

    if (profileError) {
      console.error('Failed to update user profile:', profileError)
    }

    // If free signup, grant access to free course
    if (isFreeSignup && signInData.user) {
      const { data: freeCourse } = await supabase
        .from('courses')
        .select('id')
        .eq('is_free', true)
        .limit(1)
        .single()

      if (freeCourse) {
        const { error: accessError } = await supabase
          .from('user_course_access')
          .insert({
            user_id: signInData.user.id,
            course_id: freeCourse.id
          })
        
        if (accessError) {
          console.error('Failed to grant course access:', accessError)
        }
      }
    }

    // Return appropriate response based on signup type
    return NextResponse.json({
      data: {
        user: signInData.user,
        session: signInData.session,
        message: isFreeSignup 
          ? 'Welcome! Your free account is ready.'
          : 'Account created! Redirecting to payment...',
        redirectTo: isFreeSignup 
          ? '/classroom'
          : '/payment'
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