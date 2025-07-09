"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ImageModal } from "@/components/image-modal"

interface ThreadContentProps {
  content: string
  className?: string
}

interface LinkPreview {
  url: string
  title?: string
  description?: string
  image?: string
  type: 'youtube' | 'loom' | 'default'
  embedId?: string
}

export function ThreadContent({ content, className = "" }: ThreadContentProps) {
  const [previews, setPreviews] = useState<LinkPreview[]>([])
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [imageModalOpen, setImageModalOpen] = useState(false)
  
  // Extract URLs from content
  useEffect(() => {
    const urlRegex = /\[([^\]]+)\]\(([^)]+)\)/g
    const matches = Array.from(content.matchAll(urlRegex))
    
    const linkPreviews: LinkPreview[] = matches.map(match => {
      const url = match[2]
      
      // Check for YouTube
      const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?]+)/)
      if (youtubeMatch) {
        return {
          url,
          type: 'youtube',
          embedId: youtubeMatch[1]
        }
      }
      
      // Check for Loom
      const loomMatch = url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/)
      if (loomMatch) {
        return {
          url,
          type: 'loom',
          embedId: loomMatch[1]
        }
      }
      
      return {
        url,
        type: 'default'
      }
    })
    
    setPreviews(linkPreviews)
  }, [content])
  
  // Parse markdown-style content
  const renderContent = () => {
    let processedContent = content
    
    // First convert markdown images: ![alt](url) to clickable <img>
    processedContent = processedContent.replace(
      /!\[([^\]]*)\]\(([^)]+)\)/g,
      '<img src="$2" alt="$1" class="rounded-lg max-w-[600px] max-h-[400px] object-cover my-4 cursor-pointer hover:opacity-90 transition-opacity" data-clickable-image="true" />'
    )
    
    // Then handle regular links to avoid processing image syntax
    processedContent = processedContent.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">$1</a>'
    )
    
    // Convert line breaks to <br>
    processedContent = processedContent.replace(/\n/g, '<br />')
    
    // Bold text
    processedContent = processedContent.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    
    // Italic text
    processedContent = processedContent.replace(/\*([^*]+)\*/g, '<em>$1</em>')
    
    return processedContent
  }
  
  // Handle image clicks
  useEffect(() => {
    const handleImageClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'IMG' && target.dataset.clickableImage === 'true') {
        const imgSrc = target.getAttribute('src')
        if (imgSrc) {
          setSelectedImage(imgSrc)
          setImageModalOpen(true)
        }
      }
    }

    // Add click listener to the document
    document.addEventListener('click', handleImageClick)
    
    return () => {
      document.removeEventListener('click', handleImageClick)
    }
  }, [])

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Render main content */}
      <div 
        className="text-sm leading-relaxed break-words"
        dangerouslySetInnerHTML={{ __html: renderContent() }}
      />
      
      {/* Render embeds - only show YouTube and Loom embeds */}
      {previews
        .filter(preview => preview.type === 'youtube' || preview.type === 'loom')
        .map((preview, index) => (
          <div key={index} className="my-4">
            {preview.type === 'youtube' && preview.embedId && (
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  className="absolute top-0 left-0 w-full h-full rounded-lg"
                  src={`https://www.youtube.com/embed/${preview.embedId}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
            
            {preview.type === 'loom' && preview.embedId && (
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  className="absolute top-0 left-0 w-full h-full rounded-lg"
                  src={`https://www.loom.com/embed/${preview.embedId}`}
                  allowFullScreen
                />
              </div>
            )}
          </div>
        ))}
      
      {/* Image Modal */}
      <ImageModal
        imageUrl={selectedImage}
        open={imageModalOpen}
        onOpenChange={setImageModalOpen}
      />
    </div>
  )
}