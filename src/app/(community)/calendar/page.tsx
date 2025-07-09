"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { Calendar, Clock, Video, ExternalLink } from "lucide-react"
import { format, addDays, startOfWeek, isSameDay } from "date-fns"

interface OfficeHour {
  id: string
  day_name: string
  time_pst: string
  zoom_link: string
  next_date: string
  next_datetime_pst: string
}

export default function CalendarPage() {
  const [officeHours, setOfficeHours] = useState<OfficeHour[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchOfficeHours()
  }, [])

  async function fetchOfficeHours() {
    try {
      const { data, error } = await supabase
        .rpc('get_next_office_hours')
      
      if (!error && data) {
        setOfficeHours(data)
      }
    } catch (error) {
      console.error('Error fetching office hours:', error)
    } finally {
      setLoading(false)
    }
  }

  // Generate calendar days for the current week
  const today = new Date()
  const weekStart = startOfWeek(today)
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading office hours...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Main content */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 space-y-6">

          {/* Fixed Schedule */}
          <div>
            <h2 className="text-base font-semibold mb-4">Regular Schedule</h2>
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-lg border bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Every Monday</p>
                    <p className="text-sm text-muted-foreground">10:00 AM PST</p>
                  </div>
                </div>
                <Button asChild size="sm" className="w-full sm:w-auto min-h-[44px]">
                <a 
                  href="https://us06web.zoom.us/j/84785094939?pwd=QyTEFX9rtAgnPyTnULLUCMux8aMnVV.1" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="gap-2"
                >
                  <Video className="h-4 w-4" />
                  Join Zoom
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-lg border bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Every Thursday</p>
                    <p className="text-sm text-muted-foreground">2:00 PM PST</p>
                  </div>
                </div>
                <Button asChild size="sm" className="w-full sm:w-auto min-h-[44px]">
                <a 
                  href="https://us06web.zoom.us/j/84104834932?pwd=ocd6IktbJbcL04d7ew5EL8iCbCMETI.1" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="gap-2"
                >
                  <Video className="h-4 w-4" />
                  Join Zoom
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
              </div>
            </div>
          </div>

          {/* Next Sessions */}
          <div>
            <h2 className="text-base font-semibold mb-4">Upcoming Sessions</h2>
            <div className="space-y-3">
              {officeHours.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No upcoming office hours scheduled.
                </div>
              ) : (
                officeHours.slice(0, 4).map((hour) => {
                  const nextDate = new Date(hour.next_date)
                  const isToday = isSameDay(nextDate, today)
                  
                  return (
                    <div key={hour.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">
                            {hour.day_name}, {format(nextDate, 'MMMM d')}
                          </p>
                          {isToday && <Badge variant="secondary" className="text-xs">Today</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {hour.time_pst} PST
                        </p>
                      </div>
                      <Button asChild size="sm" variant="outline" className="w-full sm:w-auto">
                        <a 
                          href={hour.zoom_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="gap-2"
                        >
                          <Video className="h-4 w-4" />
                          Join Meeting
                        </a>
                      </Button>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* This Week Calendar View */}
          <div>
            <h2 className="text-base font-semibold mb-4">This Week</h2>
            <div className="grid grid-cols-7 gap-1">
              {weekDays.map((day, idx) => {
                const dayOfWeek = day.getDay()
                const hasOfficeHour = (dayOfWeek === 1 || dayOfWeek === 4) // Monday or Thursday
                const isToday = isSameDay(day, today)
                
                return (
                  <div
                    key={idx}
                    className={`
                      p-2 sm:p-3 rounded-lg text-center transition-colors min-h-[60px] sm:min-h-[80px]
                      ${isToday ? 'bg-primary text-primary-foreground' : 'bg-muted/30'}
                      ${hasOfficeHour && !isToday ? 'border-2 border-primary/30' : ''}
                    `}
                  >
                    <p className="text-[10px] sm:text-xs font-medium">
                      {format(day, 'EEE')}
                    </p>
                    <p className="text-sm sm:text-lg font-semibold">
                      {format(day, 'd')}
                    </p>
                    {hasOfficeHour && (
                      <div className="mt-0.5 sm:mt-1">
                        <div className="text-[10px] sm:text-xs">
                          {dayOfWeek === 1 ? '10 AM' : '2 PM'}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* About Office Hours */}
          <div className="rounded-lg border p-6 space-y-4">
            <h2 className="text-lg font-semibold">What to Expect</h2>
            <div>
              <h3 className="font-medium mb-2">Format</h3>
              <p className="text-sm text-muted-foreground">
              Open Q&A sessions where you can ask anything about building SaaS alternatives, 
              technical challenges, or get feedback on your projects.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Topics</h3>
              <div className="space-y-2">
                {[
                  'Code reviews and architecture discussions',
                  'Debugging help and problem-solving',
                  'Tool recommendations and best practices',
                  'Business strategy for indie hackers',
                  'Live coding and demonstrations'
                ].map((topic, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                    <span className="text-sm text-muted-foreground">{topic}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-2">Duration</h3>
              <p className="text-sm text-muted-foreground">
              Each session runs for approximately 1 hour, but may extend if there are active discussions.
              </p>
            </div>
          </div>
      </div>
    </div>
  )
}