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
import { useAuth } from "@/providers/auth-provider"
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
  const [checkingPayment, setCheckingPayment] = useState(false)
  const [subscriptionStatus, setSubscriptionStatus] = useState<'loading' | 'none' | 'active' | 'past_due'>('loading')
  const [showFloatingCTA, setShowFloatingCTA] = useState(true)
  const offerSectionRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading } = useAuth()
  const supabase = createClient()
  const content = {
    title: "We Build Micro SaaS with AI to Take Back Control",
    titleSecondLine: "",
    subtitle: "Use AI to build your own in a week. Own everything."
  }

  useEffect(() => {
    checkAdminStatus()
    fetchRealStats()
    setLoading(false)
  }, [])
  
  useEffect(() => {
    if (!authLoading && user) {
      checkSubscriptionStatus()
    } else if (!authLoading && !user) {
      setSubscriptionStatus('none')
    }
  }, [authLoading, user])

  async function checkAdminStatus() {
    const adminStatus = await isCurrentUserAdmin()
    setIsAdmin(adminStatus)
  }

  async function checkSubscriptionStatus() {
    if (!user) {
      setSubscriptionStatus('none')
      return
    }
    
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
  }


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


  if (loading || authLoading) {
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
      {subscriptionStatus !== 'active' && (
        <div className={`fixed bottom-0 left-0 right-0 z-40 pt-8 pb-4 px-4 bg-gradient-to-t from-white via-white to-transparent pointer-events-none sm:hidden transition-all duration-300 ${
          showFloatingCTA ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}>
          <div className="pointer-events-auto">
            <Button 
              onClick={user ? () => setShowPaymentModal(true) : () => setShowFreeSignupModal(true)}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white shadow-lg"
              size="lg"
            >
              {user && subscriptionStatus === 'none' ? 'Get Full Access' : 'Join Control OS'}
            </Button>
          </div>
        </div>
      )}
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
              🎉 Welcome to Control OS! Your journey to software ownership begins now.
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
              {/* VSL Video Section */}
              <div className="rounded-xl overflow-hidden relative aspect-[16/9] bg-black transition-all hover:shadow-xl">
                <iframe 
                  src="https://www.loom.com/embed/f48226d6625f4986bea2f6a3167fb75c?sid=f8e19d3c-a84a-4623-966d-75912e4ef63d" 
                  allowFullScreen 
                  className="absolute top-0 left-0 w-full h-full border-0"
                />
              </div>
            </div>



            {/* Recent Members */}
            {recentMembers.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Recent members</h3>
                <div className="flex -space-x-1 sm:-space-x-2">
                  {recentMembers.slice(0, 10).map((member) => (
                    <div key={member.id} className="relative group">
                      <AvatarGradient 
                        seed={member.email} 
                        className="h-8 w-8 sm:h-10 sm:w-10 rounded-full border-2 border-background ring-0 transition-all group-hover:ring-2 group-hover:ring-ring group-hover:ring-offset-2 group-hover:ring-offset-background group-hover:scale-110"
                      />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded opacity-0 pointer-events-none group-hover:opacity-100 whitespace-nowrap transition-all">
                        {member.full_name || member.email?.split('@')[0]}
                      </div>
                    </div>
                  ))}
                  {realStats.memberCount > 10 && (
                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                      <span className="text-[10px] sm:text-xs text-muted-foreground">+{realStats.memberCount - 10}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Description - Blog Style */}
            <div className="space-y-8 text-base leading-relaxed">
              {/* The Problem */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Welcome to Control OS</h2>
                <p>
                  Every Sunday, I pick a tool we're sick of paying for, build a better version with <strong>AI in a week</strong>, and take back control.
                </p>
                <p>
                  Then I show you exactly how I did it. No fluff. No theory. Just raw footage of me vibe coding with AI and <strong>owning my tools</strong>.
                </p>
              </div>

              {/* Why We Started Building */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Why We Started Building</h2>
                <p>
                  I ran a $600K Web agency. 40K YouTube subscribers. Even became a Naver AI Ambassador.
                </p>
                <p>
                  Then SaaS companies broke me:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Feature requests: <strong>DENIED</strong></li>
                  <li>API limits hit during launches</li>
                  <li>Prices doubled overnight</li>
                </ul>
                <p className="mt-4">
                  I realized I wasn't a business owner. <strong>I was a hostage</strong>. I didn't want to beg for features anymore. I wanted control.
                </p>
                <p>
                  So I quit. Moved to Vancouver. Started building <strong>micro SaaS with AI</strong>.
                </p>
              </div>

              {/* What You'll Learn */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">The 4 Step AI Control Blueprint</h2>
                <div className="bg-gray-50 border-l-4 border-gray-900 p-4 my-6">
                  <ol className="space-y-2">
                    <li><strong>1. Target:</strong> Pick your most hated SaaS</li>
                    <li><strong>2. Clone:</strong> Use AI to recreate what you need</li>
                    <li><strong>3. Improve:</strong> Add features they refused to build</li>
                    <li><strong>4. Own:</strong> Export, migrate, control forever</li>
                  </ol>
                </div>
                <p>
                  Every week, new execution. Every week, new freedom.
                </p>
              </div>

              {/* Free vs Premium */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Free: Get 1 Day Sprint Deck</h2>
                <ul className="space-y-1 pl-4">
                  <li>• 1-Day Build Example (Community)</li>
                  <li>• Exact build process instructions</li>
                  <li>• AI prompts & demonstrations</li>
                  <li>• Architecture decisions</li>
                </ul>
                <p className="mt-4">
                  You can take back control from other SaaS.
                </p>
              </div>

              {/* Premium: Join The Build Movement */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Premium: Join The Build Movement</h2>
                <div className="space-y-3 mt-4">
                  <div>
                    <p className="font-semibold">📚 The 4 Step AI Control Blueprint</p>
                    <p className="text-sm text-muted-foreground">AI build system that works every time. Templates included.</p>
                  </div>
                  <div>
                    <p className="font-semibold">🎯 Weekly Office Hours</p>
                    <p className="text-sm text-muted-foreground">Monday 10am EST, Thursday 2pm EST. Live debugging sessions.</p>
                  </div>
                  <div>
                    <p className="font-semibold">💾 Ready-to-Deploy Arsenal</p>
                    <p className="text-sm text-muted-foreground">Micro SaaS blueprints ready to customize.</p>
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
                      <li>• Stay dependent</li>
                      <li>• Stay powerless</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold mb-2">Start Owning:</p>
                    <ul className="text-sm space-y-1">
                      <li>• Build once</li>
                      <li>• Control everything</li>
                      <li>• Pay nothing ever</li>
                      <li>• Be sovereign</li>
                      <li>• Become sovereign</li>
                    </ul>
                  </div>
                </div>
                {user && subscriptionStatus === 'active' ? null : (
                  // Not logged in or no subscription - show paid CTA
                  <Button 
                    onClick={user ? handleJoinClick : () => setShowFreeSignupModal(true)} 
                    size="lg" 
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white h-14 text-base font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
                    disabled={checkingPayment}
                  >
                    {checkingPayment ? 'Loading...' : (user && subscriptionStatus === 'none' ? 'Get Full Access' : 'Join Control OS')}
                  </Button>
                )}
                <p className="text-sm text-muted-foreground text-center">
                  {user && subscriptionStatus === 'active' 
                    ? "Welcome to Control OS. Build what you need, own what you build." 
                    : "Join us, or keep renting. Your choice."}
                </p>
              </div>
            </div>
        </div>
          </div>
          
          {/* Right Column - Community Badge */}
          <aside className="hidden lg:block w-full lg:w-[320px] shrink-0 mt-8 lg:mt-0">
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
            "name": "Control OS",
            "alternateName": "Build What You Need",
            "description": "Build micro SaaS with AI to take back control. Every week, watch AI Chris Lee replace tools that hold businesses hostage.",
            "url": "https://buildwhatyouneed.com",
            "logo": "https://buildwhatyouneed.com/logo.png",
            "image": "https://buildwhatyouneed.com/control-os-hero.jpg",
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
              "name": "1-Day Sprint Deck - Free Access",
              "description": "Get the exact build process to replace any SaaS in a week. AI prompts, architecture decisions, and community access included."
            },
            "teaches": ["Micro SaaS Development", "AI Building", "Software Ownership", "Claude AI", "Tool Replacement"],
            "keywords": "micro saas, AI development, control os, software ownership, AI Chris Lee, build with AI"
          })
        }}
      />
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
        <HomePageContent />
      </Suspense>
    </>
  )
}