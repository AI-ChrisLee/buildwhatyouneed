import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function ThreadSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="h-6 w-48 bg-gray-200 rounded"></div>
            <div className="h-4 w-32 bg-gray-200 rounded"></div>
          </div>
          <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="h-4 w-full bg-gray-200 rounded"></div>
          <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
        </div>
      </CardContent>
    </Card>
  )
}

export function ThreadListSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <ThreadSkeleton key={i} />
      ))}
    </div>
  )
}

export function CourseCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <div className="aspect-video bg-gray-200"></div>
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="h-5 w-3/4 bg-gray-200 rounded"></div>
          <div className="h-4 w-full bg-gray-200 rounded"></div>
          <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
        </div>
      </CardContent>
    </Card>
  )
}

export function CourseGridSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <CourseCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function CommentSkeleton() {
  return (
    <div className="animate-pulse space-y-3 p-4 border rounded-lg">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
        <div className="space-y-1">
          <div className="h-4 w-24 bg-gray-200 rounded"></div>
          <div className="h-3 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-4 w-full bg-gray-200 rounded"></div>
        <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
      </div>
    </div>
  )
}