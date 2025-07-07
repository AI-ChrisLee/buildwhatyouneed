"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { 
  X, 
  MoreHorizontal, 
  MessageSquare, 
  User,
  Pin,
  Trash2
} from "lucide-react"
import { ThreadContent } from "./thread-content"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatDistanceToNow } from "date-fns"
import { type ThreadWithAuthor, type CommentWithAuthor, getComments, createComment } from "@/lib/supabase/client-queries"
import { toggleThreadPin, isCurrentUserAdmin, deleteThread, deleteComment, canDeleteThread, canDeleteComment } from "@/lib/supabase/admin-actions"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

interface ThreadDetailDialogProps {
  thread: ThreadWithAuthor | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ThreadDetailDialog({ thread, open, onOpenChange }: ThreadDetailDialogProps) {
  const [commentText, setCommentText] = useState("")
  const [comments, setComments] = useState<CommentWithAuthor[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [canDelete, setCanDelete] = useState(false)
  const [isActioning, setIsActioning] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const router = useRouter()
  
  const categoryLabels = {
    'announcements': 'Announcements',
    'general': 'General',
    'show-tell': 'Show & Tell',
    'help': 'Help'
  }

  // Fetch comments when thread changes
  useEffect(() => {
    if (thread && open) {
      fetchComments()
      checkPermissions()
    }
  }, [thread?.id, open])

  async function checkPermissions() {
    const adminStatus = await isCurrentUserAdmin()
    setIsAdmin(adminStatus)
    
    if (thread) {
      const deletePermission = await canDeleteThread(thread.id)
      setCanDelete(deletePermission)
    }
    
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    setCurrentUserId(user?.id || null)
  }
  
  async function fetchComments() {
    if (!thread) return
    setLoading(true)
    try {
      const data = await getComments(thread.id)
      setComments(data)
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handlePin() {
    if (!thread || isActioning) return
    
    setIsActioning(true)
    try {
      await toggleThreadPin(thread.id, thread.is_pinned)
      router.refresh()
      // Close and reopen to refresh the thread data
      onOpenChange(false)
      setTimeout(() => onOpenChange(true), 100)
    } catch (error) {
      console.error('Error pinning thread:', error)
    } finally {
      setIsActioning(false)
    }
  }


  async function handleDeleteThread() {
    if (!thread || isActioning) return
    
    if (!confirm('Are you sure you want to delete this thread? This action cannot be undone.')) {
      return
    }
    
    setIsActioning(true)
    try {
      await deleteThread(thread.id)
      router.refresh()
      onOpenChange(false)
    } catch (error) {
      console.error('Error deleting thread:', error)
    } finally {
      setIsActioning(false)
    }
  }

  async function handleDeleteComment(commentId: string) {
    if (isActioning) return
    
    if (!confirm('Are you sure you want to delete this comment?')) {
      return
    }
    
    setIsActioning(true)
    try {
      await deleteComment(commentId)
      // Remove comment from local state
      setComments(comments.filter(c => c.id !== commentId))
      router.refresh()
    } catch (error) {
      console.error('Error deleting comment:', error)
    } finally {
      setIsActioning(false)
    }
  }

  if (!thread) return null

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (commentText.trim() && !submitting) {
      setSubmitting(true)
      try {
        const newComment = await createComment(thread.id, commentText.trim())
        setComments([...comments, newComment])
        setCommentText("")
        router.refresh()
      } catch (error) {
        console.error('Error adding comment:', error)
      } finally {
        setSubmitting(false)
      }
    }
  }


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <VisuallyHidden>
          <DialogTitle>{thread?.title || 'Thread details'}</DialogTitle>
        </VisuallyHidden>
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-0">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback>
                {thread.author?.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || thread.author?.email?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium">{thread.author?.full_name || thread.author?.email?.split('@')[0] || 'Unknown'}</p>
                {thread.author?.founding_number && (
                  <>
                    <span className="text-muted-foreground">|</span>
                    <span className="font-bold text-sm">#{String(thread.author.founding_number).padStart(4, '0')}</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{formatDistanceToNow(new Date(thread.created_at), { addSuffix: true })}</span>
                <span>•</span>
                <Badge variant="secondary" className="text-xs">
                  {categoryLabels[thread.category as keyof typeof categoryLabels]}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {thread.is_pinned && (
              <Pin className="h-4 w-4 text-primary" />
            )}
            {(isAdmin || canDelete) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {isAdmin && (
                    <DropdownMenuItem onClick={handlePin} disabled={isActioning}>
                      <Pin className="h-4 w-4 mr-2" />
                      {thread.is_pinned ? 'Unpin thread' : 'Pin thread'}
                    </DropdownMenuItem>
                  )}
                  {canDelete && (
                    <DropdownMenuItem 
                      onClick={handleDeleteThread} 
                      disabled={isActioning}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete thread
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Thread Title */}
            <h1 className="text-2xl font-bold mb-4">{thread.title}</h1>
            
            {/* Thread Content */}
            <ThreadContent content={thread.content} />

            {/* Thread Stats */}
            <div className="flex items-center gap-6 mt-6 pt-6 border-t">
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
                {loading ? (
                  <p className="text-center text-muted-foreground">Loading comments...</p>
                ) : comments.length === 0 ? (
                  <p className="text-center text-muted-foreground">No comments yet. Be the first to comment!</p>
                ) : (
                  comments.map((comment) => {
                    const canDeleteThisComment = isAdmin || comment.author_id === currentUserId || thread.author_id === currentUserId
                    
                    return (
                      <Card key={comment.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {comment.author?.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || comment.author?.email?.[0]?.toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-sm">{comment.author?.full_name || comment.author?.email?.split('@')[0] || 'Unknown'}</p>
                                  {comment.author?.founding_number && (
                                    <>
                                      <span className="text-muted-foreground text-xs">|</span>
                                      <span className="font-bold text-xs">#{String(comment.author.founding_number).padStart(4, '0')}</span>
                                    </>
                                  )}
                                  <span className="text-xs text-muted-foreground">• {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}</span>
                                </div>
                                {canDeleteThisComment && (
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-6 w-6">
                                        <MoreHorizontal className="h-3 w-3" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-32">
                                      <DropdownMenuItem 
                                        onClick={() => handleDeleteComment(comment.id)} 
                                        disabled={isActioning}
                                        className="text-destructive focus:text-destructive"
                                      >
                                        <Trash2 className="h-3 w-3 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                )}
                              </div>
                              <p className="text-sm mt-1 text-foreground">
                                {comment.content}
                              </p>
                              <div className="flex items-center gap-4 mt-2">
                                <Button variant="ghost" size="sm" className="h-8 px-2">
                                  Reply
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })
                )}
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
                  disabled={!commentText.trim() || submitting}
                >
                  {submitting ? 'Posting...' : 'Post'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}