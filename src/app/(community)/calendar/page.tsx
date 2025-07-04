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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Office Hours with Chris</h1>
        <p className="text-muted-foreground mt-2">
          Join our regular office hours to get help with your projects, ask questions, and connect with the community.
        </p>
      </div>

      {/* Fixed Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Regular Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="text-2xl">📅</div>
                <div>
                  <p className="font-semibold">Every Monday</p>
                  <p className="text-sm text-muted-foreground">10:00 AM PST</p>
                </div>
              </div>
              <Button asChild size="sm">
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

            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="text-2xl">📅</div>
                <div>
                  <p className="font-semibold">Every Thursday</p>
                  <p className="text-sm text-muted-foreground">2:00 PM PST</p>
                </div>
              </div>
              <Button asChild size="sm">
                <a 
                  href="https://us06web.zoom.us/j/85179106602" 
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
        </CardContent>
      </Card>

      {/* Next Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {officeHours.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No upcoming office hours scheduled.
              </p>
            ) : (
              officeHours.slice(0, 4).map((hour) => {
                const nextDate = new Date(hour.next_date)
                const isToday = isSameDay(nextDate, today)
                
                return (
                  <div key={hour.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">
                          {hour.day_name}, {format(nextDate, 'MMMM d')}
                        </p>
                        {isToday && <Badge className="bg-green-600">Today</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {hour.time_pst} PST
                      </p>
                    </div>
                    <Button asChild size="sm" variant="outline">
                      <a 
                        href={hour.zoom_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="gap-2"
                      >
                        <Video className="h-4 w-4" />
                        Join
                      </a>
                    </Button>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* This Week Calendar View */}
      <Card>
        <CardHeader>
          <CardTitle>This Week</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day, idx) => {
              const dayOfWeek = day.getDay()
              const hasOfficeHour = (dayOfWeek === 1 || dayOfWeek === 4) // Monday or Thursday
              const isToday = isSameDay(day, today)
              
              return (
                <div
                  key={idx}
                  className={`
                    p-3 rounded-lg text-center
                    ${isToday ? 'bg-primary text-primary-foreground' : 'bg-muted/50'}
                    ${hasOfficeHour ? 'ring-2 ring-primary/50' : ''}
                  `}
                >
                  <p className="text-xs font-medium">
                    {format(day, 'EEE')}
                  </p>
                  <p className="text-lg font-semibold">
                    {format(day, 'd')}
                  </p>
                  {hasOfficeHour && (
                    <div className="mt-1">
                      <div className="text-xs">
                        {dayOfWeek === 1 ? '10 AM' : '2 PM'}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* About Office Hours */}
      <Card>
        <CardHeader>
          <CardTitle>What to Expect</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Format</h3>
            <p className="text-sm text-muted-foreground">
              Open Q&A sessions where you can ask anything about building SaaS alternatives, 
              technical challenges, or get feedback on your projects.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Topics</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Code reviews and architecture discussions</li>
              <li>• Debugging help and problem-solving</li>
              <li>• Tool recommendations and best practices</li>
              <li>• Business strategy for indie hackers</li>
              <li>• Live coding and demonstrations</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Duration</h3>
            <p className="text-sm text-muted-foreground">
              Each session runs for approximately 1 hour, but may extend if there are active discussions.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}