"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {
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
        // Check user's subscription and membership tier
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
        
        // Force a hard navigation to ensure middleware runs
        if ((subscriptions && subscriptions.length > 0) || userData?.is_admin || userData?.membership_tier === 'paid') {
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
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center gap-2 mb-8">
            <div 
              className="h-10 w-10 rounded-full"
              style={{
                background: 'radial-gradient(circle at center, #F87171 0%, #EF4444 25%, #DC2626 50%, #B91C1C 75%, #7F1D1D 100%)'
              }}
            />
            <span className="font-semibold text-xl">Control OS</span>
          </Link>
        </div>

        {/* Form Card */}
        <div className="rounded-lg border bg-card p-8 shadow-sm">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold tracking-tight">Welcome back</h2>
              <p className="text-sm text-muted-foreground mt-1">Log in to your account</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                placeholder="you@example.com"
              />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              </div>

              <div className="flex justify-between items-center text-sm">
                <Link 
                  href="/forgot-password" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md text-center">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Log in"}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link href="/signup" className="text-foreground font-medium hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}