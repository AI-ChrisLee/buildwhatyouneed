"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing')
  const supabase = createClient()

  useEffect(() => {
    checkPaymentStatus()
  }, [])

  async function checkPaymentStatus() {
    try {
      const sessionId = searchParams.get('session_id')
      
      if (!sessionId) {
        setStatus('error')
        return
      }

      // Give Stripe webhook some time to process
      await new Promise(resolve => setTimeout(resolve, 3000))

      // Check if user has active subscription
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      const { data: subscription } = await supabase
        .from('stripe_subscriptions')
        .select('status')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()

      if (subscription) {
        setStatus('success')
        setTimeout(() => {
          router.push('/threads')
        }, 2000)
      } else {
        // Subscription not yet active, wait a bit more
        setTimeout(() => {
          checkPaymentStatus()
        }, 2000)
      }
    } catch (error) {
      console.error('Payment status check error:', error)
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        {status === 'processing' && (
          <>
            <div className="text-4xl animate-spin">⏳</div>
            <h1 className="text-2xl font-bold">Processing your payment...</h1>
            <p className="text-muted-foreground">Please wait while we confirm your subscription.</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="text-4xl">✅</div>
            <h1 className="text-2xl font-bold">Payment successful!</h1>
            <p className="text-muted-foreground">Redirecting you to the community...</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="text-4xl">❌</div>
            <h1 className="text-2xl font-bold">Something went wrong</h1>
            <p className="text-muted-foreground">
              Please contact support if you were charged.
            </p>
            <a href="/payment" className="text-primary underline">
              Try again
            </a>
          </>
        )}
      </div>
    </div>
  )
}