"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AuthLeftSection } from "@/components/auth-left-section"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Lock, CreditCard } from "lucide-react"

export default function PaymentPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [loading, setLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [userEmail, setUserEmail] = useState("")
  const [formData, setFormData] = useState({
    cardNumber: "",
    expiry: "",
    cvc: "",
    name: ""
  })

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/signup')
        return
      }

      // Check if user already has active subscription
      const { data: subscription } = await supabase
        .from('stripe_subscriptions')
        .select('status')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()

      if (subscription) {
        router.push('/threads')
        return
      }

      setUserEmail(user.email || '')
    } catch (error) {
      console.error('Auth check error:', error)
    } finally {
      setCheckingAuth(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/signup')
        return
      }

      // Create Stripe checkout session
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
        }),
      })

      const result = await response.json()

      if (response.ok && result.url) {
        // Redirect to Stripe checkout
        window.location.href = result.url
      } else {
        alert(result.error || 'Payment setup failed')
      }
    } catch (error) {
      alert('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="grid md:grid-cols-2">
            {/* Left Column - Video and Description */}
            <AuthLeftSection />

            {/* Right Column - Payment Form */}
            <div className="p-8 md:p-12 bg-gray-50">
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold">
                    Complete Your Membership
                  </h2>
                  <p className="text-muted-foreground">
                    Join the revolution and start building what Circle.so charges $419/mo for
                  </p>
                </div>

                <div className="bg-white p-6 rounded-lg border space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">BWYN Community Access</h3>
                      <p className="text-sm text-muted-foreground">Monthly membership</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">$97</p>
                      <p className="text-sm text-muted-foreground">/month</p>
                    </div>
                  </div>

                  <div className="border-t pt-4 space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span>Full community access</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span>All video courses</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span>Weekly office hours</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span>7-day money-back guarantee</span>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Logged in as: <span className="font-medium">{userEmail}</span>
                  </div>

                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full h-12 text-lg flex items-center justify-center gap-2" 
                    disabled={loading}
                  >
                    {loading ? (
                      "Processing..."
                    ) : (
                      <>
                        <Lock className="h-5 w-5" />
                        Complete Payment with Stripe
                      </>
                    )}
                  </Button>

                  <div className="text-center text-xs text-muted-foreground space-y-1">
                    <p>🔒 Secure payment processed by Stripe</p>
                    <p>Cancel anytime • 7-day money-back guarantee</p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}