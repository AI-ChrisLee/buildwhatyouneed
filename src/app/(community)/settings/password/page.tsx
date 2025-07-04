"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (newPassword !== confirmPassword) {
      setError("New passwords don't match")
      return
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    if (currentPassword === newPassword) {
      setError("New password must be different from current password")
      return
    }

    setLoading(true)

    try {
      // First verify current password by re-authenticating
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) {
        setError("No user session found")
        return
      }

      // Try to sign in with current password to verify it
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword
      })

      if (signInError) {
        setError("Current password is incorrect")
        return
      }

      // Update to new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (updateError) {
        setError(updateError.message)
      } else {
        setSuccess(true)
        // Clear form
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
        
        // Show success message
        setTimeout(() => {
          router.push('/threads')
        }, 2000)
      }
    } catch (err) {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Main content */}
      <div className="px-4 md:px-6 py-6">
        <div className="max-w-2xl space-y-6">
          {/* Back link */}
          <Link 
            href="/threads" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to threads
          </Link>

          {/* Password form */}
          <div className="rounded-lg border p-6">
            <div className="space-y-1 mb-6">
              <h2 className="text-lg font-semibold">Change Password</h2>
              <p className="text-sm text-muted-foreground">
                Update your account password. You'll need to enter your current password.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current" className="text-sm font-medium">Current Password</Label>
              <Input
                id="current"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

              <div className="space-y-2">
                <Label htmlFor="new" className="text-sm font-medium">New Password</Label>
              <Input
                id="new"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={loading}
              />
              <p className="text-sm text-muted-foreground">
                Must be at least 6 characters
              </p>
            </div>

              <div className="space-y-2">
                <Label htmlFor="confirm" className="text-sm font-medium">Confirm New Password</Label>
              <Input
                id="confirm"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

              {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                  {error}
                </div>
              )}

              {success && (
                <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
                  Password updated successfully! Redirecting...
                </div>
              )}

              <div className="pt-2">
                <Button 
                  type="submit" 
                  disabled={loading || !currentPassword || !newPassword || !confirmPassword}
                  className="w-full sm:w-auto"
                >
                  {loading ? "Updating..." : "Update Password"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}