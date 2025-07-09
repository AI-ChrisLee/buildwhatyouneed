"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { X } from "lucide-react"

interface ImageModalProps {
  imageUrl: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ImageModal({ imageUrl, open, onOpenChange }: ImageModalProps) {
  if (!imageUrl) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 overflow-hidden border-0 bg-black/95">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 z-50 rounded-full bg-white/10 backdrop-blur p-2 text-white hover:bg-white/20 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="flex items-center justify-center w-full h-full p-8">
          <img
            src={imageUrl}
            alt="Full size"
            className="max-w-full max-h-[calc(100vh-4rem)] w-auto h-auto object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}