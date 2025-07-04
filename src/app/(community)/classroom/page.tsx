"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { BookOpen, Clock, Plus, Edit, Trash2, GripVertical } from "lucide-react"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Course } from "@/lib/supabase"
import { useMembership } from "@/hooks/use-membership"
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

interface CourseWithCount extends Course {
  lesson_count?: number
}

export default function ClassroomPage() {
  const [courses, setCourses] = useState<CourseWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const supabase = createClient()
  const { MembershipGate, AccessDeniedModal } = useMembership()

  useEffect(() => {
    async function fetchCoursesAndCheckAdmin() {
      try {
        // Check if user is admin
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: userData } = await supabase
            .from('users')
            .select('is_admin')
            .eq('id', user.id)
            .single()
          
          setIsAdmin(userData?.is_admin || false)
        }

        // Fetch courses
        const response = await fetch('/api/courses')
        const { data } = await response.json()
        setCourses(data || [])
      } catch (error) {
        console.error('Failed to fetch courses:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCoursesAndCheckAdmin()
  }, [])

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading courses...</p>
      </div>
    )
  }

  return (
    <MembershipGate feature="Classroom">
      <div className="min-h-screen">
        {/* Header */}
        {isAdmin && (
          <div className="border-b">
            <div className="flex justify-end px-4 md:px-6 py-3">
              <Button asChild size="sm">
                <Link href="/admin/courses/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Course
                </Link>
              </Button>
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="px-4 md:px-6 py-6">

          {/* Empty state */}
          {courses.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                No courses available yet
              </p>
              {isAdmin && (
                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin/courses/new">
                    Create your first course
                  </Link>
                </Button>
              )}
            </div>
          )}

          {/* Course Grid - 2 columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {courses.map((course) => (
            <div key={course.id} className="relative group">
              <Link href={`/classroom/${course.id}`}>
                <div className="overflow-hidden rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer">
                  {/* Course Image */}
                  <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BookOpen className="h-10 w-10 text-slate-500" />
                    </div>
                    {isAdmin && (
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="secondary"
                          asChild
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Link href={`/admin/courses/${course.id}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setDeleteId(course.id)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4 md:p-5 space-y-3">
                    {/* Title */}
                    <h3 className="font-medium text-base md:text-lg line-clamp-1">{course.title}</h3>
                    
                    {/* Description */}
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {course.description}
                    </p>
                    
                    {/* Lesson Count */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{course.lesson_count || 0} lessons</span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
          </div>
        </div>

      {/* Delete confirmation dialog */}
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
        
        <AccessDeniedModal />
      </div>
    </MembershipGate>
  )
}