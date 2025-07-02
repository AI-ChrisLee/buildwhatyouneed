"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AuthLeftSection } from "@/components/auth-left-section"

export default function SignupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    termsAccepted: false
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!formData.termsAccepted) {
      alert("Please accept the terms and conditions")
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          full_name: formData.name,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        // Redirect to payment page after successful signup
        router.push('/payment')
      } else {
        alert(result.error || 'Signup failed')
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

            {/* Right Column - Signup Form */}
            <div className="p-8 md:p-12 bg-gray-50">
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold">
                    Save this system with 7-day guarantee
                  </h2>
                  <p className="text-muted-foreground">
                    Join a community of builders who stopped bleeding money to overpriced software.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="First and last name"
                      className="h-12 text-base"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      autoComplete="name"
                    />
                  </div>

                  <div>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Business email address"
                      className="h-12 text-base"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      autoComplete="email"
                    />
                  </div>

                  <div>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Password"
                      className="h-12 text-base"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      autoComplete="new-password"
                    />
                  </div>

                  <div className="flex items-start gap-3">
                    <Checkbox 
                      id="terms" 
                      className="mt-1"
                      checked={formData.termsAccepted}
                      onCheckedChange={(checked) => 
                        setFormData({ ...formData, termsAccepted: checked as boolean })
                      }
                    />
                    <label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed">
                      By creating an account you accept our{" "}
                      <Link href="/terms" className="underline">
                        terms & conditions
                      </Link>{" "}
                      and our{" "}
                      <Link href="/privacy" className="underline">
                        privacy policies
                      </Link>
                      . $97/month with 7-day 100% money-back guarantee. Build your first tool or get every penny back.
                    </label>
                  </div>

                  <Button type="submit" size="lg" className="w-full h-12 text-lg" disabled={loading}>
                    {loading ? "Creating account..." : "Create account & start building"}
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