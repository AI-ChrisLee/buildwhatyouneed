import { Node } from '@tiptap/core'

export interface VideoOptions {
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    video: {
      setVideo: (options: { src: string }) => ReturnType
    }
  }
}

export const Video = Node.create<VideoOptions>({
  name: 'video',

  group: 'block',

  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      src: {
        default: null,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-video-embed]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const { src } = HTMLAttributes
    
    if (!src) return ['div']

    // YouTube
    const youtubeMatch = src.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
    if (youtubeMatch) {
      return [
        'div',
        { 'data-video-embed': 'youtube', class: 'relative aspect-video my-4' },
        [
          'iframe',
          {
            src: `https://www.youtube.com/embed/${youtubeMatch[1]}`,
            class: 'absolute inset-0 w-full h-full rounded-lg',
            frameborder: '0',
            allowfullscreen: 'true',
            allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
          },
        ],
      ]
    }

    // Loom
    const loomMatch = src.match(/loom\.com\/share\/([a-zA-Z0-9]+)/)
    if (loomMatch) {
      return [
        'div',
        { 'data-video-embed': 'loom', class: 'relative aspect-video my-4' },
        [
          'iframe',
          {
            src: `https://www.loom.com/embed/${loomMatch[1]}`,
            class: 'absolute inset-0 w-full h-full rounded-lg',
            frameborder: '0',
            allowfullscreen: 'true',
          },
        ],
      ]
    }

    // Vimeo
    const vimeoMatch = src.match(/vimeo\.com\/(\d+)/)
    if (vimeoMatch) {
      return [
        'div',
        { 'data-video-embed': 'vimeo', class: 'relative aspect-video my-4' },
        [
          'iframe',
          {
            src: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
            class: 'absolute inset-0 w-full h-full rounded-lg',
            frameborder: '0',
            allowfullscreen: 'true',
          },
        ],
      ]
    }

    return ['div']
  },

  addCommands() {
    return {
      setVideo: (options) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: options,
        })
      },
    }
  },
})