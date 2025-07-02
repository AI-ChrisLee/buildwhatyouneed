import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { Play } from "lucide-react"

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="grid md:grid-cols-2">
            {/* Left Column - Video and Description */}
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

            {/* Right Column - Signup Form */}
            <div className="p-8 md:p-12 bg-gray-50">
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold">
                    Save this system & test it free for 7 days
                  </h2>
                  <p className="text-muted-foreground">
                    Join a community of builders who stopped bleeding money to overpriced software.
                  </p>
                </div>

                <form className="space-y-4">
                  <div>
                    <Input
                      type="text"
                      placeholder="First and last name"
                      className="h-12 text-base"
                    />
                  </div>

                  <div>
                    <Input
                      type="email"
                      placeholder="Business email address"
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

                  <div className="flex items-start gap-3">
                    <Checkbox id="terms" className="mt-1" />
                    <label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed">
                      By creating an account you accept our{" "}
                      <Link href="/terms" className="underline">
                        terms & conditions
                      </Link>{" "}
                      and our{" "}
                      <Link href="/privacy" className="underline">
                        privacy policies
                      </Link>
                      . 7-day free trial, then $97/month. Cancel anytime — no charge if you cancel during trial.
                    </label>
                  </div>

                  <Button size="lg" className="w-full h-12 text-lg">
                    Create an account & get started free
                  </Button>
                </form>

                <div className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/login" className="font-medium text-primary hover:underline">
                    Login
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