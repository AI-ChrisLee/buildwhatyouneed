"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, X, Link2, FileText, Video, Download, ExternalLink } from "lucide-react"

export interface LessonResource {
  type: 'link' | 'download' | 'video' | 'document'
  title: string
  url: string
  description?: string
}

export interface LessonContent {
  overview: string
  learningPoints: string[]
  resources: LessonResource[]
}

interface LessonDescriptionEditorProps {
  value: string
  onChange: (value: string) => void
}

export function LessonDescriptionEditor({ value, onChange }: LessonDescriptionEditorProps) {
  // Parse existing value or use defaults
  const [content, setContent] = useState<LessonContent>(() => {
    try {
      return JSON.parse(value) as LessonContent
    } catch {
      return {
        overview: value || '',
        learningPoints: [],
        resources: []
      }
    }
  })

  const [newPoint, setNewPoint] = useState('')
  const [newResource, setNewResource] = useState<Partial<LessonResource>>({
    type: 'link',
    title: '',
    url: '',
    description: ''
  })

  const updateContent = (updates: Partial<LessonContent>) => {
    const newContent = { ...content, ...updates }
    setContent(newContent)
    onChange(JSON.stringify(newContent))
  }

  const addLearningPoint = () => {
    if (newPoint.trim()) {
      updateContent({
        learningPoints: [...content.learningPoints, newPoint.trim()]
      })
      setNewPoint('')
    }
  }

  const removeLearningPoint = (index: number) => {
    updateContent({
      learningPoints: content.learningPoints.filter((_, i) => i !== index)
    })
  }

  const addResource = () => {
    if (newResource.title && newResource.url) {
      updateContent({
        resources: [...content.resources, newResource as LessonResource]
      })
      setNewResource({
        type: 'link',
        title: '',
        url: '',
        description: ''
      })
    }
  }

  const removeResource = (index: number) => {
    updateContent({
      resources: content.resources.filter((_, i) => i !== index)
    })
  }

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />
      case 'download': return <Download className="h-4 w-4" />
      case 'document': return <FileText className="h-4 w-4" />
      default: return <Link2 className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Overview Section */}
      <div className="space-y-2">
        <Label>Lesson Overview</Label>
        <Textarea
          value={content.overview}
          onChange={(e) => updateContent({ overview: e.target.value })}
          placeholder="Provide a brief overview of what students will learn in this lesson..."
          rows={3}
        />
      </div>

      {/* Learning Points Section */}
      <div className="space-y-2">
        <Label>What You'll Learn</Label>
        <div className="space-y-2">
          {content.learningPoints.map((point, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="text-sm">•</span>
              <span className="flex-1 text-sm">{point}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeLearningPoint(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <div className="flex gap-2">
            <Input
              value={newPoint}
              onChange={(e) => setNewPoint(e.target.value)}
              placeholder="Add a learning point..."
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLearningPoint())}
            />
            <Button onClick={addLearningPoint} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Resources Section */}
      <div className="space-y-2">
        <Label>Lesson Resources</Label>
        <div className="space-y-3">
          {content.resources.map((resource, index) => (
            <Card key={index}>
              <CardContent className="p-3 flex items-center gap-3">
                {getResourceIcon(resource.type)}
                <div className="flex-1">
                  <p className="font-medium text-sm">{resource.title}</p>
                  {resource.description && (
                    <p className="text-xs text-muted-foreground">{resource.description}</p>
                  )}
                  <a 
                    href={resource.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                  >
                    {resource.url}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeResource(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}

          {/* Add Resource Form */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs">Resource Type</Label>
                  <select
                    className="w-full p-2 border rounded-md text-sm"
                    value={newResource.type}
                    onChange={(e) => setNewResource({ ...newResource, type: e.target.value as any })}
                  >
                    <option value="link">Link</option>
                    <option value="download">Download</option>
                    <option value="video">Video</option>
                    <option value="document">Document</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Title</Label>
                  <Input
                    value={newResource.title || ''}
                    onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                    placeholder="Resource title"
                    className="text-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">URL</Label>
                <Input
                  value={newResource.url || ''}
                  onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                  placeholder="https://..."
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Description (optional)</Label>
                <Input
                  value={newResource.description || ''}
                  onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                  placeholder="Brief description"
                  className="text-sm"
                />
              </div>
              <Button 
                onClick={addResource} 
                size="sm" 
                className="w-full"
                disabled={!newResource.title || !newResource.url}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Resource
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}