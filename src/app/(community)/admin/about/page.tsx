"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { isCurrentUserAdmin } from "@/lib/supabase/admin-actions"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

interface AboutContent {
  title: string
  subtitle: string
  mainDescription: string
  memberCount: string
  onlineCount: string
  adminCount: string
  learnItems: string[]
  benefitItems: string[]
  footerText: string
}

export default function EditAboutPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  
  const [content, setContent] = useState<AboutContent>({
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

  useEffect(() => {
    checkAdminAndLoad()
  }, [])

  async function checkAdminAndLoad() {
    const adminStatus = await isCurrentUserAdmin()
    if (!adminStatus) {
      router.push('/about')
      return
    }
    setIsAdmin(true)
    
    // Load existing content from database
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

  async function handleSave() {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('site_content')
        .upsert({
          page: 'about',
          content: JSON.stringify(content),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'page'
        })
      
      if (error) throw error
      
      router.push('/about')
    } catch (error) {
      console.error('Error saving content:', error)
      alert('Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="container mx-auto py-8">Loading...</div>
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Edit About Page</h1>
        <Button variant="ghost" asChild>
          <Link href="/about">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to About
          </Link>
        </Button>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Hero Section</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={content.title}
                  onChange={(e) => setContent({ ...content, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input
                  id="subtitle"
                  value={content.subtitle}
                  onChange={(e) => setContent({ ...content, subtitle: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="mainDescription">Main Description</Label>
              <Textarea
                id="mainDescription"
                value={content.mainDescription}
                onChange={(e) => setContent({ ...content, mainDescription: e.target.value })}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="memberCount">Member Count</Label>
                <Input
                  id="memberCount"
                  value={content.memberCount}
                  onChange={(e) => setContent({ ...content, memberCount: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="onlineCount">Online Count</Label>
                <Input
                  id="onlineCount"
                  value={content.onlineCount}
                  onChange={(e) => setContent({ ...content, onlineCount: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="adminCount">Admin Count</Label>
                <Input
                  id="adminCount"
                  value={content.adminCount}
                  onChange={(e) => setContent({ ...content, adminCount: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Learn How To Section</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {content.learnItems.map((item, index) => (
              <div key={index}>
                <Label>Item {index + 1}</Label>
                <Input
                  value={item}
                  onChange={(e) => {
                    const newItems = [...content.learnItems]
                    newItems[index] = e.target.value
                    setContent({ ...content, learnItems: newItems })
                  }}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Benefits Section</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {content.benefitItems.map((item, index) => (
              <div key={index}>
                <Label>Benefit {index + 1}</Label>
                <Textarea
                  value={item}
                  onChange={(e) => {
                    const newItems = [...content.benefitItems]
                    newItems[index] = e.target.value
                    setContent({ ...content, benefitItems: newItems })
                  }}
                  rows={2}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Footer Text</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={content.footerText}
              onChange={(e) => setContent({ ...content, footerText: e.target.value })}
              rows={2}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button variant="outline" asChild>
            <Link href="/about">Cancel</Link>
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  )
}