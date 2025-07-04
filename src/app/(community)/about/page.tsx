"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, School, DollarSign, Lock, Play } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AuthModal } from "@/components/auth-modal"

export default function AboutPage() {
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'payment'>('signup')
  const [user, setUser] = useState<any>(null)
  const [hasSubscription, setHasSubscription] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  // Stats
  const [realStats, setRealStats] = useState({
    memberCount: 0,
    adminCount: 0
  })

  useEffect(() => {
    checkAuth()
    fetchRealStats()
  }, [])

  async function checkAuth() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        const { data: subscription } = await supabase
          .from('stripe_subscriptions')
          .select('status')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .maybeSingle()
        
        setHasSubscription(!!subscription)
      }
    } catch (error) {
      console.error('Auth check error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function fetchRealStats() {
    try {
      // Try to use the SQL function first (bypasses RLS)
      const { data: stats, error: statsError } = await supabase
        .rpc('get_member_stats')
        .single() as { data: { active_member_count: number; admin_count: number } | null; error: any }

      if (!statsError && stats) {
        setRealStats({
          memberCount: Number(stats.active_member_count) || 0,
          adminCount: Number(stats.admin_count) || 0
        })
      } else {
        // Fallback: Fetch users who have active subscriptions
        const { data: activeUsers, error: subError } = await supabase
          .from('users')
          .select('id, stripe_subscriptions!inner(status)')
          .eq('stripe_subscriptions.status', 'active')

        if (subError) {
          console.error('Error fetching active subscriptions:', subError)
        }

        const activeMemberCount = activeUsers?.length || 0

        // Fetch admin count
        const { data: admins, error: adminError } = await supabase
          .from('users')
          .select('id')
          .eq('is_admin', true)

        if (adminError) {
          console.error('Error fetching admin count:', adminError)
        }

        const adminCount = admins?.length || 0

        setRealStats({
          memberCount: activeMemberCount,
          adminCount: adminCount
        })
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleJoinClick = () => {
    if (user) {
      if (hasSubscription) {
        router.push('/threads')
      } else {
        setAuthMode('payment')
        setAuthModalOpen(true)
      }
    } else {
      setAuthMode('signup')
      setAuthModalOpen(true)
    }
  }

  const renderCTA = () => {
    if (isLoading) {
      return (
        <Button size="lg" className="w-full text-lg" disabled>
          Loading...
        </Button>
      )
    }

    if (user && hasSubscription) {
      return (
        <Button size="lg" className="w-full text-lg" onClick={() => router.push('/threads')}>
          Go to Community
        </Button>
      )
    }

    return (
      <Button size="lg" className="w-full text-lg bg-yellow-400 hover:bg-yellow-500 text-black font-semibold" onClick={handleJoinClick}>
        JOIN $119/month
      </Button>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white font-bold">B</span>
              </div>
              <span className="font-semibold text-lg">Build What You Need</span>
            </Link>
            
            {!user && (
              <Button 
                variant="ghost" 
                className="text-gray-600"
                onClick={() => {
                  setAuthMode('login')
                  setAuthModalOpen(true)
                }}
              >
                LOG IN
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Section */}
            <Card>
              <CardContent className="p-0">
                <div className="relative aspect-video bg-black rounded-t-lg">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors">
                      <Play className="h-10 w-10 text-white ml-1" fill="white" />
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h1 className="text-2xl font-bold mb-2">My name is Chris Lee.</h1>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <span className="flex items-center gap-1">
                      <Lock className="h-4 w-4" />
                      Private
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {realStats.memberCount.toLocaleString()} members
                    </span>
                    <span>$119 /month</span>
                    <span>By Chris Lee ✓</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* About Section */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Ready to start your business and get on the path to financial freedom?</h2>
                
                <p className="text-gray-700 mb-4">
                  Join Build What You Need's community of ambitious entrepreneurs.
                </p>

                <p className="text-gray-700 mb-6">Join now for instant access to:</p>

                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5">🔥</span>
                    <span>LIVE Virtual Events where I build real SaaS tools</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5">💪</span>
                    <span>Bootcamp to kickstart your business in 4 weeks</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-500 mt-0.5">🤝</span>
                    <span>An inspiring community of like-minded entrepreneurs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5">⚡</span>
                    <span>Live workshops with our team</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✅</span>
                    <span>BONUS: AI Prompts & Templates for building any SaaS</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✨</span>
                    <span>BONUS: My Top 5 Mistakes Building A Business</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">🎯</span>
                    <span>BONUS: AI Advantage: ChatGPT Prompts for Entrepreneurs</span>
                  </li>
                </ul>

                <p className="text-gray-700 mb-4">
                  Inside you'll find all the support, guidance, tools, and resources you need to build a business with confidence.
                </p>

                <p className="text-gray-700">
                  Stop dreaming. Start doing.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Right Side */}
          <div className="space-y-6">
            {/* Community Info Card */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="w-24 h-24 mx-auto bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-3xl font-bold">B</span>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-lg">Build What You Need</h3>
                    <p className="text-sm text-gray-600">bwyn.com/chris-lee</p>
                  </div>
                  
                  <p className="text-sm text-gray-700">
                    Start your business and get on the path to financial freedom with serial entrepreneur Chris Lee.
                  </p>
                  
                  <div className="grid grid-cols-3 gap-4 py-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{realStats.memberCount}</div>
                      <div className="text-xs text-gray-600">Members</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">11</div>
                      <div className="text-xs text-gray-600">Online</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{realStats.adminCount}</div>
                      <div className="text-xs text-gray-600">Admins</div>
                    </div>
                  </div>
                  
                  {renderCTA()}
                  
                  <p className="text-xs text-gray-500">
                    powered by <span className="font-semibold">bwyn</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <AuthModal 
        open={authModalOpen} 
        onOpenChange={setAuthModalOpen}
        mode={authMode}
      />
    </div>
  )
}