'use client'

import { createClient } from './supabase/client'

interface UploadOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
}

/**
 * Optimizes an image by resizing it to fit within max dimensions while maintaining aspect ratio
 */
async function optimizeImage(
  file: File,
  options: UploadOptions = {}
): Promise<Blob> {
  const { maxWidth = 1460, maxHeight = 752, quality = 0.8 } = options

  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    img.onload = () => {
      // Calculate new dimensions
      let width = img.width
      let height = img.height

      // Calculate scaling to fit within max dimensions
      if (width > maxWidth || height > maxHeight) {
        const widthRatio = maxWidth / width
        const heightRatio = maxHeight / height
        const ratio = Math.min(widthRatio, heightRatio)
        
        width = Math.floor(width * ratio)
        height = Math.floor(height * ratio)
      }

      // Set canvas dimensions
      canvas.width = width
      canvas.height = height

      // Draw resized image
      ctx?.drawImage(img, 0, 0, width, height)

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to create blob'))
          }
        },
        'image/jpeg',
        quality
      )
    }

    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }

    // Read the file
    const reader = new FileReader()
    reader.onload = (e) => {
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  })
}

/**
 * Uploads an image to Supabase storage with automatic optimization
 */
export async function uploadCourseImage(file: File): Promise<string> {
  const supabase = createClient()
  
  // Validate file type
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.')
  }

  // Validate file size (2MB max before optimization)
  const maxSize = 2 * 1024 * 1024 // 2MB
  if (file.size > maxSize) {
    // If file is too large, we'll optimize it anyway
    console.log('File exceeds 2MB, optimizing...')
  }

  try {
    // Optimize the image
    const optimizedBlob = await optimizeImage(file, {
      maxWidth: 1460,
      maxHeight: 752,
      quality: 0.85
    })

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`
    const filePath = `courses/${fileName}`

    // Upload to Supabase
    const { data, error } = await supabase.storage
      .from('course-images')
      .upload(filePath, optimizedBlob, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      throw error
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('course-images')
      .getPublicUrl(filePath)

    return publicUrl
  } catch (error) {
    console.error('Upload error:', error)
    throw new Error('Failed to upload image')
  }
}

/**
 * Deletes an image from Supabase storage
 */
export async function deleteCourseImage(imageUrl: string): Promise<void> {
  const supabase = createClient()
  
  try {
    // Extract file path from URL
    const url = new URL(imageUrl)
    const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/course-images\/(.+)$/)
    
    if (!pathMatch) {
      throw new Error('Invalid image URL')
    }

    const filePath = pathMatch[1]
    
    const { error } = await supabase.storage
      .from('course-images')
      .remove([filePath])

    if (error) {
      throw error
    }
  } catch (error) {
    console.error('Delete error:', error)
    throw new Error('Failed to delete image')
  }
}