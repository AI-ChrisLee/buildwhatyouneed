"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Sparkles } from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { SignupModal } from "@/components/signup-modal"
import { FreeSignupModal } from "@/components/free-signup-modal"
import { LoginModal } from "@/components/login-modal"
import PaymentModal from "@/components/payment-modal"
import { AvatarGradient } from "@/components/ui/avatar-gradient"

export function CommunityBadge() {
  const [memberCount, setMemberCount] = useState<number>(0)
  const [adminCount, setAdminCount] = useState<number>(0)
  const [recentMembers, setRecentMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showSignupModal, setShowSignupModal] = useState(false)
  const [showFreeSignupModal, setShowFreeSignupModal] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [membershipTier, setMembershipTier] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    fetchStats()
    checkUser()
    
    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
      if (session?.user) {
        checkUser()
      } else {
        setHasActiveSubscription(false)
        setIsAdmin(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    
    if (user) {
      // Check if user has active subscription
      const { data: subscriptions } = await supabase
        .from('stripe_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['active', 'trialing', 'incomplete'])
      
      // Check if user is admin and membership tier
      const { data: userData } = await supabase
        .from('users')
        .select('is_admin, membership_tier')
        .eq('id', user.id)
        .single()
      
      setHasActiveSubscription(!!subscriptions && subscriptions.length > 0 || userData?.membership_tier === 'paid')
      setIsAdmin(userData?.is_admin || false)
      setMembershipTier(userData?.membership_tier || null)
    }
  }

  async function fetchStats() {
    try {
      // Simple count query - more resilient
      const { count: userCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
      
      setMemberCount(userCount || 0)
      setAdminCount(1) // Default admin count

      // Try to fetch recent members
      const { data: members } = await supabase
        .from('users')
        .select('id, full_name, email')
        .order('created_at', { ascending: false })
        .limit(8)

      if (members) {
        setRecentMembers(members)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
      // Use defaults if there's an error
      setMemberCount(0)
      setAdminCount(1)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="p-6 pb-0">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Community</h3>
          <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-1">Build What You Need by Chris</h4>
            <p className="text-sm text-muted-foreground">
              Real builds. Real errors. Real solutions. Own everything.
            </p>
          </div>

          {/* Stats */}
          <div className="flex gap-6">
            <div>
              <p className="text-2xl font-semibold">{loading ? '...' : memberCount}</p>
              <p className="text-xs text-muted-foreground">Builders</p>
            </div>
            <div>
              <p className="text-2xl font-semibold">$97</p>
              <p className="text-xs text-muted-foreground">/month</p>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
              <span className="whitespace-normal">Save $20K+ yearly on SaaS</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
              <span className="whitespace-normal">Build your first tool in 14 days</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
              <span className="whitespace-normal">Access every tool I build</span>
            </div>
          </div>
        </div>
      </div>
      
      <CardContent className="p-6">
        {/* Member Avatars */}
        <div className="mb-4">
          <p className="text-xs text-muted-foreground mb-3">Recent members</p>
          <div className="flex -space-x-2">
            {recentMembers.slice(0, 8).map((member) => (
              <div key={member.id} className="relative group">
                <AvatarGradient 
                  seed={member.email} 
                  className="h-8 w-8 rounded-full border-2 border-background ring-0 transition-all group-hover:ring-2 group-hover:ring-ring group-hover:ring-offset-2 group-hover:ring-offset-background"
                />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded opacity-0 pointer-events-none group-hover:opacity-100 whitespace-nowrap transition-opacity">
                  {member.full_name || member.email?.split('@')[0]}
                </div>
              </div>
            ))}
            {memberCount > 8 && (
              <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                <span className="text-xs text-muted-foreground">+{memberCount - 8}</span>
              </div>
            )}
          </div>
        </div>

        {/* CTA Buttons based on user state */}
        {!user ? (
          // Not logged in - only show free access
          <Button 
            onClick={() => setShowFreeSignupModal(true)}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white"
            size="default"
          >
            Get Free Template
          </Button>
        ) : user && membershipTier === 'free' && !hasActiveSubscription && !isAdmin ? (
          // Free tier user - show upgrade
          <Button 
            onClick={() => setShowPaymentModal(true)}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white"
            size="default"
          >
            Upgrade to Premium
          </Button>
        ) : user && !hasActiveSubscription && !isAdmin ? (
          // Logged in but no tier/subscription
          <Button 
            onClick={() => setShowPaymentModal(true)}
            className="w-full"
            size="default"
          >
            Join for $97/month
          </Button>
        ) : null}
      </CardContent>

      {/* Signup Modal */}
      <SignupModal 
        open={showSignupModal} 
        onOpenChange={setShowSignupModal}
        communityName="Build What You Need by Chris"
        onLoginClick={() => {
          setShowSignupModal(false)
          setShowLoginModal(true)
        }}
      />

      {/* Free Signup Modal */}
      <FreeSignupModal 
        open={showFreeSignupModal}
        onOpenChange={setShowFreeSignupModal}
        onLoginClick={() => {
          setShowFreeSignupModal(false)
          setShowLoginModal(true)
        }}
      />

      {/* Login Modal */}
      <LoginModal
        open={showLoginModal}
        onOpenChange={setShowLoginModal}
        onSignupClick={() => {
          setShowLoginModal(false)
          setShowFreeSignupModal(true)
        }}
      />

      {/* Payment Modal */}
      <PaymentModal
        open={showPaymentModal}
        onOpenChange={setShowPaymentModal}
        user={user}
      />
    </Card>
  )
}