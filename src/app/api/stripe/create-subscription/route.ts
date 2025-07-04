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

    // First check if the price exists
    try {
      const price = await stripe.prices.retrieve(process.env.STRIPE_PRICE_ID!)
      console.log('Price found:', price.id, 'Active:', price.active)
    } catch (priceError) {
      console.error('Invalid price ID:', process.env.STRIPE_PRICE_ID)
      throw new Error('Invalid Stripe price configuration')
    }

    // Create subscription with automatic payment
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: process.env.STRIPE_PRICE_ID! }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        userId: user.id
      }
    })

    // Ensure we have the full subscription with expanded fields
    const fullSubscription = await stripe.subscriptions.retrieve(
      subscription.id,
      {
        expand: ['latest_invoice.payment_intent']
      }
    ) as any

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
        id: fullSubscription.id,
        user_id: user.id,
        status: fullSubscription.status,
        current_period_end: fullSubscription.current_period_end ? new Date(fullSubscription.current_period_end * 1000).toISOString() : null
      })

    if (subError) {
      console.error('Failed to save subscription:', subError)
    }

    // Update user's membership tier to paid
    const { error: tierError } = await supabase
      .from('users')
      .update({ 
        membership_tier: 'paid',
        tier_updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
    
    if (tierError) {
      console.error('Failed to update membership tier:', tierError)
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

    // Get the client secret from the payment intent
    console.log('Full subscription object:', JSON.stringify(fullSubscription, null, 2))
    
    const invoice = fullSubscription.latest_invoice as Stripe.Invoice
    
    // Check if invoice exists and has the payment intent
    if (!invoice) {
      console.error('No invoice found on subscription')
      throw new Error('No invoice found on subscription')
    }
    
    // If invoice is a string ID, we need to retrieve it
    if (typeof invoice === 'string') {
      console.error('Invoice is not expanded, got ID:', invoice)
      throw new Error('Invoice not properly expanded')
    }
    
    const paymentIntent = (invoice as any).payment_intent as Stripe.PaymentIntent
    
    // Check if payment intent exists
    if (!paymentIntent) {
      console.error('No payment intent on invoice:', {
        invoiceId: invoice.id,
        invoiceStatus: invoice.status
      })
      throw new Error('No payment intent found on invoice')
    }
    
    // If payment intent is a string ID, we need to retrieve it
    if (typeof paymentIntent === 'string') {
      console.error('Payment intent is not expanded, got ID:', paymentIntent)
      throw new Error('Payment intent not properly expanded')
    }
    
    const clientSecret = paymentIntent.client_secret

    if (!clientSecret) {
      console.error('No client secret found:', {
        subscriptionId: fullSubscription.id,
        invoiceId: invoice?.id,
        paymentIntentId: paymentIntent?.id,
        paymentIntentStatus: paymentIntent?.status,
        invoiceStatus: invoice?.status,
        subscriptionStatus: fullSubscription.status
      })
      throw new Error('Failed to get payment client secret')
    }

    // Update payment intent metadata to include user ID
    if (paymentIntent?.id) {
      await stripe.paymentIntents.update(paymentIntent.id, {
        metadata: {
          userId: user.id,
          userEmail: user.email!,
          subscriptionId: fullSubscription.id
        }
      })
    }

    console.log('Subscription created successfully:', {
      subscriptionId: fullSubscription.id,
      customerId: customer.id,
      status: fullSubscription.status,
      hasClientSecret: !!clientSecret
    })

    return NextResponse.json({
      subscriptionId: fullSubscription.id,
      clientSecret: clientSecret
    })
  } catch (error: any) {
    console.error("Subscription error:", error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}