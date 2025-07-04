"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, User } from "lucide-react"
import Link from "next/link"

export function CommunitySidebar() {
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
    <Card className="overflow-hidden border-black">
      <div className="bg-white p-6 text-black">
        <div className="flex items-center gap-2 text-xs font-medium mb-3">
          <div className="p-1 bg-black/10 rounded">
            <Users className="h-3 w-3" />
          </div>
          <span>COMMUNITY</span>
        </div>
        <h2 className="text-2xl font-bold mb-1">Build What You Need</h2>
        <p className="text-sm text-black/60 mb-4">aichrislee.com</p>
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
        <Link href="/">
          <Button className="w-full">
            INVITE PEOPLE
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}