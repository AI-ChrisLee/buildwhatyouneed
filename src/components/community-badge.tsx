"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Sparkles, Lock } from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { SignupModal } from "@/components/signup-modal"
import { FreeSignupModal } from "@/components/free-signup-modal"
import { LoginModal } from "@/components/login-modal"
import PaymentModal from "@/components/payment-modal"
import { AvatarGradient } from "@/components/ui/avatar-gradient"
import Image from "next/image"
import Link from "next/link"

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
    <Card className="overflow-hidden border shadow-sm">
      {/* Header with Roman emperor image */}
      <div className="relative h-48 bg-black overflow-hidden">
        {/* Roman emperor image */}
        <Image 
          src="/saas-genocide-hero.jpg" 
          alt="The SaaS Genocide by AI Chris Lee - Vibe Coding Hero Image"
          fill
          className="object-cover"
          priority
          sizes="(max-width: 768px) 100vw, 320px"
          onError={(e) => {
            // Hide image if it fails to load
            e.currentTarget.style.display = 'none';
          }}
        />
        
        {/* Strong gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
        
        {/* Text overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-10">
          <h3 className="text-2xl font-bold drop-shadow-lg">The SaaS Genocide</h3>
          <p className="text-sm mt-1 text-white/90 drop-shadow-lg">By AI Chris Lee</p>
        </div>
      </div>
      
      <div className="p-6 space-y-4">
        {/* Community Info */}
        <div>
          <p className="text-sm text-muted-foreground text-gray-500">
            aichrislee.com
          </p>
        </div>
        
        <p className="text-sm">
          We kill SaaS with vibe coding. Every Saturday, watch us build replacements for tools you're sick of paying for.
        </p>
        
        {/* Links */}
        <div className="space-y-2 text-sm">
          <a href="https://www.youtube.com/@AIChrisLee" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
            <span className="text-gray-400">🔗</span>
            <span>YouTube</span>
          </a>
          <a href="https://x.com/AiChrisLee" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
            <span className="text-gray-400">🔗</span>
            <span>X</span>
          </a>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 py-4 border-y">
          <div className="text-center">
            <p className="text-2xl font-bold">{loading ? '...' : memberCount > 1000 ? `${(memberCount / 1000).toFixed(1)}k` : memberCount || '2.1k'}</p>
            <p className="text-xs text-muted-foreground">Members</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{loading ? '...' : adminCount || 10}</p>
            <p className="text-xs text-muted-foreground">Admins</p>
          </div>
        </div>
        
        {/* Member Avatars - Left aligned */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Recent members</p>
          <div className="flex -space-x-2">
            {recentMembers.slice(0, 8).map((member) => (
              <div key={member.id} className="relative group">
                <AvatarGradient 
                  seed={member.email} 
                  className="h-8 w-8 rounded-full border-2 border-white ring-0 transition-all group-hover:ring-2 group-hover:ring-ring group-hover:ring-offset-2"
                />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded opacity-0 pointer-events-none group-hover:opacity-100 whitespace-nowrap transition-opacity z-10">
                  {member.full_name || member.email?.split('@')[0]}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* CTA Button */}
        {!user ? (
          <Button 
            onClick={() => setShowFreeSignupModal(true)}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white"
            size="lg"
          >
            Join The SaaS Genocide
          </Button>
        ) : user && membershipTier === 'free' && !hasActiveSubscription && !isAdmin ? (
          <Button 
            onClick={() => setShowPaymentModal(true)}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white"
            size="lg"
          >
            Upgrade to Premium
          </Button>
        ) : null}
      </div>

      {/* Signup Modal */}
      <SignupModal 
        open={showSignupModal} 
        onOpenChange={setShowSignupModal}
        communityName="The SaaS Genocide"
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