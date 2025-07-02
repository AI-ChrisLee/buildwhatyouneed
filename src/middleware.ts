import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  // Update session first
  const response = await updateSession(request)
  
  // Create supabase client to check auth
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set() {},
        remove() {},
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  // Public routes that don't require auth
  const publicRoutes = ['/', '/join', '/login', '/signup', '/terms', '/privacy']
  const isPublicRoute = publicRoutes.includes(pathname)

  // If not logged in and trying to access protected route
  if (!user && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If logged in, check subscription status for community routes
  if (user) {
    const communityRoutes = ['/threads', '/classroom', '/calendar', '/about', '/profile']
    const isCommunityRoute = communityRoutes.some(route => pathname.startsWith(route))
    
    // Payment page needs auth but not subscription
    if (pathname === '/payment') {
      return response
    }
    
    if (isCommunityRoute) {
      // Check if user has active subscription
      const { data: subscription } = await supabase
        .from('stripe_subscriptions')
        .select('status')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()

      // No active subscription - redirect to payment
      if (!subscription && pathname !== '/payment') {
        return NextResponse.redirect(new URL('/payment', request.url))
      }
    }

    // Redirect logged-in users away from auth pages
    if (['/login', '/signup'].includes(pathname)) {
      // Check if they have subscription
      const { data: subscription } = await supabase
        .from('stripe_subscriptions')
        .select('status')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()

      return NextResponse.redirect(
        new URL(subscription ? '/threads' : '/payment', request.url)
      )
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}