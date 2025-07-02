import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { AuthLeftSection } from "@/components/auth-left-section"

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="grid md:grid-cols-2">
            {/* Left Column - Video and Description */}
            <AuthLeftSection />

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