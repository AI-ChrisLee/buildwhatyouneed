"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Paperclip, Link2, X } from "lucide-react"
import { createThread, type ThreadWithAuthor } from "@/lib/supabase/client-queries"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/providers/auth-provider"
import { AvatarGradient } from "@/components/ui/avatar-gradient"
import { UrlInputModal } from "@/components/url-input-modal"

interface SimpleThreadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onThreadCreated?: (thread: ThreadWithAuthor) => void
}

const categories = [
  { id: "general", label: "General discussion" },
  { id: "announcements", label: "Announcements" },
  { id: "show-tell", label: "Show & Tell" },
  { id: "help", label: "Help" },
]

export function SimpleThreadDialog({ open, onOpenChange, onThreadCreated }: SimpleThreadDialogProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("general")
  const [submitting, setSubmitting] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [attachedImage, setAttachedImage] = useState<string | null>(null)
  const [user, setUser] = useState<{ email: string; name: string; profile_image_url?: string } | null>(null)
  const [showUrlModal, setShowUrlModal] = useState(false)
  const [urlPreviews, setUrlPreviews] = useState<Array<{ url: string; type: 'youtube' | 'loom' | 'default'; embedId?: string }>>([])
  const { user: authUser } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      if (authUser) {
        const { data: userData } = await supabase
          .from('users')
          .select('full_name, profile_image_url')
          .eq('id', authUser.id)
          .single()
        
        setUser({
          email: authUser.email || '',
          name: userData?.full_name || authUser.email?.split('@')[0] || 'User',
          profile_image_url: userData?.profile_image_url
        })
      }
    }
    
    getUser()
  }, [authUser, supabase])

  async function compressImage(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (event) => {
        const img = new Image()
        img.src = event.target?.result as string
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          
          // Calculate new dimensions (max 1200x1200 for posts)
          let width = img.width
          let height = img.height
          const maxSize = 1200
          
          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width
              width = maxSize
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height
              height = maxSize
            }
          }
          
          canvas.width = width
          canvas.height = height
          
          // Draw and compress
          ctx?.drawImage(img, 0, 0, width, height)
          
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob)
              } else {
                reject(new Error('Failed to compress image'))
              }
            },
            'image/jpeg',
            0.85 // 85% quality for thread images
          )
        }
      }
      reader.onerror = reject
    })
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)

    try {
      // Check file size (4MB limit)
      if (file.size > 4 * 1024 * 1024) {
        alert("Image size must be less than 4MB. Image will be compressed automatically.")
      }

      // Compress image
      const compressedBlob = await compressImage(file)
      
      // Check compressed size
      if (compressedBlob.size > 4 * 1024 * 1024) {
        throw new Error("Image is still too large after compression. Please use a smaller image.")
      }

      // Upload to Supabase Storage
      const fileName = `${authUser?.id}-${Date.now()}.jpg`

      const { error: uploadError, data } = await supabase.storage
        .from("thread-attachments")
        .upload(fileName, compressedBlob, {
          cacheControl: '3600',
          upsert: true,
          contentType: 'image/jpeg'
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        throw uploadError
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("thread-attachments")
        .getPublicUrl(fileName)

      setAttachedImage(publicUrl)
    } catch (error: any) {
      alert(error.message || "Failed to upload image")
    } finally {
      setUploadingImage(false)
    }
  }

  function handleAddLink(url: string, text: string) {
    // Add URL to content with markdown format
    setContent(content + (content ? '\n\n' : '') + `[${text}](${url})`)
    
    // Check for video embeds
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?]+)/)
    const loomMatch = url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/)
    
    if (youtubeMatch) {
      setUrlPreviews([...urlPreviews, { url, type: 'youtube', embedId: youtubeMatch[1] }])
    } else if (loomMatch) {
      setUrlPreviews([...urlPreviews, { url, type: 'loom', embedId: loomMatch[1] }])
    } else {
      setUrlPreviews([...urlPreviews, { url, type: 'default' }])
    }
  }

  const handleSubmit = async () => {
    if (submitting || !title.trim() || !content.trim()) return
    
    setSubmitting(true)
    try {
      let finalContent = content
      
      // Add image to content if attached
      if (attachedImage) {
        finalContent = content + (content ? '\n\n' : '') + `![Image](${attachedImage})`
      }
      
      const newThread = await createThread({
        title: title.trim(),
        content: finalContent,
        category
      })
      
      // Reset form
      setTitle("")
      setContent("")
      setCategory("general")
      setAttachedImage(null)
      
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

  const handleClose = () => {
    setTitle("")
    setContent("")
    setCategory("general")
    setAttachedImage(null)
    setUrlPreviews([])
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] sm:w-full max-h-[90vh] p-0 gap-0 [&>button]:hidden overflow-hidden flex flex-col">
        <VisuallyHidden>
          <DialogTitle>Create a new thread</DialogTitle>
        </VisuallyHidden>
        
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Header with user info */}
          <div className="flex items-center gap-3 mb-6">
            {user?.profile_image_url ? (
              <img 
                src={user.profile_image_url} 
                alt={user.name}
                className="h-10 w-10 rounded-full object-cover" 
              />
            ) : (
              <AvatarGradient seed={user?.email || ''} className="h-10 w-10" />
            )}
            <div className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{user?.name}</span>
              <span> posting in </span>
              <span className="font-semibold text-foreground">Control OS</span>
            </div>
          </div>

          {/* Title */}
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="text-2xl font-normal border-0 px-0 focus-visible:ring-0 placeholder:text-muted-foreground mb-4"
          />

          {/* Content */}
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write something..."
            className="min-h-[200px] resize-none border-0 px-0 focus-visible:ring-0 placeholder:text-muted-foreground text-base"
          />

          {/* Attached Image Preview */}
          {attachedImage && (
            <div className="relative mt-4 inline-block">
              <img 
                src={attachedImage} 
                alt="Attached" 
                className="max-h-[200px] rounded-lg border"
              />
              <button
                onClick={() => setAttachedImage(null)}
                className="absolute -top-2 -right-2 bg-background border rounded-full p-1 shadow-sm hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          
          {/* URL Previews */}
          {urlPreviews.length > 0 && (
            <div className="mt-4 space-y-3">
              {urlPreviews.map((preview, index) => (
                <div key={index} className="relative">
                  {preview.type === 'youtube' && preview.embedId && (
                    <div className="relative w-full max-w-sm overflow-hidden rounded-lg bg-black" style={{ aspectRatio: '16/9' }}>
                      <iframe
                        className="absolute top-0 left-0 w-full h-full"
                        src={`https://www.youtube.com/embed/${preview.embedId}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}
                  
                  {preview.type === 'loom' && preview.embedId && (
                    <div className="relative w-full max-w-sm overflow-hidden rounded-lg bg-black" style={{ aspectRatio: '16/9' }}>
                      <iframe
                        className="absolute top-0 left-0 w-full h-full"
                        src={`https://www.loom.com/embed/${preview.embedId}`}
                        allowFullScreen
                      />
                    </div>
                  )}
                  
                  {preview.type === 'default' && (
                    <div className="border rounded-lg p-3 bg-muted/30 max-w-md">
                      <a 
                        href={preview.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline break-all"
                      >
                        {preview.url}
                      </a>
                    </div>
                  )}
                  
                  <button
                    onClick={() => {
                      setUrlPreviews(urlPreviews.filter((_, i) => i !== index))
                      // Also remove from content
                      const urlRegex = new RegExp(`\\[[^\\]]*\\]\\(${preview.url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)`, 'g')
                      setContent(content.replace(urlRegex, ''))
                    }}
                    className="absolute -top-2 -right-2 bg-background border rounded-full p-1 shadow-sm hover:bg-muted"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-4 border-t flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            {/* Attachment button */}
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                disabled={uploadingImage || !!attachedImage}
              />
              <div className="p-2 hover:bg-muted rounded-md transition-colors">
                <Paperclip className="h-5 w-5 text-muted-foreground" />
              </div>
            </label>

            {/* Link button */}
            <button
              onClick={() => setShowUrlModal(true)}
              className="p-2 hover:bg-muted rounded-md transition-colors"
            >
              <Link2 className="h-5 w-5 text-muted-foreground" />
            </button>

            {/* Category selector */}
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-9 text-sm w-full sm:w-[180px] sm:ml-4">
                <SelectValue placeholder="Select a category" />
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

          <div className="flex items-center gap-3 justify-end">
            <Button 
              variant="ghost"
              onClick={handleClose}
              className="uppercase text-muted-foreground font-semibold text-xs sm:text-sm"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!title.trim() || !content.trim() || submitting || uploadingImage}
              className="uppercase font-semibold text-xs sm:text-sm"
            >
              {submitting ? 'Posting...' : 'Post'}
            </Button>
          </div>
        </div>
      </DialogContent>
      
      {/* URL Input Modal */}
      <UrlInputModal
        open={showUrlModal}
        onOpenChange={setShowUrlModal}
        onSubmit={handleAddLink}
      />
    </Dialog>
  )
}