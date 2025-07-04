"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, User, Calendar, DollarSign, BookOpen, Code, Zap, Edit } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { isCurrentUserAdmin } from "@/lib/supabase/admin-actions"

export default function AboutPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [realStats, setRealStats] = useState({
    memberCount: 0,
    adminCount: 0
  })
  const [recentMembers, setRecentMembers] = useState<any[]>([])
  const [content, setContent] = useState({
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
  })
  const supabase = createClient()

  useEffect(() => {
    checkAdminStatus()
    loadContent()
    fetchRealStats()
  }, [])

  async function checkAdminStatus() {
    const adminStatus = await isCurrentUserAdmin()
    setIsAdmin(adminStatus)
  }

  async function loadContent() {
    try {
      const { data, error } = await supabase
        .from('site_content')
        .select('*')
        .eq('page', 'about')
        .single()
      
      if (data && !error) {
        setContent(JSON.parse(data.content))
      }
    } catch (error) {
      console.error('Error loading content:', error)
    }
    setLoading(false)
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

        // Fetch admin count
        const { count: admins } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('is_admin', true)

        setRealStats({
          memberCount: activeUsers?.length || 0,
          adminCount: admins || 0
        })
      }

      // Fetch recent members for avatars
      const { data: members } = await supabase
        .from('users')
        .select('id, full_name, email')
        .order('created_at', { ascending: false })
        .limit(8)

      setRecentMembers(members || [])
    } catch (error) {
      console.error('Error fetching real stats:', error)
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
    <div className="grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-6">
      {/* Left Column - Main Content */}
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6 space-y-6">
            {/* Admin Edit Button */}
            {isAdmin && (
              <div className="flex justify-end">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin/about">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Page
                  </Link>
                </Button>
              </div>
            )}
            {/* Hero Section */}
            <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white z-10">
                  <div className="flex items-center justify-center gap-2 text-xs font-medium mb-3">
                    <div className="p-1 bg-white/20 rounded">
                      <Users className="h-3 w-3" />
                    </div>
                    <span>COMMUNITY</span>
                  </div>
                  <h1 className="text-4xl font-bold mb-2">{content.title}</h1>
                  <p className="text-lg">{content.subtitle}</p>
                </div>
                <div className="absolute inset-0 bg-black/40"></div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 text-center">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gray-100 rounded">
                  <Users className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <p className="text-sm text-muted-foreground">{realStats.memberCount} members</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gray-100 rounded">
                  <BookOpen className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <p className="text-sm text-muted-foreground">$97/mo</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gray-100 rounded">
                  <Code className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <p className="text-sm text-muted-foreground">By Builders</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <p className="text-gray-600">
                {content.mainDescription}
              </p>
              
              <div>
                <h3 className="font-semibold mb-3">Learn how to:</h3>
                <ul className="space-y-2">
                  {content.learnItems.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-muted-foreground mt-0.5">{index + 1}.</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Here's what you get:</h3>
                <ul className="space-y-2">
                  {content.benefitItems.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-600">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="text-gray-600">
                {content.footerText}
              </p>

              <p className="text-sm text-muted-foreground">
                Join below while it lasts.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Community Badge */}
      <aside className="hidden lg:block">
        <Card className="overflow-hidden border-black">
          <div className="bg-white p-6 text-black">
            <div className="flex items-center gap-2 text-xs font-medium mb-3">
              <div className="p-1 bg-black/10 rounded">
                <Users className="h-3 w-3" />
              </div>
              <span>COMMUNITY</span>
            </div>
            <h2 className="text-2xl font-bold mb-1">Build What You Need</h2>
            <p className="text-sm text-black/60 mb-4">buildwhatyouneed.com</p>
            <p className="text-sm mb-6">
              Learn how to build what you need without expensive SaaS. 
              Save thousands and own your tools.
            </p>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-black/60">✓</span>
                <span>Code Templates</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-black/60">✓</span>
                <span>SaaS Replacements</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-black/60">✓</span>
                <span>Community Support</span>
              </div>
            </div>
          </div>
          
          <CardContent className="p-6">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 text-center mb-6">
              <div>
                <p className="text-2xl font-bold">{realStats.memberCount}</p>
                <p className="text-xs text-muted-foreground">Members</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{realStats.adminCount}</p>
                <p className="text-xs text-muted-foreground">Admins</p>
              </div>
            </div>

            {/* Member Avatars */}
            <div className="flex -space-x-2">
              {recentMembers.map((member) => (
                <Avatar key={member.id} className="h-8 w-8 border-2 border-background">
                  <AvatarFallback className="text-xs bg-muted">
                    {member.full_name ? 
                      member.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) :
                      member.email ? member.email[0].toUpperCase() : 
                      <User className="h-4 w-4" />
                    }
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
          </CardContent>
        </Card>
      </aside>
    </div>
  )
}