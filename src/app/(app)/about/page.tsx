import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, User, Calendar, DollarSign, BookOpen, Code, Zap } from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
  // Mock data for members
  const members = [
    { id: 1, name: "User 1" },
    { id: 2, name: "User 2" },
    { id: 3, name: "User 3" },
    { id: 4, name: "User 4" },
    { id: 5, name: "User 5" },
    { id: 6, name: "User 6" },
    { id: 7, name: "User 7" },
    { id: 8, name: "User 8" },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-6">
      {/* Left Column - Main Content */}
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6 space-y-6">
            {/* Hero Section */}
            <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white z-10">
                  <div className="flex items-center justify-center gap-2 text-xs font-medium mb-3">
                    <div className="p-1 bg-white/20 rounded">
                      <Users className="h-3 w-3" />
                    </div>
                    <span>COMMUNITY</span>
                  </div>
                  <h1 className="text-4xl font-bold mb-2">Build What You Need</h1>
                  <p className="text-lg">Stop paying for SaaS. Start building.</p>
                </div>
                <div className="absolute inset-0 bg-black/40"></div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 text-center">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gray-100 rounded">
                  <Users className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <p className="text-sm text-muted-foreground">2k members</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gray-100 rounded">
                  <BookOpen className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <p className="text-sm text-muted-foreground">Free</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gray-100 rounded">
                  <Code className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <p className="text-sm text-muted-foreground">By Builders</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <p className="text-gray-600">
                The days of overpriced SaaS are over.
              </p>
              
              <div>
                <h3 className="font-semibold mb-3">Learn how to:</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-muted-foreground mt-0.5">1.</span>
                    <span>Build tools that replace expensive SaaS subscriptions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-muted-foreground mt-0.5">2.</span>
                    <span>Save thousands of dollars per month</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-muted-foreground mt-0.5">3.</span>
                    <span>Own your tools and data completely</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Here's what you get:</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">•</span>
                    <span>Access to code templates that replace $1000s in SaaS costs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">•</span>
                    <span>Step-by-step courses on building your own tools</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">•</span>
                    <span>Community support from experienced builders</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">•</span>
                    <span>Weekly challenges to practice your skills</span>
                  </li>
                </ul>
              </div>

              <p className="text-gray-600">
                And it's completely free. No catch.
              </p>

              <p className="text-sm text-muted-foreground">
                Join below while it lasts.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Community Badge */}
      <aside className="hidden lg:block">
        <Card className="overflow-hidden border-black">
          <div className="bg-white p-6 text-black">
            <div className="flex items-center gap-2 text-xs font-medium mb-3">
              <div className="p-1 bg-black/10 rounded">
                <Users className="h-3 w-3" />
              </div>
              <span>COMMUNITY</span>
            </div>
            <h2 className="text-2xl font-bold mb-1">Build What You Need</h2>
            <p className="text-sm text-black/60 mb-4">buildwhatyouneed.com</p>
            <p className="text-sm mb-6">
              Learn how to build what you need without expensive SaaS. 
              Save thousands and own your tools.
            </p>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-black/60">✓</span>
                <span>Code Templates</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-black/60">✓</span>
                <span>SaaS Replacements</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-black/60">✓</span>
                <span>Community Support</span>
              </div>
            </div>
          </div>
          
          <CardContent className="p-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 text-center mb-6">
              <div>
                <p className="text-2xl font-bold">2k</p>
                <p className="text-xs text-muted-foreground">Members</p>
              </div>
              <div>
                <p className="text-2xl font-bold">8</p>
                <p className="text-xs text-muted-foreground">Online</p>
              </div>
              <div>
                <p className="text-2xl font-bold">10</p>
                <p className="text-xs text-muted-foreground">Admins</p>
              </div>
            </div>

            {/* Member Avatars */}
            <div className="flex -space-x-2 mb-6">
              {members.map((member) => (
                <Avatar key={member.id} className="h-8 w-8 border-2 border-background">
                  <AvatarFallback className="text-xs bg-muted">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>

            {/* Join Button */}
            <Link href="/join">
              <Button className="w-full">
                INVITE PEOPLE
              </Button>
            </Link>
          </CardContent>
        </Card>
      </aside>
    </div>
  )
}