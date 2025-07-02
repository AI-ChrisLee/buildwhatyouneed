"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Loader2, CheckCircle } from "lucide-react"

export default function PaymentSuccessPage() {
  const router = useRouter()
  const supabase = createClient()
  const [status, setStatus] = useState<'checking' | 'waiting' | 'success' | 'error'>('checking')
  const [message, setMessage] = useState("Processing your payment...")
  const [retryCount, setRetryCount] = useState(0)
  const maxRetries = 30 // 30 seconds total

  useEffect(() => {
    checkSubscriptionStatus()
  }, [retryCount])

  async function checkSubscriptionStatus() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      // Check if subscription exists
      const { data: subscription, error } = await supabase
        .from('stripe_subscriptions')
        .select('status')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle()

      if (error) {
        console.error('Error checking subscription:', error)
      }

      if (subscription) {
        setStatus('success')
        setMessage("Payment successful! Redirecting to community...")
        setTimeout(() => {
          router.push('/threads')
        }, 2000)
      } else if (retryCount < maxRetries) {
        setStatus('waiting')
        setMessage("Waiting for payment confirmation...")
        setTimeout(() => {
          setRetryCount(prev => prev + 1)
        }, 1000) // Check every second
      } else {
        setStatus('error')
        setMessage("Payment verification is taking longer than expected.")
      }
    } catch (error) {
      console.error('Subscription check error:', error)
      setStatus('error')
      setMessage("An error occurred while verifying your payment.")
    }
  }

  async function handleManualCheck() {
    setStatus('checking')
    setRetryCount(0)
    checkSubscriptionStatus()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center space-y-6">
          {status === 'checking' || status === 'waiting' ? (
            <>
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">{message}</h2>
                <p className="text-muted-foreground">
                  This usually takes just a few seconds...
                </p>
              </div>
            </>
          ) : status === 'success' ? (
            <>
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">{message}</h2>
                <p className="text-muted-foreground">
                  Welcome to the BWYN community!
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">{message}</h2>
                <p className="text-muted-foreground">
                  Your payment may still be processing. You can:
                </p>
                <div className="space-y-3">
                  <button
                    onClick={handleManualCheck}
                    className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                  >
                    Check Again
                  </button>
                  <button
                    onClick={() => router.push('/threads')}
                    className="w-full px-4 py-2 border rounded-md hover:bg-gray-50"
                  >
                    Try Accessing Community
                  </button>
                  <p className="text-sm text-muted-foreground">
                    If you continue to have issues, please contact support.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}