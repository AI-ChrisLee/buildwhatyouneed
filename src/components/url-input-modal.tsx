"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface UrlInputModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (url: string, text?: string) => void
}

export function UrlInputModal({ open, onOpenChange, onSubmit }: UrlInputModalProps) {
  const [url, setUrl] = useState("")
  const [text, setText] = useState("")

  const handleSubmit = () => {
    if (url.trim()) {
      // Ensure URL has protocol
      let finalUrl = url.trim()
      if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
        finalUrl = 'https://' + finalUrl
      }
      
      onSubmit(finalUrl, text.trim() || finalUrl)
      setUrl("")
      setText("")
      onOpenChange(false)
    }
  }

  const handleClose = () => {
    setUrl("")
    setText("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Link</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="text">Display Text (optional)</Label>
            <Input
              id="text"
              placeholder="Link text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!url.trim()}>
            Add Link
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}