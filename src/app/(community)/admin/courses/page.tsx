"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { Edit, Trash2, Plus, GripVertical, Eye } from "lucide-react"
import { CourseModal } from "@/components/course-modal"
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
  cover_image_url?: string | null
  is_draft?: boolean
  created_at: string
  updated_at: string
}

interface CourseWithCount extends Course {
  lesson_count?: number
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<CourseWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [showCourseModal, setShowCourseModal] = useState(false)
  const [editingCourse, setEditingCourse] = useState<CourseWithCount | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAdminAndFetchCourses()
  }, [])

  async function checkAdminAndFetchCourses() {
    try {
      // Check if user is admin
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

      setIsAdmin(true)

      // Fetch courses
      const response = await fetch('/api/courses')
      const { data } = await response.json()
      setCourses(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(courseId: string) {
    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setCourses(courses.filter(c => c.id !== courseId))
      }
    } catch (error) {
      console.error('Failed to delete course:', error)
    }
    setDeleteId(null)
  }

  async function handleSaveCourse(courseData: Partial<Course>) {
    try {
      if (editingCourse) {
        // Update existing course
        const response = await fetch(`/api/courses/${editingCourse.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(courseData),
        })
        
        if (response.ok) {
          await checkAdminAndFetchCourses()
        }
      } else {
        // Create new course
        const response = await fetch('/api/courses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(courseData),
        })
        
        if (response.ok) {
          await checkAdminAndFetchCourses()
        }
      }
    } catch (error) {
      console.error('Failed to save course:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Course Management</h1>
        <Button 
          onClick={() => {
            setEditingCourse(null)
            setShowCourseModal(true)
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Course
        </Button>
      </div>

      <div className="space-y-4">
        {courses.map((course, index) => (
          <Card key={course.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                  <div>
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Order: {course.order_index} • {course.lesson_count || 0} lessons
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <Link href={`/classroom/${course.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingCourse(course)
                      setShowCourseModal(true)
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteId(course.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            {course.description && (
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {course.description}
                </p>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {courses.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground mb-4">No courses yet</p>
            <Button asChild>
              <Link href="/admin/courses/new">
                <Plus className="h-4 w-4 mr-2" />
                Create your first course
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Course</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this course? This will also delete all lessons in the course. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CourseModal
        open={showCourseModal}
        onOpenChange={(open) => {
          setShowCourseModal(open)
          if (!open) {
            setEditingCourse(null)
          }
        }}
        course={editingCourse ? {...editingCourse, is_draft: editingCourse.is_draft ?? false} : null}
        onSave={handleSaveCourse}
      />
    </div>
  )
}