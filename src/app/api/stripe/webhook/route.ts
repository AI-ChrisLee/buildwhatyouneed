import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: Request) {
  const body = await request.text()
  const signature = headers().get('stripe-signature')!

  let event: Stripe.Event

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  const supabase = createClient()

  try {
    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        if (session.mode === 'subscription') {
          // Get the user ID from client_reference_id
          const userId = session.client_reference_id
          
          if (!userId) {
            console.error('No user ID in session')
            break
          }

          // Create stripe customer record
          await supabase
            .from('stripe_customers')
            .insert({
              user_id: userId,
              stripe_customer_id: session.customer as string
            })
            .select()

          // Get the subscription
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          )

          // Create subscription record
          await supabase
            .from('stripe_subscriptions')
            .insert({
              id: subscription.id,
              user_id: userId,
              status: subscription.status,
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
            })
            .select()

          console.log(`Subscription created for user ${userId}`)
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        
        // Update subscription status
        await supabase
          .from('stripe_subscriptions')
          .update({
            status: subscription.status,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
          })
          .eq('id', subscription.id)

        console.log(`Subscription ${subscription.id} updated to ${subscription.status}`)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        
        // Update subscription status to canceled
        await supabase
          .from('stripe_subscriptions')
          .update({
            status: 'canceled'
          })
          .eq('id', subscription.id)

        console.log(`Subscription ${subscription.id} canceled`)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}