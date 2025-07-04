"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AvatarGradient } from "@/components/ui/avatar-gradient"
import { Users, User, Calendar, DollarSign, BookOpen, Code, Zap, Edit, Lock } from "lucide-react"
import { ProtectedNavBar } from "@/components/protected-navbar"
import Link from "next/link"
import { useState, useEffect, Suspense } from "react"
import { createClient } from "@/lib/supabase/client"
import { isCurrentUserAdmin } from "@/lib/supabase/admin-actions"
import PaymentModal from "@/components/payment-modal"
import { useRouter, useSearchParams } from "next/navigation"
import { CommunityBadge } from "@/components/community-badge"

function HomePageContent() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [realStats, setRealStats] = useState({
    memberCount: 0,
    adminCount: 0
  })
  const [recentMembers, setRecentMembers] = useState<any[]>([])
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [checkingPayment, setCheckingPayment] = useState(false)
  const [subscriptionStatus, setSubscriptionStatus] = useState<'loading' | 'none' | 'active' | 'past_due'>('loading')
  const [selectedHeroImage, setSelectedHeroImage] = useState(0)
  const router = useRouter()
  const searchParams = useSearchParams()
  const content = {
    title: "Build What You Need",
    subtitle: "Stop paying for SaaS. Start building.",
    mainDescription: "The days of overpriced SaaS are over.",
    memberCount: "2k",
    onlineCount: "8",
    adminCount: "10",
    learnItems: [
      "Build tools that replace expensive SaaS subscriptions",
      "Save thousands of dollars per month",
      "Own your tools and data completely"
    ],
    benefitItems: [
      "Access to code templates that replace $1000s in SaaS costs",
      "Step-by-step courses on building your own tools",
      "Community support from experienced builders",
      "Weekly challenges to practice your skills"
    ],
    footerText: "Join for just $97/month. Cancel anytime."
  }
  const supabase = createClient()

  useEffect(() => {
    checkAdminStatus()
    fetchRealStats()
    checkUser()
    setLoading(false)
  }, [])

  async function checkAdminStatus() {
    const adminStatus = await isCurrentUserAdmin()
    setIsAdmin(adminStatus)
  }

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    
    if (user) {
      // Check subscription status
      const { data: subscriptions } = await supabase
        .from('stripe_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
      
      if (subscriptions && subscriptions.length > 0) {
        setSubscriptionStatus('active')
      } else {
        setSubscriptionStatus('none')
      }
    } else {
      setSubscriptionStatus('none')
    }
  }

  // Subscribe to auth changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  async function handleJoinClick() {
    setCheckingPayment(true)
    
    if (!user) {
      // Not logged in, redirect to signup
      router.push('/signup')
      return
    }

    // Check if user already has a subscription
    const { data: subscriptions } = await supabase
      .from('stripe_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
    
    const subscription = subscriptions && subscriptions.length > 0 ? subscriptions[0] : null

    if (subscription) {
      // Already subscribed, redirect to threads
      router.push('/threads')
    } else {
      // Show payment modal
      setShowPaymentModal(true)
    }
    
    setCheckingPayment(false)
  }

  async function fetchRealStats() {
    try {
      // Try to fetch member count - don't let errors break the page
      const { count: memberCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
      
      setRealStats({
        memberCount: memberCount || 0,
        adminCount: 1
      })

      // Try to fetch recent members - if it fails, just use empty array
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
      // Don't crash - just use defaults
      setRealStats({
        memberCount: 0,
        adminCount: 1
      })
    }
  }


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <ProtectedNavBar />
      {/* Admin Edit Button */}
      {isAdmin && (
        <div className="border-b">
          <div className="max-w-[1080px] mx-auto px-4 md:px-6 py-3 flex justify-end">
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/home">
                <Edit className="h-4 w-4 mr-2" />
                Edit Page
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="max-w-[1080px] mx-auto px-4 md:px-6 py-6">
        <div className="flex gap-6">
          <div className="flex-1 min-w-0">
        {/* Success message after payment */}
        {searchParams.get('success') === 'true' && subscriptionStatus === 'active' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800 font-medium">
              🎉 Welcome to Build What You Need! Your membership is now active.
            </p>
          </div>
        )}
        
        <div className="space-y-8">
            {/* Hero Section */}
            <div className="space-y-4">
              {/* Main Hero */}
              <div className="rounded-xl overflow-hidden relative aspect-[16/9]">
                {/* Different content based on selected image */}
                <div className={`absolute inset-0 bg-gradient-to-br ${
                  selectedHeroImage === 0 ? 'from-gray-900 to-gray-800' :
                  selectedHeroImage === 1 ? 'from-blue-900 to-blue-800' :
                  selectedHeroImage === 2 ? 'from-green-900 to-green-800' :
                  selectedHeroImage === 3 ? 'from-purple-900 to-purple-800' :
                  'from-pink-900 to-pink-800'
                }`}>
                  {/* Placeholder for Wistia video or images - will be replaced with actual content */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    {selectedHeroImage === 0 ? (
                      // Main video placeholder
                      <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                        </svg>
                      </div>
                    ) : (
                      // Image placeholder
                      <div className="text-center">
                        <div className="text-white/60 text-2xl font-medium">Image {selectedHeroImage}</div>
                        <p className="text-white/40 text-sm mt-2">Placeholder for actual image content</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Thumbnail Images */}
              <div className="grid grid-cols-5 gap-2">
                {[0, 1, 2, 3, 4].map((index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedHeroImage(index)}
                    className={`relative aspect-video rounded-lg overflow-hidden transition-all ${
                      selectedHeroImage === index 
                        ? 'ring-2 ring-primary ring-offset-2' 
                        : 'hover:opacity-80'
                    }`}
                  >
                    <div className={`w-full h-full bg-gradient-to-br ${
                      index === 0 ? 'from-gray-700 to-gray-600' :
                      index === 1 ? 'from-blue-700 to-blue-600' :
                      index === 2 ? 'from-green-700 to-green-600' :
                      index === 3 ? 'from-purple-700 to-purple-600' :
                      'from-pink-700 to-pink-600'
                    }`}>
                      <div className="absolute inset-0 flex items-center justify-center">
                        {index === 0 ? (
                          <svg className="w-6 h-6 text-white/60" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                          </svg>
                        ) : (
                          <span className="text-white/60 text-xs">Image {index}</span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                <span>Private</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="font-semibold text-foreground">{realStats.memberCount > 1000 ? `${(realStats.memberCount / 1000).toFixed(1)}k` : realStats.memberCount || '2.1k'} members</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">$97/month</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"></div>
                <span>By AI Chris Lee</span>
              </div>
            </div>

            {/* Recent Members */}
            {recentMembers.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Recent members</h3>
                <div className="flex -space-x-2">
                  {recentMembers.slice(0, 10).map((member) => (
                    <div key={member.id} className="relative group">
                      <AvatarGradient 
                        seed={member.email} 
                        className="h-10 w-10 rounded-full border-2 border-background ring-0 transition-all group-hover:ring-2 group-hover:ring-ring group-hover:ring-offset-2 group-hover:ring-offset-background"
                      />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded opacity-0 pointer-events-none group-hover:opacity-100 whitespace-nowrap transition-opacity">
                        {member.full_name || member.email?.split('@')[0]}
                      </div>
                    </div>
                  ))}
                  {realStats.memberCount > 10 && (
                    <div className="h-10 w-10 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">+{realStats.memberCount - 10}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="space-y-6">
              <p className="text-base leading-relaxed">
                {content.mainDescription}
              </p>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Learn how to:</h3>
                <div className="space-y-3">
                  {content.learnItems.map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-medium">{index + 1}</span>
                      </div>
                      <span className="text-sm leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Here's what you get:</h3>
                <div className="grid gap-3">
                  {content.benefitItems.map((item, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                      <Zap className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg bg-muted/50 p-6 text-center space-y-4">
                <p className="text-base">
                  {content.footerText}
                </p>
                <Button 
                  onClick={handleJoinClick} 
                  size="lg" 
                  className="min-w-[200px]"
                  disabled={checkingPayment}
                >
                  {checkingPayment ? 'Loading...' : 
                   (user && subscriptionStatus === 'active') ? 'View Community' : 
                   'Join Now'}
                </Button>
                <p className="text-sm text-muted-foreground">
                  Join while it lasts.
                </p>
              </div>
            </div>
        </div>
          </div>
          
          {/* Right Column - Community Badge (Desktop Only) */}
          <aside className="hidden lg:block w-[280px] shrink-0">
            <div className="sticky top-[90px]">
              <CommunityBadge />
            </div>
          </aside>
        </div>
      </div>

        {/* Payment Modal */}
        <PaymentModal 
          open={showPaymentModal} 
          onOpenChange={setShowPaymentModal}
          user={user}
        />
    </div>
  )
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <HomePageContent />
    </Suspense>
  )
}