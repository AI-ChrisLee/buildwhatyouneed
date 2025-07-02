"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CheckoutPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the new payment page
    router.replace('/payment')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Redirecting to payment...</p>
    </div>
  )
}