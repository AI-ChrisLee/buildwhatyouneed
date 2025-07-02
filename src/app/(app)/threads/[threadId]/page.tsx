"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MoreHorizontal, ThumbsUp, MessageSquare, User } from "lucide-react"
import { mockThreads, mockComments } from "@/lib/mock-data"

export default function ThreadDetailPage({ params }: { params: { threadId: string } }) {
  const router = useRouter()
  const [commentText, setCommentText] = useState("")
  const [liked, setLiked] = useState(false)
  const [likedComments, setLikedComments] = useState<string[]>([])
  
  // Find the thread
  const thread = mockThreads.find(t => t.id === params.threadId)
  const comments = mockComments.filter(c => c.threadId === params.threadId)
  
  if (!thread) {
    return <div>Thread not found</div>
  }

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (commentText.trim()) {
      // In real app, would add to database
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <Button
        variant="ghost"
        onClick={() => router.push("/threads")}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to threads
      </Button>

      {/* Thread content */}
      <Card>
        <CardContent className="p-6">
          {/* Author header */}
          <div className="flex items-start justify-between mb-6">
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
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>

          {/* Thread title and content */}
          <h1 className="text-2xl font-bold mb-4">{thread.title}</h1>
          <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">
            {thread.content}
          </div>

          {/* Thread stats */}
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
        </CardContent>
      </Card>

      {/* Comments section */}
      <div className="space-y-4">
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
                      <p className="text-sm mt-1 text-muted-foreground">
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

        {/* Add comment form */}
        <Card>
          <CardContent className="p-4">
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}