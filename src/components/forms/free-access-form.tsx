"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, CheckCircle } from "lucide-react"
import { z } from "zod"

// Define the schema
const freeSignupSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50, "First name too long"),
  lastName: z.string().min(1, "Last name is required").max(50, "Last name too long"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters")
})

export function FreeAccessForm() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  async function handleFreeSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Validate form data
      const validatedData = freeSignupSchema.parse({
        firstName,
        lastName,
        email,
        password
      })

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: validatedData.email,
          password: validatedData.password,
          full_name: `${validatedData.firstName} ${validatedData.lastName}`.trim(),
          signup_type: 'free' // This tells the API it's a free signup
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account')
      }

      // Redirect to classroom with hard navigation
      window.location.href = '/classroom'
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        setError(error.errors[0].message)
      } else {
        setError(error.message || "Failed to create account")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Get Free Access</h2>
          <p className="text-gray-600 mt-2">
            Start with our free course and upgrade anytime
          </p>
        </div>

        {/* Benefits list */}
        <div className="mb-6 space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
            Instant access to Introduction course
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
            No credit card required
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
            Upgrade to unlock all courses
          </div>
        </div>

        <form onSubmit={handleFreeSignup} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName" className="text-sm text-gray-600">
                First name
              </Label>
              <Input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                disabled={loading}
                className="mt-1"
                placeholder="John"
              />
            </div>
            <div>
              <Label htmlFor="lastName" className="text-sm text-gray-600">
                Last name
              </Label>
              <Input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                disabled={loading}
                className="mt-1"
                placeholder="Doe"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email" className="text-sm text-gray-600">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="mt-1"
              placeholder="john@example.com"
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-sm text-gray-600">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              disabled={loading}
              className="mt-1"
              placeholder="••••••••"
            />
            <p className="text-xs text-gray-500 mt-1">
              At least 8 characters
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-gray-900 hover:bg-gray-800 text-white"
            size="lg"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating your free account...
              </>
            ) : (
              "GET FREE ACCESS"
            )}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            By signing up, you accept our{" "}
            <a href="/terms" className="underline hover:text-gray-700">
              terms
            </a>{" "}
            and{" "}
            <a href="/privacy" className="underline hover:text-gray-700">
              privacy policy
            </a>
          </p>
        </form>

        <div className="mt-6 pt-6 border-t text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <a href="/login" className="text-gray-900 font-medium hover:underline">
              Log in
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}