import { Play } from "lucide-react"

export function AuthLeftSection() {
  return (
    <div className="p-8 md:p-12 space-y-6 border-r">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">
          The Build What You Need System has been shared with you!
        </h1>
        <p className="text-lg text-muted-foreground">
          Save this system to your account and start building what SaaS companies charge you thousands for.
        </p>
      </div>

      {/* Badge */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-medium">
          🔥 Founding Member Exclusive: $97/month forever
        </div>
      </div>

      {/* Video */}
      <div className="aspect-video bg-black rounded-lg shadow-xl overflow-hidden">
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors">
            <Play className="h-10 w-10 text-white ml-1" fill="white" />
          </div>
        </div>
      </div>
      <p className="text-center text-sm text-muted-foreground">
        "Why Only 1000 Builders Get This Price (And What Happens at 1001)"
      </p>
    </div>
  )
}