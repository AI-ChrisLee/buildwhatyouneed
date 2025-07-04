"use client"

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function AuthGuard({ 
  children,
  requireSubscription = false,
  allowFreeTier = false 
}: { 
  children: React.ReactNode
  requireSubscription?: boolean
  allowFreeTier?: boolean
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    checkAuth()
  }, [pathname])

  async function checkAuth() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      if (requireSubscription) {
        // Check if user has active subscription
        const { data: subscription } = await supabase
          .from('stripe_subscriptions')
          .select('status')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .maybeSingle()

        // If allowing free tier, check user's membership tier
        if (!subscription && allowFreeTier) {
          const { data: userData } = await supabase
            .from('users')
            .select('membership_tier')
            .eq('id', user.id)
            .single()
          
          if (userData?.membership_tier !== 'free') {
            router.push('/')
            return
          }
          // Free tier users are allowed to continue
        } else if (!subscription) {
          // No subscription and not allowing free tier
          router.push('/')
          return
        }
      }

      setIsAuthorized(true)
    } catch (error) {
      console.error('Auth check error:', error)
      router.push('/login')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}