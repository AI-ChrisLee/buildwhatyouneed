import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { paymentMethodId } = await request.json()

    // Create or get customer
    let customer
    const customers = await stripe.customers.list({
      email: user.email!,
      limit: 1
    })

    if (customers.data.length > 0) {
      customer = customers.data[0]
    } else {
      customer = await stripe.customers.create({
        email: user.email!,
        metadata: {
          userId: user.id
        }
      })
    }

    // Create a payment intent for immediate payment
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 9700, // $97.00
      currency: 'usd',
      customer: customer.id,
      payment_method: paymentMethodId,
      confirm: true,
      metadata: {
        userId: user.id,
        userEmail: user.email!,
        type: 'subscription'
      },
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/threads?success=true`
    })

    // If payment succeeded, create subscription record
    if (paymentIntent.status === 'succeeded') {
      // Save customer to Supabase
      await supabase
        .from('stripe_customers')
        .upsert({
          user_id: user.id,
          stripe_customer_id: customer.id
        })

      // Create a mock subscription record
      const mockSubscriptionId = `sub_${Date.now()}_${user.id.substring(0, 8)}`
      
      await supabase
        .from('stripe_subscriptions')
        .upsert({
          id: mockSubscriptionId,
          user_id: user.id,
          status: 'active',
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
        })

      // Update user's membership tier to paid
      await supabase
        .from('users')
        .update({ 
          membership_tier: 'paid',
          tier_updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      // Update lead status
      await supabase
        .from('leads')
        .update({
          stage: 'member',
          member_at: new Date().toISOString()
        })
        .eq('email', user.email!)
    }

    return NextResponse.json({
      success: paymentIntent.status === 'succeeded',
      status: paymentIntent.status,
      clientSecret: paymentIntent.client_secret
    })
  } catch (error: any) {
    console.error("Payment error:", error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}