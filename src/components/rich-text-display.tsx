"use client"

import DOMPurify from 'dompurify'
import { useEffect, useState } from 'react'

interface RichTextDisplayProps {
  content: string
  className?: string
}

export function RichTextDisplay({ content, className = '' }: RichTextDisplayProps) {
  const [sanitizedContent, setSanitizedContent] = useState('')

  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      const cleaned = DOMPurify.sanitize(content, {
        ALLOWED_TAGS: [
          'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
          'p', 'br', 'strong', 'em', 'del', 'u',
          'ul', 'ol', 'li',
          'blockquote', 'pre', 'code',
          'a', 'img',
          'table', 'thead', 'tbody', 'tr', 'th', 'td',
          'div', 'span'
        ],
        ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'target', 'rel'],
      })
      setSanitizedContent(cleaned)
    }
  }, [content])

  if (!sanitizedContent) {
    return null
  }

  return (
    <div 
      className={`prose prose-sm max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  )
}