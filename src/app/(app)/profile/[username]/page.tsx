import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

const userProfile = {
  username: "john",
  displayName: "John Builder",
  joinedDate: "December 2024",
  totalSaved: "$45,000",
  threadsCount: 23,
  bio: "Killing SaaS one tool at a time. Previously wasted $10k/month on 37 different tools.",
}

const recentThreads = [
  {
    id: "1",
    title: "How I replaced $10k of SaaS",
    category: "Show & Tell",
    createdAt: "2 hours ago",
    commentCount: 12,
  },
  {
    id: "4",
    title: "My analytics setup: Postgres + 1 query",
    category: "Show & Tell",
    createdAt: "3 days ago",
    commentCount: 28,
  },
  {
    id: "5",
    title: "Email marketing without ConvertKit",
    category: "Show & Tell",
    createdAt: "1 week ago",
    commentCount: 45,
  },
]

export default function UserProfilePage({
  params,
}: {
  params: { username: string }
}) {
  const isOwnProfile = params.username === "john" // In real app, check against logged-in user

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{userProfile.displayName}</CardTitle>
              <p className="text-muted-foreground">@{userProfile.username}</p>
            </div>
            {isOwnProfile && (
              <Link href="/profile/edit">
                <Button variant="outline" size="sm">Edit Profile</Button>
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="mb-4">{userProfile.bio}</p>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{userProfile.totalSaved}</p>
              <p className="text-sm text-muted-foreground">Total Saved</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{userProfile.threadsCount}</p>
              <p className="text-sm text-muted-foreground">Threads</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{userProfile.joinedDate}</p>
              <p className="text-sm text-muted-foreground">Joined</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Threads</h2>
        <div className="space-y-3">
          {recentThreads.map((thread) => (
            <Link key={thread.id} href={`/threads/${thread.id}`}>
              <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <h3 className="font-semibold">{thread.title}</h3>
                  <div className="text-sm text-muted-foreground mt-1">
                    {thread.category} • {thread.createdAt} • {thread.commentCount} comments
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}