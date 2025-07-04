"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, CheckCircle } from "lucide-react"
import { z } from "zod"

interface FreeSignupModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLoginClick?: () => void
}

// Define the schema
const freeSignupSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50, "First name too long"),
  lastName: z.string().min(1, "Last name is required").max(50, "Last name too long"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters")
})

export function FreeSignupModal({ open, onOpenChange, onLoginClick }: FreeSignupModalProps) {
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
          signup_type: 'free'
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account')
      }

      // Close modal and redirect to classroom with hard navigation
      onOpenChange(false)
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden">
        <DialogTitle className="sr-only">Get Free Access</DialogTitle>
        <DialogDescription className="sr-only">
          Create a free account to access our introductory course
        </DialogDescription>
        <div className="p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold">Create your account</h2>
            <p className="text-gray-600 mt-2">
              to join Build What You Need by Chris
            </p>
          </div>

          <form onSubmit={handleFreeSignup} className="space-y-4">
            <Input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              disabled={loading}
              placeholder="First name"
              className="h-12"
            />

            <Input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              disabled={loading}
              placeholder="Last name"
              className="h-12"
            />

            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              placeholder="Email"
              className="h-12"
            />

            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              disabled={loading}
              placeholder="Password"
              className="h-12"
            />

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
                  Creating account...
                </>
              ) : (
                "GET FREE TEMPLATE"
              )}
            </Button>

            <div className="mt-6">
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
            </div>
          </form>

          <div className="text-center pt-6 mt-8 border-t">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <button
                onClick={() => {
                  onOpenChange(false)
                  onLoginClick?.()
                }}
                className="text-gray-900 font-medium hover:underline"
              >
                Log in
              </button>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}