"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import Link from "next/link"
import { MessageSquare, Eye } from "lucide-react"

interface ThreadCardProps {
  thread: {
    id: string
    title: string
    category: string
    categoryLabel: string
    author: string
    createdAt: string
    lastActivity: string
    commentCount: number
    views: number
  }
}

export function ThreadCard({ thread }: ThreadCardProps) {
  return (
    <Card className="transition-colors hover:bg-muted/50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold leading-none tracking-tight">
              <Link href={`/threads/${thread.id}`} className="hover:underline">
                {thread.title}
              </Link>
            </h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium">{thread.categoryLabel}</span>
              <span>•</span>
              <Link 
                href={`/profile/${thread.author}`}
                className="hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {thread.author}
              </Link>
              <span>•</span>
              <span>{thread.createdAt}</span>
            </div>
          </div>
          {thread.category === "announcements" && (
            <span className="rounded-full bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">
              Admin
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MessageSquare className="h-3.5 w-3.5" />
            <span>{thread.commentCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            <span>{thread.views}</span>
          </div>
          <span className="ml-auto">
            Last activity: {thread.lastActivity}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}