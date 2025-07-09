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
    if (imageMatch) {
      return { type: 'image', url: imageMatch[2] }
    }
    
    // Match any markdown link: [text](url)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
    const links = Array.from(content.matchAll(linkRegex))
    
    for (const linkMatch of links) {
      const url = linkMatch[2]
      
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
    }
    
    return null
  }

  const media = extractMedia(thread.content)

  // Extract preview text from markdown content
  const extractPreviewText = (content: string) => {
    // Remove markdown images
    let text = content.replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
    // Remove markdown links but keep the text
    text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove multiple line breaks
    text = text.replace(/\n\n+/g, ' ')
    // Trim and clean up
    return text.trim()
  }

  const previewText = extractPreviewText(thread.content)
    .substring(0, 150) + (thread.content.length > 150 ? "..." : "")

  return (
    <div 
      className={`group px-4 md:px-6 py-4 transition-colors hover:bg-muted/50 cursor-pointer border rounded-lg bg-card ${thread.is_pinned ? 'border-primary/20' : ''}`}
      onClick={onClick}
    >
      <div className="flex flex-col sm:flex-row sm:gap-3">
        {/* Mobile: Stack vertically, Desktop: Side by side */}
        <div className="flex gap-3 sm:flex-1">
          {/* Avatar */}
          {thread.author?.profile_image_url ? (
            <img 
              src={thread.author.profile_image_url} 
              alt={thread.author?.full_name || 'User'}
              className="h-10 w-10 rounded-full shrink-0 object-cover" 
            />
          ) : (
            <AvatarGradient 
              seed={thread.author?.email || thread.author_id} 
              className="h-10 w-10 rounded-full shrink-0" 
            />
          )}
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Mobile: Stack name and time */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
              <span className="font-medium text-foreground text-sm">
                {thread.author?.full_name || thread.author?.email?.split('@')[0] || 'Unknown'}
              </span>
              <span className="text-muted-foreground text-xs sm:text-sm">
                <span className="hidden sm:inline">· </span>
                {formatTimeAgo(thread.created_at)}
              </span>
            </div>

            {/* Title */}
            <h3 className="font-semibold text-base mt-1 leading-tight">
              {thread.title}
            </h3>

            {/* Preview text */}
            {previewText && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {previewText}
              </p>
            )}

            {/* Media Preview - Mobile: Below content */}
            {media && (
              <div className="mt-3 sm:hidden">
                {media.type === 'image' && (
                  <div className="w-32 h-32 rounded-lg overflow-hidden">
                    <img 
                      src={media.url} 
                      alt="Thread image"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                )}
                {media.type === 'youtube' && (
                  <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-black">
                    <img 
                      src={`https://img.youtube.com/vi/${media.videoId}/mqdefault.jpg`}
                      alt="Video thumbnail"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.parentElement!.innerHTML = `
                          <div class="w-full h-full bg-muted flex items-center justify-center">
                            <svg class="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        `
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-10 h-10 bg-black/70 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}
                {media.type === 'loom' && (
                  <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-gradient-to-br from-purple-600 to-pink-600">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                      </svg>
                    </div>
                  </div>
                )}
                {media.type === 'wistia' && (
                  <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-gradient-to-br from-blue-500 to-blue-700">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Bottom metadata - simplified */}
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              {thread.comment_count > 0 && (
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>{thread.comment_count}</span>
                </div>
              )}
              {thread.is_pinned && (
                <div className="flex items-center gap-1 text-primary">
                  <Pin className="h-3.5 w-3.5" />
                  <span>Pinned</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Media Preview - Desktop: On the right */}
        {media && (
          <div className="hidden sm:block flex-shrink-0">
            {media.type === 'image' && (
              <img 
                src={media.url} 
                alt="Thread image"
                className="w-20 h-20 object-cover rounded-lg"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            )}
            {media.type === 'youtube' && (
              <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-black">
                <img 
                  src={`https://img.youtube.com/vi/${media.videoId}/mqdefault.jpg`}
                  alt="Video thumbnail"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.parentElement!.innerHTML = `
                      <div class="w-full h-full bg-muted flex items-center justify-center">
                        <svg class="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            {media.type === 'loom' && (
              <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gradient-to-br from-purple-600 to-pink-600">
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                  </svg>
                </div>
              </div>
            )}
            {media.type === 'wistia' && (
              <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gradient-to-br from-blue-500 to-blue-700">
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                  </svg>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Admin/Author actions dropdown */}
        {(isAdmin || canDelete) && (
          <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
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