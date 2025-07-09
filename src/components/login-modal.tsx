"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/providers/auth-provider"

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
  const { refreshAuth } = useAuth()

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
        
        // Refresh auth context
        await refreshAuth()
        
        // Use router.push instead of window.location for smoother navigation
        if ((subscriptions && subscriptions.length > 0) || userData?.is_admin) {
          // Paid member or admin - go to threads
          router.push('/threads')
        } else if (userData?.membership_tier === 'free') {
          // Free tier user - go to classroom
          router.push('/classroom')
        } else {
          // No subscription, no tier - go to home page
          router.push('/')
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
          Log in to Control OS
        </DialogDescription>
        <div className="p-8">

          {/* Form */}
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-semibold">Log in to Control OS</h2>
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