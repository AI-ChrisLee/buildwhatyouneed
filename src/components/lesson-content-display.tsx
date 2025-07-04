import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Link2, Video, Download, FileText, ExternalLink, CheckCircle } from "lucide-react"
import { LessonContent, LessonResource } from "./lesson-description-editor"

interface LessonContentDisplayProps {
  description: string | null | undefined
}

export function LessonContentDisplay({ description }: LessonContentDisplayProps) {
  let content: LessonContent | null = null
  
  try {
    if (description) {
      content = JSON.parse(description) as LessonContent
    }
  } catch {
    // If parsing fails, treat as plain text
    return (
      <Card>
        <CardHeader>
          <CardTitle>About this lesson</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{description || 'No description available.'}</p>
        </CardContent>
      </Card>
    )
  }

  if (!content) {
    return null
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
      {/* Overview */}
      {content.overview && (
        <Card>
          <CardHeader>
            <CardTitle>Lesson Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">{content.overview}</p>
          </CardContent>
        </Card>
      )}

      {/* Learning Points */}
      {content.learningPoints && content.learningPoints.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>What You'll Learn</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {content.learningPoints.map((point, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{point}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Resources */}
      {content.resources && content.resources.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Lesson Resources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {content.resources.map((resource, index) => (
              <a
                key={index}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded">
                    {getResourceIcon(resource.type)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium flex items-center gap-2">
                      {resource.title}
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    </p>
                    {resource.description && (
                      <p className="text-sm text-muted-foreground">{resource.description}</p>
                    )}
                  </div>
                </div>
              </a>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}