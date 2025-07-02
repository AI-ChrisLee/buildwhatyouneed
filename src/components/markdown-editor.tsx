"use client"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: string
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = "Write your content... (Markdown supported)",
  minHeight = "200px",
}: MarkdownEditorProps) {
  const [isPreview, setIsPreview] = useState(false)

  const insertMarkdown = (before: string, after: string = "") => {
    const textarea = document.querySelector("textarea") as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    const newText =
      value.substring(0, start) +
      before +
      selectedText +
      after +
      value.substring(end)

    onChange(newText)
    
    // Reset cursor position
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      )
    }, 0)
  }

  const formatButtons = [
    { label: "B", title: "Bold", action: () => insertMarkdown("**", "**") },
    { label: "I", title: "Italic", action: () => insertMarkdown("*", "*") },
    { label: "Link", title: "Link", action: () => insertMarkdown("[", "](url)") },
    { label: "Code", title: "Code", action: () => insertMarkdown("`", "`") },
    { label: "Quote", title: "Quote", action: () => insertMarkdown("> ", "") },
    { label: "List", title: "List", action: () => insertMarkdown("- ", "") },
  ]

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {formatButtons.map((btn) => (
            <Button
              key={btn.label}
              type="button"
              variant="outline"
              size="sm"
              onClick={btn.action}
              title={btn.title}
              className="h-8 px-2"
            >
              {btn.label}
            </Button>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsPreview(!isPreview)}
        >
          {isPreview ? "Edit" : "Preview"}
        </Button>
      </div>

      {isPreview ? (
        <Card className="p-4" style={{ minHeight }}>
          <div 
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ 
              __html: renderMarkdown(value) 
            }}
          />
        </Card>
      ) : (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ minHeight }}
          className="font-mono text-sm"
        />
      )}

      <p className="text-xs text-muted-foreground">
        Supports Markdown: **bold**, *italic*, [links](url), `code`, quotes, lists
      </p>
    </div>
  )
}

// Simple markdown renderer (in production, use a proper markdown parser)
function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="underline">$1</a>')
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/\n/g, "<br />")
}