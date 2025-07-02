import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { BookOpen } from "lucide-react"

const courses = [
  {
    id: "saas-101",
    title: "SaaS Destruction 101",
    description: "Learn the fundamentals of replacing expensive SaaS with simple code.",
    progress: 80,
  },
  {
    id: "advanced-patterns",
    title: "Advanced Patterns",
    description: "Complex replacements for enterprise software. Real production examples.",
    progress: 20,
  },
  {
    id: "quick-wins",
    title: "Quick Wins",
    description: "5 tools you can replace today. Under 50 lines of code each.",
    progress: 0,
  },
  {
    id: "nextjs-mastery",
    title: "Next.js Mastery",
    description: "Build production-ready applications with Next.js 14.",
    progress: 100,
  },
]

export default function ClassroomPage() {
  return (
    <div className="space-y-6">
      {/* Course Grid - 2 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courses.map((course) => (
          <Link
            key={course.id}
            href={`/classroom/${course.id}`}
          >
            <Card className="hover:shadow-lg transition-all cursor-pointer overflow-hidden">
              {/* Course Image */}
              <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <BookOpen className="h-12 w-12 text-gray-400" />
                </div>
              </div>
              
              <CardContent className="p-4 space-y-3">
                {/* Title */}
                <h3 className="font-semibold text-lg">{course.title}</h3>
                
                {/* Subtitle */}
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {course.description}
                </p>
                
                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}