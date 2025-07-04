"use client"

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function AuthGuard({ 
  children,
  requireSubscription = false 
}: { 
  children: React.ReactNode
  requireSubscription?: boolean
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
        const { data: subscription } = await supabase
          .from('stripe_subscriptions')
          .select('status')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .maybeSingle()

        if (!subscription) {
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