"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Play, ChevronLeft, ChevronRight } from "lucide-react"
import { Course, Lesson } from "@/lib/supabase"
import { LessonContentDisplay } from "@/components/lesson-content-display"

export default function LessonPage({
  params,
}: {
  params: { courseId: string; lessonId: string }
}) {
  const [course, setCourse] = useState<Course | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null)
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLessonDetails() {
      try {
        const response = await fetch(`/api/courses/${params.courseId}/lessons`)
        if (!response.ok) {
          throw new Error('Course not found')
        }
        const { data } = await response.json()
        setCourse(data.course)
        setLessons(data.lessons || [])
        
        // Find current lesson
        const lessonIndex = data.lessons.findIndex((l: Lesson) => l.id === params.lessonId)
        if (lessonIndex !== -1) {
          setCurrentLesson(data.lessons[lessonIndex])
          setCurrentIndex(lessonIndex)
        }
      } catch (error) {
        console.error('Failed to fetch lesson details:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLessonDetails()
  }, [params.courseId, params.lessonId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading lesson...</p>
      </div>
    )
  }

  if (!course || !currentLesson) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Lesson not found</p>
      </div>
    )
  }

  const hasNext = currentIndex < lessons.length - 1
  const hasPrev = currentIndex > 0
  const nextLesson = hasNext ? lessons[currentIndex + 1] : null
  const prevLesson = hasPrev ? lessons[currentIndex - 1] : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link 
          href={`/classroom/${params.courseId}`} 
          className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to {course.title}
        </Link>
        <div className="text-sm text-muted-foreground">
          Lesson {currentIndex + 1} of {lessons.length}
        </div>
      </div>

      {/* Lesson Title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{currentLesson.title}</h1>
        {currentLesson.duration_minutes && (
          <p className="text-sm text-muted-foreground mt-2">Duration: {currentLesson.duration_minutes} minutes</p>
        )}
      </div>

      {/* Video Player */}
      <Card>
        <div className="aspect-video bg-black rounded-t-lg relative">
          {currentLesson.wistia_video_id ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white text-center">
                <p className="mb-4">Wistia Video ID: {currentLesson.wistia_video_id}</p>
                <Button size="lg" variant="outline" className="gap-2">
                  <Play className="h-5 w-5" />
                  Play Video
                </Button>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-white">No video available for this lesson</p>
            </div>
          )}
        </div>
      </Card>

      {/* Navigation Controls */}
      <div className="flex justify-between items-center">
        <Button 
          variant="outline" 
          disabled={!hasPrev}
          asChild={hasPrev}
        >
          {hasPrev && prevLesson ? (
            <Link href={`/classroom/${params.courseId}/${prevLesson.id}`}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Link>
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </>
          )}
        </Button>
        
        <Button 
          variant="outline" 
          disabled={!hasNext}
          asChild={hasNext}
        >
          {hasNext && nextLesson ? (
            <Link href={`/classroom/${params.courseId}/${nextLesson.id}`}>
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          ) : (
            <>
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </>
          )}
        </Button>
      </div>

      {/* Lesson Content */}
      <LessonContentDisplay description={currentLesson.description} />
    </div>
  )
}