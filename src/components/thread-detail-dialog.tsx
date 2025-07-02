"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MarkdownEditor } from "@/components/markdown-editor"
import { 
  Heart, MessageSquare, Share2, Bookmark, MoreHorizontal,
  ThumbsUp, Award, Eye, Clock, ArrowLeft, Hash, X
} from "lucide-react"
import { mockUsers, mockComments } from "@/lib/mock-data"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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

const categoryIcons = {
  general: MessageSquare,
  "show-tell": Award,
  help: MessageSquare,
  announcements: MessageSquare,
}

export function ThreadDetailDialog({ thread, open, onOpenChange }: ThreadDetailDialogProps) {
  const [commentContent, setCommentContent] = useState("")
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [showReplyTo, setShowReplyTo] = useState<string | null>(null)
  const [commentLikes, setCommentLikes] = useState<Record<string, boolean>>({})

  if (!thread) return null

  const author = mockUsers[thread.author as keyof typeof mockUsers]
  const threadComments = mockComments.filter(comment => comment.threadId === thread.id)
  const CategoryIcon = categoryIcons[thread.category as keyof typeof categoryIcons] || MessageSquare

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault()
    console.log({ threadId: thread.id, content: commentContent, replyTo: showReplyTo })
    setCommentContent("")
    setShowReplyTo(null)
  }

  const handleLike = () => {
    setIsLiked(!isLiked)
  }

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked)
  }

  const handleCommentLike = (commentId: string) => {
    setCommentLikes(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }))
  }

  const handleShare = () => {
    // In a real app, this would copy the link or open share dialog
    console.log("Share thread:", thread.id)
  }

  // Enhanced markdown renderer
  const renderMarkdown = (text: string): string => {
    return text
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-muted p-3 rounded-md overflow-x-auto"><code>$1</code></pre>')
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:underline" target="_blank">$1</a>')
      .replace(/`([^`]+)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>')
      .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-muted-foreground/30 pl-4 italic">$1</blockquote>')
      .replace(/^- (.+)$/gm, '<li class="ml-4">$1</li>')
      .replace(/\n/g, "<br />")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] p-0 gap-0">
        {/* Fixed Header */}
        <div className="sticky top-0 z-10 bg-background border-b">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2">
                <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{thread.categoryLabel}</span>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Copy link</DropdownMenuItem>
                <DropdownMenuItem>Report thread</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">Block user</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Thread Header */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>
                    {author?.displayName?.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold">{author?.displayName}</span>
                    <span className="text-sm text-muted-foreground">@{thread.author}</span>
                    {thread.author === "john" && (
                      <Badge variant="secondary" className="text-xs">OP</Badge>
                    )}
                    <span className="text-sm text-muted-foreground">·</span>
                    <span className="text-sm text-muted-foreground">{thread.createdAt}</span>
                  </div>
                  <h1 className="text-2xl font-bold mt-2">{thread.title}</h1>
                  {thread.tags && thread.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {thread.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          <Hash className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Thread Stats */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {thread.views} views
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Last activity {thread.lastActivity}
                </span>
              </div>

              {/* Thread Content */}
              <div 
                className="prose prose-sm dark:prose-invert max-w-none mt-4"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(thread.content) }}
              />

              {/* Thread Actions */}
              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLike}
                    className={isLiked ? "text-red-500" : ""}
                  >
                    <Heart className={`h-4 w-4 mr-1 ${isLiked ? "fill-current" : ""}`} />
                    {(thread.likes || 0) + (isLiked ? 1 : 0)}
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    {thread.commentCount}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleShare}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBookmark}
                  className={isBookmarked ? "text-primary" : ""}
                >
                  <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
                </Button>
              </div>
            </div>

            <Separator />

            {/* Comments Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">
                  Comments ({threadComments.length})
                </h3>
                <Button variant="outline" size="sm">
                  Sort by Best
                </Button>
              </div>
              
              {/* Comment Form */}
              <form onSubmit={handleSubmitComment} className="space-y-4">
                {showReplyTo && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Replying to</span>
                    <span className="font-medium">@{showReplyTo}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowReplyTo(null)}
                      className="h-auto p-1"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                <MarkdownEditor
                  value={commentContent}
                  onChange={setCommentContent}
                  placeholder={showReplyTo ? `Reply to @${showReplyTo}...` : "Add a comment..."}
                  minHeight="120px"
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-muted-foreground">
                    Markdown supported. Be kind and constructive.
                  </p>
                  <Button type="submit" disabled={!commentContent.trim()}>
                    Post Comment
                  </Button>
                </div>
              </form>

              <Separator />

              {/* Comments List */}
              <div className="space-y-6">
                {threadComments.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No comments yet. Be the first to share your thoughts!
                  </p>
                ) : (
                  threadComments.map((comment) => {
                    const commentAuthor = mockUsers[comment.author as keyof typeof mockUsers]
                    const isLikedComment = commentLikes[comment.id] || false
                    
                    return (
                      <div key={comment.id} className="flex gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {commentAuthor?.displayName?.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                          <div className="bg-muted/30 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium">{commentAuthor?.displayName}</span>
                              <span className="text-sm text-muted-foreground">@{comment.author}</span>
                              {comment.author === thread.author && (
                                <Badge variant="secondary" className="text-xs">OP</Badge>
                              )}
                              <span className="text-sm text-muted-foreground">·</span>
                              <span className="text-sm text-muted-foreground">{comment.createdAt}</span>
                            </div>
                            <div 
                              className="prose prose-sm dark:prose-invert max-w-none"
                              dangerouslySetInnerHTML={{ __html: renderMarkdown(comment.content) }}
                            />
                          </div>
                          <div className="flex items-center gap-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCommentLike(comment.id)}
                              className={`h-8 ${isLikedComment ? "text-primary" : ""}`}
                            >
                              <ThumbsUp className={`h-3 w-3 mr-1 ${isLikedComment ? "fill-current" : ""}`} />
                              {(comment.likes || 0) + (isLikedComment ? 1 : 0)}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowReplyTo(comment.author)}
                              className="h-8"
                            >
                              Reply
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>Copy link</DropdownMenuItem>
                                <DropdownMenuItem>Report comment</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}