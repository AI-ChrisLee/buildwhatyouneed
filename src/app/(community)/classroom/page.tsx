"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { BookOpen, Plus } from "lucide-react"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useMembership } from "@/hooks/use-membership"
import { CourseModal } from "@/components/course-modal"
import { useSearchParams, useRouter } from "next/navigation"

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
import { CourseCard } from "@/components/course-card"
import PaymentModal from "@/components/payment-modal"
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
  const [userTier, setUserTier] = useState<'free' | 'paid'>('free')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showCourseModal, setShowCourseModal] = useState(false)
  const [editingCourse, setEditingCourse] = useState<CourseWithCount | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const supabase = createClient()
  const { MembershipGate, AccessDeniedModal } = useMembership()
  const searchParams = useSearchParams()
  const router = useRouter()

  const fetchCoursesAndCheckAdmin = async () => {
    try {
      let userIsAdmin = false;
      
      // Check if user is admin and get tier
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: userData } = await supabase
          .from('users')
          .select('is_admin, membership_tier')
          .eq('id', user.id)
          .single()
        
        userIsAdmin = userData?.is_admin || false
        setIsAdmin(userIsAdmin)
        
        // Check if user has paid access
        const { data: subscription } = await supabase
          .from('stripe_subscriptions')
          .select('id')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .limit(1)
          .maybeSingle()
        
        const hasPaidAccess = userData?.is_admin || 
                             userData?.membership_tier === 'paid' || 
                             !!subscription
        
        setUserTier(hasPaidAccess ? 'paid' : 'free')
        setCurrentUser(user)
      }

      // Fetch courses
      const response = await fetch('/api/courses')
      const { data } = await response.json()
      
      // Filter out draft courses for non-admins
      const filteredCourses = (data || []).filter((course: Course) => 
        userIsAdmin || !course.is_draft
      )
      
      setCourses(filteredCourses)
    } catch (error) {
      console.error('Failed to fetch courses:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCoursesAndCheckAdmin()
  }, [])

  useEffect(() => {
    // Check if we need to open edit modal
    const editCourseId = searchParams.get('edit')
    if (editCourseId && isAdmin) {
      const courseToEdit = courses.find(c => c.id === editCourseId)
      if (courseToEdit) {
        setEditingCourse(courseToEdit)
        setShowCourseModal(true)
      }
    }
  }, [searchParams, courses, isAdmin])

  async function handleDelete(courseId: string) {
    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete course')
      }

      setCourses(courses.filter(c => c.id !== courseId))
    } catch (error) {
      console.error('Failed to delete course:', error)
      alert(error instanceof Error ? error.message : 'Failed to delete course')
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
          await fetchCoursesAndCheckAdmin()
        }
      } else {
        // Create new course
        const response = await fetch('/api/courses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(courseData),
        })
        
        if (response.ok) {
          await fetchCoursesAndCheckAdmin()
        }
      }
    } catch (error) {
      console.error('Failed to save course:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading courses...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Main content */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6">

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

          {/* Course Grid - Single column */}
          <div className="space-y-6">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                isAdmin={isAdmin}
                userTier={userTier}
                onDelete={(id) => setDeleteId(id)}
                onLockedClick={() => {
                  setShowPaymentModal(true)
                }}
              />
            ))}
            
            {/* Add Course Link */}
            {isAdmin && (
              <button
                onClick={() => {
                  setEditingCourse(null)
                  setShowCourseModal(true)
                }}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <Plus className="h-5 w-5" />
                <span>New course</span>
              </button>
            )}
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
        
        {/* Payment Modal */}
        <PaymentModal
          open={showPaymentModal}
          onOpenChange={setShowPaymentModal}
          user={currentUser}
        />
        
        {/* Course Modal */}
        <CourseModal
          open={showCourseModal}
          onOpenChange={(open) => {
            setShowCourseModal(open)
            if (!open) {
              setEditingCourse(null)
            }
          }}
          course={editingCourse}
          onSave={async (courseData) => {
            await handleSaveCourse(courseData)
            // Clear the edit query param after saving
            if (searchParams.get('edit')) {
              router.push('/classroom')
            }
          }}
        />
        
        <AccessDeniedModal />
      </div>
    </div>
  )
}