"use client"

interface ThreadContentProps {
  content: string
  className?: string
}

export function ThreadContent({ content, className = "" }: ThreadContentProps) {
  // Create a function to safely render HTML content
  const createMarkup = () => {
    return { __html: content }
  }

  return (
    <div 
      className={`prose prose-sm max-w-none ${className} 
        [&_p]:mb-2 [&_ul]:list-disc [&_ul]:list-inside [&_ul]:mb-2 
        [&_ol]:list-decimal [&_ol]:list-inside [&_ol]:mb-2 
        [&_li]:mb-1 [&_a]:text-blue-600 [&_a]:underline [&_a:hover]:text-blue-800
        [&_strong]:font-bold [&_em]:italic
      `}
      dangerouslySetInnerHTML={createMarkup()}
    />
  )
}