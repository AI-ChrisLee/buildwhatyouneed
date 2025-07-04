"use client"

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
import { AvatarGradient } from "@/components/ui/avatar-gradient"

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
    <div 
      className={`group px-4 md:px-6 py-4 transition-colors hover:bg-muted/50 cursor-pointer ${thread.is_pinned ? 'bg-muted/30' : ''}`}
      onClick={onClick}
    >
      <div className="flex gap-3 md:gap-4">
        <AvatarGradient 
          seed={thread.author?.email || thread.author_id} 
          className="h-8 w-8 md:h-10 md:w-10 rounded-full shrink-0" 
        />
        
        <div className="flex-1 min-w-0 flex gap-3 md:gap-4">
          <div className="flex-1">
            {/* Title */}
            <h3 className="font-medium text-sm md:text-base leading-tight">
              {thread.title}
            </h3>

            {/* Preview text */}
            <p className="text-xs md:text-sm text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
              {previewText}
            </p>

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-2 md:mt-3 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">
                {thread.author?.full_name || thread.author?.email?.split('@')[0] || 'Unknown'}
              </span>
              {thread.author?.founding_number && (
                <>
                  <span className="hidden sm:inline">·</span>
                  <span className="font-medium">
                    #{String(thread.author.founding_number).padStart(4, '0')}
                  </span>
                </>
              )}
              <span className="hidden sm:inline">·</span>
              <span>{formatTimeAgo(thread.created_at)}</span>
              <span className="hidden sm:inline">·</span>
              <span className="capitalize">{thread.category.replace('-', ' ')}</span>
              {thread.is_pinned && (
                <>
                  <span className="hidden sm:inline">·</span>
                  <div className="flex items-center gap-1">
                    <Pin className="h-3 w-3" />
                    <span>Pinned</span>
                  </div>
                </>
              )}
              {thread.comment_count > 0 && (
                <>
                  <span className="hidden sm:inline">·</span>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    <span>{thread.comment_count} {thread.comment_count === 1 ? 'reply' : 'replies'}</span>
                  </div>
                </>
              )}
              {thread.category === "announcements" && thread.author?.is_admin && (
                <>
                  <span className="hidden sm:inline">·</span>
                  <span className="font-medium text-primary">Admin</span>
                </>
              )}
            </div>
          </div>

          {/* Media Preview - Minimal on the right */}
          {media && (
            <div className="flex-shrink-0">
              {media.type === 'image' && (
                <img 
                  src={media.url} 
                  alt="Thread image"
                  className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-md"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              )}
              {media.type === 'youtube' && (
                <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-md overflow-hidden bg-black">
                  <img 
                    src={`https://img.youtube.com/vi/${media.videoId}/mqdefault.jpg`}
                    alt="Video thumbnail"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.parentElement!.innerHTML = `
                        <div class="w-full h-full bg-muted flex items-center justify-center">
                          <svg class="w-5 h-5 md:w-6 md:h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      `
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-8 h-8 bg-black/70 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}
              {(media.type === 'wistia' || media.type === 'loom' || media.type === 'video') && (
                <div className="w-16 h-16 md:w-20 md:h-20 bg-muted rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
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
    </div>
  )
}