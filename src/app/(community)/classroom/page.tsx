"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { BookOpen, Plus } from "lucide-react"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useMembership } from "@/hooks/use-membership"

interface Course {
  id: string
  title: string
  description: string | null
  is_free: boolean
  order_index: number
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
  const [currentUser, setCurrentUser] = useState<any>(null)
  const supabase = createClient()
  const { MembershipGate, AccessDeniedModal } = useMembership()

  useEffect(() => {
    async function fetchCoursesAndCheckAdmin() {
      try {
        // Check if user is admin and get tier
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: userData } = await supabase
            .from('users')
            .select('is_admin, membership_tier')
            .eq('id', user.id)
            .single()
          
          setIsAdmin(userData?.is_admin || false)
          
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
        
        <AccessDeniedModal />
      </div>
    </MembershipGate>
  )
}