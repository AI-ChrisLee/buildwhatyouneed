import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { leadSchema } from '@/lib/validations'
import { apiRateLimit } from '@/lib/rate-limiter'
import { z } from 'zod'

export async function POST(request: Request) {
  const supabase = createClient()
  
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const { allowed } = await apiRateLimit(ip)
    
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }
    
    const body = await request.json()
    
    // Map full_name to name for compatibility
    if (body.full_name && !body.name) {
      body.name = body.full_name
    }
    
    // Validate input
    const validatedData = leadSchema.parse(body)
    const { email, full_name: name, pain_level, utm_source, utm_medium, utm_campaign } = validatedData

    // Insert or update lead
    const { data, error } = await supabase
      .from('leads')
      .upsert({
        id: crypto.randomUUID(),
        email: email.toLowerCase(),
        name,
        stage: 'lead',
        source: 'landing_page',
        utm_source,
        utm_medium,
        utm_campaign,
        created_at: new Date().toISOString()
      }, {
        onConflict: 'email',
        ignoreDuplicates: false // Update if exists
      })
      .select()
      .single()

    if (error) {
      console.error('Lead creation error:', error)
      // Return error for debugging
      return NextResponse.json(
        { error: error.message, code: error.code, details: error.details },
        { status: 400 }
      )
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    
    console.error('Lead API error:', error)
    // Return error for debugging
    return NextResponse.json(
      { error: error.message || 'Failed to create lead' },
      { status: 500 }
    )
  }
}

// Admin endpoint to get lead analytics
export async function GET(request: Request) {
  const supabase = createClient()
  
  try {
    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
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
        { error: 'Not authorized' },
        { status: 403 }
      )
    }

    // Get conversion funnel data
    const { data: funnel } = await supabase
      .from('conversion_funnel')
      .select('*')
      .single()

    // Get recent leads
    const { data: recentLeads } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    // Get lead analytics by stage
    const { data: analytics } = await supabase
      .from('lead_analytics')
      .select('*')

    return NextResponse.json({
      data: {
        funnel,
        recentLeads,
        analytics
      }
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}