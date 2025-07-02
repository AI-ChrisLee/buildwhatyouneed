"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Calendar, Clock, Users, Heart, MessageSquare, Eye, Star } from "lucide-react"

// Thread Card Component
interface ThreadCardData {
  id: string
  title: string
  content: string
  author: {
    name: string
    username: string
    avatar?: string
  }
  createdAt: string
  category?: string
  tags?: string[]
  stats: {
    likes: number
    comments: number
    views?: number
  }
}

interface ThreadCardProps {
  thread: ThreadCardData
  onClick?: () => void
  className?: string
}

export function ThreadCard({ thread, onClick, className }: ThreadCardProps) {
  return (
    <Card 
      className={cn(
        "transition-all hover:shadow-md cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={thread.author.avatar} />
            <AvatarFallback>
              {thread.author.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">{thread.author.name}</span>
              <span className="text-muted-foreground">@{thread.author.username}</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground">{thread.createdAt}</span>
            </div>
            
            <h3 className="font-semibold text-lg line-clamp-1">{thread.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{thread.content}</p>
            
            {thread.tags && thread.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {thread.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                {thread.stats.likes}
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                {thread.stats.comments}
              </span>
              {thread.stats.views && (
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {thread.stats.views}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Course Card Component
interface CourseCardData {
  id: string
  title: string
  description: string
  instructor: {
    name: string
    avatar?: string
  }
  thumbnail?: string
  duration: string
  modules: number
  students: number
  rating: number
  progress?: number
  category?: string
  level?: string
}

interface CourseCardProps {
  course: CourseCardData
  onClick?: () => void
  className?: string
}

export function CourseCard({ course, onClick, className }: CourseCardProps) {
  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all hover:shadow-lg cursor-pointer group",
        className
      )}
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div className="aspect-video bg-gradient-to-br from-purple-100 to-purple-50 relative">
        {course.thumbnail ? (
          <img 
            src={course.thumbnail} 
            alt={course.title}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-purple-600 text-4xl font-bold opacity-20">
              {course.title.charAt(0)}
            </div>
          </div>
        )}
        {course.progress !== undefined && course.progress > 0 && (
          <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-xs">
            {course.progress}% Complete
          </div>
        )}
      </div>
      
      <CardHeader className="pb-3">
        <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
          {course.title}
        </CardTitle>
        <CardDescription>
          By {course.instructor.name} • {course.modules} modules • {course.duration}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {course.description}
        </p>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {course.students}
          </span>
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-current" />
            {course.rating}
          </span>
          {course.level && (
            <Badge variant="secondary" className="text-xs">
              {course.level}
            </Badge>
          )}
        </div>
        
        {course.progress !== undefined && (
          <div className="space-y-1">
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all"
                style={{ width: `${course.progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {course.progress === 0 && "Not started"}
              {course.progress > 0 && course.progress < 100 && "In progress"}
              {course.progress === 100 && "Completed"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Event Card Component
interface EventCardData {
  id: string
  title: string
  description: string
  date: string
  time: string
  duration: string
  type: string
  attendees?: number
  location?: string
  host?: {
    name: string
    avatar?: string
  }
}

interface EventCardProps {
  event: EventCardData
  onClick?: () => void
  highlight?: boolean
  className?: string
}

export function EventCard({ event, onClick, highlight = false, className }: EventCardProps) {
  return (
    <Card 
      className={cn(
        "transition-all hover:shadow-md cursor-pointer",
        highlight && "border-2 border-primary",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="line-clamp-1">{event.title}</CardTitle>
          <Badge variant={highlight ? "default" : "secondary"}>
            {event.type}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {event.description}
        </p>
        
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{event.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{event.time} • {event.duration}</span>
          </div>
          {event.attendees && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{event.attendees} attending</span>
            </div>
          )}
        </div>
        
        {event.host && (
          <div className="flex items-center gap-2 pt-2 border-t">
            <Avatar className="h-6 w-6">
              <AvatarImage src={event.host.avatar} />
              <AvatarFallback className="text-xs">
                {event.host.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">
              Hosted by {event.host.name}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Stats Card Component
interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon?: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

export function StatsCard({ 
  title, 
  value, 
  description, 
  icon, 
  trend,
  className 
}: StatsCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <p className={cn(
            "text-xs mt-2",
            trend.isPositive ? "text-green-600" : "text-red-600"
          )}>
            {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
          </p>
        )}
      </CardContent>
    </Card>
  )
}