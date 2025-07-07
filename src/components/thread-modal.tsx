"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThreadEditor } from "./thread-editor"
import { createClient } from "@/lib/supabase/client"
import {
  Paperclip,
  Link2,
  Video,
  BarChart3,
  Smile,
  Image as ImageIcon,
  X
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ThreadModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onThreadCreated?: () => void
}

export function ThreadModal({ open, onOpenChange, onThreadCreated }: ThreadModalProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("general")
  const [creating, setCreating] = useState(false)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [urlToEmbed, setUrlToEmbed] = useState("")
  const supabase = createClient()

  const handleCreate = async () => {
    if (!title.trim() || !content.trim()) return

    setCreating(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('threads')
        .insert({
          title: title.trim(),
          content,
          category,
          user_id: user.id,
        })

      if (!error) {
        setTitle("")
        setContent("")
        setCategory("general")
        onOpenChange(false)
        onThreadCreated?.()
      } else {
        console.error('Error creating thread:', error)
        alert('Failed to create thread')
      }
    } catch (error) {
      console.error('Error creating thread:', error)
    } finally {
      setCreating(false)
    }
  }

  const handleEmbedUrl = () => {
    if (urlToEmbed) {
      // Add URL as a link in the content
      const urlHtml = `<p><a href="${urlToEmbed}" target="_blank">${urlToEmbed}</a></p>`
      setContent(content + urlHtml)
      setUrlToEmbed("")
      setShowUrlInput(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-sm font-medium">You</span>
            </div>
            <div className="flex-1">
              <p className="text-sm">
                <span className="font-medium">You</span>
                <span className="text-gray-500"> posting in </span>
                <span className="font-medium">Build What You Need</span>
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-4">
          {/* Title Input */}
          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-2xl font-medium border-0 px-0 focus-visible:ring-0 placeholder:text-gray-400"
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
              />
              <Button size="sm" onClick={handleEmbedUrl}>
                Embed
              </Button>
              <Button 
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
          <div className="bg-gray-50 rounded-lg p-4 relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              onClick={() => {/* Hide this box */}}
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
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={() => {/* TODO: File upload */}}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={() => setShowUrlInput(!showUrlInput)}
            >
              <Link2 className="h-4 w-4" />
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={() => {/* TODO: Video embed */}}
            >
              <Video className="h-4 w-4" />
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={() => {/* TODO: Poll */}}
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={() => {/* TODO: Emoji picker */}}
            >
              <Smile className="h-4 w-4" />
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              className="text-xs text-gray-600"
              onClick={() => {/* TODO: GIF picker */}}
            >
              GIF
            </Button>
            
            <div className="ml-4">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General discussion</SelectItem>
                  <SelectItem value="question">Question</SelectItem>
                  <SelectItem value="showcase">Showcase</SelectItem>
                  <SelectItem value="resource">Resource</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={creating}
            >
              CANCEL
            </Button>
            
            <Button
              onClick={handleCreate}
              disabled={!title.trim() || !content.trim() || creating}
            >
              {creating ? "POSTING..." : "POST"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}