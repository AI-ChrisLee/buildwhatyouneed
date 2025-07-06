"use client"

import { useState, useEffect, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Upload, X, Loader2 } from "lucide-react"
import { uploadCourseImage, deleteCourseImage } from "@/lib/upload"

interface Course {
  id?: string
  title: string
  description: string | null
  is_free: boolean
  is_draft: boolean
  cover_image_url?: string | null
  order_index?: number
}

interface CourseModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  course?: Course | null
  onSave: (courseData: Partial<Course>) => Promise<void>
}

export function CourseModal({ open, onOpenChange, course, onSave }: CourseModalProps) {
  const [formData, setFormData] = useState<Partial<Course>>({
    title: "",
    description: "",
    is_free: true,
    is_draft: false,
    cover_image_url: null,
  })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [accessType, setAccessType] = useState<"open" | "paid">("open")
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title || "",
        description: course.description || "",
        is_free: course.is_free ?? true,
        is_draft: course.is_draft ?? false,
        cover_image_url: course.cover_image_url || null,
      })
      setAccessType(course.is_free ? "open" : "paid")
    } else {
      setFormData({
        title: "",
        description: "",
        is_free: true,
        is_draft: false,
        cover_image_url: null,
      })
      setAccessType("open")
    }
  }, [course])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSave({
        ...formData,
        is_free: accessType === "open",
        is_draft: false,
      })
      onOpenChange(false)
      // Reset form
      setFormData({
        title: "",
        description: "",
        is_free: true,
        is_draft: false,
        cover_image_url: null,
      })
      setAccessType("open")
    } catch (error) {
      console.error("Failed to save course:", error)
      alert("Failed to save course. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      // If there's an existing image, delete it first
      if (formData.cover_image_url && formData.cover_image_url.includes('supabase')) {
        try {
          await deleteCourseImage(formData.cover_image_url)
        } catch (error) {
          console.error('Failed to delete old image:', error)
        }
      }

      // Upload new image
      const publicUrl = await uploadCourseImage(file)
      setFormData({ ...formData, cover_image_url: publicUrl })
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Failed to upload image. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = async () => {
    if (formData.cover_image_url && formData.cover_image_url.includes('supabase')) {
      try {
        await deleteCourseImage(formData.cover_image_url)
      } catch (error) {
        console.error('Failed to delete image:', error)
      }
    }
    setFormData({ ...formData, cover_image_url: null })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0">
        <form onSubmit={handleSubmit}>
          <div className="p-6 pb-4">
            <h2 className="text-lg font-semibold mb-4">{course ? "Edit course" : "Add course"}</h2>
            
            {/* Course Name */}
            <div className="mb-3">
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Course name"
                required
                maxLength={50}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground text-right mt-1">
                {formData.title?.length || 0} / 50
              </p>
            </div>

            {/* Course Description */}
            <div className="mb-4">
              <Textarea
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Course description"
                rows={3}
                maxLength={500}
                className="w-full resize-none"
              />
              <p className="text-xs text-muted-foreground text-right mt-1">
                {formData.description?.length || 0} / 500
              </p>
            </div>

            {/* Access Type - Radio Group */}
            <RadioGroup value={accessType} onValueChange={(value) => setAccessType(value as "open" | "paid")} className="mb-6">
              <div className="flex items-center space-x-2 mb-3">
                <RadioGroupItem value="open" id="open" />
                <Label htmlFor="open" className="flex-1 cursor-pointer">
                  <div className="font-medium">Open</div>
                  <div className="text-sm text-muted-foreground">All members can access.</div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="paid" id="paid" />
                <Label htmlFor="paid" className="flex-1 cursor-pointer">
                  <div className="font-medium">Buy now</div>
                  <div className="text-sm text-muted-foreground">Members pay a 1-time price to unlock.</div>
                </Label>
              </div>
            </RadioGroup>

            {/* Cover Image */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Cover</span>
                <span className="text-xs text-muted-foreground">1460 x 752 px</span>
              </div>
              
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full h-24 border-2 border-dashed rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors relative overflow-hidden"
                  >
                    {uploading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                        <span className="text-xs text-gray-500">Uploading...</span>
                      </div>
                    ) : formData.cover_image_url ? (
                      <>
                        <img
                          src={formData.cover_image_url}
                          alt="Course cover"
                          className="h-full w-full object-cover"
                        />
                        {formData.cover_image_url && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemoveImage()
                            }}
                            className="absolute top-1 right-1 p-1 bg-white rounded-full shadow-sm hover:bg-gray-100"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </>
                    ) : (
                      <div className="text-center">
                        <Upload className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                        <span className="text-xs text-blue-600">Upload</span>
                      </div>
                    )}
                  </button>
                </div>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="px-6"
                >
                  CHANGE
                </Button>
              </div>
            </div>

            {/* Published Status */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Published</span>
              <Switch
                checked={!formData.is_draft}
                onCheckedChange={(checked) => setFormData({ ...formData, is_draft: !checked })}
              />
            </div>
          </div>

          <DialogFooter className="border-t px-6 py-3">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              CANCEL
            </Button>
            <Button type="submit" disabled={saving || uploading || !formData.title}>
              {saving ? "Saving..." : course ? "UPDATE" : "ADD"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}