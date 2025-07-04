"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

interface LoginModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSignupClick?: () => void
}

export function LoginModal({ open, onOpenChange, onSignupClick }: LoginModalProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        // Check if user has active subscription
        const { data: subscriptions } = await supabase
          .from('stripe_subscriptions')
          .select('*')
          .eq('user_id', data.user.id)
          .eq('status', 'active')
          .limit(1)
        
        // Check if user is admin and membership tier
        const { data: userData } = await supabase
          .from('users')
          .select('is_admin, membership_tier')
          .eq('id', data.user.id)
          .single()
        
        onOpenChange(false)
        
        // Force a hard navigation to ensure middleware runs
        if ((subscriptions && subscriptions.length > 0) || userData?.is_admin) {
          // Paid member or admin - go to threads
          window.location.href = '/threads'
        } else if (userData?.membership_tier === 'free') {
          // Free tier user - go to classroom
          window.location.href = '/classroom'
        } else {
          // No subscription, no tier - go to home page
          window.location.href = '/'
        }
      }
    } catch (error: any) {
      setError(error.message || "Invalid email or password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden">
        <DialogTitle className="sr-only">Log in to your account</DialogTitle>
        <DialogDescription className="sr-only">
          Log in to Build What You Need
        </DialogDescription>
        <div className="p-8">

          {/* Form */}
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-semibold">Log in to Build What You Need</h2>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-sm text-gray-600">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="mt-1"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-sm text-gray-600">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="mt-1"
                />
              </div>

              <div className="flex justify-between items-center text-sm">
                <a 
                  href="/forgot-password" 
                  className="text-blue-600 hover:underline"
                >
                  Forgot password?
                </a>
                <a 
                  href="#" 
                  className="text-blue-600 hover:underline"
                >
                  Log in with a code
                </a>
              </div>

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
                    Logging in...
                  </>
                ) : (
                  "LOG IN"
                )}
              </Button>
            </form>

            <div className="text-center pt-4 border-t">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <button
                  onClick={() => {
                    onOpenChange(false)
                    onSignupClick?.()
                  }}
                  className="text-blue-600 hover:underline"
                >
                  Sign up for free
                </button>
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}