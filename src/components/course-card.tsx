"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { BookOpen, Clock, Lock, Edit, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

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
      "relative group overflow-hidden rounded-lg bg-card transition-all duration-200",
      isLocked ? "hover:shadow-lg" : "hover:shadow-lg hover:-translate-y-1",
      "cursor-pointer shadow-sm"
    )}>
      {/* Course Image */}
      <div className="aspect-[1460/752] bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
        {course.cover_image_url ? (
          <img 
            src={course.cover_image_url} 
            alt={course.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <BookOpen className="h-12 w-12 text-gray-400" />
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {course.is_draft && (
            <Badge variant="secondary" className="bg-gray-100 text-gray-800 border-gray-200">
              Draft
            </Badge>
          )}
          {isFree && (
            <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
              FREE
            </Badge>
          )}
        </div>

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
      
      <div className="p-4 space-y-3">
        {/* Title */}
        <h3 className="font-semibold text-lg line-clamp-1">
          {course.title}
        </h3>
        
        {/* Progress Bar - placeholder for now */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-green-500 h-2 rounded-full" style={{ width: '0%' }}></div>
        </div>
        
        <p className="text-xs text-muted-foreground">0% complete</p>
        
        {/* Open Button */}
        <Button 
          variant="outline" 
          className="w-full"
          disabled={isLocked}
        >
          {isLocked ? (
            <>
              <Lock className="h-4 w-4 mr-2" />
              Locked
            </>
          ) : (
            'OPEN'
          )}
        </Button>
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