import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  // Update session first
  const response = await updateSession(request)
  
  // Skip auth checks for API routes
  const pathname = request.nextUrl.pathname
  if (pathname.startsWith('/api/')) {
    return response
  }
  
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

  // Public routes that don't require auth
  const publicRoutes = ['/', '/terms', '/privacy']
  const isPublicRoute = publicRoutes.includes(pathname)
  
  // If user is accessing root and is authenticated with subscription, redirect to /threads
  if (pathname === '/' && user) {
    // Check if user has active subscription
    const { data: subscription } = await supabase
      .from('stripe_subscriptions')
      .select('status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle()
    
    // Check if user is admin
    const { data: userData } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single()
    
    if (subscription || userData?.is_admin) {
      return NextResponse.redirect(new URL('/threads', request.url))
    }
  }
  
  // If it's a public route, just return the response without auth checks
  if (isPublicRoute) {
    return response
  }
  
  // Redirect auth routes to home page if user is already logged in
  if (['/login', '/signup'].includes(pathname) && user) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // If not logged in and trying to access protected route
  if (!user && !isPublicRoute) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // If logged in, check subscription status for community routes
  if (user) {
    const communityRoutes = ['/threads', '/classroom', '/calendar', '/profile']
    const isCommunityRoute = communityRoutes.some(route => pathname.startsWith(route))
    
    // Payment pages need auth but not subscription
    if (pathname === '/payment' || pathname === '/payment/success') {
      return response
    }
    
    if (isCommunityRoute) {
      // Check if user has active subscription
      const { data: subscription } = await supabase
        .from('stripe_subscriptions')
        .select('status')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle()

      // Check if user is admin
      const { data: userData } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', user.id)
        .single()
      
      // No active subscription and not admin - redirect to home
      if (!subscription && !userData?.is_admin) {
        return NextResponse.redirect(new URL('/', request.url))
      }
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