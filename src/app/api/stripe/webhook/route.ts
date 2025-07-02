import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'

// Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
  console.error('Missing Stripe environment variables')
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

export async function POST(request: Request) {
  const body = await request.text()
  const signature = headers().get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    )
  }

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not configured')
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    )
  }

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
          const userId = session.client_reference_id
          if (!userId) {
            console.error('No user ID in session')
            break
          }

          // Create Stripe customer record
          await supabase
            .from('stripe_customers')
            .insert({
              user_id: userId,
              stripe_customer_id: session.customer as string
            })
            .select()

          // Get the subscription
          const subscriptionId = session.subscription as string
          
          // Create subscription record with minimal data
          await supabase
            .from('stripe_subscriptions')
            .insert({
              id: subscriptionId,
              user_id: userId,
              status: 'active', // Checkout completed means active
              current_period_end: null // Will be updated by subscription.updated event
            })
            .select()

          console.log(`Subscription created for user ${userId}`)
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        
        // Update subscription status
        const updateData: any = {
          status: subscription.status
        }
        
        // Check if subscription has current_period_end
        if ('current_period_end' in subscription && subscription.current_period_end) {
          updateData.current_period_end = new Date((subscription as any).current_period_end * 1000).toISOString()
        }
        
        await supabase
          .from('stripe_subscriptions')
          .update(updateData)
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