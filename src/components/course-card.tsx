"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { BookOpen, Clock, Lock, Edit, Trash2 } from "lucide-react"
import { Course } from "@/lib/supabase"
import { cn } from "@/lib/utils"

interface CourseWithCount extends Course {
  lesson_count?: number
  is_free?: boolean
}

interface CourseCardProps {
  course: CourseWithCount
  isAdmin?: boolean
  userTier?: 'free' | 'paid'
  onDelete?: (courseId: string) => void
  onLockedClick?: () => void
}

export function CourseCard({ 
  course, 
  isAdmin = false, 
  userTier = 'free',
  onDelete,
  onLockedClick 
}: CourseCardProps) {
  const isLocked = userTier === 'free' && !course.is_free
  const isFree = course.is_free

  const handleClick = (e: React.MouseEvent) => {
    if (isLocked) {
      e.preventDefault()
      onLockedClick?.()
    }
  }

  const content = (
    <div className={cn(
      "relative group overflow-hidden rounded-lg border bg-card transition-all duration-200",
      isLocked ? "hover:shadow-md" : "hover:bg-muted/50",
      "cursor-pointer"
    )}>
      {/* Course Image */}
      <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <BookOpen className="h-10 w-10 text-slate-500" />
        </div>
        
        {/* FREE Badge */}
        {isFree && (
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
              FREE
            </Badge>
          </div>
        )}

        {/* Lock Overlay for Premium Content */}
        {isLocked && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center text-white">
              <Lock className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm font-medium">Premium Content</p>
              <p className="text-xs opacity-80 mt-1">Upgrade to access</p>
            </div>
          </div>
        )}

        {/* Admin Actions */}
        {isAdmin && !isLocked && (
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
                onDelete?.(course.id)
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      
      <div className="p-4 md:p-5 space-y-3">
        {/* Title */}
        <h3 className="font-medium text-base md:text-lg line-clamp-1">
          {course.title}
        </h3>
        
        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {course.description}
        </p>
        
        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>{course.lesson_count || 0} lessons</span>
          </div>
          
          {isLocked && (
            <Button 
              size="sm" 
              variant="outline"
              className="h-7 text-xs"
              onClick={handleClick}
            >
              Upgrade to Access
            </Button>
          )}
        </div>
      </div>
    </div>
  )

  if (isLocked) {
    return <div onClick={handleClick}>{content}</div>
  }

  return (
    <Link href={`/classroom/${course.id}`}>
      {content}
    </Link>
  )
}