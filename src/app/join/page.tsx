"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Play, Lock, ArrowRight } from "lucide-react"

export default function LandingPage() {
  const [formStep, setFormStep] = useState(0)
  const [formData, setFormData] = useState({ name: "", email: "" })

  const handleInitialClick = () => {
    setFormStep(1)
  }

  const handleVideoClick = () => {
    // Scroll to form section
    const formElement = document.getElementById('smart-form')
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
    // Advance to first form step
    setFormStep(1)
  }

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name.trim()) {
      setFormStep(2)
    }
  }

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.email.trim()) {
      // Save lead to database
      try {
        // Temporarily use debug endpoint that bypasses RLS
        const response = await fetch('/api/leads-debug', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            name: formData.name,
            source: 'landing_page',
            // Add UTM parameters if they exist in URL
            utm_source: new URLSearchParams(window.location.search).get('utm_source'),
            utm_medium: new URLSearchParams(window.location.search).get('utm_medium'),
            utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign'),
          }),
        })
        
        // Log response for debugging
        if (!response.ok) {
          const errorData = await response.json()
          console.error('Lead API error:', response.status, errorData)
          // Show the actual error
          alert(`Error saving lead: ${errorData.error || 'Unknown error'}`)
        } else {
          const successData = await response.json()
          console.log('Lead saved successfully:', successData)
        }
      } catch (error) {
        console.error('Error saving lead:', error)
        // Don't block the user flow
      }
      
      // Save email to localStorage and redirect to /join
      localStorage.setItem('optinEmail', formData.email)
      localStorage.setItem('optinName', formData.name)
      window.location.href = '/'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto">
        <div className="text-center space-y-8">
          {/* VSL */}
          <div className="relative mx-auto max-w-2xl">
            <div 
              onClick={handleVideoClick}
              className="aspect-video bg-black rounded-lg shadow-2xl overflow-hidden cursor-pointer group"
            >
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <Play className="h-10 w-10 text-white ml-1" fill="white" />
                </div>
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            Build What You Need, Nothing Else : <br /> 
            How Entrepreneurs Build $419/mo SaaS in 3 Hours
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            I'll show you the exact AI prompts and process to replace any SaaS
          </p>

          {/* Smart Form */}
          <div id="smart-form" className="max-w-md mx-auto space-y-4">
            {/* Step 0: Initial Button */}
            {formStep === 0 && (
              <>
                <Button 
                  size="lg" 
                  className="w-full h-12 text-lg flex items-center justify-center gap-2"
                  onClick={handleInitialClick}
                >
                  <Lock className="h-5 w-5" />
                  Unlock Template Now
                </Button>
                <p className="text-sm text-muted-foreground">
                  100% Free & Secure
                </p>
              </>
            )}

            {/* Step 1: Name Input */}
            {formStep === 1 && (
              <>
                <form onSubmit={handleNameSubmit} className="space-y-4">
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Your name"
                      className="h-12 text-base"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      autoFocus
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      (1 of 2)
                    </span>
                  </div>
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full h-12 text-lg flex items-center justify-center gap-2"
                    disabled={!formData.name.trim()}
                  >
                    Next
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </form>
                <p className="text-sm text-muted-foreground">
                  100% Free & Secure
                </p>
              </>
            )}

            {/* Step 2: Email Input */}
            {formStep === 2 && (
              <>
                <form onSubmit={handleFinalSubmit} className="space-y-4">
                  <div className="relative">
                    <Input
                      type="email"
                      placeholder="Your email"
                      className="h-12 text-base"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      autoFocus
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      (2 of 2)
                    </span>
                  </div>
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full h-12 text-lg flex items-center justify-center gap-2"
                    disabled={!formData.email.trim()}
                  >
                    <Lock className="h-5 w-5" />
                    Unlock Template Now
                  </Button>
                </form>
                <p className="text-sm text-muted-foreground">
                  100% Free & Secure
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}