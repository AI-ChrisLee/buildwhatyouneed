import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = createClient()
  
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Update lead to optout status
    const { data, error } = await supabase
      .from('leads')
      .update({
        stage: 'optout',
        optout_at: new Date().toISOString()
      })
      .eq('email', email.toLowerCase())
      .select()
      .single()

    if (error) {
      console.error('Optout error:', error)
      return NextResponse.json(
        { error: 'Failed to process optout' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      data: { 
        message: 'You have been successfully unsubscribed.' 
      } 
    })
  } catch (error) {
    console.error('Optout API error:', error)
    return NextResponse.json(
      { error: 'Failed to process optout' },
      { status: 500 }
    )
  }
}