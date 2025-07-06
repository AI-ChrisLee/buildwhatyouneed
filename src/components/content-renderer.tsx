"use client"

import { VideoEmbed } from './video-embed'
import { useEffect, useRef } from 'react'

interface ContentRendererProps {
  content: string
}

export function ContentRenderer({ content }: ContentRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Find all links in the content
    const links = containerRef.current.querySelectorAll('a')
    
    links.forEach(link => {
      const href = link.getAttribute('href')
      if (!href) return

      // Check if this is a video link
      const isVideoLink = 
        href.includes('youtube.com') || 
        href.includes('youtu.be') || 
        href.includes('loom.com') || 
        href.includes('vimeo.com')

      if (isVideoLink && link.textContent === href) {
        // Create a placeholder div
        const placeholder = document.createElement('div')
        placeholder.setAttribute('data-video-url', href)
        placeholder.className = 'video-placeholder'
        
        // Replace the link with placeholder
        link.parentNode?.replaceChild(placeholder, link)
      }
    })
  }, [content])

  // Parse content to replace video placeholders
  const renderContent = () => {
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = content
    
    // Get all video placeholders
    const placeholders = tempDiv.querySelectorAll('.video-placeholder')
    placeholders.forEach(placeholder => {
      const url = placeholder.getAttribute('data-video-url')
      if (url) {
        placeholder.innerHTML = `<div data-video="${url}"></div>`
      }
    })
    
    return tempDiv.innerHTML
  }

  return (
    <div 
      ref={containerRef}
      className="prose prose-lg max-w-none"
      dangerouslySetInnerHTML={{ __html: renderContent() }}
    />
  )
}

// Create a separate component to handle video rendering after mount
export function ContentWithVideos({ content }: ContentRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Find all links that are video URLs
    const links = containerRef.current.querySelectorAll('a')
    
    links.forEach(link => {
      const url = link.href
      if (!url) return

      // Check if this is a video URL and the link text is the same as the URL
      const isVideoUrl = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|loom\.com\/share\/|vimeo\.com\/)/)
      if (isVideoUrl && link.textContent === url) {
        const parent = link.parentElement
        
        // Check if this link is alone in a paragraph
        if (parent && parent.tagName === 'P' && parent.textContent?.trim() === url) {
          // Create video embed
          const embedContainer = document.createElement('div')
          embedContainer.className = 'not-prose my-6'
          embedContainer.innerHTML = getVideoEmbedHTML(url)
          
          // Replace the paragraph with the embed
          parent.parentNode?.replaceChild(embedContainer, parent)
        }
      }
    })
  }, [content])

  const getVideoEmbedHTML = (url: string): string => {
    // YouTube
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)
    if (youtubeMatch) {
      return `
        <div class="relative aspect-video w-full rounded-lg overflow-hidden bg-gray-100">
          <iframe
            src="https://www.youtube.com/embed/${youtubeMatch[1]}"
            class="absolute inset-0 w-full h-full"
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
        <div class="relative aspect-video w-full rounded-lg overflow-hidden bg-gray-100">
          <iframe
            src="https://www.loom.com/embed/${loomMatch[1]}"
            class="absolute inset-0 w-full h-full"
            allowfullscreen
          ></iframe>
        </div>
      `
    }

    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
    if (vimeoMatch) {
      return `
        <div class="relative aspect-video w-full rounded-lg overflow-hidden bg-gray-100">
          <iframe
            src="https://player.vimeo.com/video/${vimeoMatch[1]}"
            class="absolute inset-0 w-full h-full"
            allowfullscreen
          ></iframe>
        </div>
      `
    }

    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline hover:text-blue-800">${url}</a>`
  }

  return (
    <div 
      ref={containerRef}
      className="prose prose-lg max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-h4:text-lg prose-p:my-4 prose-ul:my-4 prose-ol:my-4 prose-li:my-1"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}