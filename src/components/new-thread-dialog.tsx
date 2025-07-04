"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Paperclip, Link, Image, Smile, X, User } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { createThread, type ThreadWithAuthor } from "@/lib/supabase/client-queries"
import { createClient } from "@/lib/supabase/client"

interface NewThreadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onThreadCreated?: (thread: ThreadWithAuthor) => void
}

const categories = [
  { id: "general", label: "General" },
  { id: "show-tell", label: "Show & Tell" },
  { id: "help", label: "Help" },
  { id: "announcements", label: "Announcements" },
]

interface Attachment {
  type: 'image' | 'video'
  url: string
  name?: string
}

export function NewThreadDialog({ open, onOpenChange, onThreadCreated }: NewThreadDialogProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("general")
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [linkInput, setLinkInput] = useState("")
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [user, setUser] = useState<{ email: string; name: string } | null>(null)
  const supabase = createClient()
  
  useEffect(() => {
    const getUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        const { data: userData } = await supabase
          .from('users')
          .select('full_name')
          .eq('id', authUser.id)
          .single()
        
        setUser({
          email: authUser.email || '',
          name: userData?.full_name || authUser.email?.split('@')[0] || 'User'
        })
      }
    }
    
    getUser()
  }, [supabase])

  const handleAddLink = () => {
    if (linkInput.trim()) {
      const isVideo = linkInput.includes('youtube.com') || linkInput.includes('youtu.be') || 
                      linkInput.includes('loom.com') || linkInput.includes('vimeo.com')
      
      setAttachments([...attachments, {
        type: isVideo ? 'video' : 'image',
        url: linkInput.trim()
      }])
      setLinkInput("")
      setShowLinkInput(false)
    }
  }

  const handleRemoveAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index))
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    
    setSubmitting(true)
    try {
      // For MVP: Append attachments as markdown to content
      let fullContent = content.trim()
      
      if (attachments.length > 0) {
        fullContent += '\n\n'
        attachments.forEach(attachment => {
          if (attachment.type === 'image') {
            fullContent += `![Image](${attachment.url})\n`
          } else {
            fullContent += `[Video Link](${attachment.url})\n`
          }
        })
      }
      
      const newThread = await createThread({
        title: title.trim(),
        content: fullContent,
        category
      })
      
      // Reset form
      setTitle("")
      setContent("")
      setCategory("general")
      setAttachments([])
      
      // Call callback if provided
      if (onThreadCreated) {
        onThreadCreated(newThread)
      }
      
      onOpenChange(false)
    } catch (error) {
      console.error('Error creating thread:', error)
      alert('Failed to create thread. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const getVideoThumbnail = (url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.includes('youtube.com') 
        ? url.split('v=')[1]?.split('&')[0]
        : url.split('/').pop()
      return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
    }
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b">
          <Avatar className="h-10 w-10">
            <AvatarFallback>
              {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-medium">{user?.name || 'Loading...'} posting in Build What You Need</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="p-4 space-y-4">
            {/* Title */}
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="text-lg font-medium border-0 px-0 focus-visible:ring-0"
              required
            />

            {/* Content */}
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write something..."
              className="min-h-[200px] border-0 px-0 resize-none focus-visible:ring-0"
              required
            />

            {/* Attachments Preview */}
            {attachments.length > 0 && (
              <div className="space-y-2">
                {attachments.map((attachment, index) => (
                  <div key={index} className="relative group">
                    {attachment.type === 'image' ? (
                      <div className="relative">
                        <img 
                          src={attachment.url} 
                          alt={attachment.name || 'Attached image'}
                          className="max-h-64 rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(index)}
                          className="absolute top-2 right-2 p-1 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4 text-white" />
                        </button>
                      </div>
                    ) : (
                      <div className="relative">
                        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg max-w-full">
                          {getVideoThumbnail(attachment.url) && (
                            <img 
                              src={getVideoThumbnail(attachment.url)!} 
                              alt="Video thumbnail"
                              className="w-24 h-16 object-cover rounded flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate max-w-md">
                              {attachment.url.length > 50 
                                ? attachment.url.substring(0, 50) + '...' 
                                : attachment.url}
                            </p>
                            <p className="text-xs text-muted-foreground">Video link</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveAttachment(index)}
                            className="p-1 hover:bg-background rounded-full flex-shrink-0"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Link Input */}
            {showLinkInput && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Paste a URL to an image (jpg, png, gif) or video (YouTube, Vimeo, Loom)
                </p>
                <div className="flex items-center gap-2">
                  <Input
                    value={linkInput}
                    onChange={(e) => setLinkInput(e.target.value)}
                    placeholder="https://example.com/image.jpg or https://youtube.com/watch?v=..."
                    className="flex-1"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddLink())}
                  />
                  <Button type="button" size="sm" onClick={handleAddLink}>Add</Button>
                  <Button 
                    type="button" 
                    size="sm" 
                    variant="ghost"
                    onClick={() => setShowLinkInput(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t bg-muted/30">
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowLinkInput(true)}
                title="Add image or video URL"
              >
                <Link className="h-5 w-5" />
              </Button>
              
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="ml-4 w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                type="button" 
                variant="ghost"
                onClick={() => onOpenChange(false)}
              >
                CANCEL
              </Button>
              <Button 
                type="submit"
                disabled={!title.trim() || !content.trim() || submitting}
              >
                {submitting ? 'POSTING...' : 'POST'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}