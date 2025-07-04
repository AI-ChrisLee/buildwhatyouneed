"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, User } from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export function CommunityBadge() {
  const [memberCount, setMemberCount] = useState<number>(0)
  const [adminCount, setAdminCount] = useState<number>(0)
  const [recentMembers, setRecentMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    try {
      // Try to use the SQL function first (bypasses RLS)
      const { data: stats, error: statsError } = await supabase
        .rpc('get_member_stats')
        .single() as { data: { active_member_count: number; admin_count: number } | null; error: any }

      if (!statsError && stats) {
        setMemberCount(Number(stats.active_member_count) || 0)
        setAdminCount(Number(stats.admin_count) || 0)
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

        setMemberCount(activeUsers?.length || 0)
        setAdminCount(admins || 0)
      }

      // Fetch recent members for avatars
      const { data: members } = await supabase
        .from('users')
        .select('id, full_name, email')
        .order('created_at', { ascending: false })
        .limit(8)

      setRecentMembers(members || [])
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
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
            <p className="text-2xl font-bold">{loading ? '...' : memberCount}</p>
            <p className="text-xs text-muted-foreground">Members</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{loading ? '...' : adminCount}</p>
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
  )
}