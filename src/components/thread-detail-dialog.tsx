"use client"

import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { mockComments } from "@/lib/mock-data"
import { 
  X, 
  MoreHorizontal, 
  ThumbsUp, 
  MessageSquare, 
  User
} from "lucide-react"

interface Thread {
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

interface ThreadDetailDialogProps {
  thread: Thread | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ThreadDetailDialog({ thread, open, onOpenChange }: ThreadDetailDialogProps) {
  const [commentText, setCommentText] = useState("")
  const [liked, setLiked] = useState(false)
  const [likedComments, setLikedComments] = useState<string[]>([])
  
  const comments = thread ? mockComments.filter(c => c.threadId === thread.id) : []

  if (!thread) return null

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (commentText.trim()) {
      console.log("Adding comment:", commentText)
      setCommentText("")
    }
  }

  const handleLikeComment = (commentId: string) => {
    setLikedComments(prev => 
      prev.includes(commentId) 
        ? prev.filter(id => id !== commentId)
        : [...prev, commentId]
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-0">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback>
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{thread.author}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{thread.createdAt}</span>
                <span>•</span>
                <Badge variant="secondary" className="text-xs">
                  {thread.categoryLabel}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Thread Title */}
            <h1 className="text-2xl font-bold mb-4">{thread.title}</h1>
            
            {/* Thread Content - Black text */}
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap text-foreground">
                {thread.content}
              </p>
            </div>

            {/* Thread Stats */}
            <div className="flex items-center gap-6 mt-6 pt-6 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLiked(!liked)}
                className={liked ? "text-primary" : ""}
              >
                <ThumbsUp className={`h-4 w-4 mr-2 ${liked ? "fill-current" : ""}`} />
                Like
                <span className="ml-2 text-muted-foreground">
                  {liked ? 1 : 0}
                </span>
              </Button>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MessageSquare className="h-4 w-4" />
                {comments.length} comments
              </div>
            </div>

            {/* Comments Section */}
            <div className="mt-8 space-y-4">
              <h2 className="text-lg font-semibold">Comments</h2>
              
              {/* Comment list */}
              <div className="space-y-4">
                {comments.map((comment) => {
                  const isLiked = likedComments.includes(comment.id)
                  return (
                    <Card key={comment.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm">{comment.author}</p>
                              <span className="text-xs text-muted-foreground">• {comment.createdAt}</span>
                            </div>
                            <p className="text-sm mt-1 text-foreground">
                              {comment.content}
                            </p>
                            <div className="flex items-center gap-4 mt-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleLikeComment(comment.id)}
                                className={`h-8 px-2 ${isLiked ? "text-primary" : ""}`}
                              >
                                <ThumbsUp className={`h-3 w-3 mr-1 ${isLiked ? "fill-current" : ""}`} />
                                {isLiked ? 1 : 0}
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 px-2">
                                Reply
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Add comment form */}
        <div className="border-t p-6">
          <form onSubmit={handleAddComment} className="flex items-start gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Your comment"
                className="border-0 px-0 focus-visible:ring-0 placeholder:text-muted-foreground"
              />
              <div className="flex justify-end mt-2">
                <Button 
                  type="submit" 
                  size="sm"
                  disabled={!commentText.trim()}
                >
                  Post
                </Button>
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}