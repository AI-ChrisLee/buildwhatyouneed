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
import { FreeSignupModal } from "@/components/free-signup-modal"
import { LoginModal } from "@/components/login-modal"
import { cn } from "@/lib/utils"

function HomePageContent() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [realStats, setRealStats] = useState({
    memberCount: 0,
    adminCount: 0
  })
  const [recentMembers, setRecentMembers] = useState<any[]>([])
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showFreeSignupModal, setShowFreeSignupModal] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [checkingPayment, setCheckingPayment] = useState(false)
  const [subscriptionStatus, setSubscriptionStatus] = useState<'loading' | 'none' | 'active' | 'past_due'>('loading')
  const [selectedHeroImage, setSelectedHeroImage] = useState(0)
  const router = useRouter()
  const searchParams = useSearchParams()
  const content = {
    title: "Build What You Need",
    titleSecondLine: "With Vibe Coding",
    subtitle: "Join The SaaS Genocide. Own your tools instead of renting them.",
    personalMission: "Join The SaaS Genocide. Own your tools instead of renting them.",
    mainDescription: "A community of builders using vibe coding to replace every SaaS subscription.",
    memberCount: "2k",
    onlineCount: "8",
    adminCount: "10",
    myStats: {
      killed: 23,
      saved: "$2,847/month",
      communityTotal: 312
    },
    learnItems: [
      "Why we're ending the SaaS subscription model forever",
      "How vibe coding lets anyone build in hours, not months",
      "What we've built: 312 SaaS replacements and counting"
    ],
    benefitItems: [
      "Weekly live builds - watch entrepreneurs kill their subscriptions",
      "The 4 Step Vibe Blueprint Course - our proven replacement blueprint",
      "Ready to use templates from every community build",
      "Every week we kill a SaaS company"
    ],
    footerText: "Watch our first execution free. Join the revolution when you're ready."
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
      <div className="max-w-[1080px] mx-auto px-4 md:px-6 py-8 md:py-12">
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
            <div className="space-y-6">
              {/* Title and Subtitle */}
              <div className="space-y-3">
                <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
                  {content.title} <br className="hidden md:block" />
                  {content.titleSecondLine}
                </h1>
                <p className="text-lg text-muted-foreground max-w-3xl">
                  Join The SaaS Genocide. <span className="font-semibold text-foreground">Own your tools instead of renting them.</span>
                </p>
              </div>

              {/* Main Preview */}
              <div className="space-y-4">
                <div className="rounded-xl overflow-hidden relative aspect-[16/9] bg-black transition-all hover:shadow-xl">
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
                
                {/* Thumbnail Images - Horizontal */}
                <div className="flex gap-2">
                  {[0, 1, 2, 3, 4].map((index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedHeroImage(index)}
                      className={`relative aspect-[16/9] w-[120px] rounded-lg overflow-hidden transition-all duration-300 ${
                        selectedHeroImage === index 
                          ? 'ring-2 ring-primary ring-offset-2 scale-105' 
                          : 'hover:opacity-80 hover:scale-105'
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
                            <span className="text-white/60 text-xs">{index}</span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Stats - Only 4 key items */}
            <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-red-600">☠️</span>
                <span className="font-semibold">{content.myStats.communityTotal} SaaS killed</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="font-semibold">{realStats.memberCount || 312} builders</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                <span className="font-semibold">$20K+ saved/year</span>
              </div>
            </div>


            {/* Recent Members */}
            {recentMembers.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Recent members</h3>
                <div className="flex -space-x-2">
                  {recentMembers.slice(0, 10).map((member, index) => (
                    <div key={member.id} className="relative group">
                      <AvatarGradient 
                        seed={member.email} 
                        className="h-10 w-10 rounded-full border-2 border-background ring-0 transition-all group-hover:ring-2 group-hover:ring-ring group-hover:ring-offset-2 group-hover:ring-offset-background group-hover:scale-110"
                      />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded opacity-0 pointer-events-none group-hover:opacity-100 whitespace-nowrap transition-all">
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

            {/* Description - Blog Style */}
            <div className="space-y-8 text-base leading-relaxed">
              {/* The Problem */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">You own nothing.</h2>
                <p>
                  Every month, you send <strong>$3,000+</strong> to SaaS companies. They <strong>raise prices</strong> whenever they want. 
                  They <strong>shut down features</strong> you depend on. They hold <strong>your data hostage</strong>.
                </p>
                <p>
                  When you need a simple feature, they tell you <strong>"maybe next quarter."</strong> Your business 
                  <strong> suffers while you wait</strong> for permission to grow. Meanwhile, your monthly payments 
                  fund <strong>their next yacht</strong>.
                </p>
              </div>

              {/* Our Tool Stack */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Our weapons of mass construction.</h2>
                <p>
                  We use the <strong>exact same tools</strong> that million-dollar startups use. But instead of 
                  building products to sell, we build tools to <strong>own forever</strong>.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                    <div className="text-2xl mb-2">🤖</div>
                    <p className="font-semibold">Claude</p>
                    <p className="text-xs text-muted-foreground">AI pair programmer</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                    <div className="text-2xl mb-2">⚡</div>
                    <p className="font-semibold">Cursor</p>
                    <p className="text-xs text-muted-foreground">AI-powered editor</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                    <div className="text-2xl mb-2">🗄️</div>
                    <p className="font-semibold">Supabase</p>
                    <p className="text-xs text-muted-foreground">Database & auth</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                    <div className="text-2xl mb-2">🚀</div>
                    <p className="font-semibold">Vercel</p>
                    <p className="text-xs text-muted-foreground">Instant deployment</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Total cost: <strong>$0-200/month</strong>. Build unlimited tools. Deploy unlimited times. 
                  <strong>Own everything forever.</strong>
                </p>
              </div>

              {/* The Revelation */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Every SaaS company is afraid of one thing.</h2>
                <p>
                  That you'll discover how <strong>easy it is to build</strong> their tools yourself. With AI and 
                  vibe coding, you can replace any SaaS in <strong>hours, not months</strong>. <strong>No coding experience needed</strong>.
                </p>
                  <p>
                  We will kill <strong>312 SaaS subscriptions</strong>. Calendly, Typeform, Linktree - all 
                  replaced with <strong>better versions we actually own</strong>. Total time to build each one? 
                  <strong>Less than a day</strong>.
                </p>
              </div>

              {/* The Movement */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Join The SaaS Genocide.</h2>
                <p>
                  Every week, our community picks a SaaS to execute. Chris builds it live while 
                  hundreds follow along. <strong>You get the code. You own it forever. You save thousands.</strong>
                </p>
                <div className="bg-gray-50 border-l-4 border-gray-900 p-4 my-6">
                  <p className="font-semibold mb-2">The 4 Step Vibe Blueprint:</p>
                  <ol className="space-y-2 text-sm">
                    <li>1. <strong>Target:</strong> Pick your most expensive SaaS</li>
                    <li>2. <strong>Clone:</strong> Build the core features with AI</li>
                    <li>3. <strong>Improve:</strong> Add the features they refused to build</li>
                    <li>4. <strong>Liberate:</strong> Export your data and cancel forever</li>
                  </ol>
                </div>
              </div>

              {/* What You Get */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Here's exactly what you get:</h2>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <span className="text-2xl">📚</span>
                    <div>
                      <p className="font-semibold">The 4 Step Vibe Blueprint Course</p>
                      <p className="text-sm text-muted-foreground">4 modules teaching our exact process. From zero to deployed in 14 days.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-2xl">🎯</span>
                    <div>
                      <p className="font-semibold">Weekly Live Executions</p>
                      <p className="text-sm text-muted-foreground">Every Thursday 2pm EST. Watch Chris kill a $200+ SaaS tool live.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-2xl">💾</span>
                    <div>
                      <p className="font-semibold">Ready-to-Deploy Templates</p>
                      <p className="text-sm text-muted-foreground">Every tool replacement. One-click deploy. Full source code.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-2xl">⚔️</span>
                    <div>
                      <p className="font-semibold">24/7 War Room Access</p>
                      <p className="text-sm text-muted-foreground">Get help from 300+ builders who've already killed their SaaS.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* The Offer */}
              <div className="space-y-4 border-t pt-8">
                <h2 className="text-2xl font-bold">Start free. Kill your first SaaS in 14 days.</h2>
                <p>
                  Get instant access to <strong>Module 1 of the 4 Step Vibe Blueprint</strong>. Learn target selection. 
                  Pick your victim. Join our next <strong>live execution</strong>.
                </p>
                <p className="font-semibold">
                  Then upgrade for $97/month - less than ONE SaaS subscription you'll kill.
                </p>
                {user && subscriptionStatus === 'active' ? (
                  <Button 
                    onClick={() => router.push('/threads')} 
                    size="lg" 
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white h-14 text-base font-medium"
                  >
                    Enter The Movement
                  </Button>
                ) : user ? (
                  // Logged in but no subscription
                  <div className="space-y-3">
                    <Button 
                      onClick={() => router.push('/classroom')} 
                      size="lg" 
                      className="w-full bg-gray-900 hover:bg-gray-800 text-white h-14 text-base font-medium"
                      disabled={checkingPayment}
                    >
                      {checkingPayment ? 'Loading...' : 'Start Building Now'}
                    </Button>
                    <Button 
                      onClick={handleJoinClick} 
                      size="lg" 
                      variant="outline"
                      className="w-full border-gray-900 text-gray-900 hover:bg-gray-100 h-14 text-base font-medium"
                      disabled={checkingPayment}
                    >
                      Join The Movement
                    </Button>
                  </div>
                ) : (
                  // Not logged in - only show free access
                  <Button 
                    onClick={() => setShowFreeSignupModal(true)} 
                    size="lg" 
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white h-14 text-base font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
                    disabled={checkingPayment}
                  >
                    {checkingPayment ? 'Loading...' : 'Start Building Now'}
                  </Button>
                )}
                <p className="text-sm text-muted-foreground text-center">
                  {user && subscriptionStatus === 'active' 
                    ? "Your next execution awaits." 
                    : "No credit card required. Cancel anytime."}
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
    </div>
  )
}

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "The SaaS Genocide",
            "description": "Ending SaaS subscriptions forever. We teach vibe coding to build tools in hours, not months. 312+ SaaS killed. Join 2k+ builders.",
            "url": "https://buildwhatyouneed.com",
            "logo": "https://buildwhatyouneed.com/logo-toggle.svg",
            "founder": {
              "@type": "Organization",
              "name": "The SaaS Genocide",
              "url": "https://buildwhatyouneed.com",
              "description": "Community of builders replacing SaaS with vibe coding."
            },
            "offers": {
              "@type": "Offer",
              "price": "97",
              "priceCurrency": "USD",
              "availability": "https://schema.org/InStock",
              "validFrom": "2025-07-04",
              "name": "The SaaS Genocide Community",
              "description": "Learn vibe coding. Watch weekly builds. Get complete source code. The 4 Step Vibe Blueprint. Join 2k+ builders. Replace your first SaaS in 14 days."
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.9",
              "reviewCount": "312",
              "bestRating": "5",
              "worstRating": "1"
            }
          })
        }}
      />
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
        <HomePageContent />
      </Suspense>
    </>
  )
}