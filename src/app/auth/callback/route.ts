import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const type = requestUrl.searchParams.get('type')
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // If this is a password recovery, redirect to reset password page
      if (type === 'recovery') {
        return NextResponse.redirect(`${origin}/reset-password`)
      }
      
      // Otherwise, redirect to the appropriate page based on subscription status
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Check subscription status
        const { data: subscription } = await supabase
          .from('stripe_subscriptions')
          .select('status')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .single()
        
        if (subscription) {
          return NextResponse.redirect(`${origin}/threads`)
        }
      }
      
      return NextResponse.redirect(`${origin}/payment`)
    }
  }

  // Return to landing page if there's an error
  return NextResponse.redirect(`${origin}/`)
}