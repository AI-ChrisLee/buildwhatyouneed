"use client"

interface VideoEmbedProps {
  url: string
}

export function VideoEmbed({ url }: VideoEmbedProps) {
  // Extract video ID and platform
  const getVideoEmbed = (url: string) => {
    // YouTube
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)
    if (youtubeMatch) {
      return {
        platform: 'youtube',
        id: youtubeMatch[1],
        embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}`
      }
    }

    // Loom
    const loomMatch = url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/)
    if (loomMatch) {
      return {
        platform: 'loom',
        id: loomMatch[1],
        embedUrl: `https://www.loom.com/embed/${loomMatch[1]}`
      }
    }

    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
    if (vimeoMatch) {
      return {
        platform: 'vimeo',
        id: vimeoMatch[1],
        embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`
      }
    }

    return null
  }

  const videoInfo = getVideoEmbed(url)

  if (!videoInfo) {
    return (
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-blue-600 underline hover:text-blue-800"
      >
        {url}
      </a>
    )
  }

  return (
    <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-gray-100 my-4">
      <iframe
        src={videoInfo.embedUrl}
        className="absolute inset-0 w-full h-full"
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />
    </div>
  )
}