"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { mockThreads } from "@/lib/mock-data"
import { ThreadCardV2 } from "@/components/thread-card-v2"
import { NewThreadDialog } from "@/components/new-thread-dialog"
import { ThreadDetailDialog } from "@/components/thread-detail-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { SortDesc, TrendingUp, Clock, MessageSquare } from "lucide-react"

const categories = [
  { id: "all", label: "All" },
  { id: "announcements", label: "Announcements" },
  { id: "general", label: "General" },
  { id: "show-tell", label: "Show & Tell" },
  { id: "help", label: "Help" },
]

// Add mock data for tags and likes
const threadsWithExtras = mockThreads.map((thread, i) => ({
  ...thread,
  tags: thread.category === "show-tell" ? ["saas-killer", "build-in-public"] : 
        thread.category === "help" ? ["question", "stripe"] : 
        thread.category === "announcements" ? ["weekly-challenge", "admin"] : 
        ["discussion"],
  likes: 10 + (i * 7) % 40
}))

type SortOption = "recent" | "popular" | "most-commented"

export default function ThreadsPage() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isNewThreadOpen, setIsNewThreadOpen] = useState(false)
  const [selectedThread, setSelectedThread] = useState<typeof threadsWithExtras[0] | null>(null)
  const [isThreadDetailOpen, setIsThreadDetailOpen] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>("recent")

  // Filter and sort threads
  const filteredAndSortedThreads = threadsWithExtras
    .filter(thread => {
      const matchesCategory = selectedCategory === "all" || thread.category === selectedCategory
      return matchesCategory
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "popular":
          return (b.likes || 0) - (a.likes || 0)
        case "most-commented":
          return b.commentCount - a.commentCount
        case "recent":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

  const handleThreadClick = (thread: typeof threadsWithExtras[0]) => {
    setSelectedThread(thread)
    setIsThreadDetailOpen(true)
  }

  return (
    <div className="space-y-6">

      {/* Write something input */}
      <div 
        className="w-full p-4 border rounded-lg cursor-text hover:bg-muted/50 transition-colors"
        onClick={() => setIsNewThreadOpen(true)}
      >
        <p className="text-muted-foreground">Write something...</p>
      </div>

      {/* Filters and Sorting */}
      <div className="space-y-3">
        {/* Category filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="whitespace-nowrap"
            >
              {category.label}
            </Button>
          ))}
        </div>

        {/* Sort and Filter Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <SortDesc className="h-4 w-4" />
                  Sort by
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuLabel>Sort threads by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => setSortBy("recent")}
                  className={sortBy === "recent" ? "bg-accent" : ""}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Most Recent
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setSortBy("popular")}
                  className={sortBy === "popular" ? "bg-accent" : ""}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Most Popular
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setSortBy("most-commented")}
                  className={sortBy === "most-commented" ? "bg-accent" : ""}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Most Commented
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

          </div>

          {/* Thread count */}
          <p className="text-sm text-muted-foreground">
            {filteredAndSortedThreads.length} thread{filteredAndSortedThreads.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>


      {/* Threads list */}
      <div className="space-y-3">
        {filteredAndSortedThreads.map((thread) => (
          <ThreadCardV2 
            key={thread.id} 
            thread={thread}
            onClick={() => handleThreadClick(thread)}
          />
        ))}
        
        {filteredAndSortedThreads.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No threads found. Be the first to start a discussion!
            </p>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <NewThreadDialog 
        open={isNewThreadOpen}
        onOpenChange={setIsNewThreadOpen}
      />
      
      <ThreadDetailDialog
        thread={selectedThread}
        open={isThreadDetailOpen}
        onOpenChange={setIsThreadDetailOpen}
      />
    </div>
  )
}