"use client"

import { useState, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { AuthLeftSection } from "@/components/auth-left-section"

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        // Check if we have a redirect parameter or stored stripe session
        const redirect = searchParams.get('redirect')
        const stripeSessionId = localStorage.getItem('stripe_session_id')
        
        if (redirect === 'payment-success' && stripeSessionId) {
          // User came from payment, redirect back to payment success
          router.push(`/payment-success?session_id=${stripeSessionId}`)
          localStorage.removeItem('stripe_session_id')
        } else {
          // Normal login flow - redirect based on subscription status
          router.push(result.data.redirectTo || '/payment')
        }
      } else {
        alert(result.error || 'Login failed')
      }
    } catch (error) {
      alert('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

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

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Input
                      type="email"
                      placeholder="Email address"
                      className="h-12 text-base"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Input
                      type="password"
                      placeholder="Password"
                      className="h-12 text-base"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                  </div>

                  <Button type="submit" size="lg" className="w-full h-12 text-lg" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                  </Button>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        id="remember"
                        checked={formData.rememberMe}
                        onCheckedChange={(checked) => 
                          setFormData({ ...formData, rememberMe: checked as boolean })
                        }
                      />
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

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}