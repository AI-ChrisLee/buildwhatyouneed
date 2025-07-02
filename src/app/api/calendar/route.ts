import { NextResponse } from 'next/server'

// GET /api/calendar - Get hardcoded schedule
export async function GET() {
  // Hardcoded schedule - no database needed
  const schedule = [
    {
      id: 'tuesday-build-review',
      title: 'Build Review',
      description: 'Show what you built this week. Get feedback from the community.',
      dayOfWeek: 2, // Tuesday
      time: '10:00',
      timezone: 'PST',
      duration: 60, // minutes
      meetingUrl: 'https://zoom.us/j/placeholder' // Replace with real link
    },
    {
      id: 'thursday-office-hours',
      title: 'Open Office Hours',
      description: 'Get help with your builds. Ask questions. Share problems.',
      dayOfWeek: 4, // Thursday
      time: '10:00',
      timezone: 'PST',
      duration: 60,
      meetingUrl: 'https://zoom.us/j/placeholder' // Replace with real link
    }
  ]

  // Calculate next occurrences
  const now = new Date()
  const events = schedule.map(event => {
    const nextDate = getNextOccurrence(event.dayOfWeek, event.time)
    const isLive = isEventLive(nextDate, event.duration)
    
    return {
      ...event,
      nextDate: nextDate.toISOString(),
      isLive,
      joinUrl: isLive ? event.meetingUrl : null
    }
  })

  return NextResponse.json({
    data: events
  })
}

// Helper function to get next occurrence of a weekly event
function getNextOccurrence(dayOfWeek: number, time: string): Date {
  const now = new Date()
  const [hours, minutes] = time.split(':').map(Number)
  
  // Get current day of week (0 = Sunday, 6 = Saturday)
  const currentDay = now.getDay()
  
  // Calculate days until next occurrence
  let daysUntil = dayOfWeek - currentDay
  if (daysUntil < 0 || (daysUntil === 0 && now.getHours() >= hours)) {
    daysUntil += 7
  }
  
  const nextDate = new Date(now)
  nextDate.setDate(now.getDate() + daysUntil)
  nextDate.setHours(hours, minutes, 0, 0)
  
  // Convert from PST to UTC (PST is UTC-8)
  nextDate.setHours(nextDate.getHours() + 8)
  
  return nextDate
}

// Helper function to check if event is currently live
function isEventLive(eventDate: Date, duration: number): boolean {
  const now = new Date()
  const eventEnd = new Date(eventDate.getTime() + duration * 60 * 1000)
  
  return now >= eventDate && now <= eventEnd
}