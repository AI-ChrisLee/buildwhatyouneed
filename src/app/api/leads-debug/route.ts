import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Create a Supabase client with service role key to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false
    }
  }
)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, name, source = 'landing_page', utm_source, utm_medium, utm_campaign } = body

    console.log('Debug: Received lead data:', { email, name, source })

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Use service role to bypass RLS
    const { data, error } = await supabaseAdmin
      .from('leads')
      .upsert({
        email: email.toLowerCase(),
        name,
        stage: 'lead',
        source,
        utm_source,
        utm_medium,
        utm_campaign,
        created_at: new Date().toISOString()
      }, {
        onConflict: 'email',
        ignoreDuplicates: false
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { 
          error: error.message, 
          code: error.code,
          details: error.details,
          hint: 'Using service role key - this should bypass RLS'
        },
        { status: 400 }
      )
    }

    console.log('Lead created successfully:', data)
    return NextResponse.json({ data })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create lead' },
      { status: 500 }
    )
  }
}