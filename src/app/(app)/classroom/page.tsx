import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"

const courses = [
  {
    id: "saas-101",
    title: "SaaS Destruction 101",
    description: "Learn the fundamentals of replacing expensive SaaS with simple code.",
    instructor: "John Builder",
    lessonCount: 12,
    duration: "3h 24m",
    progress: 80,
    category: "fundamentals",
    students: 234,
    rating: 4.9,
  },
  {
    id: "advanced-patterns",
    title: "Advanced Patterns",
    description: "Complex replacements for enterprise software. Real production examples.",
    instructor: "Sarah Coder",
    lessonCount: 8,
    duration: "2h 15m",
    progress: 20,
    category: "advanced",
    students: 156,
    rating: 4.8,
  },
  {
    id: "quick-wins",
    title: "Quick Wins",
    description: "5 tools you can replace today. Under 50 lines of code each.",
    instructor: "Mike Fast",
    lessonCount: 5,
    duration: "45m",
    progress: 0,
    category: "quick-wins",
    students: 412,
    rating: 4.7,
  },
  {
    id: "nextjs-mastery",
    title: "Next.js Mastery",
    description: "Build production-ready applications with Next.js 14.",
    instructor: "Jane Dev",
    lessonCount: 10,
    duration: "4h 10m",
    progress: 100,
    category: "advanced",
    students: 189,
    rating: 5.0,
  },
]

export default function ClassroomPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Classroom</h1>
        <p className="text-muted-foreground">
          Learn to build what you need and destroy your SaaS dependencies
        </p>
      </div>

      {/* Course Grid - 2 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courses.map((course) => (
          <Link key={course.id} href={`/classroom/${course.id}`} className="block">
            <Card className="h-full hover:shadow-lg transition-all cursor-pointer group">
              {/* Course Thumbnail Placeholder */}
              <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-50 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-gray-600 text-4xl font-bold opacity-20">
                    {course.title.charAt(0)}
                  </div>
                </div>
                {course.progress > 0 && (
                  <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-xs">
                    {course.progress}% Complete
                  </div>
                )}
              </div>
              
              <CardHeader>
                <CardTitle className="line-clamp-2 group-hover:text-gray-700 transition-colors">
                  {course.title}
                </CardTitle>
                <CardDescription>
                  By {course.instructor} • {course.lessonCount} lessons • {course.duration}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {course.description}
                </p>
                
                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{course.students} students</span>
                  <span>★ {course.rating}</span>
                </div>
                
                {/* Progress Bar */}
                {course.progress > 0 && (
                  <div className="space-y-1">
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>
                )}
                
                {/* Status */}
                <div className="text-sm font-medium">
                  {course.progress === 0 && <span className="text-muted-foreground">Not started</span>}
                  {course.progress > 0 && course.progress < 100 && <span className="text-primary">In progress</span>}
                  {course.progress === 100 && <span className="text-green-600">Completed</span>}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}