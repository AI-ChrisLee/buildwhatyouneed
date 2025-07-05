"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { ArrowLeft, Save, Plus, Edit, Trash2, GripVertical } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Course {
  id: string
  title: string
  description: string | null
  is_free: boolean
  order_index: number
  created_at: string
  updated_at: string
}

interface Lesson {
  id: string
  course_id: string
  title: string
  description: string | null
  wistia_video_id: string | null
  order_index: number
  duration_minutes: number | null
  created_at: string
  updated_at: string
}

export default function EditCoursePage({
  params,
}: {
  params: { courseId: string }
}) {
  const isNew = params.courseId === 'new'
  const [course, setCourse] = useState<Course | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [deleteLesson, setDeleteLesson] = useState<string | null>(null)
  
  // Form fields
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [orderIndex, setOrderIndex] = useState(1)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (!isNew) {
      fetchCourse()
    }
  }, [isNew])

  async function fetchCourse() {
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

      // Fetch course details
      const response = await fetch(`/api/courses/${params.courseId}/lessons`)
      if (!response.ok) {
        router.push('/admin/courses')
        return
      }

      const { data } = await response.json()
      setCourse(data.course)
      setLessons(data.lessons || [])
      setTitle(data.course.title)
      setDescription(data.course.description || "")
      setOrderIndex(data.course.order_index)
    } catch (error) {
      console.error('Error fetching course:', error)
      router.push('/admin/courses')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      const courseData = {
        title,
        description,
        order_index: orderIndex,
      }

      if (isNew) {
        const response = await fetch('/api/courses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(courseData),
        })
        
        if (response.ok) {
          const { data } = await response.json()
          router.push(`/admin/courses/${data.id}`)
        }
      } else {
        const response = await fetch(`/api/courses/${params.courseId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(courseData),
        })
        
        if (response.ok) {
          router.push('/admin/courses')
        }
      }
    } catch (error) {
      console.error('Failed to save course:', error)
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteLesson(lessonId: string) {
    try {
      const response = await fetch(`/api/lessons/${lessonId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setLessons(lessons.filter(l => l.id !== lessonId))
      }
    } catch (error) {
      console.error('Failed to delete lesson:', error)
    }
    setDeleteLesson(null)
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
          <Link href="/admin/courses">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">
          {isNew ? 'New Course' : 'Edit Course'}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter course title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter course description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="order">Display Order</Label>
            <Input
              id="order"
              type="number"
              value={orderIndex}
              onChange={(e) => setOrderIndex(parseInt(e.target.value) || 1)}
              min="1"
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={saving || !title}
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Course'}
          </Button>
        </CardContent>
      </Card>

      {!isNew && (
        <>
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Lessons</CardTitle>
                <Button asChild size="sm">
                  <Link href={`/admin/courses/${params.courseId}/lessons/new`}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Lesson
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {lessons.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No lessons yet. Add your first lesson to get started.
                </p>
              ) : (
                <div className="space-y-3">
                  {lessons.map((lesson, index) => (
                    <div
                      key={lesson.id}
                      className="flex items-center gap-3 p-3 border rounded-lg"
                    >
                      <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                      <div className="flex-1">
                        <p className="font-medium">{lesson.title}</p>
                        {lesson.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {(() => {
                              try {
                                const content = JSON.parse(lesson.description)
                                return content.overview || lesson.description
                              } catch {
                                return lesson.description
                              }
                            })()}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground mt-1">
                          Lesson {index + 1} • {lesson.duration_minutes ? `${lesson.duration_minutes} min • ` : ''}Video ID: {lesson.wistia_video_id}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <Link href={`/admin/courses/${params.courseId}/lessons/${lesson.id}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteLesson(lesson.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <AlertDialog open={!!deleteLesson} onOpenChange={() => setDeleteLesson(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Lesson</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this lesson? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteLesson && handleDeleteLesson(deleteLesson)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  )
}