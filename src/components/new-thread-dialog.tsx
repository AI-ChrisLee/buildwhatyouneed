"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Paperclip, Link, Video, BarChart3, Smile, X } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { createThread, type ThreadWithAuthor } from "@/lib/supabase/client-queries"
import { createClient } from "@/lib/supabase/client"
import { ThreadEditor } from "./thread-editor"
import { AvatarGradient } from "./ui/avatar-gradient"

interface NewThreadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onThreadCreated?: (thread: ThreadWithAuthor) => void
}

const categories = [
  { id: "general", label: "General discussion" },
  { id: "show-tell", label: "Show & Tell" },
  { id: "help", label: "Help" },
  { id: "announcements", label: "Announcements" },
]

export function NewThreadDialog({ open, onOpenChange, onThreadCreated }: NewThreadDialogProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("general")
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [urlToEmbed, setUrlToEmbed] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [user, setUser] = useState<{ email: string; name: string } | null>(null)
  const [showIdeas, setShowIdeas] = useState(true)
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

  const handleEmbedUrl = () => {
    if (urlToEmbed) {
      // Add URL as a link in the content
      const urlHtml = `<p><a href="${urlToEmbed}" target="_blank">${urlToEmbed}</a></p>`
      setContent(content + urlHtml)
      setUrlToEmbed("")
      setShowUrlInput(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting || !title.trim() || !content.trim()) return
    
    setSubmitting(true)
    try {
      const newThread = await createThread({
        title: title.trim(),
        content,
        category
      })
      
      // Reset form
      setTitle("")
      setContent("")
      setCategory("general")
      setShowIdeas(true)
      
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 gap-0">
        <VisuallyHidden>
          <DialogTitle>Create a new thread</DialogTitle>
        </VisuallyHidden>
        
        {/* Header */}
        <div className="px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            {user ? (
              <AvatarGradient seed={user.email} className="h-10 w-10" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200" />
            )}
            <div className="flex-1">
              <p className="text-sm">
                <span className="font-medium">{user?.name || 'You'}</span>
                <span className="text-gray-500"> posting in </span>
                <span className="font-medium">Build What You Need</span>
              </p>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            {/* Title */}
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="text-2xl font-medium border-0 px-0 focus-visible:ring-0 placeholder:text-gray-400"
              required
            />

            {/* Content Editor */}
            <ThreadEditor
              content={content}
              onChange={setContent}
              placeholder="Write something..."
              minHeight="min-h-[250px]"
            />

            {/* URL Input (if shown) */}
            {showUrlInput && (
              <div className="flex gap-2 p-3 bg-gray-50 rounded-lg">
                <Input
                  placeholder="Enter URL to embed..."
                  value={urlToEmbed}
                  onChange={(e) => setUrlToEmbed(e.target.value)}
                  className="flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleEmbedUrl())}
                />
                <Button type="button" size="sm" onClick={handleEmbedUrl}>
                  Embed
                </Button>
                <Button 
                  type="button"
                  size="sm" 
                  variant="ghost"
                  onClick={() => {
                    setShowUrlInput(false)
                    setUrlToEmbed("")
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Post Ideas Box */}
            {showIdeas && (
              <div className="bg-gray-50 rounded-lg p-4 relative">
                <button
                  type="button"
                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowIdeas(false)}
                >
                  <X className="h-4 w-4" />
                </button>
                
                <p className="font-medium text-gray-600 mb-3">Fun post ideas to kick off your community:</p>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex gap-2">
                    <span>🗣️</span>
                    <span>Ask members to introduce themselves and share a pic of their workspace</span>
                  </div>
                  <div className="flex gap-2">
                    <span>❤️</span>
                    <span>Ask members to share their favorite movie, book, travel destination, etc.</span>
                  </div>
                  <div className="flex gap-2">
                    <span>📊</span>
                    <span>Ask members to vote on their favorite pet</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t flex items-center justify-between bg-gray-50">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                title="Attach file"
                onClick={() => {/* TODO: File upload */}}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={() => setShowUrlInput(!showUrlInput)}
                title="Add link"
              >
                <Link className="h-4 w-4" />
              </Button>
              
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                title="Add video"
                onClick={() => setShowUrlInput(!showUrlInput)}
              >
                <Video className="h-4 w-4" />
              </Button>
              
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                title="Create poll"
                onClick={() => {/* TODO: Poll */}}
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
              
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                title="Add emoji"
                onClick={() => {/* TODO: Emoji picker */}}
              >
                <Smile className="h-4 w-4" />
              </Button>
              
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="text-xs text-gray-600"
                onClick={() => {/* TODO: GIF picker */}}
              >
                GIF
              </Button>
              
              <div className="ml-4">
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-8 text-sm w-[180px]">
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