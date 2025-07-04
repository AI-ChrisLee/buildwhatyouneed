"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { AccessDeniedModal } from "@/components/access-denied-modal"

export function useMembership() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)
  const [membershipTier, setMembershipTier] = useState<'free' | 'paid' | null>(null)
  const [showAccessDenied, setShowAccessDenied] = useState(false)
  const [deniedFeature, setDeniedFeature] = useState("")
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    checkMembership()

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        checkMembership()
      } else {
        setUser(null)
        setHasAccess(false)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function checkMembership() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setUser(null)
        setHasAccess(false)
        setLoading(false)
        return
      }

      setUser(user)

      // Check if user is admin or has free tier
      const { data: userData } = await supabase
        .from('users')
        .select('is_admin, membership_tier')
        .eq('id', user.id)
        .single()

      if (userData?.is_admin) {
        setHasAccess(true)
        setMembershipTier('paid') // Admins have full access
        setLoading(false)
        return
      }

      // Set membership tier
      if (userData?.membership_tier === 'free') {
        setMembershipTier('free')
        // Free tier users have access to classroom only
        setHasAccess(true)
      } else if (userData?.membership_tier === 'paid') {
        setMembershipTier('paid')
        setHasAccess(true)
      } else {
        // Check if user has active subscription
        const { data: subscriptions } = await supabase
          .from('stripe_subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .in('status', ['active', 'trialing', 'incomplete'])

        if (subscriptions && subscriptions.length > 0) {
          setMembershipTier('paid')
          setHasAccess(true)
        } else {
          setMembershipTier(null)
          setHasAccess(false)
        }
      }
    } catch (error) {
      console.error('Error checking membership:', error)
      setHasAccess(false)
    } finally {
      setLoading(false)
    }
  }

  function requireMembership(feature: string) {
    if (!user) {
      // Not logged in, redirect to signup
      router.push('/signup')
      return false
    }

    if (!hasAccess) {
      // Logged in but no access, show modal
      setDeniedFeature(feature)
      setShowAccessDenied(true)
      return false
    }

    return true
  }

  const MembershipGate = ({ children, feature }: { children: React.ReactNode, feature: string }) => {
    useEffect(() => {
      if (!loading) {
        if (!user) {
          // Not logged in, redirect to signup
          router.push('/signup')
        } else if (membershipTier === 'free' && feature !== 'Classroom') {
          // Free tier can only access classroom
          setDeniedFeature(feature)
          setShowAccessDenied(true)
        } else if (!hasAccess) {
          // Logged in but no access, show modal
          setDeniedFeature(feature)
          setShowAccessDenied(true)
        }
      }
    }, [loading, hasAccess, feature, user, membershipTier])

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      )
    }

    if (!user) {
      // Redirecting to signup...
      return null
    }

    if (!hasAccess || (membershipTier === 'free' && feature !== 'Classroom')) {
      return (
        <>
          <AccessDeniedModal 
            open={showAccessDenied} 
            onOpenChange={(open) => {
              setShowAccessDenied(open)
              if (!open) {
                // When modal closes, go back to home page
                router.push('/')
              }
            }}
            feature={feature}
          />
        </>
      )
    }

    return <>{children}</>
  }

  return {
    user,
    loading,
    hasAccess,
    membershipTier,
    requireMembership,
    checkMembership,
    MembershipGate,
    AccessDeniedModal: () => (
      <AccessDeniedModal 
        open={showAccessDenied} 
        onOpenChange={setShowAccessDenied}
        feature={deniedFeature}
      />
    )
  }
}