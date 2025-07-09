import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia"
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { subscriptionId } = await request.json()

    if (!subscriptionId) {
      return NextResponse.json({ error: "Subscription ID required" }, { status: 400 })
    }

    // Verify the subscription belongs to this user
    const { data: subscription } = await supabase
      .from("stripe_subscriptions")
      .select("*")
      .eq("stripe_subscription_id", subscriptionId)
      .eq("user_id", user.id)
      .single()

    if (!subscription) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 })
    }

    // Cancel the subscription at period end
    const stripeSubscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true
    })

    // Update the subscription in our database
    await supabase
      .from("stripe_subscriptions")
      .update({
        cancel_at_period_end: true,
        updated_at: new Date().toISOString()
      })
      .eq("stripe_subscription_id", subscriptionId)

    return NextResponse.json({ 
      success: true,
      message: "Subscription will be cancelled at the end of the billing period"
    })
  } catch (error: any) {
    console.error("Error cancelling subscription:", error)
    return NextResponse.json(
      { error: error.message || "Failed to cancel subscription" },
      { status: 500 }
    )
  }
}