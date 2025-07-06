"use client"

import { useEffect, useRef } from 'react'

interface LessonContentProps {
  content: string
}

export function LessonContent({ content }: LessonContentProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || !content) return

    // Process video embeds after content is rendered
    const links = containerRef.current.querySelectorAll('a')
    
    links.forEach(link => {
      const href = link.getAttribute('href')
      if (!href) return

      // Check if this is a video URL
      const videoMatch = href.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|loom\.com\/share\/|vimeo\.com\/)/)
      
      if (videoMatch && link.textContent === href) {
        const parent = link.parentElement
        
        // Only replace if the link is alone in a paragraph
        if (parent && parent.tagName === 'P' && parent.textContent?.trim() === href) {
          const embedHtml = getVideoEmbed(href)
          if (embedHtml) {
            const embedContainer = document.createElement('div')
            embedContainer.className = 'my-6'
            embedContainer.innerHTML = embedHtml
            parent.parentNode?.replaceChild(embedContainer, parent)
          }
        }
      }
    })
  }, [content])

  const getVideoEmbed = (url: string): string | null => {
    // YouTube
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
    if (youtubeMatch) {
      return `
        <div class="relative" style="padding-bottom: 56.25%;">
          <iframe
            src="https://www.youtube.com/embed/${youtubeMatch[1]}"
            class="absolute inset-0 w-full h-full rounded-lg"
            frameborder="0"
            allowfullscreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          ></iframe>
        </div>
      `
    }

    // Loom
    const loomMatch = url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/)
    if (loomMatch) {
      return `
        <div class="relative" style="padding-bottom: 56.25%;">
          <iframe
            src="https://www.loom.com/embed/${loomMatch[1]}"
            class="absolute inset-0 w-full h-full rounded-lg"
            frameborder="0"
            allowfullscreen
          ></iframe>
        </div>
      `
    }

    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
    if (vimeoMatch) {
      return `
        <div class="relative" style="padding-bottom: 56.25%;">
          <iframe
            src="https://player.vimeo.com/video/${vimeoMatch[1]}"
            class="absolute inset-0 w-full h-full rounded-lg"
            frameborder="0"
            allowfullscreen
          ></iframe>
        </div>
      `
    }

    return null
  }

  if (!content) {
    return <p className="text-gray-500">No content yet.</p>
  }

  return (
    <div 
      ref={containerRef}
      className="lesson-content"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}