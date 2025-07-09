"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

interface SignupModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  communityName?: string
  onLoginClick?: () => void
}

export function SignupModal({ open, onOpenChange, communityName = "Control OS", onLoginClick }: SignupModalProps) {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const supabase = createClient()

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Create auth user with metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: `${firstName} ${lastName}`.trim()
          }
        }
      })

      if (authError) throw authError

      if (authData.user) {
        // Create lead entry
        const { error: leadError } = await supabase
          .from('leads')
          .insert({
            email,
            name: `${firstName} ${lastName}`.trim(),
            stage: 'member',
            user_id: authData.user.id,
            source: 'signup_modal'
          })

        if (leadError) {
          console.error('Lead creation error:', leadError)
        }

        // Close modal and redirect to payment page for regular signup
        onOpenChange(false)
        router.push('/payment')
        router.refresh()
      }
    } catch (error: any) {
      setError(error.message || "Failed to create account")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden">
        <DialogTitle className="sr-only">Create your account</DialogTitle>
        <DialogDescription className="sr-only">
          Sign up to join {communityName}
        </DialogDescription>
        <div className="p-8">

          {/* Form */}
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-semibold">Create your account</h2>
              <p className="text-sm text-gray-600 mt-1">Join {communityName}</p>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
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
                minLength={6}
                disabled={loading}
                placeholder="Password"
                className="h-12"
              />

              {error && (
                <div className="text-sm text-red-600 text-center">
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
                  "SIGN UP"
                )}
              </Button>

              <div className="mt-6">
                <p className="text-xs text-gray-500 text-center">
                  By signing up, you accept our{" "}
                  <a href="/terms" className="underline">terms</a>{" "}
                  and{" "}
                  <a href="/privacy" className="underline">privacy policy</a>
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
                  className="text-blue-600 hover:underline"
                >
                  Log in
                </button>
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}