"use client"

import { useEditor, EditorContent } from '@tiptap/react'
import { useEffect } from 'react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import { Button } from '@/components/ui/button'
import {
  Bold,
  Italic,
  Link2,
  List,
  ListOrdered,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ThreadEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  minHeight?: string
}

export function ThreadEditor({ 
  content, 
  onChange, 
  placeholder = "Write something...",
  minHeight = "min-h-[200px]"
}: ThreadEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        code: false,
        blockquote: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange(html)
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm max-w-none focus:outline-none',
          minHeight,
          'px-4 py-3',
          '[&_p]:mb-2 [&_ul]:list-disc [&_ul]:list-inside [&_ul]:mb-2',
          '[&_ol]:list-decimal [&_ol]:list-inside [&_ol]:mb-2',
          '[&_li]:mb-1 [&_a]:text-blue-600 [&_a]:underline'
        ),
      },
    },
    immediatelyRender: false,
  })

  // Update editor content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  if (!editor) {
    return null
  }

  const addLink = () => {
    const url = window.prompt('Enter URL:')
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <EditorContent 
        editor={editor} 
        placeholder={placeholder}
      />
      
      <div className="border-t bg-gray-50 p-2 flex items-center gap-1">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn(
            "h-8 w-8 p-0",
            editor.isActive('bold') && "bg-gray-200"
          )}
        >
          <Bold className="h-4 w-4" />
        </Button>
        
        <Button
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(
            "h-8 w-8 p-0",
            editor.isActive('italic') && "bg-gray-200"
          )}
        >
          <Italic className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        <Button
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn(
            "h-8 w-8 p-0",
            editor.isActive('bulletList') && "bg-gray-200"
          )}
        >
          <List className="h-4 w-4" />
        </Button>
        
        <Button
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn(
            "h-8 w-8 p-0",
            editor.isActive('orderedList') && "bg-gray-200"
          )}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        <Button
          size="sm"
          variant="ghost"
          onClick={addLink}
          className={cn(
            "h-8 w-8 p-0",
            editor.isActive('link') && "bg-gray-200"
          )}
        >
          <Link2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}