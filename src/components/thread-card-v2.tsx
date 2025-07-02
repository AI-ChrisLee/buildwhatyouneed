"use client"

import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Heart, MessageSquare } from "lucide-react"
import { mockUsers, mockComments } from "@/lib/mock-data"

interface ThreadCardProps {
  thread: {
    id: string
    title: string
    content: string
    category: string
    categoryLabel: string
    author: string
    authorId: string
    createdAt: string
    lastActivity: string
    commentCount: number
    views: number
    tags?: string[]
    likes?: number
  }
  onClick: () => void
}

export function ThreadCardV2({ thread, onClick }: ThreadCardProps) {
  const author = mockUsers[thread.author as keyof typeof mockUsers]
  const threadComments = mockComments.filter(c => c.threadId === thread.id)
  
  // Get unique commenters (excluding the thread author)
  const commenters = threadComments
    .map(c => c.author)
    .filter((author, index, self) => self.indexOf(author) === index && author !== thread.author)
    .slice(0, 3) // Show max 3 commenter avatars

  // Extract preview text (first 150 characters, strip markdown)
  const previewText = thread.content
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^> (.+)$/gm, "$1")
    .replace(/^- (.+)$/gm, "$1")
    .replace(/\n/g, " ")
    .substring(0, 150) + (thread.content.length > 150 ? "..." : "")

  return (
    <Card 
      className="p-4 transition-colors hover:bg-muted/50 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex gap-3">
        <Avatar>
          <AvatarFallback>
            {author?.displayName?.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          {/* Author and time */}
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">{author?.displayName}</span>
            <span className="text-muted-foreground">@{thread.author}</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">{thread.createdAt}</span>
            {thread.category === "announcements" && (
              <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                Admin
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-semibold text-lg mt-1 line-clamp-1">
            {thread.title}
          </h3>

          {/* Preview text */}
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {previewText}
          </p>

          {/* Tags */}
          {thread.tags && thread.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {thread.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 bg-secondary rounded-md"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Stats and commenters */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Heart className="h-4 w-4" />
                <span>{thread.likes || 0}</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MessageSquare className="h-4 w-4" />
                <span>{thread.commentCount}</span>
              </div>
            </div>

            {/* Commenter avatars */}
            {commenters.length > 0 && (
              <div className="flex items-center">
                <div className="flex -space-x-2">
                  {commenters.map((commenterUsername) => {
                    const commenter = mockUsers[commenterUsername as keyof typeof mockUsers]
                    return (
                      <Avatar key={commenterUsername} className="h-6 w-6 border-2 border-background">
                        <AvatarFallback className="text-xs">
                          {commenter?.displayName?.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    )
                  })}
                </div>
                {threadComments.length > 3 && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    +{threadComments.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}