"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ThreadCardV2 } from "@/components/thread-card-v2"
import { NewThreadDialog } from "@/components/new-thread-dialog"
import { ThreadDetailDialog } from "@/components/thread-detail-dialog"
import { ChevronLeft, ChevronRight, Plus, MessageSquare } from "lucide-react"
import { getThreads, type ThreadWithAuthor } from "@/lib/supabase/client-queries"
import { useRouter } from "next/navigation"
import { useMembership } from "@/hooks/use-membership"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const categories = [
  { id: "all", label: "All", description: "All threads" },
  { id: "announcements", label: "Announcements", description: "Official updates" },
  { id: "general", label: "General", description: "General discussion" },
  { id: "show-tell", label: "Show & Tell", description: "Share your work" },
  { id: "help", label: "Help", description: "Ask for help" },
]

const THREADS_PER_PAGE = 20

export default function ThreadsPage() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isNewThreadOpen, setIsNewThreadOpen] = useState(false)
  const [selectedThread, setSelectedThread] = useState<ThreadWithAuthor | null>(null)
  const [isThreadDetailOpen, setIsThreadDetailOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [threads, setThreads] = useState<ThreadWithAuthor[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { MembershipGate, AccessDeniedModal } = useMembership()

  // Fetch threads on mount and category change
  useEffect(() => {
    async function fetchThreads() {
      setLoading(true)
      try {
        const data = await getThreads(selectedCategory)
        setThreads(data)
      } catch (error) {
        console.error('Error fetching threads:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchThreads()
  }, [selectedCategory])

  // Filter threads is now just the threads from database
  const filteredThreads = threads

  // Calculate pagination
  const totalPages = Math.ceil(filteredThreads.length / THREADS_PER_PAGE)
  const startIndex = (currentPage - 1) * THREADS_PER_PAGE
  const endIndex = startIndex + THREADS_PER_PAGE
  const currentThreads = filteredThreads.slice(startIndex, endIndex)

  const handleThreadClick = (thread: ThreadWithAuthor) => {
    setSelectedThread(thread)
    setIsThreadDetailOpen(true)
  }
  
  const handleThreadCreated = (newThread: ThreadWithAuthor) => {
    setThreads([newThread, ...threads])
    setIsNewThreadOpen(false)
    // Remove router.refresh() to prevent losing form state
  }

  return (
    <MembershipGate feature="Community Threads">
      <div className="min-h-screen">
        {/* Header */}
        <div className="border-b">
          <div className="flex items-center justify-between gap-4 px-4 md:px-6 py-3">
            {/* Category tabs */}
            <div className="overflow-x-auto flex-1">
              <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                <TabsList className="h-10 p-1 bg-transparent border-0 w-full sm:w-auto">
                  {categories.map((category) => (
                    <TabsTrigger
                      key={category.id}
                      value={category.id}
                      className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-3 md:px-4 text-xs md:text-sm whitespace-nowrap"
                    >
                      {category.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
            <Button onClick={() => setIsNewThreadOpen(true)} size="sm" className="shrink-0">
              <Plus className="h-4 w-4 mr-2" />
              New Thread
            </Button>
          </div>
        </div>

        {/* Main content */}
        <div className="px-6 py-6">
          {/* Threads list */}
          <div className="space-y-0 divide-y">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-sm text-muted-foreground">Loading threads...</p>
                </div>
              </div>
            ) : (
              <>
                {currentThreads.map((thread) => (
                  <ThreadCardV2 
                    key={thread.id} 
                    thread={thread}
                    onClick={() => handleThreadClick(thread)}
                  />
                ))}
                
                {currentThreads.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                      <MessageSquare className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      No threads in {categories.find(c => c.id === selectedCategory)?.label.toLowerCase()}
                    </p>
                    <Button onClick={() => setIsNewThreadOpen(true)} variant="outline" size="sm">
                      Start the first thread
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t pt-6 mt-6">
              <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredThreads.length)} of {filteredThreads.length} threads
              </p>
              
              <div className="flex items-center gap-2 justify-center sm:justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="h-8 px-2 sm:px-3"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Previous</span>
                </Button>
                
                <div className="flex items-center gap-0.5 sm:gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => 
                      page === 1 || 
                      page === totalPages || 
                      Math.abs(page - currentPage) <= 1
                    )
                    .map((page, index, array) => (
                      <div key={page} className="flex items-center">
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <span className="px-0.5 sm:px-1.5 text-muted-foreground text-xs sm:text-sm">...</span>
                        )}
                        <Button
                          variant={currentPage === page ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-xs sm:text-sm"
                        >
                          {page}
                        </Button>
                      </div>
                    ))}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="h-8 px-2 sm:px-3"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

      {/* Dialogs */}
      <NewThreadDialog 
        open={isNewThreadOpen}
        onOpenChange={setIsNewThreadOpen}
        onThreadCreated={handleThreadCreated}
      />
      
      <ThreadDetailDialog
        thread={selectedThread}
        open={isThreadDetailOpen}
        onOpenChange={setIsThreadDetailOpen}
      />
      
        <AccessDeniedModal />
      </div>
    </MembershipGate>
  )
}