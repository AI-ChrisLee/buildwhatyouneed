"use client"

import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { MessageSquare, Pin, MoreVertical, Trash2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { type ThreadWithAuthor } from "@/lib/supabase/client-queries"
import { toggleThreadPin, isCurrentUserAdmin, deleteThread, canDeleteThread } from "@/lib/supabase/admin-actions"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ThreadCardProps {
  thread: ThreadWithAuthor
  onClick: () => void
}

export function ThreadCardV2({ thread, onClick }: ThreadCardProps) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [canDelete, setCanDelete] = useState(false)
  const [isActioning, setIsActioning] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    checkPermissions()
  }, [thread.id])

  async function checkPermissions() {
    const adminStatus = await isCurrentUserAdmin()
    setIsAdmin(adminStatus)
    
    const deletePermission = await canDeleteThread(thread.id)
    setCanDelete(deletePermission)
    
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    setCurrentUserId(user?.id || null)
  }

  async function handlePin(e: React.MouseEvent) {
    e.stopPropagation()
    if (isActioning) return
    
    setIsActioning(true)
    try {
      await toggleThreadPin(thread.id, thread.is_pinned)
      router.refresh()
    } catch (error) {
      console.error('Error pinning thread:', error)
    } finally {
      setIsActioning(false)
    }
  }


  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    if (isActioning) return
    
    if (!confirm('Are you sure you want to delete this thread? This action cannot be undone.')) {
      return
    }
    
    setIsActioning(true)
    try {
      await deleteThread(thread.id)
      router.refresh()
    } catch (error) {
      console.error('Error deleting thread:', error)
    } finally {
      setIsActioning(false)
    }
  }
  // Format the time display
  const formatTimeAgo = (date: string) => {
    const now = new Date()
    const threadDate = new Date(date)
    const diffInHours = Math.floor((now.getTime() - threadDate.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - threadDate.getTime()) / (1000 * 60))
      return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`
    } else if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`
    }
  }

  // Extract media from content
  const extractMedia = (content: string) => {
    // Match markdown image: ![alt](url)
    const imageMatch = content.match(/!\[([^\]]*)\]\(([^)]+)\)/)
    // Match markdown link that might be a video: [text](url)
    const videoMatch = content.match(/\[Video Link\]\(([^)]+)\)/)
    
    if (imageMatch) {
      return { type: 'image', url: imageMatch[2] }
    }
    if (videoMatch) {
      const url = videoMatch[1]
      // Extract YouTube video ID
      const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?]+)/)
      if (youtubeMatch) {
        return { type: 'youtube', videoId: youtubeMatch[1], url }
      }
      // Check for Loom
      const loomMatch = url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/)
      if (loomMatch) {
        return { type: 'loom', videoId: loomMatch[1], url }
      }
      // Check for Wistia
      const wistiaMatch = url.match(/(?:wistia\.com\/medias?\/|wi\.st\/)([a-zA-Z0-9]+)/)
      if (wistiaMatch) {
        return { type: 'wistia', videoId: wistiaMatch[1], url }
      }
      return { type: 'video', url }
    }
    return null
  }

  const media = extractMedia(thread.content)

  // Extract preview text (first 150 characters, strip markdown including media)
  const previewText = thread.content
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "") // Remove images
    .replace(/\[Video Link\]\([^)]+\)/g, "") // Remove video links
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^> (.+)$/gm, "$1")
    .replace(/^- (.+)$/gm, "$1")
    .replace(/\n/g, " ")
    .trim()
    .substring(0, 150) + (thread.content.length > 150 ? "..." : "")

  return (
    <Card 
      className={`p-4 transition-colors hover:bg-muted/50 cursor-pointer ${thread.is_pinned ? 'border-primary' : ''}`}
      onClick={onClick}
    >
      <div className="flex gap-3">
        <Avatar>
          <AvatarFallback>
            {thread.author?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || thread.author?.email?.[0]?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0 flex gap-4">
          <div className="flex-1">
            {/* Author and time */}
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">{thread.author?.full_name || thread.author?.email?.split('@')[0] || 'Unknown'}</span>
              {thread.author?.founding_number && (
                <>
                  <span className="text-muted-foreground">|</span>
                  <span className="font-bold">#{String(thread.author.founding_number).padStart(4, '0')}</span>
                </>
              )}
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground">{formatTimeAgo(thread.created_at)}</span>
              {thread.category === "announcements" && thread.author?.is_admin && (
                <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                  Admin
                </span>
              )}
            </div>

            {/* Title with pin/lock indicators */}
            <div className="flex items-center gap-2 mt-1">
              <h3 className="font-semibold text-lg line-clamp-1 flex-1">
                {thread.title}
              </h3>
              {thread.is_pinned && (
                <Pin className="h-4 w-4 text-primary flex-shrink-0" />
              )}
            </div>

            {/* Preview text */}
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {previewText}
            </p>

            {/* Category Tag and Stats */}
            <div className="flex items-center gap-4 mt-3">
              <span className="text-xs px-2 py-0.5 bg-secondary rounded-md">
                #{thread.category}
              </span>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MessageSquare className="h-4 w-4" />
                <span>{thread.comment_count}</span>
              </div>
            </div>
          </div>

          {/* Media Preview - Small on the right */}
          {media && (
            <div className="flex-shrink-0">
              {media.type === 'image' && (
                <img 
                  src={media.url} 
                  alt="Thread image"
                  className="w-32 h-24 object-cover rounded-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              )}
              {media.type === 'youtube' && (
                <div className="relative w-32 h-24 rounded-lg overflow-hidden bg-black group">
                  <img 
                    src={`https://img.youtube.com/vi/${media.videoId}/mqdefault.jpg`}
                    alt="Video thumbnail"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-black ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}
              {media.type === 'loom' && (
                <div className="w-32 h-24 bg-muted rounded-lg flex flex-col items-center justify-center gap-1">
                  <span className="text-2xl">🔒</span>
                  <span className="text-xs text-muted-foreground">Loom Video</span>
                </div>
              )}
              {media.type === 'wistia' && (
                <div className="relative w-32 h-24 rounded-lg overflow-hidden bg-black group">
                  <img 
                    src={`https://embed.wistia.com/deliveries/${media.videoId}.jpg`}
                    alt="Wistia video thumbnail"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Try alternative thumbnail URL
                      const img = e.currentTarget as HTMLImageElement
                      if (!img.src.includes('/image_crop_resized=')) {
                        img.src = `https://fast.wistia.com/embed/medias/${media.videoId}/swatch`
                      } else {
                        img.style.display = 'none'
                        img.parentElement!.classList.add('bg-blue-100')
                        img.parentElement!.classList.remove('bg-black')
                      }
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}
              {media.type === 'video' && (
                <div className="w-32 h-24 bg-muted rounded-lg flex items-center justify-center">
                  <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Admin/Author actions dropdown */}
        {(isAdmin || canDelete) && (
          <div className="flex-shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {isAdmin && (
                  <>
                    <DropdownMenuItem onClick={handlePin} disabled={isActioning}>
                      <Pin className="h-4 w-4 mr-2" />
                      {thread.is_pinned ? 'Unpin thread' : 'Pin thread'}
                    </DropdownMenuItem>
                  </>
                )}
                {canDelete && (
                  <DropdownMenuItem 
                    onClick={handleDelete} 
                    disabled={isActioning}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete thread
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </Card>
  )
}