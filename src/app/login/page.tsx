import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { Play } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="grid md:grid-cols-2">
            {/* Left Column - Video and Description (Same as signup) */}
            <div className="p-8 md:p-12 space-y-6 border-r">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tight">
                  The $10K/month SaaS Replacement System has been shared with you!
                </h1>
                <p className="text-lg text-muted-foreground">
                  Save this system to your account and start replacing overpriced software with code you control.
                </p>
              </div>

              {/* Badge */}
              <div className="flex justify-center">
                <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-medium">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                  </span>
                  Limited Time: Founding Member Price
                </div>
              </div>

              {/* Video */}
              <div className="aspect-video bg-black rounded-lg shadow-xl overflow-hidden">
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur flex items-center justify-center mx-auto cursor-pointer hover:bg-white/20 transition-all hover:scale-105">
                      <Play className="h-10 w-10 text-white ml-1" fill="white" />
                    </div>
                    <p className="text-white text-lg font-medium">
                      Watch: The exact code that killed $10k in SaaS
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Login Form */}
            <div className="p-8 md:p-12 bg-gray-50">
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-bold">
                    Login
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    Hey, welcome back! 👋
                  </p>
                </div>

                <form className="space-y-4">
                  <div>
                    <Input
                      type="email"
                      placeholder="Email address"
                      className="h-12 text-base"
                    />
                  </div>

                  <div>
                    <Input
                      type="password"
                      placeholder="Password"
                      className="h-12 text-base"
                    />
                  </div>

                  <Button size="lg" className="w-full h-12 text-lg">
                    Login
                  </Button>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox id="remember" />
                      <label htmlFor="remember" className="text-sm font-medium">
                        Stay logged in
                      </label>
                    </div>
                    <Link href="/forgot-password" className="text-sm font-medium hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                </form>

                <div className="text-center text-sm text-muted-foreground">
                  Don't have an account yet?{" "}
                  <Link href="/signup" className="font-medium text-primary hover:underline">
                    Register
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}