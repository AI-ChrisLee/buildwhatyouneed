"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ThreadCardV2 } from "@/components/thread-card-v2"
import { NewThreadDialog } from "@/components/new-thread-dialog"
import { ThreadDetailDialog } from "@/components/thread-detail-dialog"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { getThreads, type ThreadWithAuthor } from "@/lib/supabase/client-queries"
import { useRouter } from "next/navigation"

const categories = [
  { id: "all", label: "All" },
  { id: "announcements", label: "Announcements" },
  { id: "general", label: "General" },
  { id: "show-tell", label: "Show & Tell" },
  { id: "help", label: "Help" },
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
    router.refresh()
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

      {/* Threads list */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading threads...</p>
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
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No threads found. Be the first to start a discussion!
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          
          <div className="flex items-center gap-1">
            {/* First page */}
            <Button
              variant={currentPage === 1 ? "default" : "ghost"}
              size="sm"
              onClick={() => setCurrentPage(1)}
              className="h-8 w-8 p-0"
            >
              1
            </Button>
            
            {/* Show dots if needed */}
            {currentPage > 3 && <span className="px-2">...</span>}
            
            {/* Pages around current */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => 
                page !== 1 && 
                page !== totalPages && 
                Math.abs(page - currentPage) <= 1
              )
              .map(page => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className="h-8 w-8 p-0"
                >
                  {page}
                </Button>
              ))}
            
            {/* Show dots if needed */}
            {currentPage < totalPages - 2 && <span className="px-2">...</span>}
            
            {/* Last page */}
            {totalPages > 1 && (
              <Button
                variant={currentPage === totalPages ? "default" : "ghost"}
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                className="h-8 w-8 p-0"
              >
                {totalPages}
              </Button>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      <div className="text-center text-sm text-muted-foreground mt-4">
        {startIndex + 1}-{Math.min(endIndex, filteredThreads.length)} of {filteredThreads.length}
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
    </div>
  )
}