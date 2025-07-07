"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from "lucide-react"
import { createThread, type ThreadWithAuthor } from "@/lib/supabase/client-queries"
import { SimpleThreadEditor } from "./simple-thread-editor"

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

  const handleSubmit = async () => {
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
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 gap-0 [&>button]:hidden">
        <VisuallyHidden>
          <DialogTitle>Create a new thread</DialogTitle>
        </VisuallyHidden>
        
        {/* Simple Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-medium">New Post</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          {/* Title */}
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="text-xl border-0 px-0 focus-visible:ring-0 placeholder:text-gray-400"
          />

          {/* Content Editor */}
          <SimpleThreadEditor
            content={content}
            onChange={setContent}
            placeholder="Write something..."
          />

        </div>

        {/* Simple Footer */}
        <div className="px-6 py-4 border-t flex items-center justify-between">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="h-9 text-sm w-[180px]">
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

          <div className="flex items-center gap-3">
            <Button 
              variant="ghost"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!title.trim() || !content.trim() || submitting}
            >
              {submitting ? 'Posting...' : 'Post'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}