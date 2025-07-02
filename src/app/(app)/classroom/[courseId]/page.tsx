import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { notFound } from "next/navigation"

const courses = {
  "saas-101": {
    title: "SaaS Destruction 101",
    description: "Learn the fundamentals of replacing expensive SaaS with simple code.",
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
  "advanced": {
    title: "Advanced Patterns",
    description: "Complex replacements for enterprise software. Real production examples.",
    lessons: [
      { id: "1", title: "Enterprise Auth Systems", duration: "32:15" },
      { id: "2", title: "Real-time Collaboration", duration: "28:40" },
      { id: "3", title: "Data Pipelines", duration: "35:20" },
      { id: "4", title: "Search at Scale", duration: "29:55" },
      { id: "5", title: "Multi-tenant Architecture", duration: "38:10" },
      { id: "6", title: "API Gateway Patterns", duration: "26:30" },
      { id: "7", title: "Monitoring Without DataDog", duration: "22:45" },
      { id: "8", title: "CI/CD Without Services", duration: "31:25" },
    ],
  },
  "quick-wins": {
    title: "Quick Wins",
    description: "5 tools you can replace today. Under 50 lines of code each.",
    lessons: [
      { id: "1", title: "URL Shortener", duration: "8:30" },
      { id: "2", title: "Status Page", duration: "10:15" },
      { id: "3", title: "Feedback Widget", duration: "7:45" },
      { id: "4", title: "Newsletter Signup", duration: "9:20" },
      { id: "5", title: "FAQ Bot", duration: "11:10" },
    ],
  },
}

export default function CourseDetailPage({
  params,
}: {
  params: { courseId: string }
}) {
  const course = courses[params.courseId as keyof typeof courses]
  
  if (!course) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/classroom" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
        ← Back to classroom
      </Link>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">{course.title}</h1>
        <p className="text-muted-foreground mt-2">{course.description}</p>
        <p className="text-sm mt-2">{course.lessons.length} lessons</p>
      </div>

      <div className="space-y-3">
        {course.lessons.map((lesson, index) => (
          <Link
            key={lesson.id}
            href={`/classroom/${params.courseId}/${lesson.id}`}
          >
            <Card className="hover:shadow-md transition-all cursor-pointer">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-2xl text-muted-foreground font-mono">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <div>
                    <h3 className="font-medium">{lesson.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {lesson.duration}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Watch
                </Button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}