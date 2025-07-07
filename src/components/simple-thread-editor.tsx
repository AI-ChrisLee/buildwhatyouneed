"use client"

import { useEditor, EditorContent } from '@tiptap/react'
import { useEffect } from 'react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'

interface SimpleThreadEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

export function SimpleThreadEditor({ 
  content, 
  onChange, 
  placeholder = "Write something..."
}: SimpleThreadEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        code: false,
        blockquote: false,
        horizontalRule: false,
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
        class: 'min-h-[300px] w-full resize-none focus:outline-none text-sm leading-relaxed [&_p]:mb-2 [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-2 [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-2 [&_li]:mb-1 [&_a]:text-blue-600 [&_a]:underline',
        'data-placeholder': placeholder,
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


  return (
    <>
      <style jsx global>{`
        .tiptap p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          color: #adb5bd;
          pointer-events: none;
          float: left;
          height: 0;
        }
      `}</style>
      <EditorContent 
        editor={editor} 
        className="tiptap"
      />
    </>
  )
}