"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AvatarGradient } from "@/components/ui/avatar-gradient"
import { Users, User, Calendar, DollarSign, BookOpen, Code, Zap, Edit, Lock } from "lucide-react"
import Image from "next/image"
import { ProtectedNavBar } from "@/components/protected-navbar"
import Link from "next/link"
import { useState, useEffect, Suspense, useRef } from "react"
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
  const [showFloatingCTA, setShowFloatingCTA] = useState(true)
  const offerSectionRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const content = {
    title: "We Kill SaaS",
    titleSecondLine: "with Vibe Coding",
    subtitle: "Former agency owner ($600K/year) now leading a movement of entrepreneurs who build what they rent. Because the best ROI is infinite—when you own everything.",
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

  // Handle scroll to hide floating CTA when reaching offer section
  useEffect(() => {
    const handleScroll = () => {
      if (offerSectionRef.current) {
        const rect = offerSectionRef.current.getBoundingClientRect()
        const windowHeight = window.innerHeight
        // Hide when offer section is 100px from bottom of viewport
        setShowFloatingCTA(rect.top > windowHeight - 100)
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Check initial position

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
      
      {/* Floating CTA - Mobile Only */}
      <div className={`fixed bottom-0 left-0 right-0 z-40 pt-16 pb-4 px-4 bg-gradient-to-t from-white via-white/90 to-transparent pointer-events-none sm:hidden transition-all duration-300 ${
        showFloatingCTA ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      }`}>
        <div className="pointer-events-auto">
          {!user ? (
            <Button 
              onClick={() => setShowFreeSignupModal(true)}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white shadow-lg"
              size="lg"
            >
              Watch My Latest SaaS Execution →
            </Button>
          ) : user && subscriptionStatus === 'none' && !isAdmin ? (
            <Button 
              onClick={() => setShowPaymentModal(true)}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white shadow-lg"
              size="lg"
            >
              Upgrade Now
            </Button>
          ) : null}
        </div>
      </div>
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
      <div className="max-w-[1080px] mx-auto px-4 md:px-6 py-8 md:py-12 pb-24 sm:pb-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 min-w-0">
        {/* Success message after payment */}
        {searchParams.get('success') === 'true' && subscriptionStatus === 'active' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800 font-medium">
              🎉 Welcome to The SaaS Genocide! Your war against software rental begins now.
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
                  {content.subtitle}
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

            {/* Stats Badge - Horizontal */}
            <div className="px-2 sm:px-6 py-2 sm:py-3 flex items-center justify-center sm:justify-start gap-2 sm:gap-8 text-xs sm:text-base w-full">
              <div className="flex items-center gap-2 sm:gap-6 justify-between w-full sm:w-auto">
                <div className="flex items-center gap-1 sm:gap-3">
                  <Lock className="h-3 w-3 sm:h-5 sm:w-5 text-gray-700" />
                  <span className="text-gray-900 font-medium whitespace-nowrap">Private</span>
                </div>
                
                <div className="flex items-center gap-1 sm:gap-3">
                  <Users className="h-3 w-3 sm:h-5 sm:w-5 text-gray-700" />
                  <span className="text-gray-900 font-medium whitespace-nowrap">{realStats.memberCount > 1000 ? `${(realStats.memberCount / 1000).toFixed(1)}k` : realStats.memberCount || 2} members</span>
                </div>
                
                <div className="flex items-center gap-1 sm:gap-3">
                  <svg className="h-3 w-3 sm:h-5 sm:w-5 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                  </svg>
                  <span className="text-gray-900 font-medium whitespace-nowrap">Free</span>
                </div>
                
                <div className="flex items-center gap-1 sm:gap-2">
                  <Image 
                    src="/logo.png" 
                    alt="AI Chris Lee" 
                    width={16} 
                    height={16} 
                    className="w-4 h-4 sm:w-6 sm:h-6 rounded-full"
                  />
                  <span className="text-gray-900 font-medium whitespace-nowrap">By AI Chris Lee</span>
                </div>
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
                <h2 className="text-2xl font-bold">Welcome to The SaaS Genocide</h2>
                <p>
                  We're the AI Chris Lee community. Every Sunday, we pick a tool we're sick of paying for, build a better version with <strong>vibe coding in 20 hours</strong>, and kill the subscription.
                </p>
                <p>
                  Then we show you exactly how we did it. No fluff. No theory. Just raw footage of us vibe coding with AI and <strong>taking back control</strong>.
                </p>
                <div className="space-y-2 pl-4 border-l-2 border-gray-200">
                  <p className="text-sm"><strong>✓ Assassinated Skool</strong> (saved $1,188/year)</p>
                  <p className="text-sm"><strong>→ Next Target: GoHighLevel</strong> ($497/month - $5,964/year)</p>
                </div>
              </div>

              {/* Why We Started This War */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Why We Started This War</h2>
                <p>
                  Was bleeding <strong>$10,000/month</strong> to SaaS companies. Not because we couldn't afford it—we're businesspeople. We care about ROI.
                </p>
                <div className="bg-gray-50 border-l-4 border-gray-900 p-4 my-6">
                  <p className="font-semibold mb-2">The Math:</p>
                  <p>• Renting: $10K/month × Forever = <strong>Infinite cost, zero ownership</strong></p>
                  <p>• Vibe Coding: 20 hours × Once = <strong>Infinite ownership, infinite control</strong></p>
                </div>
                <p>
                  Now we own our entire tech stack. And we're teaching you to do the same.
                </p>
              </div>

              {/* What You'll Learn */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">The 4 Step Vibe Blueprint</h2>
                <div className="bg-gray-50 border-l-4 border-gray-900 p-4 my-6">
                  <ol className="space-y-2">
                    <li><strong>1. Target:</strong> Pick your most hated SaaS</li>
                    <li><strong>2. Clone:</strong> Vibe code exactly what you need with AI</li>
                    <li><strong>3. Improve:</strong> Add features they refused to build</li>
                    <li><strong>4. Liberate:</strong> Export, migrate, cancel forever</li>
                  </ol>
                </div>
                <p>
                  Every week, new execution. Every week, new freedom.
                </p>
              </div>

              {/* Free vs Premium */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Free: Get The Skool Clone Sprint Deck</h2>
                <p>
                  <strong>14 Days to Kill Skool - Complete Blueprint</strong>
                </p>
                <ul className="space-y-1 text-sm pl-4">
                  <li>• Full build process (errors included)</li>
                  <li>• Vibe coding with AI demonstrations</li>
                  <li>• Cancellation ceremonies</li>
                  <li>• Source code shared</li>
                </ul>
                <p className="text-sm text-muted-foreground mt-4">
                  Get my exact 14-day sprint deck that shows how I assassinated Skool. Every file, every error, every line of code. This is the lead magnet that started the movement.
                </p>
              </div>

              {/* Premium: Join The Revolution */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Premium: Join The Revolution</h2>
                <div className="space-y-3 mt-4">
                  <div>
                    <p className="font-semibold">📚 The 4 Step Vibe Blueprint Course</p>
                    <p className="text-sm text-muted-foreground">4 modules, 14 days to first kill. From zero to deployed. Every error documented. Templates included.</p>
                  </div>
                  <div>
                    <p className="font-semibold">🎯 Weekly Office Hours</p>
                    <p className="text-sm text-muted-foreground">Monday 10am EST, Thursday 2pm EST. Live debugging sessions.</p>
                  </div>
                  <div>
                    <p className="font-semibold">💾 Ready-to-Deploy Arsenal</p>
                    <p className="text-sm text-muted-foreground">Every tool we've killed. One-click deployment. Full customization. Yours forever.</p>
                  </div>
                  <div>
                    <p className="font-semibold">⚔️ 24/7 War Room Access</p>
                    <p className="text-sm text-muted-foreground">Get help from builders who've already killed their SaaS.</p>
                  </div>
                </div>
              </div>

              {/* The Offer */}
              <div ref={offerSectionRef} className="space-y-4 border-t pt-8">
                <h2 className="text-2xl font-bold">The Choice Is Yours</h2>
                <div className="grid grid-cols-2 gap-4 my-6">
                  <div>
                    <p className="font-semibold mb-2">Keep Renting:</p>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Pay forever</li>
                      <li>• Beg for features</li>
                      <li>• Accept price hikes</li>
                      <li>• Fear shutdowns</li>
                      <li>• Stay dependent</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold mb-2">Start Owning:</p>
                    <ul className="text-sm space-y-1">
                      <li>• Build once</li>
                      <li>• Control everything</li>
                      <li>• Pay hosting only</li>
                      <li>• Fear nothing</li>
                      <li>• Become sovereign</li>
                    </ul>
                  </div>
                </div>
                {user && subscriptionStatus === 'active' ? (
                  <Button 
                    onClick={() => router.push('/threads')} 
                    size="lg" 
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white h-14 text-base font-medium"
                  >
                    Enter The War Room
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
                      {checkingPayment ? 'Loading...' : 'Watch My Latest SaaS Execution →'}
                    </Button>
                    <Button 
                      onClick={handleJoinClick} 
                      size="lg" 
                      variant="outline"
                      className="w-full border-gray-900 text-gray-900 hover:bg-gray-100 h-14 text-base font-medium"
                      disabled={checkingPayment}
                    >
                      Join The AI Chris Lee Community ($97/mo)
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
                    {checkingPayment ? 'Loading...' : 'Watch My Latest SaaS Execution →'}
                  </Button>
                )}
                <p className="text-sm text-muted-foreground text-center">
                  {user && subscriptionStatus === 'active' 
                    ? "We're the AI Chris Lee community. We kill SaaS with vibe coding." 
                    : "Join us, or keep renting. Your choice."}
                </p>
              </div>
            </div>
        </div>
          </div>
          
          {/* Right Column - Community Badge */}
          <aside className="w-full lg:w-[320px] shrink-0 mt-8 lg:mt-0">
            <div className="lg:sticky lg:top-[90px]">
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
            "@type": "EducationalOrganization",
            "name": "The SaaS Genocide",
            "alternateName": "Build What You Need",
            "description": "Learn vibe coding with AI Chris Lee. Build SaaS replacements in hours using AI. Kill your SaaS bills forever.",
            "url": "https://buildwhatyouneed.com",
            "logo": "https://buildwhatyouneed.com/logo.png",
            "image": "https://buildwhatyouneed.com/saas-genocide-hero.jpg",
            "founder": {
              "@type": "Person",
              "name": "AI Chris Lee",
              "url": "https://aichrislee.com",
              "sameAs": [
                "https://www.youtube.com/@AIChrisLee",
                "https://x.com/AiChrisLee"
              ]
            },
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD",
              "availability": "https://schema.org/InStock",
              "validFrom": "2025-07-04",
              "name": "Vibe Coding Blueprint - Free Access",
              "description": "Learn vibe coding with AI. Build SaaS replacements in hours. Free blueprints, weekly builds, source code access."
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.9",
              "reviewCount": "2100",
              "bestRating": "5",
              "worstRating": "1"
            },
            "teaches": ["Vibe Coding", "AI Development", "SaaS Replacement", "Claude AI", "Cursor IDE"],
            "keywords": "vibe coding, AI development, SaaS replacement, AI Chris Lee, build with AI"
          })
        }}
      />
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
        <HomePageContent />
      </Suspense>
    </>
  )
}