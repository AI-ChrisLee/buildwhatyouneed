import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia"
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = body
    
    // Allow either authenticated user or email-based payment
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const customerEmail = user?.email || email
    
    if (!customerEmail) {
      return NextResponse.json({ error: "Email required" }, { status: 400 })
    }

    // Create a payment intent for the subscription
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 9700, // $97.00 in cents
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        userId: user?.id || '',
        userEmail: customerEmail,
        priceId: process.env.STRIPE_PRICE_ID!,
      },
    })

    return NextResponse.json({ 
      clientSecret: paymentIntent.client_secret 
    })
  } catch (error: any) {
    console.error("Payment intent error:", error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}