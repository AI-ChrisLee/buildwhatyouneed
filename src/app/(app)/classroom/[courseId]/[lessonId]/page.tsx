import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Play, CheckCircle, Clock, FileText, ChevronLeft, ChevronRight } from "lucide-react"

const courses = {
  "saas-101": {
    title: "SaaS Destruction 101",
    lessons: [
      { id: "1", title: "Introduction: The SaaS Lie", duration: "12:34" },
      { id: "2", title: "Setting Up Your Dev Environment", duration: "18:45" },
      { id: "3", title: "Replacing Intercom with 50 Lines", duration: "25:12" },
      { id: "4", title: "Kill Your Analytics Platform", duration: "19:38" },
      { id: "5", title: "Email Marketing = For Loop", duration: "22:10" },
      { id: "6", title: "CRM in a Spreadsheet", duration: "15:55" },
      { id: "7", title: "Project Management = Markdown", duration: "18:20" },
      { id: "8", title: "Landing Pages Without Builders", duration: "28:30" },
      { id: "9", title: "Forms Without TypeForm", duration: "16:42" },
      { id: "10", title: "Scheduling Without Calendly", duration: "20:15" },
      { id: "11", title: "Payments Without Complexity", duration: "24:18" },
      { id: "12", title: "Putting It All Together", duration: "30:00" },
    ],
  },
  // Add other courses here
}

export default function LessonPage({
  params,
}: {
  params: { courseId: string; lessonId: string }
}) {
  const course = courses[params.courseId as keyof typeof courses]
  const lessonIndex = parseInt(params.lessonId) - 1
  const lesson = course?.lessons[lessonIndex]
  
  if (!course || !lesson) {
    notFound()
  }

  const hasNext = lessonIndex < course.lessons.length - 1
  const hasPrev = lessonIndex > 0

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link 
          href={`/classroom/${params.courseId}`} 
          className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to {course.title}
        </Link>
        <div className="text-sm text-muted-foreground">
          Lesson {params.lessonId} of {course.lessons.length}
        </div>
      </div>

      {/* Lesson Title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{lesson.title}</h1>
        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{lesson.duration}</span>
        </div>
      </div>

      {/* Video Player */}
      <Card>
        <div className="aspect-video bg-black rounded-t-lg relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <Button size="lg" variant="outline" className="gap-2">
              <Play className="h-5 w-5" />
              Play Video
            </Button>
          </div>
          <div className="absolute bottom-4 left-4 text-white text-sm">
            Video will be embedded here
          </div>
        </div>
      </Card>

      {/* Navigation Controls */}
      <div className="flex justify-between items-center">
        <Button 
          variant="outline" 
          disabled={!hasPrev}
          asChild={hasPrev}
        >
          {hasPrev ? (
            <Link href={`/classroom/${params.courseId}/${lessonIndex}`}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Link>
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </>
          )}
        </Button>
        
        <Button variant="default" className="gap-2">
          <CheckCircle className="h-4 w-4" />
          Mark as Complete
        </Button>
        
        <Button 
          variant="outline" 
          disabled={!hasNext}
          asChild={hasNext}
        >
          {hasNext ? (
            <Link href={`/classroom/${params.courseId}/${lessonIndex + 2}`}>
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          ) : (
            <>
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </>
          )}
        </Button>
      </div>

      {/* Lesson Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About this lesson</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                In this lesson, you'll learn how to build a simple customer support chat widget 
                that replaces Intercom. We'll cover WebSocket connections, message persistence, 
                and creating a clean UI - all in about 50 lines of code.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Key Concepts</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• WebSocket implementation for real-time messaging</li>
                <li>• Simple message storage with localStorage</li>
                <li>• Creating a floating chat widget</li>
                <li>• Handling online/offline states</li>
                <li>• Basic notification system</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Download Code
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                View on GitHub
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Lesson Notes
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Stuck on something? Ask in the community.
              </p>
              <Button variant="outline" className="w-full" size="sm">
                Ask a Question
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}