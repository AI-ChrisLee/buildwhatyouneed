"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Calendar, Clock, Plus, Grid, List } from "lucide-react"
import { EventModal } from "@/components/event-modal"

const mockEvents = [
  {
    id: "1",
    title: "Build Review",
    date: "2024-01-16",
    time: "10:00 AM PST",
    description: "Show what you built. Get feedback from the community.",
  },
  {
    id: "2",
    title: "Open Office Hours",
    date: "2024-01-18",
    time: "10:00 AM PST",
    description: "Get unstuck. Ask anything about your projects.",
  },
  {
    id: "3",
    title: "SaaS Teardown: Notion",
    date: "2024-01-20",
    time: "2:00 PM PST",
    description: "Live coding session: Building a Notion alternative.",
  },
  {
    id: "4",
    title: "Monthly Demo Day",
    date: "2024-01-31",
    time: "3:00 PM PST",
    description: "Present your projects to the community. Get feedback and support.",
  },
]

export default function CalendarPage() {
  const [viewMode, setViewMode] = useState<"month" | "list">("list")
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<typeof mockEvents[0] | undefined>(undefined)

  // Simple calendar grid generation
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    const days = []
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }
    return days
  }

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const navigateMonth = (direction: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction))
  }

  const handleCreateEvent = () => {
    setSelectedEvent(undefined)
    setIsEventModalOpen(true)
  }

  const handleEditEvent = (event: typeof mockEvents[0]) => {
    setSelectedEvent(event)
    setIsEventModalOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
        <p className="text-muted-foreground">
          Live sessions, workshops, and community events
        </p>
      </div>

      {/* View Toggle and Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "month" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("month")}
            className="gap-2"
          >
            <Grid className="h-4 w-4" />
            Month
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
            className="gap-2"
          >
            <List className="h-4 w-4" />
            List
          </Button>
        </div>
        <Button size="sm" onClick={handleCreateEvent} className="gap-2">
          <Plus className="h-4 w-4" />
          New Event
        </Button>
      </div>

      {/* Month View */}
      {viewMode === "month" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigateMonth(-1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigateMonth(1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1">
              {/* Day headers */}
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                  {day}
                </div>
              ))}
              {/* Calendar days */}
              {getDaysInMonth(currentMonth).map((day, index) => (
                <div
                  key={index}
                  className={`aspect-square p-2 border rounded-lg ${
                    day ? "hover:bg-muted cursor-pointer" : ""
                  }`}
                >
                  {day && (
                    <div className="text-sm">
                      <div className="font-medium">{day}</div>
                      {/* Event dots */}
                      <div className="flex gap-1 mt-1">
                        {day === 16 && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />}
                        {day === 18 && <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />}
                        {day === 20 && <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* List View / Upcoming Events */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Upcoming Events</h2>
        
        {/* Next Event Highlight */}
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle>Next Event</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">{mockEvents[0].title}</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{mockEvents[0].date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{mockEvents[0].time} • 1 hour</span>
                </div>
              </div>
              <p className="text-sm">{mockEvents[0].description}</p>
              <Button className="w-full" variant="outline">Join on Zoom</Button>
            </div>
          </CardContent>
        </Card>

        {/* Event List */}
        <div className="space-y-3">
          {mockEvents.slice(1).map((event) => (
            <Card 
              key={event.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleEditEvent(event)}
            >
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">{event.title}</h3>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {event.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {event.time} • 1 hour
                    </span>
                  </div>
                  <p className="pt-1">{event.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Event Modal */}
      <EventModal
        open={isEventModalOpen}
        onOpenChange={setIsEventModalOpen}
        event={selectedEvent}
      />
    </div>
  )
}