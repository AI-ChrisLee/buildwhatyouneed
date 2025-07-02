import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Play } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto">
        <div className="text-center space-y-8">
          {/* VSL */}
          <div className="relative mx-auto max-w-2xl">
            <div className="aspect-video bg-black rounded-lg shadow-2xl overflow-hidden">
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors">
                  <Play className="h-10 w-10 text-white ml-1" fill="white" />
                </div>
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
            Copy and Paste My $10K/month
            <br />
            SaaS Replacement System
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            In this video I break down the exact code I used to replace
            $10,847/month worth of SaaS tools in just 4 hours
          </p>

          {/* Form */}
          <form className="max-w-md mx-auto space-y-4">
            <Input
              type="text"
              placeholder="Your name"
              className="h-12 text-base"
            />
            <Input
              type="email"
              placeholder="Your email"
              className="h-12 text-base"
            />
            <Button size="lg" className="w-full h-12 text-lg">
              Get Instant Access
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}