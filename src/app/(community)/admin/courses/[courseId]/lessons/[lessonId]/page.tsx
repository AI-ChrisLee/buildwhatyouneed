"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { Lesson } from "@/lib/supabase"
import { ArrowLeft, Save } from "lucide-react"
import { LessonDescriptionEditor } from "@/components/lesson-description-editor"

export default function EditLessonPage({
  params,
}: {
  params: { courseId: string; lessonId: string }
}) {
  const isNew = params.lessonId === 'new'
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  
  // Form fields
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [wistiaVideoId, setWistiaVideoId] = useState("")
  const [orderIndex, setOrderIndex] = useState(1)
  const [durationMinutes, setDurationMinutes] = useState<number | null>(null)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (!isNew) {
      fetchLesson()
    }
  }, [isNew])

  async function fetchLesson() {
    try {
      // Check admin status
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: userData } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', user.id)
        .single()

      if (!userData?.is_admin) {
        router.push('/classroom')
        return
      }

      // Fetch lesson details
      const response = await fetch(`/api/lessons/${params.lessonId}`)
      if (!response.ok) {
        router.push(`/admin/courses/${params.courseId}`)
        return
      }

      const { data } = await response.json()
      setLesson(data)
      setTitle(data.title)
      setDescription(data.description || "")
      setWistiaVideoId(data.wistia_video_id)
      setOrderIndex(data.order_index)
      setDurationMinutes(data.duration_minutes || null)
    } catch (error) {
      console.error('Error fetching lesson:', error)
      router.push(`/admin/courses/${params.courseId}`)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      const lessonData = {
        title,
        description,
        wistia_video_id: wistiaVideoId,
        order_index: orderIndex,
        duration_minutes: durationMinutes,
        course_id: params.courseId,
      }

      if (isNew) {
        const response = await fetch('/api/lessons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(lessonData),
        })
        
        if (response.ok) {
          router.push(`/admin/courses/${params.courseId}`)
        }
      } else {
        const response = await fetch(`/api/lessons/${params.lessonId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(lessonData),
        })
        
        if (response.ok) {
          router.push(`/admin/courses/${params.courseId}`)
        }
      }
    } catch (error) {
      console.error('Failed to save lesson:', error)
    } finally {
      setSaving(false)
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
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          asChild
        >
          <Link href={`/admin/courses/${params.courseId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">
          {isNew ? 'New Lesson' : 'Edit Lesson'}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lesson Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter lesson title"
            />
          </div>

          <div className="space-y-2">
            <Label>Lesson Content & Resources</Label>
            <LessonDescriptionEditor
              value={description}
              onChange={setDescription}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="video">Wistia Video ID</Label>
              <Input
                id="video"
                value={wistiaVideoId}
                onChange={(e) => setWistiaVideoId(e.target.value)}
                placeholder="Enter Wistia video ID"
              />
              <p className="text-sm text-muted-foreground">
                Found in your Wistia dashboard
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={durationMinutes || ""}
                onChange={(e) => setDurationMinutes(e.target.value ? parseInt(e.target.value) : null)}
                placeholder="e.g. 15"
                min="1"
              />
              <p className="text-sm text-muted-foreground">
                Estimated lesson duration
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="order">Lesson Order</Label>
            <Input
              id="order"
              type="number"
              value={orderIndex}
              onChange={(e) => setOrderIndex(parseInt(e.target.value) || 1)}
              min="1"
            />
            <p className="text-sm text-muted-foreground">
              Lessons are displayed in ascending order
            </p>
          </div>

          <Button
            onClick={handleSave}
            disabled={saving || !title || !wistiaVideoId}
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Lesson'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}