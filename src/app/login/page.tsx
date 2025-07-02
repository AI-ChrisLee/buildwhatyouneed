import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { AuthLeftSection } from "@/components/auth-left-section"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="grid md:grid-cols-2">
            {/* Left Column - Video and Description */}
            <AuthLeftSection />

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