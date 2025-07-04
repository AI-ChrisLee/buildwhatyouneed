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

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customer.id,
    })

    // Set as default payment method
    await stripe.customers.update(customer.id, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    })

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: process.env.STRIPE_PRICE_ID! }],
      expand: ['latest_invoice.payment_intent'],
    })

    // Save customer to Supabase
    const { error: customerError } = await supabase
      .from('stripe_customers')
      .upsert({
        user_id: user.id,
        stripe_customer_id: customer.id
      })

    if (customerError) {
      console.error('Failed to save customer:', customerError)
    }

    // Save subscription to Supabase
    const { error: subError } = await supabase
      .from('stripe_subscriptions')
      .upsert({
        id: subscription.id,
        user_id: user.id,
        status: subscription.status,
        current_period_end: (subscription as any).current_period_end ? new Date((subscription as any).current_period_end * 1000).toISOString() : null
      })

    if (subError) {
      console.error('Failed to save subscription:', subError)
    }

    // Update lead status to member - first check if lead exists
    const { data: leadData } = await supabase
      .from('leads')
      .select('*')
      .eq('email', user.email!)
      .single()

    if (leadData) {
      const { error: leadError } = await supabase
        .from('leads')
        .update({
          stage: 'member',
          member_at: new Date().toISOString()
        })
        .eq('email', user.email!)

      if (leadError) {
        console.error('Failed to update lead:', leadError)
      }
    } else {
      // Create lead if doesn't exist
      const { error: createLeadError } = await supabase
        .from('leads')
        .insert({
          email: user.email!,
          stage: 'member',
          member_at: new Date().toISOString(),
          user_id: user.id
        })

      if (createLeadError) {
        console.error('Failed to create lead:', createLeadError)
      }
    }

    return NextResponse.json({
      subscriptionId: subscription.id,
      clientSecret: (subscription.latest_invoice as any).payment_intent.client_secret
    })
  } catch (error: any) {
    console.error("Subscription error:", error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}