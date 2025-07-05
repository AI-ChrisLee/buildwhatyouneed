"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Clock, Plus, Edit, Trash2, Lock } from "lucide-react"

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
import { createClient } from "@/lib/supabase/client"
import PaymentModal from "@/components/payment-modal"
import { useRouter } from "next/navigation"

export default function CourseDetailPage({
  params,
}: {
  params: { courseId: string }
}) {
  const [course, setCourse] = useState<Course | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [accessDenied, setAccessDenied] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function fetchCourseDetailsAndCheckAdmin() {
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
          setCurrentUser(user)
        }

        // Fetch course details
        const response = await fetch(`/api/courses/${params.courseId}/lessons`)
        if (response.status === 403) {
          // Access denied - show upgrade modal
          const courseResponse = await fetch(`/api/courses/${params.courseId}`)
          if (courseResponse.status === 403) {
            setAccessDenied(true)
            const { data: coursesData } = await fetch('/api/courses').then(r => r.json())
            const blockedCourse = coursesData?.find((c: any) => c.id === params.courseId)
            if (blockedCourse) {
              setCourse(blockedCourse)
              setShowPaymentModal(true)
            }
            return
          }
        }
        if (!response.ok) {
          throw new Error('Course not found')
        }
        const { data } = await response.json()
        setCourse(data.course)
        setLessons(data.lessons || [])
      } catch (error) {
        console.error('Failed to fetch course details:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCourseDetailsAndCheckAdmin()
  }, [params.courseId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading course...</p>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Course not found</p>
      </div>
    )
  }

  if (accessDenied) {
    return (
      <>
        <div className="min-h-[400px] flex flex-col items-center justify-center text-center px-4">
          <Lock className="h-16 w-16 text-gray-300 mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Premium Content</h2>
          <p className="text-gray-600 mb-6 max-w-md">
            This course is only available to premium members. Upgrade your account to access all courses and features.
          </p>
          <Button 
            onClick={() => setShowPaymentModal(true)}
            className="bg-gray-900 hover:bg-gray-800 text-white"
            size="lg"
          >
            Upgrade to Premium
          </Button>
          <Link 
            href="/classroom" 
            className="text-sm text-gray-600 hover:text-gray-900 mt-4"
          >
            ← Back to classroom
          </Link>
        </div>
        <PaymentModal
          open={showPaymentModal}
          onOpenChange={(open) => {
            setShowPaymentModal(open)
            if (!open) {
              router.push('/classroom')
            }
          }}
          user={currentUser}
        />
      </>
    )
  }

  return (
    <div className="space-y-6">
      <Link href="/classroom" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
        ← Back to classroom
      </Link>

      <div>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">{course.title}</h1>
            <p className="text-muted-foreground mt-2">{course.description}</p>
            <p className="text-sm mt-2">{lessons.length} lessons</p>
          </div>
          {isAdmin && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/courses/${params.courseId}`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Course
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link href={`/admin/courses/${params.courseId}/lessons/new`}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Lesson
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {lessons.map((lesson, index) => (
          <div key={lesson.id} className="relative group">
            <Link
              href={`/classroom/${params.courseId}/${lesson.id}`}
            >
              <Card className="hover:shadow-md transition-all cursor-pointer">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl text-muted-foreground font-mono">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    <div>
                      <h3 className="font-medium">{lesson.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{lesson.duration_minutes ? `${lesson.duration_minutes} minutes` : 'Video lesson'}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Watch
                  </Button>
                </CardContent>
              </Card>
            </Link>
            
            {/* Admin controls overlay */}
            {isAdmin && (
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="secondary"
                  asChild
                  onClick={(e) => e.stopPropagation()}
                >
                  <Link href={`/admin/courses/${params.courseId}/lessons/${lesson.id}`}>
                    <Edit className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (confirm('Are you sure you want to delete this lesson?')) {
                      // TODO: Implement lesson deletion
                      console.log('Delete lesson:', lesson.id)
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}