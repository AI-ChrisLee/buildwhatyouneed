"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { loadStripe } from "@stripe/stripe-js"
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js"

// Lazy load Stripe to improve initial page load
let stripePromise: Promise<any> | null = null
const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
  }
  return stripePromise
}

interface PaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: any
}

function PaymentForm({ user, onSuccess }: { user: any; onSuccess: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) return

    setLoading(true)
    setError("")

    try {
      // Create payment method
      const { error: methodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement)!,
        billing_details: {
          email: user.email,
        },
      })

      if (methodError) {
        setError(methodError.message || "Invalid card details")
        return
      }

      // Create subscription
      const response = await fetch("/api/stripe/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          paymentMethodId: paymentMethod?.id 
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create subscription")
      }

      const { clientSecret } = await response.json()

      // Confirm payment if needed
      if (clientSecret) {
        const { error: confirmError } = await stripe.confirmCardPayment(clientSecret)
        if (confirmError) {
          setError(confirmError.message || "Payment failed")
          return
        }
      }

      // Payment successful
      onSuccess()
      router.push("/?success=true")
    } catch (error: any) {
      setError(error.message || "Payment failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-3">Membership</h3>
        <div className="p-4 rounded-lg border bg-gray-50">
          <div className="flex justify-between items-center">
            <span className="font-medium">Monthly</span>
            <div className="text-right">
              <div className="font-semibold text-lg">$97/month</div>
              <div className="text-xs text-gray-500">Billed monthly</div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Payment method</label>
        <div className="p-3 border rounded-lg">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
              hidePostalCode: false,
            }}
          />
        </div>
        <a href="#" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
          Use an existing card
        </a>
      </div>

      {error && (
        <div className="text-sm text-red-600 text-center">
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={loading || !stripe}
        className="w-full"
        size="lg"
      >
        {loading ? "Processing..." : "JOIN $97/month"}
      </Button>

      <p className="text-xs text-gray-500 text-center">
        By joining, you accept Build What You Need's terms. You can cancel anytime.
      </p>
    </form>
  )
}

export default function PaymentModal({ open, onOpenChange, user }: PaymentModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" aria-describedby="payment-modal-description">
        <DialogHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-2xl font-bold">B</span>
            </div>
          </div>
          <DialogTitle className="text-xl font-semibold">Build What You Need</DialogTitle>
          <p id="payment-modal-description" className="sr-only">
            Payment form for Build What You Need membership
          </p>
        </DialogHeader>

        <Elements stripe={getStripe()}>
          <PaymentForm 
            user={user} 
            onSuccess={() => onOpenChange(false)} 
          />
        </Elements>
      </DialogContent>
    </Dialog>
  )
}